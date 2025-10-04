import { Job } from "$/declarations/backend/backend.did";
import {
  Box,
  LinearProgress,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import MarkdownMessage from "../chatBot/markDownMessageRdnder";

interface JobCompletionProgressProps {
  job: Job | null;
  className?: string;
}
const JobCompletionProgress: React.FC<JobCompletionProgressProps> = ({
  job,
  className,
}) => {
  const theme = useTheme();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setTooltipOpen(false);
      }
    };

    if (tooltipOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tooltipOpen]);

  if (!job) return null;

  const percentage = (job.profile_completion || 0) * 100;
  const feedback = job.feedback || "";

  const getProgressColor = () => {
    if (percentage >= 80) return theme.palette.success.main;
    if (percentage >= 60) return theme.palette.info.main; // Replace orange with professional blue
    return theme.palette.error.main;
  };

  if (!job.active) {
    return (
      <Box className={className}>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1,
            opacity: 0.5,
            filter: "grayscale(0.9)",
          }}
        >
          <Box
            sx={{
              flex: 1,
              height: 3, // Thinner for inactive state too
              borderRadius: 2,
              backgroundColor: theme.palette.grey[200],
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
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            flex: 1,
            height: 3, // Thinner progress bar
            borderRadius: 2,
            backgroundColor: theme.palette.grey[100],
            "& .MuiLinearProgress-bar": {
              backgroundColor: getProgressColor(),
              borderRadius: 2,
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary, // More muted color
            fontWeight: 400, // Less prominent weight
            minWidth: "fit-content",
            fontSize: "0.7rem", // Smaller text
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
        open={tooltipOpen}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
        disableHoverListener={false}
        enterDelay={200}
        leaveDelay={300}
        enterNextDelay={200}
        disableFocusListener={false}
        disableTouchListener={false}
        title={
          <Box
            ref={tooltipRef}
            sx={{
              maxWidth: 400,
              maxHeight: 300,
              overflowY: "auto",
              overflowX: "hidden",
              padding: 2,
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-thumb": {
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.3)",
                borderRadius: "3px",
                "&:hover": {
                  background:
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(0,0,0,0.5)",
                },
              },
            }}
          >
            <MarkdownMessage
              message={feedback || "No feedback."}
              isUser={false}
            />
          </Box>
        }
        arrow
        placement="bottom"
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "preventOverflow",
                options: {
                  boundary: "viewport",
                  padding: 16,
                  altBoundary: true,
                },
              },
              {
                name: "flip",
                options: {
                  fallbackPlacements: [
                    "bottom",
                    "left",
                    "right",
                    "top-start",
                    "top-end",
                    "bottom-start",
                    "bottom-end",
                  ],
                  boundary: "viewport",
                  padding: 16,
                },
              },
              {
                name: "offset",
                options: {
                  offset: [0, 8],
                },
              },
              {
                name: "computeStyles",
                options: {
                  adaptive: true,
                  roundOffsets: true,
                },
              },
            ],
          },
          tooltip: {
            sx: {
              maxWidth: "none",
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              fontSize: "0.875rem",
              pointerEvents: "auto",
              border: `1px solid ${theme.palette.divider}`,
            },
            onMouseEnter: (e: React.MouseEvent) => {
              e.stopPropagation();
            },
            onMouseLeave: (e: React.MouseEvent) => {
              e.stopPropagation();
            },
          },
        }}
      >
        {progressContent}
      </Tooltip>
    );
  }

  return progressContent;
};

export default JobCompletionProgress;
