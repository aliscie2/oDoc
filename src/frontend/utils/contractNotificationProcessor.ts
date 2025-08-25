import {
  Notification,
  CustomContract,
  CPayment,
} from "../../declarations/backend/backend.did";

export interface ContractFromNotification {
  contract: CustomContract;
  unseenCount: number;
  source: 'notification' | 'owned';
}

export interface NotificationProcessingDebug {
  totalNotifications: number;
  contractNotifications: number;
  uniqueContractIds: string[];
  contractsFromNotifications: number;
  unseenNotificationsByContract: Record<string, number>;
}

/**
 * Processes notifications to extract contracts and count unseen notifications
 */
export class ContractNotificationProcessor {
  private debug: NotificationProcessingDebug = {
    totalNotifications: 0,
    contractNotifications: 0,
    uniqueContractIds: [],
    contractsFromNotifications: 0,
    unseenNotificationsByContract: {},
  };

  /**
   * Extract contracts from notifications and merge with owned contracts
   */
  processContractsFromNotifications(
    notifications: Notification[],
    ownedContracts: Record<string, CustomContract>
  ): {
    allContracts: Map<string, ContractFromNotification>;
    debug: NotificationProcessingDebug;
  } {
    console.log('🔍 ContractNotificationProcessor: Starting processing...');
    
    this.debug.totalNotifications = notifications.length;
    console.log(`📊 Total notifications: ${this.debug.totalNotifications}`);

    // Filter contract notifications
    const contractNotifications = notifications.filter(
      (notification: Notification) => {
        const hasContractContent = "CPaymentContract" in notification.content;
        if (hasContractContent) {
          console.log('📋 Found contract notification:', {
            id: notification.id,
            is_seen: notification.is_seen,
            content: notification.content
          });
        }
        return hasContractContent;
      }
    );

    this.debug.contractNotifications = contractNotifications.length;
    console.log(`📋 Contract notifications: ${this.debug.contractNotifications}`);

    // Group notifications by contract ID
    const notificationsByContract = new Map<string, Notification[]>();
    
    contractNotifications.forEach((notification) => {
      if ("CPaymentContract" in notification.content) {
        const payments = notification.content.CPaymentContract;
        console.log(`💰 Processing notification:`, {
          notificationId: notification.id,
          paymentsLength: payments?.length || 0,
          payments: payments
        });
        
        payments.forEach((paymentOrAction) => {
          // Handle different payment types
          let payment: CPayment;
          if ('RequestCancellation' in paymentOrAction) {
            payment = paymentOrAction.RequestCancellation;
          } else {
            payment = paymentOrAction as CPayment;
          }
          
          const contractId = payment.contract_id;
          console.log(`🔗 Contract ID: ${contractId}`);
          
          if (contractId && !notificationsByContract.has(contractId)) {
            notificationsByContract.set(contractId, []);
          }
          if (contractId) {
            notificationsByContract.get(contractId)!.push(notification);
          }
        });
      }
    });

    this.debug.uniqueContractIds = Array.from(notificationsByContract.keys());
    console.log(`🆔 Unique contract IDs from notifications:`, this.debug.uniqueContractIds);

    // Create final contracts map
    const allContracts = new Map<string, ContractFromNotification>();

    // Add owned contracts first
    Object.values(ownedContracts).forEach((contract: CustomContract) => {
      if (contract) {
        const unseenCount = this.countUnseenNotificationsForContract(
          contract.id,
          notificationsByContract.get(contract.id) || []
        );
        
        allContracts.set(contract.id, {
          contract,
          unseenCount,
          source: 'owned'
        });
        
        console.log(`👤 Added owned contract: ${contract.id} (unseen: ${unseenCount})`);
      }
    });

    // Add contracts from notifications that aren't owned
    notificationsByContract.forEach((notifications, contractId) => {
      if (!allContracts.has(contractId)) {
        console.log(`🆕 Creating contract from notifications for ID: ${contractId}`);
        
        const minimalContract = this.createMinimalContractFromNotifications(
          contractId,
          notifications
        );
        
        if (minimalContract) {
          const unseenCount = this.countUnseenNotificationsForContract(
            contractId,
            notifications
          );
          
          allContracts.set(contractId, {
            contract: minimalContract,
            unseenCount,
            source: 'notification'
          });
          
          this.debug.contractsFromNotifications++;
          console.log(`✅ Created contract from notification: ${contractId} (unseen: ${unseenCount})`);
        }
      }
    });

    // Calculate unseen counts for debug
    notificationsByContract.forEach((notifications, contractId) => {
      this.debug.unseenNotificationsByContract[contractId] = 
        this.countUnseenNotificationsForContract(contractId, notifications);
    });

    console.log('📈 Final processing results:', {
      totalContracts: allContracts.size,
      ownedContracts: Object.keys(ownedContracts).length,
      contractsFromNotifications: this.debug.contractsFromNotifications,
      unseenCounts: this.debug.unseenNotificationsByContract
    });

    return { allContracts, debug: this.debug };
  }

  /**
   * Count unseen notifications for a specific contract
   */
  private countUnseenNotificationsForContract(
    contractId: string,
    notifications: Notification[]
  ): number {
    const unseenCount = notifications.filter(n => !n.is_seen).length;
    console.log(`🔢 Contract ${contractId}: ${unseenCount} unseen of ${notifications.length} total notifications`);
    return unseenCount;
  }

  /**
   * Create a minimal contract from notification data
   */
  private createMinimalContractFromNotifications(
    contractId: string,
    notifications: Notification[]
  ): CustomContract | null {
    console.log(`🏗️ Creating minimal contract for ID: ${contractId}`);
    
    if (!contractId) {
      console.log(`❌ Invalid contract ID: ${contractId}`);
      return null;
    }
    
    if (notifications.length === 0) {
      console.log(`❌ No notifications for contract ${contractId}`);
      return null;
    }

    const firstNotification = notifications[0];
    if (!firstNotification || !("CPaymentContract" in firstNotification.content)) {
      console.log(`❌ First notification for ${contractId} is not a contract notification`);
      return null;
    }

    const payments = firstNotification.content.CPaymentContract;
    if (!payments || payments.length === 0) {
      console.log(`❌ No payments in first notification for ${contractId}`);
      return null;
    }

    // Handle different payment types
    const firstPaymentOrAction = payments[0];
    let firstPayment: CPayment;
    if ('RequestCancellation' in firstPaymentOrAction) {
      firstPayment = firstPaymentOrAction.RequestCancellation;
    } else {
      firstPayment = firstPaymentOrAction as CPayment;
    }
    
    console.log(`🏗️ Creating minimal contract for ${contractId} from payment:`, firstPayment);

    // Ensure contractId is valid before using slice
    const contractName = contractId && typeof contractId === 'string' 
      ? `Contract ${contractId.slice(0, 8)}...` 
      : 'Unknown Contract';

    const minimalContract: CustomContract = {
      id: contractId || 'unknown',
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

    console.log(`✅ Created minimal contract:`, minimalContract);
    return minimalContract;
  }

  /**
   * Get debug information
   */
  getDebugInfo(): NotificationProcessingDebug {
    return this.debug;
  }
}

/**
 * Utility function to process contracts from notifications
 */
export const processContractsFromNotifications = (
  notifications: Notification[],
  ownedContracts: Record<string, CustomContract>
) => {
  const processor = new ContractNotificationProcessor();
  return processor.processContractsFromNotifications(notifications, ownedContracts);
};