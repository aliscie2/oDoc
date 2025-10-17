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
import { Tooltip } from "@mui/material";
import MarkdownMessage from "@/chatBot/markDownMessageRdnder";

interface UserAvatarMenuProps {
  user?: User;
  sx?: unknown;
  hide?: string[];
  user_id?: string;
  onMessageClick?: (user: User) => void;
  dispalyName?: boolean;
  displayDescription?: boolean;
  displayId?: boolean;
  maxWords?: number;
}
const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  user: initialUser,
  sx,
  hide = [],
  user_id,
  onMessageClick,
  dispalyName = false,
  displayDescription = false,
  displayId = false,
  maxWords = 50,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState("Click to copy User ID");

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
          if ("Ok" in response) setUser(response.Ok);
        }
        setLoading(false);
        setCalled(true);
      }
    })();
  }, [isCalled, user_id, all_friends]);

  if (isLoading) return <CircularProgress />;

  if (!user) {
    return (
      <Avatar sx={{ width: 28, height: 28, bgcolor: "success.main" }}>
        <PersonIcon fontSize="small" />
      </Avatar>
    );
  }

  const getUserPhoto = () => {
    if (user.photo?.length > 0) return user.photo;
    const userPost = posts.find((p) => p.creator.id === user.id);
    return userPost?.creator.photo?.length > 0 ? userPost.creator.photo : null;
  };

  const truncateDescription = (text: string) => {
    const maxChars = maxWords * 10;
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars);
  };

  const shouldShowReadMore = (text: string) => {
    return text.length > maxWords * 10;
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopyTooltip("Copied ✓");
      setTimeout(() => setCopyTooltip("Click to copy User ID"), 2000);
    } catch {
      enqueueSnackbar("Failed to copy ID", { variant: "error" });
    }
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

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
      const existingChat = chats.find(
        (chat) =>
          chat.name === "private_chat" &&
          chat.members.some((member) => member.toString() === user.id),
      );

      if (existingChat) {
        dispatch({ type: "OPEN_CHAT", chatId: existingChat.id });
      } else {
        const tempChatId = `temp_${randomString()}`;
        const newChat = {
          id: tempChatId,
          name: "private_chat",
          messages: [],
          members: [
            Principal.fromText(profile.id),
            Principal.fromText(user.id),
          ],
          admins: [Principal.fromText(profile.id), Principal.fromText(user.id)],
          creator: Principal.fromText(profile.id),
          workspaces:
            currentWorkspace?.name !== "default" ? [currentWorkspace.id] : [],
        };

        dispatch({ type: "ADD_CHAT", chat: newChat });
        dispatch({ type: "OPEN_CHAT", chatId: tempChatId });

        const result = await backendActor.make_new_chat_room(newChat);
        if ("Ok" in result) {
          const realChatId = result.Ok.id || tempChatId;
          dispatch({
            type: "UPDATE_CHAT",
            chat: { ...newChat, id: realChatId },
          });
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
        rating,
        comment,
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

  const currentPath = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const pageUserId = urlParams.get("id");
  const isProfilePage = currentPath === "/profile" && user.id === profile?.id;
  const isUserPageSameUser = currentPath === "/user" && pageUserId === user.id;

  return (
    <>
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        <IconButton
          disabled={user.id === profile?.id || isProfilePage}
          onMouseEnter={isProfilePage ? undefined : handleOpen}
          onClick={isProfilePage ? undefined : handleOpen}
          sx={{ p: 0 }}
        >
          <Avatar src={getUserPhoto() || undefined} alt={user.name} sx={sx}>
            {user.name?.charAt(0) || "A"}
          </Avatar>
        </IconButton>
        {(dispalyName || displayDescription || displayId) && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {dispalyName && (
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {user.name || "Anonymous"}
              </Typography>
            )}
            {displayId && (
              <Tooltip title={copyTooltip} arrow>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    cursor: "pointer",
                    fontFamily: "monospace",
                    display: "inline-block",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={handleCopyId}
                >
                  {user.id}
                </Typography>
              </Tooltip>
            )}
            {displayDescription && user.description && (
              <Box>
                <Box
                  sx={{
                    maxHeight: isExpanded ? 300 : "auto",
                    overflowY: isExpanded ? "auto" : "visible",
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(0,0,0,.2)",
                      borderRadius: "3px",
                    },
                  }}
                >
                  <MarkdownMessage
                    message={
                      isExpanded
                        ? user.description
                        : truncateDescription(user.description)
                    }
                  />
                </Box>
                {shouldShowReadMore(user.description) && (
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{
                      cursor: "pointer",
                      fontWeight: 500,
                      display: "block",
                      mt: 0.5,
                    }}
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? "show less" : "read more..."}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 280,
            maxWidth: 320,
            mt: 1,
            borderRadius: 2,
            overflow: "visible",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {!isUserPageSameUser && (
          <Box sx={{ p: 2.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                mb: 1.5,
              }}
            >
              <Avatar
                src={getUserPhoto() || undefined}
                alt={user.name}
                sx={{
                  width: 56,
                  height: 56,
                  border: "3px solid",
                  borderColor: "divider",
                }}
              >
                {user.name?.charAt(0) || "A"}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, mb: 0.5, fontSize: "1.1rem" }}
                >
                  {user.name || "Anonymous"}
                </Typography>
                {user.description && (
                  <Box
                    sx={{
                      maxHeight: 60,
                      overflowY: "auto",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      "&::-webkit-scrollbar": {
                        width: "4px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0,0,0,.2)",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    <MarkdownMessage message={user.description} />
                  </Box>
                )}
              </Box>
            </Box>

            {user && profile && user.id !== profile.id && (
              <Box sx={{ mt: 2 }}>
                <FriendshipButton user={user} />
              </Box>
            )}
          </Box>
        )}

        <Box
          sx={{
            borderTop: isUserPageSameUser ? 0 : 1,
            borderColor: "divider",
            py: 1,
          }}
        >
          {!hide.includes("Profile") && (
            <MenuItem
              onClick={handleProfile}
              sx={{ px: 2.5, py: 1.25, "&:hover": { bgcolor: "action.hover" } }}
            >
              <Person sx={{ mr: 2, fontSize: 22, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                View Profile
              </Typography>
            </MenuItem>
          )}
          {!hide.includes("Message") && (
            <MenuItem
              onClick={handleMessage}
              sx={{ px: 2.5, py: 1.25, "&:hover": { bgcolor: "action.hover" } }}
            >
              <MessageIcon
                sx={{ mr: 2, fontSize: 22, color: "text.secondary" }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Send Message
              </Typography>
            </MenuItem>
          )}
          {!hide.includes("Review") && (
            <MenuItem
              onClick={handleReviewClick}
              sx={{ px: 2.5, py: 1.25, "&:hover": { bgcolor: "action.hover" } }}
            >
              <Star sx={{ mr: 2, fontSize: 22, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Write Review
              </Typography>
            </MenuItem>
          )}
        </Box>
      </Menu>

      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 400 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>Review {user.name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography component="legend" sx={{ mb: 1, fontWeight: 500 }}>
            Rating
          </Typography>
          <UiRating
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
            size="large"
            sx={{ mb: 2 }}
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
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setReviewOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleReviewSubmit}
            disabled={isSubmitting}
            variant="contained"
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
