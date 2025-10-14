// ===== CHAT BOT TYPE DEFINITIONS =====

export interface ChatMessage {
  type: "user" | "ai";
  message: string;
  id: string | number;
  canUndo?: boolean;
  canRedo?: boolean;
  canRetry?: boolean;
  action_type?: string;
  actions?: unknown[];
  isTyping?: boolean;
  snapshotId?: string;
  shareLink?: string;
  jobId?: string;
  thumbnailUrl?: string;
  replaceGroup?: string;
}

export interface ReduxState {
  AIState: {
    credits: number;
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

export interface ThemeStyles {
  theme: unknown;
  isDark: boolean;
  chatBg: string;
  borderColor: string;
  shadowColor: string;
}

export interface MessageBubbleProps {
  msg: ChatMessage;
  isLatestMessage?: boolean;
  onTypingComplete: (id: string | number) => void;
  onTypingProgress?: () => void;
}

export interface MessageActionsProps {
  msg: ChatMessage;
  onUndo: (id: string | number) => void;
  onRedo: (id: string | number) => void;
  onRetry: (id: string | number) => void;
}

export interface ChatHistoryProps {
  chatHistory: ChatMessage[];
  onUndoMessage: (id: string | number) => void;
  onRedoMessage: (id: string | number) => void;
  onRetry: (id: string | number) => void;
  onTypingComplete: (id: string | number) => void;
}

export interface AIInputProps {
  onSendMessage: (message: string) => void;
  onCancelRequest: () => void;
  isLoading: boolean;
  chatHistory: ChatMessage[];
  setIsMinimized: (minimized: boolean) => void;
}

export interface TypingMarkdownMessageProps {
  text: string;
  onComplete?: () => void;
  onProgress?: () => void;
  isStreaming?: boolean;
}
