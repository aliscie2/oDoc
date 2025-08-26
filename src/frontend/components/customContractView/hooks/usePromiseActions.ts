import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { Principal } from "@dfinity/principal";
import { CPayment } from "$/declarations/backend/backend.did";
import { backendActor } from "../../../utils/backendUtils";

interface AppState {
  filesState: {
    all_friends: any[]; // Array of User objects extracted from Friends
    wallet: { balance: number };
    profile: { id: string; name: string };
  };
}

export const usePromiseActions = (
  promise: CPayment,
  isEditable: boolean,
  canEditStatus?: boolean,
) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  // Using direct backendActor import
  const { all_friends, wallet, profile } = useSelector(
    (state: AppState) => state.filesState,
  );

  // Use canEditStatus if provided, otherwise fall back to isEditable
  const statusEditable =
    canEditStatus !== undefined ? canEditStatus : isEditable;

  const updatePromise = useCallback(
    (updates: Partial<CPayment>) => {
      if (!isEditable) return;
      dispatch({
        type: "UPDATE_PROMISE",
        contract_id: promise.contract_id,
        promise: { ...promise, ...updates },
      });
    },
    [dispatch, promise, isEditable],
  );

  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!statusEditable || !backendActor) return;

      const statusMap: Record<string, any> = {
        None: { None: null },
        Released: { Released: null },
        Confirmed: { Confirmed: null },
        HighPromise: { HighPromise: null },
        RequestCancellation: { RequestCancellation: null },
        ConfirmedCancellation: { ConfirmedCancellation: null },
        ApproveHighPromise: { ApproveHighPromise: null },
      };

      let reason = "";
      if (newStatus === "Objected") {
        const inputReason = prompt("Enter objection reason:");
        if (inputReason === null) return;
        reason = inputReason || "";
        statusMap.Objected = { Objected: reason };
      }

      try {
        // Update local state immediately for better UX (no backend save)
        dispatch({
          type: "SET_PROMISE_STATUS",
          contract_id: promise.contract_id,
          promise: { ...promise, status: statusMap[newStatus] },
        });

        // Call backend function based on status and user role
        const isReceiver = profile?.id === promise.receiver.toString();

        if (newStatus === "Confirmed" && isReceiver) {
          await backendActor.confirmed_c_payment(promise);
        } else if (newStatus === "ConfirmedCancellation" && isReceiver) {
          await backendActor.confirmed_cancellation(promise);
        } else if (newStatus === "ApproveHighPromise" && isReceiver) {
          await backendActor.approve_high_promise(promise);
        } else if (newStatus === "Objected" && isReceiver) {
          await backendActor.object_on_cancel(promise, reason);
        }

        enqueueSnackbar("Status updated successfully", { variant: "success" });
      } catch (error) {
        console.error("Error updating status:", error);
        // Revert local state on backend error (no backend save)
        dispatch({
          type: "SET_PROMISE_STATUS",
          contract_id: promise.contract_id,
          promise: promise, // Revert to original state
        });
        enqueueSnackbar("Failed to update status", { variant: "error" });
      }
    },
    [
      dispatch,
      promise,
      statusEditable,
      backendActor,
      profile?.id,
      enqueueSnackbar,
    ],
  );

  const handleAmountChange = useCallback(
    (newAmount: string) => {
      if (!isEditable) return;

      const amount = parseFloat(newAmount) || 0;
      if (amount > wallet.balance) {
        enqueueSnackbar("Error: Not enough balance", { variant: "error" });
        return;
      }
      updatePromise({ amount });
    },
    [updatePromise, wallet.balance, enqueueSnackbar, isEditable],
  );

  const handleReceiverChange = useCallback(
    (newReceiver: string) => {
      if (!isEditable || !all_friends || !Array.isArray(all_friends)) return;

      // Find user by name (all_friends contains User objects)
      const user = all_friends.find((u) => u?.name === newReceiver);

      if (!user || !user.id) {
        enqueueSnackbar("Error: Friend not found", { variant: "error" });
        return;
      }

      if (promise.sender.toString() === user.id) {
        enqueueSnackbar("Error: You can't send to yourself", {
          variant: "error",
        });
        return;
      }

      updatePromise({ receiver: Principal.fromText(user.id) });
    },
    [
      updatePromise,
      all_friends,
      promise.sender,
      enqueueSnackbar,
      isEditable,
      profile?.id,
    ],
  );

  const handleDeletePromise = useCallback(() => {
    if (!isEditable) return;

    if (window.confirm("Delete this agreement?")) {
      dispatch({
        type: "DELETE_PROMISE",
        contract_id: promise.contract_id,
        id: promise.id,
      });
    }
  }, [dispatch, promise, isEditable]);

  return {
    updatePromise,
    handleStatusChange,
    handleAmountChange,
    handleReceiverChange,
    handleDeletePromise,
  };
};
