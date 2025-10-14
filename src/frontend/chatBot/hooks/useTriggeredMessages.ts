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
  const { shownMessageIds, setShownMessageIds, setChatHistory, setIsMinimized } = config;
  const messageRules = useMessageRules();

  const allTriggeredMessages = useMemo(
    () => [
      ...messageRules.getTriggeredMessages("immediate"),
      ...messageRules.getTriggeredMessages("automatic"),
      ...messageRules.getTriggeredMessages("contextual"),
    ],
    [messageRules],
  );

  const processNewMessages = useCallback(
    (currentShownIds: Set<string>) => {
      // Get all active replace groups from triggered messages
      const activeReplaceGroups = new Map<string, string>();
      allTriggeredMessages.forEach((msg) => {
        if (msg.metadata?.replaceGroup) {
          activeReplaceGroups.set(msg.metadata.replaceGroup, msg.id);
        }
      });

      // Filter messages: keep non-replaceable ones and only the latest from each replace group
      const newMessages = allTriggeredMessages.filter((msg) => {
        // If message has no replace group, check if already shown (for showOnce)
        if (!msg.metadata?.replaceGroup) {
          return msg.metadata?.showOnce ? !currentShownIds.has(msg.id) : false;
        }
        
        // For replace groups, only show if this is the active message for that group
        const groupId = msg.metadata.replaceGroup;
        return activeReplaceGroups.get(groupId) === msg.id;
      });

      if (newMessages.length > 0) {
        const newChatMessages = newMessages.map((messageRule) => ({
          type: "ai" as const,
          message: messageRules.getMessage(messageRule.message),
          id: messageRule.id,
          canUndo: messageRule.canUndo,
          canRedo: false,
          canRetry: messageRule.canRetry,
          action_type: messageRule.actionType,
          actions: [],
          isTyping: true,
          replaceGroup: messageRule.metadata?.replaceGroup,
        }));

        setChatHistory((prev) => {
          // Complete all typing messages
          const completedPrev = prev.map((msg) =>
            msg.isTyping ? { ...msg, isTyping: false } : msg
          );
          
          // Remove old messages from active replace groups
          const filtered = completedPrev.filter((msg) => {
            if (!msg.replaceGroup) return true;
            return !activeReplaceGroups.has(msg.replaceGroup);
          });
          
          return [...filtered, ...newChatMessages];
        });

        const userClosedChat = sessionStorage.getItem('chatMinimized') === 'true';
        if (!userClosedChat) {
          setIsMinimized(false);
        }

        // Update shown IDs with new messages
        const updatedIds = new Set(currentShownIds);
        newMessages.forEach((msg) => updatedIds.add(msg.id));
        return updatedIds;
      }

      return currentShownIds;
    },
    [allTriggeredMessages, messageRules, setChatHistory, setIsMinimized],
  );

  useEffect(() => {
    setShownMessageIds(processNewMessages);
  }, [allTriggeredMessages, processNewMessages, setShownMessageIds]);
};