import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import {
  Google as GoogleIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useGoogleAuth } from "./setUpConnect";

const GoogleCalendarOnboarding = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasTriedToClose, setHasTriedToClose] = useState(false);

  const { jobs } = useSelector((state: any) => state.jobState);
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { handleGoogleAuth } = useGoogleAuth();

  const hasActiveJobs = jobs.some((job) => job.active);
  const hasAvailabilities = calendar?.availabilities?.length > 0;
  const isGoogleConnected = calendar?.googleIds?.length > 0;
  const shouldShow = hasActiveJobs && hasAvailabilities && !isGoogleConnected;

  useEffect(() => {
    if (shouldShow && !hasTriedToClose) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow, hasTriedToClose]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (shouldShow && !isGoogleConnected) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        setOpen(true);
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldShow, isGoogleConnected]);

  const handleClose = () => {
    setOpen(false);
    setHasTriedToClose(true);
  };

  const handleGoogleConnect = async () => {
    setLoading(true);
    try {
      await handleGoogleAuth();
      setOpen(false);
    } catch (error) {
      console.error("Google auth failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShow) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <IconButton
        onClick={handleClose}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 4, textAlign: "center" }}>
        <CalendarIcon sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Connect Google Calendar
        </Typography>

        <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
          Prevent double bookings and sync appointments
        </Typography>

        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={loading ? null : <GoogleIcon />}
          onClick={handleGoogleConnect}
          disabled={loading}
          sx={{ py: 1.5, fontWeight: "bold" }}
        >
          {loading ? "Connecting..." : "Connect Google Calendar"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleCalendarOnboarding;
