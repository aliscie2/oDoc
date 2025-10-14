// Reusable Validation Helper Functions

import { ValidationContext, ValidationResult } from './validationTypes';
import { Event } from '../types/event.types';
import { Availability } from '../types/availability.types';
import { Calendar } from '../types/calendar.types';

/**
 * Check if a date is within a weekly recurring schedule
 */
export const isWithinWeeklySchedule = (date: Date, availability: Availability): boolean => {
  if ('WeeklyRecurring' in availability.schedule_type) {
    const dayOfWeek = date.getDay();
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
    return availability.schedule_type.WeeklyRecurring.days.includes(adjustedDay);
  }
  return false;
};

/**
 * Check if a date is within a specific time slot
 */
export const isWithinTimeSlot = (
  date: Date,
  timeSlot: { start_time: number; end_time: number }
): boolean => {
  // Convert nanoseconds to milliseconds
  let slotStart = new Date(Number(timeSlot.start_time) / 1000000);
  let slotEnd = new Date(Number(timeSlot.end_time) / 1000000);

  if (slotStart > slotEnd) {
    [slotStart, slotEnd] = [slotEnd, slotStart];
  }

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentTime = new Date(0, 0, 0, hours, minutes, 0);

  return (
    currentTime >= new Date(0, 0, 0, slotStart.getHours(), slotStart.getMinutes(), 0) &&
    currentTime < new Date(0, 0, 0, slotEnd.getHours(), slotEnd.getMinutes(), 0)
  );
};

/**
 * Check if event time overlaps with existing events
 */
export const hasTimeConflict = (
  newEvent: { start_time: number; end_time: number },
  existingEvents: Event[],
  excludeEventId?: string
): boolean => {
  return existingEvents.some((event) => {
    if (excludeEventId && event.id === excludeEventId) {
      return false; // Skip the event being edited
    }

    const eventStart = Number(event.start_time);
    const eventEnd = Number(event.end_time);
    const newStart = Number(newEvent.start_time);
    const newEnd = Number(newEvent.end_time);

    // Check for overlap: (StartA < EndB) and (EndA > StartB)
    return newStart < eventEnd && newEnd > eventStart;
  });
};

/**
 * Validate time order (start before end)
 */
export const isValidTimeOrder = (startTime: number, endTime: number): boolean => {
  return startTime < endTime;
};

/**
 * Check if a time slot is in the past
 */
export const isPastTimeSlot = (slotStart: Date): boolean => {
  return slotStart < new Date();
};

/**
 * Check availability for a given time slot
 */
export const checkAvailability = (
  slotStart: Date,
  availabilities: Availability[]
): { isAvailable: boolean; isBlocked: boolean } => {
  const isBlocked = availabilities.some((availability) => {
    const isCorrectDay = isWithinWeeklySchedule(slotStart, availability);
    const isInTimeSlot = availability.time_slots.some((slot) =>
      isWithinTimeSlot(slotStart, slot)
    );
    return isCorrectDay && isInTimeSlot && availability.is_blocked;
  });

  const isAvailable = availabilities.some((availability) => {
    const isCorrectDay = isWithinWeeklySchedule(slotStart, availability);
    const isInTimeSlot = availability.time_slots.some((slot) =>
      isWithinTimeSlot(slotStart, slot)
    );
    return isCorrectDay && isInTimeSlot && !availability.is_blocked;
  });

  return { isAvailable, isBlocked };
};

/**
 * Check if event is within availability settings
 */
export const isWithinAvailability = (
  eventTime: { start: number; end: number },
  availability: Availability[]
): boolean => {
  if (availability.length === 0) {
    return true; // No restrictions
  }

  const startDate = new Date(eventTime.start / 1000000);
  const { isAvailable, isBlocked } = checkAvailability(startDate, availability);

  return isAvailable && !isBlocked;
};

/**
 * Check if all required fields are present
 */
export const hasRequiredFields = (event: Partial<Event>): boolean => {
  return !!(
    event.title &&
    event.title.trim() &&
    event.start_time !== undefined &&
    event.end_time !== undefined
  );
};

/**
 * Check if user can edit calendar
 */
export const canEditCalendar = (userId: string, calendar: Calendar): boolean => {
  return calendar.owner === userId;
};

/**
 * Check calendar owner's availability
 */
export const checkOwnerAvailability = (context: ValidationContext): ValidationResult => {
  const { calendar, slotInfo } = context;
  const availabilities = calendar.availabilities || [];

  if (availabilities.length === 0) {
    return { isValid: true, errors: [] };
  }

  const { isAvailable, isBlocked } = checkAvailability(slotInfo.start, availabilities);

  if (isBlocked) {
    return {
      isValid: false,
      errors: ['This time slot is blocked by the calendar owner'],
    };
  }

  if (!isAvailable) {
    return {
      isValid: false,
      errors: ["This time slot is not available in the calendar owner's schedule"],
    };
  }

  return { isValid: true, errors: [] };
};

/**
 * Check user's own availability (for shared calendar scenario)
 */
export const checkUserAvailability = (context: ValidationContext): ValidationResult => {
  const { userCalendar, slotInfo } = context;

  if (!userCalendar) {
    return { isValid: true, errors: [] };
  }

  const availabilities = userCalendar.availabilities || [];

  if (availabilities.length === 0) {
    return { isValid: true, errors: [] };
  }

  const { isAvailable, isBlocked } = checkAvailability(slotInfo.start, availabilities);

  if (isBlocked) {
    return {
      isValid: false,
      errors: ['This time slot is blocked in your own calendar'],
    };
  }

  if (!isAvailable) {
    return {
      isValid: false,
      errors: ['This time slot is not available in your own schedule'],
    };
  }

  return { isValid: true, errors: [] };
};

/**
 * Check for conflicts with calendar owner's events
 */
export const checkOwnerEventConflicts = (context: ValidationContext): ValidationResult => {
  const { calendar, slotInfo, selectedEvent } = context;
  const events = calendar.events || [];

  const newEvent = {
    start_time: slotInfo.start.getTime() * 1e6,
    end_time: slotInfo.end.getTime() * 1e6,
  };

  const hasConflict = hasTimeConflict(newEvent, events, selectedEvent?.id);

  return {
    isValid: !hasConflict,
    errors: hasConflict
      ? ['This time slot conflicts with an existing event on this calendar']
      : [],
  };
};

/**
 * Check for conflicts with user's own events
 */
export const checkUserEventConflicts = (context: ValidationContext): ValidationResult => {
  const { userCalendar, slotInfo, selectedEvent } = context;

  if (!userCalendar) {
    return { isValid: true, errors: [] };
  }

  const events = userCalendar.events || [];

  const newEvent = {
    start_time: slotInfo.start.getTime() * 1e6,
    end_time: slotInfo.end.getTime() * 1e6,
  };

  const hasConflict = hasTimeConflict(newEvent, events, selectedEvent?.id);

  return {
    isValid: !hasConflict,
    errors: hasConflict ? ['This time slot conflicts with an event on your own calendar'] : [],
  };
};

/**
 * Check if user has permission to modify an event
 */
export const checkEventPermission = (context: ValidationContext): ValidationResult => {
  const { calendar, profile, selectedEvent } = context;

  if (!selectedEvent) {
    return { isValid: true, errors: [] };
  }

  const isOwner = calendar.owner === profile.id;
  const isCreator = selectedEvent.created_by === profile.id;
  const isUserGoogleEvent =
    selectedEvent.isGoogleEvent && calendar.google_ids?.includes(selectedEvent.created_by);

  const hasPermission = isOwner || isCreator || isUserGoogleEvent;

  return {
    isValid: hasPermission,
    errors: hasPermission ? [] : ['You do not have permission to modify this event'],
  };
};

/**
 * Validate event data completeness
 */
export const validateEventData = (context: ValidationContext): ValidationResult => {
  const { eventData, slotInfo } = context;
  const errors: string[] = [];

  if (!eventData.title || !eventData.title.trim()) {
    errors.push('Event title is required');
  }

  if (!slotInfo?.start || !slotInfo?.end) {
    errors.push('Invalid event time slot');
  }

  if (slotInfo?.start && slotInfo?.end && slotInfo.start >= slotInfo.end) {
    errors.push('Event end time must be after start time');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if a time slot is blocked
 */
export const checkBlockedSlots = (context: ValidationContext): ValidationResult => {
  const { calendar, slotInfo } = context;
  const availabilities = calendar.availabilities || [];

  const isBlocked = availabilities.some((availability) => {
    const isCorrectDay = isWithinWeeklySchedule(slotInfo.start, availability);
    const isInTimeSlot = availability.time_slots.some((slot) =>
      isWithinTimeSlot(slotInfo.start, slot)
    );
    return isCorrectDay && isInTimeSlot && availability.is_blocked;
  });

  return {
    isValid: !isBlocked,
    errors: isBlocked ? ['This time slot is blocked'] : [],
  };
};
