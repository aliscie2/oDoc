import { useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { RootState } from "@/redux/reducers";
import { MessageProcessor } from "../core/MessageProcessor";
import { useAIService } from "./useAIService";
import { useAICases } from "./useAICases";

// Re-export types for backward compatibility
export type { ProcessedMessage } from "../core/MessageProcessor";

/**
 * Refactored useMessageProcessor - now a thin wrapper around MessageProcessor service
 * Follows React best practices with proper separation of concerns
 */
export const useMessageProcessor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux state
  const { calendar } = useSelector((state: RootState) => state.calendarState);
  const { currentJobId, jobs } = useSelector((state: RootState) => state.jobState);
  const { contracts, all_friends, profile } = useSelector(
    (state: RootState) => state.filesState,
  );

  // Service dependencies
  const aiService = useAIService();
  const aiCases = useAICases();

  // Local state for message responses
  const [messageResponses, setMessageResponses] = useState<
    Record<string | number, unknown>
  >({});

  // Create MessageProcessor instance with proper memoization
  const messageProcessor = useMemo(() => {
    const config = {
      calendar,
      jobs,
      currentJobId,
      contracts,
      all_friends,
      profile,
    };

    const navigationInterface = {
      navigate,
      location,
    };

    const dispatchInterface = {
      dispatch,
    };

    return new MessageProcessor(
      config,
      aiService,
      aiCases,
      navigationInterface,
      dispatchInterface
    );
  }, [
    calendar,
    jobs,
    currentJobId,
    contracts,
    all_friends,
    profile,
    navigate,
    location,
    dispatch,
    aiService,
    aiCases,
  ]);

  // Wrapper function that adds message response tracking
  const processMessage = useCallback(
    async (
      message: string,
      messageId: string | number,
      abortSignal?: AbortSignal,
    ) => {
      try {
        const result = await messageProcessor.processMessage(
          message,
          messageId,
          abortSignal
        );

        // Track message responses for debugging/analytics
        setMessageResponses((prev) => ({
          ...prev,
          [messageId]: { result },
        }));

        return result;
      } catch (error) {
        console.error("Error in useMessageProcessor:", error);
        throw error;
      }
    },
    [messageProcessor]
  );

  return {
    processMessage,
    messageResponses,
  };
};
