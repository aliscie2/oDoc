import { useCallback, useState } from "react";
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
  const [isUpdating, setIsUpdating] = useState(false);

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
      setIsUpdating(true);
      try {
        const isReceiver = profile?.id === promise.receiver.toString();
        const isSender = profile?.id === promise.sender.toString();

        // Optimistically update local state first
        dispatch({
          type: "SET_PROMISE_STATUS",
          contract_id: promise.contract_id,
          promise: { ...promise, status: statusMap[newStatus] },
        });

        // Call backend and refetch contract
        if (newStatus === "Confirmed" && isReceiver) {
          await backendActor.confirmed_c_payment(promise);
        } else if (newStatus === "ConfirmedCancellation" && isReceiver) {
          await backendActor.confirmed_cancellation(promise);
        } else if (newStatus === "ApproveHighPromise" && isReceiver) {
          await backendActor.approve_high_promise(promise);
        } else if (newStatus === "Objected" && isReceiver) {
          await backendActor.object_on_cancel(promise, reason);
        } else if (isSender) {
          // Sender updates go through multi_updates
          dispatch({
            type: "UPDATE_PROMISE",
            contract_id: promise.contract_id,
            promise: { ...promise, status: statusMap[newStatus] },
          });
          return; // No need to refetch for local updates
        }

        // Refetch contract after backend call
        const result = await backendActor.get_contract(
          promise.sender.toString(),
          promise.contract_id,
        );

        if ("Ok" in result && "CustomContract" in result.Ok) {
          // ✅ Use SET_CONTRACT instead of dispatching the whole contract
          dispatch({
            type: "SET_CONTRACT",
            contract: result.Ok.CustomContract,
          });

          // ✅ IMPORTANT: Remove this promise from changes since backend handled it
          dispatch({
            type: "REMOVE_PROMISE_FROM_CHANGES",
            contract_id: promise.contract_id,
            promise_id: promise.id,
          });

          enqueueSnackbar("Status updated successfully", {
            variant: "success",
          });
        }
      } catch (error: any) {
        console.error("Error updating status:", error);
        // Revert optimistic update on error
        dispatch({
          type: "SET_PROMISE_STATUS",
          contract_id: promise.contract_id,
          promise: promise,
        });
        enqueueSnackbar(error?.toString() || "Failed to update status", {
          variant: "error",
        });
      } finally {
        setIsUpdating(false);
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

      if (promise?.sender?.toString() === user.id) {
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
    if (window.confirm("Delete this agreement?")) {
      dispatch({
        type: "DELETE_PROMISE",
        contract_id: promise.contract_id,
        id: promise.id,
      });
    }
  }, [dispatch, promise.contract_id, promise.id]);

  return {
    updatePromise,
    handleStatusChange,
    handleAmountChange,
    handleReceiverChange,
    handleDeletePromise,
    isUpdating, // Return loading state
  };
};
