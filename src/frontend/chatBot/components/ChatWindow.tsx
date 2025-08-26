import { Box } from "@mui/material";
import { ChatHistory } from "./ChatHistory";
import { ChatHeader } from "./ChatHeader";
import { ChatHistoryProps } from "../types";
import { useThemeStyles } from "../hooks/useThemeStyles";

interface ChatWindowProps extends ChatHistoryProps {
  assistantName: string;
  credits: number;
  isLoading: boolean;
  onMinimize: () => void;
}

export const ChatWindow = ({
  assistantName,
  credits,
  isLoading,
  onMinimize,
  chatHistory,
  onUndoMessage,
  onRedoMessage,
  onRetry,
  onTypingComplete,
}: ChatWindowProps) => {
  const { theme, isDark } = useThemeStyles();

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 130, sm: 110 },
        left: { xs: 0, sm: "50%" },
        transform: { xs: "none", sm: "translateX(-50%)" },
        zIndex: 999,
        width: { xs: "100vw", sm: 500 },
        bgcolor: theme.palette.background.paper,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: {
          xs: "none",
          sm: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`,
        },
        borderTop: {
          xs: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`,
          sm: undefined,
        },
        borderRadius: { xs: 0, sm: 0.5 },
        boxShadow: {
          xs: `0 -4px 16px ${theme.palette.action.hover}`,
          sm: isDark
            ? "0 8px 32px rgba(0,0,0,0.4)"
            : "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      <ChatHeader
        assistantName={assistantName}
        chatHistoryLength={chatHistory.length}
        credits={credits}
        isLoading={isLoading}
        onMinimize={onMinimize}
      />
      <ChatHistory
        chatHistory={chatHistory}
        onUndoMessage={onUndoMessage}
        onRedoMessage={onRedoMessage}
        onRetry={onRetry}
        onTypingComplete={onTypingComplete}
      />
    </Box>
  );
};