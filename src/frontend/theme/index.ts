import { createTheme as createMuiTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

// Enhanced palette with improved morphism support
function createPalette(isDarkMode: boolean) {
  const baseColors = {
    error: {
      lightest: "#FEF3F2",
      light: "#FEE4E2",
      main: "#F04438",
      dark: "#B42318",
      darkest: "#7A271A",
      contrastText: "#FFFFFF",
    },
    primary: isDarkMode
      ? {
          lightest: "#EDE9FE",
          light: "#C4B5FD",
          main: "#8B5CF6",
          dark: "#6D28D9",
          darkest: "#4C1D95",
          contrastText: "#FFFFFF",
        }
      : {
          lightest: "#E3F2F7",
          light: "#AED4E0",
          main: "#19738D",
          dark: "#125867",
          darkest: "#093542",
          contrastText: "#FFFFFF",
        },
    info: {
      lightest: "#ECFDFF",
      light: "#CFF9FE",
      main: "#06AED4",
      dark: "#0E7090",
      darkest: "#164C63",
      contrastText: "#FFFFFF",
    },
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
    success: {
      lightest: "#F0FDF9",
      light: "#3FC79A",
      main: "#10B981",
      dark: "#0B815A",
      darkest: "#134E48",
      contrastText: "#FFFFFF",
    },
    warning: {
      lightest: "#FFFAEB",
      light: "#FEF0C7",
      main: "#F79009",
      dark: "#B54708",
      darkest: "#7A2E0E",
      contrastText: "#FFFFFF",
    },
  };

  if (isDarkMode) {
    return {
      action: {
        active: alpha(baseColors.neutral[300], 0.7),
        disabled: alpha(baseColors.neutral[100], 0.3),
        disabledBackground: alpha(baseColors.neutral[100], 0.08),
        focus: alpha(baseColors.neutral[100], 0.2),
        hover: alpha(baseColors.neutral[100], 0.06),
        selected: alpha(baseColors.neutral[100], 0.15),
      },
      background: {
        default:
          "linear-gradient(135deg, #1a1b23 0%, #2a2d3a 50%, #323644 100%)",
        paper: alpha("#2a2d3a", 0.85),
        alternate: alpha("#242730", 0.9),
        glass:
          "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)",
        blur: alpha("#1f2128", 0.6),
        gradient:
          "linear-gradient(135deg, #1a1b23 0%, #2a2d3a 50%, #323644 100%)",
      },
      divider: alpha("#8B5CF6", 0.15),
      error: baseColors.error,
      info: baseColors.info,
      mode: "dark" as const,
      neutral: baseColors.neutral,
      primary: {
        ...baseColors.primary,
        glass: alpha(baseColors.primary.main, 0.15),
      },
      success: baseColors.success,
      text: {
        primary: alpha("#FFFFFF", 0.92),
        secondary: alpha("#FFFFFF", 0.72),
        disabled: alpha("#FFFFFF", 0.45),
        glass: alpha("#FFFFFF", 0.88),
      },
      warning: baseColors.warning,
      morphism: {
        border: "rgba(255,255,255,0.15)",
        borderHover: "rgba(255,255,255,0.25)",
        borderFocus: alpha("#8B5CF6", 0.4),
        backdrop: alpha("#000000", 0.35),
        glass: {
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)",
          border: "rgba(255,255,255,0.15)",
          shadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          backdropFilter: "blur(20px)",
        },
        neumorphism: {
          light: alpha("#FFFFFF", 0.05),
          dark: alpha("#000000", 0.4),
          inset:
            "inset 2px 2px 8px rgba(0,0,0,0.3), inset -2px -2px 8px rgba(255,255,255,0.05)",
        },
        card: {
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "16px",
          hover: {
            transform: "translateY(-4px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
          },
        },
      },
    };
  } else {
    return {
      action: {
        active: alpha(baseColors.neutral[600], 0.8),
        disabled: alpha(baseColors.neutral[900], 0.3),
        disabledBackground: alpha(baseColors.neutral[900], 0.08),
        focus: alpha(baseColors.neutral[900], 0.2),
        hover: alpha(baseColors.neutral[900], 0.06),
        selected: alpha(baseColors.neutral[900], 0.15),
      },
      background: {
        default:
          "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
        paper: alpha("#f8fafc", 0.85),
        alternate: alpha("#f1f5f9", 0.8),
        glass:
          "linear-gradient(135deg, rgba(248,250,252,0.6) 0%, rgba(241,245,249,0.4) 100%)",
        blur: alpha("#f1f5f9", 0.7),
        gradient:
          "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
      },
      divider: alpha("#19738D", 0.25),
      error: baseColors.error,
      info: baseColors.info,
      mode: "light" as const,
      neutral: baseColors.neutral,
      primary: {
        ...baseColors.primary,
        glass: alpha(baseColors.primary.main, 0.15),
      },
      success: baseColors.success,
      text: {
        primary: alpha(baseColors.neutral[800], 0.9),
        secondary: alpha(baseColors.neutral[600], 0.75),
        disabled: alpha(baseColors.neutral[900], 0.3),
        glass: alpha(baseColors.neutral[800], 0.85),
      },
      warning: baseColors.warning,
      morphism: {
        border: "rgba(203,213,225,0.4)",
        borderHover: "rgba(203,213,225,0.6)",
        borderFocus: alpha("#19738D", 0.5),
        backdrop: alpha("#f8fafc", 0.5),
        glass: {
          background:
            "linear-gradient(135deg, rgba(248,250,252,0.6) 0%, rgba(241,245,249,0.4) 100%)",
          border: "rgba(203,213,225,0.4)",
          shadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          backdropFilter: "blur(20px)",
        },
        neumorphism: {
          light: alpha("#f8fafc", 0.9),
          dark: alpha("#000000", 0.08),
          inset:
            "inset 2px 2px 8px rgba(0,0,0,0.08), inset -2px -2px 8px rgba(248,250,252,0.9)",
        },
        card: {
          background:
            "linear-gradient(135deg, rgba(248,250,252,0.6) 0%, rgba(241,245,249,0.4) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(203,213,225,0.4)",
          borderRadius: "16px",
          hover: {
            transform: "translateY(-4px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
            border: "1px solid rgba(203,213,225,0.6)",
          },
        },
      },
    };
  }
}

// Enhanced shadows for morphism effect with better differentiation
const createShadows = (isDarkMode?: boolean) => {
  const shadowColor = isDarkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.08)";
  const highlightColor = isDarkMode
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(248, 250, 252, 0.9)";
  const accentShadow = isDarkMode
    ? "rgba(139, 92, 246, 0.25)"
    : "rgba(25, 115, 141, 0.15)";

  return [
    "none",
    // Subtle morphism effects
    `inset 0 1px 2px ${highlightColor}, 0 2px 8px ${shadowColor}`,
    `inset 0 1px 3px ${highlightColor}, 0 4px 12px ${shadowColor}`,
    `inset 0 2px 4px ${highlightColor}, 0 6px 16px ${shadowColor}`,
    // Glass-like elevated surfaces with accent
    `inset 0 1px 0 ${highlightColor}, 0 8px 20px ${shadowColor}, 0 4px 8px ${accentShadow}`,
    `inset 0 1px 0 ${highlightColor}, 0 10px 25px ${shadowColor}, 0 5px 10px ${accentShadow}`,
    `inset 0 1px 0 ${highlightColor}, 0 12px 30px ${shadowColor}, 0 6px 12px ${accentShadow}`,
    `inset 0 1px 0 ${highlightColor}, 0 15px 35px ${shadowColor}, 0 7px 14px ${accentShadow}`,
    // More prominent morphism effects
    `inset 0 2px 4px ${highlightColor}, 0 18px 40px ${shadowColor}, 0 8px 16px ${alpha(accentShadow, 0.5)}`,
    `inset 0 2px 4px ${highlightColor}, 0 20px 45px ${shadowColor}, 0 10px 18px ${alpha(accentShadow, 0.5)}`,
    `inset 0 2px 6px ${highlightColor}, 0 22px 50px ${shadowColor}, 0 12px 20px ${alpha(accentShadow, 0.5)}`,
    `inset 0 2px 6px ${highlightColor}, 0 25px 55px ${shadowColor}, 0 14px 22px ${alpha(accentShadow, 0.5)}`,
    // Deep morphism for modals/overlays
    `inset 0 3px 8px ${highlightColor}, 0 28px 60px ${shadowColor}, 0 16px 24px ${alpha(accentShadow, 0.4)}`,
    `inset 0 3px 8px ${highlightColor}, 0 30px 65px ${shadowColor}, 0 18px 26px ${alpha(accentShadow, 0.4)}`,
    `inset 0 3px 10px ${highlightColor}, 0 32px 70px ${shadowColor}, 0 20px 28px ${alpha(accentShadow, 0.4)}`,
    `inset 0 4px 12px ${highlightColor}, 0 35px 75px ${shadowColor}, 0 22px 30px ${alpha(accentShadow, 0.4)}`,
    // Ultra-elevated surfaces with premium feel
    `inset 0 4px 12px ${highlightColor}, 0 38px 80px ${shadowColor}, 0 24px 32px ${alpha(accentShadow, 0.3)}`,
    `inset 0 4px 14px ${highlightColor}, 0 40px 85px ${shadowColor}, 0 26px 34px ${alpha(accentShadow, 0.3)}`,
    `inset 0 5px 16px ${highlightColor}, 0 42px 90px ${shadowColor}, 0 28px 36px ${alpha(accentShadow, 0.3)}`,
    `inset 0 5px 16px ${highlightColor}, 0 45px 95px ${shadowColor}, 0 30px 38px ${alpha(accentShadow, 0.3)}`,
    `inset 0 5px 18px ${highlightColor}, 0 48px 100px ${shadowColor}, 0 32px 40px ${alpha(accentShadow, 0.3)}`,
    `inset 0 6px 20px ${highlightColor}, 0 50px 105px ${shadowColor}, 0 34px 42px ${alpha(accentShadow, 0.3)}`,
    `inset 0 6px 20px ${highlightColor}, 0 52px 110px ${shadowColor}, 0 36px 44px ${alpha(accentShadow, 0.3)}`,
    `inset 0 6px 22px ${highlightColor}, 0 55px 115px ${shadowColor}, 0 38px 46px ${alpha(accentShadow, 0.3)}`,
    `inset 0 7px 24px ${highlightColor}, 0 58px 120px ${shadowColor}, 0 40px 48px ${alpha(accentShadow, 0.3)}`,
  ];
};

const createTypography = () => {
  return {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.57,
    },
    button: {
      fontSize: "0.875rem",
      fontWeight: 600,
      lineHeight: 1.75,
      letterSpacing: "0.02em",
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.66,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.75,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.57,
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.5px",
      lineHeight: 2.5,
      textTransform: "uppercase" as const,
    },
    h1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: "2.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: "1.75rem",
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.5,
    },
    h5: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.6,
    },
    h6: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.75,
    },
  };
};

// Enhanced components with advanced morphism styling
const createComponents = ({ palette }: { palette: any }) => {
  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100vh",
          background: palette.background.gradient,
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: palette.morphism.card.background,
          backdropFilter: palette.morphism.card.backdropFilter,
          WebkitBackdropFilter: palette.morphism.card.backdropFilter,
          border: palette.morphism.card.border,
          borderRadius: palette.morphism.card.borderRadius,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          "&:hover": palette.morphism.card.hover,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: palette.morphism.glass.background,
          backdropFilter: palette.morphism.glass.backdropFilter,
          WebkitBackdropFilter: palette.morphism.glass.backdropFilter,
          border: `1px solid ${palette.morphism.border}`,
          borderRadius: 16,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        elevation0: {
          background: "transparent",
          border: "none",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
        },
        elevation1: {
          background: palette.morphism.glass.background,
          boxShadow: palette.morphism.glass.shadow,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          fontWeight: 600,
          letterSpacing: "0.02em",
          textTransform: "none",
          "&:hover": {
            transform: "translateY(-2px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        contained: {
          background: `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.dark})`,
          border: `1px solid ${alpha(palette.primary.light, 0.2)}`,
          boxShadow: `0 4px 15px ${alpha(palette.primary.main, 0.3)}`,
          "&:hover": {
            background: `linear-gradient(135deg, ${palette.primary.light}, ${palette.primary.main})`,
            boxShadow: `0 8px 25px ${alpha(palette.primary.main, 0.4)}`,
            border: `1px solid ${alpha(palette.primary.light, 0.4)}`,
          },
          "&:active": {
            background: `linear-gradient(135deg, ${palette.primary.dark}, ${palette.primary.darkest})`,
          },
        },
        outlined: {
          background: palette.morphism.glass.background,
          border: `1px solid ${palette.morphism.border}`,
          "&:hover": {
            background: alpha(palette.primary.main, 0.08),
            border: `1px solid ${palette.morphism.borderHover}`,
            boxShadow: `0 4px 15px ${alpha(palette.primary.main, 0.2)}`,
          },
        },
        text: {
          "&:hover": {
            background: alpha(palette.primary.main, 0.04),
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            background: palette.morphism.glass.background,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: 16,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              border: `1px solid ${palette.morphism.border}`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            },
            "&:hover": {
              "& fieldset": {
                border: `1px solid ${palette.morphism.borderHover}`,
              },
            },
            "&.Mui-focused": {
              transform: "translateY(-1px)",
              boxShadow: `0 8px 25px ${alpha(palette.primary.main, 0.2)}`,
              "& fieldset": {
                border: `2px solid ${palette.primary.main}`,
                boxShadow: `0 0 0 4px ${alpha(palette.primary.main, 0.1)}`,
              },
            },
            "&.Mui-error fieldset": {
              border: `1px solid ${palette.error.main}`,
            },
            "&.Mui-error.Mui-focused fieldset": {
              border: `2px solid ${palette.error.main}`,
              boxShadow: `0 0 0 4px ${alpha(palette.error.main, 0.1)}`,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: palette.morphism.glass.background,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: `1px solid ${palette.morphism.border}`,
          borderRadius: 24,
          boxShadow: `0 25px 60px ${alpha(palette.mode === "dark" ? "#000000" : "#000000", 0.3)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: palette.morphism.glass.background,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "none",
          borderBottom: `1px solid ${palette.morphism.border}`,
          boxShadow: `0 4px 20px ${alpha(palette.mode === "dark" ? "#000000" : "#000000", 0.1)}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: palette.morphism.glass.background,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: `1px solid ${palette.morphism.border}`,
          boxShadow: `0 10px 40px ${alpha(palette.mode === "dark" ? "#000000" : "#000000", 0.2)}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: palette.morphism.glass.background,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1px solid ${palette.morphism.border}`,
          borderRadius: 24,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: `0 4px 15px ${alpha(palette.primary.main, 0.2)}`,
          },
        },
        filled: {
          background: `linear-gradient(135deg, ${alpha(palette.primary.main, 0.15)}, ${alpha(palette.primary.main, 0.08)})`,
          color: palette.text.primary,
          border: `1px solid ${alpha(palette.primary.main, 0.3)}`,
          "& .MuiChip-deleteIcon": {
            color: palette.text.secondary,
            "&:hover": {
              color: palette.text.primary,
            },
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          background: palette.morphism.glass.background,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${palette.morphism.border}`,
          borderRadius: 16,
          boxShadow: `0 10px 40px ${alpha(palette.mode === "dark" ? "#000000" : "#000000", 0.2)}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: palette.morphism.glass.background,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${palette.morphism.border}`,
          color: palette.text.primary,
          borderRadius: 12,
          boxShadow: `0 4px 20px ${alpha(palette.mode === "dark" ? "#000000" : "#000000", 0.2)}`,
        },
      },
      defaultProps: {
        TransitionProps: {
          timeout: {
            enter: 250,
            exit: 200,
          },
        },
        enterDelay: 500,
        leaveDelay: 0,
      },
    },
    MuiSwitch: {
      styleOverrides: {
        track: {
          background: palette.morphism.glass.background,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `1px solid ${palette.morphism.border}`,
        },
        thumb: {
          background: `linear-gradient(135deg, ${palette.primary.main}, ${palette.primary.dark})`,
          boxShadow: `0 2px 8px ${alpha(palette.primary.main, 0.3)}`,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        track: {
          background: `linear-gradient(90deg, ${palette.primary.main}, ${palette.primary.dark})`,
          border: "none",
        },
        thumb: {
          background: palette.morphism.glass.background,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: `2px solid ${palette.primary.main}`,
          boxShadow: `0 4px 15px ${alpha(palette.primary.main, 0.3)}`,
          "&:hover, &.Mui-focusVisible": {
            boxShadow: `0 0 0 8px ${alpha(palette.primary.main, 0.1)}`,
          },
        },
      },
    },
  };
};

// Main theme creation function with enhanced morphism
export function createTheme(isDarkMode: boolean) {
  const palette = createPalette(isDarkMode);
  const components = createComponents({ palette });
  const shadows = createShadows(isDarkMode);
  const typography = createTypography();

  return createMuiTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1440,
      },
    },
    components,
    palette,
    shadows,
    shape: {
      borderRadius: 16, // Increased for more modern morphism look
    },
    typography,
  });
}
