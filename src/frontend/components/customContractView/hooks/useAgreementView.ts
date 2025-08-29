import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Principal } from "@dfinity/principal";
import { useSnackbar } from "notistack";
import {
  CPayment,
  CustomContract,
  Friend,
  Notification,
} from "$/declarations/backend/backend.did";
import { createNewPromis } from "../utils";

interface AppState {
  filesState: {
    profile: { id: string; name: string };
    all_friends: Friend[];
    wallet: { balance: number };
    contracts: Record<string, { promises: CPayment[] }>;
  };
  notificationState: {
    notifications: Notification[];
  };
}

export const useAgreementView = (contract: CustomContract) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { profile } = useSelector((state: AppState) => state.filesState);

  const [expandedCards, setExpandedCards] = useState(new Set<string>());
  const [viewMode, setViewMode] = useState<"promises" | "payments">("promises");

  // Filter toggle state - load from localStorage
  const [hideReceivedPromises, setHideReceivedPromises] = useState(() => {
    const saved = localStorage.getItem("hideReceivedPromises");
    return saved ? JSON.parse(saved) : false;
  });

  // Save filter state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "hideReceivedPromises",
      JSON.stringify(hideReceivedPromises),
    );
  }, [hideReceivedPromises]);

  // Computed values
  const isOnContractPage = location.pathname === "/contract";
  const isCreator = profile.id === contract.creator?.toString();

  const filteredPromises = useMemo(() => {
    if (viewMode !== "promises" || !contract.promises) return contract.promises;

    if (contract.creator?.toString() !== profile.id && hideReceivedPromises) {
      return contract.promises.filter(
        (p) => p.receiver.toText() === profile.id,
      );
    }

    return contract.promises;
  }, [
    contract.promises,
    contract.creator,
    profile.id,
    viewMode,
    hideReceivedPromises,
  ]);

  const currentData =
    viewMode === "promises" ? filteredPromises : contract.payments;
  const isEditable = viewMode === "promises" && isCreator;

  // Function to check if user can edit status for a specific promise
  const canEditStatus = useCallback(
    (promise: CPayment) => {
      if (viewMode !== "promises") return false;
      const isPromiseSender = profile.id === promise.sender.toString();
      const isPromiseReceiver = profile.id === promise.receiver.toString();
      return isPromiseSender || isPromiseReceiver;
    },
    [viewMode, profile.id],
  );

  // Event handlers
  const toggleCard = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddPromise = useCallback(() => {
    if (!isEditable) return;
    dispatch({
      type: "ADD_PROMISE",
      contract_id: contract.id,
      promise: createNewPromis(Principal.fromText(profile.id), contract.id),
      insertIndex: contract.promises?.length || 0,
    });
  }, [dispatch, contract, profile.id, isEditable]);

  const handleViewModeChange = useCallback(
    (
      _: React.MouseEvent<HTMLElement>,
      newMode: "promises" | "payments" | null,
    ) => {
      if (newMode !== null) setViewMode(newMode);
    },
    [],
  );

  return {
    // State
    expandedCards,
    viewMode,
    hideReceivedPromises,
    setHideReceivedPromises,

    // Computed
    isOnContractPage,
    isCreator,
    currentData,
    isEditable,
    canEditStatus,

    // Handlers
    toggleCard,
    handleAddPromise,
    handleViewModeChange,
  };
};
