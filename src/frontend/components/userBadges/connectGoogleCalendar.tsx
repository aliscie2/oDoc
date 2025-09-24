import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Google as GoogleIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useGoogleCalendar } from "@/pages/calendar/googleAccounts/useGoogleCalendar";

interface RootState {
  jobState: {
    jobs: Array<{
      active?: boolean;
    }>;
  };
  calendarState: {
    calendar: {
      google_ids?: string[];
    } | null;
  };
}

const GoogleCalendarOnboarding = () => {
  const [hasTriedToClose, setHasTriedToClose] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { jobs } = useSelector((state: RootState) => state.jobState);
  const { calendar } = useSelector((state: RootState) => state.calendarState);
  const {
    emails,
    availabilityCompleted,
    connectGoogleCalendar,
    loading,
    error,
  } = useGoogleCalendar();

  const hasActiveJobs = jobs.some((job) => job.active);
  const hasGoogleIds = (calendar?.google_ids?.length || 0) > 0 || emails.length > 0;
  const shouldShow = hasActiveJobs && availabilityCompleted && !hasGoogleIds;

  useEffect(() => {
    if (shouldShow && !hasTriedToClose) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow, hasTriedToClose]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldShow && !hasGoogleIds) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldShow, hasGoogleIds]);

  const handleClose = () => {
    setOpen(false);
    setHasTriedToClose(true);
  };

  const handleGoogleConnect = async () => {
    try {
      await connectGoogleCalendar();
      setOpen(false);
    } catch (error) {
      console.error("Google auth failed:", error);
      // Error will be shown via the error state from the hook
    }
  };

  if (!shouldShow) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 2 }
        }
      }}
    >
      <IconButton
        onClick={handleClose}
        sx={{ 
          position: "absolute", 
          top: 12, 
          right: 12, 
          zIndex: 1,
          backgroundColor: "action.hover",
          "&:hover": { backgroundColor: "action.selected" }
        }}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <DialogContent sx={{ p: 4, textAlign: "center" }}>
        <CalendarIcon 
          sx={{ 
            fontSize: 64, 
            mb: 2, 
            color: "primary.main",
            opacity: 0.8 
          }} 
        />

        <Typography variant="h5" fontWeight="600" gutterBottom>
          Connect Google Calendar
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3, 
            color: "text.secondary",
            lineHeight: 1.6 
          }}
        >
          Prevent double bookings and automatically sync your appointments
        </Typography>

        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={loading ? undefined : <GoogleIcon />}
          onClick={handleGoogleConnect}
          disabled={loading}
          sx={{ 
            py: 1.5, 
            fontWeight: 600,
            fontSize: "1rem",
            backgroundColor: error ? "#f44336" : "#4285F4",
            "&:hover": { backgroundColor: error ? "#d32f2f" : "#3367D6" },
            "&:disabled": { opacity: 0.7 }
          }}
        >
          {loading ? "Connecting..." : error ? "Retry Connection" : "Connect Google Calendar"}
        </Button>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mt: 2, fontSize: "0.875rem" }}
          >
            {error}
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GoogleCalendarOnboarding;