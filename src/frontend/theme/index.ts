import { createTheme as createMuiTheme } from "@mui/material/styles";

export function createTheme(isDarkMode: boolean) {
  const mode = isDarkMode ? "dark" : "light";

  return createMuiTheme({
    palette: {
      mode,
      // Primary color matching landing page accent
      primary: {
        main: mode === "light" ? "#171717" : "#fafafa",
        light: mode === "light" ? "#262626" : "#ffffff",
        dark: mode === "light" ? "#0a0a0a" : "#e5e5e5",
        contrastText: mode === "light" ? "#ffffff" : "#171717",
      },
      // Secondary color for accents
      secondary: {
        main: mode === "light" ? "#525252" : "#a3a3a3",
        light: mode === "light" ? "#737373" : "#d4d4d4",
        dark: mode === "light" ? "#404040" : "#737373",
        contrastText: mode === "light" ? "#ffffff" : "#171717",
      },
      // Background colors matching landing page
      background: {
        default: mode === "light" ? "#ffffff" : "#0a0a0a",
        paper: mode === "light" ? "#fafafa" : "#171717",
      },
      // Divider colors
      divider: mode === "light" ? "#e5e5e5" : "#404040",
      // Text colors matching landing page
      text: {
        primary: mode === "light" ? "#171717" : "#fafafa",
        secondary: mode === "light" ? "#525252" : "#a3a3a3",
        disabled: mode === "light" ? "#737373" : "#737373",
      },
      // Action states
      action: {
        active: mode === "light" ? "#171717" : "#fafafa",
        hover:
          mode === "light"
            ? "rgba(23, 23, 23, 0.04)"
            : "rgba(250, 250, 250, 0.08)",
        selected:
          mode === "light"
            ? "rgba(23, 23, 23, 0.08)"
            : "rgba(250, 250, 250, 0.12)",
        disabled:
          mode === "light"
            ? "rgba(23, 23, 23, 0.26)"
            : "rgba(250, 250, 250, 0.3)",
        disabledBackground:
          mode === "light"
            ? "rgba(23, 23, 23, 0.12)"
            : "rgba(250, 250, 250, 0.12)",
        focus:
          mode === "light"
            ? "rgba(23, 23, 23, 0.12)"
            : "rgba(250, 250, 250, 0.12)",
      },
      // Success, error, warning, info colors
      success: {
        main: mode === "light" ? "#22c55e" : "#4ade80",
        light: mode === "light" ? "#86efac" : "#bbf7d0",
        dark: mode === "light" ? "#16a34a" : "#22c55e",
      },
      error: {
        main: mode === "light" ? "#ef4444" : "#f87171",
        light: mode === "light" ? "#fca5a5" : "#fecaca",
        dark: mode === "light" ? "#dc2626" : "#ef4444",
      },
      warning: {
        main: mode === "light" ? "#f59e0b" : "#fbbf24",
        light: mode === "light" ? "#fcd34d" : "#fde68a",
        dark: mode === "light" ? "#d97706" : "#f59e0b",
      },
      info: {
        main: mode === "light" ? "#3b82f6" : "#60a5fa",
        light: mode === "light" ? "#93c5fd" : "#bfdbfe",
        dark: mode === "light" ? "#2563eb" : "#3b82f6",
      },
    },

    typography: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
      fontSize: 14,
      h1: {
        fontSize: "3.75rem",
        fontWeight: 700,
        lineHeight: 1.2,
        "@media (max-width:1024px)": { fontSize: "3rem" },
        "@media (max-width:768px)": { fontSize: "2.25rem" },
      },
      h2: {
        fontSize: "2.25rem",
        fontWeight: 700,
        lineHeight: 1.3,
        "@media (max-width:768px)": { fontSize: "1.875rem" },
      },
      h3: {
        fontSize: "1.875rem",
        fontWeight: 600,
        lineHeight: 1.4,
        "@media (max-width:768px)": { fontSize: "1.5rem" },
      },
      h4: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
      h5: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.5 },
      h6: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.5 },
      body1: { fontSize: "1rem", lineHeight: 1.5 },
      body2: { fontSize: "0.875rem", lineHeight: 1.5 },
      button: { fontSize: "0.875rem", fontWeight: 500, textTransform: "none" },
      caption: { fontSize: "0.75rem", lineHeight: 1.5 },
      overline: {
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      },
    },

    shape: {
      borderRadius: 8, // Matching --radius-md (0.5rem)
    },

    spacing: 4, // Base spacing unit (4px)

    shadows: [
      "none",
      mode === "light"
        ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
        : "0 1px 2px 0 rgba(0, 0, 0, 0.3)", // sm
      mode === "light"
        ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        : "0 4px 6px -1px rgba(0, 0, 0, 0.4)", // md
      mode === "light"
        ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
        : "0 10px 15px -3px rgba(0, 0, 0, 0.5)", // lg
      mode === "light"
        ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
        : "0 20px 25px -5px rgba(0, 0, 0, 0.5)", // xl
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
      "none",
    ],

    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
        easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
        easeIn: "cubic-bezier(0.4, 0, 1, 1)",
        sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
        defaultProps: {
          elevation: 0,
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: mode === "light" ? "#fafafa" : "#171717",
            border:
              mode === "light" ? "1px solid #e5e5e5" : "1px solid #404040",
            boxShadow:
              mode === "light"
                ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                : "0 2px 4px 0 rgba(0, 0, 0, 0.3)",
            transition: "all 300ms ease",
            "&:hover": {
              borderColor: mode === "light" ? "#d4d4d4" : "#525252",
              boxShadow:
                mode === "light"
                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  : "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "0.5rem",
            textTransform: "none",
            fontWeight: 500,
            transition: "all 150ms ease",
            "&:focus-visible": {
              outline: `2px solid ${mode === "light" ? "#171717" : "#fafafa"}`,
              outlineOffset: "2px",
            },
          },
          contained: {
            backgroundColor: mode === "light" ? "#171717" : "#fafafa",
            color: mode === "light" ? "#ffffff" : "#171717",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            "&:hover": {
              backgroundColor: mode === "light" ? "#262626" : "#e5e5e5",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
            "&:active": {
              backgroundColor: mode === "light" ? "#0a0a0a" : "#d4d4d4",
            },
          },
          outlined: {
            borderColor: mode === "light" ? "#e5e5e5" : "#404040",
            color: mode === "light" ? "#171717" : "#fafafa",
            "&:hover": {
              borderColor: mode === "light" ? "#a3a3a3" : "#737373",
              backgroundColor:
                mode === "light"
                  ? "rgba(23, 23, 23, 0.04)"
                  : "rgba(250, 250, 250, 0.08)",
            },
          },
          text: {
            color: mode === "light" ? "#171717" : "#fafafa",
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(23, 23, 23, 0.04)"
                  : "rgba(250, 250, 250, 0.08)",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: "0.5rem",
            transition: "all 150ms ease",
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(23, 23, 23, 0.04)"
                  : "rgba(250, 250, 250, 0.08)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.5rem",
              backgroundColor: mode === "light" ? "#ffffff" : "#0a0a0a",
              transition: "all 150ms ease",
              "& fieldset": {
                borderColor: mode === "light" ? "#e5e5e5" : "#404040",
              },
              "&:hover fieldset": {
                borderColor: mode === "light" ? "#a3a3a3" : "#737373",
              },
              "&.Mui-focused fieldset": {
                borderColor: mode === "light" ? "#171717" : "#fafafa",
                borderWidth: "2px",
              },
            },
          },
        },
      },
      MuiInput: {
        styleOverrides: {
          root: {
            "&:before": {
              borderBottomColor: mode === "light" ? "#e5e5e5" : "#404040",
            },
            "&:hover:not(.Mui-disabled):before": {
              borderBottomColor: mode === "light" ? "#a3a3a3" : "#737373",
            },
            "&.Mui-focused:after": {
              borderBottomColor: mode === "light" ? "#171717" : "#fafafa",
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: mode === "light" ? "#171717" : "#fafafa",
            textDecoration: "none",
            transition: "all 150ms ease",
            "&:hover": {
              color: mode === "light" ? "#525252" : "#e5e5e5",
              textDecoration: "underline",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: "0.375rem",
            fontWeight: 500,
          },
          filled: {
            backgroundColor: mode === "light" ? "#f5f5f5" : "#262626",
            color: mode === "light" ? "#171717" : "#fafafa",
          },
          outlined: {
            borderColor: mode === "light" ? "#e5e5e5" : "#404040",
            color: mode === "light" ? "#171717" : "#fafafa",
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            borderRadius: "0.375rem",
            fontWeight: 500,
            fontSize: "0.75rem",
            padding: "0 0.375rem",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === "light" ? "#171717" : "#fafafa",
            color: mode === "light" ? "#ffffff" : "#171717",
            fontSize: "0.75rem",
            borderRadius: "0.375rem",
            padding: "0.375rem 0.75rem",
            boxShadow:
              mode === "light"
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                : "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
          },
          arrow: {
            color: mode === "light" ? "#171717" : "#fafafa",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "0.75rem",
            backgroundColor: mode === "light" ? "#ffffff" : "#171717",
            backgroundImage: "none",
            boxShadow:
              mode === "light"
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                : "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: "0.5rem",
            backgroundColor: mode === "light" ? "#ffffff" : "#171717",
            border:
              mode === "light" ? "1px solid #e5e5e5" : "1px solid #404040",
            boxShadow:
              mode === "light"
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
            marginTop: "0.25rem",
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: "0.375rem",
            margin: "0.125rem 0.25rem",
            transition: "all 150ms ease",
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(23, 23, 23, 0.04)"
                  : "rgba(250, 250, 250, 0.08)",
            },
            "&.Mui-selected": {
              backgroundColor:
                mode === "light"
                  ? "rgba(23, 23, 23, 0.08)"
                  : "rgba(250, 250, 250, 0.12)",
              "&:hover": {
                backgroundColor:
                  mode === "light"
                    ? "rgba(23, 23, 23, 0.12)"
                    : "rgba(250, 250, 250, 0.16)",
              },
            },
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            padding: "0.25rem",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: "0.5rem",
            transition: "all 150ms ease",
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(23, 23, 23, 0.04)"
                  : "rgba(250, 250, 250, 0.08)",
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: "0.5rem",
            transition: "all 150ms ease",
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(23, 23, 23, 0.04)"
                  : "rgba(250, 250, 250, 0.08)",
            },
            "&.Mui-selected": {
              backgroundColor:
                mode === "light"
                  ? "rgba(23, 23, 23, 0.08)"
                  : "rgba(250, 250, 250, 0.12)",
              "&:hover": {
                backgroundColor:
                  mode === "light"
                    ? "rgba(23, 23, 23, 0.12)"
                    : "rgba(250, 250, 250, 0.16)",
              },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === "light" ? "#e5e5e5" : "#404040",
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
          },
          switchBase: {
            padding: 1,
            "&.Mui-checked": {
              transform: "translateX(16px)",
              color: "#fff",
              "& + .MuiSwitch-track": {
                backgroundColor: mode === "light" ? "#171717" : "#fafafa",
                opacity: 1,
              },
            },
          },
          thumb: {
            width: 24,
            height: 24,
          },
          track: {
            borderRadius: 13,
            backgroundColor: mode === "light" ? "#e5e5e5" : "#404040",
            opacity: 1,
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: mode === "light" ? "#e5e5e5" : "#404040",
            "&.Mui-checked": {
              color: mode === "light" ? "#171717" : "#fafafa",
            },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: mode === "light" ? "#e5e5e5" : "#404040",
            "&.Mui-checked": {
              color: mode === "light" ? "#171717" : "#fafafa",
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            color: mode === "light" ? "#171717" : "#fafafa",
          },
          thumb: {
            "&:hover, &.Mui-focusVisible": {
              boxShadow:
                mode === "light"
                  ? "0 0 0 8px rgba(23, 23, 23, 0.16)"
                  : "0 0 0 8px rgba(250, 250, 250, 0.16)",
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: "9999px",
            backgroundColor: mode === "light" ? "#e5e5e5" : "#404040",
          },
          bar: {
            borderRadius: "9999px",
            backgroundColor: mode === "light" ? "#171717" : "#fafafa",
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: mode === "light" ? "#171717" : "#fafafa",
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: "0.5rem",
            border: mode === "light" ? "1px solid" : "1px solid",
          },
          standardSuccess: {
            backgroundColor: mode === "light" ? "#f0fdf4" : "#14532d",
            color: mode === "light" ? "#166534" : "#bbf7d0",
            borderColor: mode === "light" ? "#86efac" : "#22c55e",
          },
          standardError: {
            backgroundColor: mode === "light" ? "#fef2f2" : "#7f1d1d",
            color: mode === "light" ? "#dc2626" : "#fecaca",
            borderColor: mode === "light" ? "#fca5a5" : "#ef4444",
          },
          standardWarning: {
            backgroundColor: mode === "light" ? "#fffbeb" : "#78350f",
            color: mode === "light" ? "#d97706" : "#fde68a",
            borderColor: mode === "light" ? "#fcd34d" : "#f59e0b",
          },
          standardInfo: {
            backgroundColor: mode === "light" ? "#eff6ff" : "#1e3a8a",
            color: mode === "light" ? "#2563eb" : "#bfdbfe",
            borderColor: mode === "light" ? "#93c5fd" : "#3b82f6",
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            borderRadius: "0.5rem",
            border:
              mode === "light" ? "1px solid #e5e5e5" : "1px solid #404040",
            backgroundColor: mode === "light" ? "#fafafa" : "#171717",
            boxShadow: "none",
            "&:before": {
              display: "none",
            },
            "&.Mui-expanded": {
              margin: 0,
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            borderBottom:
              mode === "light" ? "1px solid #e5e5e5" : "1px solid #404040",
          },
          indicator: {
            backgroundColor: mode === "light" ? "#171717" : "#fafafa",
            height: 2,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            color: mode === "light" ? "#737373" : "#737373",
            "&.Mui-selected": {
              color: mode === "light" ? "#171717" : "#fafafa",
            },
            "&:hover": {
              color: mode === "light" ? "#525252" : "#a3a3a3",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom:
              mode === "light" ? "1px solid #e5e5e5" : "1px solid #404040",
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === "light" ? "#f5f5f5" : "#262626",
          },
        },
      },
      MuiPagination: {
        styleOverrides: {
          root: {
            "& .MuiPaginationItem-root": {
              borderRadius: "0.375rem",
              color: mode === "light" ? "#171717" : "#fafafa",
              "&.Mui-selected": {
                backgroundColor: mode === "light" ? "#171717" : "#fafafa",
                color: mode === "light" ? "#ffffff" : "#171717",
              },
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "light" ? "#f5f5f5" : "#262626",
            color: mode === "light" ? "#737373" : "#a3a3a3",
            border:
              mode === "light" ? "2px solid #e5e5e5" : "2px solid #404040",
          },
        },
      },
    },
  });
}
