import { useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useBackendContext } from '@/contexts/BackendContext';
// import { logger } from '../DevUtils/logData';

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
  
  // Get state directly from Redux
  const { jobChanges, isChanged, currentJobId, jobs } = useSelector((state: any) => state.jobState);

  const save = useCallback(async () => {
    if (!backendActor || jobChanges.length === 0 || saveInProgress.current || !isChanged) return;
    
    saveInProgress.current = true;
    setLoading(true);
    
    try {
    //   logger({ jobChanges });
      const res = await backendActor.update_job(jobChanges);
      
      if (res?.Err) {
        enqueueSnackbar(res.Err, { variant: "error" });
        throw new Error(res.Err);
      } else {
        enqueueSnackbar("Job changes saved successfully!", { variant: "success" });
        // Dispatch action to clear changes
        dispatch({ type: "CLEAR_CHANGES" });
      }
    } catch (error) {
      console.error({ saveJobsError: error });
      const errorMessage = error instanceof Error ? error.message : "Failed to save job changes";
      enqueueSnackbar(errorMessage, { variant: "error" });
      throw error;
    } finally {
      setLoading(false);
      saveInProgress.current = false;
    }
  }, [backendActor, jobChanges, isChanged, dispatch, enqueueSnackbar]);

  const reset = useCallback(async () => {
    try {
      // Reset job changes
      dispatch({ type: "RESET_JOB_CHANGES" });
      enqueueSnackbar("Job changes reset successfully!", { variant: "info" });
    } catch (error) {
      console.error({ resetJobsError: error });
      enqueueSnackbar("Failed to reset job changes", { variant: "error" });
      throw error;
    }
  }, [dispatch, enqueueSnackbar]);

  return {
    isChanged,
    loading,
    save,
    reset,
  };
};