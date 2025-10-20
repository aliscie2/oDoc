// ChatMobilePage.tsx - NEW FILE
import React, { useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import { MessagesList } from "@/components/Chat/MessagesList";
import { ChatSettingsDialog } from "@/components/Chat/ChatSettingsDialog";
import { ChatHeader } from "@/components/Chat/components/ChatHeader";
import { useChatOperations } from "@/components/Chat/hooks/useChatOperations";
import { useInfiniteScroll } from "@/components/Chat/hooks/useInfiniteScroll";
import { useChatSettings } from "@/components/Chat/hooks/useChatSettings";
import { MessageInput } from "@/components/Chat/MessageInput";
import { RootState } from "@/redux/reducers";
import { backendActor } from "@/utils/backendUtils";
import { User } from "$/declarations/backend/backend.did";

export const ChatMobilePage: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const dispatch = useDispatch();

  const { profile, all_friends, workspaces } = useSelector(
    (state: RootState) => state.filesState,
  );
  const { chats } = useSelector((state: RootState) => state.chatsState);

  const chat = chats.find((c) => c.id === chatId);

  const {
    isSettingsOpen,
    openSettings,
    closeSettings,
    handleSaveSettings,
    handleDeleteChat,
  } = useChatSettings();

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
          pb: 7,
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
        bgcolor: "background.default",
        overflow: "hidden",
        height: "90dvh", // Use dynamic viewport height
      }}
    >
      <ChatHeader
        title={isPrivateChat ? "Chat" : chat.name}
        showSettings={showSettings}
        onSettingsClick={() => openSettings(chat)}
        avatar={{
          userId: isPrivateChat
            ? chat.members.find((m) => m.toString() !== profile?.id)?.toString()
            : undefined,
          user: !isPrivateChat
            ? ({
                id: chat.creator?.toString() || "",
                name: chat.name,
              } as User)
            : undefined,
          isPrivateChat,
        }}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
          pb: 7, // Add padding here for bottom navbar
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
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          zIndex: 1100,
        }}
      >
        <MessageInput onSendMessage={handleSendMessage} isSending={isSending} />
      </Box>

      {chat && (
        <ChatSettingsDialog
          open={isSettingsOpen}
          onClose={closeSettings}
          chat={chat}
          currentUserId={profile?.id || ""}
          allFriends={all_friends}
          workspaces={workspaces}
          onSave={handleSaveSettings}
          onDelete={() => handleDeleteChat(chat.id)}
        />
      )}
    </Box>
  );
};
