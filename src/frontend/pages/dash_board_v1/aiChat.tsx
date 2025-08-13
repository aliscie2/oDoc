import { Close, Redo, Refresh, Send, Undo } from "@mui/icons-material";
import {
  Box,
  Button,
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
import MarkdownMessage from "./markDownMessageRdnder";

// Onboarding Data
const getOnboardingData = (navigate: any, isPageReloaded: boolean) => [
  {
    id: "job-search",
    text: "👋 Welcome! I'm here to help you find the perfect opportunities or connect you with top talent. \n\n**Let's get started:**\n- Are you looking for your next career move? \n- Or are you hiring and need to find the right candidates?\n\nTell me about your goals, preferred roles, skills, or what kind of talent you're seeking. The more details you share, the better I can assist you!",
    condition: (jobs: any[], calendar: any) => jobs.length === 0,
    key: "jobOnboardingShown",
  },
  {
    id: "calendar-setup",
    text: "🗓️ Perfect! Now let's set up your availability so potential matches can book interviews with you.\n\n**Share your interview schedule:**\n- What days work best for interviews?\n- What are your preferred hours? (e.g., \"I'm available for interviews Monday-Friday, 9 AM to 6 PM\")\n- Any specific time zones or scheduling preferences?\n\nThis allows employers or candidates to easily book interview slots that work for both of you!",
    condition: (jobs: any[], calendar: any) =>
      jobs.length > 0 &&
      (calendar.availabilities?.length || 0) === 0 &&
      isPageReloaded,
    key: "calendarOnboardingShown",
    onCondition: () => navigate("/calendar"),
  },
];

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
  isTyping?: boolean;
}

// Typing Markdown Message Component
const TypingMarkdownMessage = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) => {
  const [displayText, setDisplayText] = useState("");
  const theme = useTheme();

  useEffect(() => {
    if (!text) return;

    // Calculate typing speed based on text length
    const baseSpeed = 30; // Base speed in ms
    const maxSpeed = 10; // Fastest speed for long text
    const speedThreshold = 200; // Characters threshold for speed adjustment

    const typingSpeed =
      text.length > speedThreshold
        ? Math.max(maxSpeed, baseSpeed - (text.length - speedThreshold) / 20)
        : baseSpeed;

    let currentIndex = 0;
    setDisplayText("");

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [text, onComplete]);

  // Add cursor to the display text when still typing
  const textWithCursor =
    displayText.length < text.length
      ? displayText +
        `<span style="color: ${theme.palette.primary.main}; animation: blink 1s infinite;">|</span><style>@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }</style>`
      : displayText;

  return <MarkdownMessage message={textWithCursor} isUser={false} />;
};

// Chat History Component
const ChatHistory = ({
  chatHistory,
  onUndoMessage,
  onRedoMessage,
  onRetry,
  onTypingComplete,
}: {
  chatHistory: ChatMessage[];
  onUndoMessage: (id: string | number) => void;
  onRedoMessage: (id: string | number) => void;
  onRetry: (id: string | number) => void;
  onTypingComplete: (id: string | number) => void;
}) => {
  const theme = useTheme();
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const isDark = theme.palette.mode === "dark";
  const accent = theme.palette.primary.main;

  return (
    <Box
      ref={chatRef}
      sx={{
        maxHeight: { xs: 250, sm: 300 },
        overflowY: "auto",
        
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          bgcolor: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          bgcolor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
          borderRadius: "3px",
        },
      }}
    >
      {chatHistory.map((msg, idx) => (
        <Box key={`${msg.id}-${idx}`} mb={1}>
          <Box
            sx={{
              display: "flex",
              justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
              mb: 0.5,
            }}
          >
            <Box
              sx={{
                maxWidth: { xs: "95%", sm: "80%" }, // Wider messages on mobile
                bgcolor:
                  msg.type === "user"
                    ? isDark
                      ? "rgba(33, 150, 243, 0.3)"
                      : "rgba(33, 150, 243, 0.2)"
                    : isDark
                      ? "rgba(158, 158, 158, 0.3)"
                      : "rgba(158, 158, 158, 0.2)",
                p: { xs: 1, sm: 1.5 }, // Reduced padding on mobile
                borderRadius: 1,
                border: `1px solid ${msg.type === "user" ? accent : "rgba(158, 158, 158, 0.3)"}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color:
                    msg.type === "user" ? accent : theme.palette.text.secondary,
                  fontSize: "0.7rem",
                  mb: 0.5,
                  display: "block",
                  fontWeight: 600,
                }}
              >
                {msg.type === "user" ? "You" : "AI Assistant"}
              </Typography>
              {msg.type === "ai" && msg.isTyping ? (
                <TypingMarkdownMessage
                  text={msg.message}
                  onComplete={() => onTypingComplete(msg.id)}
                />
              ) : (
                <MarkdownMessage
                  message={msg.message}
                  isUser={msg.type === "user"}
                />
              )}
            </Box>
          </Box>

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
                    onClick={() => onRetry(msg.id)}
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
  );
};

// AI Input Component
const AIInput = ({
  onSendMessage,
  isLoading,
}: {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
    setTimeout(() => inputRef.current?.focus(), 100);
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
        bottom: isMobile ? 80 : 30, // Moved up to account for bottom nav bar on mobile
        left: isMobile ? 0 : "50%",
        transform: isMobile ? "none" : "translateX(-50%)",
        zIndex: 1000,
        width: isMobile ? "100vw" : isExpanded ? 600 : 400, // Full width on mobile
        px: isMobile ? 0 : 0, // Remove horizontal padding on mobile
        transition: "all 0.3s ease",
      }}
    >
      <Box
        sx={{
          bgcolor: isDark ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          border: isMobile
            ? "none"
            : `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`,
          borderTop: isMobile
            ? `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`
            : undefined,
          borderRadius: isMobile ? 0 : isExpanded ? 3 : 25, // No border radius on mobile for full width
          p: isMobile ? 1 : isExpanded ? 2 : 1,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          height: isExpanded ? "auto" : 50,
          overflow: "hidden",
          boxShadow: isMobile
            ? "0 -4px 16px rgba(0,0,0,0.1)" // Top shadow for mobile
            : isDark
              ? "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)"
              : "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() =>
          !isMobile &&
          !inputRef.current?.matches(":focus") &&
          setIsExpanded(false)
        }
      >
        <Box display="flex" gap={1} alignItems="flex-end">
          <TextField
            ref={inputRef}
            disabled={isLoading}
            size="small"
            fullWidth
            multiline={isExpanded}
            maxRows={isExpanded ? 4 : 1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => !isMobile && setIsExpanded(false)}
            placeholder="Ask AI anything..."
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "transparent",
                fontSize: "0.95rem",
                "& fieldset": { border: "none" },
                "& input": {
                  py: isExpanded ? 1 : 0.75,
                },
              },
            }}
          />
          <IconButton
            disabled={isLoading}
            onClick={handleSend}
            sx={{
              color: accent,
              bgcolor: isExpanded ? accent + "10" : "transparent",
              "&:hover": { bgcolor: accent + "20" },
              transition: "all 0.2s ease",
            }}
          >
            {isLoading ? <CircularProgress size={20} /> : <Send />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

const ChatContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs } = useSelector((state: any) => state.jobState);
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { aiAgent } = useSelector((state: any) => state.AIState);
  const { processMessage } = useChatHandler();

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageCounter, setMessageCounter] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPageReloaded, setIsPageReloaded] = useState(false);
  const addedOnboardingRef = useRef<Set<string>>(new Set());

  // Detect page reload on component mount
  useEffect(() => {
    const navigationEntries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      const navigationType = navigationEntries[0].type;
      setIsPageReloaded(navigationType === "reload");
    }
  }, []);

  // Get onboarding data with navigation and reload status
  const onboardingData = getOnboardingData(navigate, isPageReloaded);

  // Get active onboarding message
  const activeOnboarding = onboardingData.find((item) => {
    const isCompleted = localStorage.getItem(item.key) === "completed";
    return !isCompleted && item.condition(jobs, calendar);
  });

  // Add onboarding message to chat history if needed
  useEffect(() => {
    if (
      activeOnboarding &&
      !isMinimized &&
      !addedOnboardingRef.current.has(activeOnboarding.id)
    ) {
      addedOnboardingRef.current.add(activeOnboarding.id);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: activeOnboarding.text,
          id: activeOnboarding.id,
          canUndo: false,
          canRedo: false,
          canRetry: false,
          isTyping: true,
        },
      ]);

      // Execute onCondition callback if it exists
      if (activeOnboarding.onCondition) {
        activeOnboarding.onCondition();
      }
    }
  }, [activeOnboarding, isMinimized]);

  const isExpanded = chatHistory.length > 0 && !isMinimized;

  const handleClose = () => {
    setIsMinimized(true);
  };

  const handleTypingComplete = (messageId: string | number) => {
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg,
      ),
    );
  };

  const handleChatSend = async (message: string) => {
    const messageId = messageCounter + 1;
    setMessageCounter(messageId);

    // Complete onboarding when user sends first message
    if (activeOnboarding) {
      localStorage.setItem(activeOnboarding.key, "completed");
    }

    setIsMinimized(false);

    // Add user message (no typing effect)
    setChatHistory((prev) => [
      ...prev,
      { type: "user", message, id: messageId + "user" },
    ]);
    setIsLoading(true);

    try {
      const result = await processMessage(message, messageId, true);
      // Add AI message with typing effect
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
          isTyping: true,
        },
      ]);
    } catch (error: any) {
      // Add error message with typing effect
      setChatHistory((prev) => [
        ...prev,
        {
          type: "ai",
          message: error.message || "An error occurred",
          id: messageId,
          canUndo: false,
          canRedo: false,
          canRetry: true,
          isTyping: true,
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

  const handleRetry = (msgId: string | number) => {
    const msg = chatHistory.find((m) => m.id === msgId);
    const userMsg =
      chatHistory[chatHistory.findIndex((m) => m.id === msgId) - 1];
    if (msg?.canUndo) handleUndoMessage(msgId);
    if (userMsg?.message) handleChatSend(userMsg.message);
  };

  return (
    <>
      {/* Chat History - only show when expanded */}
      {isExpanded && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 130, sm: 110 }, // Moved up more on mobile for bottom nav
            left: { xs: 0, sm: "50%" },
            transform: { xs: "none", sm: "translateX(-50%)" },
            zIndex: 999,
            width: { xs: "100vw", sm: 600 }, // Full width on mobile
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(0,0,0,0.95)"
                : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: (theme) => ({
              xs: "none",
              sm: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`,
            }),
            borderTop: (theme) => ({
              xs: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`,
              sm: undefined,
            }),
            borderRadius: { xs: 0, sm: 2 }, // No border radius on mobile
            boxShadow: (theme) => ({
              xs: "0 -4px 16px rgba(0,0,0,0.1)", // Top shadow for mobile
              sm:
                theme.palette.mode === "dark"
                  ? "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)"
                  : "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
            }),
          }}
        >
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={{ xs: 1, sm: 2 }} // Reduced padding on mobile
            pb={1}
            borderBottom={(theme) =>
              `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`
            }
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AICreditsComponent />
              <Typography
                variant="body2"
                sx={{
                  color: (theme) => theme.palette.primary.main,
                  fontWeight: 600,
                }}
              >
                AI Assistant ({chatHistory.length})
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ height: 30, overflow: "hidden" }}>
                <RunawayJellyfish
                  die={aiAgent.remainingCredits() == 0}
                  thinking={isLoading}
                  runaway={true}
                />
              </Box>
              <IconButton
                size="small"
                onClick={handleClose}
                sx={{
                  color: (theme) => theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.05)",
                  },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Chat History */}
          <ChatHistory
            chatHistory={chatHistory}
            onUndoMessage={handleUndoMessage}
            onRedoMessage={handleRedoMessage}
            onRetry={handleRetry}
            onTypingComplete={handleTypingComplete}
          />
        </Box>
      )}

      {/* AI Input */}
      <AIInput onSendMessage={handleChatSend} isLoading={isLoading} />
    </>
  );
};

export default ChatContainer;
