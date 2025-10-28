import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "@/utils/backendUtils";
import { RootState } from "@/redux/reducers";

import {
  CPayment,
  CustomContract,
  Notification,
} from "$/declarations/backend/backend.did";

export interface ContractWithNotifications extends CustomContract {
  _unseenCount: number;
  _source: "owned" | "notification";
}

export interface ContractsNotificationsState {
  contracts: ContractWithNotifications[];
  loading: boolean;
  error: string | null;
  totalUnseenCount: number;
}

/**
 * Centralized hook for managing contracts with notifications
 * Consolidates all notification-related logic and contract loading
 */
export const useContractsNotifications = (): ContractsNotificationsState => {
  const dispatch = useDispatch();
  // Using direct backendActor import

  const { contracts, profile } = useSelector(
    (state: RootState) => state.filesState,
  );
  const { notifications } = useSelector(
    (state: RootState) => state.notificationState,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedContractIds, setLoadedContractIds] = useState<Set<string>>(
    new Set(),
  );

  // Process contracts from notifications and merge with owned contracts
  const processedContracts = useMemo(() => {
    const contractsMap = new Map<string, ContractWithNotifications>();

    // Filter contract notifications
    const contractNotifications = notifications.filter(
      (notification: Notification) =>
        "CPaymentContract" in notification.content,
    );

    // Group notifications by contract ID
    const notificationsByContract = new Map<string, Notification[]>();

    contractNotifications.forEach((notification) => {
      if ("CPaymentContract" in notification.content) {
        const payments = notification.content.CPaymentContract;

        payments.forEach((paymentOrAction) => {
          let payment: CPayment;
          if ("RequestCancellation" in paymentOrAction) {
            payment = paymentOrAction.RequestCancellation;
          } else {
            payment = paymentOrAction as CPayment;
          }

          const contractId = payment.contract_id;
          if (contractId) {
            if (!notificationsByContract.has(contractId)) {
              notificationsByContract.set(contractId, []);
            }
            notificationsByContract.get(contractId)!.push(notification);
          }
        });
      }
    });

    // Add owned contracts first
    // Redux now always stores unwrapped CustomContract
    Object.values(contracts).forEach((contract) => {
      if (contract && contract.id) {
        const contractNotifications =
          notificationsByContract.get(contract.id) || [];
        const unseenCount = contractNotifications.filter(
          (n) => !n.is_seen,
        ).length;

        contractsMap.set(contract.id, {
          ...contract,
          _unseenCount: unseenCount,
          _source: "owned",
        });
      }
    });

    // Add contracts from notifications that aren't owned
    notificationsByContract.forEach((notifications, contractId) => {
      if (!contractsMap.has(contractId)) {
        // Create minimal contract from notification
        // The full contract will be loaded by the useEffect
        const minimalContract = createMinimalContractFromNotifications(
          contractId,
          notifications,
        );
        if (minimalContract) {
          const unseenCount = notifications.filter((n) => !n.is_seen).length;
          contractsMap.set(contractId, {
            ...minimalContract,
            _unseenCount: unseenCount,
            _source: "notification",
          });
        }
      }
    });

    // Convert to array and sort by date
    const contractsList = Array.from(contractsMap.values()).sort(
      (a, b) => b.date_created - a.date_created,
    );

    return contractsList;
  }, [contracts, notifications]);

  // Load contract details for contracts from notifications
  useEffect(() => {
    const loadMissingContracts = async () => {
      if (!backendActor || !profile) return;

      const contractsToLoad: Array<{ id: string; creator: string }> = [];

      // Find contracts from notifications that need loading
      const contractNotifications = notifications.filter(
        (notification: Notification) =>
          "CPaymentContract" in notification.content,
      );

      const contractIds = new Set<string>();
      contractNotifications.forEach((notification) => {
        if ("CPaymentContract" in notification.content) {
          const payments = notification.content.CPaymentContract;
          payments.forEach((paymentOrAction) => {
            let payment: CPayment;
            if ("RequestCancellation" in paymentOrAction) {
              payment = paymentOrAction.RequestCancellation;
            } else {
              payment = paymentOrAction as CPayment;
            }

            const contractId = payment.contract_id;
            if (
              contractId &&
              !contracts[contractId] &&
              !loadedContractIds.has(contractId) &&
              payment.sender.toString() !== profile.id
            ) {
              contractIds.add(contractId);
              contractsToLoad.push({
                id: contractId,
                creator: payment.sender.toString(),
              });
            }
          });
        }
      });

      if (contractsToLoad.length === 0) return;

      // Mark contracts as loaded to prevent duplicate requests
      setLoadedContractIds((prev) => {
        const newSet = new Set(prev);
        contractsToLoad.forEach(({ id }) => newSet.add(id));
        return newSet;
      });
      
      setLoading(true);
      setError(null);

      try {
        const loadPromises = contractsToLoad.map(async ({ id, creator }) => {
          try {
            const result = await backendActor.get_contract(creator, id);
            if ("Ok" in result && "CustomContract" in result.Ok) {
              const loadedContract = result.Ok.CustomContract;
              // Dispatch to Redux - this will trigger a re-render with the full contract
              dispatch({ type: "SET_CONTRACT", contract: loadedContract });
              return { id, success: true };
            } else {
              return { id, success: false };
            }
          } catch (error) {
            console.error(`Error loading contract ${id}:`, error);
            return { id, success: false };
          }
        });

        await Promise.all(loadPromises);
      } catch (error) {
        console.error("Error loading contracts:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load contracts",
        );
      } finally {
        setLoading(false);
      }
    };

    loadMissingContracts();
  }, [notifications, contracts, backendActor, dispatch, profile, loadedContractIds]);

  // Calculate total unseen count
  const totalUnseenCount = useMemo(() => {
    return processedContracts.reduce(
      (total, contract) => total + contract._unseenCount,
      0,
    );
  }, [processedContracts]);

  return {
    contracts: processedContracts,
    loading,
    error,
    totalUnseenCount,
  };
};

/**
 * Create a minimal contract from notification data
 */
function createMinimalContractFromNotifications(
  contractId: string,
  notifications: Notification[],
): CustomContract | null {
  if (!contractId || notifications.length === 0) return null;

  const firstNotification = notifications[0];
  if (!("CPaymentContract" in firstNotification.content)) return null;

  const paymentTuple = firstNotification.content.CPaymentContract;
  if (!paymentTuple || paymentTuple.length < 1) return null;

  // CPaymentContract is a tuple [CPayment, PaymentAction]
  const firstPayment = paymentTuple[0] as CPayment;

  const contractName = `Contract ${contractId.slice(0, 8)}...`;

  return {
    id: contractId,
    creator: firstPayment.sender.toString(),
    date_created: firstPayment.date_created,
    date_updated: firstPayment.date_created,
    name: contractName,
    permissions: [],
    payments: [firstPayment],
    promises: [],
    contracts: [],
    formulas: [],
  };
}
