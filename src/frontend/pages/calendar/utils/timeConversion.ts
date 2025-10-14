// Time Conversion Utilities

/**
 * Convert Date to nanoseconds (for storage)
 * Multiplies milliseconds by 1e6 to get nanoseconds
 */
export const convertToNanoseconds = (date: Date): bigint => {
  try {
    // Get hours and minutes
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Create a new Date at midnight
    const baseDate = new Date();
    baseDate.setHours(hours, minutes, 0, 0);

    // Convert to nanoseconds (multiply by 1e6 to match system format)
    return BigInt(baseDate.getTime() * 1e6);
  } catch (error) {
    console.error('Error converting to nanoseconds:', error);
    return BigInt(0);
  }
};

/**
 * Convert nanoseconds to Date (for display)
 * Divides nanoseconds by 1e6 to get milliseconds
 */
export const convertFromNanoseconds = (nanoseconds: bigint): Date => {
  try {
    // Convert from nanoseconds to milliseconds (divide by 1e6)
    const milliseconds = Number(nanoseconds) / 1e6;
    
    // Handle overflow - clamp to valid Date range
    const MAX_DATE = 8640000000000000; // Maximum valid Date value
    const clampedMs = Math.min(Math.max(milliseconds, 0), MAX_DATE);
    
    return new Date(clampedMs);
  } catch (error) {
    console.error('Error converting from nanoseconds:', error);
    return new Date();
  }
};

/**
 * Convert timestamp (milliseconds or nanoseconds) to Date
 * Automatically detects format based on magnitude
 */
export const timestampToDate = (timestamp: number | bigint): Date => {
  try {
    const numTimestamp = Number(timestamp);
    
    // If timestamp is very large, assume it's in nanoseconds
    if (numTimestamp > 1e15) {
      return convertFromNanoseconds(BigInt(timestamp));
    }
    
    // Otherwise, assume milliseconds
    return new Date(numTimestamp);
  } catch (error) {
    console.error('Error converting timestamp to date:', error);
    return new Date();
  }
};

/**
 * Format time from nanoseconds to HH:mm string
 */
export const formatTimeFromNanoseconds = (nanoseconds: bigint): string => {
  try {
    const date = convertFromNanoseconds(nanoseconds);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '00:00';
  }
};

/**
 * Parse HH:mm string to nanoseconds
 */
export const parseTimeToNanoseconds = (timeString: string): bigint => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return convertToNanoseconds(date);
  } catch (error) {
    console.error('Error parsing time string:', error);
    return BigInt(0);
  }
};
