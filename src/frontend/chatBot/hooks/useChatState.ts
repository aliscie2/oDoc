import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ChatMessage, ReduxState } from "../types";

export const useChatState = () => {
  const location = useLocation();

  // Memoize assistant name to prevent recalculation
  const assistantName = useMemo(
    () =>
      location.pathname.includes("/contract") ||
      location.pathname.startsWith("/c")
        ? "Contract Assistant"
        : "AI Assistant",
    [location.pathname],
  );

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [shownMessageIds, setShownMessageIds] = useState<Set<string>>(
    new Set(),
  );
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Combine all selectors to reduce re-renders
  const { credits, jobs, calendar, jobSearchStage, currentJobId } = useSelector(
    (state: ReduxState) => ({
      credits: state.AIState.credits,
      jobs: state.jobState?.jobs || [],
      calendar: state.calendarState?.calendar || {},
      jobSearchStage: state.jobState?.jobSearchStage || 0,
      currentJobId: state.jobState?.currentJobId || null,
    }),
  );

  const isExpanded = chatHistory.length > 0 && !isMinimized;

  const handleTypingComplete = useCallback((messageId: string | number) => {
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg,
      ),
    );
  }, []);

  return {
    assistantName,
    chatHistory,
    setChatHistory,
    isLoading,
    setIsLoading,
    isMinimized,
    setIsMinimized,
    shownMessageIds,
    setShownMessageIds,
    abortController,
    setAbortController,
    isExpanded,
    credits,
    jobs,
    calendar,
    jobSearchStage,
    currentJobId,
    handleTypingComplete,
  };
};
