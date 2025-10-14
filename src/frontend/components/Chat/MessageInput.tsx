import React, { memo, useState, useCallback } from "react";
import { Box, TextField, IconButton, CircularProgress } from "@mui/material";
import { Send } from "@mui/icons-material";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<boolean>;
  isSending: boolean;
  disabled?: boolean;
}

export const MessageInput = memo<MessageInputProps>(
  ({ onSendMessage, isSending, disabled = false }) => {
    const [message, setMessage] = useState("");

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isSending || disabled) return;

        const success = await onSendMessage(message);
        if (success) {
          setMessage("");
        }
      },
      [message, isSending, disabled, onSendMessage]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSubmit(e);
        }
      },
      [handleSubmit]
    );

    return (
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 1.5,
          borderTop: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending || disabled}
          multiline
          maxRows={4}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
            },
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={isSending || disabled || !message.trim()}
          sx={{ borderRadius: 2 }}
        >
          {isSending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Send />
          )}
        </IconButton>
      </Box>
    );
  }
);

MessageInput.displayName = "MessageInput";
