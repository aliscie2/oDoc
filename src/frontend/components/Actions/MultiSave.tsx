import { useState, useEffect, useRef } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import {
  Save,
  Warning,
  Error as ErrorIcon,
  Refresh,
  Description,
  CalendarMonth,
  Work,
} from "@mui/icons-material";

// import SaveButtons, { SaveButtonItem } from './SaveButtons';
import { useDocsSave } from "./useDocsSave";
import { useCalendarSave } from "./useCalendarSave";
import { useJobsSave } from "./useJobSave";

// Styled Components
interface CountdownDonutProps {
  timeLeft: number;
  totalTime: number;
}

const CountdownDonut = ({ timeLeft, totalTime }: CountdownDonutProps) => {
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

interface MultiAutoSaveProps {
  items: SaveButtonItem[];
}

const MultiAutoSave = ({ items }: MultiAutoSaveProps) => {
  const [countdown, setCountdown] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [errorDialog, setErrorDialog] = useState(false);
  const [failedModules, setFailedModules] = useState<string[]>([]);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const hasChanges = items.some((item) => item.isChanged);
  const isAnyLoading = items.some((item) => item.loading);
  const COUNTDOWN_TIME = 5;

  const saveAll = async () => {
    setIsSaving(true);
    setHasAttemptedSave(true);
    const failed: string[] = [];

    try {
      await Promise.allSettled(
        items
          .filter((item) => item.isChanged)
          .map(async (item) => {
            try {
              await item.onSave();
              return { success: true, name: item.name };
            } catch (error) {
              failed.push(item.name);
              return { success: false, name: item.name, error };
            }
          }),
      );

      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
        setCountdown(0);
      }

      // Check if any saves failed
      if (failed.length > 0) {
        setFailedModules(failed);
        setErrorDialog(true);
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const startCountdown = () => {
    if (countdownRef.current !== null) clearInterval(countdownRef.current);
    setCountdown(COUNTDOWN_TIME);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current !== null)
            clearInterval(countdownRef.current);
          saveAll();
          return 0;
        }
        return prev - 1;
      });
    }, 1000) as unknown as NodeJS.Timeout;
  };

  const resetCountdown = () => {
    if (hasChanges && !isSaving && !isAnyLoading && !hasAttemptedSave) {
      startCountdown();
    }
  };

  useEffect(() => {
    if (hasChanges && !isSaving && !isAnyLoading && !hasAttemptedSave) {
      startCountdown();
    } else if (!hasChanges) {
      if (countdownRef.current !== null) clearInterval(countdownRef.current);
      setCountdown(0);
      setHasAttemptedSave(false);
    }

    return () => {
      if (countdownRef.current !== null) clearInterval(countdownRef.current);
    };
  }, [hasChanges, isSaving, isAnyLoading, hasAttemptedSave, startCountdown]);

  useEffect(() => {
    const resetOnActivity = () => resetCountdown();
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
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
  }, [
    hasChanges,
    isSaving,
    isAnyLoading,
    hasAttemptedSave,
    resetCountdown,
    saveAll,
  ]);

  const getTooltipText = () => {
    if (isAnyLoading || isSaving) return "Saving changes...";
    if (countdown > 0)
      return `Auto-saving changes in ${countdown} seconds, or Right-Click to undo.`;
    if (hasChanges) return "😢 Changes not saved";
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
      if (countdownRef.current !== null) clearInterval(countdownRef.current);
      setCountdown(0);
      saveAll();
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleReset = async (moduleName: string) => {
    handleCloseContextMenu();
    const item = items.find((i) => i.name === moduleName);
    if (item) {
      try {
        await item.onReset();
      } catch (error) {
        console.error(`Error resetting ${moduleName}:`, error);
      }
    }
  };

  const handleResetAll = async () => {
    handleCloseContextMenu();
    try {
      await Promise.all(
        items.filter((item) => item.isChanged).map((item) => item.onReset()),
      );
    } catch (error) {
      console.error("Error resetting all:", error);
    }
  };

  const handleErrorDialogReset = async () => {
    setErrorDialog(false);
    // Reset only the failed modules
    try {
      await Promise.all(
        items
          .filter((item) => failedModules.includes(item.name))
          .map((item) => item.onReset()),
      );
      setFailedModules([]);
    } catch (error) {
      console.error("Error resetting failed modules:", error);
    }
  };

  const getModuleIcon = (name: string) => {
    switch (name) {
      case "docs":
        return <Description fontSize="small" />;
      case "calendar":
        return <CalendarMonth fontSize="small" />;
      case "jobs":
        return <Work fontSize="small" />;
      default:
        return <Refresh fontSize="small" />;
    }
  };

  const getModuleLabel = (name: string) => {
    switch (name) {
      case "docs":
        return "Documents";
      case "calendar":
        return "Calendar";
      case "jobs":
        return "Jobs";
      default:
        return name;
    }
  };

  const hasErrors = items.some(
    (item) => item.lastError !== null && item.lastError !== undefined,
  );

  if (!hasChanges && !isSaving && !isAnyLoading) return null;

  return (
    <>
      <Tooltip
        title={getTooltipText()}
        arrow
        open={tooltipOpen}
        slotProps={{
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
          onContextMenu={handleContextMenu}
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
                startIcon={hasErrors ? <ErrorIcon /> : <Save />}
                sx={{
                  fontSize: "0.75rem",
                  minWidth: "auto",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  textTransform: "none",
                  ...(hasErrors && {
                    bgcolor: "error.main",
                    "&:hover": { bgcolor: "error.dark" },
                  }),
                }}
              >
                {hasErrors ? "Error" : "Save Now"}
              </Button>
            ) : countdown > 0 ? (
              <CountdownDonut timeLeft={countdown} totalTime={COUNTDOWN_TIME} />
            ) : hasAttemptedSave && hasChanges ? (
              hasErrors ? (
                <ErrorIcon sx={{ color: "#f44336", fontSize: 32 }} />
              ) : (
                <Warning sx={{ color: "#ff9800", fontSize: 32 }} />
              )
            ) : null}
          </Box>
        </Box>
      </Tooltip>

      {/* Context Menu for Reset Options */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem disabled>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Reset Changes
          </Typography>
        </MenuItem>
        <Divider />
        {items
          .filter((item) => item.isChanged)
          .map((item) => (
            <MenuItem
              key={item.name}
              onClick={() => handleReset(item.name)}
              sx={{
                ...(item.lastError && {
                  bgcolor: "error.light",
                  "&:hover": { bgcolor: "error.main" },
                }),
              }}
            >
              <ListItemIcon>{getModuleIcon(item.name)}</ListItemIcon>
              <ListItemText>
                Reset {getModuleLabel(item.name)}
                {item.lastError && (
                  <Typography variant="caption" color="error" display="block">
                    (Has Error)
                  </Typography>
                )}
              </ListItemText>
            </MenuItem>
          ))}
        {items.filter((item) => item.isChanged).length > 1 && (
          <>
            <Divider />
            <MenuItem onClick={handleResetAll}>
              <ListItemIcon>
                <Refresh fontSize="small" />
              </ListItemIcon>
              <ListItemText>Reset All</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Error Dialog */}
      <Dialog open={errorDialog} onClose={() => setErrorDialog(false)}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ErrorIcon color="error" />
            Save Failed
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            The following modules failed to save:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            {failedModules.map((moduleName) => {
              const item = items.find((i) => i.name === moduleName);
              return (
                <li key={moduleName}>
                  <Typography variant="body2">
                    <strong>{getModuleLabel(moduleName)}</strong>
                    {item?.lastError && (
                      <Typography
                        variant="caption"
                        color="error"
                        display="block"
                      >
                        {item.lastError.error}
                      </Typography>
                    )}
                  </Typography>
                </li>
              );
            })}
          </Box>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Would you like to undo your changes and start over?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialog(false)}>Keep Changes</Button>
          <Button
            onClick={handleErrorDialogReset}
            color="error"
            variant="contained"
          >
            Reset & Start Over
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const MultiAutoSaveContainer = () => {
  const docsHook = useDocsSave();
  const calendarHook = useCalendarSave();
  const jobsHook = useJobsSave();

  const saveItems: SaveButtonItem[] = [
    {
      name: "docs",
      isChanged: docsHook.isChanged,
      onSave: docsHook.save,
      onReset: docsHook.reset,
      loading: docsHook.loading,
      lastError: docsHook.lastError,
    },
    {
      name: "calendar",
      isChanged: calendarHook.isChanged,
      onSave: calendarHook.save,
      onReset: calendarHook.reset,
      loading: calendarHook.loading,
      lastError: calendarHook.lastError,
    },
    {
      name: "jobs",
      isChanged: jobsHook.isChanged,
      onSave: jobsHook.save,
      onReset: jobsHook.reset,
      loading: jobsHook.loading,
      lastError: jobsHook.lastError,
    },
  ];

  return <MultiAutoSave items={saveItems} />;
};

// Types
interface SaveError {
  module: "docs" | "calendar" | "jobs";
  error: string;
}

interface SaveButtonItem {
  name: string;
  isChanged: boolean;
  onSave: () => Promise<void> | void;
  onReset: () => Promise<void> | void;
  loading?: boolean;
  lastError?: SaveError | null;
}

export default MultiAutoSaveContainer;
