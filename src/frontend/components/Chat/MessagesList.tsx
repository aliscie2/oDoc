import React, { memo } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Chat, User } from "./types";
import { getSenderName, isCurrentUser } from "./utils";
import formatTimestamp from "../../utils/time";

interface MessagesListProps {
  chat: Chat;
  currentUserId: string;
  allFriends: User[];
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onScroll: (container: HTMLElement) => void;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
}

export const MessagesList = memo<MessagesListProps>(
  ({
    chat,
    currentUserId,
    allFriends,
    messagesContainerRef,
    messagesEndRef,
    onScroll,
    isLoadingMore,
    hasMoreMessages,
  }) => {
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      onScroll(e.currentTarget);
    };

    // ⚠️ CRITICAL: MESSAGE ORDERING
    // Storage format: [newest, ..., oldest] (reverse chronological)
    // Display format: [oldest, ..., newest] (chronological - top to bottom)
    //
    // Example:
    // Stored:    [msg3(newest), msg2, msg1(oldest)]
    // Displayed: [msg1(oldest), msg2, msg3(newest)]
    //
    // We MUST reverse the array for display so users see messages in natural order
    const sortedMessages = [...chat.messages].reverse();

    return (
      <Box
        ref={messagesContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        {/* Loading indicator at top */}
        {isLoadingMore && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* No more messages indicator */}
        {!hasMoreMessages && chat.messages.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              No more messages
            </Typography>
          </Box>
        )}

        {/* Messages - Display oldest to newest (top to bottom) */}
        {sortedMessages.map((message) => {
          const isOwn = isCurrentUser(message.sender, currentUserId);
          const senderName = getSenderName(
            message.sender,
            currentUserId,
            allFriends,
          );

          return (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                justifyContent: isOwn ? "flex-end" : "flex-start",
                mb: 1,
                gap: 1,
              }}
            >
              {/* Avatar for other users */}
              {!isOwn && (
                <Avatar
                  sx={{ width: 32, height: 32, mt: 0.5 }}
                  alt={senderName}
                >
                  {senderName.charAt(0).toUpperCase()}
                </Avatar>
              )}

              <Box sx={{ maxWidth: "70%", minWidth: "100px" }}>
                {/* Sender name for other users */}
                {!isOwn && (
                  <Typography
                    component={Link}
                    to={`/user?id=${message.sender.toString()}`}
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      textDecoration: "none",
                      ml: 0.5,
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {senderName}
                  </Typography>
                )}

                {/* Message bubble */}
                <Paper
                  elevation={0}
                  sx={(theme) => ({
                    p: 1.5,
                    mt: !isOwn ? 0.5 : 0,
                    bgcolor: isOwn
                      ? theme.palette.primary.main
                      : theme.palette.mode === "dark"
                        ? "#27272a" // zinc-800
                        : "#f4f4f5", // zinc-100
                    color: isOwn ? "#ffffff" : theme.palette.text.primary,
                    borderRadius: isOwn
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    wordBreak: "break-word",
                    border:
                      theme.palette.mode === "dark" && !isOwn
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "none",
                    boxShadow: isOwn
                      ? `0 2px 8px ${theme.palette.mode === "dark" ? "rgba(59, 130, 246, 0.3)" : "rgba(37, 99, 235, 0.2)"}`
                      : "none",
                  })}
                >
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", mb: 0.5 }}
                  >
                    {message.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      opacity: 0.7,
                      fontSize: "0.7rem",
                      display: "block",
                    }}
                  >
                    {formatTimestamp(message.date)}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          );
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </Box>
    );
  },
);

MessagesList.displayName = "MessagesList";
