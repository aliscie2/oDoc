import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import React, { memo } from "react";
import formatTimestamp from "../../utils/time";
import UserAvatarMenu from "../MainComponents/UserAvatarMenu";
import { Chat, User } from "$/declarations/backend/backend.did";
import { getSenderName, isCurrentUser } from "./utils";

interface MessagesListProps {
  chat: Chat;
  currentUserId: string;
  allFriends: User[];
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onScroll: (container: HTMLElement) => void;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  isPrivateChat: boolean;
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
    isPrivateChat,
  }) => {
    const theme = useTheme();

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      onScroll(e.currentTarget);
    };

    const sortedMessages = [...chat.messages].reverse();

    return (
      <Box
        ref={messagesContainerRef}
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflow: "auto",
          overflowX: "hidden",
          p: 2,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          minHeight: 0,
          maxHeight: "100%",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "3px",
          },
        }}
      >
        {isLoadingMore && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!hasMoreMessages && chat.messages.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              No more messages
            </Typography>
          </Box>
        )}

        {sortedMessages.map((message) => {
          const isOwn = isCurrentUser(message.sender, currentUserId);
          const senderName = getSenderName(
            message.sender,
            currentUserId,
            allFriends,
          );
          const showSenderInfo = !isOwn && !isPrivateChat;

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
              {showSenderInfo && (
                <UserAvatarMenu
                  user_id={message.sender.toString()}
                  dispalyName={false}
                />
              )}

              <Box sx={{ maxWidth: "70%", minWidth: "100px" }}>
                <Paper
                  elevation={0}
                  sx={(theme) => ({
                    p: 1.5,
                    mt: showSenderInfo ? 0.5 : 0,
                    bgcolor: isOwn
                      ? theme.palette.primary.main
                      : theme.palette.mode === "dark"
                        ? "#27272a"
                        : "#f4f4f5",
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
                  {showSenderInfo && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color:
                          theme.palette.mode === "dark" ? "#a1a1aa" : "#71717a",
                        mb: 0.5,
                        display: "block",
                      }}
                    >
                      {senderName}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", mb: 0.5 }}
                  >
                    {message.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
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

        <div ref={messagesEndRef} />
      </Box>
    );
  },
);
MessagesList.displayName = "MessagesList";
