import { createTheme as createMuiTheme, alpha } from "@mui/material/styles";

const baseColors = {
  error: { main: "#ef4444", contrastText: "#FFFFFF" },
  info: { main: "#06b6d4", contrastText: "#FFFFFF" },
  success: { main: "#22c55e", contrastText: "#FFFFFF" },
  warning: { main: "#f59e0b", contrastText: "#FFFFFF" },
  neutral: {
    50: "#fafafa",
    100: "#f4f4f5",
    200: "#e4e4e7",
    300: "#d4d4d8",
    400: "#a1a1aa",
    500: "#71717a",
    600: "#52525b",
    700: "#3f3f46",
    800: "#27272a",
    900: "#18181b",
    950: "#09090b",
  },
  // Neo accent colors
  neon: {
    cyan: "#00ffff",
    magenta: "#ff00ff",
    yellow: "#ffff00",
    green: "#00ff00",
  },
};

function createPalette(isDarkMode: boolean) {
  const primary = {
    main: isDarkMode ? "#3b82f6" : "#2563eb", // Brighter blue for dark mode
    light: "#60a5fa",
    dark: "#1e40af",
    contrastText: "#ffffff",
  };

  return {
    mode: (isDarkMode ? "dark" : "light") as "dark" | "light",
    primary,
    secondary: {
      main: isDarkMode ? "#8b5cf6" : "#7c3aed", // Purple accent
      contrastText: "#ffffff",
    },
    error: baseColors.error,
    info: baseColors.info,
    success: baseColors.success,
    warning: baseColors.warning,

    background: {
      default: isDarkMode
        ? "#09090b" // True black with slight warmth
        : "#ffffff", // Pure white
      paper: isDarkMode
        ? "#18181b" // Dark gray with high contrast
        : "#fafafa", // Off-white
    },

    text: {
      primary: isDarkMode ? "#fafafa" : "#09090b", // High contrast
      secondary: isDarkMode ? "#a1a1aa" : "#52525b", // Medium contrast
    },

    divider: isDarkMode ? alpha("#ffffff", 0.1) : alpha("#000000", 0.08),

    // Link colors
    link: {
      main: isDarkMode ? "#60a5fa" : "#1e40af", // Light blue for dark mode, dark blue for light mode
      hover: isDarkMode ? "#93c5fd" : "#1e3a8a",
    },

    action: {
      hover: isDarkMode ? alpha("#ffffff", 0.08) : alpha("#000000", 0.04),
      selected: isDarkMode
        ? alpha(primary.main, 0.16)
        : alpha(primary.main, 0.08),
      focus: isDarkMode ? alpha(primary.main, 0.24) : alpha(primary.main, 0.12),
    },
  };
}

const createComponents = (palette: ReturnType<typeof createPalette>) => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        minHeight: "100vh",
        background: palette.background.default,
      },
      a: {
        color: palette.mode === "dark" ? "#60a5fa" : "#1e40af",
        textDecoration: "none",
        transition: "color 0.2s ease",
        "&:hover": {
          color: palette.mode === "dark" ? "#93c5fd" : "#1e3a8a",
          textDecoration: "underline",
        },
      },
      "@keyframes pulse": {
        "0%, 100%": {
          opacity: 1,
        },
        "50%": {
          opacity: 0.5,
        },
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        background: palette.background.paper,
        border:
          palette.mode === "dark"
            ? `1px solid ${alpha("#ffffff", 0.1)}`
            : `1px solid ${alpha("#000000", 0.08)}`,
        borderRadius: 16,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            palette.mode === "dark"
              ? `0 8px 32px ${alpha(palette.primary.main, 0.3)}, 0 0 0 1px ${alpha(palette.primary.main, 0.2)}`
              : `0 8px 25px ${alpha(palette.primary.main, 0.15)}`,
          borderColor:
            palette.mode === "dark"
              ? alpha(palette.primary.main, 0.3)
              : alpha(palette.primary.main, 0.2),
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
        transition: "all 0.3s ease",
      },
      contained: {
        background: `linear-gradient(135deg, ${palette.primary.main}, ${alpha(palette.primary.main, 0.8)})`,
        boxShadow: `0 4px 15px ${alpha(palette.primary.main, 0.3)}`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 25px ${alpha(palette.primary.main, 0.4)}`,
        },
      },
      outlined: {
        background:
          palette.mode === "dark" ? palette.background.paper : "#ffffff",
        border: `1px solid ${palette.mode === "dark" ? alpha(palette.divider, 0.5) : "#d1d5db"}`,
        "&:hover": {
          background: alpha(palette.primary.main, 0.08),
          border: `1px solid ${palette.primary.main}`,
        },
      },
    },
  },

  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          background:
            palette.mode === "dark" ? palette.background.paper : "#ffffff",
          borderRadius: 12,
          "& fieldset": {
            border: `1px solid ${palette.mode === "dark" ? alpha(palette.divider, 0.5) : "#d1d5db"}`,
          },
          "&:hover fieldset": {
            border: `1px solid ${palette.primary.main}`,
          },
          "&.Mui-focused fieldset": {
            border: `2px solid ${palette.primary.main}`,
            boxShadow: `0 0 0 4px ${alpha(palette.primary.main, 0.1)}`,
          },
        },
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: `0 4px 15px ${alpha(palette.primary.main, 0.2)}`,
        },
      },
      filled: {
        background:
          palette.mode === "dark" ? palette.background.paper : "#f1f5f9",
        color: palette.text.primary,
        border: `1px solid ${palette.mode === "dark" ? alpha(palette.divider, 0.5) : "#d1d5db"}`,
      },
      outlined: {
        background: "transparent",
        color: palette.text.primary,
        border: `1px solid ${palette.mode === "dark" ? alpha(palette.divider, 0.5) : "#d1d5db"}`,
      },
    },
  },

  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor:
          palette.mode === "dark"
            ? baseColors.neutral[700]
            : baseColors.neutral[200],
        color:
          palette.mode === "dark"
            ? baseColors.neutral[300]
            : baseColors.neutral[600],
      },
    },
  },

  MuiIconButton: {
    styleOverrides: {
      root: {
        color:
          palette.mode === "dark"
            ? palette.text.secondary
            : baseColors.neutral[500],
        "&:hover": {
          backgroundColor: alpha(palette.primary.main, 0.08),
        },
      },
    },
  },

  MuiLink: {
    styleOverrides: {
      root: {
        color: palette.mode === "dark" ? "#60a5fa" : "#1e40af",
        textDecoration: "none",
        transition: "color 0.2s ease",
        "&:hover": {
          color: palette.mode === "dark" ? "#93c5fd" : "#1e3a8a",
          textDecoration: "underline",
        },
      },
    },
  },
});

export function createTheme(isDarkMode: boolean) {
  const palette = createPalette(isDarkMode);

  return createMuiTheme({
    palette,
    components: createComponents(palette),
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      button: {
        fontWeight: 600,
        textTransform: "none",
      },
    },
    shadows: [
      "none",
      ...Array(24)
        .fill(null)
        .map(
          (_, i) =>
            `0 ${(i + 1) * 2}px ${(i + 1) * 4}px ${alpha("#000", isDarkMode ? 0.3 : 0.08)}`,
        ),
    ] as unknown,
  });
}
