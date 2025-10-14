// FreeBusy Hook
import { useState, useCallback, useRef } from "react";
import {
  fetchOwnerFreeBusy,
  convertFreeBusyToEvents,
  getFreeBusyTimeRange,
  FreeBusyTimeSlot,
  BlockedEvent,
} from "../utils/freeBusyApi";

interface UseFreeBusyReturn {
  busyTimes: FreeBusyTimeSlot[];
  blockedEvents: BlockedEvent[];
  isLoadingBusy: boolean;
  busyError: string | null;
  fetchFreeBusy: (ownerEmail: string, apiKey: string) => Promise<void>;
}

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const RATE_LIMIT_DELAY = 1000; // 1 second between requests

interface CacheEntry {
  data: FreeBusyTimeSlot[];
  timestamp: number;
}

export const useFreeBusy = (): UseFreeBusyReturn => {
  const [busyTimes, setBusyTimes] = useState<FreeBusyTimeSlot[]>([]);
  const [blockedEvents, setBlockedEvents] = useState<BlockedEvent[]>([]);
  const [isLoadingBusy, setIsLoadingBusy] = useState(false);
  const [busyError, setBusyError] = useState<string | null>(null);

  // Cache and rate limiting
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const lastRequestRef = useRef<number>(0);

  /**
   * Check if cached data is still valid
   */
  const isCacheValid = useCallback((cacheKey: string): boolean => {
    const cached = cacheRef.current.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    return now - cached.timestamp < CACHE_DURATION;
  }, []);

  /**
   * Get cached data if available and valid
   */
  const getCachedData = useCallback((cacheKey: string): FreeBusyTimeSlot[] | null => {
    if (isCacheValid(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      return cached ? cached.data : null;
    }
    return null;
  }, [isCacheValid]);

  /**
   * Set cache data
   */
  const setCacheData = useCallback((cacheKey: string, data: FreeBusyTimeSlot[]) => {
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Rate limiting check
   */
  const checkRateLimit = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestRef.current;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    lastRequestRef.current = Date.now();
  }, []);

  /**
   * Fetch FreeBusy data for owner's calendar
   */
  const fetchFreeBusy = useCallback(
    async (ownerEmail: string, apiKey: string) => {
      const cacheKey = `${ownerEmail}_${Math.floor(Date.now() / CACHE_DURATION)}`;

      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log("📦 [FreeBusy] Using cached data");
        setBusyTimes(cachedData);
        setBlockedEvents(convertFreeBusyToEvents(cachedData, ownerEmail));
        return;
      }

      setIsLoadingBusy(true);
      setBusyError(null);

      try {
        // Rate limiting
        await checkRateLimit();

        // Get time range (30 days ahead)
        const { timeMin, timeMax } = getFreeBusyTimeRange(30);

        // Fetch busy times
        const busyData = await fetchOwnerFreeBusy(
          ownerEmail,
          timeMin,
          timeMax,
          apiKey,
        );

        // Update state
        setBusyTimes(busyData);
        setBlockedEvents(convertFreeBusyToEvents(busyData, ownerEmail));

        // Cache the result
        setCacheData(cacheKey, busyData);
      } catch (error: any) {
        console.error("❌ [FreeBusy] Error in hook:", error);

        if (error.message === "CALENDAR_NOT_PUBLIC") {
          setBusyError(
            "This calendar is not public. Busy times cannot be displayed.",
          );
        } else {
          setBusyError("Failed to fetch busy times. Please try again later.");
        }

        // Clear data on error
        setBusyTimes([]);
        setBlockedEvents([]);
      } finally {
        setIsLoadingBusy(false);
      }
    },
    [getCachedData, setCacheData, checkRateLimit],
  );

  return {
    busyTimes,
    blockedEvents,
    isLoadingBusy,
    busyError,
    fetchFreeBusy,
  };
};
