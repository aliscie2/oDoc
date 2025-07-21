
import { Calendar } from "../../../declarations/backend/backend.did";

// Types for the calendar actions
type CalendarActionType =
  | "ADD_EVENT"
  | "UPDATE_EVENT"
  | "DELETE_EVENT"
  | "ADD_AVAILABILITY"
  | "UPDATE_AVAILABILITY"
  | "DELETE_AVAILABILITY"
  | "UPDATE_BLOCKED_TIME"
  | "DELETE_BLOCKED_TIME";

interface CalendarAction {
  type: CalendarActionType;
  event?: any;
  availability?: any;
  blocked_time?: any;
  id?: string;
  id?: string;
}

// Time formatting utilities
export class TimeFormatter {
  private static readonly TIME_FORMAT: Intl.DateTimeFormatOptions = {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  private static readonly DATE_FORMAT: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  static formatTime(timestamp: number): string {
    try {
      const date = new Date(timestamp / 1e6);
      return date.toLocaleTimeString("en-US", this.TIME_FORMAT);
    } catch (error) {
      throw new Error(
        `Invalid timestamp for time formatting: ${error.message}`,
      );
    }
  }

  static formatDate(timestamp: number): string {
    try {
      const date = new Date(timestamp / 1e6);
      const formatted = date.toLocaleDateString("en-GB", this.DATE_FORMAT);
      return formatted.split("/").join("-");
    } catch (error) {
      throw new Error(
        `Invalid timestamp for date formatting: ${error.message}`,
      );
    }
  }

  static parseTime(timeStr: string, dateObj: Date = new Date()): number {
    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        throw new Error("Invalid time format");
      }
      const newDate = new Date(dateObj);
      newDate.setHours(hours, minutes, 0, 0);
      return newDate.getTime() * 1e6;
    } catch (error) {
      throw new Error(`Failed to parse time string: ${error.message}`);
    }
  }

  static parseDate(dateStr: string): number {
    try {
      const [day, month, year] = dateStr.split("-").map(Number);
      if (isNaN(day) || isNaN(month) || isNaN(year)) {
        throw new Error("Invalid date format");
      }
      const date = new Date(year, month - 1, day);
      if (date.toString() === "Invalid Date") {
        throw new Error("Invalid date components");
      }
      return date.getTime() * 1e6;
    } catch (error) {
      throw new Error(`Failed to parse date string: ${error.message}`);
    }
  }
}

// Calendar formatter for AI prompt
export class CalendarFormatter {
  static formatCalendarForPrompt(calendar: Calendar): string {
    const sections: string[] = [];
    if (calendar?.events?.length) {
      sections.push(
        "Events:\n" +
          calendar?.events
            .map(
              (event) =>
                `- "${event.title}" on ${TimeFormatter.formatDate(event.start_time)} at ${TimeFormatter.formatTime(event.start_time)} to ${TimeFormatter.formatTime(event.end_time)}
        ID: ${event.id}
        Description: ${event.description?.[0] || "None"}
        Attendees: ${event.attendees?.length ? event.attendees.join(", ") : "None"}`,
            )
            .join("\n"),
      );
    }

    if (calendar?.availabilities?.length) {
      sections.push(
        "Availabilities:\n" +
          calendar?.availabilities
            .map((avail) => {
              const timeSlots = avail.time_slots
                .map(
                  (slot) =>
                    `${TimeFormatter.formatTime(Number(slot.start_time))} to ${TimeFormatter.formatTime(Number(slot.end_time))}`,
                )
                .join(", ");
              return `- ${avail.title?.[0] || "Available"} (ID: ${avail.id})
        Schedule: ${timeSlots}`;
            })
            .join("\n"),
      );
    }

    if (calendar.blocked_times?.length) {
      sections.push(
        "Blocked Times:\n" +
          calendar.blocked_times
            .map((block) => {
              if ("SingleBlock" in block.block_type) {
                return `- Blocked on ${TimeFormatter.formatDate(block.block_type.SingleBlock.start_time)} from ${TimeFormatter.formatTime(block.block_type.SingleBlock.start_time)} to ${TimeFormatter.formatTime(block.block_type.SingleBlock.end_time)}
          ID: ${block.id}
          Reason: ${block.reason?.[0] || "None"}`;
              } else if ("FullDayBlock" in block.block_type) {
                return `- Blocked full day on ${TimeFormatter.formatDate(block.block_type.FullDayBlock.date)}
          ID: ${block.id}
          Reason: ${block.reason?.[0] || "None"}`;
              }
              return "";
            })
            .join("\n"),
      );
    }

    return sections.join("\n\n");
  }
}

// Action processor
export class ActionProcessor {
  static validateEventAction(action: any): boolean {
    return (
      action.event &&
      typeof action.event.date === "string" &&
      typeof action.event.start_time === "string" &&
      typeof action.event.end_time === "string"
    );
  }

  static validateAvailabilityAction(action: any): boolean {
    return (
      action.availability &&
      Array.isArray(action.availability.slots) &&
      action.availability.slots.every(
        (slot: any) =>
          typeof slot.start_time === "string" &&
          typeof slot.end_time === "string",
      )
    );
  }

  static validateBlockedTimeAction(action: any): boolean {
    return (
      action.blocked_time &&
      typeof action.blocked_time.date === "string" &&
      typeof action.blocked_time.start_time === "string" &&
      typeof action.blocked_time.end_time === "string"
    );
  }

  static processAction(action: any): CalendarAction | null {
    const newAction: CalendarAction = { type: action.type };

    try {
      switch (action.type) {
        case "ADD_EVENT":
        case "UPDATE_EVENT":
          if (!this.validateEventAction(action)) {
            throw new Error(
              `Invalid event data in action: ${JSON.stringify(action)}`,
            );
          }
          const dateTimestamp = TimeFormatter.parseDate(action.event.date);
          newAction.event = {
            recurrence: action.event.recurrence || [],
            id: action.event.id || `evt_${Date.now()}`,
            title: action.event.title || "",
            start_time: TimeFormatter.parseTime(
              action.event.start_time,
              new Date(dateTimestamp / 1e6),
            ),
            end_time: TimeFormatter.parseTime(
              action.event.end_time,
              new Date(dateTimestamp / 1e6),
            ),
            description: String(action.event.description),
            attendees: action.event.attendees || [],
            created_by: "",
          };
          break;

        case "DELETE_EVENT":
          newAction.id = action.id;
          break;

        case "ADD_AVAILABILITY":
        case "UPDATE_AVAILABILITY":
          if (!this.validateAvailabilityAction(action)) {
            throw new Error(
              `Invalid availability data in action: ${JSON.stringify(action)}`,
            );
          }
          newAction.availability = {
            id: action.availability.id || `avail_${Date.now()}`,
            title: action.availability.title ? [action.availability.title] : [],
            is_blocked: action.availability.is_blocked || false,
            schedule_type: action.availability.schedule_type || "WEEKLY",
            time_slots: action.availability.slots.map((slot: any) => ({
              start_time: TimeFormatter.parseTime(slot.start_time),
              end_time: TimeFormatter.parseTime(slot.end_time),
            })),
          };
          break;

        case "DELETE_AVAILABILITY":
          newAction.id = action.id;
          break;

        case "UPDATE_BLOCKED_TIME":
          if (!this.validateBlockedTimeAction(action)) {
            throw new Error(
              `Invalid blocked time data in action: ${JSON.stringify(action)}`,
            );
          }
          const blockedDateTimestamp = TimeFormatter.parseDate(
            action.blocked_time.date,
          );
          newAction.blocked_time = {
            id: action.blocked_time.id || `block_${Date.now()}`,
            block_type: {
              SingleBlock: {
                start_time: TimeFormatter.parseTime(
                  action.blocked_time.start_time,
                  new Date(blockedDateTimestamp / 1e6),
                ),
                end_time: TimeFormatter.parseTime(
                  action.blocked_time.end_time,
                  new Date(blockedDateTimestamp / 1e6),
                ),
              },
            },
            reason: action.blocked_time.reason
              ? [action.blocked_time.reason]
              : [],
          };
          break;

        case "DELETE_BLOCKED_TIME":
          newAction.id = action.id;
          break;

        case "CALENDAR_QUERY":
          return null;

        default:
          return null;
      }

      return newAction;
    } catch (error) {
      throw new Error(
        `Failed to process action ${action.type}: ${error.message}`,
      );
    }
  }
}
