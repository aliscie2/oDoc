// Google Calendar event conversion utilities

interface GoogleEvent {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  recurrence?: string[];
  attendees?: { email: string }[];
  reminders?: {
    useDefault: boolean;
    overrides?: { method: string; minutes: number }[];
  };
}

export function serializeEventToGoogleEvent(odocEvent: any): GoogleEvent {
  let startDate: Date;
  let endDate: Date;

  if (typeof odocEvent.start_time === "string" && odocEvent.date) {
    try {
      const [day, month, year] = odocEvent.date.split("-").map(Number);
      const [startHour, startMinute] = odocEvent.start_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = odocEvent.end_time.split(":").map(Number);

      startDate = new Date(year, month - 1, day, startHour, startMinute);
      endDate = new Date(year, month - 1, day, endHour, endMinute);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date conversion");
      }
    } catch (error) {
      startDate = new Date();
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    }
  } else if (typeof odocEvent.start_time === "number") {
    startDate = new Date(odocEvent.start_time / 1000000);
    endDate = new Date(odocEvent.end_time / 1000000);
  } else {
    startDate = new Date();
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  }

  const validAttendees = odocEvent.attendees
    .filter((attendee: string) => attendee && attendee.includes("@"))
    .map((attendee: string) => ({ email: attendee }));

  return {
    summary: odocEvent.title,
    description: odocEvent.description,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    ...(validAttendees.length > 0 && { attendees: validAttendees }),
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 60 },
      ],
    },
  };
}

export interface FreeBusyTimeSlot {
  start: string;
  end: string;
}

export const fetchOwnerFreeBusy = async (
  ownerEmail: string,
  timeMin: Date,
  timeMax: Date,
  apiKey: string,
): Promise<FreeBusyTimeSlot[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          items: [{ id: ownerEmail }],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`FreeBusy API error: ${response.status}`);
    }

    const data = await response.json();
    const calendarData = data.calendars[ownerEmail];

    if (calendarData?.errors && calendarData.errors.length > 0) {
      throw new Error("CALENDAR_NOT_PUBLIC");
    }

    return calendarData?.busy || [];
  } catch (error) {
    throw error;
  }
};

export const convertFreeBusyToEvents = (
  busyTimes: FreeBusyTimeSlot[],
  ownerEmail: string,
) => {
  return busyTimes.map((slot, index) => ({
    id: `freebusy_${ownerEmail}_${index}_${Date.now()}`,
    title: "Busy",
    description: "",
    start_time: new Date(slot.start).getTime() * 1000000,
    end_time: new Date(slot.end).getTime() * 1000000,
    created_by: ownerEmail,
    isFreeBusyBlock: true,
    isGoogleEvent: false,
    attendees: [],
    recurrence: [],
  }));
};

export const getFreeBusyTimeRange = (daysAhead: number = 30) => {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setDate(timeMax.getDate() + daysAhead);
  return { timeMin, timeMax };
};
