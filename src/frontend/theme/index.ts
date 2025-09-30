import { createTheme as createMuiTheme, alpha } from "@mui/material/styles";

const baseColors = {
  error: { main: "#F04438", contrastText: "#FFFFFF" },
  info: { main: "#06AED4", contrastText: "#FFFFFF" },
  success: { main: "#10B981", contrastText: "#FFFFFF" },
  warning: { main: "#F79009", contrastText: "#FFFFFF" },
  neutral: {
    50: "#FAFBFC",
    100: "#F5F6F8",
    200: "#EAECEF",
    300: "#D6D9DC",
    400: "#9DA4AE",
    500: "#6C737F",
    600: "#4D5761",
    700: "#3A4150",
    800: "#2A2D3A",
    900: "#1A1B23",
    950: "#151620",
  },
};

function createPalette(isDarkMode: boolean) {
  const primary = {
    main: "#2563eb", // Modern blue (slightly deeper than #2196F3)
    light: "#3b82f6",
    dark: "#1d4ed8",
    contrastText: "#fff",
  };

  return {
    mode: (isDarkMode ? "dark" : "light") as "dark" | "light",
    primary,
    secondary: {
      main: isDarkMode ? "#64748b" : "#475569", // Neutral blue-gray
      contrastText: "#fff",
    },
    error: baseColors.error,
    info: baseColors.info,
    success: baseColors.success,
    warning: baseColors.warning,

    background: {
      default: isDarkMode
        ? "#0f172a" // Deep blue-black
        : "#f8fafc", // Cool white
      paper: isDarkMode
        ? alpha("#1e293b", 0.85) // Blue-tinted dark
        : alpha("#ffffff", 0.85),
    },

    text: {
      primary: isDarkMode ? alpha("#f1f5f9", 0.92) : alpha("#0f172a", 0.9),
      secondary: isDarkMode ? alpha("#cbd5e1", 0.72) : alpha("#475569", 0.75),
    },

    divider: alpha(primary.main, 0.12),

    action: {
      hover: alpha(primary.main, 0.04),
      selected: alpha(primary.main, 0.08),
      focus: alpha(primary.main, 0.12),
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
      '@keyframes pulse': {
        '0%, 100%': {
          opacity: 1,
        },
        '50%': {
          opacity: 0.5,
        },
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        background: palette.background.paper,
        backdropFilter: "blur(20px)",
        border: `1px solid ${palette.mode === "dark" ? alpha(palette.divider, 0.5) : "#e2e8f0"}`,
        borderRadius: 16,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 8px 25px ${alpha(palette.primary.main, 0.15)}`,
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
        backdropFilter: "blur(10px)",
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
          backdropFilter: "blur(10px)",
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
        backdropFilter: "blur(10px)",
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
        .map((_, i) =>
          `0 ${(i + 1) * 2}px ${(i + 1) * 4}px ${alpha("#000", isDarkMode ? 0.3 : 0.08)}`
        ),
    ] as any,
  });
}
