import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useChatState } from "./hooks/useChatState";
import { useChatActions, UseChatActionsConfig } from "./hooks/useChatActions";
import {
  useTriggeredMessages,
} from "./hooks/useTriggeredMessages";
import { useMessageProcessor } from "./hooks/useMessageProcessor";
import { ChatWindow } from "./components/ChatWindow";
import { AIInput } from "./components/AIInput";
import { useGoogleCalendar } from "../pages/calendar/googleAccounts/useGoogleCalendar";

const ChatContainer = () => {
    const {
    assistantName,
    chatHistory,
    setChatHistory,
    isLoading,
    setIsLoading,
    setIsMinimized,
    shownMessageIds,
    setShownMessageIds,
    setAbortController,
    isExpanded,
    credits,
    handleTypingComplete,
  } = useChatState();

    const handleMinimize = useCallback(() => {
    sessionStorage.setItem('chatMinimized', 'true');
    setIsMinimized(true);
  }, [setIsMinimized]);
  const handleMaximize = useCallback(() => {
    sessionStorage.removeItem('chatMinimized');
    setIsMinimized(false);
  }, [setIsMinimized]);




  const prevProfileCompletionRef = useRef<number | null>(null);
  const { calendar, is_google_connected } = useSelector(
    (state: any) => state.calendarState,
  );
  const { currentJobId, jobs } = useSelector((state: any) => state.jobState);
  const currentJob = jobs?.find((job: any) => job.id === currentJobId);

  const isHomePage = ["", "/"].includes(window.location.pathname);
  const shouldCenterChat = isHomePage && (!currentJob | !jobs || jobs.length === 0);

  const messageProcessor = useMessageProcessor();
  const { executeGoogleAction } = useGoogleCalendar();

  const isGoogleConnected =
    is_google_connected && Boolean(calendar?.google_ids?.length);

  const chatActionsConfig: UseChatActionsConfig = useMemo(
    () => ({
      chatHistory,
      setChatHistory,
      setIsLoading,
      setIsMinimized,
      setAbortController,
      processMessage: messageProcessor.processMessage,
      calendarRouter: { isGoogleConnected, executeGoogleAction },
    }),
    [
      chatHistory,
      setChatHistory,
      setIsLoading,
      setIsMinimized,
      setAbortController,
      messageProcessor.processMessage,
      isGoogleConnected,
      executeGoogleAction,
    ],
  );

  const {
    handleChatSend,
    handleCancelRequest,
    handleUndoMessage,
    handleRedoMessage,
    handleRetry,
  } = useChatActions(chatActionsConfig);

  useTriggeredMessages({
    shownMessageIds,
    setShownMessageIds,
    setChatHistory,
    setIsMinimized,
  });

  useEffect(() => {
    if (!currentJob) return;

    const currCompletion = currentJob.profile_completion || 0;
    const prevCompletion = prevProfileCompletionRef.current;

    if (
      prevCompletion !== null &&
      prevCompletion < 0.8 &&
      currCompletion >= 0.8
    ) {
      const messageId = `profile-share-${currentJob.id}`;

      if (!shownMessageIds.has(messageId)) {
        const shareLink = `${window.location.origin}/jobs?id=${currentJob.id}`;

        (async () => {
          let thumbnailUrl = "";
          try {
            const { jobSEO } = await import("../components/jobSeoComponent");
            thumbnailUrl = await jobSEO.generateThumbnail(
              currentJob.job_titles?.[0] || "Job Opportunity",
              currentJob.description || "Explore this job opportunity",
              currentJob.skills || [],
            );
          } catch {}

          setChatHistory((prev) => [
            ...prev,
            {
              type: "ai" as const,
              message: `🎉 Great progress! Your profile is now ${Math.round(currCompletion * 100)}% complete.\n\n**Make sure to share your profile** to get more visibility!`,
              id: messageId,
              shareLink,
              jobId: currentJob.id,
              thumbnailUrl: thumbnailUrl || undefined,
              canUndo: false,
              canRedo: false,
              isTyping: false,
            },
          ]);
          setShownMessageIds((prev) => new Set([...prev, messageId]));
          setIsMinimized(false);
        })();
      }
    }

    prevProfileCompletionRef.current = currCompletion;
  }, [
    currentJob?.profile_completion,
    currentJob?.id,
    shownMessageIds,
    setChatHistory,
    setShownMessageIds,
    setIsMinimized,
  ]);

    const chatProps = {
    assistantName,
    credits,
    isLoading,
    onMinimize: handleMinimize, // Use new handler
    chatHistory,
    onUndoMessage: handleUndoMessage,
    onRedoMessage: handleRedoMessage,
    onRetry: handleRetry,
    onTypingComplete: handleTypingComplete,
  };



  const inputProps = {
    onSendMessage: handleChatSend,
    onCancelRequest: handleCancelRequest,
    isLoading,
    chatHistory,
    setIsMinimized,
  };

  if (shouldCenterChat) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "50%",
          left: "50%",
          transform: "translate(-50%, 50%)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          width: "100%",
          maxWidth: "500px",
          padding: "0 16px",
        }}
      >
        {isExpanded && <ChatWindow {...chatProps} shouldCenter />}
        <AIInput {...inputProps} shouldCenter />
      </div>
    );
  }

  return (
    <>
      {isExpanded && <ChatWindow {...chatProps} />}
      <AIInput {...inputProps} />
    </>
  );
};

export default ChatContainer;
