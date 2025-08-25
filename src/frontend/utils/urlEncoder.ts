/**
 * URL encoding utilities with compression pipeline
 * Pipeline: Raw data → UTF8 → Compression (LZW) → Base64 → URL-safe encoding
 */

export interface ContractUrlParams {
  id: string;
  owner: string;
}

/**
 * Simple LZW compression implementation
 */
function lzwCompress(data: string): number[] {
  const dictionary: { [key: string]: number } = {};
  let dictSize = 256;

  // Initialize dictionary with single characters
  for (let i = 0; i < 256; i++) {
    dictionary[String.fromCharCode(i)] = i;
  }

  let w = "";
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const c = data.charAt(i);
    const wc = w + c;

    if (dictionary[wc] !== undefined) {
      w = wc;
    } else {
      result.push(dictionary[w]);
      dictionary[wc] = dictSize++;
      w = c;
    }
  }

  if (w !== "") {
    result.push(dictionary[w]);
  }

  return result;
}

/**
 * Simple LZW decompression implementation
 */
function lzwDecompress(compressed: number[]): string {
  const dictionary: { [key: number]: string } = {};
  let dictSize = 256;

  // Initialize dictionary with single characters
  for (let i = 0; i < 256; i++) {
    dictionary[i] = String.fromCharCode(i);
  }

  let w = String.fromCharCode(compressed[0]);
  let result = w;

  for (let i = 1; i < compressed.length; i++) {
    const k = compressed[i];
    let entry: string;

    if (dictionary[k] !== undefined) {
      entry = dictionary[k];
    } else if (k === dictSize) {
      entry = w + w.charAt(0);
    } else {
      throw new Error("Invalid compressed data");
    }

    result += entry;
    dictionary[dictSize++] = w + entry.charAt(0);
    w = entry;
  }

  return result;
}

/**
 * Convert number array to binary string for Base64 encoding
 */
function numberArrayToBase64(numbers: number[]): string {
  // Convert numbers to bytes (assuming numbers fit in 16 bits)
  const bytes: number[] = [];
  for (const num of numbers) {
    bytes.push((num >> 8) & 0xff); // High byte
    bytes.push(num & 0xff); // Low byte
  }

  // Convert bytes to string for btoa
  const binaryString = String.fromCharCode(...bytes);
  return btoa(binaryString);
}

/**
 * Convert Base64 string back to number array
 */
function base64ToNumberArray(base64: string): number[] {
  const binaryString = atob(base64);
  const numbers: number[] = [];

  // Convert pairs of bytes back to numbers
  for (let i = 0; i < binaryString.length; i += 2) {
    if (i + 1 < binaryString.length) {
      const high = binaryString.charCodeAt(i);
      const low = binaryString.charCodeAt(i + 1);
      numbers.push((high << 8) | low);
    }
  }

  return numbers;
}

/**
 * Encodes contract parameters using compression pipeline
 * Pipeline: Raw data → UTF8 → Compression (LZW) → Base64 → URL-safe encoding
 */
export function encodeContractUrl(params: ContractUrlParams): string {
  try {
    // Step 1: Raw data → UTF8 (JSON string is already UTF8)
    const jsonData = JSON.stringify([params.id, params.owner]);

    // Step 2: UTF8 → Compression (LZW)
    const compressed = lzwCompress(jsonData);

    // Step 3: Compression → Base64
    const base64 = numberArrayToBase64(compressed);

    // Step 4: Base64 → URL-safe encoding
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } catch (error) {
    console.error("Failed to encode contract URL:", error);
    // Fallback to simple encoding
    return btoa(JSON.stringify([params.id, params.owner]))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }
}

/**
 * Decodes URL-safe string back to contract parameters
 * Reverses the pipeline: URL-safe → Base64 → Decompression (LZW) → UTF8 → Raw data
 */
export function decodeContractUrl(encoded: string): ContractUrlParams | null {
  try {
    // Handle legacy format first (contains 'i=' and 'o=')
    if (encoded.includes("i=") && encoded.includes("o=")) {
      const params = new URLSearchParams(encoded);
      const id = params.get("i");
      const owner = params.get("o");

      if (!id || !owner) {
        return null;
      }

      return { id, owner };
    }

    // Step 1: URL-safe → Base64
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4) {
      base64 += "=";
    }

    try {
      // Step 2: Base64 → Decompression (try LZW first)
      const compressed = base64ToNumberArray(base64);

      // Step 3: Decompression (LZW) → UTF8
      const jsonData = lzwDecompress(compressed);

      // Step 4: UTF8 → Raw data
      const parsed = JSON.parse(jsonData);

      // Expect array format [id, owner]
      if (Array.isArray(parsed) && parsed.length === 2) {
        return { id: parsed[0], owner: parsed[1] };
      }
    } catch (lzwError) {
      // Fallback to simple Base64 decoding (for backward compatibility)
      try {
        const data = atob(base64);
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed) && parsed.length === 2) {
          return { id: parsed[0], owner: parsed[1] };
        }
      } catch (fallbackError) {
        console.error("Both LZW and fallback decoding failed:", {
          lzwError,
          fallbackError,
        });
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to decode contract URL:", error);
    return null;
  }
}

/**
 * Creates a contract URL using query parameter format with compressed data
 */
export function createShortContractUrl(
  params: ContractUrlParams,
  origin: string = window.location.origin,
): string {
  const encoded = encodeContractUrl(params);
  return `${origin}/contract?data=${encoded}`;
}

/**
 * Parses contract parameters from URL
 * Supports new query format (/contract?data=encoded), legacy formats, and old formats
 */
export function parseContractUrlParams(url?: string): ContractUrlParams | null {
  const currentUrl = url || window.location.href;
  const urlObj = new URL(currentUrl);
  const searchParams = urlObj.searchParams;

  // Check for new compressed data format: /contract?data={encoded}
  const dataParam = searchParams.get("data");
  if (dataParam) {
    const decoded = decodeContractUrl(dataParam);
    if (decoded) {
      return decoded;
    }
  }

  // Check for legacy Base64 format: /c/{encoded}
  if (urlObj.pathname.startsWith("/c/")) {
    const encoded = urlObj.pathname.substring(3); // Remove '/c/'
    if (encoded) {
      const decoded = decodeContractUrl(encoded);
      if (decoded) {
        return decoded;
      }
    }
  }

  // Check for legacy query format: /c?i=...&o=...
  if (urlObj.pathname === "/c") {
    const queryString = urlObj.search.substring(1); // Remove '?'
    if (queryString) {
      const decoded = decodeContractUrl(queryString);
      if (decoded) {
        return decoded;
      }
    }
  }

  // Fallback to old legacy format: ?id=...&owner=...
  const id = searchParams.get("id");
  const owner = searchParams.get("owner");

  if (id && owner) {
    return { id, owner };
  }

  return null;
}
