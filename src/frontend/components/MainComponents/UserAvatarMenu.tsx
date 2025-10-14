import { Rating, User } from "$/declarations/backend/backend.did";
import { Principal } from "@dfinity/principal";
import { Message as MessageIcon, Person, Star } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Rating as UiRating,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { randomString } from "@/DataProcessing/dataSamples";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import FriendshipButton from "../FriendshipButton";

interface UserAvatarMenuProps {
  user?: User;
  sx?: unknown;
  hide?: string[];
  user_id?: string;
  onMessageClick?: (user: User) => void;
}

const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  user: initialUser,
  sx,
  hide = [],
  user_id,
  onMessageClick,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { chats } = useSelector((state: RootState) => state.chatsState);
  const { profile, posts, friends, all_friends, currentWorkspace } =
    useSelector((state: RootState) => state.filesState);

  const [user, setUser] = useState<User | undefined>(initialUser);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalled, setCalled] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    (async () => {
      if (user_id && !isCalled) {
        setLoading(true);
        const foundUser = all_friends?.find((f) => f.id === user_id);
        if (foundUser) {
          setUser(foundUser);
        } else {
          const response = await backendActor.get_user(user_id);
          if ("Ok" in response) {
            setUser(response.Ok);
          }
        }
        setLoading(false);
        setCalled(true);
      }
    })();
  }, [isCalled, user_id, all_friends]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!user) {
    return (
      <Avatar sx={{ width: 28, height: 28, bgcolor: "success.main" }}>
        <PersonIcon fontSize="small" />
      </Avatar>
    );
  }

  const getUserPhoto = () => {
    if (user.photo && user.photo.length > 0) {
      return user.photo;
    }
    const userPost = posts.find((p) => p.creator.id === user.id);
    return userPost?.creator.photo?.length > 0
      ? userPost.creator.photo
      : null;
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate(`/user?id=${user.id}`);
    handleClose();
  };
  
const handleMessage = async () => {
  handleClose();
  
  if (onMessageClick && user) {
    onMessageClick(user);
    return;
  }

  try {
    let existingChat = chats.find((chat) =>
      chat.name === "private_chat" && chat.members.some((member) => member.toString() === user.id)
    );

    if (existingChat) {
      dispatch({ type: "OPEN_CHAT", chatId: existingChat.id });
    } else {
      const tempChatId = `temp_${randomString()}`;
      const newChat = {
        id: tempChatId,
        name: "private_chat",
        messages: [],
        members: [Principal.fromText(profile.id), Principal.fromText(user.id)],
        admins: [Principal.fromText(profile.id), Principal.fromText(user.id)],
        creator: Principal.fromText(profile.id),
        workspaces: currentWorkspace?.name !== "default" ? [currentWorkspace.id] : [],
      };

      dispatch({ type: "ADD_CHAT", chat: newChat });
      dispatch({ type: "OPEN_CHAT", chatId: tempChatId });

      const result = await backendActor.make_new_chat_room(newChat);
      if ("Ok" in result) {
        const realChatId = result.Ok.id || tempChatId;
        dispatch({ type: "UPDATE_CHAT", chat: { ...newChat, id: realChatId } });
        enqueueSnackbar("Chat created successfully", { variant: "success" });
      } else {
        dispatch({ type: "DELETE_CHAT", chat_id: tempChatId });
        enqueueSnackbar("Failed to create chat", { variant: "error" });
      }
    }
  } catch {
    enqueueSnackbar("Failed to create chat", { variant: "error" });
  }
};

;

  const handleReviewClick = () => {
    setReviewOpen(true);
    handleClose();
  };

  const handleReviewSubmit = async () => {
    setIsSubmitting(true);
    try {
      const userPrincipal = Principal.fromText(user.id);
      const ratingData: Rating = {
        id: randomString(),
        rating: rating,
        comment: comment,
        date: Date.now() * 1e6,
        user_id: Principal.fromText(user.id),
      };

      const result = await backendActor?.rate_user(userPrincipal, ratingData);

      if (result && "Ok" in result) {
        enqueueSnackbar("Review submitted successfully", {
          variant: "success",
        });
      } else if (result && "Err" in result) {
        enqueueSnackbar(result.Err, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to submit review " + (error as Error).message, {
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
      setReviewOpen(false);
      setRating(0);
      setComment("");
    }
  };

  return (
    <>
      <IconButton
        disabled={user.id === profile?.id}
        onMouseEnter={handleOpen}
        onClick={handleOpen}
      >
        <Avatar src={getUserPhoto() || undefined} alt={user.name} sx={sx}>
          {user.name?.charAt(0) || "A"}
        </Avatar>
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Avatar
              src={getUserPhoto() || undefined}
              alt={user.name}
              sx={{ width: 40, height: 40 }}
            >
              {user.name?.charAt(0) || "A"}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, lineHeight: 1.3 }}
              >
                {user.name || "Anonymous"}
              </Typography>
            </Box>
          </Box>

          {user.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: "0.813rem",
                lineHeight: 1.4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {user.description}
            </Typography>
          )}
        </Box>

        {/* Friend Request Button */}
        {user && profile && user.id !== profile.id && (
          <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <FriendshipButton
              user={user}
              profile={profile}
              friends={friends || []}
            />
          </Box>
        )}

        {/* Menu Items */}
        {!hide.includes("Profile") && (
          <MenuItem onClick={handleProfile}>
            <Person sx={{ mr: 1.5, fontSize: 20 }} />
            <Typography variant="body2">View Profile</Typography>
          </MenuItem>
        )}
        {!hide.includes("Message") && (
          <MenuItem onClick={handleMessage}>
            <MessageIcon sx={{ mr: 1.5, fontSize: 20 }} />
            <Typography variant="body2">Send Message</Typography>
          </MenuItem>
        )}
        {!hide.includes("Review") && (
          <MenuItem onClick={handleReviewClick}>
            <Star sx={{ mr: 1.5, fontSize: 20 }} />
            <Typography variant="body2">Write Review</Typography>
          </MenuItem>
        )}
      </Menu>

      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)}>
        <DialogTitle>Review {user.name}</DialogTitle>
        <DialogContent>
          <Typography component="legend">Rating</Typography>
          <UiRating
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleReviewSubmit}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserAvatarMenu;
