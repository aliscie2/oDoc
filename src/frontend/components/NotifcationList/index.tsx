import { Notification } from "$/declarations/backend/backend.did";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { formatRelativeTime } from "@/utils/time";
import MessageIcon from "@mui/icons-material/Message";
import NotificationsIcon from "@mui/icons-material/Notifications";
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  Menu,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import FriendshipButton from "../FriendshipButton";
import UserAvatarMenu from "../MainComponents/UserAvatarMenu";
import PaymentDialog from "./paymentDialog";

const mapNotificationToCardProps = (
  notification: Notification,
  profileId: string,
) => {
  const contentType = Object.keys(notification.content)[0];
  const baseProps = {
    ...notification,
    id: notification.id,
    is_seen: notification.is_seen,
    time: notification.time,
  };

  switch (contentType) {
    case "FriendRequest": {
      const friendReq = notification.content.FriendRequest;
      const isCurrentUserSender = friendReq.sender.toString() === profileId;
      const otherUser = isCurrentUserSender
        ? friendReq.receiver
        : friendReq.sender;

      return {
        ...baseProps,
        type: "FriendRequest",
        user: {
          id: otherUser.toString(),
          name: otherUser.toString(),
          photo: "",
        },
        isSender: isCurrentUserSender,
      };
    }

    case "CPaymentContract": {
      const [payment, _] = notification.content.CPaymentContract;
      return {
        ...baseProps,
        type: "Payment",
        amount: payment.amount,
        status: Object.keys(payment.status)[0],
        senderId: payment.sender,
        contractId: payment.id,
        ownerId: payment.owner,
        fullPayment: payment,
      };
    }

    case "NewMessage": {
      const msg = notification.content.NewMessage;
      return {
        ...baseProps,
        type: "Message",
        sender: msg.sender.toString(),
        message: msg.message,
      };
    }

    case "AcceptFriendRequest":
    case "ApproveShareRequest":
    case "ApplyShareRequest":
    case "Unfriend":
    case "ReceivedDeposit":
    case "ContractUpdate":
    case "CustomContract":
    case "RemovedFromChat":
      return { ...baseProps, type: contentType };

    default:
      return null;
  }
};

const NotificationCard = ({
  notification,
  onAccept,
  onDecline,
  onMarkRead,
}: any) => {
  const { profile } = useSelector((state: AppState) => state.filesState);
  const { type, is_seen, time, isSender } = notification;

  const cardStyles = {
    mb: 1,
    mx: 1,
    opacity: is_seen ? 0.7 : 1,
    transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-1px)" },
  };

  // NotificationCard changes in notifications component
  if (type === "FriendRequest" && !isSender) {
    return (
      <Card sx={cardStyles}>
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <UserAvatarMenu user_id={notification?.user?.id} dispalyName />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                sent you a friend request
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: "0.7rem",
                whiteSpace: "nowrap",
                alignSelf: "flex-start",
              }}
            >
              {formatRelativeTime(time)}
            </Typography>
          </Box>
          <Box sx={{ ml: 6.5 }}>
            <FriendshipButton user={notification.user} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (type === "Payment") {
    return (
      <Card
        sx={{
          ...cardStyles,
          cursor: "pointer",
        }}
        // onClick={() => setSelectedPayment(notification)}
      >
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <UserAvatarMenu
              dispalyName
              user_id={notification.senderId.toString()}
              sx={{ width: 40, height: 40 }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                  mb: 0.25,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  New promise
                </Typography>
                <Chip
                  label={notification.status}
                  size="small"
                  color={
                    notification.status === "Pending" ? "warning" : "success"
                  }
                  sx={{ height: 18, fontSize: "0.65rem" }}
                />
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "primary.main" }}
              >
                {notification.amount}$
              </Typography>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: "0.7rem",
                whiteSpace: "nowrap",
                alignSelf: "flex-start",
              }}
            >
              {formatRelativeTime(time)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (type === "AcceptFriendRequest") {
    let userId = notification?.sender?.toString();
    if (userId == profile?.id) {
      userId = notification?.receiver?.toString();
    }
    return (
      <Card sx={cardStyles} onClick={() => onMarkRead(notification.id)}>
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <UserAvatarMenu user_id={userId} dispalyName />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2">
                <strong>{notification?.user?.name}</strong> accepted your friend
                request
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: "0.7rem",
                whiteSpace: "nowrap",
                alignSelf: "flex-start",
              }}
            >
              {formatRelativeTime(time)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={cardStyles} onClick={() => onMarkRead(notification.id)}>
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <MessageIcon color="primary" sx={{ fontSize: 36 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
              {notification.sender}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {notification.message}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: "0.7rem",
              whiteSpace: "nowrap",
              alignSelf: "flex-start",
            }}
          >
            {formatRelativeTime(time)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const NotificationsButton = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { profile } = useSelector((state: RootState) => state.filesState);
  const { notifications } = useSelector(
    (state: RootState) => state.notificationState,
  );

  const unreadCount = notifications.filter((n: any) => !n.is_seen).length;

  const handleMarkRead = async (notificationId: string) => {
    const notification = notifications.find(
      (n: any) => n.id === notificationId,
    );
    if (!notification || notification.is_seen) return;

    try {
      await backendActor?.see_notifications([notificationId]);
      dispatch({
        type: "UPDATE_NOT_LIST",
        new_list: notifications.map((n: any) =>
          n.id === notificationId ? { ...n, is_seen: true } : n,
        ),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleAcceptFriend = async (notification: any) => {
    try {
      const result = await backendActor?.accept_friend_request(
        notification.user.id,
      );
      if (result && "Err" in result) {
        enqueueSnackbar(result.Err, { variant: "error" });
        return;
      }

      if (result && "Ok" in result) {
        const friend = {
          id: result.Ok.id,
          is_sender: false,
          confirmed: true,
          name: result.Ok.name,
          description: result.Ok.description,
          email: result.Ok.email,
          photo: result.Ok.photo,
        };
        dispatch({ type: "ADD_FRIEND", friend, user: result.Ok });
      }

      await handleMarkRead(notification.id);
      enqueueSnackbar("Friend request accepted", { variant: "success" });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      enqueueSnackbar("Failed to accept friend request", { variant: "error" });
    }
  };

  const handleDeclineFriend = async (notification: any) => {
    try {
      const result = await backendActor?.reject_friend_request(
        notification.user.id,
      );
      if (result && "Err" in result) {
        enqueueSnackbar(result.Err, { variant: "error" });
        return;
      }

      dispatch({
        type: "UPDATE_NOT_LIST",
        new_list: notifications.filter((n: any) => n.id !== notification.id),
      });
      enqueueSnackbar("Friend request declined", { variant: "info" });
    } catch (error) {
      console.error("Error declining friend request:", error);
      enqueueSnackbar("Failed to decline friend request", { variant: "error" });
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications
      .filter((n: any) => !n.is_seen)
      .map((n: any) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await backendActor?.see_notifications(unreadIds);
      dispatch({
        type: "UPDATE_NOT_LIST",
        new_list: notifications.map((n: any) =>
          unreadIds.includes(n.id) ? { ...n, is_seen: true } : n,
        ),
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            width: 420,
            maxHeight: "80vh",
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, pb: 1 }}>
            {notifications.map((notification: Notification) => {
              const mappedNotification = mapNotificationToCardProps(
                notification,
                profile.id,
              );
              return mappedNotification ? (
                <NotificationCard
                  key={notification.id}
                  notification={mappedNotification}
                  onAccept={handleAcceptFriend}
                  onDecline={handleDeclineFriend}
                  onMarkRead={handleMarkRead}
                />
              ) : null;
            })}
          </List>
        )}
      </Menu>

      {selectedPayment && (
        <PaymentDialog
          payment={selectedPayment.fullPayment}
          onClose={() => {
            setSelectedPayment(null);
            setAnchorEl(null);
          }}
          onAction={() => {
            setSelectedPayment(null);
            setAnchorEl(null);
          }}
        />
      )}
    </>
  );
};

export default NotificationsButton;
