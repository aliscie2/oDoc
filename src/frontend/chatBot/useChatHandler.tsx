import { useState, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { textToJson } from "../pages/jobs/utils/processResponseJobs";
import PROMPTS from "../pages/jobs/utils/prompts";
import { ActionProcessor, CalendarFormatter, TimeFormatter } from "./utiles";
import compactMessage from "../pages/jobs/utils/compactMessage";
import { mockJobAIResponse } from "../pages/jobs/utils/mockJobAIRes";
import { mockCalendarAIResponse } from "../pages/jobs/utils/mockCalendarAIRes";

// ===== TYPE DEFINITIONS =====
export type MessageType = "immediate" | "contextual" | "automatic";
export type MessageContent = string | (() => string);

export interface MessageRule {
  id: string;
  type: MessageType;
  priority: number;
  condition: () => boolean;
  message: MessageContent;
  actionType: string;
  canUndo: boolean;
  canRetry: boolean;
  metadata?: {
    showOnce?: boolean;
    cooldownMs?: number;
    dependencies?: string[];
  };
}

export interface ProcessedMessage {
  action_type: string;
  feedback: string;
  actions: unknown[];
  done: boolean;
}

interface ReduxState {
  calendarState: {
    calendar: {
      availabilities?: unknown[];
      googleIds?: string[];
    };
  };
  AIState: {
    aiAgent: {
      sendMessage: (
        prompt: string,
        classify: boolean,
        promptType: string,
      ) => Promise<string>;
      remainingCredits: () => number;
    };
  };
  jobState: {
    currentJobId: string | null;
    jobs: Job[];
    jobSearchStage: number;
  };
}

interface Job {
  id: string;
  category: Record<string, unknown>;
  profile_completion?: number;
  matches?: Array<{ score: number }>;
  emails?: string[];
}

interface MessageFilters {
  type?: MessageType;
  priority?: number;
  showOnce?: boolean;
  excludeIds?: string[];
}

// ===== MAIN HOOK =====
export const useChatHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { calendar } = useSelector((state: ReduxState) => state.calendarState);
  const { aiAgent } = useSelector((state: ReduxState) => state.AIState);
  const { currentJobId, jobs, jobSearchStage } = useSelector(
    (state: ReduxState) => state.jobState,
  );

  const [messageResponses, setMessageResponses] = useState<
    Record<string | number, unknown>
  >({});

  const currentJobRef = useRef<Job | undefined>();
  currentJobRef.current = jobs.find((job) => job.id === currentJobId);

  // ===== CONSTANTS =====
  const JOB_DETAILS = `\n\n**Let's get started:**\n- Are you looking for your next career move? \n- Or are you hiring and need to find the right candidates?\n\nTell me about your goals, preferred roles, skills, or what kind of talent you're seeking. The more details you share, the better I can assist you!`;

  // ===== HELPER FUNCTIONS =====
  const getMessage = useCallback((messageContent: MessageContent): string => {
    return typeof messageContent === "function"
      ? messageContent()
      : messageContent;
  }, []);

  // ===== MESSAGE RULES SYSTEM =====
  const messageRules = useMemo(
    (): MessageRule[] => [
      {
        id: "welcome",
        type: "immediate",
        priority: 1,
        condition: () => jobs.length === 0,
        message: () =>
          `👋 Welcome! I'm here to help you find the perfect opportunities or connect you with matching jobs or talent ${JOB_DETAILS}`,
        actionType: "WELCOME_MESSAGE",
        canUndo: false,
        canRetry: false,
        metadata: { showOnce: true },
      },
      {
        id: "calendar",
        type: "immediate",
        priority: 1,
        condition: () => jobs.length > 0 && !calendar?.availabilities?.length,
        message: () =>
          `📅 For others to book an interview with you, you can say, for example: "I am available every day except Fridays, from 9 AM to 3 PM."`,
        actionType: "WELCOME_MESSAGE",
        canUndo: false,
        canRetry: false,
        metadata: { showOnce: true },
      },
      {
        id: "no_matches",
        type: "automatic",
        priority: 3,
        condition: () => {
          const currentJob = currentJobRef.current;
          return Boolean(
            currentJob &&
              currentJob.profile_completion &&
              currentJob.profile_completion > 0.7 &&
              jobSearchStage === 2 &&
              (!currentJob.matches ||
                currentJob.matches.length === 0 ||
                !currentJob.matches.find((m) => m.score > 0.61)),
          );
        },
        message: () => {
          const currentJob = currentJobRef.current;
          const hasEmails =
            currentJob?.emails?.length || calendar?.googleIds?.length;
          return `😒 There are no good matches now,${hasEmails ? " but" : " make sure to set your email so"} we will alert you via email 😃.`;
        },
        actionType: "AUTO_MESSAGE",
        canUndo: false,
        canRetry: false,
        metadata: { showOnce: true },
      },
      {
        id: "new-profile",
        type: "immediate",
        priority: 2,
        condition: () => jobs.length > 0 && !currentJobId,
        message:
          "🚀 To create a new job or talent post, provide me full details about skills and requirements. " +
          JOB_DETAILS,
        actionType: "NEW_PROFILE_MESSAGE",
        canUndo: false,
        canRetry: false,
        metadata: { showOnce: false },
      },
    ],
    [
      jobs.length,
      calendar?.availabilities?.length,
      jobSearchStage,
      currentJobId,
      calendar?.googleIds?.length,
    ],
  );

  // ===== MESSAGE GETTERS =====
  const getMessagesByType = useCallback(
    (type: MessageType): MessageRule[] => {
      return messageRules
        .filter((rule) => rule.type === type && rule.condition())
        .sort((a, b) => a.priority - b.priority);
    },
    [messageRules],
  );

  const getMessages = useCallback(
    (filters?: MessageFilters): MessageRule[] => {
      let filtered = messageRules.filter((rule) => rule.condition());

      if (filters?.type)
        filtered = filtered.filter((rule) => rule.type === filters.type);
      if (filters?.priority !== undefined)
        filtered = filtered.filter(
          (rule) => rule.priority === filters.priority,
        );
      if (filters?.showOnce !== undefined)
        filtered = filtered.filter(
          (rule) => rule.metadata?.showOnce === filters.showOnce,
        );
      if (filters?.excludeIds?.length)
        filtered = filtered.filter(
          (rule) => !filters.excludeIds!.includes(rule.id),
        );

      return filtered.sort((a, b) => a.priority - b.priority);
    },
    [messageRules],
  );

  // ===== LEGACY COMPATIBILITY =====
  const getAutomaticMessage = useCallback(() => {
    const messages = getMessagesByType("automatic");
    return messages.length > 0 ? getMessage(messages[0].message) : null;
  }, [getMessagesByType, getMessage]);

  const getOnboardingMessage = useCallback(() => {
    const contextualMessages = getMessagesByType("contextual");
    return contextualMessages.length > 0
      ? getMessage(contextualMessages[0].message)
      : null;
  }, [getMessagesByType, getMessage]);

  const shouldShowWelcomeMessage = useCallback(() => {
    return getMessagesByType("immediate").length > 0;
  }, [getMessagesByType]);

  const getTriggeredMessages = useCallback(
    (type: MessageType): MessageRule[] => {
      return getMessagesByType(type);
    },
    [getMessagesByType],
  );

  // ===== MESSAGE HANDLERS =====
  const handleCalendarCase = useCallback(
    async (message: string): Promise<ProcessedMessage> => {
      const now = Date.now() * 1e6;
      const prompt = `Current time: ${TimeFormatter.formatTime(now)} ${TimeFormatter.formatDate(now)}\nCurrent Calendar: ${CalendarFormatter.formatCalendarForPrompt(calendar)}\nUser input: ${message}`;

      let eventRes: any[] = [];

      if (import.meta.env.VITE_DFX_NETWORK === "local") {
        eventRes = mockCalendarAIResponse(calendar, message.split("//")[1]);
      } else {
        const calendarRes = await aiAgent.sendMessage(
          prompt,
          false,
          PROMPTS.CALENDAR,
        );
        dispatch({
          type: "UPDATE_AI_CREDITS",
          remainingCredits: aiAgent.remainingCredits(),
        });
        eventRes = textToJson(calendarRes).extractedData;
      }

      eventRes?.forEach((action) => {
        if (action.data.type !== "CALENDAR_QUERY") {
          const parsedActions = ActionProcessor.processAction(action.data);
          if (parsedActions) dispatch(parsedActions);
        }
      });

      return {
        action_type: "CALENDAR",
        feedback:
          eventRes.map((e) => e.feedback).join(" ") ||
          "Calendar action completed",
        actions: eventRes?.map((e) => e.data) || [],
        done: true,
      };
    },
    [calendar, aiAgent, dispatch],
  );

  const handleJobsCase = useCallback(
    async (message: string): Promise<ProcessedMessage> => {
      const contextualMessages = getTriggeredMessages("contextual");
      const contextualMessage =
        contextualMessages.length > 0
          ? getMessage(contextualMessages[0].message)
          : null;

      const prompt = `User Input: ${message.trim()}, Current Job Data: ${JSON.stringify(currentJobRef.current)}`;
      let parsedJob: any = {};

      if (import.meta.env.VITE_DFX_NETWORK === "local") {
        parsedJob = mockJobAIResponse(
          currentJobRef.current,
          jobs,
          message.split("//")[1],
          message.split("//")[0],
        );
        parsedJob.profile_completion = 1;
      } else {
        const jobRes = await aiAgent.sendMessage(prompt, false, PROMPTS.JOB);
        dispatch({
          type: "UPDATE_AI_CREDITS",
          remainingCredits: aiAgent.remainingCredits(),
        });
        parsedJob = textToJson(jobRes).extractedData;
      }

      if (parsedJob?.profile_completion === 1) {
        dispatch({ type: "IS_PROFILE_COMPELETE" });
      }

      // Validation
      if (!currentJobId) {
        if (
          parsedJob.category === "Talent" &&
          jobs.some((j) => Object.keys(j.category)[0] === "Talent")
        ) {
          throw new Error("You can create only one talent profile");
        }
        if (
          jobs.filter((j) => Object.keys(j.category)[0] === "Job").length >= 3
        ) {
          throw new Error("You can have max 3 job posts");
        }
      }

      if (!parsedJob?.updates) {
        throw new Error(
          "Something went wrong please try again. Report the issue on x.com/odoc_ic",
        );
      }

      // Dispatch updates
      if (parsedJob.type !== "JOBS_QUERY") {
        dispatch({
          type: "UPDATE_FIELDS",
          updates: parsedJob.updates,
          category: parsedJob.category,
          required_match_score: parsedJob.required_match_score,
          feedback: parsedJob.feedback,
          profile_completion: parsedJob.profile_completion,
        });
      }

      const finalFeedback = contextualMessage
        ? `${contextualMessage}${parsedJob.feedback ? `\n\n${parsedJob.feedback}` : ""}`
        : parsedJob.feedback;

      return {
        action_type: "JOB",
        feedback: finalFeedback,
        actions: parsedJob.updates || [],
        done: parsedJob.done || false,
      };
    },
    [getTriggeredMessages, getMessage, currentJobId, jobs, aiAgent, dispatch],
  );

  const handleOtherCase = useCallback(
    async (parsed: any): Promise<ProcessedMessage> => {
      if (parsed.feedback?.includes("locally")) {
        return {
          action_type: "LOCAL_HELP",
          feedback:
            "Locally you can make commands like:\n- Calendar: `calendar//aa>title>09:00>17:00>1,2,3,4,5>false`\n- Job: `Job//as>skill1,skill2` (add skills)",
          actions: [],
          done: true,
        };
      }

      return {
        action_type: "OTHER",
        feedback: parsed.feedback || "Unable to process request",
        actions: [],
        done: true,
      };
    },
    [],
  );

  // ===== MAIN PROCESSOR =====
  const processMessage = useCallback(
    async (
      message: string,
      messageId: string | number,
    ): Promise<ProcessedMessage> => {
      const compactedMessage =
        message.length > 2000
          ? compactMessage(
              `${message} current topic ${location.pathname === "/" ? "Job" : location.pathname}`,
            )
          : message;

      try {
        let parsed: any = {};

        if (import.meta.env.VITE_DFX_NETWORK === "local") {
          if (compactedMessage.includes("//")) {
            const type = compactedMessage.split("//")[0].toUpperCase();
            parsed = { type: type === "TALENT" ? "JOB" : type };
          } else {
            parsed = { feedback: "locally" };
          }
        } else {
          const classifyRes = await aiAgent.sendMessage(
            `current classifier: ${location.pathname === "/" ? "Job" : location.pathname}\nMessage:${compactedMessage}`,
            true,
            PROMPTS.CLASSIFY,
          );
          dispatch({
            type: "UPDATE_AI_CREDITS",
            remainingCredits: aiAgent.remainingCredits(),
          });
          parsed = textToJson(classifyRes).extractedData;
        }

        // Navigation
        if (parsed.type === "JOB" && location.pathname !== "/") navigate("/");
        if (parsed.type === "CALENDAR" && location.pathname !== "/calendar")
          navigate("/calendar");

        // Route to handlers
        let result: ProcessedMessage;
        switch (parsed.type) {
          case "CALENDAR":
            result = await handleCalendarCase(compactedMessage);
            break;
          case "JOB":
            result = await handleJobsCase(compactedMessage);
            break;
          case "QUESTIONS":
            result = {
              action_type: "QUESTIONS",
              feedback:
                "Questions functionality with RAG will be implemented soon",
              actions: [],
              done: true,
            };
            break;
          default:
            result = await handleOtherCase(parsed);
            break;
        }

        setMessageResponses((prev) => ({
          ...prev,
          [messageId]: { parsed, result },
        }));
        return result;
      } catch (error) {
        console.error("Error processing message:", error);
        throw error;
      }
    },
    [
      location.pathname,
      aiAgent,
      dispatch,
      navigate,
      handleCalendarCase,
      handleJobsCase,
      handleOtherCase,
    ],
  );

  // ===== RETURN API =====
  return {
    // Core functionality
    processMessage,
    messageResponses,

    // Message system
    getTriggeredMessages,
    getMessages,
    getMessage,
    messageRules,

    // Legacy compatibility
    getOnboardingMessage,
    getAutomaticMessage,
    shouldShowWelcomeMessage,
  };
};
