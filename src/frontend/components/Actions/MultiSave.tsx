import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Divider,
  Typography,
  styled,
  keyframes,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Save, Warning, Block } from "@mui/icons-material";

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
    if (countdown > 0) return `Auto-saving in ${countdown} seconds`;
    return "Auto-save status";
  };

  const handleClick = () => {
    setTooltipOpen((prev) => !prev);
  };

  if (!hasChanges && !isSaving && !isAnyLoading) return null;

  return (
    <Tooltip
      title={getTooltipText()}
      arrow
      open={tooltipOpen}
      onClose={() => setTooltipOpen(false)}
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
        onClick={handleClick}
        onMouseEnter={() => setTooltipOpen(true)}
        sx={{ cursor: "pointer" }}
      >
        <Box display="flex" alignItems="center" justifyContent="center">
          {isAnyLoading || isSaving ? (
            <BouncingLoader />
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
export interface SaveButtonItem {
  name: string;
  isChanged: boolean;
  onSave: () => Promise<void> | void;
  onReset: () => Promise<void> | void;
  loading?: boolean;
}

interface SaveButtonsProps {
  items: SaveButtonItem[];
}

const SaveButtons: React.FC<SaveButtonsProps> = ({ items }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPreventingClose, setIsPreventingClose] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );
  const buttonWrapperRef = useRef<HTMLDivElement>(null);

  const hasChanges = items.some((item) => item.isChanged);
  const open = Boolean(anchorEl);

  // Handle browser/tab close prevention
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        setIsPreventingClose(true);

        // Trigger shake animation
        if (buttonWrapperRef.current) {
          buttonWrapperRef.current.classList.remove("shake");
          void buttonWrapperRef.current.offsetWidth; // Trigger reflow
          buttonWrapperRef.current.classList.add("shake");
        }

        // Reset preventing close state after animation
        setTimeout(() => setIsPreventingClose(false), 2000);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!hasChanges) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = async (itemName: string, action: "save" | "reset") => {
    const item = items.find((i) => i.name === itemName);
    if (!item) return;

    setLoadingStates((prev) => ({ ...prev, [itemName]: true }));

    try {
      if (action === "save") {
        await item.onSave();
      } else {
        await item.onReset();
      }
    } catch (error) {
      console.error(`Error ${action}ing ${itemName}:`, error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [itemName]: false }));
    }

    handleClose();
  };

  const getButtonProps = () => {
    if (!hasChanges) {
      return {
        variant: "outlined" as const,
        color: "inherit" as const,
        startIcon: <Save />,
        disabled: true,
      };
    }

    if (isPreventingClose) {
      return {
        variant: "contained" as const,
        color: "error" as const,
        startIcon: <Block />,
        disabled: false,
      };
    }

    return {
      variant: "contained" as const,
      color: "warning" as const,
      startIcon: <Warning />,
      disabled: false,
    };
  };

  const getTooltipMessage = () => {
    if (!hasChanges) return "No changes to save";
    if (isPreventingClose)
      return "You have unsaved changes! Save before closing.";

    const changedItems = items.filter((item) => item.isChanged);
    return `Unsaved changes in: ${changedItems.map((item) => item.name).join(", ")}`;
  };

  const getWrapperClasses = () => {
    const classes = [];
    if (isPreventingClose) classes.push("radiation");
    return classes.join(" ");
  };

  const getTooltipClasses = () => {
    if (isPreventingClose) return "prevent-close";
    if (hasChanges) return "changes-warning";
    return "";
  };

  const buttonProps = getButtonProps();
  if (!hasChanges) {
    return <></>;
  }
  return (
    <>
      <FloatingTooltip
        title={getTooltipMessage()}
        arrow
        placement="top"
        className={getTooltipClasses()}
        componentsProps={{
          tooltip: {
            className: getTooltipClasses(),
          },
          arrow: {
            className: getTooltipClasses(),
          },
        }}
      >
        <AnimatedButtonWrapper
          ref={buttonWrapperRef}
          className={getWrapperClasses()}
        >
          <LoadingButton
            {...buttonProps}
            onClick={handleClick}
            loading={Object.values(loadingStates).some(Boolean)}
            sx={{
              transition: "all 0.3s ease-in-out",
              "&:not(:disabled):hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            Save
          </LoadingButton>
        </AnimatedButtonWrapper>
      </FloatingTooltip>

      <StyledMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {items.map((item, index) => (
          <div key={item.name}>
            <MenuSection>
              <SectionTitle>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                {item.isChanged && (
                  <Typography
                    component="span"
                    sx={{
                      ml: 1,
                      color: "warning.main",
                      fontSize: "0.7rem",
                    }}
                  >
                    • Modified
                  </Typography>
                )}
              </SectionTitle>

              <Box sx={{ display: "flex", gap: 1 }}>
                <ActionButton
                  onClick={() => handleAction(item.name, "save")}
                  disabled={!item.isChanged || loadingStates[item.name]}
                  startIcon={<Save fontSize="small" />}
                  color="primary"
                >
                  Save
                </ActionButton>

                <ActionButton
                  onClick={() => handleAction(item.name, "reset")}
                  disabled={!item.isChanged || loadingStates[item.name]}
                  color="inherit"
                >
                  Reset
                </ActionButton>
              </Box>
            </MenuSection>

            {index < items.length - 1 && <Divider />}
          </div>
        ))}
      </StyledMenu>
    </>
  );
};

export default MultiAutoSaveContainer;
