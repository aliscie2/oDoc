import { useCallback, useRef, useState } from "react";
import { Chat } from "../types";

interface UseInfiniteScrollProps {
  chat: Chat;
  backendActor: any;
  onLoadMore: (messages: any[]) => void;
}

export const useInfiniteScroll = ({
  chat,
  backendActor,
  onLoadMore,
}: UseInfiniteScrollProps) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const previousScrollHeight = useRef(0);

  const handleScroll = useCallback(
    async (container: HTMLElement) => {
      if (!container || isLoadingMore || !hasMoreMessages) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 5;
      setIsScrolledToBottom(isAtBottom);

      // Load more when scrolled to top
      if (scrollTop === 0) {
        setIsLoadingMore(true);
        previousScrollHeight.current = scrollHeight;

        try {
          const olderMessages = await backendActor.load_more_messages(
            chat.id,
            chat.messages.length,
          );

          if (olderMessages.length === 0) {
            setHasMoreMessages(false);
          } else {
            // ⚠️ CRITICAL: MESSAGE ORDERING - Infinite Scroll
            // Backend returns messages in reverse chronological order (newest first)
            // Our local array also stores newest first: [newest, ..., oldest]
            // When loading older messages, they should be APPENDED to the END
            //
            // Example:
            // Current:  [msg5(newest), msg4, msg3]
            // Loaded:   [msg2, msg1(oldest)]
            // Result:   [msg5, msg4, msg3, msg2, msg1]
            //
            // The onLoadMore callback will handle appending to the end
            onLoadMore(olderMessages);
          }
        } catch (error) {
          console.error("Error loading more messages:", error);
        } finally {
          setIsLoadingMore(false);
        }
      }
    },
    [
      backendActor,
      chat.id,
      chat.messages.length,
      isLoadingMore,
      hasMoreMessages,
      onLoadMore,
    ],
  );

  return {
    isLoadingMore,
    hasMoreMessages,
    isScrolledToBottom,
    previousScrollHeight,
    handleScroll,
    setIsScrolledToBottom,
  };
};
