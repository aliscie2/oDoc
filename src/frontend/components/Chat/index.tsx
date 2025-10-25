import {
  Add as AddIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  OpenInFull as OpenInFullIcon,
} from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  Menu,
  Typography,
} from "@mui/material";
import React, { memo, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/reducers";
import { backendActor } from "../../utils/backendUtils";
import { ChatFloatingWindow } from "./chatFoatingWindowPage";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { Chat } from "$/declarations/backend/backend.did";
import { getUnreadCount } from "./utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "./hooks/useIsMobile";
import { useToast } from "./hooks/useToast";
import { useChatErrorHandler } from "./hooks/useChatErrorHandler";
import { useChatListOperations } from "./hooks/useChatListOperations";
import { ToastContainer } from "./components/ToastContainer";
import { ChatErrorBoundary } from "./ErrorBoundary/ChatErrorBoundary";
import { ChatListItem } from "./components/ChatListItem";

const ChatNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toasts, removeToast } = useToast();
  const { handleError, handleSuccess, handleWarning } = useChatErrorHandler();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(true);

  const { chats } = useSelector((state: RootState) => state.chatsState);
  const openChatWindows = useSelector(
    (state: RootState) => (state.chatsState as unknown).openChatWindows || {},
  );
  const { profile, all_friends, currentWorkspace, workspaces } = useSelector(
    (state: RootState) => state.filesState,
  );

  // Use custom hooks
  const { getOtherUser, handleOpenChat: openChat } = useChatListOperations({
    profile,
    onWarning: handleWarning,
  });

  const filteredChats = useMemo(() => {
    if (!currentWorkspace || currentWorkspace.name === "default") return chats;
    return chats.filter((chat) =>
      chat.workspaces.includes(currentWorkspace.id),
    );
  }, [chats, currentWorkspace]);

  const totalUnread = useMemo(() => {
    if (!profile?.id) return 0;
    return filteredChats.reduce(
      (total, chat) => total + getUnreadCount(chat.messages, profile.id),
      0,
    );
  }, [filteredChats, profile?.id]);
  const isChatsPage = useLocation().pathname === "/chats";
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isMobile) {
        navigate("/chats");
      } else {
        setAnchorEl(event.currentTarget);
      }
    },
    [isMobile, navigate],
  );

  const handleClose = useCallback(() => setAnchorEl(null), []);

  const handleExpandClick = useCallback(() => {
    setAnchorEl(null);
    navigate("/chats");
  }, [navigate]);

  const handleOpenChat = useCallback(
    (chat: Chat) => openChat(chat, handleClose),
    [openChat, handleClose],
  );

  const handleLoadMore = useCallback(async () => {
    if (!backendActor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const chatsList = await backendActor.get_my_chats(
        BigInt(chats?.length || 0),
      );

      if (chatsList.length === 0) {
        setHasMoreChats(false);
      } else {
        dispatch({ type: "EXTEND_CHATS", chats: chatsList });
      }
    } catch (error) {
      handleError(
        error,
        "load more chats",
        "Failed to load more chats. Please try again.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [backendActor, chats.length, isLoadingMore, dispatch]);

  const handleCreateGroup = useCallback(
    async (formData: {
      name: string;
      members: Array<{ id: string; name: string } | null>;
      admins: Array<{ id: string; name: string } | null>;
      workspace: Array<{ id: string; name: string } | null>;
    }) => {
      if (!backendActor || !profile?.id) return;
      try {
        const { Principal } = await import("@dfinity/principal");
        const { randomString } = await import(
          "../../DataProcessing/dataSamples"
        );

        const { validateUsers, validateWorkspaces, createAdminArray } =
          await import("./utils/chatUtils");

        // Validate and filter input data
        const validMembers = validateUsers(formData.members);
        const validAdmins = validateUsers(formData.admins);
        const validWorkspaces = validateWorkspaces(formData.workspace);

        const chatId = randomString();

        // Create chat for backend (Chat type with Principal)
        const newChatForBackend = {
          id: chatId,
          name: formData.name || "Untitled",
          messages: [],
          members:
            validMembers.length > 0
              ? validMembers.map((m) => Principal.fromText(m.id))
              : [Principal.fromText(profile.id)],
          admins: createAdminArray(profile.id, validAdmins),
          workspaces:
            validWorkspaces.length > 0
              ? validWorkspaces.map((w) => w.id)
              : currentWorkspace?.name !== "default" && currentWorkspace
                ? [currentWorkspace.id]
                : [],
          creator: Principal.fromText(profile.id),
        };

        const result = await backendActor.make_new_chat_room(newChatForBackend);

        if ("Ok" in result) {
          // Add the new chat to Redux and open it
          dispatch({ type: "SET_CHATS", chats: [newChatForBackend, ...chats] });
          handleOpenChat(newChatForBackend);
          handleSuccess(
            `Group "${formData.name || "Untitled"}" created successfully!`,
          );
        } else {
          const errorMessage = result.Err || "Failed to create chat";
          throw new Error(errorMessage);
        }
      } catch (error) {
        handleError(
          error,
          "create group",
          "An unexpected error occurred while creating the group",
        );
      }
      setCreateGroupOpen(false);
    },
    [
      backendActor,
      profile?.id,
      chats,
      dispatch,
      currentWorkspace,
      handleOpenChat,
    ],
  );

  const open = Boolean(anchorEl);

  return (
    <ChatErrorBoundary>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <IconButton
        onClick={handleClick}
        aria-controls={open ? "chat-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        aria-label={`Chats ${totalUnread > 0 ? `(${totalUnread} unread)` : ""}`}
      >
        <Badge badgeContent={totalUnread} color="error">
          <ChatIcon />
        </Badge>
      </IconButton>

      <Menu
        id="chat-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          ...{
            paper: {
              sx: {
                width: { xs: "95vw", sm: 420 },
                maxWidth: { xs: "95vw", sm: 420 },
                maxHeight: { xs: "70vh", sm: "80vh" },
                mt: 1,
                borderRadius: { xs: 1.5, sm: 1 },
                boxShadow: { xs: "0 8px 32px rgba(0,0,0,0.12)", sm: 3 },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
            },
          },
          backdrop: {
            sx: {
              backgroundColor: { xs: "rgba(0,0,0,0.3)", sm: "transparent" },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Chats
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              size="small"
              onClick={() => {
                setCreateGroupOpen(true);
                handleClose();
              }}
              sx={{
                borderRadius: 2,
                display: { xs: "none", sm: "flex" },
              }}
            >
              New Group
            </Button>
            <IconButton
              onClick={() => {
                setCreateGroupOpen(true);
                handleClose();
              }}
              sx={{
                display: { xs: "flex", sm: "none" },
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              }}
              size="small"
            >
              <AddIcon />
            </IconButton>
            {!isChatsPage && (
              <IconButton
                onClick={handleExpandClick}
                size="small"
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                <OpenInFullIcon />
              </IconButton>
            )}
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                display: { xs: "flex", sm: "none" },
                ml: 0.5,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {filteredChats.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {currentWorkspace?.name && currentWorkspace.name !== "default"
                ? `"${currentWorkspace.name}" has no chats yet`
                : "No chats yet"}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: { xs: "50vh", sm: "60vh" },
              overflowY: "auto",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.2)",
                borderRadius: "3px",
              },
            }}
          >
            <List sx={{ p: 0, pb: 1 }}>
              {filteredChats.map((chat) => {
                const unreadCount = profile?.id
                  ? getUnreadCount(chat.messages, profile.id)
                  : 0;
                const otherUser = getOtherUser(chat);
                const lastMessage = chat.messages[0]?.message || "No messages";

                return (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    unreadCount={unreadCount}
                    lastMessage={lastMessage}
                    otherUser={otherUser}
                    onClick={() => handleOpenChat(chat)}
                    compact={true}
                    displayName=""
                  />
                );
              })}
            </List>
          </Box>
        )}

        {filteredChats.length > 0 && hasMoreChats && (
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              startIcon={
                isLoadingMore ? (
                  <CircularProgress size={16} />
                ) : (
                  <ExpandMoreIcon />
                )
              }
              sx={{ borderRadius: 2 }}
            >
              {isLoadingMore ? "Loading..." : "Load More Chats"}
            </Button>
          </Box>
        )}
      </Menu>

      <CreateGroupDialog
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={handleCreateGroup}
        users={(all_friends || []) as any} // TODO: Fix type mismatch between backend User and component User
        workspaces={(workspaces || []) as any} // TODO: Fix type mismatch between backend Workspace and component Workspace
        currentWorkspace={currentWorkspace || undefined}
      />

      {!isMobile &&
        Object.keys(openChatWindows || {}).map((chatId, index) => {
          const chat = chats.find((c) => c.id === chatId);
          if (!chat) return null;
          return <ChatFloatingWindow key={chatId} chat={chat} index={index} />;
        })}
    </ChatErrorBoundary>
  );
};

export default memo(ChatNotifications);
