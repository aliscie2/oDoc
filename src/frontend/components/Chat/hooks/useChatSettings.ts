import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { Chat } from "$/declarations/backend/backend.did";
import { backendActor } from "@/utils/backendUtils";

interface UseChatSettingsProps {
  onSuccess?: (message: string) => void;
  onError?: (error: any, context: string) => void;
}

export const useChatSettings = ({
  onSuccess,
  onError,
}: UseChatSettingsProps = {}) => {
  const dispatch = useDispatch();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  const openSettings = useCallback((chat: Chat) => {
    setSelectedChat(chat);
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
    setSelectedChat(null);
  }, []);

  const handleSaveSettings = useCallback(
    async (updatedChat: Chat) => {
      if (!backendActor) return false;
      try {
        const result = await backendActor.update_chat(updatedChat);
        if ("Ok" in result) {
          dispatch({
            type: "UPDATE_CHAT",
            chat: updatedChat,
          });
          onSuccess?.("Chat settings updated successfully");
          return true;
        } else {
          throw new Error(result.Err || "Failed to update chat");
        }
      } catch (error) {
        onError?.(error, "update chat settings");
        return false;
      }
    },
    [dispatch, onSuccess, onError],
  );

  const handleDeleteChat = useCallback(
    async (chatId: string) => {
      if (!backendActor) return false;
      try {
        const result = await backendActor.delete_chat(chatId);
        if ("Ok" in result) {
          dispatch({
            type: "DELETE_CHAT",
            chat_id: chatId,
          });
          closeSettings();
          onSuccess?.("Chat deleted successfully");
          return true;
        } else {
          throw new Error(result.Err || "Failed to delete chat");
        }
      } catch (error) {
        onError?.(error, "delete chat");
        return false;
      }
    },
    [dispatch, closeSettings, onSuccess, onError],
  );

  return {
    isSettingsOpen,
    selectedChat,
    openSettings,
    closeSettings,
    handleSaveSettings,
    handleDeleteChat,
  };
};
