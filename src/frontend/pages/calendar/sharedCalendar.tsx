import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import { backendActor } from "@/utils/backendUtils";
import { useTheme } from "@emotion/react";
import { Alert, Box, Typography, useMediaQuery } from "@mui/material";
import React, { useEffect } from "react";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";

import EventDialog from "./components/EventDialog";
import { useCalendar, useFreeBusy } from "./hooks";

// Main Calendar Component
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

import "react-big-calendar/lib/css/react-big-calendar.css";

import "./calendar.css";
import Toolbar from "./components/Toolbar";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// ShareCalendarView.tsx - For viewing shared calendars
const ShareCalendarView = () => {
  console.log("[ShareCalendarView] Rendering ShareCalendarView");
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { calendar, sharedCalendar } = useSelector(
    (state: any) => state.calendarState,
  );
  const { profile } = useSelector((state: any) => state.filesState);

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const { blockedEvents, busyError } = useFreeBusy();

  const {
    currentDate,
    currentView,
    showEventDialog,
    selectedSlot,
    selectedEvent,
    events,
    isDark,
    timeSpans,
    availabilityRange,
    handleSelectSlot,
    handleSelectEvent,
    eventStyleGetter,
    handleCloseDialog,
    setCurrentDate,
    setCurrentView,
    getSlotStatus,
  } = useCalendar(blockedEvents);

  useEffect(() => {
    const loadSharedCalendar = async () => {
      if (!backendActor || !id) return;

      try {
        console.log("[ShareCalendar] Loading calendar:", { id });
        const res = await backendActor.get_calendar(id);
        console.log("[ShareCalendar] Calendar loaded:", res[0]);
        dispatch({ type: "SET_SHARED_CALENDAR", sharedCalendar: res[0] });
      } catch (error) {
        console.error("[ShareCalendar] Error loading shared calendar:", error);
      }
    };

    loadSharedCalendar();

    return () => {
      dispatch({ type: "CLEAR_SHARED_CALENDAR" });
    };
  }, [id, backendActor, dispatch]);

  useEffect(() => {
    if (sharedCalendar?.google_public_urls?.length > 0) {
      const ownerICalUrl = sharedCalendar.google_public_urls[0];
      const CORS_PROXY = "https://corsproxy.io/?";
      const PROXIED_URL = CORS_PROXY + encodeURIComponent(ownerICalUrl);

      fetch(PROXIED_URL)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.text();
        })
        .then((icalData) => {
          const events = parseICalEvents(icalData);
          const blockedSlots = events.map((event, index) => ({
            id: `owner_ical_${index}_${event.start.getTime()}`,
            title: "Busy",
            description: "",
            start_time: event.start.getTime() * 1000000,
            end_time: event.end.getTime() * 1000000,
            created_by: sharedCalendar.owner,
            attendees: [],
            isOwnerGoogleEvent: true,
            isFreeBusyBlock: true,
            recurrence: [],
          }));

          dispatch({ type: "SET_OWNER_GOOGLE_EVENTS", events: blockedSlots });
          console.log(
            `[ShareCalendar] Loaded ${blockedSlots.length} owner's events as blocked slots`,
          );
        })
        .catch((error) => {
          console.error(
            "[ShareCalendar] Failed to fetch owner's iCal:",
            error.message,
          );
        });
    }
  }, [sharedCalendar, dispatch]);

  const isViewingSharedCalendar =
    sharedCalendar && sharedCalendar.owner !== profile?.id;

  const TimeSlotWrapper = ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: Date;
  }) => {
    if (!children || !React.isValidElement(children)) return children;

    const child = React.Children.only(children);
    const status = getSlotStatus(value);

    let className = (child.props as any)?.className || "";
    let title = "";

    const handleMobileTap = (e: React.TouchEvent | React.MouseEvent) => {
      if (isMobile && status === "available") {
        e.preventDefault();
        e.stopPropagation();

        const slotInfo = {
          start: value,
          end: new Date(value.getTime() + 30 * 60 * 1000),
          action: "select" as const,
          slots: [value],
        };

        handleSelectSlot(slotInfo);
      }
    };

    switch (status) {
      case "blocked":
        className += " blocked-slot";
        title = "⛔ Blocked Time";
        break;
      case "available":
        className += " available-slot";
        title = isMobile ? "Tap to book" : "Click to book";
        break;
      case "past":
        className += " past-time-slot";
        title = "Past time";
        break;
    }

    const mobileProps = isMobile
      ? {
          onClick: handleMobileTap,
          onTouchStart: (e: React.TouchEvent) => {
            if (status === "available") {
              (e.currentTarget as HTMLElement).style.backgroundColor = isDark
                ? "rgba(76, 175, 80, 0.3)"
                : "rgba(76, 175, 80, 0.2)";
            }
          },
          onTouchEnd: handleMobileTap,
          onTouchCancel: (e: React.TouchEvent) => {
            if (status === "available") {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
            }
          },
          style: {
            ...(child.props as any).style,
            touchAction: status === "available" ? "manipulation" : "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "transparent",
          },
        }
      : {};

    return React.cloneElement(child, {
      ...(child.props as any),
      className: className.trim(),
      title,
      ...mobileProps,
    });
  };

  const views = isMobile ? ["day"] : ["month", "week", "day"];
  const defaultView = isMobile ? "day" : currentView;

  const components = {
    ...(isMobile ? {} : { toolbar: Toolbar }),
    timeSlotWrapper: TimeSlotWrapper,
  };

  const getMobileTimeConfig = () => {
    if (!isMobile || !availabilityRange) return timeSpans;

    const [startTime, endTime] = availabilityRange.split("-");
    const [startHour] = startTime.split(":").map(Number);
    const [endHour] = endTime.split(":").map(Number);

    return {
      min: new Date(2024, 0, 1, startHour, 0),
      max: new Date(2024, 0, 1, endHour, 0),
    };
  };

  const mobileTimeConfig = getMobileTimeConfig();

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)", // Account for top navbar
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        display: "flex",
        flexDirection: "column",
        "@media (max-width: 600px)": {
          minHeight: "calc(100vh - 56px)", // Mobile bottom nav height
        },
      }}
    >
      <Helmet>
        <title>
          {isViewingSharedCalendar ? "Shared Calendar" : "My Calendar"}
        </title>
      </Helmet>

      <Box
        sx={{
          p: 1.5,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // ADD THIS LINE
          gap: 1,
        }}
      >
        <UserAvatarMenu
          user_id={sharedCalendar?.owner}
          sx={{
            width: 40, // Make it bigger as you wanted
            height: 40,
            "& .MuiAvatar-root": {
              fontSize: "1rem", // Bigger font too
            },
          }}
        />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          📅 Viewing shared calendar
        </Typography>
      </Box>

      {busyError && (
        <Alert severity="warning" sx={{ m: 2 }}>
          {busyError}
        </Alert>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          p: { xs: 1, sm: 2, md: 3 },
          "& .rbc-calendar": {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 2,
            overflow: "hidden",
          },
          "& .rbc-header": {
            color: theme.palette.text.primary,
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.background.paper
                : theme.palette.background.default,
          },
          "& .rbc-time-gutter": {
            color: theme.palette.text.secondary,
          },
          "& .rbc-event": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
          "& .rbc-toolbar button": {
            color: theme.palette.text.primary,
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          },
        }}
      >
        <Calendar
          style={{ height: "100%" }}
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onNavigate={setCurrentDate}
          date={currentDate}
          eventPropGetter={eventStyleGetter}
          components={components}
          selectable={true}
          popup={false}
          views={views as any}
          defaultView={defaultView as any}
          view={isMobile ? "day" : (currentView as any)}
          onView={isMobile ? () => {} : setCurrentView}
          toolbar={!isMobile}
          step={30}
          timeslots={2}
          showMultiDayTimes
          getNow={() => new Date()}
          dayLayoutAlgorithm="no-overlap"
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          {...(isMobile ? mobileTimeConfig : timeSpans)}
          scrollToTime={
            isMobile && mobileTimeConfig.min ? mobileTimeConfig.min : undefined
          }
        />
      </Box>

      <EventDialog
        open={showEventDialog}
        onClose={handleCloseDialog}
        slotInfo={selectedSlot}
        selectedEvent={selectedEvent}
      />
    </Box>
  );
};

function parseICalEvents(icalData: string) {
  const events: Array<{
    title: string;
    start: Date;
    end: Date;
    description: string;
  }> = [];
  const lines = icalData.split("\n");
  let currentEvent: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === "BEGIN:VEVENT") {
      currentEvent = { title: "", description: "" };
    } else if (line === "END:VEVENT" && currentEvent) {
      if (currentEvent.start && currentEvent.end) events.push(currentEvent);
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith("SUMMARY:")) {
        currentEvent.title = line.substring(8);
      } else if (line.startsWith("DESCRIPTION:")) {
        currentEvent.description = line.substring(12);
      } else if (line.startsWith("DTSTART")) {
        currentEvent.start = parseICalDate(line.split(":")[1]);
      } else if (line.startsWith("DTEND")) {
        currentEvent.end = parseICalDate(line.split(":")[1]);
      }
    }
  }

  return events;
}

function parseICalDate(dateStr: string): Date {
  if (dateStr.includes("T")) {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    const hour = parseInt(dateStr.substring(9, 11));
    const minute = parseInt(dateStr.substring(11, 13));
    const second = parseInt(dateStr.substring(13, 15));
    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}
export default ShareCalendarView;
