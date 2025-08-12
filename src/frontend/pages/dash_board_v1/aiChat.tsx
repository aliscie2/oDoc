import { Chat, Close, Redo, Refresh, Send, Undo } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import AICreditsComponent from "./AICreditsCompnent";
import { undoCalendarAction, undoJobAction } from "./reverseAction";
import { useChatHandler } from "./useChathandler";

// Onboarding System
class OnboardingManager {
  private static configs = {
    JOB: {
      message: "Are you looking for a job or talent? Tell me in details please",
      key: "jobOnboardingShown",
    },
    CALENDAR: {
      message:
        "Please tell me for example I am available every day from 9 to 6 pm",
      key: "calendarOnboardingShown",
    },
  };

  static getState(jobsLength: number, calendarLength: number) {
    const jobDone = localStorage.getItem(this.configs.JOB.key) === "completed";
    const calDone =
      localStorage.getItem(this.configs.CALENDAR.key) === "completed";

    if (jobsLength === 0 && !jobDone)
      return { step: "JOB", message: this.configs.JOB.message, active: true };
    if (jobsLength > 0 && calendarLength === 0 && !calDone)
      return {
        step: "CALENDAR",
        message: this.configs.CALENDAR.message,
        active: true,
      };
    return { step: "NONE", message: "", active: false };
  }

  static complete(step: string) {
    const config = this.configs[step as keyof typeof this.configs];
    if (config) localStorage.setItem(config.key, "completed");
  }
}

// Typing Animation Component
const TypingMessage = ({
  message,
  onComplete,
}: {
  message: string;
  onComplete: () => void;
}) => {
  const [text, setText] = useState("");
  const theme = useTheme();

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < message.length) {
        setText(message.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setTimeout(onComplete, 1000);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [message, onComplete]);

  return (
    <Box
      sx={{
        bgcolor: theme.palette.primary.main + "20",
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: "12px",
        p: 1.5,
        mb: 1,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.primary.main,
          fontSize: "0.7rem",
          mb: 0.5,
          display: "block",
          fontWeight: 600,
        }}
      >
        AI Assistant
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.primary, fontFamily: "monospace" }}
      >
        {text}
        <span style={{ color: theme.palette.primary.main }}>|</span>
      </Typography>
    </Box>
  );
};

// Types
interface ChatMessage {
  type: "user" | "ai";
  message: string;
  id: string | number;
  canUndo?: boolean;
  canRedo?: boolean;
  canRetry?: boolean;
  action_type?: string;
  actions?: any[];
}

interface AIChatProps {
  isExpanded: boolean;
  onToggle: () => void;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onUndoMessage: (id: string | number) => void;
  onRedoMessage: (id: string | number) => void;
  onboardingMessage?: string;
  showTyping?: boolean;
}

const AIChatComponent = ({
  isExpanded,
  onToggle,
  chatHistory,
  onSendMessage,
  isLoading,
  onUndoMessage,
  onRedoMessage,
  onboardingMessage,
  showTyping = false,
}: AIChatProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { aiAgent } = useSelector((state: any) => state.AIState);

  const [message, setMessage] = useState("");
  const [showWelcomeTyping, setShowWelcomeTyping] = useState(false);
  const [typingDone, setTypingDone] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-focus and scroll effects
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
      if (
        chatHistory.length === 0 &&
        !showWelcomeTyping &&
        !typingDone &&
        showTyping
      ) {
        setTimeout(() => setShowWelcomeTyping(true), 500);
      }
    }
  }, [
    isExpanded,
    chatHistory.length,
    showWelcomeTyping,
    typingDone,
    showTyping,
  ]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory, showWelcomeTyping]);

  const handleSend = () => {
    if (!message.trim()) return;
    setShowWelcomeTyping(false);
    if (!isExpanded) onToggle();
    onSendMessage(message);
    setMessage("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleRetry = (msgId: string | number) => {
    const msg = chatHistory.find((m) => m.id === msgId);
    const userMsg =
      chatHistory[chatHistory.findIndex((m) => m.id === msgId) - 1];
    if (msg?.canUndo) onUndoMessage(msgId);
    if (userMsg?.message) onSendMessage(userMsg.message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: isMobile ? 90 : 30,
        right: isMobile ? 10 : 30,
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      <Card
        sx={{
          width: isExpanded ? (isMobile ? "calc(100vw - 20px)" : 500) : 60,
          height: isExpanded ? (isMobile ? "50vh" : 500) : 60,
          borderRadius: isExpanded ? "16px" : "50%",
          transition: "all 0.3s ease",
          bgcolor: isDark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          overflow: "hidden",
        }}
      >
        {!isExpanded ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <IconButton onClick={onToggle} sx={{ color: accent }}>
              <Chat />
            </IconButton>
          </Box>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              p: 1,
            }}
          >
            {/* Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <AICreditsComponent />
                <Typography variant="body2" sx={{ color: accent }}>
                  AI Assistant ({chatHistory.length})
                </Typography>
              </Box>
              <IconButton size="small" onClick={onToggle}>
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* Jellyfish */}
            <Box sx={{ height: 40, mb: 1, overflow: "hidden" }}>
              <RunawayJellyfish
                die={aiAgent.remainingCredits() == 0}
                thinking={isLoading}
                runaway={true}
              />
            </Box>

            {/* Chat Area */}
            <Box
              ref={chatRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                mb: 1,
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                borderRadius: "10px",
                p: 1,
              }}
            >
              {/* Onboarding Typing */}
              {showTyping && chatHistory.length === 0 && onboardingMessage && (
                <TypingMessage
                  message={onboardingMessage}
                  onComplete={() => setShowTyping(false)}
                />
              )}

              {/* Static Onboarding Message */}
              {!showTyping && chatHistory.length === 0 && onboardingMessage && (
                <Box
                  sx={{
                    bgcolor: accent + "20",
                    border: `1px solid ${accent}`,
                    borderRadius: "12px",
                    p: 1.5,
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: accent,
                      fontSize: "0.7rem",
                      mb: 0.5,
                      display: "block",
                      fontWeight: 600,
                    }}
                  >
                    AI Assistant
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.primary }}
                  >
                    {onboardingMessage}
                  </Typography>
                </Box>
              )}

              {/* Empty State */}
              {chatHistory.length === 0 &&
                !showTyping &&
                !onboardingMessage && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      textAlign: "center",
                      mt: 2,
                      fontStyle: "italic",
                    }}
                  >
                    Start a conversation with AI...
                  </Typography>
                )}

              {/* Messages */}
              {chatHistory.map((msg, idx) => (
                <Box key={`${msg.id}-${idx}`} mb={1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent:
                        msg.type === "user" ? "flex-end" : "flex-start",
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "80%",
                        bgcolor:
                          msg.type === "user"
                            ? isDark
                              ? "rgba(33, 150, 243, 0.3)"
                              : "rgba(33, 150, 243, 0.2)"
                            : isDark
                              ? "rgba(158, 158, 158, 0.3)"
                              : "rgba(158, 158, 158, 0.2)",
                        borderRadius: "12px",
                        p: 1.5,
                        border: `1px solid ${msg.type === "user" ? accent : "rgba(158, 158, 158, 0.3)"}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            msg.type === "user"
                              ? accent
                              : theme.palette.text.secondary,
                          fontSize: "0.7rem",
                          mb: 0.5,
                          display: "block",
                          fontWeight: 600,
                        }}
                      >
                        {msg.type === "user" ? "You" : "AI Assistant"}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.primary }}
                      >
                        {msg.message}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  {msg.type === "ai" &&
                    (msg.canUndo || msg.canRedo || msg.canRetry) && (
                      <Box
                        display="flex"
                        gap={0.5}
                        justifyContent="flex-start"
                        sx={{ ml: 1 }}
                      >
                        {msg.canRetry && (
                          <Button
                            size="small"
                            startIcon={<Refresh fontSize="small" />}
                            onClick={() => handleRetry(msg.id)}
                            sx={{
                              color: accent,
                              minWidth: "auto",
                              p: 0.25,
                              fontSize: "0.7rem",
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
                              color: theme.palette.warning.main,
                              minWidth: "auto",
                              p: 0.25,
                              fontSize: "0.7rem",
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
                              color: theme.palette.success.main,
                              minWidth: "auto",
                              p: 0.25,
                              fontSize: "0.7rem",
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

            {/* Input */}
            <Box display="flex" gap={1} alignItems="flex-end">
              <TextField
                ref={inputRef}
                disabled={isLoading}
                size="small"
                fullWidth
                multiline
                maxRows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "15px",
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                  },
                }}
              />
              <IconButton
                disabled={isLoading}
                onClick={handleSend}
                sx={{ color: accent }}
              >
                {isLoading ? <CircularProgress size={20} /> : <Send />}
              </IconButton>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
};

const ChatContainer = () => {
  const dispatch = useDispatch();
  const { jobs } = useSelector((state: any) => state.jobState);
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { processMessage } = useChatHandler();

  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);
  const [onboardingMessage, setOnboardingMessage] = useState("");
  const [showTyping, setShowTyping] = useState(false);

  // Onboarding logic
  const onboardingState = OnboardingManager.getState(
    jobs.length,
    calendar.availabilities?.length || 0,
  );

  useEffect(() => {
    if (onboardingState.active) {
      setChatExpanded(true);
      setOnboardingMessage(onboardingState.message);
      setShowTyping(true);
    } else {
      setOnboardingMessage("");
      setShowTyping(false);
    }
  }, [onboardingState.active, onboardingState.message]);

  const handleChatSend = async (message: string) => {
    const messageId = messageCounter + 1;
    setMessageCounter(messageId);

    // Complete onboarding when user sends first message
    if (onboardingState.active) {
      OnboardingManager.complete(onboardingState.step);
      setOnboardingMessage("");
      setShowTyping(false);
    }

    if (!chatExpanded) setChatExpanded(true);

    setChatHistory((prev) => [
      ...prev,
      { type: "user", message, id: messageId + "user" },
    ]);
    setIsLoading(true);

    try {
      const result = await processMessage(message, messageId, true);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: result.feedback,
          id: messageId,
          canUndo: result.actions?.length > 0,
          canRedo: false,
          canRetry: result.actions?.length > 0,
          action_type: result.action_type,
          actions: result.actions,
        },
      ]);
    } catch (error: any) {
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

  const handleUndoMessage = (messageId: string | number) => {
    const message = chatHistory.find((m) => m.id == messageId) as any;
    if (!message) return;

    if (message.action_type === "CALENDAR") {
      undoCalendarAction(message).forEach((action: any) => dispatch(action));
    } else if (message.action_type === "JOB") {
      const undoAction = undoJobAction(message);
      if (undoAction) dispatch(undoAction);
    }

    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.type === "ai"
          ? { ...msg, canUndo: false, canRedo: true }
          : msg,
      ),
    );
  };

  const handleRedoMessage = (messageId: string | number) => {
    const message = chatHistory.find((m) => m.id == messageId) as any;
    if (!message) return;

    if (message.action_type === "CALENDAR") {
      message.actions?.forEach((action: any) => dispatch(action));
    } else if (message.action_type === "JOB") {
      dispatch({
        type: "UPDATE_FIELDS",
        updates: message.actions,
        category: Object.keys(
          message.prev_job?.category || message.curr_job?.category || {},
        )[0],
        required_match_score:
          message.prev_job?.required_match_score ||
          message.curr_job?.required_match_score,
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
      onboardingMessage={onboardingMessage}
      showTyping={showTyping}
    />
  );
};

export default ChatContainer;
