// ChatBot module exports
export { default as ChatContainer } from "./ChatContainer";
export { TimeFormatter, CalendarFormatter, ActionProcessor } from "./utils";
// export { default as MarkdownMessageRenderer } from "./markdownRenderer";
// useChatHandler has been removed - use individual hooks with dependency injection
// Example: useAIService(), useMessageRules(), useMessageProcessor(), useChatActions(config) // DEPRECATED - see CONTAINER_EXAMPLE.md

// Components
export { MessageBubble } from "./components/MessageBubble";
export { MessageActions } from "./components/MessageActions";
export { ChatHistory } from "./components/ChatHistory";
export { AIInput } from "./components/AIInput";
export { ChatHeader } from "./components/ChatHeader";
export { ChatWindow } from "./components/ChatWindow";
export { TypingMarkdownMessage } from "./components/TypingMarkdownMessage";

// Hooks
export { useThemeStyles } from "./hooks/useThemeStyles";
export { useTypingEffect } from "./hooks/useTypingEffect";
export { useChatState } from "./hooks/useChatState";
export { useChatActions } from "./hooks/useChatActions";
export { useTriggeredMessages } from "./hooks/useTriggeredMessages";
export { useAIService } from "./hooks/useAIService";
export { useMessageRules } from "./hooks/useMessageRules";
export { useMessageProcessor } from "./hooks/useMessageProcessor";
export { useAICases } from "./hooks/useAICases";

// Types
export * from "./types";
export type { UseChatActionsConfig } from "./hooks/useChatActions";
export type { UseTriggeredMessagesConfig } from "./hooks/useTriggeredMessages";
export type { ProcessedMessage } from "./core/MessageProcessor";
