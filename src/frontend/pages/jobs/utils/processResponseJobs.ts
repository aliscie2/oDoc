import JSON5 from "json5";
import { jsonrepair } from "jsonrepair";

export const textToJson = (response: string) => {
  let displayResponse = response;
  let extractedData = null;

  const jsonCandidates = extractJsonCandidates(response);

  for (const candidate of jsonCandidates) {
    const parsed = parseWithFallbacks(candidate);
    if (parsed) {
      extractedData = parsed;
      displayResponse = response.replace(candidate, "").trim();
      break;
    }
  }

  // Clean up display response
  if (displayResponse) {
    displayResponse = cleanDisplayResponse(displayResponse);
  }

  // Use feedback as fallback display text
  if (!displayResponse && extractedData?.feedback) {
    displayResponse = extractedData.feedback;
  }

  // Handle array responses
  if (Array.isArray(extractedData) && extractedData.length > 0) {
    const firstItem = extractedData[0];
    if (!displayResponse && firstItem?.feedback) {
      displayResponse = firstItem.feedback;
    }
  }

  // CRITICAL FIX: If extractedData is an array but looks like it should be part of a larger object,
  // try to find the full object in the response
  if (Array.isArray(extractedData) && extractedData.length > 0) {
    const firstItem = extractedData[0];
    // Check if this looks like an "updates" array (has field and values properties)
    if (firstItem && typeof firstItem === 'object' && 'field' in firstItem && 'values' in firstItem) {
      // Try to find and parse the full object containing this array
      const fullObjectCandidates = jsonCandidates.filter(candidate => {
        return candidate.includes('"updates"') || candidate.includes('"type"');
      });
      
      for (const candidate of fullObjectCandidates) {
        const parsed = parseWithFallbacks(candidate);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'updates' in parsed) {
          extractedData = parsed;
          break;
        }
      }
    }
  }

  return { displayResponse, extractedData };
};

// Extract JSON candidates using multiple patterns
function extractJsonCandidates(text: string): string[] {
  const candidates = new Set<string>();

  // 1. JSON code blocks
  const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    candidates.add(match[1].trim());
  }

  // 2. Balanced braces and brackets (handles nested structures)
  const balancedBraces = extractBalancedJson(text, "{", "}");
  const balancedBrackets = extractBalancedJson(text, "[", "]");

  balancedBraces.forEach((json) => candidates.add(json));
  balancedBrackets.forEach((json) => candidates.add(json));

  // Sort by priority: objects first (likely to be complete responses), then by length
  return Array.from(candidates).sort((a, b) => {
    const aIsObject = a.trim().startsWith('{');
    const bIsObject = b.trim().startsWith('{');
    
    // Prioritize objects over arrays
    if (aIsObject && !bIsObject) return -1;
    if (!aIsObject && bIsObject) return 1;
    
    // If both are same type, sort by length (longer first)
    return b.length - a.length;
  });
}

// Extract balanced JSON structures
function extractBalancedJson(
  text: string,
  openChar: string,
  closeChar: string,
): string[] {
  const results = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === openChar) {
      if (depth === 0) start = i;
      depth++;
    } else if (char === closeChar) {
      depth--;
      if (depth === 0 && start !== -1) {
        const candidate = text.substring(start, i + 1);
        if (candidate.length > 10) {
          // Filter out very short candidates
          results.push(candidate);
        }
        start = -1;
      }
    }
  }

  return results;
}

// Try multiple parsing strategies with fallbacks
function parseWithFallbacks(jsonText: string): unknown {
  const strategies = [
    // 1. Standard JSON.parse
    () => JSON.parse(jsonText),

    // 2. JSON5 (handles comments, trailing commas, unquoted keys)
    () => JSON5.parse(jsonText),

    // 3. Repair then parse with JSON
    () => {
      const repaired = jsonrepair(jsonText);
      return JSON.parse(repaired);
    },

    // 4. Repair then parse with JSON5
    () => {
      const repaired = jsonrepair(jsonText);
      return JSON5.parse(repaired);
    },

    // 5. Manual cleanup then parse
    () => {
      const cleaned = cleanJsonText(jsonText);
      return JSON.parse(cleaned);
    },
  ];

  for (const strategy of strategies) {
    try {
      const result = strategy();
      if (result !== null && result !== undefined) {
        return result;
      }
    } catch (error) {
      // Continue to next strategy
      continue;
    }
  }

  return null;
}

// Manual JSON cleanup for common issues
function cleanJsonText(text: string): string {
  return text
    .replace(/\/\/.*$/gm, "") // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/,(\s*[}\]])/g, "$1") // Remove trailing commas
    .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
    .replace(/:\s*'([^']*)'/g, ': "$1"') // Convert single quotes to double
    .replace(/\n|\r/g, "") // Remove newlines
    .trim();
}

// Clean up display response text
function cleanDisplayResponse(text: string): string {
  return text
    .replace(/```json[\s\S]*?```/g, "") // Remove JSON code blocks
    .replace(/[[\]{}]/g, "") // Remove stray brackets
    .replace(/^\s*[,.:;]\s*/, "") // Remove leading punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}
