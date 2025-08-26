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
  private JOB_DETAILS = `\n\n**Let's get started:**\n- Are you looking for your next career move? \n- Or are you hiring and need to find the right candidates?\n\nTell me about your goals, preferred roles, skills, or what kind of talent you're seeking. The more details you share, the better I can assist you!`;

  constructor(
    private jobs: any[],
    private calendar: any,
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
        message: () =>
          `👋 Welcome! I'm here to help you find the perfect opportunities or connect you with matching jobs or talent ${this.JOB_DETAILS}`,
        actionType: "WELCOME_MESSAGE",
        canUndo: false,
        canRetry: false,
        metadata: { showOnce: true },
      },
      {
        id: "calendar",
        type: "immediate",
        priority: 1,
        condition: () => this.jobs.length > 0 && !this.calendar?.availabilities?.length,
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
            currentJob?.emails?.length || this.calendar?.googleIds?.length;
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
          "🚀 To create a new job or talent post, provide me full details about skills and requirements. " +
          this.JOB_DETAILS,
        actionType: "NEW_PROFILE_MESSAGE",
        canUndo: false,
        canRetry: false,
        metadata: { showOnce: false },
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