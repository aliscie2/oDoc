import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Box, Divider, List, Toolbar, Typography, Button } from "@mui/material";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { Notification as NotificationType } from "$/declarations/backend/backend.did";
import NotificationsIcon from "@mui/icons-material/Notifications";

// Import the NotificationCard component from the existing file
import { NotificationCard } from "@/components/NotifcationList";

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.filesState);
  const { notifications } = useSelector(
    (state: RootState) => state.notificationState,
  );

  const unreadCount = notifications.filter(
    (n: NotificationType) => !n.is_seen,
  ).length;

  const handleMarkRead = async (notificationId: string) => {
    const notification = notifications.find(
      (n: NotificationType) => n.id === notificationId,
    );
    if (!notification || notification.is_seen) return;

    try {
      await backendActor?.see_notifications([notificationId]);
      dispatch({
        type: "UPDATE_NOT_LIST",
        new_list: notifications.map((n: NotificationType) =>
          n.id === notificationId ? { ...n, is_seen: true } : n,
        ),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications
      .filter((n: NotificationType) => !n.is_seen)
      .map((n: NotificationType) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await backendActor?.see_notifications(unreadIds);
      dispatch({
        type: "UPDATE_NOT_LIST",
        new_list: notifications.map((n: NotificationType) =>
          unreadIds.includes(n.id) ? { ...n, is_seen: true } : n,
        ),
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: { xs: "calc(100vh - 56px)", sm: "100vh" }, // Account for bottom nav on mobile
        bgcolor: "background.default",
        pb: { xs: 1, sm: 0 }, // Small padding on mobile to ensure no overlap
        mx: { xs: 0, md: 16, lg: 29 }, // Add horizontal margin on desktop
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "background.paper", color: "text.primary" }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              startIcon={<NotificationsIcon />}
            >
              Mark all read
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {notifications.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              p: 4,
            }}
          >
            <NotificationsIcon
              sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notifications
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              You&apos;re all caught up! New notifications will appear here.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification: NotificationType, index: number) => (
              <>
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  profileId={profile?.id || ""}
                  compact={false}
                />
                {index < notifications.length - 1 && (
                  <Divider sx={{ borderWidth: 0.1, opacity: 0.5 }} />
                )}
              </>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default NotificationsPage;
