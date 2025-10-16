// Event type definitions

export interface Recurrence {
  frequency: "Daily" | "Weekly" | "Monthly" | "Yearly";
  interval: number;
  count: number | null;
  until: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start_time: number; // Nanoseconds
  end_time: number; // Nanoseconds
  created_by: string;
  attendees: string[];
  recurrence: Recurrence[];
  isGoogleEvent?: boolean;
  originalId?: string; // Original Google Calendar ID
  googleCalendarId?: string;
  isPrimaryAccount?: boolean;
}

export interface EventFormData {
  title: string;
  description: string;
  recurrence: Recurrence;
  attendees: string[];
}

export interface SlotInfo {
  start: Date;
  end: Date;
  action?: "select" | "click";
  slots?: Date[];
  created_by?: string;
}
