import {
  Add as AddIcon,
  Chat as ChatIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { memo, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/reducers";
import { backendActor } from "../../utils/backendUtils";
import { ChatFloatingWindow } from "./chatFoatingWindowPage";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { Chat } from "./types";
import { getUnreadCount } from "./utils";
import { useNavigate } from "react-router-dom";

const ChatNotifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add this
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(true);

  const { chats, openChatWindows } = useSelector(
    (state: RootState) => state.chatsState,
  );
  const { profile, all_friends, currentWorkspace, workspaces } = useSelector(
    (state: RootState) => state.filesState,
  );

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

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => setAnchorEl(null), []);

    const handleOpenChat = useCallback(
    (chat: Chat) => {
      // Check if mobile
      if (window.innerWidth < 600) {
        navigate(`/chat/${chat.id}`);
      } else {
        dispatch({ type: "OPEN_CHAT", chatId: chat.id });
      }
      handleClose();
    },
    [dispatch, handleClose, navigate]
  );


  const handleCloseChat = useCallback(
    (chatId: string) => {
      dispatch({ type: "CLOSE_CHAT_WINDOW", chatId });
    },
    [dispatch],
  );

  const getOtherUser = useCallback(
    (chat: Chat) => {
      if (chat.name !== "private_chat") return null;

      const otherMember = chat.members.find(
        (m) => m.toString() !== profile?.id,
      );

      if (!otherMember) return null;

      // Check if other member is oDoc CEO
      const ODOC_CEO_ID =
        "tgwpc-6xuon-k3a6y-ey7lt-xksjs-qx22h-ikhbt-4yp3a-6stco-rymbe-pqe";
      if (otherMember.toString() === ODOC_CEO_ID) {
        return {
          id: ODOC_CEO_ID,
          name: "oDoc",
          photo: "/logo.png",
        };
      }

      return all_friends.find((f) => f.id === otherMember.toString());
    },
    [all_friends, profile?.id],
  );

  const getChatDisplayName = useCallback(
    (chat: Chat) => {
      if (chat.name !== "private_chat") {
        return chat.name;
      }

      const otherUser = getOtherUser(chat);
      return otherUser?.name || "Unknown User";
    },
    [getOtherUser],
  );

  const handleLoadMore = useCallback(async () => {
    if (!backendActor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const chatsList = await backendActor.get_my_chats(chats.length);
      if (chatsList.length === 0) {
        setHasMoreChats(false);
      } else {
        dispatch({ type: "EXTEND_CHATS", chats: chatsList });
      }
    } catch (error) {
      console.error("Error loading more chats:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [backendActor, chats.length, isLoadingMore, dispatch]);

  const handleCreateGroup = useCallback(
    async (formData: any) => {
      if (!backendActor || !profile?.id) return;
      try {
        const { Principal } = await import("@dfinity/principal");
        const { randomString } = await import(
          "../../DataProcessing/dataSamples"
        );

        const newChat = {
          id: randomString(),
          name: formData.name || "Untitled",
          messages: [],
          members:
            formData.members?.length > 0
              ? formData.members.map((m: any) => Principal.fromText(m.id))
              : [Principal.fromText(profile.id)],
          admins:
            formData.admins?.length > 0
              ? formData.admins.map((a: any) => Principal.fromText(a.id))
              : [Principal.fromText(profile.id)],
          workspaces:
            formData.workspace?.length > 0
              ? formData.workspace.map((w: any) => w.id)
              : currentWorkspace?.name !== "default"
                ? [currentWorkspace.id]
                : [],
          creator: Principal.fromText(profile.id),
        };

        const result = await backendActor.make_new_chat_room(newChat);
        if ("Ok" in result) {
          dispatch({ type: "SET_CHATS", chats: [newChat, ...chats] });
          handleOpenChat(newChat);
        }
      } catch (error) {
        console.error("Error creating chat:", error);
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
    
    
     <>
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
          paper: {
            sx: { maxHeight: 500, width: 320 },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem sx={{ justifyContent: "center", borderBottom: 1, borderColor: "divider" }}>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            fullWidth
            onClick={() => { setCreateGroupOpen(true); handleClose(); }}
          >
            Create New Group
          </Button>
        </MenuItem>

        {filteredChats.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">No chats yet</Typography>
          </MenuItem>
        ) : (
          <List sx={{ padding: 0, width: "100%" }}>
            {filteredChats.map((chat) => {
              const unreadCount = profile?.id ? getUnreadCount(chat.messages, profile.id) : 0;
              const otherUser = getOtherUser(chat);
              const displayName = getChatDisplayName(chat);
              const lastMessage = chat.messages[0]?.message || "No messages";

              return (
                <ListItem
                  key={chat.id}
                  onClick={() => handleOpenChat(chat)}
                  sx={{
                    cursor: "pointer",
                    borderBottom: 1,
                    borderColor: "divider",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <ListItemAvatar>
                    {chat.name === "private_chat" ? (
                      <Avatar src={otherUser?.photo} alt={displayName}>
                        {displayName.charAt(0).toUpperCase()}
                      </Avatar>
                    ) : (
                      <Avatar><GroupIcon /></Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: unreadCount > 0 ? 600 : 400 }}>
                          {displayName}
                        </Typography>
                        {unreadCount > 0 && <Badge badgeContent={unreadCount} color="error" />}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lastMessage}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}

        {filteredChats.length > 0 && hasMoreChats && (
          <MenuItem onClick={handleLoadMore} disabled={isLoadingMore} sx={{ justifyContent: "center", borderTop: 1, borderColor: "divider", py: 1.5 }}>
            {isLoadingMore ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Loading...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ExpandMoreIcon />
                <Typography variant="body2">Load More Chats</Typography>
              </Box>
            )}
          </MenuItem>
        )}
      </Menu>

       <CreateGroupDialog
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={handleCreateGroup}
        users={all_friends}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
      />

      {/* Floating Chat Windows - Stacked from right */}
     {window.innerWidth >= 600 && Object.keys(openChatWindows).map((chatId, index) => {
        const chat = chats.find((c) => c.id === chatId);
        if (!chat) return null;
        return <ChatFloatingWindow key={chatId} chat={chat} index={index} />;
      })}
    </>
    
  );
};

export default memo(ChatNotifications);
