import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/reducers";
import { useBackendContext } from "../contexts/BackendContext";
import {
  Notification,
  CustomContract,
  CPayment,
  User,
} from "../../declarations/backend/backend.did";

export interface ContractWithNotifications extends CustomContract {
  _unseenCount: number;
  _source: 'owned' | 'notification';
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
  const { backendActor } = useBackendContext();
  
  const { contracts, profile } = useSelector((state: RootState) => state.filesState);
  const { notifications } = useSelector((state: RootState) => state.notificationState);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedContracts, setLoadedContracts] = useState<Map<string, CustomContract>>(new Map());

  // Process contracts from notifications and merge with owned contracts
  const processedContracts = useMemo(() => {
    console.log("🔄 Processing contracts with notifications...");
    
    const contractsMap = new Map<string, ContractWithNotifications>();
    
    // Filter contract notifications
    const contractNotifications = notifications.filter(
      (notification: Notification) => "CPaymentContract" in notification.content
    );
    
    console.log(`📋 Found ${contractNotifications.length} contract notifications`);
    
    // Group notifications by contract ID
    const notificationsByContract = new Map<string, Notification[]>();
    
    contractNotifications.forEach((notification) => {
      if ("CPaymentContract" in notification.content) {
        const payments = notification.content.CPaymentContract;
        
        payments.forEach((paymentOrAction) => {
          let payment: CPayment;
          if ('RequestCancellation' in paymentOrAction) {
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
    Object.values(contracts).forEach((contract: CustomContract) => {
      if (contract) {
        const contractNotifications = notificationsByContract.get(contract.id) || [];
        const unseenCount = contractNotifications.filter(n => !n.is_seen).length;
        
        contractsMap.set(contract.id, {
          ...contract,
          _unseenCount: unseenCount,
          _source: 'owned'
        });
        
        console.log(`👤 Added owned contract: ${contract.id} (unseen: ${unseenCount})`);
      }
    });
    
    // Add contracts from notifications that aren't owned
    notificationsByContract.forEach((notifications, contractId) => {
      if (!contractsMap.has(contractId)) {
        // Check if we have a loaded contract for this ID
        const loadedContract = loadedContracts.get(contractId);
        
        if (loadedContract) {
          const unseenCount = notifications.filter(n => !n.is_seen).length;
          contractsMap.set(contractId, {
            ...loadedContract,
            _unseenCount: unseenCount,
            _source: 'notification'
          });
          console.log(`📥 Added loaded contract: ${contractId} (unseen: ${unseenCount})`);
        } else {
          // Create minimal contract from notification
          const minimalContract = createMinimalContractFromNotifications(contractId, notifications);
          if (minimalContract) {
            const unseenCount = notifications.filter(n => !n.is_seen).length;
            contractsMap.set(contractId, {
              ...minimalContract,
              _unseenCount: unseenCount,
              _source: 'notification'
            });
            console.log(`🆕 Added minimal contract: ${contractId} (unseen: ${unseenCount})`);
          }
        }
      }
    });
    
    // Convert to array and sort by date
    const contractsList = Array.from(contractsMap.values())
      .sort((a, b) => b.date_created - a.date_created);
    
    console.log(`📊 Final contracts: ${contractsList.length} total`);
    
    return contractsList;
  }, [contracts, notifications, loadedContracts]);

  // Load contract details for contracts from notifications
  useEffect(() => {
    const loadMissingContracts = async () => {
      if (!backendActor || !profile) return;
      
      const contractsToLoad: Array<{ id: string; creator: string }> = [];
      
      // Find contracts from notifications that need loading
      const contractNotifications = notifications.filter(
        (notification: Notification) => "CPaymentContract" in notification.content
      );
      
      const contractIds = new Set<string>();
      contractNotifications.forEach((notification) => {
        if ("CPaymentContract" in notification.content) {
          const payments = notification.content.CPaymentContract;
          payments.forEach((paymentOrAction) => {
            let payment: CPayment;
            if ('RequestCancellation' in paymentOrAction) {
              payment = paymentOrAction.RequestCancellation;
            } else {
              payment = paymentOrAction as CPayment;
            }
            
            const contractId = payment.contract_id;
            if (contractId && 
                !contracts[contractId] && 
                !loadedContracts.has(contractId) &&
                payment.sender.toString() !== profile.id) {
              contractIds.add(contractId);
              contractsToLoad.push({
                id: contractId,
                creator: payment.sender.toString()
              });
            }
          });
        }
      });
      
      if (contractsToLoad.length === 0) return;
      
      console.log(`🔄 Loading ${contractsToLoad.length} contracts from backend...`);
      setLoading(true);
      setError(null);
      
      try {
        const loadPromises = contractsToLoad.map(async ({ id, creator }) => {
          try {
            const result = await backendActor.get_contract(creator, id);
            if ("Ok" in result && "CustomContract" in result.Ok) {
              const loadedContract = result.Ok.CustomContract;
              setLoadedContracts(prev => new Map(prev).set(id, loadedContract));
              dispatch({ type: "ADD_CONTRACT", contract: loadedContract });
              console.log(`✅ Loaded contract: ${id}`);
              return loadedContract;
            } else {
              console.warn(`⚠️ Failed to load contract ${id}:`, result);
              return null;
            }
          } catch (error) {
            console.error(`❌ Error loading contract ${id}:`, error);
            return null;
          }
        });
        
        await Promise.all(loadPromises);
      } catch (error) {
        console.error("❌ Error loading contracts:", error);
        setError(error instanceof Error ? error.message : "Failed to load contracts");
      } finally {
        setLoading(false);
      }
    };
    
    loadMissingContracts();
  }, [notifications, contracts, backendActor, dispatch, profile, loadedContracts]);

  // Calculate total unseen count
  const totalUnseenCount = useMemo(() => {
    return processedContracts.reduce((total, contract) => total + contract._unseenCount, 0);
  }, [processedContracts]);

  return {
    contracts: processedContracts,
    loading,
    error,
    totalUnseenCount
  };
};

/**
 * Create a minimal contract from notification data
 */
function createMinimalContractFromNotifications(
  contractId: string,
  notifications: Notification[]
): CustomContract | null {
  if (!contractId || notifications.length === 0) return null;
  
  const firstNotification = notifications[0];
  if (!("CPaymentContract" in firstNotification.content)) return null;
  
  const payments = firstNotification.content.CPaymentContract;
  if (!payments || payments.length === 0) return null;
  
  const firstPaymentOrAction = payments[0];
  let firstPayment: CPayment;
  if (typeof firstPaymentOrAction === 'object' && firstPaymentOrAction !== null && 'RequestCancellation' in firstPaymentOrAction) {
    firstPayment = (firstPaymentOrAction as any).RequestCancellation;
  } else {
    firstPayment = firstPaymentOrAction as CPayment;
  }
  
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

