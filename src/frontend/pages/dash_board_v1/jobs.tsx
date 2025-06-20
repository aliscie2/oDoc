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

// Job Matches Component
export const JobMatchesCard = ({
  isHovered,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
  onClick,
  isVisible,
  matches,
}) => {
  return (
    <BaseCard
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      isVisible={isVisible}
    >
      <CardHeader icon={<Search />} title="Job Matches" color="#00d4ff" />

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Chip
          label="7 Matches"

        />
        <Chip
          label="2 Reviewed"

        />
      </Box>

      <Collapse in={isHovered || isExpanded}>
        <Box mt={2}>
          <Typography
            variant="body2"
            sx={{  mb: 1 }}
          >
            Recent Matches:
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {matches.map((match, idx) => (
              <Box key={idx} display="flex" alignItems="center">
                <Avatar
                  sx={{ width: 24, height: 24, mr: 1, bgcolor: match.color }}
                >
                  <Person fontSize="small" />
                </Avatar>
                <Typography variant="body2" sx={{  }}>
                  {match.name} - {match.rate}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Collapse>

      <Collapse in={isExpanded}>
        <Divider sx={{ my: 2,  }} />
        <Typography variant="body2" >
          All 7 matches are highly qualified candidates with 5+ years experience
          in React, Node.js, and TypeScript. Average rate: $78/hr. 2 candidates
          have been reviewed and shortlisted.
        </Typography>
      </Collapse>
    </BaseCard>
  );
};
