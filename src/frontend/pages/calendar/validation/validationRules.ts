// Validation Rule Definitions

import {
  ValidationScenario,
  ValidationRuleSet,
  ValidationContext,
  ValidationResult,
} from "./validationTypes";
import {
  isPastTimeSlot,
  checkBlockedSlots,
  checkOwnerAvailability,
  checkUserAvailability,
  checkOwnerEventConflicts,
  checkUserEventConflicts,
  checkEventPermission,
  validateEventData,
} from "./validationHelpers";

/**
 * Wrapper for past time validation
 */
const checkPastTime = (context: ValidationContext): ValidationResult => {
  const isPast = isPastTimeSlot(context.slotInfo.start);
  return {
    isValid: !isPast,
    errors: isPast ? ["Cannot create events in the past"] : [],
  };
};

/**
 * Data-driven validation rules for all calendar scenarios
 */
export const VALIDATION_RULES: ValidationRuleSet = {
  // Scenario 1: Own Calendar + Google Connected
  [ValidationScenario.OWN_CALENDAR_GOOGLE]: [
    {
      name: "validate_event_data",
      description: "Event data must be complete and valid",
      validate: validateEventData,
      errorMessage: "Invalid event data",
    },
    {
      name: "check_past_time",
      description: "Cannot create events in the past",
      validate: checkPastTime,
      errorMessage: "Cannot create events in the past",
    },
  ],

  // Scenario 2: Own Calendar + Backend (No Google)
  [ValidationScenario.OWN_CALENDAR_BACKEND]: [
    {
      name: "validate_event_data",
      description: "Event data must be complete and valid",
      validate: validateEventData,
      errorMessage: "Invalid event data",
    },
    {
      name: "check_past_time",
      description: "Cannot create events in the past",
      validate: checkPastTime,
      errorMessage: "Cannot create events in the past",
    },
  ],

  // Scenario 3: Shared Calendar - Basic Viewer
  [ValidationScenario.SHARED_CALENDAR_BASIC]: [
    {
      name: "validate_event_data",
      description: "Event data must be complete and valid",
      validate: validateEventData,
      errorMessage: "Invalid event data",
    },
    {
      name: "check_past_time",
      description: "Cannot create events in the past",
      validate: checkPastTime,
      errorMessage: "Cannot create events in the past",
    },
    {
      name: "check_owner_availability",
      description: "Event must be within calendar owner availability",
      validate: checkOwnerAvailability,
      errorMessage:
        "This time slot is not available in the calendar owner's schedule",
    },
    {
      name: "check_blocked_slots",
      description: "Event must not be in blocked time slots",
      validate: checkBlockedSlots,
      errorMessage: "This time slot is blocked",
    },
    {
      name: "check_event_permission",
      description: "User must have permission to modify event",
      validate: checkEventPermission,
      errorMessage: "You do not have permission to modify this event",
    },
  ],

  // Scenario 4: Shared Calendar - Contributor (with conflict checking)
  [ValidationScenario.SHARED_CALENDAR_CONTRIBUTOR]: [
    {
      name: "validate_event_data",
      description: "Event data must be complete and valid",
      validate: validateEventData,
      errorMessage: "Invalid event data",
    },
    {
      name: "check_past_time",
      description: "Cannot create events in the past",
      validate: checkPastTime,
      errorMessage: "Cannot create events in the past",
    },
    {
      name: "check_owner_availability",
      description: "Event must be within calendar owner availability",
      validate: checkOwnerAvailability,
      errorMessage:
        "This time slot is not available in the calendar owner's schedule",
    },
    {
      name: "check_blocked_slots",
      description: "Event must not be in blocked time slots",
      validate: checkBlockedSlots,
      errorMessage: "This time slot is blocked",
    },
    {
      name: "check_owner_event_conflicts",
      description: "Event must not conflict with owner's existing events",
      validate: checkOwnerEventConflicts,
      errorMessage:
        "This time slot conflicts with an existing event on this calendar",
    },
    {
      name: "check_event_permission",
      description: "User must have permission to modify event",
      validate: checkEventPermission,
      errorMessage: "You do not have permission to modify this event",
    },
  ],

  // Scenario 5: Shared Calendar - Advanced (Dual Availability + Dual Conflict Checking)
  [ValidationScenario.SHARED_CALENDAR_ADVANCED]: [
    {
      name: "validate_event_data",
      description: "Event data must be complete and valid",
      validate: validateEventData,
      errorMessage: "Invalid event data",
    },
    {
      name: "check_past_time",
      description: "Cannot create events in the past",
      validate: checkPastTime,
      errorMessage: "Cannot create events in the past",
    },
    {
      name: "check_owner_availability",
      description: "Event must be within calendar owner availability",
      validate: checkOwnerAvailability,
      errorMessage:
        "This time slot is not available in the calendar owner's schedule",
    },
    {
      name: "check_user_availability",
      description: "Event must be within user's own availability",
      validate: checkUserAvailability,
      errorMessage: "This time slot is not available in your own schedule",
    },
    {
      name: "check_blocked_slots",
      description: "Event must not be in blocked time slots",
      validate: checkBlockedSlots,
      errorMessage: "This time slot is blocked",
    },
    {
      name: "check_owner_event_conflicts",
      description: "Event must not conflict with owner's existing events",
      validate: checkOwnerEventConflicts,
      errorMessage:
        "This time slot conflicts with an existing event on this calendar",
    },
    {
      name: "check_user_event_conflicts",
      description: "Event must not conflict with user's own events",
      validate: checkUserEventConflicts,
      errorMessage:
        "This time slot conflicts with an event on your own calendar",
    },
    {
      name: "check_event_permission",
      description: "User must have permission to modify event",
      validate: checkEventPermission,
      errorMessage: "You do not have permission to modify this event",
    },
  ],
};

/**
 * Get validation rules for a specific scenario
 */
export const getRulesForScenario = (scenario: ValidationScenario) => {
  return VALIDATION_RULES[scenario] || [];
};
