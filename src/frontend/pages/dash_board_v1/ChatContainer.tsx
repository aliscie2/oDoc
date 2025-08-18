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
  Theme,
} from "@mui/material";
import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import RunawayJellyfish from "@/components/creature/runAeayJellyFish";
import AICreditsComponent from "./AICreditsCompnent";
import MarkdownMessage from "./markDownMessageRdnder";
import { undoCalendarAction, undoJobAction } from "./reverseAction";
import { useChatHandler } from "./useChatHandler";

// ===== TYPE DEFINITIONS =====
interface ChatMessage {
  type: "user" | "ai";
  message: string;
  id: string | number;
  canUndo?: boolean;
  canRedo?: boolean;
  canRetry?: boolean;
  action_type?: string;
  actions?: unknown[];
  isTyping?: boolean;
}

interface ReduxState {
  AIState: {
    aiAgent: {
      remainingCredits: () => number;
    };
  };
  jobState: {
    jobs: unknown[];
    currentJobId: string | null;
    jobSearchStage: number;
  };
  calendarState: {
    calendar: {
      availabilities?: unknown[];
    };
  };
}

interface ThemeStyles {
  theme: Theme;
  isDark: boolean;
  chatBg: string;
  borderColor: string;
  shadowColor: string;
}

// ===== CUSTOM HOOKS =====
const useThemeStyles = (): ThemeStyles => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return {
    theme,
    isDark,
    chatBg: theme.palette.background.paper,
    borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
    shadowColor: isDark
      ? "0 8px 32px rgba(0,0,0,0.4)"
      : "0 8px 32px rgba(0,0,0,0.12)",
  };
};

const useTypingEffect = (text: string, onComplete?: () => void): string => {
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

  return displayText.length < text.length
    ? `${displayText}<span style="color: ${theme.palette.primary.main}; animation: blink 1s infinite;">|</span><style>@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0; } }</style>`
    : displayText;
};

// ===== COMPONENTS =====
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
      ? `${theme.palette.primary.main}${isDark ? "40" : "20"}`
      : isDark
        ? "rgba(255,255,255,0.08)"
        : "rgba(0,0,0,0.04)",
    p: 1,
    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    border: isUser
      ? `1px solid ${theme.palette.primary.main}60`
      : `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
    backdropFilter: !isUser ? "blur(10px)" : undefined,
    WebkitBackdropFilter: !isUser ? "blur(10px)" : undefined,
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

  if (msg.type !== "ai" || !(msg.canUndo || msg.canRedo || msg.canRetry))
    return null;

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
            "&:hover": { bgcolor: `${color}15` },
          }}
        >
          {label}
        </Button>
      ))}
    </Box>
  );
};

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
          bgcolor: theme.palette.text.disabled,
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

const AIInput = ({
  onSendMessage,
  isLoading,
  chatHistory,
  setIsMinimized,
}: {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  chatHistory: ChatMessage[];
  setIsMinimized: (minimized: boolean) => void;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [message, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setIsExpanded(true);
    if (chatHistory.length > 0) setIsMinimized(false);
  }, [chatHistory.length, setIsMinimized]);

  const { chatBg, borderColor, shadowColor } = useThemeStyles();
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
      onMouseEnter={() => !isFocused && setIsExpanded(true)}
      onMouseLeave={() => !isFocused && setIsExpanded(false)}
    >
      <Box
        sx={{
          bgcolor: chatBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: isMobile ? "none" : `1px solid ${borderColor}`,
          borderTop: isMobile ? `1px solid ${borderColor}` : undefined,
          borderRadius: 1,
          p: shouldBeExpanded ? 1 : 0.5,
          boxShadow: isMobile
            ? `0 -4px 16px ${theme.palette.action.hover}`
            : shadowColor,
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
            onBlur={() => {
              setIsFocused(false);
              setIsExpanded(false);
            }}
            placeholder="Ask AI anything..."
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "transparent",
                fontSize: shouldBeExpanded ? "0.9rem" : "0.8rem",
                color: theme.palette.text.primary,
                "& fieldset": { border: "none" },
                "& input, & textarea": {
                  py: shouldBeExpanded ? 0.75 : 0.4,
                  transition: "all 0.3s ease-in-out",
                  color: "inherit",
                },
                "& input::placeholder, & textarea::placeholder": {
                  color: theme.palette.text.secondary,
                  opacity: 1,
                },
              },
            }}
          />
          <IconButton
            disabled={isLoading || !message.trim()}
            onClick={handleSend}
            size={shouldBeExpanded ? "medium" : "small"}
            sx={{
              color: theme.palette.primary.main,
              bgcolor: message.trim()
                ? `${theme.palette.primary.main}15`
                : "transparent",
              "&:hover": { bgcolor: `${theme.palette.primary.main}25` },
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

// ===== MAIN COMPONENT =====
const ChatContainer = () => {
  const dispatch = useDispatch();
  const { aiAgent } = useSelector((state: ReduxState) => state.AIState);
  const { processMessage, getTriggeredMessages, getMessage } = useChatHandler();

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [shownMessageIds, setShownMessageIds] = useState<Set<string>>(
    new Set(),
  );

  // Store latest function references to avoid dependency issues
  const functionsRef = useRef({ getTriggeredMessages, getMessage });
  functionsRef.current = { getTriggeredMessages, getMessage };

  const { jobs, calendar, jobSearchStage, currentJobId } = useSelector(
    (state: ReduxState) => ({
      jobs: state.jobState?.jobs || [],
      calendar: state.calendarState?.calendar || {},
      jobSearchStage: state.jobState?.jobSearchStage || 0,
      currentJobId: state.jobState?.currentJobId || null,
    }),
  );

  const isExpanded = chatHistory.length > 0 && !isMinimized;

  // Initialize and handle all triggered messages with proper deduplication
  useEffect(() => {
    const { getTriggeredMessages, getMessage } = functionsRef.current;

    const allTriggeredMessages = [
      ...getTriggeredMessages("immediate"),
      ...getTriggeredMessages("automatic"),
      ...getTriggeredMessages("contextual"),
    ];

    // Use functional update to ensure we have the latest shownMessageIds
    setShownMessageIds((currentShownIds) => {
      const newMessages = allTriggeredMessages.filter(
        (msg) => !currentShownIds.has(msg.id),
      );

      if (newMessages.length > 0) {
        const newChatMessages = newMessages.map((messageRule, index) => ({
          type: "ai" as const,
          message: getMessage(messageRule.message),
          id: `${messageRule.id}-${Date.now()}-${index}`, // Unique timestamp-based ID
          canUndo: messageRule.canUndo,
          canRedo: false,
          canRetry: messageRule.canRetry,
          action_type: messageRule.actionType,
          actions: [],
          isTyping: true,
        }));

        setChatHistory((prev) => [...prev, ...newChatMessages]);
        setIsMinimized(false);

        // Return updated shownMessageIds
        const newSet = new Set(currentShownIds);
        newMessages.forEach((msg) => newSet.add(msg.id));
        return newSet;
      }

      // No new messages, return current set unchanged
      return currentShownIds;
    });
  }, [
    jobs.length,
    jobSearchStage,
    currentJobId,
    calendar.availabilities?.length,
    // Functions are accessed via ref, no dependency needed
  ]);

  // Cleanup shown messages
  useEffect(() => {
    const allCurrentMessages = [
      ...getTriggeredMessages("immediate"),
      ...getTriggeredMessages("automatic"),
      ...getTriggeredMessages("contextual"),
    ];
    const currentMessageIds = new Set(allCurrentMessages.map((m) => m.id));

    setShownMessageIds((prev) => {
      const filtered = new Set(
        [...prev].filter((id) => currentMessageIds.has(id)),
      );
      return filtered.size !== prev.size ? filtered : prev;
    });
  }, [
    jobs.length,
    calendar.availabilities?.length,
    jobSearchStage,
    currentJobId,
    getTriggeredMessages,
  ]);

  const handleTypingComplete = useCallback((messageId: string | number) => {
    setChatHistory((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isTyping: false } : msg,
      ),
    );
  }, []);

  const handleChatSend = useCallback(
    async (message: string) => {
      const messageId = Date.now(); // Use timestamp instead
      setIsMinimized(false);

      setChatHistory((prev) => [
        ...prev,
        { type: "user", message, id: `${messageId}-user` },
      ]);
      setIsLoading(true);

      try {
        const result = await processMessage(message, messageId);
        setChatHistory((prev) => [
          ...prev,
          {
            type: "ai",
            message: result.feedback,
            id: `${messageId}-ai`,
            canUndo: (result.actions?.length || 0) > 0,
            canRedo: false,
            canRetry: (result.actions?.length || 0) > 0,
            action_type: result.action_type,
            actions: result.actions,
            isTyping: true,
          },
        ]);
      } catch (error: any) {
        setChatHistory((prev) => [
          ...prev,
          {
            type: "ai",
            message: error.message || "An error occurred",
            id: `${messageId}-error`,
            canUndo: false,
            canRedo: false,
            canRetry: true,
            isTyping: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [processMessage], // Remove messageCounter dependency
  );

  const handleUndoMessage = useCallback(
    (messageId: string | number) => {
      const message = chatHistory.find((m) => m.id === messageId) as any;
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
    },
    [chatHistory, dispatch],
  );

  const handleRedoMessage = useCallback(
    (messageId: string | number) => {
      const message = chatHistory.find((m) => m.id === messageId) as any;
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
    },
    [chatHistory, dispatch],
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

  const { theme, isDark } = useThemeStyles();

  return (
    <>
      {isExpanded && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 130, sm: 110 },
            left: { xs: 0, sm: "50%" },
            transform: { xs: "none", sm: "translateX(-50%)" },
            zIndex: 999,
            width: { xs: "100vw", sm: 500 },
            bgcolor: theme.palette.background.paper,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: {
              xs: "none",
              sm: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`,
            },
            borderTop: {
              xs: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`,
              sm: undefined,
            },
            borderRadius: { xs: 0, sm: 0.5 },
            boxShadow: {
              xs: `0 -4px 16px ${theme.palette.action.hover}`,
              sm: isDark
                ? "0 8px 32px rgba(0,0,0,0.4)"
                : "0 8px 32px rgba(0,0,0,0.12)",
            },
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={1.5}
            py={1}
            borderBottom={`1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <AICreditsComponent />
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                AI Assistant ({chatHistory.length})
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box sx={{ height: 24, overflow: "hidden" }}>
                {aiAgent && (
                  <RunawayJellyfish
                    die={aiAgent.remainingCredits() === 0}
                    thinking={isLoading}
                    runaway={true}
                  />
                )}
              </Box>
              <IconButton
                size="small"
                onClick={() => setIsMinimized(true)}
                sx={{
                  color: theme.palette.text.secondary,
                  p: 0.5,
                  "&:hover": { bgcolor: theme.palette.action.hover },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <ChatHistory
            chatHistory={chatHistory}
            onUndoMessage={handleUndoMessage}
            onRedoMessage={handleRedoMessage}
            onRetry={handleRetry}
            onTypingComplete={handleTypingComplete}
          />
        </Box>
      )}
      <AIInput
        onSendMessage={handleChatSend}
        isLoading={isLoading}
        chatHistory={chatHistory}
        setIsMinimized={setIsMinimized}
      />
    </>
  );
};

export default ChatContainer;
