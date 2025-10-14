import { Box, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { MessageBubbleProps } from "../types";
import { useThemeStyles } from "../hooks/useThemeStyles";
import { TypingMarkdownMessage } from "./TypingMarkdownMessage";
import MarkdownMessage from "../markDownMessageRdnder";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

export const MessageBubble = ({
  msg,
  isLatestMessage,
  onTypingComplete,
  onTypingProgress,
}: MessageBubbleProps) => {
  const { theme, isDark } = useThemeStyles();
  const isUser = msg.type === "user";
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), isUser ? 50 : 100);
    return () => clearTimeout(timer);
  }, [isUser]);

  const handleCopyLink = async () => {
    if (!msg.shareLink) return;

    try {
      await navigator.clipboard.writeText(msg.shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Silent fail
    }
  };

  const isTriggered = msg.isTriggeredMessage;

  const bubbleStyles = {
    maxWidth: "85%",
    bgcolor: isUser
      ? `${theme.palette.primary.main}${isDark ? "40" : "20"}`
      : isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.04)",
    p: isTriggered ? 2 : 1,
    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    border: isUser
      ? `1px solid ${theme.palette.primary.main}60`
      : `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
    backdropFilter: !isUser ? "blur(10px)" : undefined,
    WebkitBackdropFilter: !isUser ? "blur(10px)" : undefined,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translateY(0)" : "translateY(10px)",
    transition: "all 0.3s ease-out",
    // Special styling for triggered messages
    ...(isTriggered && {
      fontSize: "1.1rem",
      fontWeight: 500,
      letterSpacing: "0.01em",
    }),
  };

  // Log when rendering share message
  useEffect(() => {
    if (msg.shareLink) {
      console.log("💬 [MESSAGE] Rendering share message:", {
        messageId: msg.id,
        hasLink: !!msg.shareLink,
        hasThumbnail: !!msg.thumbnailUrl,
        jobId: msg.jobId,
      });
    }
  }, [msg.shareLink, msg.thumbnailUrl, msg.id, msg.jobId]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 0.75,
      }}
    >
      <Box sx={bubbleStyles}>
        {msg.type === "ai" && isLatestMessage ? (
          <TypingMarkdownMessage
            text={msg.message}
            onComplete={() => onTypingComplete(msg.id)}
            onProgress={onTypingProgress}
            isStreaming={false}
          />
        ) : (
          <MarkdownMessage message={msg.message} isUser={isUser} />
        )}

        {/* Share Link Section */}
        {msg.shareLink && (
          <Box
            sx={{
              mt: 1.5,
              pt: 1.5,
              borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            }}
          >
            {/* Thumbnail Preview */}
            {msg.thumbnailUrl && (
              <Box
                sx={{
                  mb: 1.5,
                  borderRadius: 1,
                  overflow: "hidden",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                }}
              >
                <img
                  src={msg.thumbnailUrl}
                  alt="Job Profile Preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </Box>
            )}

            {/* Share Link */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                borderRadius: 1,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  fontSize: "0.75rem",
                  color: theme.palette.text.secondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {msg.shareLink}
              </Box>
              <Tooltip title={copied ? "Copied!" : "Copy link"}>
                <IconButton
                  size="small"
                  onClick={handleCopyLink}
                  sx={{
                    color: copied
                      ? theme.palette.success.main
                      : theme.palette.text.secondary,
                    "&:hover": {
                      bgcolor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)",
                    },
                  }}
                >
                  {copied ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <ContentCopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
