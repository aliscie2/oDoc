import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Menu,
  Tooltip,
  Box,
  Typography,
  styled,
  keyframes,
} from "@mui/material";
import { Save } from "@mui/icons-material";

// import SaveButtons, { SaveButtonItem } from './SaveButtons';
import { useDocsSave } from "./useDocsSave";
import { useCalendarSave } from "./useCalendarSave";
import { useJobsSave } from "./useJobSave";

const shakeAndScaleAnimation = keyframes`
  0% { transform: translateX(0) scale(1); }
  10% { transform: translateX(-5px) scale(1.3); }
  20% { transform: translateX(5px) scale(1.3); }
  30% { transform: translateX(-5px) scale(1.3); }
  40% { transform: translateX(5px) scale(1.3); }
  50% { transform: translateX(-5px) scale(1.3); }
  60% { transform: translateX(5px) scale(1.3); }
  70% { transform: translateX(-5px) scale(1.3); }
  80% { transform: translateX(5px) scale(1.3); }
  90% { transform: translateX(-5px) scale(1.3); }
  100% { transform: translateX(0) scale(1); }
`;

const radiationAnimation = keyframes`
  0% { 
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
    transform: scale(1.05);
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
    transform: scale(1);
  }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// Styled Components
const AnimatedButtonWrapper = styled(Box)`
  display: inline-block;

  &.shake {
    animation: ${shakeAndScaleAnimation} 1.2s cubic-bezier(0.36, 0, 0.66, -0.56);
    animation-fill-mode: forwards;
  }

  &.radiation {
    animation: ${radiationAnimation} 1.5s infinite;

    .MuiButton-root {
      background-color: #ff5252 !important;
      color: white !important;

      &:hover {
        background-color: #d32f2f !important;
      }
    }
  }
`;

const CountdownDonut = ({ timeLeft, totalTime }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const progress = ((totalTime - timeLeft) / totalTime) * circumference;

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="36" height="36">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="2"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#ff9800"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform="rotate(-90 18 18)"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
        <text
          x="18"
          y="22"
          textAnchor="middle"
          fontSize="10"
          fill="#ff9800"
          fontWeight="bold"
        >
          {timeLeft}
        </text>
      </svg>
    </Box>
  );
};

const BouncingLoader = () => (
  <Box
    sx={{
      width: 40,
      height: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Box
      sx={{
        display: "flex",
        "& > div": {
          width: 6,
          height: 6,
          bgcolor: "#1976d2",
          borderRadius: "50%",
          margin: "0 2px",
          animation: "bounce 1.4s infinite ease-in-out",
        },
      }}
    >
      <div style={{ animationDelay: "-0.32s" }}></div>
      <div style={{ animationDelay: "-0.16s" }}></div>
      <div></div>
    </Box>
  </Box>
);
const MultiAutoSave = ({ items }) => {
  const [countdown, setCountdown] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const countdownRef = useRef(null);

  const hasChanges = items.some((item) => item.isChanged);
  const isAnyLoading = items.some((item) => item.loading);
  const COUNTDOWN_TIME = 5;

  const saveAll = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        items.filter((item) => item.isChanged).map((item) => item.onSave()),
      );
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(COUNTDOWN_TIME);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          saveAll();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetCountdown = () => {
    if (hasChanges && !isSaving && !isAnyLoading) {
      startCountdown();
    }
  };

  useEffect(() => {
    if (hasChanges && !isSaving && !isAnyLoading) {
      startCountdown();
    } else if (!hasChanges) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(0);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [hasChanges, isSaving, isAnyLoading]);

  useEffect(() => {
    const resetOnActivity = () => resetCountdown();
    const handleBeforeUnload = (e) => {
      if (hasChanges && !isSaving && !isAnyLoading) {
        saveAll();
        e.preventDefault();
        e.returnValue = "";
      }
    };

    ["mousemove", "keydown", "touchmove"].forEach((event) =>
      document.addEventListener(event, resetOnActivity),
    );
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      ["mousemove", "keydown", "touchmove"].forEach((event) =>
        document.removeEventListener(event, resetOnActivity),
      );
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges, isSaving, isAnyLoading]);

  const getTooltipText = () => {
    if (isAnyLoading || isSaving) return "Saving changes...";
    if (countdown > 0) return `Auto-saving changes in ${countdown} seconds`;
    return "Auto-save status";
  };

  const handleMouseEnter = () => {
    setShowButton(true);
    setTooltipOpen(true);
  };

  const handleMouseLeave = () => {
    setShowButton(false);
    setTooltipOpen(false);
  };

  const handleClick = () => {
    if (hasChanges && !isSaving && !isAnyLoading) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      setCountdown(0);
      saveAll();
    }
  };

  if (!hasChanges && !isSaving && !isAnyLoading) return null;

  return (
    <Tooltip
      title={getTooltipText()}
      arrow
      open={tooltipOpen}
      componentsProps={{
        tooltip: {
          sx: {
            fontSize: "1rem",
            padding: "8px 12px",
          },
        },
      }}
    >
      <Box
        p={1}
        display="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        sx={{ cursor: "pointer" }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            transform: showButton ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.2s ease-in-out",
          }}
        >
          {isAnyLoading || isSaving ? (
            <BouncingLoader />
          ) : showButton ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<Save />}
              sx={{
                fontSize: "0.75rem",
                minWidth: "auto",
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Save Now
            </Button>
          ) : countdown > 0 ? (
            <CountdownDonut timeLeft={countdown} totalTime={COUNTDOWN_TIME} />
          ) : null}
        </Box>
      </Box>
    </Tooltip>
  );
};

const MultiAutoSaveContainer = () => {
  const docsHook = useDocsSave();
  const calendarHook = useCalendarSave();
  const jobsHook = useJobsSave();

  const saveItems = [
    {
      name: "docs",
      isChanged: docsHook.isChanged,
      onSave: docsHook.save,
      loading: docsHook.loading,
    },
    {
      name: "calendar",
      isChanged: calendarHook.isChanged,
      onSave: calendarHook.save,
      loading: calendarHook.loading,
    },
    {
      name: "jobs",
      isChanged: jobsHook.isChanged,
      onSave: jobsHook.save,
      loading: jobsHook.loading,
    },
  ];

  return <MultiAutoSave items={saveItems} />;
};

const FloatingTooltip = styled(Tooltip)(({ theme }) => ({
  "& .MuiTooltip-tooltip": {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    maxWidth: 280,
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.24)",
    border: `1px solid ${theme.palette.divider}`,
    animation: `${floatingAnimation} 2s ease-in-out infinite`,

    "&.changes-warning": {
      backgroundColor: theme.palette.warning.dark,
      color: theme.palette.warning.contrastText,
    },

    "&.prevent-close": {
      backgroundColor: theme.palette.error.dark,
      color: theme.palette.error.contrastText,
      animation: `${floatingAnimation} 1.5s ease-in-out infinite`,
    },
  },
  "& .MuiTooltip-arrow": {
    color: theme.palette.grey[900],
    fontSize: "1.2rem",

    "&::before": {
      border: `1px solid ${theme.palette.divider}`,
    },
  },
  '&[data-popper-placement*="bottom"] .MuiTooltip-arrow': {
    "&::before": {
      borderTop: "none",
      borderLeft: "none",
    },
  },
  '&[data-popper-placement*="top"] .MuiTooltip-arrow': {
    "&::before": {
      borderBottom: "none",
      borderRight: "none",
    },
  },
  '&[data-popper-placement*="right"] .MuiTooltip-arrow': {
    "&::before": {
      borderBottom: "none",
      borderLeft: "none",
    },
  },
  '&[data-popper-placement*="left"] .MuiTooltip-arrow': {
    "&::before": {
      borderTop: "none",
      borderRight: "none",
    },
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    minWidth: 200,
    borderRadius: 12,
    marginTop: theme.spacing(1),
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    border: `1px solid ${theme.palette.divider}`,
  },
}));

const MenuSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: theme.spacing(0.5),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  justifyContent: "flex-start",
  width: "100%",
  textTransform: "none",
  fontSize: "0.875rem",
  padding: theme.spacing(0.5, 1),
  borderRadius: 6,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Types
interface SaveButtonItem {
  name: string;
  isChanged: boolean;
  onSave: () => Promise<void> | void;
  onReset: () => Promise<void> | void;
  loading?: boolean;
}

export default MultiAutoSaveContainer;
