import React from "react";
import { useSnackbar } from "notistack";
import { backendActor } from "../utils/backendUtils";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface FEFriend {
  id: string;
  is_sender: boolean;
  name: string;
  description: string;
  email: string;
  photo: Uint8Array | number[];
}

interface FriendshipButtonProps {
  profile: any;
  user: any;
  friends: FEFriend[];
}

const FriendshipButton: React.FC<FriendshipButtonProps> = ({ user }) => {
  const dispatch = useDispatch();

  const { profile, friends } = useSelector((state: any) => state.filesState);
  // Using direct backendActor import
  const [isLoading, setIsLoading] = useState(false);

  const [localFriends, setLocalFriends] = useState(friends);

  const { enqueueSnackbar } = useSnackbar();

  const handleAction = async (
    action: () => Promise<any>,
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
            friend.id === user.id ? { ...friend, is_sender: false } : friend,
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

  // With FEFriend, we need to determine the relationship status differently
  // If friend exists and is_sender is false, it means we are friends (confirmed)
  // If friend exists and is_sender is true, it means we sent a request (pending)
  // If no friend relation exists, we can send a request
  const isFriend = friendRelation && !friendRelation.is_sender;
  const isRequestSender = friendRelation && friendRelation.is_sender;
  const isRequestReceiver = false; // This would need to be determined differently with FEFriend

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
      <button
        onClick={handleUnfriend}
        style={secondaryButton}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Unfriend"}
      </button>
    );
  }

  if (isRequestSender) {
    return (
      <button
        onClick={handleCancelRequest}
        style={secondaryButton}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Cancel Request"}
      </button>
    );
  }

  if (isRequestReceiver) {
    return (
      <div>
        <button
          onClick={handleAcceptRequest}
          style={primaryButton}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Accept Request"}
        </button>
        <button
          onClick={handleRejectRequest}
          style={secondaryButton}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Reject Request"}
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={handleSendRequest}
      style={primaryButton}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Send Friend Request"}
    </button>
  );
};

export default FriendshipButton;
