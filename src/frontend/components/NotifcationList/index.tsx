import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { formatRelativeTime } from "@/utils/time";
import MessageIcon from "@mui/icons-material/Message";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
// import { useSnackbar } from "notistack";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const contentType = Object.keys(
    notification.content,
  )[0] as keyof typeof notification.content;

  const cardStyles = {
    mb: 1,
    mx: { xs: 0.5, sm: 1 },
    outline: notification.is_seen ? "" : "2px solid lightblue",
    opacity: notification.is_seen ? 0.6 : 1,
    transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-1px)", opacity: 1 },
    borderRadius: { xs: 1, sm: 1 },
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
      <CardContent
        sx={{
          p: { xs: 1, sm: 1.5 },
          "&:last-child": { pb: { xs: 1, sm: 1.5 } },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          {icon || <UserAvatarMenu user_id={userId!} size={36} />}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 0.25, fontSize: "0.95rem" }}
            >
              {message}
            </Typography>
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
    }
  > = {
    FriendRequest: {
      userId: notification.sender?.toString(),
      message: "Friend request",
    },
    AcceptFriendRequest: {
      userId: getOtherUserId(),
      message: "Accepted friend request",
      onClick: () => onMarkRead(notification.id),
    },
    RejectFriendRequest: {
      userId: notification.sender.toString(),
      message: "Declined friend request",
      onClick: () => onMarkRead(notification.id),
    },
    CancelFriendRequest: {
      userId: notification.sender.toString(),
      message: "Cancelled friend request",
      onClick: () => onMarkRead(notification.id),
    },
    Unfriend: {
      userId: notification.sender.toString(),
      message: "Unfriended you",
      onClick: () => onMarkRead(notification.id),
    },
  };

  if (
    contentType === "NewMessage" &&
    (notification.content as any).NewMessage
  ) {
    const msg = (notification.content as any).NewMessage;
    notificationConfig.NewMessage = {
      icon: <MessageIcon color="primary" sx={{ fontSize: 36 }} />,
      onClick: () => onMarkRead(notification.id),
      message: "New message",
      children: (
        <>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.75rem" }}
          >
            from {msg.sender.toString()}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              mt: 0.25,
            }}
          >
            {msg.message}
          </Typography>
        </>
      ),
    };
  }

  if (contentType === "CPaymentContract") {
    const [payment] = (notification.content as any).CPaymentContract;
    const status = Object.keys(payment.status)[0];

    return (
      <BaseCard
        userId={payment.sender.toString()}
        message="New promise"
        onClick={() => {
          if (payment.contract_id==="none"){
              navigate(`/wallet`);
          } else {
            const encoded = encodeContractUrl({
            id: payment.contract_id,
            owner: payment.sender.toString(),
          });
          navigate(`/contract?data=${encoded}`);
          }
          
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
          <Chip
            label={status}
            size="small"
            color={status === "Pending" ? "warning" : "success"}
            sx={{ height: 18, fontSize: "0.65rem" }}
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "primary.main" }}
          >
            {payment.amount}$
          </Typography>
        </Box>
      </BaseCard>
    );
  }

  const config = notificationConfig[contentType];
  if (!config) return null;

  if (contentType === "FriendRequest") {
    if (
      (notification.content as any).FriendRequest?.sender?.toString() ===
      profileId
    )
      return null;

    return (
      <BaseCard
        {...config}
        extraContent={
          <Box sx={{ ml: 5 }}>
            <FriendshipButton
              user={
                (notification.content as unknown).FriendRequest.friend.sender
              }
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
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // const { enqueueSnackbar } = useSnackbar();
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
  const isNotificationsPage = useLocation().pathname === "/notifications";

  const handleNotificationClick = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile) {
      navigate("/notifications");
    } else {
      setAnchorEl(e.currentTarget);
    }
  };

  const handleExpandClick = () => {
    setAnchorEl(null);
    navigate("/notifications");
  };
  // if (isNotificationsPage){
  //   return null
  // }
  return (
    <>
      <IconButton onClick={handleNotificationClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: "95vw", sm: 420 },
              maxWidth: { xs: "95vw", sm: 420 },
              maxHeight: { xs: "70vh", sm: "80vh" },
              mt: 1,
              borderRadius: { xs: 1.5, sm: 1 },
              boxShadow: { xs: "0 8px 32px rgba(0,0,0,0.12)", sm: 3 },
            },
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: { xs: "rgba(0,0,0,0.3)", sm: "transparent" },
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
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllRead}
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                Mark all read
              </Button>
            )}
            {unreadCount > 0 && (
              <IconButton
                onClick={handleMarkAllRead}
                size="small"
                sx={{
                  display: { xs: "flex", sm: "none" },
                  bgcolor: "action.hover",
                }}
              >
                <NotificationsIcon fontSize="small" />
              </IconButton>
            )}
            {!isNotificationsPage && (
              <IconButton
                onClick={handleExpandClick}
                size="small"
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                <OpenInFullIcon />
              </IconButton>
            )}
            <IconButton
              onClick={() => setAnchorEl(null)}
              size="small"
              sx={{
                display: { xs: "flex", sm: "none" },
                ml: 0.5,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: { xs: "50vh", sm: "60vh" },
              overflowY: "auto",
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
            <List sx={{ p: 0, pb: 1 }}>
              {notifications.map((notification: NotificationType) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  profileId={profile?.id || ""}
                />
              ))}
            </List>
          </Box>
        )}
      </Menu>
    </>
  );
};

export { NotificationCard };
export default NotificationsButton;
