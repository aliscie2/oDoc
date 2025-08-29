import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/reducers";
import { AICasesService } from "../services/AICasesService";

export const useAICases = () => {
  const { calendar } = useSelector((state: RootState) => state.calendarState);
  const { currentJobId, jobs } = useSelector(
    (state: RootState) => state.jobState,
  );
  const { contracts, all_friends, profile } = useSelector(
    (state: RootState) => state.filesState,
  );

  const aiCasesService = useMemo(
    () =>
      new AICasesService(
        calendar,
        jobs,
        currentJobId,
        contracts,
        all_friends,
        profile,
      ),
    [calendar, jobs, currentJobId, contracts, all_friends, profile],
  );

  return {
    aiCases: aiCasesService.aiCases,
    getAICase: aiCasesService.getAICase.bind(aiCasesService),
  };
};
