import { useCallback, useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { useBackendContext } from "@/contexts/BackendContext";
import { Job } from "$/declarations/backend/backend.did";

interface UseJobsSaveReturn {
  isChanged: boolean;
  loading: boolean;
  save: () => Promise<void>;
  reset: () => Promise<void>;
}

export const useJobsSave = (): UseJobsSaveReturn => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { backendActor } = useBackendContext();
  const saveInProgress = useRef(false);
  const [aiCreditsChangd, setChangedAICredits] = useState(false);
  const { jobChanges, isChanged } = useSelector((state: any) => state.jobState);
  const { credits, initialCredits, aiAgent } = useSelector(
    (state: any) => state.AIState,
  );

  // Get state directly from Redux

  const save = useCallback(async () => {
    if (
      !backendActor ||
      jobChanges.length === 0 ||
      saveInProgress.current ||
      !isChanged
    )
      return;

    saveInProgress.current = true;
    setLoading(true);

    try {
      const res = await backendActor.update_job(jobChanges, [
        aiAgent.remainingCredits(),
      ]);

      if (res?.Err) {
        enqueueSnackbar(res.Err, { variant: "error" });
        throw new Error(res.Err);
      } else {
        enqueueSnackbar("Job changes saved successfully!", {
          variant: "success",
        });
        // Dispatch action to clear changes
        dispatch({ type: "CLEAR_JOB_CHANGES" });
      }
    } catch (error) {
      console.error({ saveJobsError: error });
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save job changes";
      enqueueSnackbar(errorMessage, { variant: "error" });
      throw error;
    } finally {
      setLoading(false);
      saveInProgress.current = false;
    }
  }, [backendActor, jobChanges, isChanged, dispatch, enqueueSnackbar]);

  const reset = async () => {
    try {
      // Reset job changes
      const remainingCredits = aiAgent?.remainingCredits();

      if (remainingCredits < initialCredits) {
        const res = await backendActor.update_job(
          [],
          [aiAgent.remainingCredits()],
        );

        if (res?.Err) {
          enqueueSnackbar(res.Err, { variant: "error" });
          throw new Error(res.Err);
        }
        dispatch({ type: "RESET_AI_CREDITS", credits: remainingCredits });
      }
      dispatch({ type: "CLEAR_JOB_CHANGES" });

      const res: { jobs: Job[]; matching_jobs: Job[] } =
        await backendActor.get_my_jobs();
      dispatch({
        type: "INIT_JOBS",
        jobs: res.jobs,
        matchingJobs: res.matching_jobs,
      });

      enqueueSnackbar("Job changes reset successfully!", { variant: "info" });
    } catch (error) {
      console.error({ resetJobsError: error });
      enqueueSnackbar("Failed to reset job changes", { variant: "error" });
      throw error;
    }
  };

  return {
    isChanged,
    loading,
    save,
    reset,
  };
};
