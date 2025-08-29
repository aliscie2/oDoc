import { useEffect, useCallback, useMemo } from "react";
import { ChatMessage } from "../types";
import { useMessageRules } from "./useMessageRules";

export interface UseTriggeredMessagesConfig {
  shownMessageIds: Set<string>;
  setShownMessageIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsMinimized: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Refactored useTriggeredMessages - now uses useMessageRules directly
 * No longer depends on deprecated useChatHandler
 */
export const useTriggeredMessages = (config: UseTriggeredMessagesConfig) => {
  const { setShownMessageIds, setChatHistory, setIsMinimized } = config;

  // Use messageRules directly instead of deprecated useChatHandler
  const messageRules = useMessageRules();

  // Memoize the triggered messages calculation to prevent unnecessary recalculations
  const allTriggeredMessages = useMemo(
    () => [
      ...messageRules.getTriggeredMessages("immediate"),
      ...messageRules.getTriggeredMessages("automatic"),
      ...messageRules.getTriggeredMessages("contextual"),
    ],
    [messageRules.getTriggeredMessages],
  );

  // Memoize the message processing callback
  const processNewMessages = useCallback(
    (currentShownIds: Set<string>) => {
      const newMessages = allTriggeredMessages.filter(
        (msg) => !currentShownIds.has(msg.id),
      );

      if (newMessages.length > 0) {
        const newChatMessages = newMessages.map((messageRule, index) => ({
          type: "ai" as const,
          message: messageRules.getMessage(messageRule.message),
          id: `${messageRule.id}-${Date.now()}-${index}`,
          canUndo: messageRule.canUndo,
          canRedo: false,
          canRetry: messageRule.canRetry,
          action_type: messageRule.actionType,
          actions: [],
          isTyping: true,
        }));

        setChatHistory((prev) => {
          const completedPrev = prev.map((msg) =>
            msg.isTyping ? { ...msg, isTyping: false } : msg,
          );
          return [...completedPrev, ...newChatMessages];
        });
        setIsMinimized(false);

        const newSet = new Set(currentShownIds);
        newMessages.forEach((msg) => newSet.add(msg.id));
        return newSet;
      }

      return currentShownIds;
    },
    [
      allTriggeredMessages,
      messageRules.getMessage,
      setChatHistory,
      setIsMinimized,
    ],
  );

  // Handle triggered messages
  useEffect(() => {
    setShownMessageIds(processNewMessages);
  }, [allTriggeredMessages, processNewMessages, setShownMessageIds]);
};
