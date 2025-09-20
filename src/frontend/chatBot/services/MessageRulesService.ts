import { Job } from "$/declarations/backend/backend.did";

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

interface MessageFilters {
  type?: MessageType;
  priority?: number;
  showOnce?: boolean;
  excludeIds?: string[];
}

export class MessageRulesService {
  private JOB_DETAILS =
    "\n\nI can help you build and optimize your professional profile to attract the right opportunities.";
  private TALENT_DETAILS =
    "\n\nI can help you create a compelling profile, showcase your skills, and provide consultation on career development.";
  private GENERAL_DETAILS =
    "\n\nI can help you build your professional profile job or talent, and provide personalized consultations to enhance your career prospects.";

  constructor(
    private jobs: unknown[],
    private calendar: unknown,
    private jobSearchStage: number,
    private currentJobId: string | null,
  ) {}

  private get currentJob(): Job | undefined {
    return this.jobs.find((job) => job.id === this.currentJobId);
  }

  get messageRules(): MessageRule[] {
    return [
      {
        id: "welcome",
        type: "immediate",
        priority: 1,
        condition: () => this.jobs.length === 0,
        message: () => {
          const userType = localStorage.getItem("UserType");
          if (userType === "TALENT")
            return `� AI Pnrofile Builder ready to help!${this.TALENT_DETAILS}`;
          if (userType === "JOB")
            return `� AI Pnrofile Builder ready to help!${this.JOB_DETAILS}`;
          return `� AI Profile Builder ready to help!${this.GENERAL_DETAILS}`;
        },

        actionType: "WELCOME_MESSAGE",
        canUndo: false,
        canRetry: false,
        metadata: { showOnce: true },
      },
      {
        id: "calendar",
        type: "immediate",
        priority: 1,
        condition: () =>
          this.jobs.length > 0 && !this.calendar?.availabilities?.length,
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
          const currentJob = this.currentJob;
          return Boolean(
            currentJob &&
              currentJob.profile_completion &&
              currentJob.profile_completion > 0.7 &&
              this.jobSearchStage === 2 &&
              (!currentJob.matches ||
                currentJob.matches.length === 0 ||
                !currentJob.matches.find((m) => m.score > 0.61)),
          );
        },
        message: () => {
          const currentJob = this.currentJob;
          const hasEmails =
            currentJob?.emails?.length || this.calendar?.google_ids?.length;
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
        condition: () => this.jobs.length > 0 && !this.currentJobId,
        message:
          "� RReady to build a new profile? I can help you create a compelling professional profile and provide consultation on how to make it stand out.",
        actionType: "NEW_PROFILE_MESSAGE",
        canUndo: false,
        canRetry: false,
        metadata: { showOnce: false },
      },

      {
        id: "hiring_insights",
        type: "contextual",
        priority: 2,
        condition: () => this.jobs.length >= 3,
        message: () => {
          const avgMatches =
            this.jobs.reduce(
              (sum, job) => sum + (job.matches?.length || 0),
              0,
            ) / this.jobs.length;
          return `💡 Profile Insights: You have ${this.jobs.length} profiles with an average of ${Math.round(avgMatches)} connections each. I can provide consultation on how to improve your profile visibility and engagement.`;
        },
        actionType: "HIRING_INSIGHTS",
        canUndo: false,
        canRetry: false,
        metadata: { showOnce: true },
      },
    ];
  }

  getMessage(messageContent: MessageContent): string {
    return typeof messageContent === "function"
      ? messageContent()
      : messageContent;
  }

  getMessagesByType(type: MessageType): MessageRule[] {
    return this.messageRules
      .filter((rule) => rule.type === type && rule.condition())
      .sort((a, b) => a.priority - b.priority);
  }

  getMessages(filters?: MessageFilters): MessageRule[] {
    let filtered = this.messageRules.filter((rule) => rule.condition());

    if (filters?.type)
      filtered = filtered.filter((rule) => rule.type === filters.type);
    if (filters?.priority !== undefined)
      filtered = filtered.filter((rule) => rule.priority === filters.priority);
    if (filters?.showOnce !== undefined)
      filtered = filtered.filter(
        (rule) => rule.metadata?.showOnce === filters.showOnce,
      );
    if (filters?.excludeIds?.length)
      filtered = filtered.filter(
        (rule) => !filters.excludeIds!.includes(rule.id),
      );

    return filtered.sort((a, b) => a.priority - b.priority);
  }

  getTriggeredMessages(type: MessageType): MessageRule[] {
    return this.getMessagesByType(type);
  }

  // Legacy compatibility
  getAutomaticMessage(): string | null {
    const messages = this.getMessagesByType("automatic");
    return messages.length > 0 ? this.getMessage(messages[0].message) : null;
  }

  getOnboardingMessage(): string | null {
    const contextualMessages = this.getMessagesByType("contextual");
    return contextualMessages.length > 0
      ? this.getMessage(contextualMessages[0].message)
      : null;
  }

  shouldShowWelcomeMessage(): boolean {
    return this.getMessagesByType("immediate").length > 0;
  }
}
