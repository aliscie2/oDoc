import { Close, Redo, Refresh, Send, Undo } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import AICreditsComponent from "./AICreditsCompnent";
import MarkdownMessage from "./markDownMessageRdnder";
import { undoCalendarAction, undoJobAction } from "./reverseAction";
import { useChatHandler } from "./useChathandler";

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

interface OnboardingItem {
  id: string;
  text: string;
  condition: (jobs: any[], calendar: any) => boolean;
  key: string;
  onCondition?: () => void;
}

// Constants
const ONBOARDING_DATA: OnboardingItem[] = [
  {
    id: "job-search",
    text: "👋 Welcome! I'm here to help you find the perfect opportunities or connect you with matching jobs or talent. \n\n**Let's get started:**\n- Are you looking for your next career move? \n- Or are you hiring and need to find the right candidates?\n\nTell me about your goals, preferred roles, skills, or what kind of talent you're seeking. The more details you share, the better I can assist you!",
    condition: (jobs: any[]) => jobs.length === 0,
    key: "jobOnboardingShown",
  },
  {
    id: "calendar-setup",
    text: "🗓️ Perfect! Now let's set up your availability so potential matches can book interviews with you.\n\n**Share your interview schedule:**\n- What days work best for interviews?\n- What are your preferred hours? (e.g., \"I'm available for interviews Monday-Friday, 9 AM to 6 PM\")\n- Any specific time zones or scheduling preferences?\n\nThis allows employers or candidates to easily book interview slots that work for both of you!",
    condition: (jobs: any[], calendar: any) =>
      jobs.length > 0 && (calendar.availabilities?.length || 0) === 0,
    key: "calendarOnboardingShown",
  },
];

// Custom hooks
const usePageReload = () => {
  const [isPageReloaded, setIsPageReloaded] = useState(false);

  useEffect(() => {
    const navigationEntries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0) {
      setIsPageReloaded(navigationEntries[0].type === "reload");
    }
  }, []);

  return isPageReloaded;
};

const useOnboarding = (jobs: any[], calendar: any, navigate: any) => {
  const isPageReloaded = usePageReload();

  return ONBOARDING_DATA.find((item) => {
    const isCompleted = localStorage.getItem(item.key) === "completed";
    const shouldShow =
      item.condition(jobs, calendar) &&
      (item.id !== "calendar-setup" || isPageReloaded);
    return !isCompleted && shouldShow;
  });
};

const useThemeStyles = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return {
    theme,
    isDark,
    chatBg: isDark ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.98)",
    borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
    shadowColor: isDark
      ? "0 8px 32px rgba(0,0,0,0.4)"
      : "0 8px 32px rgba(0,0,0,0.12)",
  };
};

// Typing effect hook
const useTypingEffect = (text: string, onComplete?: () => void) => {
  const [displayText, setDisplayText] = useState("");
  const { theme } = useThemeStyles();

  useEffect(() => {
    if (!text) return;

    const typingSpeed =
      text.length > 200 ? Math.max(10, 30 - (text.length - 200) / 20) : 30;

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

  const textWithCursor =
    displayText.length < text.length
      ? displayText +
        `<span style="color: ${theme.palette.primary.main}; animation: blink 1s infinite;">|</span><style>@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }</style>`
      : displayText;

  return textWithCursor;
};

// Typing Markdown Message Component
const TypingMarkdownMessage = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) => {
  const textWithCursor = useTypingEffect(text, onComplete);
  return <MarkdownMessage message={textWithCursor} isUser={false} />;
};

// Message Bubble Component
const MessageBubble = ({
  msg,
  onTypingComplete,
}: {
  msg: ChatMessage;
  onTypingComplete: (id: string | number) => void;
}) => {
  const { theme, isDark } = useThemeStyles();
  const isUser = msg.type === "user";

  const bubbleStyles = {
    maxWidth: "85%",
    bgcolor: isUser
      ? theme.palette.primary.main + (isDark ? "40" : "20")
      : isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.04)",
    p: 1,
    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    border: isUser
      ? `1px solid ${theme.palette.primary.main}60`
      : `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 0.75,
      }}
    >
      <Box sx={bubbleStyles}>
        {msg.type === "ai" && msg.isTyping ? (
          <TypingMarkdownMessage
            text={msg.message}
            onComplete={() => onTypingComplete(msg.id)}
          />
        ) : (
          <MarkdownMessage message={msg.message} isUser={isUser} />
        )}
      </Box>
    </Box>
  );
};

// Action Buttons Component - Reusable
const MessageActions = ({
  msg,
  onUndo,
  onRedo,
  onRetry,
}: {
  msg: ChatMessage;
  onUndo: (id: string | number) => void;
  onRedo: (id: string | number) => void;
  onRetry: (id: string | number) => void;
}) => {
  const theme = useTheme();

  if (msg.type !== "ai" || !(msg.canUndo || msg.canRedo || msg.canRetry)) {
    return null;
  }

  const actions = [
    {
      show: msg.canRetry,
      icon: Refresh,
      label: "Retry",
      color: theme.palette.primary.main,
      onClick: () => onRetry(msg.id),
    },
    {
      show: msg.canUndo,
      icon: Undo,
      label: "Undo",
      color: theme.palette.warning.main,
      onClick: () => onUndo(msg.id),
    },
    {
      show: msg.canRedo,
      icon: Redo,
      label: "Redo",
      color: theme.palette.success.main,
      onClick: () => onRedo(msg.id),
    },
  ].filter((action) => action.show);

  return (
    <Box display="flex" gap={0.5} justifyContent="flex-start" mb={0.5}>
      {actions.map(({ icon: Icon, label, color, onClick }) => (
        <Button
          key={label}
          size="small"
          startIcon={<Icon sx={{ fontSize: "14px !important" }} />}
          onClick={onClick}
          sx={{
            color,
            minWidth: "auto",
            p: "2px 6px",
            fontSize: "0.65rem",
            textTransform: "none",
            "&:hover": { bgcolor: color + "15" },
          }}
        >
          {label}
        </Button>
      ))}
    </Box>
  );
};

// Chat History Component - Simplified
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

  return (
    <Box
      ref={chatRef}
      sx={{
        maxHeight: { xs: 250, sm: 300 },
        overflowY: "auto",
        px: 1,
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.2)"
              : "rgba(0,0,0,0.2)",
          borderRadius: "2px",
        },
      }}
    >
      {chatHistory.map((msg, idx) => (
        <Box key={`${msg.id}-${idx}`}>
          <MessageBubble msg={msg} onTypingComplete={onTypingComplete} />
          <MessageActions
            msg={msg}
            onUndo={onUndoMessage}
            onRedo={onRedoMessage}
            onRetry={onRetry}
          />
        </Box>
      ))}
    </Box>
  );
};

// AI Input Component - Streamlined
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
  const [isFocused, setIsFocused] = useState(false);
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

  const handleFocus = () => {
    setIsFocused(true);
    setIsExpanded(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsExpanded(false);
  };

  const handleMouseEnter = () => {
    if (!isFocused) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    // Only shrink if the input is not focused
    if (!isFocused) {
      setIsExpanded(false);
    }
  };

  const isDark = theme.palette.mode === "dark";

  // Keep expanded if focused, otherwise use hover state
  const shouldBeExpanded = isFocused || isExpanded;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: isMobile ? 80 : 30,
        left: isMobile ? 0 : "50%",
        transform: isMobile ? "none" : "translateX(-50%)",
        zIndex: 1000,
        width: isMobile ? "100vw" : shouldBeExpanded ? 500 : 300,
        transition: "width 0.3s ease-in-out",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          borderRadius: 1,
          p: shouldBeExpanded ? 1 : 0.5,
          boxShadow: isMobile
            ? "0 -4px 16px rgba(0,0,0,0.1)"
            : isDark
              ? "0 8px 32px rgba(0,0,0,0.4)"
              : "0 8px 32px rgba(0,0,0,0.12)",
          transition: "all 0.3s ease-in-out",
          opacity: shouldBeExpanded ? 1 : 0.8,
        }}
      >
        <Box
          display="flex"
          gap={shouldBeExpanded ? 1 : 0.5}
          alignItems="center"
        >
          <TextField
            ref={inputRef}
            disabled={isLoading}
            size="small"
            fullWidth
            multiline
            maxRows={shouldBeExpanded ? 3 : 1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Ask AI anything..."
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "transparent",
                fontSize: shouldBeExpanded ? "0.9rem" : "0.8rem",
                "& fieldset": { border: "none" },
                "& input, & textarea": {
                  py: shouldBeExpanded ? 0.75 : 0.4,
                  transition: "all 0.3s ease-in-out",
                },
              },
            }}
          />
          <IconButton
            id='submitAIMessage'
            disabled={isLoading || !message.trim()}
            onClick={handleSend}
            size={shouldBeExpanded ? "medium" : "small"}
            sx={{
              color: theme.palette.primary.main,
              bgcolor: message.trim()
                ? theme.palette.primary.main + "15"
                : "transparent",
              "&:hover": { bgcolor: theme.palette.primary.main + "25" },
              "&:disabled": { color: theme.palette.text.disabled },
              transition: "all 0.3s ease-in-out",
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
  const addedOnboardingRef = useRef<Set<string>>(new Set());

  // Get active onboarding message using the custom hook
  const activeOnboarding = useOnboarding(jobs, calendar, navigate);

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
            bottom: { xs: 130, sm: 110 },
            left: { xs: 0, sm: "50%" },
            transform: { xs: "none", sm: "translateX(-50%)" },
            zIndex: 999,
            width: { xs: "100vw", sm: 500 },
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
            borderRadius: { xs: 0, sm: 0.5 },
            boxShadow: (theme) => ({
              xs: "0 -4px 16px rgba(0,0,0,0.1)",
              sm:
                theme.palette.mode === "dark"
                  ? "0 8px 32px rgba(0,0,0,0.4)"
                  : "0 8px 32px rgba(0,0,0,0.12)",
            }),
          }}
        >
          {/* Header - Compact */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={1.5}
            py={1}
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
                  fontSize: "0.8rem",
                }}
              >
                AI Assistant ({chatHistory.length})
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ height: 24, overflow: "hidden" }}>
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
                  p: 0.5,
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
