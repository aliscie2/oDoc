// ChatFloatingWindow.tsx
import { Close, Remove, Settings } from "@mui/icons-material";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/reducers";
import { backendActor } from "../../utils/backendUtils";
import UserAvatarMenu from "../MainComponents/UserAvatarMenu";
import { ChatSettingsDialog } from "./ChatSettingsDialog";
import { useChatOperations } from "./hooks/useChatOperations";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { MessageInput } from "./MessageInput";
import { MessagesList } from "./MessagesList";
import { Chat } from "$/declarations/backend/backend.did";
import { isUserCreator, isUserAdmin } from "./utils/chatUtils";
import { ChatErrorBoundary } from "./ErrorBoundary/ChatErrorBoundary";
import { useChatErrorHandler } from "./hooks/useChatErrorHandler";

interface ChatFloatingWindowProps {
  chat: Chat;
  index: number;
}

export const ChatFloatingWindow: React.FC<ChatFloatingWindowProps> = ({
  chat,
  index,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  // const [isMinimized, setIsMinimized] = React.useState(false);

  const dispatch = useDispatch();
  const { handleError } = useChatErrorHandler();
  const { openChatWindows } = useSelector(
    (state: RootState) => state.chatsState,
  );
  const isMinimized = openChatWindows[chat.id]?.isMinimized || false;
  const toggleMinimize = () => {
    dispatch({
      type: "TOGGLE_CHAT_MINIMIZE",
      chatId: chat.id,
    });
  };

  const { profile, all_friends, workspaces } = useSelector(
    (state: RootState) => state.filesState,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { sendMessage, updateChat, deleteChat, isSending } = useChatOperations({
    backendActor,
    onSuccess: () => {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    },
  });

  const handleSaveSettings = useCallback(
    async (updatedChat: Chat) => {
      const success = await updateChat(updatedChat);
      if (success) dispatch({ type: "UPDATE_CHAT", chat: updatedChat });
      return success;
    },
    [updateChat, dispatch],
  );

  const handleDeleteChat = useCallback(() => {
    deleteChat(chat.id);
    dispatch({ type: "DELETE_CHAT", chat_id: chat.id });
    dispatch({ type: "CLOSE_CHAT_WINDOW", chatId: chat.id });
  }, [deleteChat, chat.id, dispatch]);

  const infiniteScroll = useInfiniteScroll({
    chat,
    backendActor,
    onLoadMore: (olderMessages) => {
      dispatch({
        type: "UPDATE_CHAT",
        chat: { ...chat, messages: [...chat.messages, ...olderMessages] },
      });
    },
  });

  useEffect(() => {
    if (infiniteScroll.isScrolledToBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat.messages.length, infiniteScroll.isScrolledToBottom]);

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
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: BigInt(Date.now()) * BigInt(1e6),
          sender: profile.id,
          seen_by: [profile.id],
          message: messageText,
          chat_id: chat?.id,
        };
        dispatch({
          type: "UPDATE_CHAT",
          chat: { ...chat, messages: [newMessage, ...chat.messages] },
        });
        infiniteScroll.setIsScrolledToBottom(true);
      }
      return success;
    },
    [chat, profile?.id, sendMessage, dispatch, infiniteScroll],
  );

  const isPrivateChat = chat.name === "private_chat";
  const isCreator = isUserCreator(chat.creator, profile?.id);
  const isAdmin = isUserAdmin(chat.admins, profile?.id);
  const showSettings = !isPrivateChat && (isCreator || isAdmin);
  const rightOffset = index * 340 + 20;

  return (
    <ChatErrorBoundary>
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          bottom: 0,
          right: rightOffset,
          width: 320,
          height: isMinimized ? 48 : 480,
          display: "flex",
          flexDirection: "column",
          zIndex: 1300,
          transition: "height 0.3s ease, box-shadow 0.3s ease",
          borderRadius: isMinimized ? "16px 16px 0 0" : "16px 16px 0 0",
          bgcolor: "background.paper",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "8px 8px 16px rgba(0,0,0,0.5), -8px -8px 16px rgba(60,60,60,0.1)"
              : "8px 8px 16px rgba(163,177,198,0.3), -8px -8px 16px rgba(255,255,255,0.8)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: { xs: 2, sm: 1.5 },
            borderBottom: isMinimized ? 0 : 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            color: "text.primary",
            cursor: { xs: "default", sm: "pointer" },
            minHeight: { xs: 56, sm: 48 },
            borderRadius: {
              xs: 0,
              sm: isMinimized ? "16px 16px 0 0" : "16px 16px 0 0",
            },
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "inset 2px 2px 4px rgba(0,0,0,0.3)"
                : "inset 2px 2px 4px rgba(58,141,255,0.2)",
          }}
          onClick={() => {
            // Only toggle on desktop
            if (window.innerWidth >= 600) {
              toggleMinimize();
            }
          }}
        >
          {isPrivateChat ? (
            <UserAvatarMenu
              dispalyName={true}
              user_id={chat.members
                .find((m) => m.toString() !== profile?.id)
                ?.toString()}
              sx={{ width: 40, height: 40 }}
              hide={["Review"]}
            />
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
              >
                {chat.name.charAt(0).toUpperCase()}
              </Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "150px",
                }}
              >
                {chat.name}
              </Typography>
            </Box>
          )}
          <Box sx={{ flex: 1 }} />

          {/* Hide minimize button on mobile */}
          <IconButton
            size="small"
            sx={{
              color: "inherit",
              display: { xs: "none", sm: "inline-flex" },
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize();
            }}
          >
            <Remove />
          </IconButton>

          {showSettings && (
            <IconButton
              size="small"
              sx={{ color: "inherit" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(true);
              }}
            >
              <Settings />
            </IconButton>
          )}

          <IconButton
            size="small"
            sx={{ color: "inherit" }}
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: "CLOSE_CHAT_WINDOW", chatId: chat.id });
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {!isMinimized && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
            }}
          >
            <MessagesList
              chat={chat}
              currentUserId={profile?.id || ""}
              allFriends={all_friends}
              messagesContainerRef={messagesContainerRef}
              messagesEndRef={messagesEndRef}
              onScroll={infiniteScroll.handleScroll}
              isLoadingMore={infiniteScroll.isLoadingMore}
              hasMoreMessages={infiniteScroll.hasMoreMessages}
              isPrivateChat={isPrivateChat}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              isSending={isSending}
            />
          </Box>
        )}
      </Paper>

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
    </ChatErrorBoundary>
  );
};

ChatFloatingWindow.displayName = "ChatFloatingWindow";
