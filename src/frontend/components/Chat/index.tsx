import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";

import {
  Add as AddIcon,
  Chat as ChatIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import ChatWindow from "./chatWindow";
import { useBackendContext } from "../../contexts/BackendContext";
import { useDispatch, useSelector } from "react-redux";

import { Chat } from "../../../declarations/backend/backend.did";
import { Principal } from "@dfinity/principal";
import { randomString } from "../../DataProcessing/dataSamples";
import { convertToBlobLink } from "@/DataProcessing/imageToVec";

// Memoized form components (unchanged)
const GroupNameField = memo(({ value, onChange }) => (
  <TextField
    label="Group Name"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    fullWidth
  />
));

export const MembersSelect = memo(({ value, onChange, users }) => (
  <Autocomplete
    multiple
    options={users}
    getOptionLabel={(option) => option.name}
    value={value}
    onChange={(_, newValue) => onChange(newValue)}
    renderInput={(params) => <TextField {...params} label="Select Members" />}
    renderTags={(value, getTagProps) =>
      value.map((option, index) => (
        <Chip label={option.name} {...getTagProps({ index })} />
      ))
    }
  />
));

export const AdminsSelect = memo(({ value, onChange, members }) => (
  <Autocomplete
    multiple
    options={members}
    getOptionLabel={(option) => option.name}
    value={value}
    onChange={(_, newValue) => onChange(newValue)}
    renderInput={(params) => <TextField {...params} label="Select Admins" />}
    renderTags={(value, getTagProps) =>
      value.map((option, index) => (
        <Chip label={option.name} {...getTagProps({ index })} />
      ))
    }
  />
));
export const WorkspaceSelect = memo(({ value, onChange, workspaces }) => {
  const { currentWorkspace } = useSelector((state: any) => state.filesState);

  return (
    <Autocomplete
      multiple
      options={workspaces}
      getOptionLabel={(option) => option.name}
      value={
        value?.length
          ? value
          : currentWorkspace.id !== "default"
            ? [currentWorkspace]
            : []
      }
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={(params) => <TextField {...params} label="Workspaces" />}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip label={option.name} {...getTagProps({ index })} />
        ))
      }
    />
  );
});

// Memoized Create Group Dialog (unchanged)
const CreateGroupDialog = memo(
  ({ open, onClose, onSubmit, initialData, users, workspaces }) => {
    const [formData, setFormData] = useState(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNameChange = useCallback((name) => {
      setFormData((prev) => ({ ...prev, name }));
    }, []);

    const handleMembersChange = useCallback((members) => {
      setFormData((prev) => ({ ...prev, members }));
    }, []);

    const handleAdminsChange = useCallback((admins) => {
      setFormData((prev) => ({ ...prev, admins }));
    }, []);

    const handleWorkspaceChange = useCallback((workspace) => {
      setFormData((prev) => ({ ...prev, workspace }));
    }, []);

    const handleSubmit = useCallback(async () => {
      setIsSubmitting(true);
      try {
        await onSubmit(formData);
      } finally {
        setIsSubmitting(false);
      }
    }, [formData, onSubmit]);

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Group Chat</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <GroupNameField value={formData.name} onChange={handleNameChange} />
            <MembersSelect
              value={formData.members}
              onChange={handleMembersChange}
              users={users}
            />
            <AdminsSelect
              value={formData.admins}
              onChange={handleAdminsChange}
              members={formData.members}
            />
            <WorkspaceSelect
              value={formData.workspace}
              onChange={handleWorkspaceChange}
              workspaces={workspaces}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);

const ChatList = memo(
  ({
    chats,
    onChatClick,
    currentUserId,
    onLoadMore,
    showLoadMore,
    isLoadingMore,
  }: {
    chats: Chat[];
    onChatClick: (chat: Chat) => void;
    currentUserId: string;
    onLoadMore: () => void;
    showLoadMore: boolean;
    isLoadingMore: boolean;
  }) => {
    const { currentWorkspace } = useSelector((state: any) => state.filesState);

    // Calculate unread count for each chat if not already present
    const chatsWithUnread = chats
      .filter(
        (chat) =>
          // Include chat if it's in current workspace or if current workspace is default
          currentWorkspace.name === "default" ||
          chat.workspaces.includes(currentWorkspace.id),
      )
      .map((chat) => {
        if ("unread" in chat) return chat;

        const unseenCount = chat.messages.reduce((count, message) => {
          const isSeen = message.seen_by.some(
            (user) => user.toString() === currentUserId,
          );
          return count + (isSeen ? 0 : 1);
        }, 0);

        return {
          ...chat,
          unread: unseenCount,
        };
      });

    const { all_friends, workspaces, profile } = useSelector(
      (state: any) => state.filesState,
    );

    const getOtherUser = (chat) => {
      if (chat.name !== "private_chat") return null;
      return all_friends.find(
        (f) =>
          chat.admins.map((a) => a.id)?.includes(f.id) &&
          f.id !== currentUserId,
      );
    };

    return (
      <Box sx={{ width: "100%" }}>
        <List sx={{ padding: 0, width: "100%" }}>
          {chatsWithUnread.map((chat) => {
            const isOdoc =
              chat.members.find((m) => m.toText() !== profile?.id) ==
              "tgwpc-6xuon-k3a6y-ey7lt-xksjs-qx22h-ikhbt-4yp3a-6stco-rymbe-pqe";
            const otherUser = getOtherUser(chat);
            return (
              <ListItem
                key={chat.id}
                onClick={() => onChatClick(chat)}
                button
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  "&:hover": { backgroundColor: "action.hover" },
                }}
              >
                <ListItemAvatar>
                  {chat.name === "private_chat" ? (
                    <Avatar
                      src={
                        isOdoc
                          ? "/logo.png"
                          : convertToBlobLink(otherUser?.photo)
                      }
                    >
                      {otherUser?.name?.charAt(0)}
                    </Avatar>
                  ) : (
                    <Avatar>
                      <GroupIcon />
                    </Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="subtitle2">
                        {isOdoc
                          ? "oDoc"
                          : chat.name === "private_chat"
                            ? otherUser?.name || "Unknown User"
                            : chat.name}
                      </Typography>
                      {chat.unread > 0 && (
                        <Badge badgeContent={chat.unread} color="error" />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      {chat.messages[0]?.message || "No messages"}
                      {currentWorkspace.name === "default" &&
                        chat.workspaces.length > 0 && (
                          <Typography
                            component="span"
                            sx={{ ml: 1, color: "text.secondary" }}
                          >
                            [
                            {workspaces
                              .filter((w) => chat.workspaces.includes(w.id))
                              .map((w) => w.name)
                              .join(", ")}
                            ]
                          </Typography>
                        )}
                    </>
                  }
                />
              </ListItem>
            );
          })}
        </List>

        {/* Load More Button */}
        {showLoadMore && (
          <MenuItem
            onClick={onLoadMore}
            disabled={isLoadingMore}
            sx={{
              justifyContent: "center",
              borderTop: 1,
              borderColor: "divider",
              py: 1.5,
            }}
          >
            {isLoadingMore ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Loading...</Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ExpandMoreIcon />
                <Typography variant="body2">Load More</Typography>
              </Box>
            )}
          </MenuItem>
        )}
      </Box>
    );
  },
);

const ChatNotifications = () => {
  const dispatch = useDispatch();
  const { chats } = useSelector((state) => state.chatsState);
  const { profile, currentWorkspace, all_friends, workspaces } = useSelector(
    (state) => state.filesState,
  );
  const { backendActor } = useBackendContext();

  const [openChats, setOpenChats] = useState(new Map());
  const [anchorEl, setAnchorEl] = useState(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreChats, setHasMoreChats] = useState(false);

  useEffect(() => {
    setHasMoreChats(chats.length > 14);
  }, [chats.length]);

  const totalUnseenMessages = useMemo(() => {
    if (!profile?.id) return 0;
    return chats.reduce((total, chat) => {
      const unseenInChat = chat.messages.reduce((count, message) => {
        const isSeen = message.seen_by.some(
          (user) => user.toString() === profile.id,
        );
        return count + (isSeen ? 0 : 1);
      }, 0);
      return total + unseenInChat;
    }, 0);
  }, [chats, profile?.id]);

  const handleLoadMore = useCallback(async () => {
    if (!backendActor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const chatsList = await backendActor.get_my_chats(chats.length);
      if (chatsList.length === 0) {
        setHasMoreChats(false);
      } else {
        dispatch({ type: "SET_CHATS", chats: [...chats, ...chatsList] });
      }
    } catch (error) {
      console.error("Error loading more chats:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [backendActor, chats, isLoadingMore, dispatch]);

  const handleOpenChat = useCallback((chat) => {
    setOpenChats((prev) => {
      const newChats = new Map(prev);
      if (!newChats.has(chat.id)) {
        const offset = newChats.size * 30;
        newChats.set(chat.id, { x: 100 + offset, y: 100 + offset });
      }
      return newChats;
    });
  }, []);

  const handleCloseChat = useCallback((chatId) => {
    setOpenChats((prev) => {
      const newChats = new Map(prev);
      newChats.delete(chatId);
      return newChats;
    });
  }, []);

  const handleChatPosition = useCallback((chatId, position) => {
    setOpenChats((prev) => {
      const newChats = new Map(prev);
      newChats.set(chatId, position);
      return newChats;
    });
  }, []);

  const handleClick = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    [],
  );
  const handleClose = useCallback(() => setAnchorEl(null), []);

  const handleChatClick = useCallback(
    async (chat) => {
      try {
        const unseenMessages = chat.messages.filter(
          (message) =>
            !message.seen_by.some((user) => user.toString() === profile?.id),
        );

        const updatedMessages = chat.messages.map((msg) => ({
          ...msg,
          seen_by: msg.seen_by.some((user) => user.toString() === profile?.id)
            ? msg.seen_by
            : [...msg.seen_by, Principal.fromText(profile?.id)],
        }));

        const updatedChat = { ...chat, messages: updatedMessages, unread: 0 };
        dispatch({ type: "UPDATE_CHAT", chat: updatedChat });

        handleOpenChat(chat);
        handleClose();

        if (unseenMessages.length > 0) {
          const latestMessage = unseenMessages[unseenMessages.length - 1];
          const messageForBackend = {
            ...latestMessage,
            date: BigInt(0),
            sender: Principal.fromText(latestMessage.sender.toString()),
            seen_by: [],
            chat_id: chat.id,
          };
          await backendActor?.message_is_seen(messageForBackend);
        }
      } catch (error) {
        console.error("Error marking messages as seen:", error);
        handleOpenChat(chat);
        handleClose();
      }
    },
    [profile?.id, backendActor, handleOpenChat, handleClose, dispatch],
  );

  const handleCreateGroup = useCallback(
    async (formData) => {
      if (!backendActor || !profile?.id) return;
      try {
        const newChat = {
          id: randomString(),
          name: formData.name || "Untitled",
          messages: [],
          members:
            formData.members?.length > 0
              ? formData.members.map((m) => Principal.fromText(m.id))
              : [Principal.fromText(profile.id)],
          admins:
            formData.admins?.length > 0
              ? formData.admins.map((a) => Principal.fromText(a.id))
              : [Principal.fromText(profile.id)],
          workspaces:
            formData.workspace?.length > 0
              ? formData.workspace.map((w) => w.id)
              : currentWorkspace?.name !== "default"
                ? [currentWorkspace.id]
                : [],
          creator: Principal.fromText(profile.id),
        };

        const result = await backendActor.make_new_chat_room(newChat);
        if ("Ok" in result) {
          dispatch({ type: "SET_CHATS", chats: [newChat, ...chats] });
          handleOpenChat(newChat);
        } else {
          console.log("Failed to create chat:", result.Err);
        }
      } catch (error) {
        console.log("Error creating chat:", error);
      }
      setCreateGroupOpen(false);
    },
    [
      backendActor,
      profile?.id,
      handleOpenChat,
      chats,
      dispatch,
      currentWorkspace,
    ],
  );

  const handleSendMessage = useCallback(
    async (chatId, messageText) => {
      if (!profile?.id || !messageText.trim()) return;
      const chat = chats.find((c) => c.id === chatId);
      if (!chat) return;

      const newMessage = {
        id: randomString(),
        date: BigInt(Date.now() * 1e6),
        sender: Principal.fromText(profile.id),
        seen_by: [Principal.fromText(profile.id)],
        message: messageText,
        chat_id: chatId,
      };

      try {
        await backendActor?.send_message([], newMessage);
        dispatch({
          type: "UPDATE_CHAT",
          chat: { ...chat, messages: [newMessage, ...chat.messages] },
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [profile, backendActor, chats, dispatch],
  );

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        aria-controls={open ? "chat-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Badge badgeContent={totalUnseenMessages} color="error">
          <ChatIcon />
        </Badge>
      </IconButton>

      <Menu
        id="chat-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { maxHeight: 500, width: 320 } }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem sx={{ justifyContent: "center" }}>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            fullWidth
            onClick={() => setCreateGroupOpen(true)}
          >
            Create New Group
          </Button>
        </MenuItem>

        <ChatList
          chats={chats}
          onChatClick={handleChatClick}
          currentUserId={profile?.id}
          onLoadMore={handleLoadMore}
          showLoadMore={hasMoreChats}
          isLoadingMore={isLoadingMore}
        />
      </Menu>

      {Array.from(openChats.entries()).map(([chatId, position]) => {
        const chat = chats.find((c) => c.id === chatId);
        if (!chat) return null;
        return (
          <ChatWindow
            key={chatId}
            chat={chat}
            position={position}
            onClose={handleCloseChat}
            onPositionChange={handleChatPosition}
            onSendMessage={(_, message) => handleSendMessage(chatId, message)}
            user={profile}
          />
        );
      })}

      <CreateGroupDialog
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSubmit={handleCreateGroup}
        initialData={{
          name: "",
          members: [],
          admins: [],
          workspace:
            currentWorkspace?.name !== "default" ? [currentWorkspace.id] : [],
        }}
        users={all_friends}
        workspaces={workspaces}
      />
    </>
  );
};

export default ChatNotifications;
