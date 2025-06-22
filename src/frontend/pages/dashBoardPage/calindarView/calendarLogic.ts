// useCalendarLogic.js - Custom Hook for Calendar Logic
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useMediaQuery, useTheme } from "@mui/material";
import { microsecondsToDate } from "./serializers";

export const useCalendarLogic = () => {
  const { calendar, google_events } = useSelector(
    (state) => state.calendarState,
  );
  const { profile } = useSelector((state) => state.filesState);
  const theme = useTheme();

  const availabilities = calendar?.availabilities || [];
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem("calendarView") || "month";
  });
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Persist view selection
  useEffect(() => {
    localStorage.setItem("calendarView", currentView);
  }, [currentView]);

  // Process events with colors
  const events = useMemo(() => {
    const allEvents = [...(calendar?.events || []), ...(google_events || [])];
    const colors = [
      "#FF2D55",
      "#5856D6",
      "#007AFF",
      "#5AC8FA",
      "#4CD964",
      "#FF9500",
    ];

    return allEvents.map((event, index) => ({
      ...event,
      start: microsecondsToDate(event.start_time),
      end: microsecondsToDate(event.end_time),
      color: event.isGoogleEvent ? "#4285F4" : colors[index % colors.length],
    }));
  }, [calendar, google_events]);

  // Helper functions
  const isWithinWeeklySchedule = (date, availability) => {
    if (availability.schedule_type.WeeklyRecurring) {
      const dayOfWeek = date.getDay();
      const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      return availability.schedule_type.WeeklyRecurring.days.includes(
        adjustedDay,
      );
    }
    return false;
  };

  const isWithinTimeSlot = (date, timeSlot) => {
    let slotStart = new Date(Number(timeSlot.start_time) / 1000000);
    let slotEnd = new Date(Number(timeSlot.end_time) / 1000000);

    if (slotStart > slotEnd) {
      const temp = slotStart;
      slotStart = slotEnd;
      slotEnd = temp;
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

  const checkSlotAvailability = (slotStart) => {
    const isBlocked = availabilities.some((availability) => {
      const isCorrectDay = isWithinWeeklySchedule(slotStart, availability);
      const isInTimeSlot = availability.time_slots.some((slot) =>
        isWithinTimeSlot(slotStart, slot),
      );
      return isCorrectDay && isInTimeSlot && availability.is_blocked;
    });

    const isAvailable = availabilities.some((availability) => {
      const isCorrectDay = isWithinWeeklySchedule(slotStart, availability);
      const isInTimeSlot = availability.time_slots.some((slot) =>
        isWithinTimeSlot(slotStart, slot),
      );
      return isCorrectDay && isInTimeSlot && !availability.is_blocked;
    });

    return { isBlocked, isAvailable };
  };

  const getSlotStatus = (value) => {
    const isPastTimeSlot = value < new Date();
    if (isPastTimeSlot) return "past";

    let foundStatus = "none";

    for (const availability of availabilities) {
      const isCorrectDay = isWithinWeeklySchedule(value, availability);
      const isInTimeSlot = availability.time_slots.some((slot) =>
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

  // Calculate time spans
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
      availability.time_slots.forEach((slot) => {
        let slotStart = new Date(Number(slot.start_time) / 1000000);
        let slotEnd = new Date(Number(slot.end_time) / 1000000);

        if (slotStart > slotEnd) {
          const temp = slotStart;
          slotStart = slotEnd;
          slotEnd = temp;
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

  // Event handlers
  const handleSelectSlot = useCallback(
    (slotInfo) => {
      if (slotInfo.action === "click" && calendar?.view === "month") {
        setCurrentDate(slotInfo.start);
        return;
      }

      if (slotInfo.start < new Date()) {
        return;
      }

      if (profile?.id !== calendar?.owner) {
        const { isBlocked, isAvailable } = checkSlotAvailability(
          slotInfo.start,
        );
        if (isBlocked || !isAvailable) {
          return;
        }
      }

      setSelectedSlot({
        ...slotInfo,
        created_by: profile?.id,
      });
      setSelectedEvent(null);
      setShowEventDialog(true);
    },
    [calendar?.view, profile?.id, calendar?.owner, availabilities],
  );

  const handleSelectEvent = useCallback(
    (event) => {
      setSelectedEvent(event);
      setSelectedSlot({
        start: event.start,
        end: event.end,
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
    (event) => {
      const isCreator = profile?.id === event?.created_by;
      return {
        style: {
          backgroundColor: isCreator ? event.color : "#9e9e9e",
          opacity: 0.9,
          color: isCreator ? "inherit" : "transparent",
        },
      };
    },
    [profile],
  );

  const handleCloseDialog = useCallback(() => {
    setShowEventDialog(false);
    setSelectedSlot(null);
    setSelectedEvent(null);
  }, []);

  const getReadOnlyStatus = () => {
    return selectedEvent
      ? calendar.owner !== profile.id && selectedEvent.created_by !== profile.id
      : calendar.owner !== profile?.id;
  };

  return {
    // State
    currentDate,
    currentView,
    showEventDialog,
    selectedSlot,
    selectedEvent,

    // Data
    events,
    availabilities,
    profile,
    calendar,

    // UI State
    isDark,
    isMobile,

    // Computed values
    timeSpans,

    // Event handlers
    handleSelectSlot,
    handleSelectEvent,
    eventStyleGetter,
    handleCloseDialog,
    setCurrentDate,
    setCurrentView,

    // Helper functions
    getSlotStatus,
    getReadOnlyStatus,
  };
};
