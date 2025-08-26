import PROMPTS from "../prompts";
import { parseContractUrlParams } from "../../utils/urlEncoder";

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

export class AICasesService {
  constructor(
    private calendar: any,
    private jobs: any[],
    private currentJobId: string | null,
    private contracts: any,
    private all_friends: any[],
    private profile: any,
  ) {}

  get aiCases(): AICase[] {
    return [
      {
        id: "calendar",
        systemPrompt: PROMPTS.CALENDAR,
        condition: (location) => location.pathname === "/calendar",
        class: "CALENDAR",
        messageBuilder: (message) => {
          const now = Date.now() * 1e6;
          return `Current time: ${new Date(now / 1e6).toLocaleString()}\nCurrent Calendar: ${JSON.stringify(this.calendar)}\nUser input: ${message}`;
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
          const currentJob = this.jobs.find((job) => job.id === this.currentJobId);
          return `User Input: ${message.trim()}, Current Job Data: ${JSON.stringify(currentJob || {})}`;
        },
        priority: 2,
      },
    ];
  }

  getAICase(location: any): AICase | undefined {
    return this.aiCases
      .sort((a, b) => (a.priority || 999) - (b.priority || 999))
      .find((aiCase) =>
        aiCase.condition(location, {
          calendar: this.calendar,
          jobs: this.jobs,
          currentJobId: this.currentJobId,
          contracts: this.contracts,
          all_friends: this.all_friends,
          profile: this.profile,
        }),
      );
  }
}