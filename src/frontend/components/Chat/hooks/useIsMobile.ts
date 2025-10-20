import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Custom hook to detect if the current viewport is mobile size
 * @param breakpoint - The breakpoint to use for mobile detection (default: "sm")
 * @returns boolean indicating if the current viewport is mobile
 */
export const useIsMobile = (breakpoint: "xs" | "sm" | "md" = "sm"): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down(breakpoint));
};
