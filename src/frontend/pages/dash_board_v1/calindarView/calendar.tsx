// CalendarView.js - UI Component
import React, { useEffect } from "react";
import { Box } from "@mui/material";
import format from "date-fns/format";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventDialog from "./eventDialog";
import CustomToolbar from "./toolsBar";
import useCalendarStyles from "./style";
import { useCalendarLogic } from "./calendarLogic";
import { useBackendContext } from "@/contexts/BackendContext";
import { useDispatch } from "react-redux";
import { useGoogleCalendar } from "./googleAccounts/useGoogleCalendar";

const CalendarView = () => {
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  const { connectCal } = useGoogleCalendar();

  useEffect(() => {
    const fetchCal = async () => {
      const idValue = new URLSearchParams(window.location.search).get("id");
      const res = await backendActor.get_calendar(idValue);
      dispatch({
        type: "SET_CALENDAR",
        calendar: res[0],
      });
      await connectCal();
    };
    const isShareCalendarPage =
      window.location.pathname === "/calendar" &&
      window.location.search.includes("id=");
    if (backendActor && isShareCalendarPage) {
      fetchCal();
    }
  }, []);

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
    handleSelectSlot,
    handleSelectEvent,
    eventStyleGetter,
    handleCloseDialog,
    setCurrentDate,
    setCurrentView,
    getSlotStatus,
    getReadOnlyStatus,
    availabilityRange,
  } = useCalendarLogic();

  const locales = { "en-US": enUS };
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  // Mobile-specific time configuration
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

  const TimeSlotWrapper = ({ children, value }) => {
    if (!children || !React.isValidElement(children)) {
      return children;
    }

    const child = React.Children.only(children);
    const status = getSlotStatus(value);

    let className = child.props?.className || "";
    let title = "";

    // Mobile tap handler - fixed implementation
    const handleMobileTap = (e) => {
      if (isMobile && status === "available") {
        e.preventDefault();
        e.stopPropagation();

        const slotInfo = {
          start: value,
          end: new Date(value.getTime() + 30 * 60 * 1000), // 30 minutes slot
          action: "select",
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

    // Enhanced mobile event props
    const mobileProps = isMobile
      ? {
          onClick: handleMobileTap,
          onTouchStart: (e) => {
            // Prevent default touch behavior
            if (status === "available") {
              e.currentTarget.style.backgroundColor = isDark
                ? "rgba(76, 175, 80, 0.3)"
                : "rgba(76, 175, 80, 0.2)";
            }
          },
          onTouchEnd: handleMobileTap,
          onTouchCancel: (e) => {
            // Reset background on touch cancel
            if (status === "available") {
              e.currentTarget.style.backgroundColor = "";
            }
          },
          style: {
            ...child.props.style,
            touchAction: status === "available" ? "manipulation" : "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTapHighlightColor: "transparent",
          },
        }
      : {};

    return React.cloneElement(child, {
      ...child.props,
      className: className.trim(),
      title: title,
      ...mobileProps,
    });
  };

  // Show only day view on mobile, keep other views for desktop/tablet
  const views = isMobile ? ["day"] : ["month", "week", "day"];
  const defaultView = isMobile ? "day" : currentView;

  const components = {
    toolbar: CustomToolbar,
    timeSlotWrapper: TimeSlotWrapper,
  };

  const mobileTimeConfig = getMobileTimeConfig();

  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "inherit",
        color: "inherit",
        ...useCalendarStyles(isDark, isMobile),
      }}
    >
      <Calendar
        style={{
          flex: 1,
          backgroundColor: "inherit",
          color: "inherit",
        }}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onNavigate={setCurrentDate}
        date={currentDate}
        eventPropGetter={eventStyleGetter}
        components={components}
        selectable={true} // Enable selection for both mobile and desktop
        popup={false}
        views={views}
        defaultView={defaultView}
        view={isMobile ? "day" : currentView}
        onView={isMobile ? () => {} : setCurrentView}
        toolbar={true}
        step={30}
        timeslots={2}
        showMultiDayTimes
        getNow={() => new Date()}
        dayLayoutAlgorithm="no-overlap"
        onSelectSlot={handleSelectSlot} // Enable for both mobile and desktop
        onSelectEvent={handleSelectEvent}
        {...(isMobile ? mobileTimeConfig : timeSpans)}
        scrollToTime={
          isMobile && mobileTimeConfig.min ? mobileTimeConfig.min : undefined
        }
      />

      <EventDialog
        open={showEventDialog}
        onClose={handleCloseDialog}
        slotInfo={selectedSlot}
        selectedEvent={selectedEvent}
        readOnly={getReadOnlyStatus()}
      />
    </Box>
  );
};

export default CalendarView;
