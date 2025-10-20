import { Job } from "$/declarations/backend/backend.did";
import { backendActor } from "@/utils/backendUtils";
import { useSnackbar } from "notistack";
import { useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface SaveError {
  module: "docs" | "calendar" | "jobs";
  error: string;
}

interface UseJobsSaveReturn {
  isChanged: boolean;
  loading: boolean;
  save: () => Promise<void>;
  reset: () => Promise<void>;
  lastError: SaveError | null;
}

export const useJobsSave = (): UseJobsSaveReturn => {
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<SaveError | null>(null);
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  // Using direct backendActor import
  const saveInProgress = useRef(false);
  const { jobChanges, isChanged } = useSelector((state: any) => state.jobState);
  const { credits } = useSelector((state: any) => state.AIState);

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
      const res = await backendActor.update_job(jobChanges, [credits]);

      if (res?.Err) {
        const errorMsg = res.Err;
        setLastError({ module: "jobs", error: errorMsg });
        enqueueSnackbar(errorMsg, { variant: "error" });
        throw new Error(errorMsg);
      }

      setLastError(null);
      enqueueSnackbar("Job changes saved successfully!", {
        variant: "success",
      });
      dispatch({ type: "CLEAR_JOB_CHANGES" });
    } catch (error) {
      console.error({ saveJobsError: error });
      const errorMsg =
        error instanceof Error ? error.message : "Failed to save job changes";
      setLastError({ module: "jobs", error: errorMsg });
      enqueueSnackbar(errorMsg, { variant: "error" });
      throw error;
    } finally {
      setLoading(false);
      saveInProgress.current = false;
    }
  }, [backendActor, jobChanges, isChanged, dispatch, enqueueSnackbar, credits]);

  const reset = async () => {
    try {
      // Reset job changes
      const updateJobRes = await backendActor.update_job([], [credits]);

      if (updateJobRes?.Err) {
        enqueueSnackbar(updateJobRes.Err, { variant: "error" });
        throw new Error(updateJobRes.Err);
      }
      dispatch({ type: "RESET_AI_CREDITS", credits });
      dispatch({ type: "CLEAR_JOB_CHANGES" });

      const res: { jobs: Job[]; matching_jobs: Job[] } =
        await backendActor.get_my_jobs();
      dispatch({
        type: "INIT_JOBS",
        jobs: res.jobs,
        matchingJobs: res.matching_jobs,
      });

      setLastError(null);
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
    lastError,
  };
};
