import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Badge,
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { backendActor } from "../../utils/backendUtils";
import { formatRelativeTime } from "../../utils/time";
import StyledNotificationItem from "./notiicationitem";
import PaymentDialog from "./paymentDialog";
import UserAvatarMenu from "../MainComponents/UserAvatarMenu";
import { RootState } from "../../redux/reducers";

const NotificationsButton = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.filesState);
  const { notifications } = useSelector(
    (state: RootState) => state.notificationState,
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(
    new Set<string>(),
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const open = Boolean(anchorEl);
  const hasMoreNotifications = notifications.length > 14;
  const unreadCount = notifications.filter((n: any) => !n.is_seen).length;

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!backendActor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const newNotifications = await backendActor.get_user_notifications(
        notifications.length,
      );

      if (newNotifications.length > 0) {
        dispatch({
          type: "UPDATE_NOT_LIST",
          new_list: [...notifications, ...newNotifications],
        });
      }
    } catch (error) {
      console.error("Error loading more notifications:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [backendActor, isLoadingMore, notifications, dispatch]);

  const handleNotificationClick = useCallback(
    async (notification: any) => {
      const notificationId = notification.id;

      setLoadingNotifications((prev) => new Set(prev).add(notificationId));

      try {
        // Handle payment notifications
        if ("CPaymentContract" in notification.content) {
          setSelectedPayment(notification.content.CPaymentContract[0]);
        }

        // Mark as read if unread
        if (!notification.is_seen) {
          await backendActor?.see_notifications([notificationId]);
          notification.is_seen = true;
        }
      } catch (error) {
        console.error("Error handling notification:", error);
      } finally {
        setLoadingNotifications((prev) => {
          const updated = new Set(prev);
          updated.delete(notificationId);
          return updated;
        });
      }
    },
    [backendActor],
  );

  const getNotificationMessage = useCallback(
    (content: any) => {
      const messageMap: Record<string, () => React.ReactNode> = {
        CustomContract: () =>
          `New custom contract payment: ${content.CustomContract[1].amount}`,
        ContractUpdate: () =>
          `Contract updated: ${content.ContractUpdate.contract_id}`,
        AcceptFriendRequest: () => "Friend request accepted",
        Unfriend: () => "Someone removed you from their friends list",
        ReceivedDeposit: () => `Received deposit: ${content.ReceivedDeposit}`,
        ApplyShareRequest: () =>
          `New share request: ${content.ApplyShareRequest}`,
        NewMessage: () => `New message: ${content.NewMessage.message}`,
        RemovedFromChat: () => `Removed from chat: ${content.RemovedFromChat}`,
        CPaymentContract: () => {
          const payment = content.CPaymentContract[0];
          return `Payment update: ${payment.amount} (${Object.keys(payment.status)[0]})`;
        },
        FriendRequest: () => {
          const { friend } = content.FriendRequest;
          const isCurrentUserSender = friend.sender.id === profile.id;
          const otherUser = isCurrentUserSender
            ? friend.receiver
            : friend.sender;
          const messageText = isCurrentUserSender
            ? `Friend request sent to ${otherUser.name}`
            : `Friend request from ${otherUser.name}`;

          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">{messageText}</Typography>
              <UserAvatarMenu
                user={{
                  id: otherUser.id,
                  name: otherUser.name,
                  photo: otherUser.photo,
                }}
                sx={{ width: 24, height: 24 }}
                hide={["Review"]}
              />
            </Box>
          );
        },
      };

      const messageType = Object.keys(content)[0];
      return messageMap[messageType]?.() || "Unknown notification type";
    },
    [profile.id],
  );

  const isPaymentNotification = useCallback(
    (notification: any) => "CPaymentContract" in notification.content,
    [],
  );

  const handleMarkAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter((n: any) => !n.is_seen)
      .map((n: any) => n.id);
    if (unreadIds.length === 0) return;

    setIsMarkingAllRead(true);
    try {
      await backendActor?.see_notifications(unreadIds);

      const updatedNotifications = notifications.map((notification: any) =>
        unreadIds.includes(notification.id)
          ? { ...notification, is_seen: true }
          : notification,
      );

      dispatch({ type: "UPDATE_NOT_LIST", new_list: updatedNotifications });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setIsMarkingAllRead(false);
    }
  }, [notifications, backendActor, dispatch]);

  const renderNotificationItem = useCallback(
    (notification: any) => {
      const isLoading = loadingNotifications.has(notification.id);
      const isPayment = isPaymentNotification(notification);

      return (
        <StyledNotificationItem
          key={notification.id}
          onClick={() => handleNotificationClick(notification)}
          isread={notification.is_seen.toString()}
          ispayment={isPayment.toString()}
          disabled={isLoading}
        >
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: notification.is_seen ? "normal" : "bold",
                    opacity: notification.is_seen ? 0.7 : 1,
                    color: isPayment
                      ? "primary.main"
                      : notification.is_seen
                        ? "text.secondary"
                        : "text.primary",
                  }}
                >
                  {getNotificationMessage(notification.content)}
                </Typography>
                {isLoading && <CircularProgress size={16} />}
              </Box>
            }
            secondary={formatRelativeTime(notification.time)}
            secondaryTypographyProps={{
              variant: "caption",
              sx: { opacity: notification.is_seen ? 0.7 : 1 },
            }}
          />
        </StyledNotificationItem>
      );
    },
    [
      loadingNotifications,
      isPaymentNotification,
      handleNotificationClick,
      getNotificationMessage,
    ],
  );

  const renderLoadMoreButton = () => (
    <MenuItem
      onClick={handleLoadMore}
      disabled={isLoadingMore}
      sx={{
        justifyContent: "center",
        borderTop: 1,
        borderColor: "divider",
        py: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isLoadingMore ? (
          <>
            <CircularProgress size={16} />
            <Typography variant="body2">Loading...</Typography>
          </>
        ) : (
          <>
            <ExpandMoreIcon />
            <Typography variant="body2">Load More</Typography>
          </>
        )}
      </Box>
    </MenuItem>
  );

  return (
    <>
      <IconButton
        aria-label="notifications"
        onClick={handleMenuOpen}
        aria-controls={open ? "notifications-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          style: { maxHeight: "80vh", width: "320px", overflowY: "auto" },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {unreadCount > 0 && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                {isMarkingAllRead ? (
                  <CircularProgress size={16} />
                ) : (
                  <ChecklistIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {notifications.length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="textSecondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          <>
            <List sx={{ padding: 0 }}>
              {notifications.map(renderNotificationItem)}
            </List>
            {hasMoreNotifications && renderLoadMoreButton()}
          </>
        )}
      </Menu>

      {selectedPayment && (
        <PaymentDialog
          payment={selectedPayment}
          onClose={() => {
            setSelectedPayment(null);
            handleMenuClose();
          }}
          onAction={() => {
            setSelectedPayment(null);
            handleMenuClose();
          }}
        />
      )}
    </>
  );
};

export default NotificationsButton;
