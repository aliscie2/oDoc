// Main calendar logic hook
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useTheme, useMediaQuery } from "@mui/material";
import { microsecondsToDate, getEventColors, getEventStyle } from "../utils";
import type { Event, SlotInfo, SlotStatus } from "../types";

export const useCalendar = (freeBusyEvents: Event[] = []) => {
  const { calendar, google_events, owner_google_events } = useSelector(
    (state: any) => state.calendarState,
  );
  const { profile } = useSelector((state: any) => state.filesState);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const availabilities = calendar?.availabilities || [];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem("calendarView") || "month";
  });
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    localStorage.setItem("calendarView", currentView);
  }, [currentView]);

  const events = useMemo(() => {
    const backendEvents = calendar?.events || [];
    const googleEvents = google_events || [];
    const busyEvents = freeBusyEvents || [];
    const ownerGoogleEvents = owner_google_events || [];
    const allEvents = [
      ...backendEvents,
      ...googleEvents,
      ...busyEvents,
      ...ownerGoogleEvents,
    ];
    const colors = getEventColors(isDark);

    return allEvents.map((event: Event, index: number) => ({
      ...event,
      start: microsecondsToDate(event.start_time),
      end: microsecondsToDate(event.end_time),
      color: event.isGoogleEvent
        ? isDark
          ? "#4285F4"
          : "#1a73e8"
        : (event as any).isFreeBusyBlock || (event as any).isOwnerGoogleEvent
          ? isDark
            ? "rgba(148, 163, 184, 0.25)"
            : "rgba(148, 163, 184, 0.35)"
          : colors[index % colors.length],
    }));
  }, [
    calendar,
    google_events,
    freeBusyEvents,
    owner_google_events,
    isDark,
    profile,
  ]);

  const isWithinWeeklySchedule = (date: Date, availability: any) => {
    if (availability.schedule_type.WeeklyRecurring) {
      const dayOfWeek = date.getDay();
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      return availability.schedule_type.WeeklyRecurring.days.includes(
        adjustedDay,
      );
    }
    return false;
  };

  const isWithinTimeSlot = (date: Date, timeSlot: any) => {
    let slotStart = new Date(Number(timeSlot.start_time) / 1000000);
    let slotEnd = new Date(Number(timeSlot.end_time) / 1000000);

    if (slotStart > slotEnd) {
      [slotStart, slotEnd] = [slotEnd, slotStart];
    }

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const currentTime = new Date(0, 0, 0, hours, minutes, 0);

    return (
      currentTime >=
        new Date(0, 0, 0, slotStart.getHours(), slotStart.getMinutes(), 0) &&
      currentTime <
        new Date(0, 0, 0, slotEnd.getHours(), slotEnd.getMinutes(), 0)
    );
  };

  const getSlotStatus = (value: Date): SlotStatus => {
    const isPastTimeSlot = value < new Date();
    if (isPastTimeSlot) return "past";

    let foundStatus: SlotStatus = "none";

    for (const availability of availabilities) {
      const isCorrectDay = isWithinWeeklySchedule(value, availability);
      const isInTimeSlot = availability.time_slots.some((slot: any) =>
        isWithinTimeSlot(value, slot),
      );

      if (isCorrectDay && isInTimeSlot) {
        if (availability.is_blocked) {
          return "blocked";
        } else {
          foundStatus = "available";
        }
      }
    }

    return foundStatus;
  };

  const timeSpans = useMemo(() => {
    if (profile?.id === calendar?.owner) {
      const today = new Date();
      const minTime = new Date(today);
      minTime.setHours(1, 0, 0, 0);
      const maxTime = new Date(today);
      maxTime.setHours(23, 59, 0, 0);
      return { min: minTime, max: maxTime };
    }

    let earliestStart, latestEnd;
    for (const availability of availabilities) {
      availability.time_slots.forEach((slot: any) => {
        let slotStart = new Date(Number(slot.start_time) / 1000000);
        let slotEnd = new Date(Number(slot.end_time) / 1000000);

        if (slotStart > slotEnd) {
          [slotStart, slotEnd] = [slotEnd, slotStart];
        }

        if (!earliestStart) {
          earliestStart = slotStart;
          latestEnd = slotEnd;
        } else {
          earliestStart = slotStart < earliestStart ? slotStart : earliestStart;
          latestEnd = slotStart > latestEnd ? slotStart : latestEnd;
        }
      });
    }

    return { min: earliestStart, max: latestEnd };
  }, [profile?.id, calendar?.owner, availabilities]);

  const handleSelectSlot = useCallback(
    (slotInfo: any) => {
      if (slotInfo.action === "click" && currentView === "month") {
        setCurrentDate(slotInfo.start);
        return;
      }

      setSelectedSlot({
        ...slotInfo,
        created_by: profile?.id,
      });
      setSelectedEvent(null);
      setShowEventDialog(true);
    },
    [currentView, profile],
  );

  const handleSelectEvent = useCallback(
    (event: Event) => {
      // Don't allow interaction with owner's Google Calendar blocked slots
      if ((event as any).isOwnerGoogleEvent || (event as any).isFreeBusyBlock) {
        return;
      }

      setSelectedEvent(event);
      setSelectedSlot({
        start: event.start as any,
        end: event.end as any,
        created_by: event.created_by,
      });

      const isCreator =
        calendar?.owner === profile?.id || profile?.id === event?.created_by;
      if (isCreator) {
        setShowEventDialog(true);
      }
    },
    [calendar, profile],
  );

  const eventStyleGetter = useCallback(
    (event: Event) => getEventStyle(event, profile, calendar, isDark),
    [profile, calendar, isDark],
  );

  const handleCloseDialog = useCallback(() => {
    setShowEventDialog(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  }, []);

  const getReadOnlyStatus = () => {
    const isSharedCalendarPage =
      window.location.pathname === "/calendar" &&
      window.location.search.includes("id=");

    if (selectedEvent) {
      const isUserCreated = profile?.id === selectedEvent.created_by;
      const isUserGoogleEvent =
        selectedEvent.isGoogleEvent &&
        calendar?.google_ids?.includes(selectedEvent.created_by);
      const isOwner = calendar?.owner === profile?.id;

      if (isSharedCalendarPage) {
        return !(isUserCreated || isUserGoogleEvent || isOwner);
      }

      return !(isOwner || isUserCreated || isUserGoogleEvent);
    }

    return false;
  };

  const availabilityRange = useMemo(() => {
    if (availabilities.length === 0) return null;

    let earliestHour = 24;
    let latestHour = 0;

    availabilities.forEach((availability: unknown) => {
      availability.time_slots.forEach((slot: unknown) => {
        const startTime = new Date(Number(slot.start_time) / 1000000);
        const endTime = new Date(Number(slot.end_time) / 1000000);

        earliestHour = Math.min(earliestHour, startTime.getHours());
        latestHour = Math.max(latestHour, endTime.getHours());
      });
    });

    return earliestHour < 24 ? `${earliestHour}:00-${latestHour}:00` : null;
  }, [availabilities]);

  return {
    currentDate,
    currentView,
    showEventDialog,
    selectedSlot,
    selectedEvent,
    events,
    availabilities,
    profile,
    calendar,
    isDark,
    isMobile,
    timeSpans,
    availabilityRange,
    handleSelectSlot,
    handleSelectEvent,
    eventStyleGetter,
    handleCloseDialog,
    setCurrentDate,
    setCurrentView,
    getSlotStatus,
    getReadOnlyStatus,
  };
};
