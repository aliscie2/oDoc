import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { ChatMessage } from "../types";
import { useUndoRedo } from "../undoRedoSystem";

export interface UseChatActionsConfig {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMinimized: React.Dispatch<React.SetStateAction<boolean>>;
  setAbortController: React.Dispatch<
    React.SetStateAction<AbortController | null>
  >;
  processMessage: (
    message: string,
    messageId: string | number,
    abortSignal?: AbortSignal,
  ) => Promise<any>;
  // Calendar routing for undo/redo
  calendarRouter?: {
    isGoogleConnected: boolean;
    executeGoogleAction: (action: any) => Promise<unknown>;
  };
}

/**
 * Refactored useChatActions - now uses configuration object for cleaner API
 * Implements dependency injection pattern for better testability
 */
export const useChatActions = (config: UseChatActionsConfig) => {
  const {
    chatHistory,
    setChatHistory,
    setIsLoading,
    setIsMinimized,
    setAbortController,
    processMessage,
  } = config;
  const dispatch = useDispatch();

  // Set up calendar router for undo/redo system
  const calendarRouterWithDispatch = config.calendarRouter
    ? {
        ...config.calendarRouter,
        dispatch,
      }
    : undefined;

  const { createSnapshot, undo, redo } = useUndoRedo(
    dispatch,
    calendarRouterWithDispatch,
  );

  const handleChatSend = useCallback(
    async (message: string) => {
      const messageId = Date.now();
      const controller = new AbortController();
      setAbortController(controller);
      setIsMinimized(false);

      setChatHistory((prev) => [
        ...prev,
        { type: "user", message, id: `${messageId}-user` },
      ]);
      setIsLoading(true);

      // Add AI message placeholder for streaming
      const aiMessageId = `${messageId}-ai`;
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: "",
          id: aiMessageId,
          canUndo: false,
          canRedo: false,
          canRetry: false,
          action_type: "",
          actions: [],
          isTyping: true,
        },
      ]);

      try {
        const result = await processMessage(
          message,
          messageId,
          controller.signal,
        );

        // Check if request was cancelled
        if (controller.signal.aborted) {
          return;
        }

        // Create snapshot for undo/redo if there are actions
        let snapshotId: string | undefined;
        if (result.actions?.length > 0) {
          console.log("[CHAT] Creating snapshot:", {
            aiMessageId,
            actionType: result.action_type,
            actionsCount: result.actions.length,
            actions: result.actions,
          });

          const snapshot = createSnapshot(
            aiMessageId,
            result.action_type,
            result.actions,
            result, // Pass the full result which includes prev_job, etc.
          );
          snapshotId = snapshot.id;

          console.log("[CHAT] Snapshot created with ID:", snapshotId);
        }

        // Update final message with complete response and actions
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  message: `${result.feedback} \n **${result.profile_completion || result.job?.profile_completion || ""}**`,
                  canUndo: Boolean(snapshotId),
                  canRetry: (result.actions?.length || 0) > 0,
                  action_type: result.action_type,
                  actions: result.actions,
                  isTyping: false,
                  snapshotId,
                }
              : msg,
          ),
        );
      } catch (error: unknown) {
        // Don't show error if request was cancelled
        if (controller.signal.aborted) {
          return;
        }

        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId
              ? {
                  ...msg,
                  message: error.message || "An error occurred",
                  canUndo: false,
                  canRedo: false,
                  canRetry: true,
                  isTyping: false,
                }
              : msg,
          ),
        );
      } finally {
        setIsLoading(false);
        setAbortController(null);
      }
    },
    [
      processMessage,
      createSnapshot,
      setChatHistory,
      setIsLoading,
      setIsMinimized,
      setAbortController,
    ],
  );

  const handleCancelRequest = useCallback(() => {
    setAbortController((abortController) => {
      if (abortController) {
        abortController.abort();
        setIsLoading(false);

        // Add a cancelled message to chat history
        setChatHistory((prev) => {
          const completedPrev = prev.map((msg) =>
            msg.isTyping ? { ...msg, isTyping: false } : msg,
          );
          return [
            ...completedPrev,
            {
              type: "ai",
              message: "Request cancelled",
              id: `${Date.now()}-cancelled`,
              canUndo: false,
              canRedo: false,
              canRetry: false,
              isTyping: false,
            },
          ];
        });
      }
      return null;
    });
  }, [setChatHistory, setIsLoading]);

  const handleUndoMessage = useCallback(
    async (messageId: string | number) => {
      console.log("[CHAT] ========== UNDO BUTTON CLICKED ==========");
      console.log("[CHAT] Message ID:", messageId);

      const message = chatHistory.find((m) => m.id === messageId);

      if (!message) {
        console.log("[CHAT] ❌ Message not found in chat history");
        return;
      }

      console.log("[CHAT] Message found:", {
        type: message.type,
        actionType: message.action_type,
        actionsCount: message.actions?.length,
        hasSnapshotId: !!message.snapshotId,
        snapshotId: message.snapshotId,
        canUndo: message.canUndo,
      });

      if (!message.snapshotId) {
        console.log("[CHAT] ❌ No snapshot ID - cannot undo");
        return;
      }

      console.log("[CHAT] Calling undo with snapshot ID:", message.snapshotId);
      const success = await undo(message.snapshotId);
      console.log("[CHAT] Undo result:", success ? "SUCCESS" : "FAILED");

      if (success) {
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === messageId && msg.type === "ai"
              ? { ...msg, canUndo: false, canRedo: true }
              : msg,
          ),
        );
      }
    },
    [chatHistory, undo, setChatHistory],
  );

  const handleRedoMessage = useCallback(
    async (messageId: string | number) => {
      console.log("[CHAT] ========== REDO BUTTON CLICKED ==========");
      console.log("[CHAT] Message ID:", messageId);

      const message = chatHistory.find((m) => m.id === messageId);

      if (!message?.snapshotId) {
        console.log("[CHAT] ❌ No snapshot ID - cannot redo");
        return;
      }

      console.log("[CHAT] Calling redo with snapshot ID:", message.snapshotId);
      const success = await redo(message.snapshotId);
      console.log("[CHAT] Redo result:", success ? "SUCCESS" : "FAILED");

      if (success) {
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === messageId && msg.type === "ai"
              ? { ...msg, canUndo: true, canRedo: false }
              : msg,
          ),
        );
      }
    },
    [chatHistory, redo, setChatHistory],
  );

  const handleRetry = useCallback(
    (msgId: string | number) => {
      const msg = chatHistory.find((m) => m.id === msgId);
      const userMsg =
        chatHistory[chatHistory.findIndex((m) => m.id === msgId) - 1];
      if (msg?.canUndo) handleUndoMessage(msgId);
      if (userMsg?.message) handleChatSend(userMsg.message);
    },
    [chatHistory, handleUndoMessage, handleChatSend],
  );

  return {
    handleChatSend,
    handleCancelRequest,
    handleUndoMessage,
    handleRedoMessage,
    handleRetry,
  };
};
