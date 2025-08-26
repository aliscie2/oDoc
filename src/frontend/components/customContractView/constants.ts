// Status configurations for data-driven rendering
export const STATUS_CONFIGS = {
  None: { color: "#64748b", bg: "#f1f5f9", icon: "⏳" },
  Released: { color: "#059669", bg: "#ecfdf5", icon: "✅" },
  Confirmed: { color: "#0284c7", bg: "#eff6ff", icon: "🤝" },
  Objected: { color: "#dc2626", bg: "#fef2f2", icon: "⚠️" },
  HighPromise: { color: "#ea580c", bg: "#fff7ed", icon: "⭐" },
  RequestCancellation: { color: "#f59e0b", bg: "#fffbeb", icon: "🔄" },
  ConfirmedCancellation: { color: "#6b7280", bg: "#f9fafb", icon: "❌" },
  ApproveHighPromise: { color: "#10b981", bg: "#ecfdf5", icon: "⭐✅" },
} as const;

// Common responsive breakpoints
export const RESPONSIVE_STYLES = {
  mobileBreakpoint: "sm",
  containerPadding: { xs: 1, sm: 2, md: 3 },
  buttonSize: { xs: "0.65rem", sm: "0.75rem" },
  iconSize: { xs: 12, sm: 14 },
  minHeight: { xs: 28, sm: 32 },
} as const;

// Session storage keys
export const STORAGE_KEYS = {
  hideReceivedPromises: "hideReceivedPromises",
  seenNotification: (id: string) => `seen_notification_${id}`,
} as const;

// Field input configurations
export const FIELD_CONFIGS = {
  standardTextField: {
    variant: "standard" as const,
    sx: {
      "& .MuiInput-underline:before": { display: "none" },
      "& .MuiInput-underline:after": { display: "none" },
      "& .MuiInput-underline:hover:not(.Mui-disabled):before": { display: "none" },
    },
  },
} as const;