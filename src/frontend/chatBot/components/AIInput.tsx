import {
  Box,
  IconButton,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Send } from "@mui/icons-material";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { useCallback, useRef, useState } from "react";
import { AIInputProps } from "../types";
import { useThemeStyles } from "../hooks/useThemeStyles";

export const AIInput = ({
  onSendMessage,
  onCancelRequest,
  isLoading,
  chatHistory,
  setIsMinimized,
}: AIInputProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [message, onSendMessage]);

  const handleButtonClick = useCallback(() => {
    if (isLoading) {
      onCancelRequest();
    } else {
      handleSend();
    }
  }, [isLoading, onCancelRequest, handleSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setIsExpanded(true);
    if (chatHistory.length > 0) setIsMinimized(false);
  }, [chatHistory.length, setIsMinimized]);

  const { chatBg, borderColor, shadowColor } = useThemeStyles();
  const shouldBeExpanded = isFocused || isExpanded;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: isMobile ? 80 : 30,
        left: isMobile ? 0 : "50%",
        transform: isMobile ? "none" : "translateX(-50%)",
        zIndex: 1000,
        width: isMobile ? "100vw" : shouldBeExpanded ? 500 : 300,
        transition: "width 0.3s ease-in-out",
      }}
      onMouseEnter={() => !isFocused && setIsExpanded(true)}
      onMouseLeave={() => !isFocused && setIsExpanded(false)}
    >
      <Box
        sx={{
          bgcolor: chatBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: isMobile ? "none" : `1px solid ${borderColor}`,
          borderTop: isMobile ? `1px solid ${borderColor}` : undefined,
          borderRadius: 1,
          p: shouldBeExpanded ? 1 : 0.5,
          boxShadow: isMobile
            ? `0 -4px 16px ${theme.palette.action.hover}`
            : shadowColor,
          transition: "all 0.3s ease-in-out",
          opacity: shouldBeExpanded ? 1 : 0.8,
        }}
      >
        <Box
          display="flex"
          gap={shouldBeExpanded ? 1 : 0.5}
          alignItems="center"
        >
          <TextField
            ref={inputRef}
            disabled={isLoading}
            size="small"
            fullWidth
            multiline
            maxRows={shouldBeExpanded ? 3 : 1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={() => {
              setIsFocused(false);
              setIsExpanded(false);
            }}
            placeholder={
              isLoading
                ? "📊 Analyzing data..."
                : "Ask about candidates, metrics, or hiring insights..."
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "transparent",
                fontSize: shouldBeExpanded ? "0.9rem" : "0.8rem",
                color: theme.palette.text.primary,
                "& fieldset": { border: "none" },
                "& input, & textarea": {
                  py: shouldBeExpanded ? 0.75 : 0.4,
                  transition: "all 0.3s ease-in-out",
                  color: "inherit",
                },
                "& input::placeholder, & textarea::placeholder": {
                  color: theme.palette.text.secondary,
                  opacity: 1,
                },
              },
            }}
          />
          <IconButton
            disabled={!isLoading && !message.trim()}
            onClick={handleButtonClick}
            size={shouldBeExpanded ? "medium" : "small"}
            sx={{
              color: isLoading
                ? theme.palette.error.main
                : theme.palette.primary.main,
              bgcolor: isLoading
                ? `${theme.palette.error.main}15`
                : message.trim()
                  ? `${theme.palette.primary.main}15`
                  : "transparent",
              "&:hover": {
                bgcolor: isLoading
                  ? `${theme.palette.error.main}25`
                  : `${theme.palette.primary.main}25`,
              },
              "&:disabled": { color: theme.palette.text.disabled },
              transition: "all 0.3s ease-in-out",
            }}
          >
            {isLoading ? <StopCircleIcon /> : <Send />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
