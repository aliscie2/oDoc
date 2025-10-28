import React from "react";
import { Box, Divider, List, Typography, CircularProgress, Button } from "@mui/material";
import { Notification } from "$/declarations/backend/backend.did";
import { NotificationCard } from "./NotifcationList";

interface NotificationsListProps {
  notifications: Notification[];
  profileId: string;
  onMarkRead: (id: string) => void;
  compact?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
  profileId,
  onMarkRead,
  compact = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  emptyMessage = "No notifications",
}) => {
  if (notifications.length === 0 && !isLoadingMore) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <List sx={{ p: 0 }}>
        {notifications.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <NotificationCard
              notification={notification}
              onMarkRead={onMarkRead}
              profileId={profileId}
              compact={compact}
            />
            {index < notifications.length - 1 && (
              <Divider sx={{ borderWidth: compact ? 1 : 0.1, opacity: 0.5 }} />
            )}
          </React.Fragment>
        ))}
      </List>

      {compact && hasMore && onLoadMore && (
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            onClick={onLoadMore}
            disabled={isLoadingMore}
            startIcon={
              isLoadingMore ? (
                <CircularProgress size={16} />
              ) : null
            }
            sx={{ borderRadius: 2 }}
          >
            {isLoadingMore ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}

      {!compact && isLoadingMore && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress size={32} />
        </Box>
      )}

      {!compact && !hasMore && notifications.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            No more notifications
          </Typography>
        </Box>
      )}
    </>
  );
};

export default NotificationsList;
