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

// Projects Component
export const ProjectsCard = ({
  isHovered,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onClick,
  projects,
}) => {
  return (
    <BaseCard
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <CardHeader icon={<Folder />} title="Active Projects" />

      <Box display="flex" flexDirection="column" gap={2}>
        {projects.map((project, idx) => (
          <Box key={idx}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="body2" sx={{}}>
                {project.name}
              </Typography>
              <Typography variant="caption" sx={{ color: project.color }}>
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{
                backgroundColor: "rgba(215, 13, 13, 0.1)",
                "& .MuiLinearProgress-bar": { backgroundColor: project.color },
              }}
            />
          </Box>
        ))}
      </Box>

      <Collapse in={isExpanded}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" sx={{}}>
          Backend auditing is progressing well with security reviews completed.
          Unit testing framework is being implemented. AI automation project
          will begin next week with Selenium integration.
        </Typography>
      </Collapse>
    </BaseCard>
  );
};
