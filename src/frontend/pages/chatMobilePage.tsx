// ChatMobilePage.tsx - NEW FILE
import React, { useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, IconButton, Typography, AppBar, Toolbar } from "@mui/material";
import { ArrowBack, Settings } from "@mui/icons-material";
import { MessagesList } from "@/components/Chat/MessagesList";
import { ChatSettingsDialog } from "@/components/Chat/ChatSettingsDialog";
import { useChatOperations } from "@/components/Chat/hooks/useChatOperations";
import { useInfiniteScroll } from "@/components/Chat/hooks/useInfiniteScroll";
import { MessageInput } from "@/components/Chat/MessageInput";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { User } from "$/declarations/backend/backend.did";
import UserAvatarMenu from "@/components/MainComponents/UserAvatarMenu";

export const ChatMobilePage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const { profile, all_friends, workspaces } = useSelector(
    (state: RootState) => state.filesState,
  );
  const { chats } = useSelector((state: RootState) => state.chatsState);

  const chat = chats.find((c) => c.id === chatId);

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
    async (updatedChat: any) => {
      const success = await updateChat(updatedChat);
      if (success) dispatch({ type: "UPDATE_CHAT", chat: updatedChat });
      return success;
    },
    [updateChat, dispatch],
  );

  const handleDeleteChat = useCallback(() => {
    if (!chat) return;
    deleteChat(chat.id);
    dispatch({ type: "DELETE_CHAT", chat_id: chat.id });
    navigate(-1);
  }, [deleteChat, chat, dispatch, navigate]);

  const infiniteScroll = useInfiniteScroll({
    chat: chat!,
    backendActor,
    onLoadMore: (olderMessages) => {
      if (!chat) return;
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
  }, [chat?.messages.length, infiniteScroll.isScrolledToBottom]);

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
  }, [chat?.messages.length, infiniteScroll.isLoadingMore]);

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!profile?.id || !chat) return false;
      const success = await sendMessage(chat?.id, messageText, profile.id);
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

  if (!chat) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          pb: 0,
        }}
      >
        <Typography>Chat not found</Typography>
      </Box>
    );
  }

  const isPrivateChat = chat.name === "private_chat";
  const isCreator = chat.creator?.toString() === profile?.id;
  const showSettings = !isPrivateChat && isCreator;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "background.paper", color: "text.primary" }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <UserAvatarMenu
            dispalyName={true}
            user_id={
              isPrivateChat
                ? chat.members
                    .find((m) => m.toString() !== profile?.id)
                    ?.toString()
                : undefined
            }
            user={
              !isPrivateChat
                ? ({
                    id: chat.creator?.toString() || "",
                    name: chat.name,
                  } as User)
                : undefined
            }
            sx={{ width: 40, height: 40 }}
            hide={["Review"]}
          />
          {showSettings && (
            <IconButton color="inherit" onClick={() => setIsSettingsOpen(true)}>
              <Settings />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
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
        <MessageInput onSendMessage={handleSendMessage} isSending={isSending} />
      </Box>

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
    </Box>
  );
};
