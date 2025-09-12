import { Principal } from "@dfinity/principal";
import { Job } from "$/declarations/backend/backend.did";
import { ActionProcessor } from "../utils";
import { buildContractPrompt } from "../prompts/contract";
import { parseContractUrlParams } from "../../utils/urlEncoder";
import compactMessage from "../../pages/jobs/utils/compactMessage";
import { mockJobAIResponse } from "../mocks/mockJobAIRes";
import { mockCalendarAIResponse } from "../mocks/mockCalendarAIRes";
import PROMPTS from "../prompts";

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
  dispatch(action: any): void;
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
    let result: any;

    // Handle local development mode
    if (import.meta.env.VITE_DFX_NETWORK === "local") {
      result = this.processLocalMode(aiCase, message);
    } else {
      result = await this.processProductionMode(
        aiCase,
        message,
        prompt,
        abortSignal,
      );
    }

    // Process actions based on case type
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
  ): Promise<any> {
    let systemPrompt = aiCase.systemPrompt;
    let actualPrompt = prompt;

    // Handle CONTRACT case with dynamic system prompt
    if (aiCase.id === "contract") {
      const contractData = this.getContractData();
      systemPrompt = buildContractPrompt(
        contractData.contract,
        contractData.friendsList,
        this.config.profile,
        contractData.contractId,
      );
      actualPrompt = message;
    }

    const config = this.aiService.createAIConfig(actualPrompt, systemPrompt);
    const aiResult = await this.aiService.sendAIMessage(config, abortSignal);
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

    result?.forEach((action: any) => {
      if (action.data && action.data.type !== "CALENDAR_QUERY") {
        try {
          const parsedActions = ActionProcessor.processAction(action.data);
          if (parsedActions) {
            this.dispatcher.dispatch(parsedActions as any);
            processedActions.push(parsedActions);
          }
        } catch (error) {
          console.error("🤖 ActionProcessor error:", error);
        }
      }
    });

    if (processedActions.length > 0 && result) {
      result.actions = processedActions;
    }
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
  private processContractAction(action: any): void {
    // Ensure contract_id is set for ADD_PROMISE actions
    if (action.type === "ADD_PROMISE" && !action.contract_id) {
      const contractData = this.getContractData();
      action.contract_id = contractData.contractId;
    }

    // Process contract actions with friend name resolution
    if (
      action.type === "ADD_PROMISE" &&
      action.promise &&
      this.config.profile?.id
    ) {
      this.resolvePromiseParticipants(action);
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

    // Handle receiver
    if (
      action.promise.receiver &&
      typeof action.promise.receiver === "string"
    ) {
      const friend = this.findFriendByName(action.promise.receiver);
      if (friend) {
        action.promise.receiver = Principal.fromText(friend.id);
      } else {
        try {
          action.promise.receiver = Principal.fromText(action.promise.receiver);
        } catch (error) {
          console.error(
            `Invalid principal format: ${action.promise.receiver}`,
            error,
          );
          return;
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
    if (result?.profile_completion === 1) {
      this.dispatcher.dispatch({ type: "IS_PROFILE_COMPELETE" });
    }

    // Handle JOBS_QUERY responses (they only have feedback, no updates)
    if (result?.type === "JOBS_QUERY") {
      return; // Just return, feedback will be handled in buildProcessedMessage
    }

    // Validation
    this.validateJobActions(result);

    if (!result?.updates) {
      throw new Error(
        "Something went wrong please try again. Report the issue on x.com/odoc_ic",
      );
    }

    const normalizedUpdates = this.normalizeJobUpdates(result?.updates || []);

    this.dispatcher.dispatch({
      type: "UPDATE_FIELDS",
      updates: normalizedUpdates,
      category: result?.category,
      required_match_score: result?.required_match_score,
      feedback: result?.feedback,
      profile_completion: result?.profile_completion,
    });
  }

  /**
   * Validates job actions before processing
   */
  private validateJobActions(result: any): void {
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
  private normalizeJobUpdates(updates: any[]): any[] {
    return updates.map((update: any) => {
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
   * Builds the final processed message result
   */
  private buildProcessedMessage(aiCase: any, result: any): ProcessedMessage {
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
  private getContractForUndo(): any {
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
  ): Promise<any> {
    if (import.meta.env.VITE_DFX_NETWORK === "local") {
      if (message.includes("//")) {
        const type = message.split("//")[0].toUpperCase();
        return { type: type === "TALENT" ? "JOB" : type };
      } else {
        return { feedback: "locally" };
      }
    } else {
      const trimmedMessage = this.trimMessageForClassifier(message);
      const config = this.aiService.createAIConfig(
        `current classifier: ${this.navigation.location.pathname === "/" ? "Job" : this.navigation.location.pathname}\nMessage:${trimmedMessage}`,
        PROMPTS.CLASSIFY,
        true,
      );
      const result = await this.aiService.sendAIMessage(config, abortSignal);
      return result.parsedData;
    }
  }

  /**
   * Handles navigation based on message classification
   */
  private handleNavigation(parsed: any): void {
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
    parsed: any,
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
    } else {
      return {
        action_type: "OTHER",
        feedback: parsed.feedback || "Unable to process request",
        actions: [],
        done: true,
      };
    }
  }
}
