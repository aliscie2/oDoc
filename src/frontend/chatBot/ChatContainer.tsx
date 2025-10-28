import React, { useMemo, useRef, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useChatState } from "./hooks/useChatState";
import { useChatActions, UseChatActionsConfig } from "./hooks/useChatActions";
import { useTriggeredMessages } from "./hooks/useTriggeredMessages";
import { useMessageProcessor } from "./hooks/useMessageProcessor";
import { ChatWindow } from "./components/ChatWindow";
import { AIInput } from "./components/AIInput";
import { useGoogleCalendar } from "../pages/calendar/googleAccounts/useGoogleCalendar";
import { useLocation } from "react-router-dom";
import { RootState } from "@/redux/reducers";

const ChatContainer = () => {
  // ✅ ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY RETURNS
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

  const location = useLocation();

  const handleMinimize = useCallback(() => {
    sessionStorage.setItem("chatMinimized", "true");
    setIsMinimized(true);
  }, [setIsMinimized]);

  const prevProfileCompletionRef = useRef<number | null>(null);
  
  const { calendar, is_google_connected } = useSelector(
    (state: any) => state.calendarState,
  );
  
  const { currentJobId: selectedJobId, jobs } = useSelector((state: any) => state.jobState);
  
  const currentJob = jobs?.find((job: unknown) => job.id === selectedJobId);

  const isHomePage = ["", "/"].includes(window.location.pathname);
  const shouldCenterChat =
    isHomePage && (!currentJob || !jobs || jobs.length === 0);

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

  const { profile } = useSelector((state: RootState) => state.filesState);
  // Extract stable values to prevent infinite loops
  const currentJobId = currentJob?.id;
  const currentJobCompletion = currentJob?.profile_completion;
  
  useEffect(() => {
    if (!currentJob || !currentJobId) return;

    const currCompletion = currentJobCompletion || 0;
    const prevCompletion = prevProfileCompletionRef.current;

    if (
      prevCompletion !== null &&
      prevCompletion < 0.8 &&
      currCompletion >= 0.8
    ) {
      const messageId = `profile-share-${currentJobId}`;

      if (!shownMessageIds.has(messageId)) {
        const shareLink = `${window.location.origin}/jobs?id=${currentJobId}`;

        (async () => {
          let thumbnailUrl = "";
          try {
            const { jobSEO } = await import("../components/jobSeoComponent");

            const userPhoto = profile?.photo; // Already a blob URL from caster
            console.log(
              "🔍 Profile Photo (blob URL):",
              userPhoto?.substring(0, 50),
            );

            thumbnailUrl = await jobSEO.generateThumbnail(
              currentJob.job_titles?.[0] || "Job Opportunity",
              currentJob.description || "Explore this job opportunity",
              currentJob.skills || [],
              userPhoto,
            );
            console.log(
              "✅ Thumbnail generated:",
              thumbnailUrl.substring(0, 50),
            );
          } catch (error) {
            console.error("❌ Thumbnail generation failed:", error);
          }

          setChatHistory((prev) => [
            ...prev,
            {
              type: "ai" as const,
              message: `🎉 Great progress! Your profile is now ${Math.round(currCompletion * 100)}% complete.\n\n**Make sure to share your profile** to get more visibility!`,
              id: messageId,
              shareLink,
              jobId: currentJobId,
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
    currentJobCompletion,
    currentJobId,
    shownMessageIds,
    setChatHistory,
    setShownMessageIds,
    setIsMinimized,
    currentJob,
    profile?.photo,
  ]);

  // ✅ NOW check if chat should be shown - AFTER all hooks
  const chatEnabledPaths = [
    "/",
    "/contract",
    "/contracts",
    "/calendar",
    "/share_calendar",
  ];

  const isChatEnabled = chatEnabledPaths.some((path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path),
  );
  
  if (!isChatEnabled) {
    return null;
  }

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
