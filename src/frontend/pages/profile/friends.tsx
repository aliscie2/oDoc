import React from "react";
import { Chip, List, ListItem, ListItemText, Stack } from "@mui/material";
import UserAvatarMenu from "../../components/MainComponents/UserAvatarMenu";
import FriendshipButton from "../../components/FriendshipButton";
import { useSelector } from "react-redux";

interface Review {
  rating: number;
  comment: string;
  timestamp: string;
  reviewerId: string;
  reviewerName: string;
}

interface User {
  id: string;
  name: string;
  description: string;
  photo: string;
  reviews?: Review[];
  averageRating?: number;
}

interface FEFriend {
  id: string;
  is_sender: boolean;
  name: string;
  description: string;
  email: string;
  photo: Uint8Array | number[];
}

interface Chat {
  id: string;
  name: string;
  messages: Array<{
    id: string;
    sender: string;
    content: string;
    timestamp: string;
  }>;
  members: string[];
  admins: string[];
}

interface ChatWindowPosition {
  x: number;
  y: number;
}

interface FriendsListProps {
  friends: FEFriend[];
  currentUser: User;
  onAcceptFriend: (friendId: string) => void;
  onRejectFriend: (friendId: string) => void;
  onCancelRequest: (friendId: string) => void;
  onUnfriend: (friendId: string) => void;
  onSendMessage: (userId: string, message: string) => void;
  onRateUser: (userId: string, rating: number) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, currentUser }) => {
  const { Anonymous, profile } = useSelector((state: any) => state.filesState);

  return (
    <>
      <List>
        {friends.map((friend) => {
          // FEFriend contains the friend's info directly
          const friendUser = {
            id: friend.id,
            name: friend.name,
            description: friend.description,
            email: friend.email,
            photo: friend.photo
          };
          return (
            <ListItem
              key={friend.id}
              secondaryAction={
                currentUser &&
                currentUser.id == profile.id && (
                  <FriendshipButton
                    profile={currentUser}
                    user={friendUser}
                    friends={friends}
                  />
                )
              }
            >
              <UserAvatarMenu
                user={friendUser}
                // onMessageClick={() => setSelectedUser(friendUser)}
              />
              <ListItemText
                primary={friend.name}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={friend.description}
                      size="small"
                      color="success"
                    />
                  </Stack>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default FriendsList;
