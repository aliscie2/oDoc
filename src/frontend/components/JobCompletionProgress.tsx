import React from "react";
import { Job } from "$/declarations/backend/backend.did";
import {
  Box,
  LinearProgress,
  Typography,
  useTheme,
  Tooltip,
} from "@mui/material";
import MarkdownMessage from "../pages/dash_board_v1/markDownMessageRdnder";

interface JobCompletionProgressProps {
  job: Job | null;
  className?: string;
}

const JobCompletionProgress: React.FC<JobCompletionProgressProps> = ({
  job,
  className,
}) => {
  const theme = useTheme();

  if (!job) return null;

  // Use the profile_completion from the backend (0.0 to 1.0)
  const percentage = (job.profile_completion || 0) * 100;
  const feedback = job.feedback || "";

  const getProgressColor = () => {
    if (percentage >= 80) return theme.palette.success.main;
    if (percentage >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Handle inactive job state
  if (!job.active) {
    return (
      <Box className={className}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1,
            opacity: 0.6,
            filter: "grayscale(0.8)",
          }}
        >
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ minWidth: "fit-content" }}
          >
            Profile Inactive
          </Typography>
          <Box
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.palette.grey[300],
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `repeating-linear-gradient(
               45deg,
               ${theme.palette.grey[400]},
               ${theme.palette.grey[400]} 4px,
               transparent 4px,
               transparent 8px
             )`,
                animation: "slide 2s linear infinite",
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.disabled,
              fontWeight: 500,
              minWidth: "fit-content",
            }}
          >
            Paused
          </Typography>
          <style>
            {`
             @keyframes slide {
               0% { transform: translateX(-12px); }
               100% { transform: translateX(0px); }
             }
           `}
          </style>
        </Box>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ mt: 1, fontSize: "0.75rem" }}
        >
          This job is currently inactive and not visible to candidates
        </Typography>
      </Box>
    );
  }

  const progressContent = (
    <Box className={className}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{ minWidth: "fit-content" }}
        >
          Profile Completion
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.palette.grey[200],
            "& .MuiLinearProgress-bar": {
              backgroundColor: getProgressColor(),
              borderRadius: 3,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: getProgressColor(),
            fontWeight: 500,
            minWidth: "fit-content",
          }}
        >
          {Math.round(percentage)}%
        </Typography>
      </Box>
    </Box>
  );

  if (feedback) {
    return (
      <Tooltip
        title={
          <MarkdownMessage
            message={feedback || "No feedback."}
            isUser={false}
          />
        }
        arrow
        placement="top"
      >
        {progressContent}
      </Tooltip>
    );
  }

  return progressContent;
};

export default JobCompletionProgress;
