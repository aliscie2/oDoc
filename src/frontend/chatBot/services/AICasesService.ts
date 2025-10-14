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
  // Safe serialization function to handle BigInt values
  private safeStringify = (obj: unknown): string => {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    });
  };

  constructor(
    private calendar: unknown,
    private jobs: unknown[],
    private currentJobId: string | null,
    private contracts: unknown,
    private all_friends: unknown[],
    private profile: unknown,
    private googleEvents: unknown[] = [], // Add Google Calendar events
    private isGoogleConnected: boolean = false, // Add Google connection status
  ) {}

  get aiCases(): AICase[] {
    return [
      {
        id: "calendar",
        systemPrompt: PROMPTS.CALENDAR(this.all_friends),
        condition: (location) => location.pathname === "/calendar",
        class: "CALENDAR",
        messageBuilder: (message) => {
          const now = Date.now() * 1e6;
          const friendNames = this.all_friends
            .map((friend: unknown) => {
              if (friend.name) return friend.name;
              const friendUser =
                friend.sender?.id === this.profile?.id
                  ? friend.receiver
                  : friend.sender;
              return friendUser?.name || "Unknown";
            })
            .filter(
              (name) => name !== "Unknown" && name !== this.profile?.name,
            );

          if (this.profile?.name) {
            friendNames.unshift(this.profile.name);
          }

          console.log("📅 BUILDING CALENDAR CONTEXT FOR AI:");
          console.log("  - Raw calendar data:", {
            calendar: this.calendar,
            calendarEvents: this.calendar?.events,
            calendarEventsCount: this.calendar?.events?.length,
            googleEvents: this.googleEvents,
            googleEventsCount: this.googleEvents?.length,
            isGoogleConnected: this.isGoogleConnected
          });

          const allEvents = [
            ...(this.calendar?.events || []),
            ...(this.googleEvents || []),
          ];
          
          console.log("  - Combined events:", {
            allEventsCount: allEvents.length,
            backendEventsCount: this.calendar?.events?.length || 0,
            googleEventsCount: this.googleEvents?.length || 0,
            allEventsPreview: allEvents.map(e => ({
              id: e.id,
              title: e.title,
              isGoogleEvent: e.isGoogleEvent,
              start_time: e.start_time
            }))
          });

          const calendarContext = {
            ...this.calendar,
            events: allEvents,
            google_events: this.googleEvents,
            is_google_connected: this.isGoogleConnected,
            total_events: allEvents.length,
            backend_events: this.calendar?.events?.length || 0,
            google_events_count: this.googleEvents?.length || 0,
          };

          console.log("  - Final calendar context:", {
            contextKeys: Object.keys(calendarContext),
            total_events: calendarContext.total_events,
            backend_events: calendarContext.backend_events,
            google_events_count: calendarContext.google_events_count,
            is_google_connected: calendarContext.is_google_connected,
            eventsInContext: calendarContext.events?.length
          });

          const currentDateTime = new Date(now / 1e6);
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const timeInfo = {
            date: currentDateTime.toLocaleDateString("en-GB"),
            dayOfWeek: currentDateTime.toLocaleDateString("en-US", {
              weekday: "long",
            }),
            time: currentDateTime.toLocaleTimeString("en-GB", {
              hour12: false,
            }),
            tomorrow: new Date(
              currentDateTime.getTime() + 24 * 60 * 60 * 1000,
            ).toLocaleDateString("en-GB"),
          };

          const finalMessage = `Current dateTime: ${currentDateTime.toLocaleString()} (${timezone})
            Current date: ${timeInfo.date} (${timeInfo.dayOfWeek})
            Current time: ${timeInfo.time}
            Tomorrow date: ${timeInfo.tomorrow}
            Friends available: ${friendNames.join(", ")}
            Calendar Data: ${this.safeStringify(calendarContext)}
            User input: ${message}`;

          console.log("📤 FINAL MESSAGE TO AI:", {
            messageLength: finalMessage.length,
            calendarDataIncluded: finalMessage.includes('Calendar Data:'),
            totalEventsInMessage: calendarContext.total_events,
            messagePreview: finalMessage.substring(0, 500) + '...'
          });

          return finalMessage;
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
          const currentJob = this.jobs.find(
            (job) => job.id === this.currentJobId,
          );
          return `User Input: ${message.trim()}, Current Job Data: ${this.safeStringify(currentJob || {})}`;
        },
        priority: 2,
      },
    ];
  }

  getAICase(location: unknown): AICase | undefined {
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
