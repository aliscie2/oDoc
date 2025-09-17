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

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), isUser ? 50 : 100);
    return () => clearTimeout(timer);
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
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(10px)",
    transition: "all 0.3s ease-out",
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
        {msg.type === "ai" ? (
          <TypingMarkdownMessage
            text={msg.message}
            onComplete={() => onTypingComplete(msg.id)}
            onProgress={onTypingProgress}
            isStreaming={false}
          />
        ) : (
          <MarkdownMessage message={msg.message} isUser={isUser} />
        )}
      </Box>
    </Box>
  );
};
