import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/reducers";
import { AICasesService } from "../services/AICasesService";

export const useAICases = () => {
  const { calendar, google_events, is_google_connected } = useSelector(
    (state: RootState) => state.calendarState,
  );
  const { currentJobId, jobs } = useSelector(
    (state: RootState) => state.jobState,
  );
  const { contracts, all_friends, profile } = useSelector(
    (state: RootState) => state.filesState,
  );

  // Extract primitive values for stable dependencies
  const calendarId = calendar?.id;
  const calendarEventsCount = calendar?.events?.length || 0;
  const googleEventsCount = google_events?.length || 0;
  const profileId = profile?.id;
  const jobsCount = jobs?.length || 0;
  const friendsCount = all_friends?.length || 0;

  const aiCasesService = useMemo(
    () => {
      // Only log in development and when debug is enabled
      if (process.env.NODE_ENV === 'development' && localStorage.getItem('debug') === 'true') {
        console.log("🏗️ Creating AICasesService");
      }

      return new AICasesService(
        calendar,
        jobs,
        currentJobId,
        contracts,
        all_friends,
        profile,
        google_events || [],
        is_google_connected || false,
      );
    },
    [
      // Use primitive values instead of objects to prevent unnecessary re-creation
      calendarId,
      calendarEventsCount,
      googleEventsCount,
      currentJobId,
      profileId,
      jobsCount,
      friendsCount,
      is_google_connected,
      // Still include the actual objects so the service has access to them
      calendar,
      jobs,
      contracts,
      all_friends,
      profile,
      google_events,
    ],
  );

  return {
    aiCases: aiCasesService.aiCases,
    getAICase: aiCasesService.getAICase.bind(aiCasesService),
  };
};
