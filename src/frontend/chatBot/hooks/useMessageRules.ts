import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/reducers";
import { MessageRulesService } from "../services/MessageRulesService";

// Re-export types
export type {
  MessageContent,
  MessageRule,
} from "../services/MessageRulesService";

export const useMessageRules = () => {
  // Combine selectors to reduce re-renders
  const { calendar, currentJobId, jobs, jobSearchStage } = useSelector(
    (state: RootState) => ({
      calendar: state.calendarState.calendar,
      currentJobId: state.jobState.currentJobId,
      jobs: state.jobState.jobs,
      jobSearchStage: state.jobState.jobSearchStage,
    }),
  );
  // Memoize both the service and its methods to prevent re-renders
  const messageRulesService = useMemo(
    () =>
      new MessageRulesService(
        jobs ? jobs : [],
        calendar,
        jobSearchStage,
        currentJobId,
      ),
    [jobs, calendar, jobSearchStage, currentJobId],
  );

  // Memoize the return object to prevent creating new references
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
