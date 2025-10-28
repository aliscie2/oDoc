// ChatFloatingWindow.tsx
import { Close, Remove, Settings } from "@mui/icons-material";
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
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
  const { handleError: _handleError } = useChatErrorHandler();
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

  // OPTIMIZATION: Split Redux selectors to reduce unnecessary re-renders
  const profile = useSelector((state: RootState) => state.filesState.profile);
  const all_friends = useSelector(
    (state: RootState) => state.filesState.all_friends,
  );
  const workspaces = useSelector(
    (state: RootState) => state.filesState.workspaces,
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

  const displayName =
    chat.name.split(/\s+/).length > 3
      ? chat.name.split(/\s+/).slice(0, 3).join(" ") + "..."
      : chat.name;

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
              ? "8px 8px 16px rgba(98, 105, 173, 0.29), -8px -8px 16px rgba(49, 54, 115, 0.34)"
              : "8px 8px 16px rgba(128, 166, 223, 0.3), -8px -8px 16px rgba(74, 94, 141, 0.34)",
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
            gap: 1,
          }}
          onClick={() => {
            if (window.innerWidth >= 600) {
              toggleMinimize();
            }
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              flex: 1,
              overflow: "hidden",
            }}
          >
            {isPrivateChat ? (
              <UserAvatarMenu
                variant="h5"
                dispalyName={true}
                user_id={chat.members
                  .find((m) => m.toString() !== profile?.id)
                  ?.toString()}
                sx={{ width: 40, height: 40, flexShrink: 0 }}
                hide={["Review"]}
              />
            ) : (
              <>
                <UserAvatarMenu
                  variant="h5"
                  dispalyName={false}
                  group={chat.members.map((m) => m.toString())}
                  sx={{ width: 40, height: 40, flexShrink: 0 }}
                  hide={["Review"]}
                />
                <Tooltip
                  title={chat.name.split(/\s+/).length > 3 ? chat.name : ""}
                  arrow
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                    }}
                  >
                    {displayName}
                  </Typography>
                </Tooltip>
              </>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0, ml: "auto" }}>
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
        allFriends={all_friends}
        workspaces={workspaces}
        onSave={handleSaveSettings}
        onDelete={handleDeleteChat}
      />
    </ChatErrorBoundary>
  );
};

ChatFloatingWindow.displayName = "ChatFloatingWindow";
