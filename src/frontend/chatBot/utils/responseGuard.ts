/**
 * Response Guard - Validates and repairs AI responses to ensure they're always parseable
 *
 * This function acts as a safety net between AI responses and the JSON parser,
 * catching common AI mistakes and fixing them automatically.
 */

interface GuardResult {
  isValid: boolean;
  repairedResponse: string;
  issues: string[];
  originalResponse: string;
}

export class ResponseGuard {
  /**
   * Main guard function - validates and repairs AI response
   */
  static guard(aiResponse: string): GuardResult {
    const issues: string[] = [];
    let repairedResponse = aiResponse;

    repairedResponse = this.fixJavaScriptExpressions(repairedResponse, issues);
    repairedResponse = this.fixJsonStructure(repairedResponse, issues);
    repairedResponse = this.fixDateFormats(repairedResponse, issues);
    repairedResponse = this.fixTimeFormats(repairedResponse, issues);
    repairedResponse = this.fixStringConcatenation(repairedResponse, issues);
    repairedResponse = this.fixMissingQuotes(repairedResponse, issues);

    const isValid = this.validateFinalJson(repairedResponse);

    return {
      isValid,
      repairedResponse,
      issues,
      originalResponse: aiResponse,
    };
  }

  /**
   * Fix JavaScript expressions like "evt_" + Date.now()
   */
  private static fixJavaScriptExpressions(
    response: string,
    issues: string[],
  ): string {
    let fixed = response;

    // Fix "evt_" + Date.now() patterns
    const evtPattern = /"evt_"\s*\+\s*Date\.now\(\)/g;
    if (evtPattern.test(fixed)) {
      const timestamp = Date.now();
      fixed = fixed.replace(evtPattern, `"evt_${timestamp}"`);
      issues.push("Fixed evt_ + Date.now() expression");
    }

    // Fix "avail_" + Date.now() patterns
    const availPattern = /"avail_"\s*\+\s*Date\.now\(\)/g;
    if (availPattern.test(fixed)) {
      const timestamp = Date.now();
      fixed = fixed.replace(availPattern, `"avail_${timestamp}"`);
      issues.push("Fixed avail_ + Date.now() expression");
    }

    // Fix any other + concatenation patterns in JSON
    const concatPattern = /"([^"]+)"\s*\+\s*([^,}\]]+)/g;
    fixed = fixed.replace(concatPattern, (match, str1, str2) => {
      // Try to evaluate simple expressions
      if (str2.includes("Date.now()")) {
        const timestamp = Date.now();
        issues.push(`Fixed string concatenation: ${match}`);
        return `"${str1}${timestamp}"`;
      } else if (/^\d+$/.test(str2.trim())) {
        // Simple number concatenation
        issues.push(`Fixed string concatenation: ${match}`);
        return `"${str1}${str2.trim()}"`;
      }
      return match; // Leave unchanged if we can't fix it
    });

    return fixed;
  }

  /**
   * Fix JSON structure issues
   */
  private static fixJsonStructure(response: string, issues: string[]): string {
    let fixed = response;

    // Remove markdown code blocks
    if (fixed.includes("```json") || fixed.includes("```")) {
      fixed = fixed.replace(/```json\s*/g, "").replace(/```\s*/g, "");
      issues.push("Removed markdown code blocks");
    }

    // Fix trailing commas
    fixed = fixed.replace(/,(\s*[}\]])/g, "$1");
    if (fixed !== response && !issues.includes("Fixed trailing commas")) {
      issues.push("Fixed trailing commas");
    }

    // Fix missing commas between objects in arrays
    fixed = fixed.replace(/}\s*{/g, "}, {");
    if (
      fixed !== response &&
      !issues.includes("Added missing commas between objects")
    ) {
      issues.push("Added missing commas between objects");
    }

    return fixed;
  }

  /**
   * Fix date format issues
   */
  private static fixDateFormats(response: string, issues: string[]): string {
    let fixed = response;

    // Fix YYYY-MM-DD to DD-MM-YYYY format
    const isoDatePattern = /"date":\s*"(\d{4})-(\d{2})-(\d{2})"/g;
    fixed = fixed.replace(isoDatePattern, (match, year, month, day) => {
      issues.push(
        `Fixed date format from ${year}-${month}-${day} to ${day}-${month}-${year}`,
      );
      return `"date": "${day}-${month}-${year}"`;
    });

    // Fix MM/DD/YYYY to DD-MM-YYYY format
    const usDatePattern = /"date":\s*"(\d{1,2})\/(\d{1,2})\/(\d{4})"/g;
    fixed = fixed.replace(usDatePattern, (match, month, day, year) => {
      const paddedDay = day.padStart(2, "0");
      const paddedMonth = month.padStart(2, "0");
      issues.push(
        `Fixed date format from ${month}/${day}/${year} to ${paddedDay}-${paddedMonth}-${year}`,
      );
      return `"date": "${paddedDay}-${paddedMonth}-${year}"`;
    });

    return fixed;
  }

  /**
   * Fix time format issues
   */
  private static fixTimeFormats(response: string, issues: string[]): string {
    let fixed = response;

    // Fix 12-hour format to 24-hour format
    const time12Pattern =
      /"(start_time|end_time)":\s*"(\d{1,2}):(\d{2})\s*(AM|PM)"/gi;
    fixed = fixed.replace(
      time12Pattern,
      (match, field, hour, minute, period) => {
        let hour24 = parseInt(hour);
        if (period.toUpperCase() === "PM" && hour24 !== 12) {
          hour24 += 12;
        } else if (period.toUpperCase() === "AM" && hour24 === 12) {
          hour24 = 0;
        }
        const paddedHour = hour24.toString().padStart(2, "0");
        issues.push(
          `Fixed time format from ${hour}:${minute} ${period} to ${paddedHour}:${minute}`,
        );
        return `"${field}": "${paddedHour}:${minute}"`;
      },
    );

    // Fix single digit hours
    const singleHourPattern = /"(start_time|end_time)":\s*"(\d):(\d{2})"/g;
    fixed = fixed.replace(singleHourPattern, (match, field, hour, minute) => {
      const paddedHour = hour.padStart(2, "0");
      issues.push(
        `Fixed time format from ${hour}:${minute} to ${paddedHour}:${minute}`,
      );
      return `"${field}": "${paddedHour}:${minute}"`;
    });

    return fixed;
  }

  /**
   * Fix string concatenation issues
   */
  private static fixStringConcatenation(
    response: string,
    issues: string[],
  ): string {
    let fixed = response;

    // Fix unquoted string concatenation
    const unquotedConcatPattern = /:\s*([^"{[,}\]]+)\s*\+\s*([^,}\]]+)/g;
    fixed = fixed.replace(unquotedConcatPattern, (match, part1, part2) => {
      // Try to create a valid string
      const cleanPart1 = part1.trim().replace(/^["']|["']$/g, "");
      const cleanPart2 = part2.trim().replace(/^["']|["']$/g, "");

      if (cleanPart2.includes("Date.now()")) {
        const timestamp = Date.now();
        issues.push(`Fixed unquoted concatenation: ${match}`);
        return `: "${cleanPart1}${timestamp}"`;
      }

      return match; // Leave unchanged if we can't fix it
    });

    return fixed;
  }

  /**
   * Fix missing quotes around property names and values
   */
  private static fixMissingQuotes(response: string, issues: string[]): string {
    let fixed = response;

    // Fix unquoted property names
    const unquotedPropPattern = /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g;
    fixed = fixed.replace(unquotedPropPattern, (match, prefix, prop) => {
      if (!prop.match(/^(true|false|null|\d+)$/)) {
        issues.push(`Added quotes around property: ${prop}`);
        return `${prefix}"${prop}":`;
      }
      return match;
    });

    // Fix unquoted string values (be careful not to break numbers/booleans)
    const unquotedValuePattern =
      /:\s*([a-zA-Z][a-zA-Z0-9_\s]*[a-zA-Z0-9])\s*([,}\]])/g;
    fixed = fixed.replace(unquotedValuePattern, (match, value, suffix) => {
      // Don't quote boolean or null values
      if (!value.match(/^(true|false|null)$/)) {
        issues.push(`Added quotes around value: ${value}`);
        return `: "${value.trim()}"${suffix}`;
      }
      return match;
    });

    return fixed;
  }

  /**
   * Validate that the final JSON is parseable
   */
  private static validateFinalJson(response: string): boolean {
    try {
      // Try to extract and parse JSON
      const jsonCandidates = this.extractJsonCandidates(response);

      for (const candidate of jsonCandidates) {
        try {
          JSON.parse(candidate);
          return true; // At least one valid JSON found
        } catch (e) {
          continue;
        }
      }

      return false; // No valid JSON found
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract potential JSON candidates from response
   */
  private static extractJsonCandidates(text: string): string[] {
    const candidates = new Set<string>();

    // Look for array patterns
    const arrayPattern = /\[[\s\S]*?\]/g;
    let match;
    while ((match = arrayPattern.exec(text)) !== null) {
      candidates.add(match[0]);
    }

    // Look for object patterns
    const objectPattern = /\{[\s\S]*?\}/g;
    while ((match = objectPattern.exec(text)) !== null) {
      candidates.add(match[0]);
    }

    return Array.from(candidates).sort((a, b) => b.length - a.length);
  }

  /**
   * Generate a fallback response for calendar actions when AI fails completely
   */
  static generateFallbackResponse(userMessage: string): string {
    // Simple keyword detection for fallback
    const message = userMessage.toLowerCase();

    if (
      message.includes("create") ||
      message.includes("add") ||
      message.includes("schedule")
    ) {
      return JSON.stringify([
        {
          feedback:
            "I understand you want to create an event, but I had trouble processing your request. Please try again with more specific details like 'Create meeting tomorrow at 2 PM'.",
          data: {
            type: "CALENDAR_QUERY",
          },
        },
      ]);
    }

    if (
      message.includes("delete") ||
      message.includes("remove") ||
      message.includes("cancel")
    ) {
      return JSON.stringify([
        {
          feedback:
            "I understand you want to delete an event, but I had trouble processing your request. Please try again or delete the event manually from the calendar.",
          data: {
            type: "CALENDAR_QUERY",
          },
        },
      ]);
    }

    // Default fallback
    return JSON.stringify([
      {
        feedback:
          "I had trouble understanding your request. Please try rephrasing it or use the calendar interface directly.",
        data: {
          type: "CALENDAR_QUERY",
        },
      },
    ]);
  }
}

export default ResponseGuard;
