import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  TextField,
  Button,
  Avatar,
  Divider,
  Collapse,
  Fade,
  Dialog,
  DialogContent,
  DialogTitle,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  Search,
  Event,
  Folder,
  Warning,
  Chat,
  Send,
  Refresh,
  Undo,
  Redo,
  Person,
  Close,
  Email,
  Schedule,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { BaseCard, CardHeader } from "./card";
import CalendarView from "../dashBoardPage/calindarView/calendar";
import Scheduler from "../dashBoardPage/calindarView";

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

  // Get the nearest 3 upcoming events
  const getUpcomingEvents = () => {
    if (!calendar?.events) return [];

    const now = new Date();
    const upcomingEvents = calendar.events
      .filter((event) => new Date(event.start_time) > now)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
      .slice(0, 3);

    return upcomingEvents;
  };

  const upcomingEvents = getUpcomingEvents();
  const hasMoreEvents = calendar?.events?.length > 3;

  // Format date and time for display
  const formatEventTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
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
          label={`${upcomingEvents.length} Upcoming Events`}
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

      {/* Full Calendar Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: "90vh",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h6">Calendar View</Typography>
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              color: "grey.500",
              "&:hover": { color: "grey.700" },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: "hidden" }}>
          <Box sx={{ height: "100%", p: 2 }}>
            <Scheduler />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
