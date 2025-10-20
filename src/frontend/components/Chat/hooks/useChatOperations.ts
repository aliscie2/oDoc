import { Principal } from "@dfinity/principal";
import { useCallback, useState } from "react";
import { Chat, Message } from "$/declarations/backend/backend.did";

interface UseChatOperationsProps {
  backendActor: unknown;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useChatOperations = ({
  backendActor,
  onSuccess,
  onError,
}: UseChatOperationsProps) => {
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sendMessage = useCallback(
    async (chatId: string, messageText: string, senderId: string) => {
      if (!messageText.trim() || isSending) return false;

      setIsSending(true);
      try {
        const newMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: BigInt(Date.now()) * BigInt(1e6),
          sender: Principal.fromText(senderId),
          seen_by: [Principal.fromText(senderId)],
          message: messageText,
          chat_id: chatId,
        };

        await backendActor.send_message([], newMessage);
        onSuccess?.();
        return true;
      } catch (error) {
        onError?.(error as Error);
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [backendActor, isSending, onSuccess, onError],
  );

  const updateChat = useCallback(
    async (chat: Chat) => {
      setIsSaving(true);
      try {
        const result = await backendActor.update_chat(chat);
        if ("Ok" in result) {
          onSuccess?.();
          return true;
        }
        return false;
      } catch (error) {
        onError?.(error as Error);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [backendActor, onSuccess, onError],
  );

  const deleteChat = useCallback(
    async (chatId: string) => {
      setIsDeleting(true);
      try {
        const result = await backendActor.delete_chat(chatId);
        if ("Ok" in result) {
          onSuccess?.();
          return true;
        }
        return false;
      } catch (error) {
        onError?.(error as Error);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [backendActor, onSuccess, onError],
  );

  const markAsSeen = useCallback(
    async (message: Message) => {
      try {
        const messageForBackend = {
          ...message,
          date: BigInt(0),
          sender: Principal.fromText(message.sender.toString()),
          seen_by: [],
          chat_id: message.chat_id,
        };
        const res = await backendActor.message_is_seen(messageForBackend);
        console.log("message_is_seen", { useChatOper: res });
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [backendActor, onError],
  );

  return {
    sendMessage,
    updateChat,
    deleteChat,
    markAsSeen,
    isSending,
    isSaving,
    isDeleting,
  };
};
