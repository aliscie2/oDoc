// Validation type definitions

import { Calendar } from "./calendar.types";
import { Event, SlotInfo } from "./event.types";

export interface ValidationContext {
  calendar: Calendar;
  profile: {
    id: string;
    name: string;
  };
  eventData: {
    title: string;
    description: string;
  };
  slotInfo: SlotInfo;
  selectedEvent: Event | null;
  isGoogleConnected: boolean;
  userCalendar?: Calendar;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export type ValidationScenario =
  | "OWN_CALENDAR_NO_GOOGLE"
  | "OWN_CALENDAR_WITH_GOOGLE"
  | "SHARED_CALENDAR_BASIC"
  | "SHARED_CALENDAR_READONLY"
  | "SHARED_CALENDAR_ADVANCED";
