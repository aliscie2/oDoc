import { useTheme, useMediaQuery } from "@mui/material";
import { useMemo } from "react";

export const useCalendarStyles = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const eventStyleGetter = useMemo(() => {
    return (event: any, profile: any, calendar: any) => {
      const isUserCreated = profile?.id === event?.created_by;
      const isUserGoogleEvent =
        event.isGoogleEvent && calendar?.google_ids?.includes(event.created_by);
      const isCreator = isUserCreated || isUserGoogleEvent;

      // Check if this is a shared calendar page
      const isSharedCalendarPage =
        window.location.pathname === "/calendar" &&
        window.location.search.includes("id=");

      // Handle pending events (optimistic updates)
      const isPending = event.isPending;

      return {
        style: {
          backgroundColor: isCreator ? event.color : "#9e9e9e",
          opacity: isPending ? 0.6 : 0.9, // Reduced opacity for pending events
          color: isCreator ? "inherit" : "#666666",
          // Add subtle animation for pending events
          ...(isPending && {
            animation: "pulse 2s infinite",
            border: "1px dashed rgba(255,255,255,0.5)",
          }),
          // On shared calendar, ensure other people's events are grey
          ...(isSharedCalendarPage &&
            !isCreator && {
              backgroundColor: "#9e9e9e",
              color: "#666666",
            }),
        },
      };
    };
  }, []);

  const getSlotStatusStyles = (status: string) => {
    const baseStyles = {
      past: {
        backgroundColor: isDark ? "#424242" : "#f5f5f5",
        color: isDark ? "#666" : "#999",
        cursor: "not-allowed",
      },
      available: {
        backgroundColor: isDark ? "#1b5e20" : "#e8f5e8",
        color: isDark ? "#4caf50" : "#2e7d32",
        cursor: "pointer",
      },
      blocked: {
        backgroundColor: isDark ? "#b71c1c" : "#ffebee",
        color: isDark ? "#f44336" : "#c62828",
        cursor: "not-allowed",
      },
      none: {
        backgroundColor: "transparent",
        cursor: "default",
      },
    };

    return baseStyles[status as keyof typeof baseStyles] || baseStyles.none;
  };

  const getEventColors = () => {
    return [
      "#FF2D55",
      "#5856D6", 
      "#007AFF",
      "#5AC8FA",
      "#4CD964",
      "#FF9500",
    ];
  };

  return {
    isDark,
    isMobile,
    eventStyleGetter,
    getSlotStatusStyles,
    getEventColors,
  };
};