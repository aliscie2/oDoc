import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/reducers";
import { MessageRulesService } from "../services/MessageRulesService";
import { useLocation } from "react-router-dom";

// Re-export types
export type {
  MessageContent,
  MessageRule,
} from "../services/MessageRulesService";
export const useMessageRules = () => {
  const location = useLocation();
  const { calendar, currentJobId, jobs, jobSearchStage, chatHistory } =
    useSelector((state: RootState) => ({
      calendar: state.calendarState.calendar,
      currentJobId: state.jobState.currentJobId,
      jobs: state.jobState.jobs,
      jobSearchStage: state.jobState.jobSearchStage,
      chatHistory: state.chatState?.chatHistory,
    }));

  const messageRulesService = useMemo(
    () =>
      new MessageRulesService(
        jobs || [],
        calendar,
        jobSearchStage,
        currentJobId,
        chatHistory,
        location.pathname,
      ),
    [
      jobs,
      calendar,
      jobSearchStage,
      currentJobId,
      chatHistory,
      location.pathname,
    ],
  );

  return useMemo(
    () => ({
      messageRules: messageRulesService.messageRules,
      getMessage: messageRulesService.getMessage.bind(messageRulesService),
      getMessages: messageRulesService.getMessages.bind(messageRulesService),
      getMessagesByType:
        messageRulesService.getMessagesByType.bind(messageRulesService),
      getTriggeredMessages:
        messageRulesService.getTriggeredMessages.bind(messageRulesService),
      getAutomaticMessage:
        messageRulesService.getAutomaticMessage.bind(messageRulesService),
      getOnboardingMessage:
        messageRulesService.getOnboardingMessage.bind(messageRulesService),
      shouldShowWelcomeMessage:
        messageRulesService.shouldShowWelcomeMessage.bind(messageRulesService),
    }),
    [messageRulesService],
  );
};


