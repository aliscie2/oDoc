
import { Calendar } from "$/declarations/backend/backend.did";
import { TimeFormatter } from "../utils";

// Simplified command structure suggestions:
// Events:
//   ae>title>17-02-2025>9:00>9:30>description (add event)
//   ue>eventId>title>17-02-2025>9:00>9:30 (update event)
//   de>eventId (delete event)
//   ce>eventIndex (copy event by index)
//
// Availability:
//   aa>title>09:00>17:00>1,2,3,4,5>false (add availability - Mon-Fri, not blocked)
//   ua>availId>title>09:00>17:00>1,2,3,4,5>false (update availability)
//   da>availId (delete availability)
//
// Blocked Time:
//   ab>17-02-2025>09:00>17:00>reason (add blocked time)
//   db>blockId (delete blocked time)
//
// Query:
//   q>date or q>week or q>month (query calendar)

export function mockCalendarAIResponse(
  calendar: Calendar,
  command: string,
): any[] {
  const now = Date.now() * 1e6;
  const parts = command.split(">");
  const cmd = parts[0];

  // Helper functions
  const parseTime = (time: string, date?: string) => {
    const dateObj = date
      ? new Date(TimeFormatter.parseDate(date) / 1e6)
      : new Date();
    return TimeFormatter.parseTime(time, dateObj);
  };

  const parseDate = (date: string) => TimeFormatter.parseDate(date);

  const genId = () => `mock_${Date.now()}`;

  const hasConflict = (
    startTime: number,
    endTime: number,
    excludeId?: string,
  ) => {
    return calendar.events.some(
      (event) =>
        event.id !== excludeId &&
        ((startTime >= event.start_time && startTime < event.end_time) ||
          (endTime > event.start_time && endTime <= event.end_time) ||
          (startTime <= event.start_time && endTime >= event.end_time)),
    );
  };

  const isInAvailability = (startTime: number, endTime: number) => {
    if (!calendar.availabilities.length) return true;

    const eventDate = new Date(startTime / 1e6);
    const eventDay = eventDate.getDay() || 7; // Convert Sunday=0 to Sunday=7

    return calendar.availabilities.some((avail) => {
      if ("WeeklyRecurring" in avail.schedule_type) {
        const recurringDays = avail.schedule_type.WeeklyRecurring.days;
        const dayMatches = recurringDays.includes(eventDay);

        return (
          dayMatches &&
          avail.time_slots.some((slot) => {
            const slotStart = Number(slot.start_time);
            const slotEnd = Number(slot.end_time);
            return startTime >= slotStart && endTime <= slotEnd;
          })
        );
      }
      return false;
    });
  };

  try {
    switch (cmd) {
      // Add Event: ae>title>17-02-2025>9:00>9:30>description
      case "ae": {
        const [, title, date, startTime, endTime, description = ""] = parts;
        if (!title || !date || !startTime) {
          return [
            {
              feedback: "Missing required fields for event",
              data: { type: "CALENDAR_QUERY" },
            },
          ];
        }

        const finalEndTime =
          endTime ||
          (() => {
            const [h, m] = startTime.split(":").map(Number);
            return `${h.toString().padStart(2, "0")}:${(m + 15).toString().padStart(2, "0")}`;
          })();

        const start = parseTime(startTime, date);
        const end = parseTime(finalEndTime, date);

        if (hasConflict(start, end)) {
          return [
            {
              feedback:
                "Event conflicts with existing events, choose another time",
              data: { type: "CALENDAR_QUERY" },
            },
          ];
        }

        if (!isInAvailability(start, end)) {
          return [
            {
              feedback: "Event is outside of availability hours, can't create",
              data: { type: "CALENDAR_QUERY" },
            },
          ];
        }

        return [
          {
            feedback: `Event "${title}" created successfully`,
            data: {
              type: "ADD_EVENT",
              event: {
                id: genId(),
                title,
                date,
                start_time: startTime,
                end_time: finalEndTime,
                description,
                attendees: [],
                recurrence: [],
              },
            },
          },
        ];
      }

      // Update Event: ue>eventId>title>17-02-2025>9:00>9:30
      case "ue": {
        const [, eventId, title, date, startTime, endTime] = parts;
        const event = calendar.events.find((e) => e.id === eventId);
        if (!event) {
          return [
            { feedback: "Event not found", data: { type: "CALENDAR_QUERY" } },
          ];
        }

        const start = parseTime(startTime, date);
        const end = parseTime(endTime, date);

        if (hasConflict(start, end, eventId)) {
          return [
            {
              feedback:
                "Event conflicts with existing events, choose another time",
              data: { type: "CALENDAR_QUERY" },
            },
          ];
        }

        return [
          {
            feedback: `Event "${title}" updated successfully`,
            data: {
              type: "UPDATE_EVENT",
              event: {
                id: eventId,
                title,
                date,
                start_time: startTime,
                end_time: endTime,
                description: event.description,
                attendees: event.attendees,
                recurrence: [],
              },
            },
          },
        ];
      }

      // Delete Event: de>eventId
      case "de": {
        const [, eventId] = parts;
        const event = calendar.events.find((e) => e.id === eventId);
        if (!event) {
          return [
            { feedback: "Event not found", data: { type: "CALENDAR_QUERY" } },
          ];
        }

        return [
          {
            feedback: "Event deleted successfully",
            data: {
              type: "DELETE_EVENT",
              id: eventId,
            },
          },
        ];
      }

      // Copy Event: ce>eventIndex
      case "ce": {
        const [, indexStr] = parts;
        const index = parseInt(indexStr);
        if (index < 0 || index >= calendar.events.length) {
          return [
            {
              feedback: "Event index out of range",
              data: { type: "CALENDAR_QUERY" },
            },
          ];
        }

        const originalEvent = calendar.events[index];
        const originalDate = TimeFormatter.formatDate(originalEvent.start_time);
        const originalStartTime = TimeFormatter.formatTime(
          originalEvent.start_time,
        );
        const originalEndTime = TimeFormatter.formatTime(
          originalEvent.end_time,
        );

        return [
          {
            feedback: `Event "${originalEvent.title}" copied successfully`,
            data: {
              type: "ADD_EVENT",
              event: {
                id: genId(),
                title: `Copy of ${originalEvent.title}`,
                date: originalDate,
                start_time: originalStartTime,
                end_time: originalEndTime,
                description: originalEvent.description,
                attendees: [...originalEvent.attendees],
                recurrence: [],
              },
            },
          },
        ];
      }

      // Add Availability: aa>title>09:00>17:00>1,2,3,4,5>false
      case "aa": {
        const [, title, startTime, endTime, daysStr, isBlockedStr] = parts;
        const days = daysStr.split(",").map(Number);
        const isBlocked = isBlockedStr === "true";

        return [
          {
            feedback: `Availability "${title}" created successfully`,
            data: {
              type: "ADD_AVAILABILITY",
              availability: {
                id: genId(),
                title,
                is_blocked: isBlocked,
                schedule_type: {
                  WeeklyRecurring: {
                    days,
                    valid_until: [0], // Default to no expiry
                  },
                },
                slots: [
                  {
                    start_time: startTime,
                    end_time: endTime,
                  },
                ],
              },
            },
          },
        ];
      }

      // Delete Availability: da>availId
      case "da": {
        const [, availId] = parts;
        const availability = calendar.availabilities.find(
          (a) => a.id === availId,
        );
        if (!availability) {
          return [
            {
              feedback: "Availability not found",
              data: { type: "CALENDAR_QUERY" },
            },
          ];
        }

        return [
          {
            feedback: "Availability deleted successfully",
            data: {
              type: "DELETE_AVAILABILITY",
              id: availId,
            },
          },
        ];
      }

      // Query Calendar: q>date or q>week or q>month
      case "q": {
        const [, queryType] = parts;
        const currentTime = `${TimeFormatter.formatTime(now)} ${TimeFormatter.formatDate(now)}`;

        let feedback = `Current time: ${currentTime}\n`;

        if (calendar.events.length > 0) {
          feedback += `\nUpcoming events:\n`;
          calendar.events.slice(0, 5).forEach((event, i) => {
            const date = TimeFormatter.formatDate(event.start_time);
            const startTime = TimeFormatter.formatTime(event.start_time);
            const endTime = TimeFormatter.formatTime(event.end_time);
            feedback += `${i}: "${event.title}" on ${date} from ${startTime} to ${endTime}\n`;
          });
        }

        if (calendar.availabilities.length > 0) {
          feedback += `\nAvailability:\n`;
          calendar.availabilities.forEach((avail, i) => {
            const title = avail.title[0] || "Available";
            feedback += `${i}: ${title}\n`;
          });
        }

        return [
          {
            feedback: feedback.trim(),
            data: { type: "CALENDAR_QUERY" },
          },
        ];
      }

      default:
        return [
          {
            feedback:
              "Unknown command. Use: ae (add event), ue (update event), de (delete event), ce (copy event), aa (add availability), da (delete availability), q (query)",
            data: { type: "CALENDAR_QUERY" },
          },
        ];
    }
  } catch (error) {
    return [
      {
        feedback: `Error processing command: ${error.message}`,
        data: { type: "CALENDAR_QUERY" },
      },
    ];
  }
}

// Usage examples:
// mockCalendarAIResponse(calendar, 'ae>Team Meeting>17-02-2025>9:00>10:00>Weekly sync')
// mockCalendarAIResponse(calendar, 'ue>evt_123>Updated Meeting>17-02-2025>9:30>10:30')
// mockCalendarAIResponse(calendar, 'de>evt_123')
// mockCalendarAIResponse(calendar, 'ce>0')
// mockCalendarAIResponse(calendar, 'aa>Work Hours>09:00>17:00>1,2,3,4,5>false')
// mockCalendarAIResponse(calendar, 'da>avail_123')
// mockCalendarAIResponse(calendar, 'q>today')
