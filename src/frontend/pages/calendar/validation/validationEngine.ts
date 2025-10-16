// Validation Engine - Core validation orchestration

import {
  ValidationContext,
  ValidationResult,
  ValidationScenario,
} from "./validationTypes";
import { getRulesForScenario } from "./validationRules";

/**
 * Main Validation Engine
 * Determines scenario and executes appropriate validation rules
 */
export class ValidationEngine {
  /**
   * Determine which validation scenario applies
   */
  static determineScenario(context: ValidationContext): ValidationScenario {
    const { calendar, profile, isGoogleConnected, userCalendar } = context;

    const isSharedCalendar = calendar.owner !== profile.id;

    // Own calendar scenarios
    if (!isSharedCalendar) {
      if (isGoogleConnected) {
        return ValidationScenario.OWN_CALENDAR_GOOGLE;
      }
      return ValidationScenario.OWN_CALENDAR_BACKEND;
    }

    // Shared calendar scenarios
    // Scenario 5: Advanced - User has their own calendar for dual validation
    if (isSharedCalendar && userCalendar) {
      return ValidationScenario.SHARED_CALENDAR_ADVANCED;
    }

    // Scenario 4: Contributor - Check for event conflicts
    if (isSharedCalendar && calendar.events && calendar.events.length > 0) {
      return ValidationScenario.SHARED_CALENDAR_CONTRIBUTOR;
    }

    // Scenario 3: Basic viewer
    return ValidationScenario.SHARED_CALENDAR_BASIC;
  }

  /**
   * Validate event creation/update based on context
   */
  static validate(context: ValidationContext): ValidationResult {
    const scenario = this.determineScenario(context);
    const rules = getRulesForScenario(scenario);

    console.log("🔍 [ValidationEngine] Scenario:", scenario);
    console.log("🔍 [ValidationEngine] Rules to apply:", rules.length);

    const errors: string[] = [];
    const warnings: string[] = [];

    // Execute each rule in sequence
    for (const rule of rules) {
      console.log(`  ⚡ Executing rule: ${rule.name}`);

      try {
        const result = rule.validate(context);

        if (!result.isValid) {
          console.log(`    ❌ Rule failed: ${rule.name}`);
          errors.push(...result.errors);
        } else {
          console.log(`    ✅ Rule passed: ${rule.name}`);
        }

        if (result.warnings && result.warnings.length > 0) {
          warnings.push(...result.warnings);
        }
      } catch (error) {
        console.error(`    💥 Rule execution error: ${rule.name}`, error);
        errors.push(`Validation error: ${rule.name}`);
      }
    }

    const isValid = errors.length === 0;

    console.log("🔍 [ValidationEngine] Result:", {
      isValid,
      errorCount: errors.length,
      warningCount: warnings.length,
    });

    return {
      isValid,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Quick validation check - returns boolean only
   */
  static isValid(context: ValidationContext): boolean {
    const result = this.validate(context);
    return result.isValid;
  }

  /**
   * Get first validation error message
   */
  static getFirstError(context: ValidationContext): string | null {
    const result = this.validate(context);
    return result.errors.length > 0 ? result.errors[0] : null;
  }

  /**
   * Get all validation errors as a formatted string
   */
  static getErrorMessage(context: ValidationContext): string {
    const result = this.validate(context);
    if (result.errors.length === 0) {
      return "";
    }
    if (result.errors.length === 1) {
      return result.errors[0];
    }
    return "• " + result.errors.join("\n• ");
  }
}

/**
 * Convenience function for quick validation
 */
export const validateEvent = (context: ValidationContext): ValidationResult => {
  return ValidationEngine.validate(context);
};

/**
 * Convenience function to check if event is valid
 */
export const isEventValid = (context: ValidationContext): boolean => {
  return ValidationEngine.isValid(context);
};
