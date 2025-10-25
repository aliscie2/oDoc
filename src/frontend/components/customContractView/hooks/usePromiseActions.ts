import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { CPayment } from "$/declarations/backend/backend.did";
import { backendActor } from "@/utils/backendUtils";
import { PromiseStatus } from "../types/contract";

interface UsePromiseActionsProps {
  promise: CPayment;
  currentUserId: string;
  contractId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook for handling promise status changes with backend calls
 * Receiver actions (confirm, object, approve, cancel) call backend directly
 * Sender actions update through Redux (handled by multi_updates)
 */
export const usePromiseActions = ({
  promise,
  currentUserId,
  contractId,
  onSuccess,
  onError,
}: UsePromiseActionsProps) => {
  const dispatch = useDispatch();

  const isReceiver = promise.receiver.toString() === currentUserId;
  const isSender = promise.sender.toString() === currentUserId;

  /**
   * Handle status change with appropriate backend call
   * Receiver actions call backend directly and refetch contract
   * Sender actions update through Redux
   */
  const handleStatusChange = useCallback(
    async (newStatus: PromiseStatus, objectionText?: string) => {
      if (!backendActor) {
        onError?.("Backend actor not available");
        return;
      }

      try {
        // Receiver actions - call backend directly
        if (isReceiver) {
          switch (newStatus) {
            case "confirmed":
              await backendActor.confirmed_c_payment(promise);
              break;

            case "cancelled":
              await backendActor.confirmed_cancellation(promise);
              break;

            case "escrow_approved":
              await backendActor.approve_high_promise(promise);
              break;

            case "objected":
              if (!objectionText) {
                onError?.("Objection reason is required");
                return;
              }
              await backendActor.object_on_cancel(promise, objectionText);
              break;

            default:
              onError?.(`Invalid receiver action: ${newStatus}`);
              return;
          }

          // Refetch contract after backend call
          const result = await backendActor.get_contract(
            promise.sender.toString(),
            promise.contract_id,
          );

          if ("Ok" in result && "CustomContract" in result.Ok) {
            // Update Redux with fresh contract data
            dispatch({
              type: "SET_CONTRACT",
              contract: result.Ok.CustomContract,
            });

            onSuccess?.();
          } else {
            onError?.("Failed to fetch updated contract");
          }
        }
        // Sender actions - handled through Redux UPDATE_PROMISE
        // The multi_updates endpoint will handle these
        else if (isSender) {
          // Sender updates are handled by the parent component through onUpdate
          // which dispatches UPDATE_PROMISE action
          onSuccess?.();
        } else {
          onError?.("You are not authorized to update this promise");
        }
      } catch (error: any) {
        console.error("Error updating promise status:", error);
        onError?.(error?.toString() || "Failed to update status");
      }
    },
    [
      promise,
      isReceiver,
      isSender,
      contractId,
      dispatch,
      onSuccess,
      onError,
    ],
  );

  return {
    handleStatusChange,
    isReceiver,
    isSender,
  };
};
