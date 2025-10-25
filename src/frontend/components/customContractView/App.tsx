import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AgreementView } from './components/AgreementView';
import { mockContract, currentUserId, getCurrentUserName } from './lib/mock-data';
import { Contract, Promise } from './types/contract';
import { 
  generateMockNotifications, 
  notificationUtils,
  getActionFromStatus 
} from './lib/notifications';
import { Notification } from "$/declarations/backend/backend.did";
import { backendActor } from '@/utils/backendUtils';

// Main App Component - Centralized State Management
export default function AgreementViewDemo() {
  // Core application state
  const currentUserName = getCurrentUserName();
  const [contract, setContract] = useState<Contract>(mockContract);
  const [currentBalance, setCurrentBalance] = useState(10000);
  const [notifications, setNotifications] = useState<Notification[]>(() => 
    generateMockNotifications(
      mockContract.promises, 
      currentUserName,
      mockContract.creatorName // Contract creator doesn't see notifications
    )
  );

  // Promise Management Handlers
  const handleAddPromise = () => {
    const newPromise: Promise = {
      id: `promise-${Date.now()}`,
      title: 'New Promise',
      status: 'draft',
      sender: currentUserName,
      receiver: 'Bob Smith',
      amount: 0,
      conditions: [],
      createdAt: new Date(),
    };
    setContract(prev => ({ ...prev, promises: [...prev.promises, newPromise] }));
  };

  const handleDeletePromise = (promiseId: string) => {
    setContract(prev => ({ ...prev, promises: prev.promises.filter(p => p.id !== promiseId) }));
  };

  const handleUpdatePromise = (promiseId: string, updates: Partial<Promise>) => {
    setContract(prev => {
      const oldPromise = prev.promises.find(p => p.id === promiseId);
      const updatedPromises = prev.promises.map(p =>
        p.id === promiseId ? { ...p, ...updates } : p
      );
      
      // Production pattern: Create notification for receiver when status changes
      if (oldPromise && updates.status && updates.status !== oldPromise.status) {
        const updatedPromise = updatedPromises.find(p => p.id === promiseId);
        if (updatedPromise) {
          // Only notify receiver, not the person making the change
          const shouldNotify = updatedPromise.receiver !== currentUserName;
          
          if (shouldNotify) {
            const action = getActionFromStatus(oldPromise.status, updates.status);
            if (action) {
              const notification = notificationUtils.create(
                promiseId,
                action,
                currentUserName, // Current user is the sender (action performer)
                updatedPromise.receiver // Receiver gets the notification
              );
              setNotifications(prev => [...prev, notification]);
            }
          }
        }
      }
      
      return { ...prev, promises: updatedPromises };
    });
  };

  // Contract Management Handlers
  const handleContractNameChange = (name: string) => {
    setContract(prev => ({ ...prev, name }));
  };

  const handleDeleteContract = async () => {
    try {
      const response = await backendActor.delete_custom_contract(contract.id);
      
      if ('Ok' in response) {
        // Success - redirect or show success message
        alert('Contract deleted successfully');
        // You might want to redirect to a contracts list page here
        // window.location.href = '/contracts';
      } else if ('Err' in response) {
        // Error from backend
        throw new Error(response.Err);
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error; // Re-throw to be handled by the button's error handler
    }
  };

  // Notification Handlers
  const handleMarkNotificationSeen = (notificationId: string) => {
    setNotifications(prev => notificationUtils.markSeen(prev, notificationId));
  };

  return (
    <ThemeProvider>
      <AgreementView 
        contract={contract} 
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentBalance={currentBalance}
        notifications={notifications}
        onAddPromise={handleAddPromise}
        onDeletePromise={handleDeletePromise}
        onUpdatePromise={handleUpdatePromise}
        onContractNameChange={handleContractNameChange}
        onDeleteContract={handleDeleteContract}
        onMarkNotificationSeen={handleMarkNotificationSeen}
      />
    </ThemeProvider>
  );
}
