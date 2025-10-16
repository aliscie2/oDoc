// Google Calendar FreeBusy API Integration
// Fetches owner's busy times without revealing event details

import { Event } from "../types/event.types";

export interface FreeBusyTimeSlot {
  start: string; // ISO 8601 format
  end: string; // ISO 8601 format
}

export interface FreeBusyResponse {
  calendars: {
    [email: string]: {
      busy: FreeBusyTimeSlot[];
      errors?: Array<{
        domain: string;
        reason: string;
      }>;
    };
  };
}

export interface BlockedEvent extends Event {
  isFreeBusyBlock: boolean;
}

/**
 * Fetch owner's busy times using Google Calendar FreeBusy API
 * This API doesn't require user authentication and respects calendar privacy settings
 *
 * @param ownerEmail - Owner's Google Calendar email
 * @param timeMin - Start time for busy time query
 * @param timeMax - End time for busy time query
 * @param apiKey - Google API Key (public, for FreeBusy API)
 * @returns Array of busy time slots
 */
export const fetchOwnerFreeBusy = async (
  ownerEmail: string,
  timeMin: Date,
  timeMax: Date,
  apiKey: string,
): Promise<FreeBusyTimeSlot[]> => {
  console.log("📅 [FreeBusy] Fetching busy times for owner:", {
    ownerEmail,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: ownerEmail }],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [FreeBusy] API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`FreeBusy API error: ${response.status}`);
    }

    const data: FreeBusyResponse = await response.json();

    // Check for errors in response
    const calendarData = data.calendars[ownerEmail];
    if (calendarData?.errors && calendarData.errors.length > 0) {
      console.error("❌ [FreeBusy] Calendar errors:", calendarData.errors);

      // Check if calendar is not public or not found
      const notPublicError = calendarData.errors.find(
        (err) => err.reason === "notFound" || err.reason === "forbidden",
      );

      if (notPublicError) {
        console.warn(
          "⚠️ [FreeBusy] Calendar is not public or not accessible:",
          notPublicError,
        );
        throw new Error("CALENDAR_NOT_PUBLIC");
      }

      throw new Error("Calendar access error");
    }

    const busyTimes = calendarData?.busy || [];

    console.log("✅ [FreeBusy] Successfully fetched busy times:", {
      count: busyTimes.length,
      busyTimes: busyTimes.map((slot) => ({
        start: slot.start,
        end: slot.end,
      })),
    });

    return busyTimes;
  } catch (error) {
    console.error("❌ [FreeBusy] Error fetching busy times:", error);
    throw error;
  }
};

/**
 * Convert FreeBusy time slots to calendar events (blocked times)
 * These events show as "Busy" without revealing any details
 *
 * @param busyTimes - Array of busy time slots from FreeBusy API
 * @param ownerEmail - Owner's email for identification
 * @returns Array of blocked events for calendar display
 */
export const convertFreeBusyToEvents = (
  busyTimes: FreeBusyTimeSlot[],
  ownerEmail: string,
): BlockedEvent[] => {
  console.log("🔄 [FreeBusy] Converting busy times to blocked events:", {
    count: busyTimes.length,
  });

  const blockedEvents = busyTimes.map((slot, index) => ({
    id: `freebusy_${ownerEmail}_${index}_${Date.now()}`,
    title: "Busy", // Generic title - no details revealed
    description: "", // No description for privacy
    start_time: new Date(slot.start).getTime() * 1000000, // Convert to nanoseconds
    end_time: new Date(slot.end).getTime() * 1000000, // Convert to nanoseconds
    created_by: ownerEmail,
    isFreeBusyBlock: true, // Flag to identify these special events
    isGoogleEvent: false, // Not a regular Google event
    attendees: [],
    recurrence: [],
  }));

  console.log("✅ [FreeBusy] Created blocked events:", {
    count: blockedEvents.length,
  });

  return blockedEvents;
};

/**
 * Get time range for FreeBusy query
 * Default: Current time to 30 days in the future
 *
 * @param daysAhead - Number of days to fetch ahead (default: 30)
 * @returns Object with timeMin and timeMax dates
 */
export const getFreeBusyTimeRange = (daysAhead: number = 30) => {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + daysAhead);

  return { timeMin, timeMax };
};
