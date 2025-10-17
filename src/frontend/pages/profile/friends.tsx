import React from "react";
import {
  List,
  ListItem,
  Box,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import UserAvatarMenu from "../../components/MainComponents/UserAvatarMenu";
import FriendshipButton from "../../components/FriendshipButton";
import { useSelector } from "react-redux";

interface FEFriend {
  id: string;
  is_sender: boolean;
  name: string;
  description: string;
  email: string;
  photo: Uint8Array | number[];
}

interface User {
  id: string;
  name: string;
  description: string;
  photo: string;
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const { profile } = useSelector((state: any) => state.filesState);

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <List sx={{ p: 0 }}>
      {friends.map((friend) => {
        const friendUser = {
          id: friend.id,
          name: friend.name,
          description: friend.description,
          email: friend.email,
          photo: friend.photo,
        };

        return (
          <ListItem
            key={friend.id}
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "flex-start" },
              gap: 2,
              py: 2,
              px: { xs: 1, sm: 2 },
              borderBottom: 1,
              borderColor: "divider",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <UserAvatarMenu
                maxWords={10}
                displayDescription
                dispalyName
                user={friendUser}
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                }}
              />
            </Box>

            {currentUser && currentUser.id === profile.id && (
              <Box
                sx={{
                  flexShrink: 0,
                  alignSelf: { xs: "stretch", sm: "flex-start" },
                  mt: { xs: 0, sm: 0.5 },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <FriendshipButton user={friendUser} />
              </Box>
            )}
          </ListItem>
        );
      })}
    </List>
  );
};

export default FriendsList;
