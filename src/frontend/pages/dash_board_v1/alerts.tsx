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

// Alerts Component
export const AlertsCard = ({
  isHovered,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onClick,
  alerts,
}) => {
  return (
    <BaseCard
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <CardHeader icon={<Warning />} title="Alerts" color="#f44336" />

      <Chip
        label="1 Dispute"
        sx={{ backgroundColor: "rgba(244,67,54,0.2)", color: "#f44336", mb: 2 }}
      />

      <Collapse in={isHovered || isExpanded}>
        {alerts.map((alert, idx) => (
          <Box key={idx}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500 }}
            >
              {alert.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.6)" }}
            >
              {alert.description}
            </Typography>
          </Box>
        ))}
      </Collapse>

      <Collapse in={isExpanded}>
        <Divider sx={{ my: 2,  }} />
        <Typography variant="body2" >
          Client has disputed the third milestone payment citing incomplete
          deliverables. Resolution required within 7 days. Documentation and
          evidence have been submitted.
        </Typography>
      </Collapse>
    </BaseCard>
  );
};
