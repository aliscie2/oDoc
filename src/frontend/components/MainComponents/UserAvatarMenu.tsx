import { Rating, User } from "$/declarations/backend/backend.did";
import { Principal } from "@dfinity/principal";
import { Message as MessageIcon, Person, Star } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar,
  AvatarGroup,
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
// Hooks
const useUserData = (initialUser?: User, user_id?: string) => {
  const profile = useSelector((state: RootState) => state.filesState.profile);
  const all_friends = useSelector((state: RootState) =>
    user_id ? state.filesState.all_friends : null,
  );
  const posts = useSelector((state: RootState) =>
    user_id ? state.filesState.posts : [],
  );

  const [user, setUser] = useState<User | undefined>(initialUser);
  const [isLoading, setLoading] = useState(false);
  const fetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      if (initialUser.id) fetchedUserIdRef.current = initialUser.id;
    }
  }, [initialUser]);

  useEffect(() => {
    if (!user_id || fetchedUserIdRef.current === user_id) return;

    (async () => {
      console.log("[UserAvatarMenu] Fetching user:", user_id);

      if (profile?.id === user_id) {
        console.log("[UserAvatarMenu] User is profile");
        setUser(profile);
        fetchedUserIdRef.current = user_id;
        return;
      }
      console.log({all_friends})
      const foundUser = all_friends?.find((f) => f.id === user_id);
      if (foundUser) {
        console.log("[UserAvatarMenu] Found user in all_friends cache:", {
          id: foundUser.id,
          name: foundUser.name,
          photoType: typeof foundUser.photo,
          photoLength: foundUser.photo
            ? typeof foundUser.photo === "string"
              ? foundUser.photo.substring(0, 50)
              : foundUser.photo.length
            : "null",
          photo: foundUser.photo,
        });
        setUser(foundUser);
        fetchedUserIdRef.current = user_id;
        return;
      }

      console.log("[UserAvatarMenu] User not in cache, fetching from backend");
      setLoading(true);
      try {
        const response = await backendActor.get_user(user_id);
        if ("Ok" in response) {
          console.log("[UserAvatarMenu] Fetched user from backend:", {
            id: response.Ok.id,
            name: response.Ok.name,
            photoType: typeof response.Ok.photo,
            photoLength: response.Ok.photo
              ? typeof response.Ok.photo === "string"
                ? response.Ok.photo.substring(0, 50)
                : response.Ok.photo.length
              : "null",
          });
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

  const getUserPhoto = () => {
    console.log("[UserAvatarMenu] getUserPhoto called for user:", {
      userId: user?.id,
      userName: user?.name,
      photoType: typeof user?.photo,
      photoValue: user?.photo
        ? typeof user.photo === "string"
          ? user.photo.substring(0, 50)
          : `Array[${user.photo.length}]`
        : "null/undefined",
    });

    if (
      user?.photo &&
      (typeof user.photo === "string" || user.photo.length > 0)
    ) {
      console.log(
        "[UserAvatarMenu] Returning user photo:",
        typeof user.photo === "string"
          ? user.photo.substring(0, 50)
          : `Array[${user.photo.length}]`,
      );
      return user.photo;
    }

    const userPost = posts.find((p) => p.creator.id === user?.id);
    if (
      userPost?.creator.photo &&
      (typeof userPost.creator.photo === "string" ||
        userPost.creator.photo.length > 0)
    ) {
      console.log("[UserAvatarMenu] Returning photo from post");
      return userPost.creator.photo;
    }

    console.log("[UserAvatarMenu] No photo found, returning null");
    return null;
  };

  return { user, isLoading, getUserPhoto };
};

const useGroupUsers = (group?: string[]) => {
  const all_friends = useSelector((state: RootState) =>
    group ? state.filesState.all_friends : null,
  );
  const profile = useSelector((state: RootState) => state.filesState.profile);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (!group?.length) return;

    (async () => {
      setLoading(true);
      const foundUsers: User[] = [];
      const toFetch: string[] = [];

      for (const id of group) {
        if (profile?.id === id) {
          foundUsers.push(profile);
        } else {
          const friend = all_friends?.find((f) => f.id === id);
          if (friend) foundUsers.push(friend);
          else toFetch.push(id);
        }
      }

      if (toFetch.length) {
        try {
          const responses = await Promise.all(
            toFetch.map((id) => backendActor.get_user(id)),
          );
          responses.forEach((res) => {
            if ("Ok" in res) foundUsers.push(res.Ok);
          });
        } catch (error) {
          console.error("Failed to fetch group users:", error);
        }
      }

      setUsers(foundUsers);
      setLoading(false);
    })();
  }, [group, all_friends, profile]);

  return { users, isLoading };
};

// Utility functions
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
  const charCode = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
  return colors[charCode % colors.length];
};

const getInitials = (name: string) => {
  if (!name) return "A";
  const words = name.trim().split(/\s+/);
  return words.length === 1
    ? words[0].charAt(0).toUpperCase()
    : (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Sub-components
const UserAvatar: React.FC<{
  user: User;
  size: number;
  sx?: React.CSSProperties;
  photo: string | null;
}> = ({ user, size, sx, photo }) => (
  <Avatar
    src={photo || undefined}
    alt={user.name}
    sx={{
      width: size,
      height: size,
      ...sx,
      bgcolor: photo ? undefined : getAvatarColor(user.name || "Anonymous"),
      fontWeight: 600,
      fontSize: `${size * 0.4}px`,
    }}
  >
    {getInitials(user.name || "Anonymous")}
  </Avatar>
);

const UserInfo: React.FC<{
  user: User;
  profile?: User;
  variant: TypographyVariant;
  size?: number;
  subtitle?: string | null;
  displayId: boolean;
  forceDisplayName: boolean;
  copyTooltip: string;
  onCopyId: () => void;
}> = ({
  user,
  profile,
  variant,
  size,
  subtitle,
  displayId,
  forceDisplayName,
  copyTooltip,
  onCopyId,
}) => {
  const displayName = forceDisplayName
    ? user.name || "Anonymous"
    : profile?.id === user.id
      ? "You"
      : user.name || "Anonymous";
  const truncatedName =
    displayName.split(/\s+/).length > 3
      ? displayName.split(/\s+/).slice(0, 3).join(" ") + "..."
      : displayName;

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Tooltip
        title={displayName.split(/\s+/).length > 3 ? displayName : ""}
        arrow
      >
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
          {truncatedName}
        </Typography>
      </Tooltip>
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
            onClick={onCopyId}
          >
            {user.id}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};

const UserDescription: React.FC<{ description: string; maxWords: number }> = ({
  description,
  maxWords,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxChars = maxWords * 10;
  const shouldShowMore = description.length > maxChars;

  return (
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
          message={isExpanded ? description : description.slice(0, maxChars)}
        />
      </Box>
      {shouldShowMore && (
        <Typography
          variant="caption"
          color="primary"
          sx={{ cursor: "pointer", fontWeight: 500, display: "block", mt: 0.5 }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "show less" : "read more..."}
        </Typography>
      )}
    </Box>
  );
};

// Main Component
interface UserAvatarMenuProps {
  user?: User;
  sx?: React.CSSProperties;
  hide?: string[];
  user_id?: string;
  group?: string[];
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
  group,
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

  const chats = useSelector((state: RootState) => state.chatsState.chats);
  const profile = useSelector((state: RootState) => state.filesState.profile);
  const currentWorkspace = useSelector(
    (state: RootState) => state.filesState.currentWorkspace,
  );

  const { user, isLoading, getUserPhoto } = useUserData(initialUser, user_id);
  const { users: groupUsers, isLoading: groupLoading } = useGroupUsers(group);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState("Click to copy User ID");

  if (isLoading || groupLoading) return <CircularProgress />;

  // Group Avatar rendering
  // Group Avatar rendering
  if (group?.length) {
    const groupSize = size || 32;
    return (
      <AvatarGroup max={4}>
        {groupUsers.map((u, idx) => (
          <UserAvatar
            key={u.id || idx}
            user={u}
            size={groupSize}
            photo={u.photo as string}
            sx={{}}
          />
        ))}
      </AvatarGroup>
    );
  }

  if (!user)
    return (
      <Avatar sx={{ width: 28, height: 28, bgcolor: "success.main", ...sx }}>
        <PersonIcon fontSize="small" />
      </Avatar>
    );

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopyTooltip("Copied ✓");
      setTimeout(() => setCopyTooltip("Click to copy User ID"), 2000);
    } catch {
      enqueueSnackbar("Failed to copy ID", { variant: "error" });
    }
  };

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
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
          chat.members.some((m) => m.toString() === user.id),
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
            currentWorkspace?.name !== "default" && currentWorkspace?.id
              ? [currentWorkspace.id]
              : [],
        };
        dispatch({ type: "ADD_CHAT", chat: newChat });
        dispatch({ type: "OPEN_CHAT", chatId: tempChatId });
        const result = await backendActor.make_new_chat_room(newChat);
        if ("Ok" in result) {
          dispatch({
            type: "UPDATE_CHAT",
            chat: { ...newChat, id: result.Ok || tempChatId },
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
      const ratingData: Rating = {
        id: randomString(),
        rating,
        comment,
        date: Date.now() * 1e6,
        user_id: Principal.fromText(user.id),
      };
      const result = await backendActor?.rate_user(
        Principal.fromText(user.id),
        ratingData,
      );
      if (result && "Ok" in result)
        enqueueSnackbar("Review submitted successfully", {
          variant: "success",
        });
      else if (result && "Err" in result)
        enqueueSnackbar(result.Err, { variant: "error" });
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
  const isProfilePage = currentPath === "/profile" && user.id === profile?.id;
  const isUserPageSameUser =
    currentPath === "/user" && urlParams.get("id") === user.id;
  const avatarSize = size || (sx?.width as number) || 40;
  const photo = getUserPhoto();

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
          <UserAvatar user={user} size={avatarSize} sx={sx} photo={photo} />
        </IconButton>
        {(dispalyName ||
          forceDisplayName ||
          displayDescription ||
          displayId ||
          subtitle) && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {(dispalyName || forceDisplayName || subtitle) && (
              <UserInfo
                user={user}
                profile={profile}
                variant={variant}
                size={size}
                subtitle={subtitle}
                displayId={displayId}
                forceDisplayName={forceDisplayName}
                copyTooltip={copyTooltip}
                onCopyId={handleCopyId}
              />
            )}
            {displayDescription && user.description && (
              <UserDescription
                description={user.description}
                maxWords={maxWords}
              />
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
              <UserAvatar
                user={user}
                size={56}
                photo={photo}
                sx={{ border: "3px solid", borderColor: "divider" }}
              />
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
                      "&::-webkit-scrollbar": { width: "4px" },
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
            <MenuItem onClick={handleProfile} sx={{ px: 2.5, py: 1.25 }}>
              <Person sx={{ mr: 2, fontSize: 22, color: "text.secondary" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                View Profile
              </Typography>
            </MenuItem>
          )}
          {!hide.includes("Message") && (
            <MenuItem onClick={handleMessage} sx={{ px: 2.5, py: 1.25 }}>
              <MessageIcon
                sx={{ mr: 2, fontSize: 22, color: "text.secondary" }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Send Message
              </Typography>
            </MenuItem>
          )}
          {!hide.includes("Review") && (
            <MenuItem onClick={handleReviewClick} sx={{ px: 2.5, py: 1.25 }}>
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

const UserAvatarMenu = React.memo(
  UserAvatarMenuComponent,
  (prev, next) =>
    prev.user?.id === next.user?.id &&
    prev.user_id === next.user_id &&
    prev.dispalyName === next.dispalyName &&
    prev.displayDescription === next.displayDescription &&
    prev.displayId === next.displayId &&
    prev.maxWords === next.maxWords &&
    prev.forceDisplayName === next.forceDisplayName &&
    prev.variant === next.variant &&
    prev.disableMenu === next.disableMenu &&
    prev.size === next.size &&
    prev.subtitle === next.subtitle &&
    (prev.hide?.length || 0) === (next.hide?.length || 0) &&
    prev.onMessageClick === next.onMessageClick &&
    JSON.stringify(prev.group) === JSON.stringify(next.group),
);

UserAvatarMenu.displayName = "UserAvatarMenu";

export default UserAvatarMenu;
