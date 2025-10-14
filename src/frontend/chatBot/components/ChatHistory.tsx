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
  const prevHistoryLength = useRef(chatHistory.length);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    // Complete all typing animations when new message is added
    if (chatHistory.length > prevHistoryLength.current) {
      window.dispatchEvent(new Event("completeAllTyping"));
    }
    prevHistoryLength.current = chatHistory.length;
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  return (
    <Box
      ref={chatRef}
      sx={{
        maxHeight: { xs: 250, sm: 300 },
        overflowY: "auto",
        px: 2,
        py: 2,
        border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
        borderRadius: "8px",
        bgcolor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: theme.palette.text.disabled,
          borderRadius: "3px",
          "&:hover": {
            bgcolor: theme.palette.text.secondary,
          },
        },
      }}
    >
      {chatHistory.map((msg, idx) => {
        const isLatestMessage = idx === chatHistory.length - 1;
        return (
          <Box key={`${msg.id}-${idx}`} mb={1.5}>
            <MessageBubble
              msg={msg}
              isLatestMessage={isLatestMessage}
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
        );
      })}
    </Box>
  );
};
