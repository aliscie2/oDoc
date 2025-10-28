import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { formatRelativeTime } from "@/utils/time";
import FriendshipButton from "../FriendshipButton";
import UserAvatarMenu from "../MainComponents/UserAvatarMenu";
import { encodeContractUrl } from "@/utils/urlEncoder";
import { Notification as NotificationType } from "$/declarations/backend/backend.did";
import NotificationsList from "../NotificationsList";
import { useNotificationActions } from "@/hooks/useNotificationActions";

const NotificationCard = ({
  notification,
  onMarkRead,
  profileId,
  compact = false,
}: {
  notification: NotificationType;
  onMarkRead: (id: string) => void;
  profileId: string;
  compact?: boolean;
}) => {
  const navigate = useNavigate();
  const contentType = Object.keys(
    notification.content,
  )[0] as keyof typeof notification.content;

  const cardStyles = {
    transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-1px)" },
    borderRadius: 0,
    position: "relative" as const,
    boxShadow: "none",
    border: "none",
    outline: "none",
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
      {!notification.is_seen && (
        <Box
          sx={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "red",
            opacity: 0.6,
            zIndex: 1,
          }}
        />
      )}
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
            gap: compact ? { xs: 1.5, sm: 2 } : 2,
          }}
        >
          {icon || (
            <UserAvatarMenu user_id={userId!} size={compact ? 48 : 56} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, mb: 0.25, fontSize: "1rem" }}
            >
              {message}
            </Typography>
            {children}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: "0.75rem",
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
      onClick: () => {
        onMarkRead(notification.id);
        navigate(`/user?id=${notification.sender.toString()}`);
      },
    },
    AcceptFriendRequest: {
      userId: getOtherUserId(),
      message: "Accepted friend request",
      onClick: () => {
        onMarkRead(notification.id);
        navigate(`/user?id=${getOtherUserId()}`);
      },
    },
    RejectFriendRequest: {
      userId: notification.sender.toString(),
      message: "Declined friend request",
      onClick: () => {
        onMarkRead(notification.id);
        navigate(`/user?id=${notification.sender.toString()}`);
      },
    },
    CancelFriendRequest: {
      userId: notification.sender.toString(),
      message: "Cancelled friend request",
      onClick: () => {
        onMarkRead(notification.id);
        navigate(`/user?id=${notification.sender.toString()}`);
      },
    },
    Unfriend: {
      userId: notification.sender.toString(),
      message: "Unfriended you",
      onClick: () => {
        onMarkRead(notification.id);
        navigate(`/user?id=${notification.sender.toString()}`);
      },
    },
  };

  if (
    contentType === "NewMessage" &&
    (notification.content as unknown).NewMessage
  ) {
    const msg = (notification.content as unknown).NewMessage;
    notificationConfig.NewMessage = {
      icon: (
        <MessageIcon color="primary" sx={{ fontSize: compact ? 48 : 56 }} />
      ),
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
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mt: 0.25,
              lineHeight: 1.4,
            }}
          >
            {msg.message}
          </Typography>
        </>
      ),
    };
  }

  if (contentType === "CPaymentContract") {
    const [payment] = (notification.content as unknown).CPaymentContract;
    const status = Object.keys(payment.status)[0];

    // Show receiver if current user is sender, otherwise show sender
    const displayUserId =
      profileId === payment.sender.toString()
        ? payment.receiver.toString()
        : payment.sender.toString();

    return (
      <BaseCard
        userId={displayUserId}
        message="New promise"
        onClick={() => {
          onMarkRead(notification.id);
          if (payment.contract_id === "none") {
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
      (notification.content as unknown).FriendRequest?.sender?.toString() ===
      profileId
    )
      return null;

    return (
      <BaseCard
        {...config}
        extraContent={
          <Box sx={{ ml: 5 }} onClick={(e) => e.stopPropagation()}>
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { profile } = useSelector((state: RootState) => state.filesState);
  const { notifications, unreadCount, hasMore } = useSelector(
    (state: RootState) => state.notificationState,
  );

  const { markAsRead, markAllAsRead } = useNotificationActions();

  const handleLoadMore = React.useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const moreNotifications = await backendActor?.get_user_notifications(
        BigInt(notifications.length)
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
  }, [isLoadingMore, hasMore, notifications.length, dispatch]);
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
              width: { xs: "95vw", sm: 380 },
              maxWidth: { xs: "95vw", sm: 380 },
              maxHeight: { xs: "70vh", sm: "65vh" },
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
            p: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "1rem" }}>
            Notifications
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={() => markAllAsRead()}
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                Mark all read
              </Button>
            )}
            {unreadCount > 0 && (
              <IconButton
                onClick={() => markAllAsRead()}
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

        <Box
          sx={{
            maxHeight: { xs: "50vh", sm: "55vh" },
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
          <NotificationsList
            notifications={notifications}
            profileId={profile?.id || ""}
            onMarkRead={markAsRead}
            compact={true}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            emptyMessage="No notifications"
          />
        </Box>
      </Menu>
    </>
  );
};

export { NotificationCard };
export default NotificationsButton;
