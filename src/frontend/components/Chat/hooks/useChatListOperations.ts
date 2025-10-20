import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Principal } from "@dfinity/principal";
import { Chat } from "$/declarations/backend/backend.did";
import { backendActor } from "@/utils/backendUtils";
import { useIsMobile } from "./useIsMobile";

interface UseChatListOperationsProps {
  profile?: { id: string };
  onWarning?: (message: string) => void;
}

export const useChatListOperations = ({ 
  profile, 
  onWarning 
}: UseChatListOperationsProps = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getOtherUser = useCallback(
    (chat: Chat) => {
      if (chat.name !== "private_chat") return null;

      const ODOC_CEO_ID =
        "tgwpc-6xuon-k3a6y-ey7lt-xksjs-qx22h-ikhbt-4yp3a-6stco-rymbe-pqe";

      const otherAdmin = chat?.admins?.map(a => a.toString())[0];

      if (otherAdmin?.toString() === ODOC_CEO_ID) {
        return {
          id: ODOC_CEO_ID,
          name: "oDoc",
          photo: "/logo.png",
        };
      }

      return otherAdmin;
    },
    []
  );

  const handleOpenChat = useCallback(
    async (chat: Chat, closeDropdown?: () => void) => {
      if (isMobile) {
        navigate(`/chat/${chat.id}`);
      } else {
        dispatch({ type: "OPEN_CHAT", chatId: chat.id });
      }

      // Mark all unread messages as seen
      if (backendActor && profile?.id) {
        for (const message of chat.messages) {
          const senderStr =
            message.sender instanceof Principal
              ? message.sender.toString()
              : message.sender;

          if (senderStr !== profile.id) {
            const alreadySeen = message.seen_by.some((user) => {
              const userStr =
                user instanceof Principal ? user.toString() : user;
              return userStr === profile.id;
            });

            if (!alreadySeen) {
              try {
                const result = await backendActor.message_is_seen(message);
                if ("Ok" in result) {
                  const updatedMessage = {
                    ...message,
                    seen_by: [
                      ...message.seen_by,
                      Principal.fromText(profile.id),
                    ],
                  };
                  dispatch({ type: "UPDATE_MESSAGE", message: updatedMessage });
                }
              } catch {
                onWarning?.("Failed to mark message as read");
              }
            }
          }
        }
      }

      closeDropdown?.();
    },
    [dispatch, navigate, backendActor, profile?.id, isMobile, onWarning]
  );

  const isCreator = useCallback(
    (chat: Chat) => {
      return chat.creator?.toString() === profile?.id;
    },
    [profile?.id]
  );

  const shouldShowSettings = useCallback(
    (chat: Chat) => {
      return chat.name !== "private_chat" && isCreator(chat);
    },
    [isCreator]
  );

  return {
    getOtherUser,
    handleOpenChat,
    isCreator,
    shouldShowSettings,
  };
};