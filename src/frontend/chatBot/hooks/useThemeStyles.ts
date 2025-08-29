import { useTheme } from "@mui/material";
import { ThemeStyles } from "../types";

export const useThemeStyles = (): ThemeStyles => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return {
    theme,
    isDark,
    chatBg: theme.palette.background.paper,
    borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
    shadowColor: isDark
      ? "0 8px 32px rgba(0,0,0,0.4)"
      : "0 8px 32px rgba(0,0,0,0.12)",
  };
};
