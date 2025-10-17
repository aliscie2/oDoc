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
import { useNavigate } from "react-router-dom";
import FriendshipButton from "../FriendshipButton";
import UserAvatarMenu from "../MainComponents/UserAvatarMenu";
import { encodeContractUrl } from "@/utils/urlEncoder";
import { Notification as NotificationType } from "$/declarations/backend/backend.did";

const NotificationCard = ({
  notification,
  onMarkRead,
  profileId,
}: {
  notification: NotificationType;
  onMarkRead: (id: string) => void;
  profileId: string;
}) => {
  console.log({ notification });
  const navigate = useNavigate();
  const contentType = Object.keys(
    notification.content,
  )[0] as keyof typeof notification.content;

  const cardStyles = {
    mb: 1,
    mx: 1,
    opacity: notification.is_seen ? 0.7 : 1,
    transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-1px)" },
  };

  const BaseCard = ({
    userId,
    message,
    children,
    onClick,
    icon,
    extraContent,
  }: {
    userId?: string;
    message?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    icon?: React.ReactNode;
    extraContent?: React.ReactNode;
  }) => (
    <Card
      sx={{ ...cardStyles, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: extraContent ? 1 : 0,
          }}
        >
          {icon || <UserAvatarMenu user_id={userId!} dispalyName />}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {message && (
              <Typography variant="caption" color="text.secondary">
                {message}
              </Typography>
            )}
            {children}
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
            {formatRelativeTime(notification.time)}
          </Typography>
        </Box>
        {extraContent}
      </CardContent>
    </Card>
  );

  const getOtherUserId = () =>
    notification.sender.toString() === profileId
      ? notification.receiver.toString()
      : notification.sender.toString();

  const notificationConfig: Record<
    string,
    {
      userId?: string;
      message?: string;
      children?: React.ReactNode;
      onClick?: () => void;
      icon?: React.ReactNode;
    }
  > = {
    FriendRequest: {
      userId: notification.sender?.toString(),
      message: "sent you a friend request",
    },
    AcceptFriendRequest: {
      userId: getOtherUserId(),
      message: "accepted your friend request",
      onClick: () => onMarkRead(notification.id),
    },
    RejectFriendRequest: {
      userId: notification.sender.toString(),
      message: "declined your friend request",
      onClick: () => onMarkRead(notification.id),
    },
    CancelFriendRequest: {
      userId: notification.sender.toString(),
      message: "cancelled their friend request",
      onClick: () => onMarkRead(notification.id),
    },
    Unfriend: {
      userId: notification.sender.toString(),
      message: "is no longer your friend",
      onClick: () => onMarkRead(notification.id),
    },
  };

  // Add NewMessage dynamically if it exists
  if (contentType === "NewMessage" && notification.content.NewMessage) {
    notificationConfig.NewMessage = {
      icon: <MessageIcon color="primary" sx={{ fontSize: 36 }} />,
      onClick: () => onMarkRead(notification.id),
      children: (
        <>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
            {notification.content.NewMessage.sender.toString()}
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
            {notification.content.NewMessage.message}
          </Typography>
        </>
      ),
    };
  }

  // Payment notification (special case)
  if (contentType === "CPaymentContract") {
    const [payment] = notification.content.CPaymentContract;
    const status = Object.keys(payment.status)[0];

    return (
      <BaseCard
        userId={payment.sender.toString()}
        onClick={() => {
          const encoded = encodeContractUrl({
            id: payment.contract_id,
            owner: payment.sender.toString(),
          });
          navigate(`/contract?data=${encoded}`);
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}
        >
          <Typography variant="caption" color="text.secondary">
            New promise
          </Typography>
          <Chip
            label={status}
            size="small"
            color={status === "Pending" ? "warning" : "success"}
            sx={{ height: 18, fontSize: "0.65rem" }}
          />
        </Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "primary.main" }}
        >
          {payment.amount}$
        </Typography>
      </BaseCard>
    );
  }

  const config = notificationConfig[contentType];
  if (!config) return null;

  // Hide friend requests sent by current user
  if (contentType === "FriendRequest") {
    if (notification.content.FriendRequest?.sender?.toString() === profileId) {
      return null;
    }
    return (
      <BaseCard
        {...config}
        extraContent={
          <Box sx={{ ml: 6.5 }}>
            <FriendshipButton
              user={notification.content.FriendRequest.friend.sender}
            />
          </Box>
        }
      />
    );
  }

  return <BaseCard {...config} />;
};
const NotificationsButton = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
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
        PaperProps={{ sx: { width: 420, maxHeight: "80vh", mt: 1 } }}
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
            {notifications.map((notification: NotificationType) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                profileId={profile.id}
              />
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationsButton;
