import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { MessageBubbleProps } from "../types";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { TypingMarkdownMessage } from "./TypingMarkdownMessage";
import MarkdownMessage from "../markDownMessageRdnder";

export const MessageBubble = ({
  msg,
  onTypingComplete,
  onTypingProgress,
}: MessageBubbleProps) => {
  const { theme, isDark } = useThemeStyles();
  const isUser = msg.type === "user";
  const [isVisible, setIsVisible] = useState(false);

  // Quick appear animation for user messages
  useEffect(() => {
    if (isUser) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isUser]);

  const bubbleStyles = {
    maxWidth: "85%",
    bgcolor: isUser
      ? `${theme.palette.primary.main}${isDark ? "40" : "20"}`
      : isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.04)",
    p: 1,
    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    border: isUser
      ? `1px solid ${theme.palette.primary.main}60`
      : `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
    backdropFilter: !isUser ? "blur(10px)" : undefined,
    WebkitBackdropFilter: !isUser ? "blur(10px)" : undefined,
    opacity: isUser ? (isVisible ? 1 : 0) : 1,
    transform: isUser
      ? isVisible
        ? "translateY(0)"
        : "translateY(10px)"
      : "none",
    transition: isUser ? "all 0.3s ease-out" : "none",
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 0.75,
      }}
    >
      <Box sx={bubbleStyles}>
        {msg.type === "ai" && msg.isTyping ? (
          <TypingMarkdownMessage
            text={msg.message}
            onComplete={() => onTypingComplete(msg.id)}
            onProgress={onTypingProgress}
            isStreaming={true}
          />
        ) : (
          <MarkdownMessage message={msg.message} isUser={isUser} />
        )}
      </Box>
    </Box>
  );
};