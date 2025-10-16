import { createTheme as createMuiTheme, alpha } from "@mui/material/styles";

const baseColors = {
  error: { main: "#ef4444", contrastText: "#FFFFFF" },
  info: { main: "#06b6d4", contrastText: "#FFFFFF" },
  success: { main: "#22c55e", contrastText: "#FFFFFF" },
  warning: { main: "#f59e0b", contrastText: "#FFFFFF" },
};
function createPalette(isDarkMode: boolean) {
  return {
    mode: (isDarkMode ? "dark" : "light") as "dark" | "light",
    primary: {
      main: "#3A8DFF",
      light: "#6AABFF",
      dark: "#2563EB",
      contrastText: "#ffffff",
    },
    secondary: {
      main: isDarkMode ? "#a78bfa" : "#7c3aed",
      contrastText: "#ffffff",
    },
    error: baseColors.error,
    info: baseColors.info,
    success: baseColors.success,
    warning: baseColors.warning,
    background: {
      default: isDarkMode ? "#1a1a1a" : "#E8EDF2",
      paper: isDarkMode ? "#242424" : "#F0F4F8",
      header: isDarkMode ? "#161616" : "#EEF2F6",
    },
    text: {
      primary: isDarkMode ? "#fafafa" : "#2C3E50",
      secondary: isDarkMode ? "#a3a3a3" : "#5A6C7D",
      disabled: isDarkMode ? "#525252" : "#95A5A6",
    },
    divider: isDarkMode ? alpha("#ffffff", 0.12) : alpha("#000000", 0.06),
    action: {
      hover: isDarkMode ? alpha("#ffffff", 0.08) : alpha("#3A8DFF", 0.08),
      selected: isDarkMode ? alpha("#ffffff", 0.12) : alpha("#3A8DFF", 0.12),
    },
  };
}

const createComponents = (palette: ReturnType<typeof createPalette>) => {
  const isDark = palette.mode === "dark";

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
          background: palette.background.default,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        a: {
          color: palette.primary.main,
          textDecoration: "none",
          transition: "color 0.2s ease",
          "&:hover": {
            color: palette.primary.dark,
            textDecoration: "underline",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: palette.background.paper,
          borderRadius: 20,
          border: "none",
          boxShadow: isDark
            ? "8px 8px 16px rgba(0,0,0,0.5), -8px -8px 16px rgba(60,60,60,0.1)"
            : "8px 8px 16px rgba(163,177,198,0.3), -8px -8px 16px rgba(255,255,255,0.8)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: isDark
              ? "12px 12px 24px rgba(0,0,0,0.6), -12px -12px 24px rgba(60,60,60,0.15)"
              : "12px 12px 24px rgba(163,177,198,0.4), -12px -12px 24px rgba(255,255,255,0.9)",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.9375rem",
          padding: "10px 24px",
          transition: "all 0.3s ease",
        },
        contained: {
          backgroundColor: palette.primary.main,
          color: "#ffffff",
          boxShadow: isDark
            ? "4px 4px 8px rgba(0,0,0,0.4), -2px -2px 6px rgba(60,60,60,0.1)"
            : "4px 4px 8px rgba(58,141,255,0.25), -2px -2px 6px rgba(255,255,255,0.7), inset 1px 1px 2px rgba(255,255,255,0.2)",
          "&:hover": {
            backgroundColor: palette.primary.dark,
            boxShadow: isDark
              ? "6px 6px 12px rgba(0,0,0,0.5), -3px -3px 8px rgba(60,60,60,0.15)"
              : "6px 6px 12px rgba(58,141,255,0.35), -3px -3px 8px rgba(255,255,255,0.8), inset 1px 1px 2px rgba(255,255,255,0.3)",
            transform: "translateY(-1px)",
          },
          "&:active": { transform: "translateY(0)" },
        },
        outlined: {
          borderColor: palette.divider,
          boxShadow: isDark
            ? "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(60,60,60,0.1)"
            : "inset 2px 2px 4px rgba(163,177,198,0.2), inset -2px -2px 4px rgba(255,255,255,0.7)",
          "&:hover": {
            borderColor: palette.primary.main,
            backgroundColor: alpha(palette.primary.main, 0.05),
          },
        },
        text: {
          "&:hover": { backgroundColor: palette.action.hover },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: palette.background.paper,
            borderRadius: 16,
            boxShadow: isDark
              ? "inset 3px 3px 6px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(60,60,60,0.1)"
              : "inset 3px 3px 6px rgba(163,177,198,0.25), inset -3px -3px 6px rgba(255,255,255,0.7)",
            "& fieldset": { border: "none" },
            "&:hover fieldset": { border: "none" },
            "&.Mui-focused": {
              boxShadow: isDark
                ? "inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(60,60,60,0.15), 0 0 0 2px rgba(58,141,255,0.3)"
                : "inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.8), 0 0 0 2px rgba(58,141,255,0.2)",
              "& fieldset": { border: "none" },
            },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          fontSize: "0.875rem",
          height: "32px",
          boxShadow: isDark
            ? "3px 3px 6px rgba(0,0,0,0.4), -2px -2px 4px rgba(60,60,60,0.1)"
            : "3px 3px 6px rgba(163,177,198,0.2), -2px -2px 4px rgba(255,255,255,0.7)",
        },
      },
    },

   MuiIconButton: {
  styleOverrides: {
    root: {
      borderRadius: 12,
      transition: "all 0.3s ease",
      boxShadow: "none", // REMOVE default shadows
      "&:hover": {
        backgroundColor: palette.action.hover,
        boxShadow: "none", // REMOVE hover shadows
      },
      "&:active": { transform: "scale(0.96)" },
    },
  },
},

    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "none",
          textTransform: "none",
          fontWeight: 500,
          boxShadow: isDark
            ? "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(60,60,60,0.1)"
            : "inset 2px 2px 4px rgba(163,177,198,0.2), inset -2px -2px 4px rgba(255,255,255,0.7)",
          "&.Mui-selected": {
            backgroundColor: palette.primary.main,
            color: "#ffffff",
            boxShadow: isDark
              ? "4px 4px 8px rgba(0,0,0,0.4), -2px -2px 6px rgba(60,60,60,0.1)"
              : "4px 4px 8px rgba(58,141,255,0.25), -2px -2px 6px rgba(255,255,255,0.7)",
            "&:hover": { backgroundColor: palette.primary.dark },
          },
        },
      },
    },

 MuiAvatar: {
  styleOverrides: {
    root: {
      backgroundColor: palette.background.paper,
      color: palette.text.primary,
      fontWeight: 600,
      boxShadow: "none", // REMOVE default shadows
    },
  },
},

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: palette.divider,
          boxShadow: isDark
            ? "0 1px 2px rgba(0,0,0,0.3)"
            : "0 1px 2px rgba(163,177,198,0.15), 0 -1px 1px rgba(255,255,255,0.6)",
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "transparent",
            boxShadow: isDark
              ? "inset 2px 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(60,60,60,0.1)"
              : "inset 2px 2px 4px rgba(163,177,198,0.2), inset -2px -2px 4px rgba(255,255,255,0.7)",
          },
          "&.Mui-selected": {
            backgroundColor: "transparent",
            boxShadow: isDark
              ? "inset 3px 3px 6px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(60,60,60,0.15)"
              : "inset 3px 3px 6px rgba(163,177,198,0.25), inset -3px -3px 6px rgba(255,255,255,0.8)",
          },
        },
      },
    },
  };
};

export function createTheme(isDarkMode: boolean) {
  const palette = createPalette(isDarkMode);

  return createMuiTheme({
    palette,
    components: createComponents(palette),
    shape: { borderRadius: 16 },
    typography: {
      fontFamily:
        '"DM Sans", "Inter", "Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: 15,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 600,
      h1: {
        fontSize: "2.75rem",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontSize: "2.25rem",
        fontWeight: 600,
        lineHeight: 1.25,
        letterSpacing: "-0.015em",
      },
      h3: {
        fontSize: "1.875rem",
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
      },
      h4: { fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.35 },
      h5: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.4 },
      h6: { fontSize: "1.125rem", fontWeight: 500, lineHeight: 1.4 },
      body1: {
        fontSize: "0.9375rem",
        lineHeight: 1.6,
        letterSpacing: "0.005em",
      },
      body2: { fontSize: "0.875rem", lineHeight: 1.55 },
      caption: {
        fontSize: "0.8125rem",
        lineHeight: 1.5,
        color: palette.text.secondary,
      },
      button: {
        fontWeight: 500,
        fontSize: "0.9375rem",
        textTransform: "none",
        letterSpacing: "0.01em",
      },
    },
    shadows: [
      "none",
      ...Array(24)
        .fill(null)
        .map(() =>
          isDarkMode
            ? "8px 8px 16px rgba(0,0,0,0.5), -8px -8px 16px rgba(60,60,60,0.1)"
            : "8px 8px 16px rgba(163,177,198,0.3), -8px -8px 16px rgba(255,255,255,0.8)",
        ),
    ] as unknown,
  });
}
