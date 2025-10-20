import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
} from "@mui/material";
import { Group as GroupIcon, Settings } from "@mui/icons-material";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import { Chat } from "$/declarations/backend/backend.did";

interface ChatListItemProps {
  chat: Chat;
  unreadCount: number;
  displayName: string;
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
  displayName,
  lastMessage,
  otherUser,
  showSettings = false,
  onClick,
  onSettingsClick,
  compact = false,
}) => {
  const hasUnread = unreadCount > 0;
  const isPrivateChat = chat.name === "private_chat";

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 1,
        mx: compact ? { xs: 0.5, sm: 1 } : 1,
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": { transform: "translateY(-1px)" },
        bgcolor: hasUnread ? "action.hover" : "background.paper",
        borderRadius: { xs: 1, sm: 1 },
      }}
    >
      <CardContent
        sx={{
          p: compact ? { xs: 1, sm: 1.5 } : 2,
          "&:last-child": { pb: compact ? { xs: 1, sm: 1.5 } : 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: compact ? { xs: 1, sm: 1.5 } : 2,
          }}
        >
          {/* Avatar */}
          {isPrivateChat ? (
            <UserAvatarMenu
              dispalyName
              user_id={
                typeof otherUser === "string" ? otherUser : otherUser?.id
              }
              size={compact ? 40 : 48}
            />
          ) : (
            <>
              <Avatar
                sx={{
                  width: compact ? 40 : 48,
                  height: compact ? 40 : 48,
                  bgcolor: "primary.main",
                }}
              >
                <GroupIcon />
              </Avatar>
              <Typography>{chat.name}</Typography>
            </>
          )}

          {/* Chat info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: hasUnread ? 600 : 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                mb: 0.25,
              }}
            >
              {displayName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                fontSize: "0.75rem",
              }}
            >
              {lastMessage}
            </Typography>
          </Box>

          {/* Unread badge + Settings */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {hasUnread && (
              <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    position: "static",
                    transform: "none",
                    fontSize: "0.65rem",
                    height: 20,
                    minWidth: 20,
                  },
                }}
              />
            )}
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
      </CardContent>
    </Card>
  );
};
