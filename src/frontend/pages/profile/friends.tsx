import React, { useState, useEffect } from "react";
import { List, ListItem, Box, useMediaQuery, useTheme, Button, CircularProgress } from "@mui/material";
import UserAvatarMenu from "../../components/MainComponents/UserAvatarMenu";
import FriendshipButton from "../../components/FriendshipButton";
import { useSelector, useDispatch } from "react-redux";

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
  const dispatch = useDispatch();
  
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const { backendActor } = await import("@/utils/backendUtils");
        if (!backendActor) return;
        
        const count = await backendActor.get_friends_count();
        setTotalCount(count);
        setHasMore(friends.length < count);
      } catch (error) {
        console.error("Error fetching friends count:", error);
      }
    };

    fetchTotalCount();
  }, [friends.length]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const { backendActor } = await import("@/utils/backendUtils");
      if (!backendActor) return;

      const currentCount = friends.length;
      const moreFriends = await backendActor.get_friends_paginated(
        currentCount,
        20,
      );

      if (moreFriends && moreFriends.length > 0) {
        moreFriends.forEach((friend: FEFriend) => {
          dispatch({ 
            type: "ADD_FRIEND", 
            friend,
            user: {
              id: friend.id,
              name: friend.name,
              description: friend.description,
              email: friend.email,
              photo: friend.photo,
            }
          });
        });
      }

      if (moreFriends.length < 20 || (totalCount && friends.length + moreFriends.length >= totalCount)) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more friends:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
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
      
      {hasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loadingMore}
            startIcon={loadingMore ? <CircularProgress size={20} /> : null}
          >
            {loadingMore ? "Loading..." : "Load More Friends"}
          </Button>
        </Box>
      )}
    </>
  );
};

export default FriendsList;
