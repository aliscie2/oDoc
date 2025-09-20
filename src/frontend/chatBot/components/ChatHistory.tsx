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
        px: 1,
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: theme.palette.text.disabled,
          borderRadius: "2px",
        },
      }}
    >
      {chatHistory.map((msg, idx) => {
        const isLatestMessage = idx === chatHistory.length - 1;
        return (
          <Box key={`${msg.id}-${idx}`}>
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
