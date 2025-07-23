import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import { Chat, Send, Refresh, Undo, Redo } from "@mui/icons-material";

import { useSelector } from "react-redux";
import MarkdownMessage from "./markDownMessageRdnder"; // Import the new component
import AICreditsComponent from "./AICreditsCompnent";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";

const AIChatComponent = ({
  isExpanded,
  onToggle,
  chatHistory,
  onSendMessage,
  isLoading,
  onUndoMessage,
  onRedoMessage,
}) => {
  const { currentJobId, jobs, is_profile_complete } = useSelector(
    (state) => state.jobState,
  );
  const { calendar } = useSelector((state) => state.calendarState);
  const { inited } = useSelector((state) => state.filesState);
  const { aiAgent } = useSelector((state) => state.AIState);

  const [message, setMessage] = useState("");
  const [welcomeText, setWelcomeText] = useState("");
  const [userHasClosed, setUserHasClosed] = useState(false);

  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const hasActiveJobs = jobs.some((job) => job.active);
  const hasAvailabilities = calendar?.availabilities?.length > 0;
  const shouldShowWelcome =
    (jobs.length === 0 || (hasActiveJobs && !hasAvailabilities)) &&
    !userHasClosed;

  const [isFirstTime, setIsFirstTime] = useState(shouldShowWelcome);

  useEffect(() => {
    setIsFirstTime(shouldShowWelcome);
  }, [shouldShowWelcome]);

  const getWelcomeText = () => {
    if (jobs.length === 0) {
      return "Hello, are you looking for a job, or you want to post a job, describe with details what you looking for.";
    }
    if (hasActiveJobs && !hasAvailabilities) {
      return "Good job now for other people to find you, let them know when are you available. For example, tell me 'I am available every day from 9 AM to 1 PM except sundays'";
    }
    return "";
  };

  const fullWelcomeText = getWelcomeText();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasActiveJobs && !hasAvailabilities && !userHasClosed) {
        e.preventDefault();
        e.returnValue = "Set your availabilities please.";
        return "Set your availabilities please.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasActiveJobs, hasAvailabilities, userHasClosed]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (isFirstTime && isExpanded && fullWelcomeText) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < fullWelcomeText.length) {
          setWelcomeText(fullWelcomeText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isFirstTime, isExpanded, fullWelcomeText]);

  useEffect(() => {
    if (shouldShowWelcome && !isExpanded && !userHasClosed) {
      onToggle();
    }
  }, [shouldShowWelcome, isExpanded, onToggle, userHasClosed]);

  useEffect(() => {
    if (isExpanded && !isFirstTime) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded, isFirstTime]);

  const handleSend = async () => {
    if (!message.trim()) return;
    if (isFirstTime) {
      localStorage.setItem("aiChatUsed", "true");
      setIsFirstTime(false);
      setUserHasClosed(false);
    }
    onSendMessage(message);
    setMessage("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleToggle = () => {
    if (isExpanded) {
      setUserHasClosed(true);
    }
    onToggle();
  };

  const handleRetry = (msgId) => {
    const msg = chatHistory.find((m) => m.id === msgId);
    if (!msg) return;
    const userMsgIndex = chatHistory.findIndex((m) => m.id === msgId) - 1;
    const userMsg = chatHistory[userMsgIndex];
    if (msg.canUndo) onUndoMessage(msgId);
    if (userMsg?.message) onSendMessage(userMsg.message);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!inited) return null;

  const isFullscreen = isFirstTime && isExpanded;

  const renderFullscreenView = () => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Typography
        variant="h4"
        sx={{ textAlign: "center", color: "#00d4ff", fontWeight: "bold" }}
      >
        {welcomeText}
        <span
          style={{
            opacity: welcomeText.length < fullWelcomeText.length ? 1 : 0,
          }}
        >
          |
        </span>
      </Typography>
      <Box
        display="flex"
        gap={1}
        alignItems="flex-end"
        sx={{ width: "100%", maxWidth: 600 }}
      >
        <TextField
          id="aiAssistantInput"
          ref={inputRef}
          size="small"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          autoFocus
        />
        <IconButton
          id="submitAIMessage"
          onClick={handleSend}
          sx={{ flexShrink: 0 }}
        >
          <Send />
        </IconButton>
      </Box>
    </Box>
  );

  const renderChatView = () => (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AICreditsComponent credits={aiAgent.remainingCredits()} />
          <Typography variant="h6" sx={{ fontSize: "1rem" }}>
            AI Assistant
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleToggle}>
          ×
        </IconButton>
      </Box>
      <RunawayJellyfish
        die={aiAgent.remainingCredits() == 0}
        thinking={isLoading}
        runaway={true}
      />
      <Box ref={chatContainerRef} sx={{ flex: 1, overflowY: "auto", mb: 2 }}>
        {chatHistory.map((msg, idx) => (
          <Box key={idx} mb={1}>
            <Box
              sx={{
                display: "flex",
                justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Box sx={{ maxWidth: "80%", textAlign: "left" }}>
                <MarkdownMessage
                  message={msg.message}
                  isUser={msg.type === "user"}
                />
              </Box>
            </Box>
            {msg.type === "ai" &&
              (msg.canUndo || msg.canRedo || msg.canRetry) && (
                <Box
                  display="flex"
                  gap={1}
                  justifyContent="flex-start"
                  flexWrap="wrap"
                >
                  {msg.canRetry && (
                    <Button
                      size="small"
                      startIcon={<Refresh fontSize="small" />}
                      onClick={() => handleRetry(msg.id)}
                      sx={{
                        color: "#00d4ff",
                        minWidth: "auto",
                        p: 0.5,
                        fontSize: "0.75rem",
                      }}
                    >
                      Retry
                    </Button>
                  )}
                  {msg.canUndo && (
                    <Button
                      size="small"
                      startIcon={<Undo fontSize="small" />}
                      onClick={() => onUndoMessage(msg.id)}
                      sx={{
                        color: "#ff9800",
                        minWidth: "auto",
                        p: 0.5,
                        fontSize: "0.75rem",
                      }}
                    >
                      Undo
                    </Button>
                  )}
                  {msg.canRedo && (
                    <Button
                      size="small"
                      startIcon={<Redo fontSize="small" />}
                      onClick={() => onRedoMessage(msg.id)}
                      sx={{
                        color: "#4caf50",
                        minWidth: "auto",
                        p: 0.5,
                        fontSize: "0.75rem",
                      }}
                    >
                      Redo
                    </Button>
                  )}
                </Box>
              )}
          </Box>
        ))}
      </Box>
      <Box display="flex" gap={1} alignItems="flex-end">
        <TextField
          ref={inputRef}
          disabled={isLoading}
          size="small"
          fullWidth
          multiline
          minRows={1}
          maxRows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <IconButton
          disabled={isLoading}
          onClick={handleSend}
          sx={{ flexShrink: 0 }}
        >
          <Send />
        </IconButton>
      </Box>
    </>
  );

  return (
    <Card
      sx={{
        position: "fixed",
        ...(isFullscreen
          ? { top: 0, left: 0, right: 0, bottom: 0 }
          : {
              bottom: { xs: 80, sm: 20 },
              right: { xs: 10, sm: 20 },
            }),
        width: !isExpanded
          ? 60
          : isFullscreen
            ? "100vw"
            : { xs: "calc(100vw - 20px)", sm: 500, md: 600 },
        height: !isExpanded
          ? 60
          : isFullscreen
            ? "100vh"
            : { xs: "50vh", sm: 400, md: 500 },
        zIndex: 1000,
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: isFullscreen ? 0 : "16px",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.2)",
        },
      }}
    >
      <CardContent sx={{ p: 1, height: "100%" }}>
        {!isExpanded ? (
          <IconButton onClick={handleToggle} sx={{ color: "#00d4ff" }}>
            <Chat />
          </IconButton>
        ) : (
          <Box
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {isFullscreen ? renderFullscreenView() : renderChatView()}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

import { useDispatch } from "react-redux";
import { useChatHandler } from "./useChathandler";
import { undoCalendarAction, undoJobAction } from "./reverseAction";

const ChatContainer = () => {
  const dispatch = useDispatch();
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);

  const { calendar } = useSelector((state) => state.calendarState);
  const { currentJobId, jobs } = useSelector((state) => state.jobState);
  const currentJob = jobs.find((job) => job.id === currentJobId);
  const { processMessage } = useChatHandler();
  const currentJobRef = useRef(undefined);

  useEffect(() => {
    currentJobRef.current = jobs.find((job) => job.id === currentJobId);
  }, [currentJobId, jobs]);

  const handleChatSend = async (message, isQuick = true) => {
    const messageId = messageCounter + 1;
    setMessageCounter(messageId);

    setChatHistory((prev) => [
      ...prev,
      { type: "user", message, id: messageId + "user" },
    ]);
    setIsLoading(true);

    try {
      const perv_cal = calendar;
      const prev_job = currentJob;
      const result = await processMessage(message, messageId, isQuick);
      const hasActions = result.actions && result.actions.length > 0;

      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          action_type: result.action_type,
          actions: result.actions,
          message: result.feedback,
          id: messageId,
          canUndo: hasActions,
          canRedo: false,
          canRetry: hasActions,
          done: result.done,
          curr_cal: result.action_type == "JOB" ? null : calendar,
          curr_job: result.action_type == "JOB" ? currentJob : null,
          prev_job: result.action_type == "JOB" ? prev_job : null,
          perv_cal: result.action_type == "JOB" ? null : perv_cal,
        },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: error.message || "An error occurred",
          id: messageId,
          canUndo: false,
          canRedo: false,
          canRetry: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndoMessage = (messageId) => {
    const message = chatHistory.find((m) => m.id == messageId);
    if (!message) return;

    if (message.action_type === "CALENDAR") {
      const undoAction = undoCalendarAction(message);
      undoAction.forEach((action) => dispatch(action));
    } else if (message.action_type === "JOB") {
      const undoAction = undoJobAction(message);
      dispatch(undoAction);
    }

    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.type === "ai"
          ? { ...msg, canUndo: false, canRedo: true }
          : msg,
      ),
    );
  };

  const handleRedoMessage = (messageId) => {
    const message = chatHistory.find((m) => m.id == messageId);
    if (!message) return;

    if (message.action_type === "CALENDAR") {
      message.actions.forEach((action) => dispatch(action));
    } else if (message.action_type === "JOB") {
      const category = Object.keys(
        message.prev_job.category || message.curr_job.category,
      )[0];
      dispatch({
        type: "UPDATE_FIELDS",
        updates: message.actions,
        category,
        required_match_score:
          message.prev_job.required_match_score ||
          message.curr_job.required_match_score,
      });
    }

    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.type === "ai"
          ? { ...msg, canUndo: true, canRedo: false }
          : msg,
      ),
    );
  };

  return (
    <AIChatComponent
      isExpanded={chatExpanded}
      onToggle={() => setChatExpanded(!chatExpanded)}
      chatHistory={chatHistory}
      onSendMessage={handleChatSend}
      isLoading={isLoading}
      onUndoMessage={handleUndoMessage}
      onRedoMessage={handleRedoMessage}
    />
  );
};

export default ChatContainer;
