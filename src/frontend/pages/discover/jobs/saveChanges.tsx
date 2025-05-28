import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useBackendContext } from '@/contexts/BackendContext';
import { styled, keyframes, Dialog, DialogContent, CircularProgress, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import LoaderButton from '../../../components/MuiComponents/LoaderButton';
import { logger } from '@/DevUtils/logData';
import { JobUpdate } from '$/declarations/backend/backend.did';

// Define keyframes for the shake and scale animation
const shakeAndScaleAnimation = keyframes`
  0% { transform: translateX(0) scale(1); }
  10% { transform: translateX(-5px) scale(1.3); }
  20% { transform: translateX(5px) scale(1.3); }
  30% { transform: translateX(-5px) scale(1.3); }
  40% { transform: translateX(5px) scale(1.3); }
  50% { transform: translateX(-5px) scale(1.3); }
  60% { transform: translateX(5px) scale(1.3); }
  70% { transform: translateX(-5px) scale(1.3); }
  80% { transform: translateX(5px) scale(1.3); }
  90% { transform: translateX(-5px) scale(1.3); }
  100% { transform: translateX(0) scale(1); }
`;

// Styled component for the animated button wrapper
const AnimatedButtonWrapper = styled("div")`
  display: inline-block;
  &.shake {
    animation: ${shakeAndScaleAnimation} 1.2s cubic-bezier(0.36, 0, 0.66, -0.56);
    animation-fill-mode: forwards;
  }
`;

const SaveChanges: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showSavingDialog, setShowSavingDialog] = useState(false);
  const { backendActor } = useBackendContext();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const saveInProgress = useRef(false);
  
  // Get state directly from Redux
  const { jobChanges, isChanged, currentJobId, jobs } = useSelector((state: any) => state.jobState);

  const saveChanges = useCallback(async () => {
    if (!backendActor || jobChanges.length === 0 || saveInProgress.current) return { Ok: false };
    
    saveInProgress.current = true;
    setLoading(true);
    
    try {
      logger({jobChanges})
      const res = await backendActor.update_job(jobChanges);
      if (res?.Err) {
        enqueueSnackbar(res.Err, { variant: "error" });
        return { Ok: false, Err: res.Err };
      } else {
        enqueueSnackbar("Changes saved successfully", { variant: "success" });
        // Dispatch action to clear changes
        dispatch({ type: "CLEAR_CHANGES" });
        return { Ok: true };
      }
    } catch (err) {
      console.error({ err });
      const errorMessage = err instanceof Error ? err.message : "Failed to save changes";
      enqueueSnackbar(errorMessage, { variant: "error" });
      return { Ok: false, Err: errorMessage };
    } finally {
      setLoading(false);
      saveInProgress.current = false;
    }
  }, [backendActor, jobChanges, dispatch, enqueueSnackbar]);

  // Handle browser/tab close with auto-save
  // useEffect(() => {
  //   const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
  //     if (isChanged && jobChanges.length > 0) {
  //       e.preventDefault();
  //       e.returnValue = "You have unsaved changes. Please wait while we save them...";
        
  //       // Show saving dialog
  //       setShowSavingDialog(true);
        
  //       try {
  //         // Attempt to save changes
  //         const result = await saveChanges();
          
  //         // If save was successful, allow the tab to close
  //         if (result.Ok) {
  //           // Small delay to ensure the save completes
  //           setTimeout(() => {
  //             setShowSavingDialog(false);
  //             window.removeEventListener('beforeunload', handleBeforeUnload);
  //           }, 500);
  //         } else {
  //           // If save failed, keep the dialog open
  //           setShowSavingDialog(false);
  //         }
  //       } catch (error) {
  //         setShowSavingDialog(false);
  //         console.error("Error during auto-save:", error);
  //       }
  //     }
  //   };

  //   window.addEventListener("beforeunload", handleBeforeUnload);
  //   return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  // }, [isChanged, jobChanges, saveChanges]);

  const handleSave = useCallback(() => {
    saveChanges();
  }, [saveChanges]);

  return (
    <>
      <AnimatedButtonWrapper className="save-button-wrapper">
        <LoaderButton
          loading={loading}
          disabled={!isChanged || jobChanges.length === 0}
          onClick={handleSave}
          sx={{
            transition: "transform 0.3s ease-in-out",
            "&:not(:disabled):hover": {
              transform: "scale(1.05)",
            },
          }}
        >
          Save
        </LoaderButton>
      </AnimatedButtonWrapper>

      {/* Saving Dialog */}
      <Dialog open={showSavingDialog} disableEscapeKeyDown>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Saving changes...</Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we save your changes before closing.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SaveChanges;