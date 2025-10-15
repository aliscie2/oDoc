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
      main: isDarkMode ? "#60a5fa" : "#2563eb",
      light: isDarkMode ? "#93c5fd" : "#60a5fa",
      dark: isDarkMode ? "#3b82f6" : "#1e40af",
      contrastText: isDarkMode ? "#000000" : "#ffffff",
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
  default: isDarkMode ? "#0a0a0a" : "#f8f9fa",  // Off-white background
  paper: isDarkMode ? "#1a1a1a" : "#ffffff",     // Pure white cards
  header: isDarkMode ? "#161616" : "#f5f5f5",
},
    text: {
      primary: isDarkMode ? "#fafafa" : "#0a0a0a",
      secondary: isDarkMode ? "#a3a3a3" : "#525252",
      disabled: isDarkMode ? "#525252" : "#a3a3a3",
    },
    divider: isDarkMode ? alpha("#ffffff", 0.12) : alpha("#000000", 0.08),
    action: {
      hover: isDarkMode ? alpha("#ffffff", 0.08) : alpha("#000000", 0.04),
      selected: isDarkMode ? alpha("#ffffff", 0.12) : alpha("#000000", 0.08),
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
      border: `1px solid ${isDark ? palette.divider : alpha("#000000", 0.12)}`,
      borderRadius: 12,
      boxShadow: isDark 
        ? "0 2px 8px rgba(0,0,0,0.4)" 
        : "0 1px 3px rgba(0,0,0,0.12)",
      transition: "all 0.2s ease",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: isDark 
          ? "0 4px 16px rgba(0,0,0,0.5)" 
          : "0 2px 8px rgba(0,0,0,0.15)",
      },
    },
  },
},

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "8px 16px",
          transition: "all 0.2s ease",
        },
        contained: {
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          boxShadow: "none",
          "&:hover": {
            backgroundColor: palette.primary.dark,
            boxShadow: `0 4px 12px ${alpha(palette.primary.main, 0.3)}`,
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        outlined: {
          borderColor: palette.divider,
          "&:hover": {
            borderColor: palette.primary.main,
            backgroundColor: alpha(palette.primary.main, 0.08),
          },
        },
        text: {
          "&:hover": {
            backgroundColor: palette.action.hover,
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: palette.background.paper,
            borderRadius: 8,
            transition: "all 0.2s ease",
            "& fieldset": {
              borderColor: palette.divider,
              transition: "border-color 0.2s ease",
            },
            "&:hover fieldset": {
              borderColor: palette.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: palette.primary.main,
              borderWidth: "2px",
            },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: "0.8125rem",
          height: "28px",
        },
        filled: {
          "&:hover": {
            opacity: 0.9,
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: palette.action.hover,
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        },
      },
    },

    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          border: `1px solid ${palette.divider}`,
          textTransform: "none",
          fontWeight: 500,
          "&.Mui-selected": {
            backgroundColor: palette.primary.main,
            color: palette.primary.contrastText,
            borderColor: palette.primary.main,
            "&:hover": {
              backgroundColor: palette.primary.dark,
            },
          },
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.action.selected,
          color: palette.text.primary,
          fontWeight: 600,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: palette.divider,
        },
      },
    },

    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: palette.background.paper,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          transition: "background-color 0.2s ease",
          "&:hover": {
            backgroundColor: palette.action.hover,
          },
          "&.Mui-selected": {
            backgroundColor: palette.action.selected,
            "&:hover": {
              backgroundColor: alpha(palette.primary.main, 0.12),
            },
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
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: 14,
      fontWeightLight: 300,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: { fontSize: "2.5rem", fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.3 },
      h3: { fontSize: "1.75rem", fontWeight: 600, lineHeight: 1.3 },
      h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
      h6: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 },
      body1: { fontSize: "0.875rem", lineHeight: 1.5 },
      body2: { fontSize: "0.8125rem", lineHeight: 1.5 },
      caption: { fontSize: "0.75rem", lineHeight: 1.4, color: palette.text.secondary },
      button: { fontWeight: 600, fontSize: "0.875rem", textTransform: "none", letterSpacing: "0.01em" },
    },
    shadows: [
      "none",
      ...Array(24).fill(null).map((_, i) => {
        const elevation = (i + 1) * 2;
        return `0 ${elevation}px ${elevation * 2}px ${alpha("#000", isDarkMode ? 0.4 : 0.08)}`;
      }),
    ] as unknown,
  });
}