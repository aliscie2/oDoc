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
} from "@mui/icons-material";
import { BaseCard, CardHeader } from "./card";

// Calendar/Events Component
export const CalendarCard = ({
  isHovered,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onClick,
  events,
}) => {
  return (
    <BaseCard
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <CardHeader icon={<Event />} title="This Week's Events" color="#ff9800" />

      <Chip
        label="3 Events"
        sx={{ backgroundColor: "rgba(255,152,0,0.2)", color: "#ff9800", mb: 2 }}
      />

      <Collapse in={isHovered || isExpanded}>
        <Box display="flex" flexDirection="column" gap={2}>
          {events.map((event, idx) => (
            <Box key={idx}>
              <Typography
                variant="body2"
                sx={{ color: "white", fontWeight: 500 }}
              >
                {event.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                {event.time}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>

      <Collapse in={isExpanded}>
        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }} />
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
          All events are scheduled with calendar reminders. Client meeting
          includes project status review and next milestone planning.
        </Typography>
      </Collapse>
    </BaseCard>
  );
};
