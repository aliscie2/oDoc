// Calendar styling utilities - Theme-aware

export const getEventColors = (isDark: boolean = false) => {
  // Professional, accessible color palette that works in both modes
  return isDark 
    ? ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"]
    : ["#2563eb", "#7c3aed", "#db2777", "#d97706", "#059669", "#0891b2"];
};

export const getSlotStatusStyles = (status: string, isDark: boolean) => {
  const baseStyles = {
    past: {
      backgroundColor: isDark ? "rgba(108, 115, 127, 0.15)" : "rgba(148, 163, 184, 0.1)",
      color: isDark ? "rgba(203, 213, 225, 0.5)" : "rgba(100, 116, 139, 0.6)",
      cursor: "not-allowed",
    },
    available: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.08)",
      color: isDark ? "rgba(52, 211, 153, 0.9)" : "rgba(5, 150, 105, 0.9)",
      cursor: "pointer",
    },
    blocked: {
      backgroundColor: isDark ? "rgba(240, 68, 56, 0.1)" : "rgba(240, 68, 56, 0.06)",
      color: isDark ? "rgba(248, 113, 113, 0.9)" : "rgba(220, 38, 38, 0.9)",
      cursor: "not-allowed",
    },
    none: {
      backgroundColor: "transparent",
      cursor: "default",
    },
  };

  return baseStyles[status as keyof typeof baseStyles] || baseStyles.none;
};

export const getEventStyle = (
  event: any,
  profile: any,
  calendar: unknown,
  isDark: boolean,
) => {
  // FreeBusy blocks - neutral gray
  if (event.isFreeBusyBlock) {
    return {
      style: {
        backgroundColor: isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.35)",
        borderColor: isDark ? "rgba(148, 163, 184, 0.35)" : "rgba(100, 116, 139, 0.4)",
        color: isDark ? "rgba(241, 245, 249, 0.8)" : "rgba(15, 23, 42, 0.7)",
        opacity: 0.65,
        cursor: "not-allowed",
        fontStyle: "italic",
      },
    };
  }

  const isUserCreated = profile?.id === event?.created_by;
  const isUserGoogleEvent =
    event.isGoogleEvent && calendar?.google_ids?.includes(event.created_by);
  const isCreator = isUserCreated || isUserGoogleEvent;
  const isSharedCalendarPage =
    window.location.pathname === "/calendar" &&
    window.location.search.includes("id=");
  const isPending = event.isPending;

  // Google events - use Google blue
  if (event.isGoogleEvent) {
    return {
      style: {
        backgroundColor: isDark ? "#4285F4" : "#1a73e8",
        color: "#ffffff",
        opacity: isPending ? 0.6 : 0.95,
        fontWeight: 500,
        ...(isPending && {
          animation: "pulse 2s infinite",
          border: `1px dashed ${isDark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)"}`,
        }),
      },
    };
  }

  // User's own events - use event color or primary
  if (isCreator) {
    return {
      style: {
        backgroundColor: event.color || (isDark ? "#3b82f6" : "#2563eb"),
        color: "#ffffff",
        opacity: isPending ? 0.6 : 0.95,
        fontWeight: 500,
        ...(isPending && {
          animation: "pulse 2s infinite",
          border: `1px dashed ${isDark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)"}`,
        }),
      },
    };
  }

  // Other users' events on shared calendar - neutral gray
  return {
    style: {
      backgroundColor: isDark ? "rgba(100, 116, 139, 0.4)" : "rgba(148, 163, 184, 0.5)",
      color: isDark ? "rgba(241, 245, 249, 0.9)" : "rgba(15, 23, 42, 0.8)",
      opacity: 0.85,
      fontWeight: 400,
    },
  };
};
