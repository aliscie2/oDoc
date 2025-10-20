import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { backendActor } from "@/utils/backendUtils";

import serializeFileContents from "@/DataProcessing/serialize/serializeFileContents";
import {
  ContractUpdates,
  FileIndexing,
  FileNode,
} from "$/declarations/backend/backend.did";
import { InitialState } from "@/redux/types/filesTypes";

interface SaveError {
  module: "docs" | "calendar" | "jobs";
  error: string;
}

interface UseDocsSaveReturn {
  isChanged: boolean;
  loading: boolean;
  save: () => Promise<void>;
  reset: () => Promise<void>;
  lastError: SaveError | null;
}

/**
 * Checks for released payments and confirms with the user if they want to proceed
 * @param contracts_updates Array of ContractUpdates to check
 * @returns Processed contracts_updates (with released payments removed if user declined)
 */
function confirmReleasedPayments(
  contracts_updates: ContractUpdates[],
  enqueueSnackbar: (message: string) => void,
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
  const [lastError, setLastError] = useState<SaveError | null>(null);
  const dispatch = useDispatch();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  // Using direct backendActor import

  const changes = useSelector(
    (state: { filesState: InitialState }) => state.filesState.changes,
  );

  const isChanged = !(
    Object.keys(changes.contents).length === 0 &&
    changes.files.length === 0 &&
    (Array.isArray(changes.contracts)
      ? changes.contracts.length === 0
      : Object.keys(changes.contracts).length === 0) &&
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const serializedContent = serializeFileContents(
        changes.contents as unknown as any[],
      );

      // Ensure changes.contracts is an array before processing
      const contractsArray = Array.isArray(changes.contracts)
        ? changes.contracts
        : [];

      const processedContracts = confirmReleasedPayments(
        contractsArray,
        enqueueSnackbar,
      );

      // Filter out file indexing entries for files that don't exist in changes.files
      const fileIds = new Set(changes.files.map((f: FileNode) => f.id));
      const validFileIndexing = (changes.files_indexing || []).filter(
        (indexing: FileIndexing) => fileIds.has(indexing.id),
      );

      const res = await backendActor.multi_updates(
        changes.files,
        serializedContent,
        processedContracts,
        validFileIndexing,
      );

      if ("Ok" in res && res.Ok.includes("Error")) {
        const errorMsg = res.Ok;
        setLastError({ module: "docs", error: errorMsg });
        enqueueSnackbar(errorMsg, { variant: "error" });
        throw new Error(errorMsg);
      } else if ("Err" in res) {
        const errorMsg = res.Err;
        setLastError({ module: "docs", error: errorMsg });
        enqueueSnackbar(errorMsg, { variant: "error" });
        throw new Error(errorMsg);
      } else {
        setLastError(null);
        enqueueSnackbar("Documents saved successfully!", {
          variant: "success",
        });
        dispatch({ type: "RESOLVE_CHANGES" });
      }
    } catch (error) {
      console.error("Error saving documents:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to save documents";
      setLastError({ module: "docs", error: errorMsg });
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
    if (!backendActor) {
      enqueueSnackbar("Failed to reset: Backend not available", {
        variant: "error",
      });
      return;
    }

    try {
      // Clear local changes first
      dispatch({ type: "RESOLVE_CHANGES" });

      // Fetch fresh data from backend
      const filesRes = await backendActor.get_all_files();

      // Fetch file contents
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contentsMap: Record<string, any> = {};

      for (const file of filesRes) {
        try {
          const content = await backendActor.get_file_content(file.id);
          contentsMap[file.id] = content;
        } catch (error) {
          console.warn(`Failed to fetch content for file ${file.id}:`, error);
        }
      }

      // Replace files and contents in Redux (not append)
      dispatch({
        type: "REPLACE_FILES_AND_CONTENTS",
        files: filesRes,
        files_content: contentsMap,
      });

      setLastError(null);
      enqueueSnackbar("Documents reset successfully!", {
        variant: "info",
      });
    } catch (error) {
      console.error("Error resetting documents:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to reset documents";
      enqueueSnackbar(errorMsg, { variant: "error" });
      throw error;
    }
  }, [dispatch, enqueueSnackbar, backendActor]);

  return {
    isChanged,
    loading,
    save,
    reset,
    lastError,
  };
};

export type { SaveError };
