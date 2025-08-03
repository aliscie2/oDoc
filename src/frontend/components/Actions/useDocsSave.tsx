import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { useBackendContext } from "@/contexts/BackendContext";

import serializeFileContents from "@/DataProcessing/serialize/serializeFileContents";
import { ContractUpdates } from "$/declarations/backend/backend.did";

interface UseDocsSaveReturn {
  isChanged: boolean;
  loading: boolean;
  save: () => Promise<void>;
  reset: () => Promise<void>;
}

/**
 * Checks for released payments and confirms with the user if they want to proceed
 * @param contracts_updates Array of ContractUpdates to check
 * @returns Processed contracts_updates (with released payments removed if user declined)
 */
function confirmReleasedPayments(
  contracts_updates: ContractUpdates[],
  enqueueSnackbar: any,
): ContractUpdates[] {
  const total = contracts_updates.reduce(
    (sum, update) =>
      sum +
      update.promises
        .filter((p) => "Released" in p.status)
        .reduce((pSum, p) => pSum + p.amount, 0),
    0,
  );

  if (total === 0) return contracts_updates;

  if (
    !confirm(`Are you sure you want to release payments totaling ${total}?`)
  ) {
    enqueueSnackbar(`Reset payments`);
    return contracts_updates.map((update) => ({
      ...update,
      promises: update.promises.filter((p) => !("Released" in p.status)),
    }));
  }

  return contracts_updates;
}

export const useDocsSave = (): UseDocsSaveReturn => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { backendActor } = useBackendContext();

  const changes = useSelector((state: any) => state.filesState.changes);

  const isChanged = !(
    Object.keys(changes.contents).length === 0 &&
    changes.files.length === 0 &&
    Object.keys(changes.contracts).length === 0 &&
    changes.files_indexing.length === 0
  );

  const save = useCallback(async () => {
    if (!backendActor || !isChanged) return;

    setLoading(true);
    const loadingSnackbar = enqueueSnackbar(
      <span>
        Process saving... <span className="loader" />
      </span>,
    );

    try {
      const serializedContent = serializeFileContents(changes.contents);
      const processedContracts = await confirmReleasedPayments(
        changes.contracts,
        enqueueSnackbar,
      );
      const res: any = await backendActor.multi_updates(
        changes.files,
        serializedContent,
        processedContracts,
        changes.files_indexing || [],
      );

      if (res?.Ok && res.Ok.includes("Error")) {
        enqueueSnackbar(res.Ok, { variant: "error" });
        throw new Error(res.Ok);
      } else if (res?.Err) {
        enqueueSnackbar(res.Err, { variant: "error" });
        throw new Error(res.Err);
      } else {
        enqueueSnackbar("Documents saved successfully!", {
          variant: "success",
        });
        dispatch({ type: "RESOLVE_CHANGES" });
      }
    } catch (error) {
      console.error({ saveDocsError: error });
      throw error;
    } finally {
      closeSnackbar(loadingSnackbar);
      setLoading(false);
    }
  }, [
    backendActor,
    changes,
    dispatch,
    enqueueSnackbar,
    closeSnackbar,
    isChanged,
  ]);

  const reset = useCallback(async () => {
    try {
      // Reset all changes in the files state
      dispatch({ type: "RESOLVE_CHANGES" });
      const res = await backendActor?.get_initial_data();
      res &&
        dispatch({
          type: "INIT_FILES_STATE",
          data: { ...res.Ok },
        });
      enqueueSnackbar("Document changes reset successfully!", {
        variant: "info",
      });
    } catch (error) {
      console.error({ resetDocsError: error });
      enqueueSnackbar("Failed to reset document changes", { variant: "error" });
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
