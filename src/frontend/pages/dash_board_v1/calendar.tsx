import React, { useState } from "react";
import { Box, Typography, Chip, Divider, Collapse, Alert } from "@mui/material";
import { Event, Schedule, Email } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { BaseCard, CardHeader } from "./card";

import FullscreenDialog from "./FullscreenDialog"; // Import the shared dialog
import CalendarView from "./calindarView/calendar";
import CalendarFeedback from "./updateClaendarFeedback";
import { logger } from "@/DevUtils/logData";

// Calendar/Events Component
export const CalendarCard = ({
  isHovered,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get calendar data from Redux store
  const { calendar } = useSelector((state) => state.calendarState);

  // Fixed version of getUpcomingEvents function
  const getUpcomingEvents = () => {
    if (!calendar?.events) return [];

    const now = new Date();
    const upcomingEvents = calendar.events
      .filter((event) => {
        // Convert nanoseconds to milliseconds by dividing by 1,000,000
        const eventStartTime = new Date(event.start_time / 1000000);
        return eventStartTime > now;
      })
      .sort((a, b) => {
        // Convert nanoseconds to milliseconds for both dates
        const dateA = new Date(a.start_time / 1000000);
        const dateB = new Date(b.start_time / 1000000);
        return dateA - dateB;
      })
      .slice(0, 3);

    return upcomingEvents;
  };

  const upcomingEvents = getUpcomingEvents();
  const hasMoreEvents = calendar?.events?.length > 3;

  const getEventsThisWeek = () => {
    if (!calendar?.events) return 0;

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const eventsThisWeek = calendar.events.filter((event) => {
      const eventStartTime = new Date(event.start_time / 1000000);
      return eventStartTime > now && eventStartTime <= nextWeek;
    });

    return eventsThisWeek.length;
  };

  const formatEventTime = (startTime, endTime) => {
    // Convert nanoseconds to milliseconds
    const start = new Date(startTime / 1000000);
    const end = new Date(endTime / 1000000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = "";
    if (start.toDateString() === today.toDateString()) {
      dateStr = "Today";
    } else if (start.toDateString() === tomorrow.toDateString()) {
      dateStr = "Tomorrow";
    } else {
      dateStr = start.toLocaleDateString();
    }

    const timeStr = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    return `${dateStr}, ${timeStr}`;
  };
  const handleCardClick = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Check for alerts
  const showAvailabilityAlert = calendar?.availabilities?.length === 0;
  const showEmailAlert = calendar?.googleIds?.length === 0;

  return (
    <>
      <BaseCard
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleCardClick}
        sx={{ cursor: "pointer" }}
      >
        <CalendarFeedback />

        <CardHeader
          icon={<Event />}
          title="Calendar & Events"
          color="#ff9800"
        />

        {/* Alerts */}
        {showAvailabilityAlert && (
          <Alert
            severity="warning"
            icon={<Schedule />}
            sx={{ mb: 2, fontSize: "0.875rem" }}
          >
            Please set your availabilities so people can book events with you
          </Alert>
        )}

        {showEmailAlert && (
          <Alert
            severity="info"
            icon={<Email />}
            sx={{ mb: 2, fontSize: "0.875rem" }}
          >
            Please set an email so users can book events and alert you via email
          </Alert>
        )}

        <Chip
          label={`${getEventsThisWeek()} Events This Week`}
          sx={{
            backgroundColor: "rgba(255,152,0,0.2)",
            color: "#ff9800",
            mb: 2,
          }}
        />

        <Collapse in={isHovered || isExpanded}>
          <Box display="flex" flexDirection="column" gap={2}>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, idx) => (
                <Box key={idx}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {event.title || "Untitled Event"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatEventTime(event.start_time, event.end_time)}
                  </Typography>
                  {event.description && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {event.description.substring(0, 50)}
                      {event.description.length > 50 ? "..." : ""}
                    </Typography>
                  )}
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No upcoming events
              </Typography>
            )}

            {hasMoreEvents && (
              <Typography
                variant="caption"
                color="primary"
                sx={{ fontWeight: 500, cursor: "pointer" }}
              >
                ... and more
              </Typography>
            )}
          </Box>
        </Collapse>

        <Collapse in={isExpanded}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Click to view full calendar with all events and availability
            settings.
            {calendar?.events?.length > 0 &&
              ` Total events: ${calendar.events.length}`}
          </Typography>
        </Collapse>
      </BaseCard>

      {/* Use Shared Fullscreen Dialog */}
      <FullscreenDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title="Calendar & Events"
        showTitle={false} // Calendar doesn't show title, just close button
      >
        <CalendarView />
      </FullscreenDialog>
    </>
  );
};
