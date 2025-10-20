import React from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { Settings } from "@mui/icons-material";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";
import { User } from "$/declarations/backend/backend.did";

interface ChatHeaderProps {
  title: string;
  showSettings?: boolean;
  onSettingsClick?: () => void;
  avatar?: {
    userId?: string;
    user?: User;
    isPrivateChat?: boolean;
  };
  actions?: React.ReactNode;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  showSettings = false,
  onSettingsClick,
  avatar,
  actions,
}) => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ 
        bgcolor: "background.paper", 
        color: "text.primary",
        flexShrink: 0,
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        {/* Left side - Avatar and Title */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          flex: 1,
          minWidth: 0, // Allow text truncation
        }}>
          {avatar && (
            <UserAvatarMenu
              dispalyName={false} // Don't show name in header to save space
              user_id={avatar.userId}
              user={avatar.user}
              sx={{ 
                width: { xs: 36, sm: 40 }, 
                height: { xs: 36, sm: 40 }, 
                mr: { xs: 1, sm: 1.5 },
                flexShrink: 0,
              }}
              hide={["Review"]}
            />
          )}
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Right side - Actions and Settings */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: { xs: 0.5, sm: 1 },
          flexShrink: 0,
        }}>
          {actions}
          {showSettings && onSettingsClick && (
            <IconButton 
              color="inherit" 
              onClick={onSettingsClick}
              size={window.innerWidth < 600 ? "small" : "medium"}
            >
              <Settings />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};