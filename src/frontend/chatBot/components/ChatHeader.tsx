import { Box, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import AICreditsComponent from "./AICreditsCompnent";
import { useThemeStyles } from "../hooks/useThemeStyles";

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

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      px={1.5}
      py={1}
      borderBottom={`1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <AICreditsComponent />
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            fontSize: "0.8rem",
          }}
        >
          {assistantName} ({chatHistoryLength})
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" gap={0.5}>
        <Box sx={{ height: 24, overflow: "hidden" }}>
          <RunawayJellyfish
            die={credits === 0}
            thinking={isLoading}
            runaway={true}
          />
        </Box>
        <IconButton
          size="small"
          onClick={onMinimize}
          sx={{
            color: theme.palette.text.secondary,
            p: 0.5,
            "&:hover": { bgcolor: theme.palette.action.hover },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};
