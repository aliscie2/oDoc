import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import { Principal } from "@dfinity/principal";
import { CPayment, Friend } from "$/declarations/backend/backend.did";

interface AppState {
  filesState: {
    all_friends: Friend[];
    wallet: { balance: number };
  };
}

export const usePromiseActions = (promise: CPayment, isEditable: boolean) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { all_friends, wallet } = useSelector(
    (state: AppState) => state.filesState,
  );

  const updatePromise = useCallback(
    (updates: Partial<CPayment>) => {
      if (!isEditable) return;

      const updatedPromise = { ...promise, ...updates };

      dispatch({
        type: "UPDATE_PROMISE",
        contract_id: promise.contract_id,
        promise: updatedPromise,
      });
    },
    [dispatch, promise, isEditable],
  );

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      if (!isEditable) return;

      const statusMap: Record<string, any> = {
        None: { None: null },
        Released: { Released: null },
        Confirmed: { Confirmed: null },
        HighPromise: { HighPromise: null },
      };

      if (newStatus === "Objected") {
        const reason = prompt("Enter objection reason:");
        if (reason === null) return;
        statusMap.Objected = { Objected: reason || "" };
      }

      updatePromise({ status: statusMap[newStatus] });
    },
    [updatePromise, isEditable],
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
      if (!isEditable) return;

      const user = all_friends?.find((u) => u.name === newReceiver);
      if (!user || promise.sender.toString() === user.id) {
        enqueueSnackbar("Error: You can't send to yourself", {
          variant: "error",
        });
        return;
      }
      updatePromise({ receiver: Principal.fromText(user.id) });
    },
    [updatePromise, all_friends, promise.sender, enqueueSnackbar, isEditable],
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
