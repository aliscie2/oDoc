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
      main: isDarkMode ? "#3b82f6" : "#2563eb",
      light: "#60a5fa",
      dark: "#1e40af",
      contrastText: "#ffffff",
    },
    secondary: {
      main: isDarkMode ? "#8b5cf6" : "#7c3aed",
      contrastText: "#ffffff",
    },
    error: baseColors.error,
    info: baseColors.info,
    success: baseColors.success,
    warning: baseColors.warning,
    background: {
      default: isDarkMode ? "#09090b" : "#ffffff",
      paper: isDarkMode ? "#18181b" : "#fafafa",
    },
    text: {
      primary: isDarkMode ? "#fafafa" : "#09090b",
      secondary: isDarkMode ? "#a1a1aa" : "#52525b",
    },
    divider: isDarkMode ? alpha("#ffffff", 0.1) : alpha("#000000", 0.08),
  };
}

const createComponents = (palette: ReturnType<typeof createPalette>) => {
  const glass = {
    bg: palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.7)",
    border: palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.3)",
    shadow: palette.mode === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)",
  };

  const linkColor = palette.mode === "dark" ? palette.primary.light : "#1d4ed8";
  const linkHoverColor = palette.mode === "dark" ? palette.primary.main : "#1e3a8a";

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
          background: palette.background.default,
        },
        a: {
          color: linkColor,
          textDecoration: "none",
          transition: "color 0.2s ease",
          "&:hover": {
            color: linkHoverColor,
            textDecoration: "underline",
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          background: glass.bg,
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: `1px solid ${glass.border}`,
          borderRadius: 16,
          boxShadow: `0 8px 32px ${glass.shadow}`,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: `0 12px 48px ${glass.shadow}`,
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: "none",
          fontWeight: 600,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          transition: "all 0.2s ease",
        },
        contained: {
          background: palette.primary.main,
          boxShadow: `0 4px 20px ${alpha(palette.primary.main, 0.4)}`,
          border: "none",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: `0 6px 24px ${alpha(palette.primary.main, 0.5)}`,
          },
        },
        outlined: {
          background: glass.bg,
          border: `1px solid ${glass.border}`,
          "&:hover": {
            background: alpha(palette.primary.main, 0.1),
            border: `1px solid ${palette.primary.main}`,
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            background: glass.bg,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: 12,
            "& fieldset": {
              border: `1px solid ${glass.border}`,
            },
            "&:hover fieldset": {
              border: `1px solid ${palette.primary.main}`,
            },
            "&.Mui-focused fieldset": {
              border: `2px solid ${palette.primary.main}`,
              boxShadow: `0 0 0 3px ${alpha(palette.primary.main, 0.1)}`,
            },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          background: glass.bg,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1px solid ${glass.border}`,
          borderRadius: 16,
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          background: glass.bg,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1px solid ${glass.border}`,
          borderRadius: 12,
          transition: "all 0.2s ease",
          "&:hover": {
            background: alpha(palette.primary.main, 0.1),
            transform: "translateY(-2px)",
            boxShadow: `0 4px 12px ${glass.shadow}`,
          },
          "&:active": {
            transform: "scale(0.95)",
          },
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          background: glass.bg,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1px solid ${glass.border}`,
          color: palette.text.primary,
        },
      },
    },

    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: palette.text.secondary,
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          color: linkColor,
          textDecoration: "none",
          transition: "color 0.2s ease",
          "&:hover": {
            color: linkHoverColor,
            textDecoration: "underline",
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
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      button: {
        fontWeight: 600,
        textTransform: "none",
      },
    },
    shadows: [
      "none",
      ...Array(24).fill(null).map((_, i) => 
        `0 ${(i + 1) * 2}px ${(i + 1) * 4}px ${alpha("#000", isDarkMode ? 0.3 : 0.08)}`
      ),
    ] as unknown,
  });
}
