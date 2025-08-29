import React from "react";
import { useChatState } from "./hooks/useChatState";
import { useChatActions, UseChatActionsConfig } from "./hooks/useChatActions";
import {
  useTriggeredMessages,
  UseTriggeredMessagesConfig,
} from "./hooks/useTriggeredMessages";
import { useMessageProcessor } from "./hooks/useMessageProcessor";
import { ChatWindow } from "./components/ChatWindow";
import { AIInput } from "./components/AIInput";

// ===== MAIN COMPONENT =====
const ChatContainer = () => {
  console.log(".......tst");
  const {
    assistantName,
    chatHistory,
    setChatHistory,
    isLoading,
    setIsLoading,
    isMinimized,
    setIsMinimized,
    shownMessageIds,
    setShownMessageIds,
    abortController,
    setAbortController,
    isExpanded,
    credits,
    handleTypingComplete,
  } = useChatState();

  // Individual service hooks (no hooks inside hooks!)
  const messageProcessor = useMessageProcessor();

  // Configure chat actions with dependency injection
  const chatActionsConfig: UseChatActionsConfig = {
    chatHistory,
    setChatHistory,
    setIsLoading,
    setIsMinimized,
    setAbortController,
    processMessage: messageProcessor.processMessage,
  };

  const {
    handleChatSend,
    handleCancelRequest,
    handleUndoMessage,
    handleRedoMessage,
    handleRetry,
  } = useChatActions(chatActionsConfig);

  // Configure triggered messages
  const triggeredMessagesConfig: UseTriggeredMessagesConfig = {
    shownMessageIds,
    setShownMessageIds,
    setChatHistory,
    setIsMinimized,
  };

  useTriggeredMessages(triggeredMessagesConfig);

  return (
    <>
      {isExpanded && (
        <ChatWindow
          assistantName={assistantName}
          credits={credits}
          isLoading={isLoading}
          onMinimize={() => setIsMinimized(true)}
          chatHistory={chatHistory}
          onUndoMessage={handleUndoMessage}
          onRedoMessage={handleRedoMessage}
          onRetry={handleRetry}
          onTypingComplete={handleTypingComplete}
        />
      )}
      <AIInput
        onSendMessage={handleChatSend}
        onCancelRequest={handleCancelRequest}
        isLoading={isLoading}
        chatHistory={chatHistory}
        setIsMinimized={setIsMinimized}
      />
    </>
  );
};

export default ChatContainer;
