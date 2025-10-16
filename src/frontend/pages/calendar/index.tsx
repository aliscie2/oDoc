// Main Calendar Component
import { backendActor } from "@/utils/backendUtils";
import { Alert, Box, useTheme } from "@mui/material";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import React, { useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import "./calendar.css";
import EventDialog from "./components/EventDialog";
import Toolbar from "./components/Toolbar";
import { useCalendar } from "./hooks";
import { useFreeBusy } from "./hooks/useFreeBusy";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// CalendarView.tsx - Updated component
// CalendarView.tsx - For user's own calendar
const CalendarView = () => {
  console.log("Normal");
  const dispatch = useDispatch();
  const theme = useTheme();
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { profile } = useSelector((state: any) => state.filesState);

  const { blockedEvents, isLoadingBusy, busyError } = useFreeBusy();

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

  useEffect(() => {
    const loadCalendar = async () => {
      if (!backendActor) return;

      try {
        const res = await backendActor.get_my_calendar();
        dispatch({ type: "SET_CALENDAR", calendar: res });
      } catch (error) {
        console.error("❌ Error loading calendar:", error);
      }
    };

    loadCalendar();
  }, [dispatch]);

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
        height: "100vh",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title>My Calendar</title>
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

export default CalendarView;
