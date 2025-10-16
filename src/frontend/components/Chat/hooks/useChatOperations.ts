import { useCallback, useState } from "react";
import { Principal } from "@dfinity/principal";
import { Chat, Message } from "../types";

interface UseChatOperationsProps {
  backendActor: any;
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
        const formattedChat = {
          ...chat,
          admins: chat.admins.map((a) =>
            a instanceof Principal ? a : Principal.fromText(a.toString()),
          ),
          creator:
            chat.creator instanceof Principal
              ? chat.creator
              : Principal.fromText(chat.creator.toString()),
          members: chat.members.map((m) =>
            m instanceof Principal ? m : Principal.fromText(m.toString()),
          ),
          messages: chat.messages.map((msg) => ({
            ...msg,
            sender:
              msg.sender instanceof Principal
                ? msg.sender
                : Principal.fromText(msg.sender.toString()),
            seen_by: msg.seen_by.map((s) =>
              s instanceof Principal ? s : Principal.fromText(s.toString()),
            ),
            date: typeof msg.date === "bigint" ? msg.date : BigInt(msg.date),
          })),
        };

        const result = await backendActor.update_chat(formattedChat);
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
        await backendActor.message_is_seen(messageForBackend);
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
