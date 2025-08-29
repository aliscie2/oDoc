import { Box, useTheme } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import { ChatHistoryProps } from "../types";
import { MessageBubble } from "./MessageBubble";
import { MessageActions } from "./MessageActions";

export const ChatHistory = ({
  chatHistory,
  onUndoMessage,
  onRedoMessage,
  onRetry,
  onTypingComplete,
}: ChatHistoryProps) => {
  const theme = useTheme();
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  // Auto-scroll when chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  return (
    <Box
      ref={chatRef}
      sx={{
        maxHeight: { xs: 250, sm: 300 },
        overflowY: "auto",
        px: 1,
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: theme.palette.text.disabled,
          borderRadius: "2px",
        },
      }}
    >
      {chatHistory.map((msg, idx) => (
        <Box key={`${msg.id}-${idx}`}>
          <MessageBubble
            msg={msg}
            onTypingComplete={onTypingComplete}
            onTypingProgress={scrollToBottom}
          />
          <MessageActions
            msg={msg}
            onUndo={onUndoMessage}
            onRedo={onRedoMessage}
            onRetry={onRetry}
          />
        </Box>
      ))}
    </Box>
  );
};
