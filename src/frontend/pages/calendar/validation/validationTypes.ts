// Validation Types and Interfaces

import { Event, SlotInfo } from "../types/event.types";
import { Calendar } from "../types/calendar.types";

/**
 * Validation scenarios based on calendar ownership and connection status
 */
export enum ValidationScenario {
  OWN_CALENDAR_GOOGLE = "own_calendar_google",
  OWN_CALENDAR_BACKEND = "own_calendar_backend",
  SHARED_CALENDAR_BASIC = "shared_calendar_basic",
  SHARED_CALENDAR_CONTRIBUTOR = "shared_calendar_contributor",
  SHARED_CALENDAR_ADVANCED = "shared_calendar_advanced",
}

/**
 * User profile information
 */
export interface Profile {
  id: string;
  name?: string;
}

/**
 * Event data for validation (partial event during creation/update)
 */
export interface EventData {
  title: string;
  description: string;
  recurrence?: {
    frequency: string;
    interval: number;
    count: null | number;
    until: null | string;
  };
  attendees?: string[];
}

/**
 * Context provided to validation engine
 */
export interface ValidationContext {
  calendar: Calendar;
  profile: Profile;
  eventData: EventData;
  slotInfo: SlotInfo;
  selectedEvent?: Event | null;
  isGoogleConnected: boolean;
  userCalendar?: Calendar; // User's own calendar for dual validation
  allEvents?: Event[]; // Combined events from all sources
}

/**
 * Result of validation execution
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * Individual validation rule
 */
export interface ValidationRule {
  name: string;
  description: string;
  validate: (context: ValidationContext) => ValidationResult;
  errorMessage: string;
}

/**
 * Collection of validation rules organized by scenario
 */
export type ValidationRuleSet = {
  [key in ValidationScenario]?: ValidationRule[];
};
