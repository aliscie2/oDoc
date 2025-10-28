import { Principal } from "@dfinity/principal";
import { Job, CalendarActions } from "$/declarations/backend/backend.did";
import { ActionProcessor } from "../utils";
import { buildContractPrompt } from "../prompts/contract";
import { parseContractUrlParams } from "../../utils/urlEncoder";
import compactMessage from "../../pages/jobs/utils/compactMessage";
import { mockJobAIResponse } from "../mocks/mockJobAIRes";
import { mockCalendarAIResponse } from "../mocks/mockCalendarAIRes";
import PROMPTS from "../prompts";
import { backendActor } from "@/utils/backendUtils";
import {
  EventTimezone,
  AvailabilityTimezone,
} from "@/pages/calendar/utils/serializers";

export interface ProcessedMessage {
  action_type: string;
  feedback: string;
  actions: unknown[];
  done: boolean;
  // Additional fields for undo system
  prev_cal?: unknown;
  prev_job?: any;
  prev_contract?: any;
  curr_job?: any;
  category?: string;
  required_match_score?: number;
}

export interface ClassificationResult {
  type: string;
  feedback?: string;
}

export interface MessageProcessorConfig {
  calendar: any;
  jobs: any[];
  currentJobId: string | null;
  contracts: any;
  all_friends: any[];
  profile: any;
}

export interface AIServiceInterface {
  sendAIMessage(config: any, abortSignal?: AbortSignal): Promise<any>;
  createAIConfig(prompt: string, systemPrompt: string, classify?: boolean): any;
}

export interface AICasesInterface {
  getAICase(location: any): any;
  aiCases: any[];
}

export interface NavigationInterface {
  navigate(path: string): void;
  location: any;
}

export interface DispatchInterface {
  dispatch(action: unknown): void;
}

export interface GoogleCalendarInterface {
  executeGoogleAction(action: {
    type: string;
    event?: any;
    id?: string;
    calendarEmail?: string;
  }): Promise<any>;
  isConnected: boolean;
  refreshGoogleCalendarEvents(): Promise<void>;
}

/**
 * Core message processing business logic
 * Handles AI message processing, classification, and action dispatching
 */
export class MessageProcessor {
  constructor(
    private config: MessageProcessorConfig,
    private aiService: AIServiceInterface,
    private aiCases: AICasesInterface,
    private navigation: NavigationInterface,
    private dispatcher: DispatchInterface,
    private googleCalendar?: GoogleCalendarInterface,
  ) {
    this.loadMarkdownContent();
  }

  private markdownContent: string = "";

  private async loadMarkdownContent() {
    try {
      const markdownFiles = [
        () => import("../../pages/white_paper/md/whitepaper.md?raw"),
        () => import("../../pages/white_paper/md/promise.md?raw"),
        () => import("../../pages/white_paper/md/roadmap.md?raw"),
        () => import("../../pages/white_paper/md/sns.md?raw"),
        () => import("../../pages/white_paper/md/architecture.md?raw"),
        () => import("../../pages/white_paper/md/job_match.md?raw"),
      ];

      const loadedFiles = await Promise.all(
        markdownFiles.map((loader) =>
          loader().then((module) => module.default),
        ),
      );

      this.markdownContent = loadedFiles.join("\n\n");
    } catch (error) {
      console.error("Error loading markdown files:", error);
      this.markdownContent = "";
    }
  }

  private findRelevantContent(query: string, content: string): string {
    const queryLower = query.toLowerCase();
    const sections = content.split(/(?=^# )/gm).filter((s) => s.trim());

    const scoredSections = sections.map((section) => {
      const sectionLower = section.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

      let score = 0;
      queryWords.forEach((word) => {
        const matches = (sectionLower.match(new RegExp(word, "g")) || [])
          .length;
        score += matches;
      });

      return { section, score };
    });

    const relevantSections = scoredSections
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.section);

    return relevantSections.length > 0
      ? relevantSections.join("\n\n")
      : content.substring(0, 4000);
  }

  private async processGeneralQuery(
    message: string,
    abortSignal?: AbortSignal,
  ): Promise<ProcessedMessage> {
    if (!this.markdownContent) {
      return {
        action_type: "GENERAL_QUERY",
        feedback:
          "Documentation not available at the moment. Please try again later.",
        actions: [],
        done: true,
      };
    }

    const relevantContent = this.findRelevantContent(
      message,
      this.markdownContent,
    );
    const ragPrompt = `Based on the following documentation content, answer the user's question about ODOC:

Documentation:
${relevantContent}

User Question: ${message}

Provide a helpful and accurate answer based only on the documentation provided. If the question cannot be answered from the documentation, say so clearly.`;

    try {
      const config = this.aiService.createAIConfig(
        ragPrompt,
        'JSON response format: {"feedback": "YOUR RESPONSE in markdown here."}',
      );

      const result = await this.aiService.sendAIMessage(config, abortSignal);

      // Extract feedback properly from parsed data
      let feedback =
        "I couldn't find relevant information in the documentation.";

      if (
        result.parsedData &&
        typeof result.parsedData === "object" &&
        result.parsedData.feedback
      ) {
        feedback = result.parsedData.feedback;
      } else if (typeof result.response === "string") {
        // Try to extract from raw response if parsing failed
        try {
          const parsed = JSON.parse(result.response);
          feedback = parsed.feedback || result.response;
        } catch {
          feedback = result.response;
        }
      }

      return {
        action_type: "GENERAL_QUERY",
        feedback,
        actions: [],
        done: true,
      };
    } catch (error) {
      console.error("Error processing general query:", error);
      return {
        action_type: "GENERAL_QUERY",
        feedback:
          "Sorry, I couldn't process your question right now. Please try again later.",
        actions: [],
        done: true,
      };
    }
  }
  /**
   * Trims long messages for classification to improve performance
   */
  private trimMessageForClassifier(message: string): string {
    const sentences = message
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (sentences.length <= 4) {
      return message;
    }

    const firstTwo = sentences.slice(0, 2);
    const lastTwo = sentences.slice(-2);

    return [
      ...firstTwo.map((s) => s + "."),
      "...",
      ...lastTwo.map((s) => s + "."),
    ].join(" ");
  }

  /**
   * Processes AI cases with specific business logic
   */
  private async processAICase(
    aiCase: any,
    message: string,
    abortSignal?: AbortSignal,
  ): Promise<ProcessedMessage> {
    const prompt = aiCase.messageBuilder(
      message,
      this.config,
      this.navigation.location,
    );

    const result = await this.processProductionMode(
      aiCase,
      message,
      prompt,
      abortSignal,
    );
    await this.processActionsByType(aiCase, result);
    return this.buildProcessedMessage(aiCase, result);
  }

  /**
   * Handles local development mode processing
   */
  private processLocalMode(aiCase: any, message: string): any {
    switch (aiCase.class) {
      case "CALENDAR":
        const calendarData = {
          id: "local-calendar",
          owner: "local-user",
          events: [],
          availabilities: this.config.calendar?.availabilities || [],
          google_ids: this.config.calendar?.google_ids || [],
        };
        return mockCalendarAIResponse(calendarData, message.split("//")[1]);

      case "JOB":
        const currentJob = this.config.jobs.find(
          (job) => job.id === this.config.currentJobId,
        );
        const result = mockJobAIResponse(
          currentJob || ({} as Job),
          this.config.jobs,
          message.split("//")[1],
          message.split("//")[0],
        );
        result.profile_completion = 1;
        return result;

      default:
        return { feedback: "Local mode not implemented for this case" };
    }
  }

  /**
   * Handles production mode processing
   */
  private async processProductionMode(
    aiCase: any,
    message: string,
    prompt: string,
    abortSignal?: AbortSignal,
  ): Promise<unknown> {
    let systemPrompt = aiCase.systemPrompt;
    let actualPrompt = prompt;

    if (aiCase.id === "contract") {
      
      const contractData = this.getContractData();
      console.log({contractData})
      systemPrompt = buildContractPrompt(
        contractData.contract,
        contractData.friendsList,
        this.config.profile,
        contractData.contractId,
      );
      actualPrompt = message;
    }

    // console.log("🔍 DEBUG processProductionMode:", {
    //   aiCaseId: aiCase.id,
    //   aiCaseClass: aiCase.class,
    //   promptLength: actualPrompt.length,
    //   systemPromptLength: systemPrompt.length,
    // });

    const config = this.aiService.createAIConfig(actualPrompt, systemPrompt);
    const aiResult = await this.aiService.sendAIMessage(config, abortSignal);

    // console.log("🔍 DEBUG AI result received:", {
    //   hasAiResult: !!aiResult,
    //   hasParsedData: !!aiResult?.parsedData,
    //   parsedDataType: typeof aiResult?.parsedData,
    //   parsedDataKeys: aiResult?.parsedData
    //     ? Object.keys(aiResult.parsedData)
    //     : [],
    //   parsedData: aiResult?.parsedData,
    //   aiCaseClass: aiCase?.class,
    //   fullAiResultJSON: JSON.stringify(aiResult, null, 2),
    // });

    // Fix for JOB case: if parsedData is an array (updates array), try to parse the full response
    if (aiCase?.class === "JOB" && Array.isArray(aiResult?.parsedData)) {
      console.log(
        "⚠️ WARNING: parsedData is an array for JOB case, attempting to re-parse full response",
      );

      try {
        // Try to parse the raw response again to get the full object
        const fullParsed = JSON.parse(aiResult.response);
        if (
          fullParsed &&
          typeof fullParsed === "object" &&
          !Array.isArray(fullParsed)
        ) {
          // console.log("✅ Successfully re-parsed full response:", fullParsed);
          aiResult.parsedData = fullParsed;
        }
      } catch (error) {
        console.error("❌ Failed to re-parse response:", error);
        // If re-parsing fails, wrap the array in a proper structure
        console.log("🔧 Wrapping updates array in proper structure");
        aiResult.parsedData = {
          type: "JOB",
          updates: aiResult.parsedData,
          feedback: "Profile updated successfully",
          category: "Talent",
          required_match_score: 0.6,
          profile_completion: 0.8,
        };
      }
    }

    if (aiResult?.parsedData && aiCase?.class === "CALENDAR") {
      return this.validateCalendarResponse(aiResult.parsedData);
    }

    return aiResult.parsedData;
  }

  /**
   * Gets contract data for CONTRACT case processing
   */
  private getContractData() {
    const urlParams = new URLSearchParams(this.navigation.location.search);
    let contractId = urlParams.get("id");

    if (!contractId && this.navigation.location.pathname.startsWith("/c")) {
      const contractParams = parseContractUrlParams(window.location.href);
      contractId = contractParams?.id || null;
    }

    if (!contractId) {
      contractId = "default_contract_" + Date.now();
    }

    const storedContract = contractId
      ? this.config.contracts[contractId]
      : null;
    const contract =
      storedContract && "CustomContract" in storedContract
        ? storedContract.CustomContract
        : storedContract;

    const friendsList = (this.config.all_friends || [])
      .map((f: any) => {
        if (f.name && f.id) return { name: f.name, id: f.id };
        const friendUser =
          f.sender?.id === this.config.profile?.id ? f.receiver : f.sender;
        return { name: friendUser?.name, id: friendUser?.id };
      })
      .filter((f) => f.name && f.id && f.id !== this.config.profile?.id);

    return { contract, friendsList, contractId };
  }

  /**
   * Processes actions based on AI case type
   */
  private async processActionsByType(aiCase: any, result: any): Promise<void> {
    switch (aiCase.class) {
      case "CALENDAR":
        await this.processCalendarActions(result);
        break;
      case "CONTRACT":
        await this.processContractActions(result);
        break;
      case "JOB":
        await this.processJobActions(result);
        break;
    }
  }

  /**
   * Processes calendar-specific actions
   */
  private async processCalendarActions(result: any): Promise<void> {
    const processedActions: any[] = [];
    const deleteActions: any[] = [];
    const otherActions: any[] = [];

    for (const action of result || []) {
      if (action.data && action.data.type !== "CALENDAR_QUERY") {
        if (action.data.type === "DELETE_EVENT") {
          deleteActions.push(action.data);
        } else {
          otherActions.push(action.data);
        }
      }
    }

    // Process delete actions in batch for better performance
    if (deleteActions.length > 0) {
      try {
        await this.processBatchDeleteActions(deleteActions);
        processedActions.push(...deleteActions);
      } catch (error) {
        console.error("🤖 Batch delete error:", error);
      }
    }

    // Process other actions individually
    for (const action of otherActions) {
      try {
        await this.processIndividualCalendarAction(action);
        processedActions.push(action);
      } catch (error) {
        console.error("🤖 Calendar action error:", error);
      }
    }

    if (processedActions.length > 0 && result) {
      result.actions = processedActions;
    }
  }

  /**
   * Processes multiple delete actions in batch for better performance
   */
  private async processBatchDeleteActions(deleteActions: any[]): Promise<void> {
    // Use the same connection logic as the AI system (from Redux state)
    const isGoogleConnected =
      this.config.is_google_connected &&
      this.config.calendar?.google_ids?.length > 0;

    // console.log("🗑️ Batch delete routing decision:", {
    //   deleteActionsCount: deleteActions.length,
    //   hasGoogleCalendar: !!this.googleCalendar,
    //   googleCalendarIsConnected: this.googleCalendar?.isConnected,
    //   configCalendarGoogleIds: this.config.calendar?.google_ids,
    //   configCalendarGoogleIdsLength: this.config.calendar?.google_ids?.length,
    //   finalIsGoogleConnected: isGoogleConnected,
    //   willUseGoogleCalendar: isGoogleConnected && !!this.googleCalendar,
    // });

    // Separate Google events from backend events
    const googleEvents = deleteActions.filter((action) =>
      this.isGoogleEventId(action.id),
    );
    const backendEvents = deleteActions.filter((action) =>
      this.isBackendEventId(action.id),
    );

    // console.log("🗑️ Batch delete event separation:", {
    //   totalEvents: deleteActions.length,
    //   googleEvents: googleEvents.length,
    //   backendEvents: backendEvents.length,
    //   googleEventIds: googleEvents.map((e) => e.id),
    //   backendEventIds: backendEvents.map((e) => e.id),
    //   allEventIds: deleteActions.map((e) => e.id),
    //   eventDetectionResults: deleteActions.map((action) => ({
    //     id: action.id,
    //     isGoogle: this.isGoogleEventId(action.id),
    //     isBackend: this.isBackendEventId(action.id),
    //     containsAt: action.id.includes("@"),
    //     containsUnderscore: action.id.includes("_"),
    //   })),
    // });

    // Process backend events
    if (backendEvents.length > 0) {
      console.log(
        "🔄 Processing backend events in batch delete:",
        backendEvents.length,
      );
      for (const action of backendEvents) {
        const parsedActions = ActionProcessor.processAction(action);
        if (parsedActions) {
          this.dispatcher.dispatch(parsedActions as any);
        }
      }

      // Auto-save to backend when Google Calendar is not connected
      if (!isGoogleConnected) {
        console.log(
          "💾 Auto-saving calendar changes to backend after batch delete",
        );
        setTimeout(async () => {
          try {
            await this.autoSaveCalendarChanges();
          } catch (error) {
            console.error("Failed to auto-save calendar changes:", error);
          }
        }, 500); // Small delay to ensure Redux state is updated
      }
    }

    // Process Google Calendar events (only if connected and have Google events)
    if (googleEvents.length > 0 && isGoogleConnected && this.googleCalendar) {
      console.log(
        "🔄 Processing Google Calendar events in batch delete:",
        googleEvents.length,
      );

      // Optimistic updates first (instant UI feedback)
      for (const action of googleEvents) {
        this.dispatcher.dispatch({
          type: "DELETE_GOOGLE_EVENT_OPTIMISTIC",
          id: action.id,
        });
      }

      // Process deletes with a small delay between each to avoid rate limiting
      const deletePromises = googleEvents.map(async (action, index) => {
        // Add small delay to avoid overwhelming the API
        if (index > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100 * index));
        }

        const { originalId, calendarEmail } = this.extractGoogleEventInfo(
          action.id,
        );

        try {
          return await this.googleCalendar!.executeGoogleAction({
            type: "DELETE_EVENT",
            id: originalId,
            calendarEmail: calendarEmail,
          });
        } catch (error) {
          console.error(`Failed to delete event ${action.id}:`, error);
          return false;
        }
      });

      // Wait for all deletes to complete
      const results = await Promise.all(deletePromises);

      // Refresh calendar data once after all operations
      setTimeout(async () => {
        await this.googleCalendar!.refreshGoogleCalendarEvents();
      }, 1000);

      console.log("✅ Google Calendar batch delete completed:", {
        googleEvents: googleEvents.length,
        successful: results.filter((r) => r).length,
        failed: results.filter((r) => !r).length,
      });
    }

    console.log("✅ Overall batch delete completed:", {
      totalEvents: deleteActions.length,
      backendEvents: backendEvents.length,
      googleEvents: googleEvents.length,
    });
  }

  /**
   * Processes individual calendar action - chooses between backend and Google Calendar
   */
  private async processIndividualCalendarAction(
    actionData: any,
  ): Promise<void> {
    // Use the same connection logic as the AI system (from Redux state)
    const isGoogleConnected =
      this.config.is_google_connected &&
      this.config.calendar?.google_ids?.length > 0;

    console.log("🔄 Individual calendar action routing:", {
      actionType: actionData.type,
      actionId: actionData.id || actionData.event?.id,
      isGoogleConnected: isGoogleConnected,
      configIsGoogleConnected: this.config.is_google_connected,
      calendarGoogleIds: this.config.calendar?.google_ids,
    });

    switch (actionData.type) {
      case "ADD_EVENT":
        await this.handleAddEvent(actionData, isGoogleConnected);
        break;
      case "UPDATE_EVENT":
        await this.handleUpdateEvent(actionData, isGoogleConnected);
        break;
      case "DELETE_EVENT":
        await this.handleDeleteEvent(actionData, isGoogleConnected);
        break;
      default:
        // For availability and other actions, always use backend
        const parsedActions = ActionProcessor.processAction(actionData);
        if (parsedActions) {
          this.dispatcher.dispatch(parsedActions as any);
        }
        break;
    }
  }

  /**
   * Handles ADD_EVENT action - chooses between backend and Google Calendar
   */
  private async handleAddEvent(
    actionData: unknown,
    isGoogleConnected: boolean,
  ): Promise<void> {
    // Convert AI format to proper format if needed
    const processedEvent = this.preprocessAIEvent(actionData.event);
    actionData.event = processedEvent;
    if (isGoogleConnected && this.googleCalendar) {
      // Create in Google Calendar with optimistic update
      const optimisticEvent = {
        ...actionData.event,
        id: `temp_${Date.now()}`,
        isGoogleEvent: true,
        isPending: true,
      };

      // Optimistic update for instant UI feedback
      console.log("⚡ Dispatching optimistic event:", {
        type: "ADD_GOOGLE_EVENT_OPTIMISTIC",
        optimisticEvent: optimisticEvent,
        eventTitle: optimisticEvent.title,
        eventId: optimisticEvent.id,
      });

      this.dispatcher.dispatch({
        type: "ADD_GOOGLE_EVENT_OPTIMISTIC",
        event: optimisticEvent,
      });

      try {
        // Create in Google Calendar
        const result = await this.googleCalendar.executeGoogleAction({
          type: "ADD_EVENT",
          event: actionData.event,
        });

        if (result) {
          console.log(
            "✅ Event created successfully, refreshing calendar in 1 second...",
          );
          // Refresh to get real Google Calendar data
          setTimeout(async () => {
            console.log(
              "🔄 Starting calendar refresh after successful creation...",
            );
            await this.googleCalendar!.refreshGoogleCalendarEvents();

            console.log("🗑️ Removing optimistic event:", {
              type: "REMOVE_OPTIMISTIC_EVENT",
              optimisticEventId: optimisticEvent.id,
              eventTitle: optimisticEvent.title,
            });

            this.dispatcher.dispatch({
              type: "REMOVE_OPTIMISTIC_EVENT",
              id: optimisticEvent.id,
            });
            console.log(
              "✅ Calendar refresh completed, optimistic event removed",
            );
          }, 1000);
        } else {
          console.log("❌ Event creation failed, removing optimistic event");
          // Remove optimistic event if creation failed
          this.dispatcher.dispatch({
            type: "REMOVE_OPTIMISTIC_EVENT",
            id: optimisticEvent.id,
          });
        }
      } catch (error) {
        console.error("Failed to create Google Calendar event:", error);
        this.dispatcher.dispatch({
          type: "REMOVE_OPTIMISTIC_EVENT",
          id: optimisticEvent.id,
        });
      }
    } else {
      // Create in backend calendar - convert to backend format
      console.log("🔄 Routing ADD_EVENT to Backend");
      console.log("🔄 Original event data:", actionData.event);

      const backendEvent = this.convertToBackendFormat(actionData.event);
      console.log("🔄 Converted backend event:", backendEvent);

      const backendAction = {
        ...actionData,
        event: backendEvent,
      };

      const parsedActions = ActionProcessor.processAction(backendAction);
      if (parsedActions) {
        this.dispatcher.dispatch(parsedActions as any);

        // Auto-save to backend when Google Calendar is not connected
        console.log(
          "💾 Auto-saving calendar changes to backend after ADD_EVENT",
        );
        setTimeout(async () => {
          try {
            await this.autoSaveCalendarChanges();
          } catch (error) {
            console.error("Failed to auto-save calendar changes:", error);
          }
        }, 500); // Small delay to ensure Redux state is updated
      }
    }
  }

  /**
   * Handles UPDATE_EVENT action - chooses between backend and Google Calendar
   */
  private async handleUpdateEvent(
    actionData: any,
    isGoogleConnected: boolean,
  ): Promise<void> {
    if (isGoogleConnected && this.googleCalendar) {
      // Update in Google Calendar with optimistic update
      this.dispatcher.dispatch({
        type: "UPDATE_GOOGLE_EVENT_OPTIMISTIC",
        event: actionData.event,
      });

      try {
        const result = await this.googleCalendar.executeGoogleAction({
          type: "UPDATE_EVENT",
          event: actionData.event,
        });

        if (result) {
          setTimeout(async () => {
            await this.googleCalendar!.refreshGoogleCalendarEvents();
          }, 1000);
        } else {
          // Refresh to revert optimistic update
          setTimeout(async () => {
            await this.googleCalendar!.refreshGoogleCalendarEvents();
          }, 500);
        }
      } catch (error) {
        console.error("Failed to update Google Calendar event:", error);
        setTimeout(async () => {
          await this.googleCalendar!.refreshGoogleCalendarEvents();
        }, 500);
      }
    } else {
      // Update in backend calendar
      const parsedActions = ActionProcessor.processAction(actionData);
      if (parsedActions) {
        this.dispatcher.dispatch(parsedActions as any);
      }
    }
  }

  /**
   * Handles DELETE_EVENT action - chooses between backend and Google Calendar
   */
  private async handleDeleteEvent(
    actionData: any,
    isGoogleConnected: boolean,
  ): Promise<void> {
    // Smart routing: Detect event source by ID format
    const isGoogleEvent = this.isGoogleEventId(actionData.id);
    const isBackendEvent = this.isBackendEventId(actionData.id);

    console.log("🗑️ Delete event routing decision:", {
      eventId: actionData.id,
      isGoogleConnected: isGoogleConnected,
      isGoogleEvent: isGoogleEvent,
      isBackendEvent: isBackendEvent,
      routingDecision:
        isGoogleEvent && isGoogleConnected ? "Google Calendar" : "Backend",
    });

    if (isGoogleEvent && isGoogleConnected && this.googleCalendar) {
      console.log(
        "🔄 Routing DELETE to Google Calendar (Google event detected)",
      );
      // Delete from Google Calendar with optimistic update
      this.dispatcher.dispatch({
        type: "DELETE_GOOGLE_EVENT_OPTIMISTIC",
        id: actionData.id,
      });

      try {
        // Extract the original Google Calendar ID and determine the correct calendar
        const { originalId, calendarEmail } = this.extractGoogleEventInfo(
          actionData.id,
        );

        console.log("🗑️ AI Delete Event Info:", {
          fullId: actionData.id,
          extractedOriginalId: originalId,
          extractedCalendarEmail: calendarEmail,
          willUseId: originalId,
          willUseCalendar: calendarEmail,
        });

        const result = await this.googleCalendar.executeGoogleAction({
          type: "DELETE_EVENT",
          id: originalId, // Use extracted original ID
          calendarEmail: calendarEmail, // Pass calendar email for proper routing
        });

        if (result) {
          setTimeout(async () => {
            await this.googleCalendar!.refreshGoogleCalendarEvents();
          }, 1000);
        } else {
          // Refresh to revert optimistic update
          setTimeout(async () => {
            await this.googleCalendar!.refreshGoogleCalendarEvents();
          }, 500);
        }
      } catch (error) {
        console.error("Failed to delete Google Calendar event:", error);
        setTimeout(async () => {
          await this.googleCalendar!.refreshGoogleCalendarEvents();
        }, 500);
      }
    } else {
      // Delete from backend calendar (backend event or Google Calendar not connected)
      console.log("🔄 Routing DELETE to Backend:", {
        reason: isBackendEvent
          ? "Backend event detected"
          : "Google Calendar not connected",
        eventId: actionData.id,
      });
      const parsedActions = ActionProcessor.processAction(actionData);
      if (parsedActions) {
        this.dispatcher.dispatch(parsedActions as any);

        // Auto-save to backend when Google Calendar is not connected
        if (!isGoogleConnected) {
          console.log(
            "💾 Auto-saving calendar changes to backend after DELETE_EVENT",
          );
          setTimeout(async () => {
            try {
              await this.autoSaveCalendarChanges();
            } catch (error) {
              console.error("Failed to auto-save calendar changes:", error);
            }
          }, 500); // Small delay to ensure Redux state is updated
        }
      }
    }
  }

  /**
   * Detects if an event ID belongs to a Google Calendar event
   */
  private isGoogleEventId(eventId: string): boolean {
    // Google Calendar events have email in their ID: "email@domain.com_originalId"
    return eventId.includes("@") && eventId.includes("_");
  }

  /**
   * Detects if an event ID belongs to a backend event
   */
  private isBackendEventId(eventId: string): boolean {
    // Backend events have simple IDs without email: "evt_1673238447" or "1673238447"
    // Google events have format: "email@domain.com_randomstring"
    const result = !eventId.includes("@"); // Only exclude if it contains @ (Google Calendar format)
    console.log("🔍 Backend event ID detection:", {
      eventId: eventId,
      containsAt: eventId.includes("@"),
      result: result,
    });
    return result;
  }

  /**
   * Preprocesses AI-generated events to convert time formats
   */
  private preprocessAIEvent(event: any): any {
    if (!event) return event;

    // Check if this is AI format (has date field and string times)
    if (
      event.date &&
      typeof event.start_time === "string" &&
      typeof event.end_time === "string"
    ) {
      console.log("🔄 Converting AI event format:", {
        original: event,
        date: event.date,
        start_time: event.start_time,
        end_time: event.end_time,
      });

      try {
        // Parse AI format: "DD-MM-YYYY" and "HH:mm"
        const [day, month, year] = event.date.split("-").map(Number);
        const [startHour, startMinute] = event.start_time
          .split(":")
          .map(Number);
        const [endHour, endMinute] = event.end_time.split(":").map(Number);

        // Create Date objects and convert to nanoseconds
        const startDate = new Date(
          year,
          month - 1,
          day,
          startHour,
          startMinute,
        );
        const endDate = new Date(year, month - 1, day, endHour, endMinute);

        console.log("🕐 Timezone handling:", {
          userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          localStartDate: startDate.toString(),
          localEndDate: endDate.toString(),
          utcStartDate: startDate.toISOString(),
          utcEndDate: endDate.toISOString(),
          timezoneOffset: startDate.getTimezoneOffset(),
        });

        const convertedEvent = {
          ...event,
          start_time: startDate.getTime() * 1000000, // Convert to nanoseconds
          end_time: endDate.getTime() * 1000000,
        };

        // Remove the date field as it's now incorporated into timestamps
        delete convertedEvent.date;

        console.log("✅ Converted AI event:", {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          start_time: convertedEvent.start_time,
          end_time: convertedEvent.end_time,
          convertedEvent,
        });

        console.log("📊 Time conversion details:", {
          originalAI: {
            date: event.date,
            start_time: event.start_time,
            end_time: event.end_time,
          },
          parsed: {
            day,
            month,
            year,
            startHour,
            startMinute,
            endHour,
            endMinute,
          },
          dateObjects: {
            startDate: startDate.toString(),
            endDate: endDate.toString(),
            startISO: startDate.toISOString(),
            endISO: endDate.toISOString(),
          },
          nanoseconds: {
            start_time: convertedEvent.start_time,
            end_time: convertedEvent.end_time,
          },
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        return convertedEvent;
      } catch (error) {
        console.error("❌ Failed to convert AI event format:", error);
        return event; // Return original if conversion fails
      }
    }

    // Return as-is if already in proper format
    return event;
  }

  /**
   * Converts event with nanosecond timestamps to backend format (date + string times)
   */
  private convertToBackendFormat(event: any): any {
    if (!event) return event;

    // Check if event has nanosecond timestamps (needs conversion to backend format)
    if (
      typeof event.start_time === "number" &&
      typeof event.end_time === "number"
    ) {
      console.log("🔄 Converting nanosecond timestamps to backend format:", {
        original: event,
        start_time: event.start_time,
        end_time: event.end_time,
      });

      try {
        // Convert nanoseconds to milliseconds and create Date objects
        const startDate = new Date(event.start_time / 1e6);
        const endDate = new Date(event.end_time / 1e6);

        // Format for backend: DD-MM-YYYY and HH:mm
        const dateStr = startDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-"); // DD-MM-YYYY
        const startTimeStr = startDate.toLocaleTimeString("en-GB", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }); // HH:mm
        const endTimeStr = endDate.toLocaleTimeString("en-GB", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }); // HH:mm

        const backendEvent = {
          ...event,
          date: dateStr,
          start_time: startTimeStr,
          end_time: endTimeStr,
        };

        console.log("✅ Converted to backend format:", {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          dateStr: dateStr,
          startTimeStr: startTimeStr,
          endTimeStr: endTimeStr,
          expectedFormat: "DD-MM-YYYY with dashes",
          backendEvent: backendEvent,
        });

        return backendEvent;
      } catch (error) {
        console.error("❌ Failed to convert to backend format:", error);
        return event; // Return original if conversion fails
      }
    }

    // Return as-is if already in backend format or doesn't need conversion
    return event;
  }

  /**
   * Extracts original Google Calendar ID and calendar email from prefixed event ID
   */
  private extractGoogleEventInfo(eventId: string): {
    originalId: string;
    calendarEmail: string;
  } {
    // Handle different ID formats:
    // 1. email_originalId (e.g., "xxxxxx@gmail.com_bfk4f21f0evdquuiljh2iets4c")
    // 2. email_originalId_suffix (e.g., "xxxx@gmail.com_4n5m8ubmu0m0uhnmggdlnpdcb4_20260301")

    if (eventId.includes("@") && eventId.includes("_")) {
      const parts = eventId.split("_");
      const emailPart = parts[0]; // Should be the email

      if (emailPart.includes("@")) {
        // Email found, rest is the original ID
        const originalId = parts.slice(1).join("_");
        return {
          originalId: originalId,
          calendarEmail: emailPart,
        };
      }
    }

    // Fallback: use as-is (might be already a clean ID)
    return {
      originalId: eventId,
      calendarEmail: "", // Will use primary calendar
    };
  }

  /**
   * Processes contract-specific actions
   */
  private async processContractActions(result: any): Promise<void> {
    if (result && result.actions && Array.isArray(result.actions)) {
      result.actions.forEach((action: any) => {
        this.processContractAction(action);
        this.dispatcher.dispatch(action);
      });
    }
  }

  /**
   * Processes individual contract action
   */
  private async processContractActions(result: any): Promise<void> {
  if (result && result.actions && Array.isArray(result.actions)) {
    result.actions.forEach((action: any) => {
      this.processContractAction(action); // Normalizes the action
      this.dispatcher.dispatch(action); // Dispatches the normalized action
    });
  }
}

private processContractAction(action: any): void {
  if (action.type === "ADD_PROMISE" && !action.contract_id) {
    const contractData = this.getContractData();
    action.contract_id = contractData.contractId;
  }

  if (
    (action.type === "ADD_PROMISE" || action.type === "UPDATE_PROMISE") &&
    action.promise
  ) {
    this.normalizePromiseData(action);
    this.resolvePromiseParticipants(action);
  }
}

private normalizePromiseData(action: any): void {
  const promise = action.promise;
  
  // Convert __principal__ wrapper to actual Principal BEFORE other processing
  if (promise.sender?.__principal__) {
    promise.sender = Principal.fromText(promise.sender.__principal__);
  }
  if (promise.receiver?.__principal__) {
    promise.receiver = Principal.fromText(promise.receiver.__principal__);
  }
  
  // Ensure dates are proper numbers
  if (promise.date_created) {
    promise.date_created = Number(promise.date_created);
  }
  if (promise.date_released) {
    promise.date_released = Number(promise.date_released);
  }
  
  // Ensure amount is a number
  if (promise.amount) {
    promise.amount = Number(promise.amount);
  }
}

private resolvePromiseParticipants(action: any): void {
  const promise = action.promise;
  
  // Handle sender (now it's already a Principal or string, not __principal__ wrapper)
  if (typeof promise.sender === "string") {
    promise.sender = promise.sender === this.config.profile?.name
      ? Principal.fromText(this.config.profile.id)
      : (this.findFriendByName(promise.sender) ? 
          Principal.fromText(this.getFriendUser(this.findFriendByName(promise.sender))?.id || this.config.profile.id) :
          Principal.fromText(this.config.profile.id));
  }

  // Handle receiver (now it's already a Principal or string, not __principal__ wrapper)
  if (!promise.receiver) {
    promise.receiver = Principal.fromText("2vxsx-fae");
  } else if (typeof promise.receiver === "string") {
    const friend = this.findFriendByName(promise.receiver);
    promise.receiver = friend ? Principal.fromText(friend.id) :
      (promise.receiver === this.config.profile?.name ? 
        Principal.fromText(this.config.profile.id) :
        (this.isPrincipalString(promise.receiver) ? 
          Principal.fromText(promise.receiver) :
          Principal.fromText("2vxsx-fae")));
  }
}

private isPrincipalString(str: string): boolean {
  try {
    Principal.fromText(str);
    return true;
  } catch {
    return false;
  }
}

  /**
   * Resolves promise participants (sender/receiver) from names to Principals
   */
  
  private resolvePromiseParticipants(action: any): void {
  // Handle sender
  if (typeof action.promise.sender === "string") {
    if (action.promise.sender === this.config.profile?.name) {
      action.promise.sender = Principal.fromText(this.config.profile.id);
    } else {
      const senderFriend = this.findFriendByName(action.promise.sender);
      if (senderFriend) {
        const friendUser = this.getFriendUser(senderFriend);
        if (friendUser?.id) {
          action.promise.sender = Principal.fromText(friendUser.id);
        }
      } else {
        action.promise.sender = Principal.fromText(this.config.profile.id);
      }
    }
  }

  // ✅ ADD THIS: Ensure receiver exists (required by backend)
  if (!action.promise.receiver) {
    console.warn("⚠️ Missing receiver, using default principal");
    action.promise.receiver = Principal.fromText("2vxsx-fae"); // Default receiver
  }

  // Handle receiver
  if (typeof action.promise.receiver === "string") {
    const friend = this.findFriendByName(action.promise.receiver);
    if (friend) {
      action.promise.receiver = Principal.fromText(friend.id);
    } else {
      if (action.promise.receiver === this.config.profile?.name) {
        action.promise.receiver = Principal.fromText(this.config.profile.id);
      } else {
        try {
          action.promise.receiver = Principal.fromText(action.promise.receiver);
        } catch (error) {
          console.error(`Invalid principal format: ${action.promise.receiver}, falling back to default principal`, error);
          action.promise.receiver = Principal.fromText("2vxsx-fae");
        }
      }
    }
  }
}


  /**
   * Finds friend by name in the friends list
   */
  private findFriendByName(name: string): any {
    return this.config.all_friends.find(
      (f: any) =>
        f.name === name || f.sender?.name === name || f.receiver?.name === name,
    );
  }

  /**
   * Gets the friend user object (sender or receiver)
   */
  private getFriendUser(friend: any): any {
    return friend.sender?.id === this.config.profile?.id
      ? friend.receiver
      : friend.sender;
  }

  /**
   * Processes job-specific actions
   */
  private async processJobActions(result: any): Promise<void> {
    console.log("🔍 DEBUG processJobActions called with result:", {
      result: result,
      resultType: typeof result,
      hasResult: !!result,
      resultKeys: result ? Object.keys(result) : [],
      profileCompletion: result?.profile_completion,
      type: result?.type,
      updates: result?.updates,
      updatesType: typeof result?.updates,
      updatesIsArray: Array.isArray(result?.updates),
      updatesLength: result?.updates?.length,
      feedback: result?.feedback,
      category: result?.category,
      fullResultJSON: JSON.stringify(result, null, 2),
    });

    if (result?.profile_completion === 1) {
      this.dispatcher.dispatch({ type: "IS_PROFILE_COMPELETE" });
    }

    if (result?.type === "JOBS_QUERY") {
      console.log("✅ JOBS_QUERY detected, returning early");
      return;
    }

    console.log("🔍 DEBUG validation check:", {
      currentJobId: this.config.currentJobId,
      resultCategory: result?.category,
      jobsCount: this.config.jobs.length,
      jobsCategories: this.config.jobs.map((j) => Object.keys(j.category)[0]),
    });

    try {
      this.validateJobActions(result);
      console.log("✅ Validation passed");
    } catch (validationError) {
      console.error("❌ Validation failed:", validationError);
      throw validationError;
    }

    if (!result?.updates) {
      console.error("❌ CRITICAL: result.updates is missing!", {
        result: result,
        hasUpdates: !!result?.updates,
        updatesValue: result?.updates,
        updatesType: typeof result?.updates,
        allResultKeys: result ? Object.keys(result) : [],
        rawResult: JSON.stringify(result, null, 2),
      });

      throw new Error(
        "Something went wrong please try again. Report the issue on x.com/odoc_ic",
      );
    }

    console.log("✅ Updates exist, normalizing...", {
      updates: result.updates,
      updatesLength: result.updates.length,
    });

    const normalizedUpdates = this.normalizeJobUpdates(result?.updates || []);

    console.log("✅ Normalized updates:", {
      normalizedUpdates: normalizedUpdates,
      normalizedLength: normalizedUpdates.length,
    });

    this.dispatcher.dispatch({
      type: "UPDATE_FIELDS",
      updates: normalizedUpdates,
      category: result?.category,
      required_match_score: result?.required_match_score,
      feedback: result?.feedback,
      profile_completion: result?.profile_completion,
    });

    console.log("✅ Job actions processed successfully");
  }
  /**
   * Validates job actions before processing
   */
  private validateJobActions(result: unknown): void {
    if (!this.config.currentJobId) {
      if (
        result?.category === "Talent" &&
        this.config.jobs.some((j) => Object.keys(j.category)[0] === "Talent")
      ) {
        throw new Error("You can create only one talent profile");
      }
      if (
        this.config.jobs.filter((j) => Object.keys(j.category)[0] === "Job")
          .length >= 3
      ) {
        throw new Error("You can have max 3 job posts");
      }
    }
  }

  /**
   * Normalizes job updates to ensure consistent format
   */
  private normalizeJobUpdates(updates: unknown[]): unknown[] {
    return updates.map((update: unknown) => {
      if (typeof update === "object" && update.field && update.values) {
        return {
          field: update.field,
          values: Array.isArray(update.values)
            ? update.values
            : [update.values],
        };
      }
      return update;
    });
  }

  /**
   * Validates calendar response data and fixes common issues
   */
  private validateCalendarResponse(data: unknown): unknown {
    if (!data) return data;

    const responseArray = Array.isArray(data) ? data : [data];

    const validatedArray = responseArray
      .map((item, index) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        if (!item.data || !item.data.type) {
          return {
            feedback: item.feedback || "Action processed",
            data: {
              type: "CALENDAR_QUERY",
              ...item.data,
            },
          };
        }

        // Fix poor availability responses
        if (item.data.type === "ADD_AVAILABILITY" && item.data.availability) {
          const availability = item.data.availability;

          // Fix poor Daily schedule types that should be WeeklyRecurring
          if (availability.schedule_type?.Daily) {
            console.log(
              "🔧 Fixing poor Daily availability to WeeklyRecurring:",
              {
                original: availability.schedule_type,
                feedback: item.feedback,
              },
            );

            // Convert to WeeklyRecurring with all days
            availability.schedule_type = {
              WeeklyRecurring: {
                days: [1, 2, 3, 4, 5, 6, 7], // All days
                valid_until: [],
              },
            };

            // Update feedback to reflect the change
            item.feedback =
              item.feedback?.replace(/today/gi, "every day") ||
              "I've set your availability every day.";

            // Update title if it mentions "today"
            if (availability.title?.toLowerCase().includes("today")) {
              availability.title = availability.title.replace(
                /today/gi,
                "Daily Availability",
              );
            }
          }

          // Ensure proper structure
          if (!availability.id || typeof availability.id !== "string") {
            availability.id = `avail_${Date.now()}_${index}`;
          }

          if (!availability.title || typeof availability.title !== "string") {
            availability.title = "Daily Availability";
          }

          if (typeof availability.is_blocked !== "boolean") {
            availability.is_blocked = false;
          }

          if (!Array.isArray(availability.slots)) {
            availability.slots = [];
          }
        }

        if (
          (item.data.type === "ADD_EVENT" ||
            item.data.type === "UPDATE_EVENT") &&
          item.data.event
        ) {
          const event = item.data.event;

          if (!event.id || typeof event.id !== "string") {
            event.id = `evt_${Date.now()}_${index}`;
          }

          if (!event.title || typeof event.title !== "string") {
            event.title = "Untitled Event";
          }

          if (!Array.isArray(event.attendees)) {
            event.attendees = [];
          }
          if (!Array.isArray(event.recurrence)) {
            event.recurrence = [];
          }
        }

        return item;
      })
      .filter((item) => item !== null);

    return validatedArray;
  }

  /**
   * Builds the final processed message result
   */
  private buildProcessedMessage(
    aiCase: unknown,
    result: unknown,
  ): ProcessedMessage {
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
      prev_cal: aiCase.class === "CALENDAR" ? this.config.calendar : undefined,
      prev_job:
        aiCase.class === "JOB"
          ? this.config.jobs.find((job) => job.id === this.config.currentJobId)
          : undefined,
      prev_contract:
        aiCase.class === "CONTRACT" ? this.getContractForUndo() : undefined,
      category: aiCase.class === "JOB" ? result?.category : undefined,
      required_match_score:
        aiCase.class === "JOB" ? result?.required_match_score : undefined,
    };
  }

  /**
   * Gets contract data for undo system
   */
  private getContractForUndo(): unknown {
    const contractId =
      new URLSearchParams(this.navigation.location.search).get("id") || "";
    const contract = this.config.contracts[contractId];
    return contract && "CustomContract" in contract
      ? contract.CustomContract
      : contract;
  }

  /**
   * Main message processing entry point
   */
  async processMessage(
    message: string,
    messageId: string | number,
    abortSignal?: AbortSignal,
  ): Promise<ProcessedMessage> {
    const compactedMessage =
      message.length > 2000
        ? compactMessage(
            `${message} current topic ${this.navigation.location.pathname === "/" ? "Job" : this.navigation.location.pathname}`,
          )
        : message;

    try {
      // Check for data-driven AI cases first
      const aiCase = this.aiCases.getAICase(this.navigation.location);

      if (aiCase?.skipClassifier) {
        return await this.processAICase(aiCase, compactedMessage, abortSignal);
      }

      // Use classifier for other cases
      const parsed = await this.classifyMessage(compactedMessage, abortSignal);

      // Handle navigation
      this.handleNavigation(parsed);

      // Handle CONTRACT case navigation check
      if (parsed.type === "CONTRACT") {
        const contractResult = this.handleContractNavigation();
        if (contractResult) return contractResult;
      }

      // Find matching AI case by class
      const matchingCase = this.aiCases.aiCases.find(
        (c) => c.class === parsed.type,
      );

      if (matchingCase) {
        return await this.processAICase(
          matchingCase,
          compactedMessage,
          abortSignal,
        );
      } else {
        return await this.handleOtherCases(
          parsed,
          compactedMessage,
          abortSignal,
        );
      }
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }

  /**
   * Classifies message using AI or local logic
   */
  private async classifyMessage(
    message: string,
    abortSignal?: AbortSignal,
  ): Promise<ClassificationResult> {
    const trimmedMessage = this.trimMessageForClassifier(message);
    const config = this.aiService.createAIConfig(
      `current classifier: ${this.navigation.location.pathname === "/" ? "Job" : this.navigation.location.pathname.replace("/", "")}\nMessage:${trimmedMessage}`,
      PROMPTS.CLASSIFY,
      true,
    );
    const result = await this.aiService.sendAIMessage(config, abortSignal);
    return result.parsedData as ClassificationResult;
  }

  /**
   * Handles navigation based on message classification
   */
  private handleNavigation(parsed: ClassificationResult): void {
    if (parsed.type === "JOB" && this.navigation.location.pathname !== "/") {
      this.navigation.navigate("/");
    }
    if (
      parsed.type === "CALENDAR" &&
      this.navigation.location.pathname !== "/calendar"
    ) {
      this.navigation.navigate("/calendar");
    }
  }

  /**
   * Handles CONTRACT case navigation validation
   */
  private handleContractNavigation(): ProcessedMessage | null {
    const isOnContractWithId =
      this.navigation.location.pathname === "/contract" &&
      parseContractUrlParams(window.location.href) !== null;

    if (!isOnContractWithId) {
      if (this.navigation.location.pathname !== "/contracts") {
        this.navigation.navigate("/contracts");
      }
      return {
        action_type: "CONTRACT",
        feedback:
          "Please choose one of contracts, then open full view, to continue",
        actions: [],
        done: true,
      };
    }
    return null;
  }

  /**
   * Handles other message types (QUESTIONS, LOCAL_HELP, etc.)
   */
  private async handleOtherCases(
    parsed: ClassificationResult,
    message: string,
    abortSignal?: AbortSignal,
  ): Promise<ProcessedMessage> {
    if (parsed.type === "GENERAL_QUERY") {
      return await this.processGeneralQuery(message, abortSignal);
    } else if (parsed.type === "QUESTIONS") {
      return {
        action_type: "QUESTIONS",
        feedback: "Questions functionality with RAG will be implemented soon",
        actions: [],
        done: true,
      };
    } else if (parsed.feedback?.includes("locally")) {
      return {
        action_type: "LOCAL_HELP",
        feedback:
          "Locally you can make commands like:\n- Calendar: `calendar//aa>title>09:00>17:00>1,2,3,4,5>false`\n- Job: `Job//as>skill1,skill2` (add skills)",
        actions: [],
        done: true,
      };
    }

    // Fallback: determine type based on current path
    const pathname = this.navigation.location.pathname;
    let inferredType = "JOB";

    if (pathname === "/calendar") {
      inferredType = "CALENDAR";
    } else if (pathname === "/contract" || pathname === "/contracts") {
      inferredType = "CONTRACT";
    }

    const matchingCase = this.aiCases.aiCases.find(
      (c) => c.class === inferredType,
    );

    if (matchingCase) {
      return await this.processAICase(matchingCase, message, abortSignal);
    }

    return {
      action_type: inferredType,
      feedback: "",
      actions: [],
      done: true,
    };
  }
  /**
   * Auto-saves calendar changes to backend
   */
  private async autoSaveCalendarChanges(): Promise<void> {
    try {
      // Get current calendar state from Redux
      const state = this.config;
      const { calendar, calendar_actions, calendarChanged } = state;

      if (!backendActor || !calendar || !calendarChanged) {
        console.log(
          "⏭️ Skipping auto-save: no backend actor, calendar, or changes",
        );
        return;
      }

      console.log("💾 Auto-saving calendar changes to backend...", {
        calendarId: calendar.id,
        deleteEvents: calendar_actions.delete_events?.length || 0,
        addEvents: calendar_actions.events?.length || 0,
        addAvailabilities: calendar_actions.availabilities?.length || 0,
      });

      const serializedCalendar: CalendarActions = {
        ...calendar_actions,
        events:
          calendar_actions.events?.map((event) => EventTimezone(event, true)) ||
          [],
        availabilities:
          calendar_actions.availabilities?.map((availability) =>
            AvailabilityTimezone(availability, true),
          ) || [],
      };

      const res = await backendActor.update_calendar(
        calendar.id,
        serializedCalendar,
      );

      if (res?.Err) {
        console.error("❌ Auto-save failed:", res.Err);
        throw new Error(res.Err);
      } else {
        console.log("✅ Calendar auto-saved successfully!");

        // Mark calendar as saved
        this.dispatcher.dispatch({
          type: "SET_CALENDAR_CHANGED",
          calendarChanged: false,
        });

        // Clear the calendar actions after successful save
        this.dispatcher.dispatch({
          type: "CLEAR_CALENDAR_ACTIONS",
        });
      }
    } catch (error) {
      console.error("❌ Auto-save calendar changes failed:", error);
      throw error;
    }
  }
}
