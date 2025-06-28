import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { AdminsSelect, MembersSelect, WorkspaceSelect } from "./index";
import {
  ArrowBack,
  Check,
  DragIndicator,
  OpenInFull,
  Send,
  Settings,
  Minimize,
  Close,
} from "@mui/icons-material";
import { useBackendContext } from "../../contexts/BackendContext";
import { useDispatch, useSelector } from "react-redux";
import { Principal } from "@dfinity/principal";
import formatTimestamp from "../../utils/time";
import { Link } from "react-router-dom";

// Custom hooks for better separation of concerns
const useDragHandler = (isDragEnabled, onPositionChange, chatId) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 100, y: 100 });
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleDragStart = useCallback(
    (e) => {
      if (!isDragEnabled) return;

      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [isDragEnabled],
  );

  const handleDragMove = useCallback(
    (e) => {
      if (!isDragging || !e.clientX || !e.clientY) return;

      const newPosition = {
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      };
      setDragPosition(newPosition);
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragEnabled || !isDragging) return;

    setIsDragging(false);
    onPositionChange?.(chatId, dragPosition);
  }, [isDragEnabled, isDragging, chatId, dragPosition, onPositionChange]);

  return {
    isDragging,
    dragPosition,
    setDragPosition,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};

const useInfiniteScroll = (chat, backendActor, dispatch) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const previousScrollHeight = useRef(0);

  const handleScroll = useCallback(
    async (container) => {
      if (!container || isLoadingMore || !hasMoreMessages) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 5;
      setIsScrolledToBottom(isAtBottom);

      if (scrollTop === 0) {
        setIsLoadingMore(true);
        previousScrollHeight.current = scrollHeight;

        try {
          const olderMessages = await backendActor.load_more_messages(
            chat.id,
            chat.messages.length,
          );

          if (olderMessages.length === 0) {
            setHasMoreMessages(false);
          } else {
            const chronologicalMessages = [...olderMessages].reverse();
            dispatch({
              type: "UPDATE_CHAT",
              chat: {
                ...chat,
                messages: [...chronologicalMessages, ...chat.messages],
              },
            });
          }
        } catch (error) {
          console.error("Error loading more messages:", error);
        } finally {
          setIsLoadingMore(false);
        }
      }
    },
    [backendActor, chat, dispatch, isLoadingMore, hasMoreMessages],
  );

  return {
    isLoadingMore,
    hasMoreMessages,
    isScrolledToBottom,
    previousScrollHeight,
    handleScroll,
    setIsScrolledToBottom,
  };
};

const useChatOperations = (
  chat,
  backendActor,
  onUpdateChat,
  dispatch,
  onClose,
) => {
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveSuccessTimeout = useRef(null);

  const handleSendMessage = useCallback(
    async (messageText, onSendMessage, profile) => {
      if (!messageText.trim() || !profile?.id || isSending) return false;

      try {
        setIsSending(true);
        await onSendMessage(chat.id, messageText);
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [chat.id, isSending],
  );

  const handleSaveChat = useCallback(
    async (updatedChat) => {
      setIsSaving(true);
      try {
        const formattedChat = {
          ...updatedChat,
          admins: updatedChat.admins.map((a) => Principal.fromText(a.id || a)),
          creator:
            updatedChat.creator instanceof Principal
              ? updatedChat.creator
              : Principal.fromText(updatedChat.creator.id),
          members: updatedChat.members.map((m) =>
            Principal.fromText(m.id || m),
          ),
          messages: updatedChat.messages.map((msg) => ({
            ...msg,
            sender:
              msg.sender instanceof Principal
                ? msg.sender
                : Principal.fromText(msg.sender),
            seen_by: msg.seen_by.map((s) =>
              s instanceof Principal ? s : Principal.fromText(s),
            ),
            date:
              typeof msg.date === "bigint"
                ? msg.date
                : BigInt(msg.date.toString()),
          })),
        };

        const result = await backendActor.update_chat(formattedChat);
        if ("Ok" in result) {
          onUpdateChat?.(result.Ok);
          setSaveSuccess(true);
          if (saveSuccessTimeout.current)
            clearTimeout(saveSuccessTimeout.current);
          saveSuccessTimeout.current = setTimeout(
            () => setSaveSuccess(false),
            2000,
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("Failed to update chat:", error);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [backendActor, onUpdateChat],
  );

  const handleDeleteChat = useCallback(() => {
    if (
      !window.confirm(
        "Are you sure you want to delete this chat? This action cannot be undone.",
      )
    ) {
      return;
    }

    backendActor
      .delete_chat(chat.id)
      .then((result) => {
        if ("Ok" in result) {
          dispatch({ type: "DELETE_CHAT", chat_id: chat.id });
          onClose(chat.id);
        }
      })
      .catch((error) => console.error("Failed to delete chat:", error));
  }, [backendActor, chat.id, dispatch, onClose]);

  return {
    isSending,
    isSaving,
    saveSuccess,
    handleSendMessage,
    handleSaveChat,
    handleDeleteChat,
  };
};

// Utility functions
const renderSenderName = (sender, profile, allFriends) => {
  const senderStr =
    sender instanceof Principal ? sender.toString() : sender?.toString();
  if (!senderStr) return "Unknown User";

  return senderStr === profile?.id
    ? "You"
    : allFriends.find((u) => u.id === senderStr)?.name ||
        senderStr.slice(8, 16);
};

const isCurrentUser = (sender, profile) => {
  const senderStr =
    sender instanceof Principal ? sender.toString() : sender?.__principal__;
  return senderStr === profile?.id;
};

const MessagesList = memo(
  ({
    chat,
    profile,
    allFriends,
    messagesContainerRef,
    messagesEndRef,
    handleScroll,
    isLoadingMore,
    hasMoreMessages,
  }) => {
    return (
      <Box
        ref={messagesContainerRef}
        onScroll={(e) => handleScroll(e.target)}
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        {isLoadingMore && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!hasMoreMessages && chat.messages.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Typography variant="caption" color="text.secondary">
              No more messages available
            </Typography>
          </Box>
        )}

        {[...chat.messages].reverse().map((message) => {
          const isOwn = isCurrentUser(message.sender, profile);
          return (
            <Paper
              key={message.id}
              elevation={1}
              sx={{
                p: 1.5,
                mb: 1,
                maxWidth: "75%",
                ml: isOwn ? "auto" : 0,
                bgcolor: isOwn ? "primary.main" : "background.paper",
                color: isOwn ? "primary.contrastText" : "text.primary",
                borderRadius: 2,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                component={Link}
                to={`/user?id=${message.sender.toString()}`}
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: isOwn ? "primary.contrastText" : "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {renderSenderName(message.sender, profile, allFriends)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {message.message}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: isOwn ? "primary.contrastText" : "text.secondary",
                  opacity: 0.8,
                  mt: 0.5,
                  display: "block",
                }}
              >
                {formatTimestamp(message.date)}
              </Typography>
            </Paper>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>
    );
  },
);

const MessageInput = memo(({ onSendMessage, isSending }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onSendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "background.default",
            },
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={isSending || !newMessage.trim()}
          sx={{ borderRadius: 2 }}
        >
          {isSending ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <Send />
          )}
        </IconButton>
      </form>
    </Box>
  );
});

const ChatSettings = memo(
  ({
    chat,
    profile,
    workspaces,
    allFriends,
    onSave,
    onDelete,
    isSaving,
    saveSuccess,
  }) => {
    const [formData, setFormData] = useState({
      name: chat.name,
      workspaces: chat.workspaces,
      admins: chat.admins,
      members: chat.members,
    });

    const isPrivateChat = chat.name === "private_chat";
    const isCreator = chat.creator?.id === profile?.id;

    const handleSave = async () => {
      await onSave({
        ...chat,
        ...formData,
        creator: chat.creator,
      });
    };

    if (!isCreator) {
      return (
        <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Chat Settings
          </Typography>
          <Typography color="error" variant="body2">
            Only the chat creator can modify settings
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{ flex: 1, overflow: "auto", p: 2, bgcolor: "background.default" }}
      >
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Chat Settings
        </Typography>

        <TextField
          fullWidth
          label="Chat Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              name:
                e.target.value === "private_chat"
                  ? "private chat"
                  : e.target.value,
            }))
          }
          sx={{ mb: 2 }}
        />

        <WorkspaceSelect
          value={workspaces.filter((w) => formData.workspaces.includes(w.id))}
          onChange={(newValue) =>
            setFormData((prev) => ({
              ...prev,
              workspaces: newValue.map((w) => w.id),
            }))
          }
          workspaces={workspaces}
        />

        <AdminsSelect
          value={allFriends.filter((f) =>
            formData.admins.some((a) => a.toString() === f.id),
          )}
          onChange={(newValue) =>
            setFormData((prev) => ({
              ...prev,
              admins: newValue.map((admin) => admin.id),
            }))
          }
          members={allFriends}
        />

        <MembersSelect
          value={allFriends.filter((f) =>
            formData.members.some((m) => m.toString() === f.id),
          )}
          onChange={(newValue) =>
            setFormData((prev) => ({
              ...prev,
              members: newValue.map((member) => member.id),
            }))
          }
          users={allFriends}
        />

        <Box sx={{ display: "flex", gap: 1, mt: 3 }}>
          <Button
            variant="contained"
            color={saveSuccess ? "success" : "primary"}
            fullWidth
            disabled={isSaving}
            startIcon={
              isSaving ? (
                <CircularProgress size={16} />
              ) : saveSuccess ? (
                <Check />
              ) : null
            }
            onClick={handleSave}
            sx={{ borderRadius: 2 }}
          >
            {saveSuccess ? "Saved!" : "Save Changes"}
          </Button>

          {!isPrivateChat && (
            <Button
              variant="outlined"
              color="error"
              onClick={onDelete}
              sx={{ borderRadius: 2, minWidth: 100 }}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>
    );
  },
);

// Remove the drag handler hook entirely
// const useDragHandler = ... // DELETE THIS ENTIRE HOOK

// Simplified ChatHeader without drag functionality
const ChatHeader = memo(
  ({
    chat,
    profile,
    isMinimized,
    setIsMinimized,
    isSettingsView,
    setIsSettingsView,
    onClose,
  }) => {
    const isPrivateChat = chat.name === "private_chat";
    const isCreator = chat.creator?.id === profile?.id;
    const chatDisplayName = isPrivateChat
      ? renderSenderName(
          chat.members.find((m) => m.toText() !== profile?.id),
          profile,
          [],
        )
      : chat.name;

    return (
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <Typography
            component={Link}
            to={`/user?id=${chat.members.find((m) => String(m) !== profile?.id)}`}
            variant="subtitle2"
            sx={{
              flex: 1,
              fontWeight: 600,
              textDecoration: "none",
              color: "text.primary",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {chatDisplayName}
          </Typography>

          <IconButton size="small" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <OpenInFull /> : <Minimize />}
          </IconButton>

          {!isPrivateChat && isCreator && (
            <IconButton
              size="small"
              onClick={() => setIsSettingsView(!isSettingsView)}
            >
              {isSettingsView ? <ArrowBack /> : <Settings />}
            </IconButton>
          )}

          <IconButton size="small" onClick={() => onClose(chat.id)}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  },
);

// Simplified Main Component - Dialog only
const ChatWindow = memo(({ chat, onClose, onSendMessage, onUpdateChat }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSettingsView, setIsSettingsView] = useState(false);

  const { workspaces, all_friends, profile } = useSelector(
    (state) => state.filesState,
  );
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Remove all drag-related code
  const infiniteScroll = useInfiniteScroll(chat, backendActor, dispatch);
  const chatOperations = useChatOperations(
    chat,
    backendActor,
    onUpdateChat,
    dispatch,
    onClose,
  );

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (infiniteScroll.isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [infiniteScroll.isScrolledToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages, scrollToBottom]);

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (infiniteScroll.isLoadingMore) return;

    const container = messagesContainerRef.current;
    if (container && infiniteScroll.previousScrollHeight.current > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDifference =
        newScrollHeight - infiniteScroll.previousScrollHeight.current;
      container.scrollTop = scrollDifference;
      infiniteScroll.previousScrollHeight.current = 0;
    }
  }, [chat.messages, infiniteScroll.isLoadingMore]);

  const handleSendMessageWrapper = useCallback(
    async (messageText) => {
      const success = await chatOperations.handleSendMessage(
        messageText,
        onSendMessage,
        profile,
      );
      if (success) {
        infiniteScroll.setIsScrolledToBottom(true);
        setTimeout(scrollToBottom, 100);
      }
      return success;
    },
    [
      chatOperations.handleSendMessage,
      onSendMessage,
      profile,
      infiniteScroll.setIsScrolledToBottom,
      scrollToBottom,
    ],
  );

  const handleSaveChatWrapper = useCallback(
    async (updatedChat) => {
      const success = await chatOperations.handleSaveChat(updatedChat);
      if (success) {
        setIsSettingsView(false);
      }
      return success;
    },
    [chatOperations.handleSaveChat],
  );

  return (
    <Dialog
      open={true}
      onClose={() => onClose(chat.id)}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: isMinimized
            ? "auto"
            : { xs: "90vh", sm: "70vh", md: "600px" },
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: { xs: 0, sm: 3 },
          bgcolor: "background.paper",
          m: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "auto" },
        },
      }}
      fullScreen={{ xs: true, sm: false }}
    >
      <ChatHeader
        chat={chat}
        profile={profile}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        isSettingsView={isSettingsView}
        setIsSettingsView={setIsSettingsView}
        onClose={onClose}
      />

      {!isMinimized && !isSettingsView && (
        <>
          <MessagesList
            chat={chat}
            profile={profile}
            allFriends={all_friends}
            messagesContainerRef={messagesContainerRef}
            messagesEndRef={messagesEndRef}
            handleScroll={infiniteScroll.handleScroll}
            isLoadingMore={infiniteScroll.isLoadingMore}
            hasMoreMessages={infiniteScroll.hasMoreMessages}
          />
          <MessageInput
            onSendMessage={handleSendMessageWrapper}
            isSending={chatOperations.isSending}
          />
        </>
      )}

      {!isMinimized && isSettingsView && (
        <ChatSettings
          chat={chat}
          profile={profile}
          workspaces={workspaces}
          allFriends={all_friends}
          onSave={handleSaveChatWrapper}
          onDelete={chatOperations.handleDeleteChat}
          isSaving={chatOperations.isSaving}
          saveSuccess={chatOperations.saveSuccess}
        />
      )}
    </Dialog>
  );
});

export default ChatWindow;
