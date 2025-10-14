import React, { memo, useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { Close, Settings } from "@mui/icons-material";
import { Chat } from "./types";
import { MessagesList } from "./MessagesList";
import { MessageInput } from "./MessageInput";
import { ChatSettingsDialog } from "./ChatSettingsDialog";
import { useChatOperations } from "./hooks/useChatOperations";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { backendActor } from "../../utils/backendUtils";
import { RootState } from "../../redux/reducers";

interface ChatWindowProps {
  chat: Chat;
  onClose: (chatId: string) => void;
}

export const ChatWindow = memo<ChatWindowProps>(({ chat, onClose }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dispatch = useDispatch();
  
  const { profile, all_friends, workspaces } = useSelector(
    (state: RootState) => state.filesState
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Chat operations
  const { sendMessage, updateChat, deleteChat, isSending } = useChatOperations({
    backendActor,
    onSuccess: () => {
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
  });

  const handleSaveSettings = useCallback(
    async (updatedChat: Chat) => {
      const success = await updateChat(updatedChat);
      if (success) {
        dispatch({ type: "UPDATE_CHAT", chat: updatedChat });
      }
      return success;
    },
    [updateChat, dispatch]
  );

  const handleDeleteChat = useCallback(() => {
    deleteChat(chat.id);
    dispatch({ type: "DELETE_CHAT", chat_id: chat.id });
    onClose(chat.id);
  }, [deleteChat, chat.id, dispatch, onClose]);

  // Infinite scroll
  // ⚠️ CRITICAL: MESSAGE ORDERING - Infinite Scroll
  // Messages array format: [newest, ..., oldest]
  // When loading MORE (older) messages, they go at the END of the array
  // Example: [msg5(newest), msg4, msg3] + [msg2, msg1(oldest)] = [msg5, msg4, msg3, msg2, msg1]
  const infiniteScroll = useInfiniteScroll({
    chat,
    backendActor,
    onLoadMore: (olderMessages) => {
      dispatch({
        type: "UPDATE_CHAT",
        chat: {
          ...chat,
          messages: [...chat.messages, ...olderMessages],
        },
      });
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (infiniteScroll.isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat.messages.length, infiniteScroll.isScrolledToBottom]);

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
  }, [chat.messages.length, infiniteScroll.isLoadingMore]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!profile?.id) return false;
      
      const success = await sendMessage(chat.id, messageText, profile.id);
      
      if (success) {
        // ⚠️ CRITICAL: MESSAGE ORDERING - New Message
        // New messages MUST be added at the BEGINNING (index 0)
        // Array format: [newest, ..., oldest]
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: BigInt(Date.now()) * BigInt(1e6),
          sender: profile.id,
          seen_by: [profile.id],
          message: messageText,
          chat_id: chat.id,
        };
        
        dispatch({
          type: "UPDATE_CHAT",
          chat: {
            ...chat,
            messages: [newMessage, ...chat.messages], // Prepend to beginning
          },
        });
        
        infiniteScroll.setIsScrolledToBottom(true);
      }
      
      return success;
    },
    [chat, profile?.id, sendMessage, dispatch, infiniteScroll]
  );

  const getChatTitle = () => {
    if (chat.name !== "private_chat") {
      return chat.name;
    }
    
    // For private chats, show the other user's name
    const otherMember = chat.members.find(
      (m) => m.toString() !== profile?.id
    );
    
    if (!otherMember) return "Chat";
    
    const friend = all_friends.find((f) => f.id === otherMember.toString());
    return friend?.name || "User";
  };

  const isPrivateChat = chat.name === "private_chat";
  const isCreator = chat.creator?.toString() === profile?.id;
  const showSettings = !isPrivateChat && isCreator;

  return (
    <>
      <Dialog
        open={true}
        onClose={() => onClose(chat.id)}
        maxWidth="md"
        fullWidth
        fullScreen // Full screen on mobile
        PaperProps={{
          sx: {
            height: { xs: "100vh", sm: "70vh", md: "600px" },
            maxHeight: { xs: "100vh", sm: "90vh" },
            display: "flex",
            flexDirection: "column",
            borderRadius: { xs: 0, sm: 3 },
            m: { xs: 0, sm: 2 },
            bgcolor: "background.paper",
          },
        }}
      >
      {/* Header */}
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
            variant="subtitle2"
            sx={{ flex: 1, fontWeight: 600 }}
          >
            {getChatTitle()}
          </Typography>

          {/* Settings Icon - Only for group chats and if user is creator */}
          {showSettings && (
            <IconButton
              size="small"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Settings"
            >
              <Settings />
            </IconButton>
          )}

          {/* Close Icon */}
          <IconButton
            size="small"
            onClick={() => onClose(chat.id)}
            aria-label="Close"
          >
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <MessagesList
          chat={chat}
          currentUserId={profile?.id || ""}
          allFriends={all_friends}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef}
          onScroll={infiniteScroll.handleScroll}
          isLoadingMore={infiniteScroll.isLoadingMore}
          hasMoreMessages={infiniteScroll.hasMoreMessages}
        />
        <MessageInput
          onSendMessage={handleSendMessage}
          isSending={isSending}
        />
      </Box>
    </Dialog>

    {/* Settings Dialog */}
    <ChatSettingsDialog
      open={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      chat={chat}
      currentUserId={profile?.id || ""}
      allFriends={all_friends}
      workspaces={workspaces}
      onSave={handleSaveSettings}
      onDelete={handleDeleteChat}
    />
  </>
  );
});

ChatWindow.displayName = "ChatWindow";
