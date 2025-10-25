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
  TypographyVariant,
  Rating as UiRating,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useSnackbar } from "notistack";
import React, { useEffect, useState, useRef } from "react";
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
  sx?: React.CSSProperties;
  hide?: string[];
  user_id?: string;
  onMessageClick?: (user: User) => void;
  dispalyName?: boolean;
  displayDescription?: boolean;
  displayId?: boolean;
  maxWords?: number;
  forceDisplayName?: boolean;
  variant?: TypographyVariant;
  disableMenu?: boolean;
  size?: number;
  subtitle?: string | null;
}

const UserAvatarMenuComponent: React.FC<UserAvatarMenuProps> = ({
  user: initialUser,
  sx,
  hide = [],
  user_id,
  onMessageClick,
  dispalyName = false,
  displayDescription = false,
  displayId = false,
  maxWords = 50,
  forceDisplayName = false,
  variant = "body2",
  disableMenu = false,
  size,
  subtitle = null,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  
  // OPTIMIZATION: Split Redux selectors to reduce unnecessary re-renders
  // Each useSelector creates a separate subscription, so only select what's needed
  const chats = useSelector((state: RootState) => state.chatsState.chats);
  const profile = useSelector((state: RootState) => state.filesState.profile);
  const currentWorkspace = useSelector((state: RootState) => state.filesState.currentWorkspace);
  
  // OPTIMIZATION: Conditionally select posts/friends only when needed
  // This prevents re-renders when these arrays change but aren't being used
  const posts = useSelector((state: RootState) => 
    user_id ? state.filesState.posts : []
  );
  const all_friends = useSelector((state: RootState) => 
    user_id ? state.filesState.all_friends : null
  );

  const [user, setUser] = useState<User | undefined>(initialUser);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState("Click to copy User ID");
  
  // Track which user_id we've already fetched to prevent duplicate fetches
  const fetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      if (initialUser.id) {
        fetchedUserIdRef.current = initialUser.id;
      }
    }
  }, [initialUser]);

  useEffect(() => {
    // Skip if no user_id or already fetched this user_id
    if (!user_id || fetchedUserIdRef.current === user_id) return;
    
    (async () => {
      // If user_id matches profile, use profile directly
      if (profile?.id === user_id) {
        setUser(profile);
        fetchedUserIdRef.current = user_id;
        return;
      }
      
      // Try to find in friends list first
      const foundUser = all_friends?.find((f) => f.id === user_id);
      if (foundUser) {
        setUser(foundUser);
        fetchedUserIdRef.current = user_id;
        return;
      }
      
      // Only fetch from backend if not found locally
      setLoading(true);
      try {
        const response = await backendActor.get_user(user_id);
        // console.log({response, user_id})
        if ("Ok" in response) {
          setUser(response.Ok);
          fetchedUserIdRef.current = user_id;
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [user_id, all_friends, profile]);

  if (isLoading) return <CircularProgress />;

  if (!user) {
    return (
      <Avatar sx={{ width: 28, height: 28, bgcolor: "success.main", ...sx }}>
        <PersonIcon fontSize="small" />
      </Avatar>
    );
  }

  const getUserPhoto = () => {
    if (
      user.photo &&
      (typeof user.photo === "string" || user.photo.length > 0)
    ) {
      return user.photo;
    }
    const userPost = posts.find((p) => p.creator.id === user.id);
    if (
      userPost?.creator.photo &&
      (typeof userPost.creator.photo === "string" ||
        userPost.creator.photo.length > 0)
    ) {
      return userPost.creator.photo;
    }
    return null;
  };

  const truncateDescription = (text: string) => {
    const maxChars = maxWords * 10;
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars);
  };

  const shouldShowReadMore = (text: string) => {
    return text.length > maxWords * 10;
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
      "#F8B739",
      "#52B788",
      "#E76F51",
      "#2A9D8F",
      "#E9C46A",
      "#F4A261",
      "#264653",
    ];
    const charCode =
      name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
    return colors[charCode % colors.length];
  };

  const getInitials = (name: string) => {
    if (!name) return "A";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (
      words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
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

    if (!profile) {
      enqueueSnackbar("Profile not loaded", { variant: "error" });
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
            Principal.fromText(profile!.id),
            Principal.fromText(user.id),
          ],
          admins: [
            Principal.fromText(profile!.id),
            Principal.fromText(user.id),
          ],
          creator: Principal.fromText(profile!.id),
          workspaces:
            currentWorkspace?.name !== "default" && currentWorkspace?.id
              ? [currentWorkspace.id]
              : [],
        };

        dispatch({ type: "ADD_CHAT", chat: newChat });
        dispatch({ type: "OPEN_CHAT", chatId: tempChatId });

        const result = await backendActor.make_new_chat_room(newChat);
        if ("Ok" in result) {
          const realChatId = result.Ok || tempChatId;
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

  const avatarSize = size || (sx?.width as number) || 40;
  const fontSize = avatarSize * 0.4;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: dispalyName && !displayDescription && !displayId ? 1 : 2,
          alignItems: "center",
          position: "relative",
        }}
      >
        <IconButton
          disabled={user.id === profile?.id || isProfilePage || disableMenu}
          onMouseEnter={isProfilePage || disableMenu ? undefined : handleOpen}
          onClick={isProfilePage || disableMenu ? undefined : handleOpen}
          sx={{ p: 0 }}
        >
          <Avatar
            src={getUserPhoto() || undefined}
            alt={user.name}
            sx={{
              width: avatarSize,
              height: avatarSize,
              ...sx,
              bgcolor: getUserPhoto()
                ? undefined
                : getAvatarColor(user.name || "Anonymous"),
              fontWeight: 600,
              fontSize: `${fontSize}px`,
            }}
          >
            {getInitials(user.name || "Anonymous")}
          </Avatar>
        </IconButton>
        {(dispalyName ||
          forceDisplayName ||
          displayDescription ||
          displayId ||
          subtitle) && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {(dispalyName || forceDisplayName || subtitle) && (
              <Typography
                variant={variant}
                sx={{
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  fontSize: size ? `${size * 0.3}px` : undefined,
                }}
              >
                {forceDisplayName
                  ? user.name || "Anonymous"
                  : profile?.id === user.id
                    ? "You"
                    : user.name || "Anonymous"}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  fontSize: size ? `${size * 0.25}px` : "0.875rem",
                  mt: 0.25,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
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
                    maxHeight: isExpanded ? 300 : 60,
                    overflowY: isExpanded ? "auto" : "hidden",
                    "&::-webkit-scrollbar": { width: "6px" },
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
                  bgcolor: getUserPhoto()
                    ? undefined
                    : getAvatarColor(user.name || "Anonymous"),
                  fontWeight: 600,
                  fontSize: "1.5rem",
                }}
              >
                {getInitials(user.name || "Anonymous")}
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

// Memoize component to prevent unnecessary re-renders when props haven't changed
const UserAvatarMenu = React.memo(UserAvatarMenuComponent, (prevProps, nextProps) => {
  // Custom comparison function - return true if props are equal (skip re-render)
  return (
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.user_id === nextProps.user_id &&
    prevProps.dispalyName === nextProps.dispalyName &&
    prevProps.displayDescription === nextProps.displayDescription &&
    prevProps.displayId === nextProps.displayId &&
    prevProps.maxWords === nextProps.maxWords &&
    prevProps.forceDisplayName === nextProps.forceDisplayName &&
    prevProps.variant === nextProps.variant &&
    prevProps.disableMenu === nextProps.disableMenu &&
    prevProps.size === nextProps.size &&
    prevProps.subtitle === nextProps.subtitle &&
    (prevProps.hide?.length || 0) === (nextProps.hide?.length || 0) &&
    prevProps.onMessageClick === nextProps.onMessageClick
  );
});

UserAvatarMenu.displayName = 'UserAvatarMenu';

export default UserAvatarMenu;
