import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppBar, Box, Toolbar, Typography, Button } from "@mui/material";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsList from "@/components/NotificationsList";
import { useNotificationActions } from "@/hooks/useNotificationActions";

const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.filesState);
  const { notifications, hasMore, unreadCount } = useSelector(
    (state: RootState) => state.notificationState,
  );
  console.log({
    x: notifications.length,
    y: notifications.filter((n) => !n.is_seen).length,
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { markAsRead, markAllAsRead } = useNotificationActions();

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const moreNotifications = await backendActor?.get_user_notifications(
        BigInt(notifications.length),
      );

      if (moreNotifications && moreNotifications.length > 0) {
        dispatch({
          type: "APPEND_NOTIFICATIONS",
          notifications: moreNotifications,
        });
      } else {
        dispatch({ type: "SET_HAS_MORE", hasMore: false });
      }
    } catch (error) {
      console.error("Error loading more notifications:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Infinite scroll handler
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || isLoadingMore || !hasMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Load more when user scrolls to 80% of the content
      if (scrollPercentage > 0.8 && !isLoadingMore && hasMore) {
        handleLoadMore();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore, hasMore, notifications.length]);

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
              onClick={() => markAllAsRead()}
              startIcon={<NotificationsIcon />}
            >
              Mark all read
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0,0,0,0.2)",
            borderRadius: "4px",
          },
        }}
      >
        {notifications.length === 0 && !isLoadingMore ? (
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
          <NotificationsList
            notifications={notifications}
            profileId={profile?.id || ""}
            onMarkRead={markAsRead}
            compact={false}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </Box>
    </Box>
  );
};

export default NotificationsPage;
