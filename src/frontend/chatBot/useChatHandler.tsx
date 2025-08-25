import { useState, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Principal } from "@dfinity/principal";
import { useBackendContext } from "@/contexts/BackendContext";
import { textToJson } from "../pages/jobs/utils/processResponseJobs";
import PROMPTS from "../pages/jobs/utils/prompts";
import { buildContractPrompt } from "../pages/jobs/utils/buildContractPrompt";
import { ActionProcessor, CalendarFormatter, TimeFormatter } from "./utiles";
import compactMessage from "../pages/jobs/utils/compactMessage";
import { mockJobAIResponse } from "../pages/jobs/utils/mockJobAIRes";
import { mockCalendarAIResponse } from "../pages/jobs/utils/mockCalendarAIRes";
import { RootState } from "@/redux/reducers";
import { Job } from "$/declarations/backend/backend.did";
import { parseContractUrlParams } from "../utils/urlEncoder";

// ===== TYPE DEFINITIONS =====
export type MessageType = "immediate" | "contextual" | "automatic";
export type MessageContent = string | (() => string);

// AI Case Configuration
interface AICase {
  id: string;
  systemPrompt: string;
  condition: (location: any, state: any) => boolean;
  class: string;
  messageBuilder: (message: string, state: any, location: any) => string;
  priority?: number;
  skipClassifier?: boolean;
}

// AI Message Service Types
interface AIMessageConfig {
  prompt: string;
  classify: boolean;
  promptType: string;
  skipCreditUpdate?: boolean;
}

interface AIMessageResult<T = any> {
  response: string;
  parsedData: T;
  remainingCredits: number;
}

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
  // Additional fields for undo system
  prev_cal?: any;
  prev_job?: any;
  prev_contract?: any;
  curr_job?: any;
  category?: string;
  required_match_score?: number;
}

interface MessageFilters {
  type?: MessageType;
  priority?: number;
  showOnce?: boolean;
  excludeIds?: string[];
}

// ===== MAIN HOOK =====
export const useChatHandler = () => {
  const { backendActor } = useBackendContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { calendar } = useSelector((state: RootState) => state.calendarState);
  const { credits } = useSelector((state: RootState) => state.AIState);
  const { currentJobId, jobs, jobSearchStage } = useSelector(
    (state: RootState) => state.jobState,
  );
  const { contracts, all_friends, profile } = useSelector(
    (state: RootState) => state.filesState,
  );

  const [messageResponses, setMessageResponses] = useState<
    Record<string | number, unknown>
  >({});

  const currentJobRef = useRef<Job | undefined>();
  currentJobRef.current = jobs.find((job) => job.id === currentJobId);

  // ===== CONSTANTS =====
  const JOB_DETAILS = `\n\n**Let's get started:**\n- Are you looking for your next career move? \n- Or are you hiring and need to find the right candidates?\n\nTell me about your goals, preferred roles, skills, or what kind of talent you're seeking. The more details you share, the better I can assist you!`;

  // ===== AI CASES CONFIGURATION =====
  const aiCases: AICase[] = [
    {
      id: "calendar",
      systemPrompt: PROMPTS.CALENDAR,
      condition: (location) => location.pathname === "/calendar",
      class: "CALENDAR",
      messageBuilder: (message) => {
        const now = Date.now() * 1e6;
        return `Current time: ${TimeFormatter.formatTime(now)} ${TimeFormatter.formatDate(now)}\nCurrent Calendar: ${CalendarFormatter.formatCalendarForPrompt(calendar)}\nUser input: ${message}`;
      },
      priority: 1,
    },
    {
      id: "contract",
      systemPrompt: "", // Will be set dynamically in processAICase
      condition: (location) => {
        if (
          location.pathname !== "/contract" &&
          !location.pathname.startsWith("/c")
        )
          return false;
        // For new Base64 format or legacy query format, check if we can parse contract params
        if (location.pathname.startsWith("/c")) {
          const contractParams = parseContractUrlParams(window.location.href);
          return contractParams !== null;
        }
        // For legacy format, check query params
        const params = new URLSearchParams(location.search);
        return params.has("id") && params.get("id")?.trim() !== "";
      },
      class: "CONTRACT",
      messageBuilder: (message, _state, location) => {
        return message; // Just return the message, system prompt handled in processAICase
      },
      priority: 0,
      skipClassifier: true,
    },
    {
      id: "job",
      systemPrompt: PROMPTS.JOB,
      condition: (location) =>
        location.pathname === "/" || location.pathname === "/jobs",
      class: "JOB",
      messageBuilder: (message) => {
        const currentJob = jobs.find((job) => job.id === currentJobId);
        return `User Input: ${message.trim()}, Current Job Data: ${JSON.stringify(currentJob || {})}`;
      },
      priority: 2,
    },
  ];

  // ===== AI MESSAGE SERVICE =====
  const sendAIMessage = useCallback(
    async <T = any,>(
      config: AIMessageConfig,
      abortSignal?: AbortSignal,
    ): Promise<AIMessageResult<T>> => {
      console.log({ config });
      const aiResponse = await backendActor.ask_ai(
        config.prompt,
        config.promptType,
        config.classify, // classify=true means quick=true (for classification)
      );
      console.log({ aiResponse });
      if (!aiResponse || "Err" in aiResponse) {
        throw new Error(
          aiResponse && "Err" in aiResponse
            ? aiResponse.Err
            : "AI returned no response",
        );
      }
      console.log({ aiResponse });

      const response = aiResponse.Ok.response;

      const remainingCredits = aiResponse.Ok.remaining_credits;

      if (!config.skipCreditUpdate) {
        dispatch({
          type: "UPDATE_AI_CREDITS",
          remainingCredits,
        });
      }

      return {
        response,
        parsedData: textToJson(response).extractedData as T,
        remainingCredits,
      };
    },
    [backendActor, dispatch],
  );

  const sendAIMessages = useCallback(
    async <T = any,>(
      configs: AIMessageConfig[],
      abortSignal?: AbortSignal,
    ): Promise<AIMessageResult<T>[]> => {
      const results: AIMessageResult<T>[] = [];

      for (const config of configs) {
        const result = await sendAIMessage(
          {
            ...config,
            skipCreditUpdate: true,
          },
          abortSignal,
        );
        results.push(result);
      }

      // Single credit update at the end with the last response's credits
      if (results.length > 0) {
        dispatch({
          type: "UPDATE_AI_CREDITS",
          remainingCredits: results[results.length - 1].remainingCredits,
        });
      }

      return results;
    },
    [sendAIMessage, dispatch],
  );

  const createAIConfig = useCallback(
    (
      prompt: string,
      promptType: string,
      classify: boolean = false,
      skipCreditUpdate: boolean = false,
    ): AIMessageConfig => {
      return { prompt, classify, promptType, skipCreditUpdate };
    },
    [],
  );

  // ===== HELPER FUNCTIONS =====
  const getMessage = useCallback((messageContent: MessageContent): string => {
    return typeof messageContent === "function"
      ? messageContent()
      : messageContent;
  }, []);

  const trimMessageForClassifier = useCallback((message: string): string => {
    // Split message into sentences using common sentence endings
    const sentences = message
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    // If 4 or fewer sentences, return original message
    if (sentences.length <= 4) {
      return message;
    }

    // Take first 2 and last 2 sentences
    const firstTwo = sentences.slice(0, 2);
    const lastTwo = sentences.slice(-2);

    // Reconstruct with proper punctuation and add ellipsis to indicate trimming
    const trimmedMessage = [
      ...firstTwo.map((s) => s + "."),
      "...",
      ...lastTwo.map((s) => s + "."),
    ].join(" ");

    return trimmedMessage;
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

  // ===== AI CASE UTILITIES =====
  const getAICase = useCallback(
    (location: any) => {
      return aiCases
        .sort((a, b) => (a.priority || 999) - (b.priority || 999))
        .find((aiCase) =>
          aiCase.condition(location, {
            calendar,
            jobs,
            currentJobId,
            contracts,
            all_friends,
            profile,
          }),
        );
    },
    [calendar, jobs, currentJobId, contracts, all_friends, profile],
  );
  // ===== PROCESS AI CASE =====
  const processAICase = useCallback(
    async (
      aiCase: AICase,
      message: string,
      abortSignal?: AbortSignal,
    ): Promise<ProcessedMessage> => {
      const prompt = aiCase.messageBuilder(
        message,
        { calendar, jobs, currentJobId, contracts, all_friends, profile },
        location,
      );
      let result: any;

      // Handle local development mode
      if (import.meta.env.VITE_DFX_NETWORK === "local") {
        switch (aiCase.class) {
          case "CALENDAR":
            const calendarData = {
              id: "local-calendar",
              owner: "local-user",
              events: [],
              availabilities: calendar?.availabilities || [],
              googleIds: calendar?.googleIds || [],
            };
            result = mockCalendarAIResponse(
              calendarData,
              message.split("//")[1],
            );
            break;
          case "JOB":
            const currentJob = jobs.find((job) => job.id === currentJobId);
            result = mockJobAIResponse(
              currentJob || ({} as Job),
              jobs,
              message.split("//")[1],
              message.split("//")[0],
            );
            result.profile_completion = 1;
            break;
          default:
            result = { feedback: "Local mode not implemented for this case" };
        }
      } else {
        let systemPrompt = aiCase.systemPrompt;
        let actualPrompt = prompt;

        // Handle CONTRACT case with dynamic system prompt
        if (aiCase.id === "contract") {
          // Get contract data for CONTRACT case
          const urlParams = new URLSearchParams(location.search);
          let contractId = urlParams.get("id");

          if (!contractId && location.pathname.startsWith("/c")) {
            const contractParams = parseContractUrlParams(window.location.href);
            contractId = contractParams?.id || null;
          }

          if (!contractId) {
            contractId = "default_contract_" + Date.now();
          }

          const storedContract = contractId ? contracts[contractId] : null;
          const contract =
            storedContract && "CustomContract" in storedContract
              ? storedContract.CustomContract
              : storedContract;

          const friendsList = (all_friends || [])
            .map((f: any) => {
              if (f.name && f.id) return { name: f.name, id: f.id };
              const friendUser =
                f.sender?.id === profile?.id ? f.receiver : f.sender;
              return { name: friendUser?.name, id: friendUser?.id };
            })
            .filter((f) => f.name && f.id && f.id !== profile?.id);

          // Generate dynamic system prompt using buildContractPrompt
          systemPrompt = buildContractPrompt(
            contract,
            friendsList,
            profile,
            contractId,
          );
          actualPrompt = message; // Use the original message as the user prompt
        }

        const config = createAIConfig(actualPrompt, systemPrompt);
        const aiResult = await sendAIMessage(config, abortSignal);
        result = aiResult.parsedData;
      }

      // Process actions based on case type
      if (aiCase.class === "CALENDAR") {
        const processedActions: any[] = [];

        result?.forEach((action: any) => {
          if (action.data && action.data.type !== "CALENDAR_QUERY") {
            try {
              const parsedActions = ActionProcessor.processAction(action.data);

              if (parsedActions) {
                dispatch(parsedActions as any);
                processedActions.push(parsedActions);
              }
            } catch (error) {
              console.error("🤖 ActionProcessor error:", error);
            }
          }
        });

        // Update the result.actions with processed actions for snapshot creation
        if (processedActions.length > 0 && result) {
          result.actions = processedActions;
        }
      } else if (aiCase.class === "CONTRACT") {
        console.log(
          "CONTRACT Debug - AI Response:",
          JSON.stringify(result, null, 2),
        );
        console.log(
          "CONTRACT Debug - Available contracts:",
          Object.keys(contracts),
        );
        console.log(
          "CONTRACT Debug - Current URL params:",
          new URLSearchParams(location.search).get("id"),
        );
        console.log(
          "CONTRACT Debug - Result actions:",
          JSON.stringify(result?.actions, null, 2),
        );

        if (result && result.actions && Array.isArray(result.actions)) {
          result.actions.forEach((action: any) => {
            console.log("CONTRACT Debug - Processing action:");
            console.log("- Action Type:", action.type);
            console.log("- Action Data:", JSON.stringify(action, null, 2));

            // Ensure contract_id is set for ADD_PROMISE actions
            if (action.type === "ADD_PROMISE" && !action.contract_id) {
              const urlParams = new URLSearchParams(location.search);
              let contractId = urlParams.get("id");

              if (!contractId && location.pathname.startsWith("/c")) {
                const contractParams = parseContractUrlParams(
                  window.location.href,
                );
                contractId = contractParams?.id || null;
              }

              if (!contractId) {
                contractId = "default_contract_" + Date.now();
              }

              action.contract_id = contractId;
              console.log(
                "CONTRACT Debug - Added missing contract_id:",
                contractId,
              );
            }

            // Process contract actions with friend name resolution
            if (
              action.type === "ADD_PROMISE" &&
              action.promise &&
              profile?.id
            ) {
              // Handle sender - convert from name to Principal if needed
              if (typeof action.promise.sender === "string") {
                if (action.promise.sender === profile?.name) {
                  action.promise.sender = Principal.fromText(profile.id);
                } else {
                  // If sender is not current user, try to find in friends
                  const senderFriend = all_friends.find(
                    (f: any) =>
                      f.name === action.promise.sender ||
                      f.sender?.name === action.promise.sender ||
                      f.receiver?.name === action.promise.sender,
                  );
                  if (senderFriend) {
                    const friendUser =
                      senderFriend.sender?.id === profile?.id
                        ? senderFriend.receiver
                        : senderFriend.sender;
                    if (friendUser?.id) {
                      action.promise.sender = Principal.fromText(friendUser.id);
                    }
                  } else {
                    // Default to current user if sender not found
                    action.promise.sender = Principal.fromText(profile.id);
                  }
                }
              }

              // Handle receiver - convert from name to Principal if needed
              if (action.promise.receiver) {
                // If receiver is already a Principal, keep it as is
                if (typeof action.promise.receiver === "string") {
                  // Find friend by name and convert to Principal using the specified format
                  const friend = all_friends.find(
                    (f) => f.name === action.promise.receiver,
                  );
                  if (friend) {
                    action.promise.receiver = Principal.fromText(friend.id);
                  } else {
                    // If no friend found by name, try to parse as Principal directly
                    try {
                      action.promise.receiver = Principal.fromText(
                        action.promise.receiver,
                      );
                    } catch (error) {
                      console.error(
                        `Invalid principal format: ${action.promise.receiver}`,
                        error,
                      );
                      // Skip this action if we can't convert to Principal
                      return;
                    }
                  }
                }
              }
            }

            console.log("CONTRACT Debug - Dispatching action:", action);
            dispatch(action);
          });
        }
      } else if (aiCase.class === "JOB") {
        if (result?.profile_completion === 1)
          dispatch({ type: "IS_PROFILE_COMPELETE" });

        // Validation
        if (!currentJobId) {
          if (
            result?.category === "Talent" &&
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

        if (!result?.updates)
          throw new Error(
            "Something went wrong please try again. Report the issue on x.com/odoc_ic",
          );

        if (result?.type !== "JOBS_QUERY") {
          // Normalize updates to ensure values is always an array
          const normalizedUpdates =
            result?.updates?.map((update: any) => {
              if (typeof update === "object" && update.field && update.values) {
                return {
                  field: update.field,
                  values: Array.isArray(update.values)
                    ? update.values
                    : [update.values],
                };
              }
              return update;
            }) || [];

          dispatch({
            type: "UPDATE_FIELDS",
            updates: normalizedUpdates,
            category: result?.category,
            required_match_score: result?.required_match_score,
            feedback: result?.feedback,
            profile_completion: result?.profile_completion,
          });
        }
      }

      if (!result) {
        return {
          action_type: aiCase.class,
          feedback: `${aiCase.class} action failed - no result`,
          actions: [],
          done: true,
        };
      }

      return {
        action_type: aiCase.class,
        feedback: Array.isArray(result)
          ? result.map((e) => e?.feedback || "").join(" ") ||
            `${aiCase.class} action completed`
          : result?.feedback || `${aiCase.class} action completed`,
        actions: Array.isArray(result)
          ? result?.map((e) => e?.data) || []
          : result?.actions || result?.updates || [],
        done: true,
        // Include original data for undo system
        prev_cal: aiCase.class === "CALENDAR" ? calendar : undefined,
        prev_job:
          aiCase.class === "JOB"
            ? jobs.find((job) => job.id === currentJobId)
            : undefined,
        prev_contract:
          aiCase.class === "CONTRACT"
            ? contracts[new URLSearchParams(location.search).get("id") || ""] &&
              "CustomContract" in
                contracts[new URLSearchParams(location.search).get("id") || ""]
              ? contracts[new URLSearchParams(location.search).get("id") || ""]
                  .CustomContract
              : contracts[new URLSearchParams(location.search).get("id") || ""]
            : undefined,
        // Include additional fields for JOB actions
        category: aiCase.class === "JOB" ? result?.category : undefined,
        required_match_score:
          aiCase.class === "JOB" ? result?.required_match_score : undefined,
      };
    },
    [
      calendar,
      jobs,
      currentJobId,
      contracts,
      all_friends,
      profile,
      location,
      createAIConfig,
      sendAIMessage,
      dispatch,
    ],
  );

  // ===== MAIN PROCESSOR =====
  const processMessage = useCallback(
    async (
      message: string,
      messageId: string | number,
      abortSignal?: AbortSignal,
    ): Promise<ProcessedMessage> => {
      const compactedMessage =
        message.length > 2000
          ? compactMessage(
              `${message} current topic ${location.pathname === "/" ? "Job" : location.pathname}`,
            )
          : message;

      try {
        // Check for data-driven AI cases first
        const aiCase = getAICase(location);

        if (aiCase?.skipClassifier) {
          const result = await processAICase(
            aiCase,
            compactedMessage,
            abortSignal,
          );
          setMessageResponses((prev) => ({
            ...prev,
            [messageId]: { parsed: { type: aiCase.class }, result },
          }));
          return result;
        }

        let parsed: any = {};

        // Use classifier for other cases
        if (import.meta.env.VITE_DFX_NETWORK === "local") {
          if (compactedMessage.includes("//")) {
            const type = compactedMessage.split("//")[0].toUpperCase();
            parsed = { type: type === "TALENT" ? "JOB" : type };
          } else {
            parsed = { feedback: "locally" };
          }
        } else {
          const trimmedMessage = trimMessageForClassifier(compactedMessage);
          const config = createAIConfig(
            `current classifier: ${location.pathname === "/" ? "Job" : location.pathname}\nMessage:${trimmedMessage}`,
            PROMPTS.CLASSIFY,
            true,
          );
          const result = await sendAIMessage(config, abortSignal);
          parsed = result.parsedData;
        }

        // Navigation
        if (parsed.type === "JOB" && location.pathname !== "/") navigate("/");
        if (parsed.type === "CALENDAR" && location.pathname !== "/calendar")
          navigate("/calendar");
        if (parsed.type === "CONTRACT") {
          // Check if we're on the specific contract page with ID
          const isOnContractWithId =
            location.pathname === "/contract" &&
            parseContractUrlParams(window.location.href) !== null;

          if (!isOnContractWithId) {
            // Navigate to contracts list if not on specific contract page
            if (location.pathname !== "/contracts") {
              navigate("/contracts");
            }
            const contractResult: ProcessedMessage = {
              action_type: "CONTRACT",
              feedback:
                "Please choose one of contracts, then open full view, to continue",
              actions: [],
              done: true,
            };
            setMessageResponses((prev) => ({
              ...prev,
              [messageId]: { parsed, result: contractResult },
            }));
            return contractResult;
          }
        }

        // Find matching AI case by class
        const matchingCase = aiCases.find((c) => c.class === parsed.type);

        let result: ProcessedMessage;

        if (matchingCase) {
          result = await processAICase(
            matchingCase,
            compactedMessage,
            abortSignal,
          );
        } else {
          // Handle other cases
          if (parsed.type === "QUESTIONS") {
            result = {
              action_type: "QUESTIONS",
              feedback:
                "Questions functionality with RAG will be implemented soon",
              actions: [],
              done: true,
            };
          } else if (parsed.feedback?.includes("locally")) {
            result = {
              action_type: "LOCAL_HELP",
              feedback:
                "Locally you can make commands like:\n- Calendar: `calendar//aa>title>09:00>17:00>1,2,3,4,5>false`\n- Job: `Job//as>skill1,skill2` (add skills)",
              actions: [],
              done: true,
            };
          } else {
            result = {
              action_type: "OTHER",
              feedback: parsed.feedback || "Unable to process request",
              actions: [],
              done: true,
            };
          }
        }

        setMessageResponses((prev) => ({
          ...prev,
          [messageId]: { parsed, result },
        }));
        return result;
      } catch (error) {
        console.error("Error processing message:", error);
        console.error("Error details:", {
          message: compactedMessage,
          messageId,
          location: location.pathname,
          error: error instanceof Error ? error.message : error,
        });
        throw error;
      }
    },
    [
      location,
      getAICase,
      processAICase,
      sendAIMessage,
      createAIConfig,
      navigate,
    ],
  );

  // ===== RETURN API =====
  return {
    // Core functionality
    processMessage,
    messageResponses,

    // AI Service functions
    sendAIMessage,
    sendAIMessages,
    createAIConfig,

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
