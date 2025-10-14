// Main Calendar Component
import React, { useEffect } from "react";
import { Box, Alert, useTheme } from "@mui/material";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "@/utils/backendUtils";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { useCalendar } from "./hooks";
import { useFreeBusy } from "./hooks/useFreeBusy";
import EventDialog from "./components/EventDialog";
import Toolbar from "./components/Toolbar";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { profile } = useSelector((state: any) => state.filesState);

  // FreeBusy integration for shared calendars
  const { blockedEvents, isLoadingBusy, busyError, fetchFreeBusy } =
    useFreeBusy();

  // Check if this is a shared calendar
  const isSharedCalendar = calendar && profile && calendar.owner !== profile.id;
  const ownerHasGoogle = calendar?.google_ids && calendar.google_ids.length > 0;

  const {
    currentDate,
    currentView,
    showEventDialog,
    selectedSlot,
    selectedEvent,
    events,
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
  } = useCalendar(blockedEvents);

  // Load calendar data on mount

  useEffect(() => {
    const loadCalendar = async () => {
      if (!backendActor) return;

      const urlParams = new URLSearchParams(window.location.search);
      const calendarId = urlParams.get("id");

      try {
        if (calendarId) {
          const res = await backendActor.get_calendar(calendarId);
          console.log("📥 LOADED SHARED CALENDAR:", {
            calendarId: res[0]?.id,
            owner: res[0]?.owner,
            eventsCount: res[0]?.events?.length || 0,
            googleIds: res[0]?.google_ids || [],
            events: res[0]?.events || [],
          });
          dispatch({ type: "SET_CALENDAR", calendar: res[0] });
        } else {
          const res = await backendActor.get_my_calendar();
          dispatch({ type: "SET_CALENDAR", calendar: res });
        }
      } catch (error) {
        console.error("❌ Error loading calendar:", error);
      }
    };

    loadCalendar();
  }, [dispatch, profile]);

  // Fetch owner's Google Calendar events from stored iCal URL
  useEffect(() => {
    if (isSharedCalendar && calendar?.google_public_urls?.length > 0) {
      const ownerICalUrl = calendar.google_public_urls[0];
      const CORS_PROXY = "https://corsproxy.io/?";
      const PROXIED_URL = CORS_PROXY + encodeURIComponent(ownerICalUrl);

      console.log(
        "🔍 Fetching owner's calendar from stored URL:",
        ownerICalUrl,
      );

      fetch(PROXIED_URL)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.text();
        })
        .then((icalData) => {
          console.log("✅ iCal data received, parsing events...");

          const events = parseICalEvents(icalData);

          // Filter for today and tomorrow
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const dayAfterTomorrow = new Date(tomorrow);
          dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

          const todayEvents = events.filter(
            (e) => e.start >= today && e.start < tomorrow,
          );

          const tomorrowEvents = events.filter(
            (e) => e.start >= tomorrow && e.start < dayAfterTomorrow,
          );

          console.log("\n" + "📅".repeat(40));
          console.log("📅 OWNER'S CALENDAR EVENTS");
          console.log("📅".repeat(40));
          console.log("📊 Total events in calendar:", events.length);
          console.log("-".repeat(80));

          console.log(
            `\n🌅 TODAY (${today.toLocaleDateString()}) - ${todayEvents.length} events:`,
          );
          if (todayEvents.length === 0) {
            console.log("   ❌ No events today");
          } else {
            todayEvents.forEach((event, i) => {
              console.log(`   ${i + 1}. "${event.title}"`);
              console.log(
                `      ⏰ ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}`,
              );
              if (event.description)
                console.log(`      📝 ${event.description}`);
            });
          }

          console.log(
            `\n🌄 TOMORROW (${tomorrow.toLocaleDateString()}) - ${tomorrowEvents.length} events:`,
          );
          if (tomorrowEvents.length === 0) {
            console.log("   ❌ No events tomorrow");
          } else {
            tomorrowEvents.forEach((event, i) => {
              console.log(`   ${i + 1}. "${event.title}"`);
              console.log(
                `      ⏰ ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}`,
              );
              if (event.description)
                console.log(`      📝 ${event.description}`);
            });
          }

          console.log("\n" + "📅".repeat(40) + "\n");

          // Convert to blocked slot format and dispatch to Redux
          const blockedSlots = events.map((event, index) => ({
            id: `owner_ical_${index}_${event.start.getTime()}`,
            title: "Busy",
            description: "",
            start_time: event.start.getTime() * 1000000,
            end_time: event.end.getTime() * 1000000,
            created_by: calendar.owner,
            attendees: [],
            isOwnerGoogleEvent: true,
            isFreeBusyBlock: true,
            recurrence: [],
          }));

          dispatch({
            type: "SET_OWNER_GOOGLE_EVENTS",
            events: blockedSlots,
          });

          console.log(
            `✅ Loaded ${blockedSlots.length} owner's events as blocked slots`,
          );
        })
        .catch((error) => {
          console.error("❌ Failed to fetch owner's iCal:", error.message);
        });
    } else if (!isSharedCalendar) {
      dispatch({ type: "SET_OWNER_GOOGLE_EVENTS", events: [] });
    }
  }, [isSharedCalendar, calendar, dispatch]);

  // Simple iCal parser function
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
        if (currentEvent.start && currentEvent.end) {
          events.push(currentEvent);
        }
        currentEvent = null;
      } else if (currentEvent) {
        if (line.startsWith("SUMMARY:")) {
          currentEvent.title = line.substring(8);
        } else if (line.startsWith("DESCRIPTION:")) {
          currentEvent.description = line.substring(12);
        } else if (line.startsWith("DTSTART")) {
          const dateStr = line.split(":")[1];
          currentEvent.start = parseICalDate(dateStr);
        } else if (line.startsWith("DTEND")) {
          const dateStr = line.split(":")[1];
          currentEvent.end = parseICalDate(dateStr);
        }
      }
    }

    return events;
  }

  function parseICalDate(dateStr: string): Date {
    // Format: 20231225T103000Z or 20231225
    if (dateStr.includes("T")) {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      const hour = parseInt(dateStr.substring(9, 11));
      const minute = parseInt(dateStr.substring(11, 13));
      const second = parseInt(dateStr.substring(13, 15));
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    } else {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      return new Date(year, month, day);
    }
  }

  const TimeSlotWrapper = ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: Date;
  }) => {
    if (!children || !React.isValidElement(children)) {
      return children;
    }

    const child = React.Children.only(children);
    const status = getSlotStatus(value);

    let className = (child.props as unknown)?.className || "";
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
      default:
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
            ...(child.props as unknown).style,
            touchAction: status === "available" ? "manipulation" : "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "transparent",
          },
        }
      : {};

    return React.cloneElement(child, {
      ...(child.props as unknown),
      className: className.trim(),
      title: title,
      ...mobileProps,
    });
  };

  const views = isMobile ? ["day"] : ["month", "week", "day"];
  const defaultView = isMobile ? "day" : currentView;

  const components = {
    toolbar: Toolbar,
    timeSlotWrapper: TimeSlotWrapper,
  };

  const getMobileTimeConfig = () => {
    if (!isMobile || !availabilityRange) {
      return timeSpans;
    }

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
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title>Calendar</title>
      </Helmet>

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
          style={{
            height: "100%",
          }}
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
          views={views as unknown}
          defaultView={defaultView as unknown}
          view={isMobile ? "day" : (currentView as unknown)}
          onView={isMobile ? () => {} : setCurrentView}
          toolbar={true}
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

export default CalendarView;
