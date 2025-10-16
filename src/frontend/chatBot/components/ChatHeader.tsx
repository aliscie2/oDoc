import { Close, WorkOutline } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useThemeStyles } from "../hooks/useThemeStyles";
import AICreditsComponent from "./AICreditsCompnent";

interface ChatHeaderProps {
  assistantName: string;
  chatHistoryLength: number;
  credits: number;
  isLoading: boolean;
  onMinimize: () => void;
}

export const ChatHeader = ({
  assistantName,
  chatHistoryLength,
  credits,
  isLoading,
  onMinimize,
}: ChatHeaderProps) => {
  const { theme, isDark } = useThemeStyles();
  const location = useLocation();

  const getTitleConfig = () => {
    const path = location.pathname.toLowerCase();
    
    if (path === "" || path === "/") {
      return {  text: "Hiring Intelligence" };
    } else if (path.includes("calendar")) {
      return { text: "Calendar Assistant" };
    } else if (path.includes("contract")) {
      return { text: "Contract Assistant" };
    } else {
      return { icon: WorkOutline, text: "Hiring Intelligence" };
    }
  };

  const titleConfig = getTitleConfig();

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px={2.5}
      py={2}
      borderBottom={`1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`}
      sx={{
        background: isDark 
          ? "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)"
          : "linear-gradient(180deg, rgba(0,0,0,0.01) 0%, rgba(0,0,0,0) 100%)",
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <AICreditsComponent />
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="body1"
            sx={{
              color: isDark ? theme.palette.text.primary : theme.palette.text.primary,
              fontWeight: 600,
              fontSize: "0.95rem",
              letterSpacing: "0.01em",
            }}
          >
            {titleConfig.text} ({chatHistoryLength})
          </Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <IconButton
          size="small"
          onClick={onMinimize}
          sx={{
            color: isDark ? theme.palette.text.secondary : theme.palette.text.secondary,
            p: 0.75,
            "&:hover": { 
              bgcolor: isDark ? "rgba(255,255,255,0.08)" : theme.palette.action.hover,
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};
