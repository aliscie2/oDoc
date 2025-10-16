import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "../utils/backendUtils";
import { Box, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
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
  profile?: User;
  user: User;
  friends: FEFriend[];
}

const FriendshipButton: React.FC<FriendshipButtonProps> = ({ user }) => {
  const dispatch = useDispatch();

  const { profile, friends } = useSelector(
    (state: { filesState: { profile: User; friends: FEFriend[] } }) =>
      state.filesState,
  );
  // Using direct backendActor import
  const [isLoading, setIsLoading] = useState(false);

  const [localFriends, setLocalFriends] = useState(friends);

  const { enqueueSnackbar } = useSnackbar();

  const handleAction = async (
    action: () => Promise<{ Ok?: User; Err?: string }>,
    updateFunction: () => void,
  ) => {
    if (!backendActor || isLoading) return;
    setIsLoading(true);
    try {
      const result = await action();
      if (result && "Err" in result) {
        enqueueSnackbar(result.Err, { variant: "error" });
        return;
      }
      updateFunction();
    } catch (error) {
      console.error("Error performing friend action:", error);
      enqueueSnackbar("Failed to perform action", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = () =>
    handleAction(
      async () => {
        const res = await backendActor.send_friend_request(user.id);
        if ("Ok" in res) {
          const friend = {
            id: res.Ok.id,
            is_sender: true,
            confirmed: false,
            name: res.Ok.name,
            description: res.Ok.description,
            email: res.Ok.email,
            photo: res.Ok.photo,
          };
          dispatch({ type: "ADD_FRIEND", friend, user: res.Ok });
        }
        return res;
      },
      () => {
        const newFriend = {
          id: user.id,
          is_sender: true,
          confirmed: false,
          name: user.name,
          description: user.description,
          email: user.email,
          photo: user.photo,
        };
        setLocalFriends([...localFriends, newFriend]);
      },
    );

  const handleAcceptRequest = () =>
    handleAction(
      async () => {
        return await backendActor.accept_friend_request(user.id);
      },
      () => {
        setLocalFriends(
          localFriends.map((friend: FEFriend) =>
            friend.id === user.id ? { ...friend, confirmed: true } : friend,
          ),
        );
      },
    );

  const handleRejectRequest = () =>
    handleAction(
      async () => {
        return await backendActor.reject_friend_request(user.id);
      },
      () => {
        setLocalFriends(
          localFriends.filter((friend: FEFriend) => friend.id !== user.id),
        );
      },
    );

  const handleCancelRequest = () =>
    handleAction(
      async () => {
        return await backendActor.cancel_friend_request(user.id);
      },
      () => {
        setLocalFriends(
          localFriends.filter(
            (friend: FEFriend) => !(friend.id === user.id && friend.is_sender),
          ),
        );
      },
    );

  const handleUnfriend = () =>
    handleAction(
      async () => {
        return await backendActor.unfriend(user.id);
      },
      () => {
        setLocalFriends(
          localFriends.filter((friend: FEFriend) => friend.id !== user.id),
        );
      },
    );
  if (!profile || !user) return null;

  const friendRelation = localFriends.find(
    (friend: FEFriend) => friend.id === user.id,
  );

  // Determine the relationship status based on confirmed and is_sender fields
  // If friend exists and confirmed is true, we are friends
  // If friend exists, confirmed is false, and is_sender is true, we sent a pending request
  // If friend exists, confirmed is false, and is_sender is false, we received a pending request
  // If no friend relation exists, we can send a request
  const isFriend = friendRelation && friendRelation.confirmed;
  const isRequestSender =
    friendRelation && !friendRelation.confirmed && friendRelation.is_sender;
  const isRequestReceiver =
    friendRelation && !friendRelation.confirmed && !friendRelation.is_sender;

  const buttonStyle = {
    padding: "8px 16px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
    margin: "4px",
  };

  const primaryButton = {
    ...buttonStyle,
    backgroundColor: "#1976d2",
    color: "white",
    "&:hover": {
      backgroundColor: "#1565c0",
    },
  };

  const secondaryButton = {
    ...buttonStyle,
    backgroundColor: "#dc3545",
    color: "white",
    "&:hover": {
      backgroundColor: "#c82333",
    },
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
      sx={{ borderRadius: 2 }}
    >
      {isLoading ? "Processing..." : "Unfriend"}
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
      sx={{ borderRadius: 2 }}
    >
      {isLoading ? "Processing..." : "Cancel Request"}
    </Button>
  );
}

if (isRequestReceiver) {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button
        onClick={handleAcceptRequest}
        variant="contained"
        size="small"
        startIcon={<CheckCircleIcon />}
        disabled={isLoading}
        sx={{ borderRadius: 2 }}
      >
        {isLoading ? "Processing..." : "Accept"}
      </Button>
      <Button
        onClick={handleRejectRequest}
        variant="outlined"
        color="error"
        size="small"
        startIcon={<CancelIcon />}
        disabled={isLoading}
        sx={{ borderRadius: 2 }}
      >
        {isLoading ? "Processing..." : "Decline"}
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
    sx={{ borderRadius: 2 }}
  >
    {isLoading ? "Processing..." : "Add Friend"}
  </Button>
);
};

export default FriendshipButton;
