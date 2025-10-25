import React from "react";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import { Group as GroupIcon, Settings } from "@mui/icons-material";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import { Chat } from "$/declarations/backend/backend.did";
import { formatRelativeTime } from "@/utils/time";

interface ChatListItemProps {
  chat: Chat;
  unreadCount: number;
  displayName?: string;
  lastMessage: string;
  otherUser?: string | { id: string; name: string; photo: string } | null;
  showSettings?: boolean;
  onClick: () => void;
  onSettingsClick?: () => void;
  compact?: boolean; // For dropdown vs full page
}


export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  unreadCount,
  displayName: _displayName,
  lastMessage,
  otherUser,
  showSettings = false,
  onClick,
  onSettingsClick,
  compact = false,
}) => {
  const hasUnread = unreadCount > 0;
  const isPrivateChat = chat.name === "private_chat";
  const lastMessageTime = chat.messages[0]?.date
    ? formatRelativeTime(Number(chat.messages[0].date))
    : "";

  return (
    <Box
      onClick={onClick}
      sx={{
        mb: 0.5,
        mx: compact ? { xs: 0.5, sm: 1 } : 1,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": { bgcolor: "action.hover" },
        bgcolor: hasUnread ? "action.hover" : "transparent",
        borderRadius: 1,
        p: compact ? { xs: 1, sm: 1.5 } : 2,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: compact ? { xs: 1.5, sm: 2 } : 2,
        }}
      >
        {isPrivateChat ? (
          <Box sx={{ display: "flex", flex: 1, minWidth: 0 }}>
            <UserAvatarMenu
              dispalyName={false}
              user_id={typeof otherUser === "string" ? otherUser : otherUser?.id}
              size={compact ? 48 : 56}
              subtitle={lastMessage}
            />
          </Box>
        ) : (
          <>
            <Avatar
              sx={{
                width: compact ? 48 : 56,
                height: compact ? 48 : 56,
                bgcolor: "primary.main",
              }}
            >
              <GroupIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: hasUnread ? 600 : 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  mb: 0.25,
                }}
              >
                {chat.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  lineHeight: 1.4,
                }}
              >
                {lastMessage}
              </Typography>
            </Box>
          </>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
          {lastMessageTime && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem", whiteSpace: "nowrap" }}
            >
              {lastMessageTime}
            </Typography>
          )}
          {hasUnread && (
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 600,
                color: "white",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Box>
          )}
        </Box>

        {showSettings && onSettingsClick && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onSettingsClick();
            }}
            size="small"
          >
            <Settings fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};