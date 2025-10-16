// Availability type definitions

export interface TimeSlot {
  start_time: number; // Nanoseconds
  end_time: number; // Nanoseconds
}

export interface WeeklyRecurring {
  days: number[]; // 1=Monday, 7=Sunday
  valid_until?: number[];
}

export interface DateRange {
  start_date: number;
  end_date: number;
}

export type ScheduleType =
  | { WeeklyRecurring: WeeklyRecurring }
  | { DateRange: DateRange }
  | { SpecificDates: number[] };

export interface Availability {
  id: string;
  schedule_type: ScheduleType;
  time_slots: TimeSlot[];
  is_blocked: boolean;
}

export type SlotStatus = "available" | "blocked" | "past" | "none";
