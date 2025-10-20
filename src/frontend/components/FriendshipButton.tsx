import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "../utils/backendUtils";
import { Box, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import { Notification } from "$/declarations/backend/backend.did";

interface FEFriend {
  id: string;
  is_sender: boolean;
  confirmed: boolean;
  name: string;
  description: string;
  email: string;
  photo: Uint8Array | number[];
}

interface User {
  id: string;
  name: string;
  description: string;
  email: string;
  photo: Uint8Array | number[];
}

interface FriendshipButtonProps {
  user: User;
  onActionComplete?: () => void;
}

const FriendshipButton: React.FC<FriendshipButtonProps> = ({
  user,
  onActionComplete,
}) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const { profile, friends } = useSelector(
    (state: { filesState: { profile: User; friends: FEFriend[] } }) =>
      state.filesState,
  );

  const { notifications } = useSelector(
    (state: { notificationState: { notifications: Notification[] } }) =>
      state.notificationState,
  );

  const markNotificationAsSeen = async (userId: string) => {
    const notification = notifications.find((n) => {
      const contentType = Object.keys(n.content)[0];
      if (contentType === "FriendRequest" && "FriendRequest" in n.content) {
        const friendReq = n.content.FriendRequest;
        // Check if userId is in the concatenated friend ID or in sender/receiver
        return (
          friendReq?.friend?.id?.includes(userId) ||
          friendReq?.friend?.sender?.id === userId ||
          friendReq?.friend?.receiver?.id === userId
        );
      }
      return false;
    });

    if (notification) {
      await backendActor?.see_notifications([notification.id]);
      dispatch({ type: "NOTIFICATION_SEEN", id: notification.id });
    }

    if (onActionComplete) onActionComplete();
  };
  const handleAction = async (
    action: () => Promise<{ Ok?: unknown; Err?: string }>,
    successCallback: () => void,
    shouldMarkNotification: boolean = false,
  ) => {
    if (!backendActor || isLoading || !user) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await action();

      if (result && "Err" in result) {
        enqueueSnackbar(result.Err, { variant: "error" });

        return;
      }

      if (result && "Ok" in result) {
        successCallback();

        if (shouldMarkNotification) {
          await markNotificationAsSeen(user.id);
        }

        enqueueSnackbar("Action completed successfully", {
          variant: "success",
        });
      }
    } catch {
      enqueueSnackbar("Failed to perform action", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = () => {
    handleAction(
      async () => {
        const res = await backendActor.send_friend_request(user.id);

        if ("Ok" in res) {
          dispatch({
            type: "ADD_FRIEND",
            friend: {
              id: res.Ok.id,
              is_sender: true,
              confirmed: false,
              name: res.Ok.name,
              description: res.Ok.description,
              email: res.Ok.email,
              photo: res.Ok.photo,
            },
            user: res.Ok,
          });
        }
        return res;
      },
      () => {},
      false,
    );
  };

  const handleAcceptRequest = () => {
    handleAction(
      async () => {
        const res = await backendActor.accept_friend_request(user.id);

        return res;
      },
      () => {
        dispatch({
          type: "UPDATE_FRIEND",
          id: user.id,
          confirmed: true,
        });
      },
      true,
    );
  };

  const handleRejectRequest = () => {
    handleAction(
      async () => {
        const res = await backendActor.reject_friend_request(user.id);

        return res;
      },
      () => {
        dispatch({
          type: "REMOVE_FRIEND",
          id: user.id,
        });
      },
      true,
    );
  };

  const handleCancelRequest = () => {
    handleAction(
      async () => {
        const res = await backendActor.cancel_friend_request(user.id);

        return res;
      },
      () => {
        dispatch({
          type: "REMOVE_FRIEND",
          id: user.id,
        });
      },
      false,
    );
  };

  const handleUnfriend = () => {
    handleAction(
      async () => {
        const res = await backendActor.unfriend(user.id);

        return res;
      },
      () => {
        dispatch({
          type: "REMOVE_FRIEND",
          id: user.id,
        });
      },
      false,
    );
  };

  if (!profile || !user) {
    return null;
  }

  const friendRelation = friends.find((friend) => friend.id === user.id);

  const isFriend = friendRelation?.confirmed;
  const isRequestSender =
    friendRelation && !friendRelation.confirmed && friendRelation.is_sender;
  const isRequestReceiver =
    friendRelation && !friendRelation.confirmed && !friendRelation.is_sender;

  const buttonSx = {
    borderRadius: 2,
    px: { xs: 2, sm: 3 },
    py: { xs: 0.5, sm: 1 },
    fontSize: { xs: "0.75rem", sm: "0.875rem" },
    minWidth: { xs: "auto", sm: 120 },
    whiteSpace: "nowrap",
  };

  if (isFriend) {
    return (
      <Button
        onClick={handleUnfriend}
        variant="outlined"
        color="error"
        size="small"
        startIcon={<PersonRemoveIcon />}
        disabled={isLoading}
        sx={buttonSx}
      >
        {isLoading ? "..." : "Unfriend"}
      </Button>
    );
  }

  if (isRequestSender) {
    return (
      <Button
        onClick={handleCancelRequest}
        variant="outlined"
        color="error"
        size="small"
        startIcon={<CancelIcon />}
        disabled={isLoading}
        sx={buttonSx}
      >
        {isLoading ? "..." : "Cancel"}
      </Button>
    );
  }

  if (isRequestReceiver) {
    return (
      <Box
        sx={{ display: "flex", gap: 1, flexWrap: { xs: "wrap", sm: "nowrap" } }}
      >
        <Button
          onClick={handleAcceptRequest}
          variant="contained"
          size="small"
          startIcon={<CheckCircleIcon />}
          disabled={isLoading}
          sx={buttonSx}
        >
          {isLoading ? "..." : "Accept"}
        </Button>
        <Button
          onClick={handleRejectRequest}
          variant="outlined"
          color="error"
          size="small"
          startIcon={<CancelIcon />}
          disabled={isLoading}
          sx={buttonSx}
        >
          {isLoading ? "..." : "Decline"}
        </Button>
      </Box>
    );
  }

  return (
    <Button
      onClick={handleSendRequest}
      variant="contained"
      size="small"
      startIcon={<PersonAddIcon />}
      disabled={isLoading}
      sx={buttonSx}
    >
      {isLoading ? "..." : "Add Friend"}
    </Button>
  );
};

export default FriendshipButton;
