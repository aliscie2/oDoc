// Generic notification system for contract promises

import { Promise as CPayment, PromiseStatus } from '../types/contract';
import { Notification } from "$/declarations/backend/backend.did";

export type NotificationAction = 
  | 'Promise' 
  | 'Accepted' 
  | 'Released' 
  | 'Cancelled' 
  | 'Objected' 
  | 'Update';




// Processing cache to prevent duplicate operations
const processingCache = new Set<string>();

export const notificationCache = {
  isProcessing: (id: string) => processingCache.has(id),
  markProcessing: (id: string) => processingCache.add(id),
  clearProcessing: (id: string) => processingCache.delete(id),
};

// Core notification utilities (production-aligned)
export const notificationUtils = {
  // Find unseen notification using production's two-strategy approach
  findUnseen: (promiseId: string, notifications: Notification[]): Notification | null => {
    // Strategy 1: Direct ID match (some notifications use notification.id === promise.id)
    const directMatch = notifications.find(n => n.id === promiseId && !n.is_seen);
    if (directMatch) return directMatch;
    
    // Strategy 2: Content-based match (notifications with CPaymentContract content)
    const contentMatch = notifications.find(n => n.promiseId === promiseId && !n.is_seen);
    if (contentMatch) return contentMatch;
    
    return null;
  },

  // Create new notification (production-aligned)
  create: (promiseId: string, action: NotificationAction, sender: string, receiver: string): Notification => {
    const notifId = `notif-${promiseId}-${Date.now()}`;
    return {
      id: notifId,
      promiseId,
      sender,
      receiver,
      time: Date.now(), // Production uses 'time'
      is_seen: false,
      action,
      content: {
        CPaymentContract: {
          promise: { id: promiseId }, // In production, full promise object
          action,
        }
      }
    };
  },

  // Mark notification as seen
  markSeen: (notifications: Notification[], notificationId: string): Notification[] => {
    return notifications.map(n => n.id === notificationId ? { ...n, is_seen: true } : n);
  },

  // Get count of unseen notifications
  getUnseenCount: (notifications: Notification[]): number => {
    return notifications.filter(n => !n.is_seen).length;
  },
};

// Map promise status to notification action
const STATUS_ACTION_MAP: Record<PromiseStatus, NotificationAction> = {
  draft: 'Update',
  active: 'Promise',
  confirmed: 'Accepted',
  objected: 'Objected',
  released: 'Released',
  completed: 'Update',
  cancelled: 'Cancelled',
};

export const getActionFromStatus = (
  oldStatus: PromiseStatus | null,
  newStatus: PromiseStatus
): NotificationAction | null => {
  if (!oldStatus) return 'Promise';
  if (oldStatus === newStatus) return null;
  return STATUS_ACTION_MAP[newStatus] || 'Update';
};

// Generate initial mock notifications (production-aligned)
// Only receivers get notifications, not creators/senders
export const generateMockNotifications = (
  promises: CPayment[], 
  currentUserName: string,
  contractCreatorName: string,
  unseenLimit: number = 2
): Notification[] => {
  let unseenCount = 0;
  
  return promises
    .filter(p => {
      // Only non-draft promises
      if (p.status === 'draft') return false;
      
      // Only if current user is the receiver (not the sender)
      if (p.receiver !== currentUserName) return false;
      
      // Don't notify contract creator about their own promises
      if (currentUserName === contractCreatorName) return false;
      
      return true;
    })
    .map(promise => {
      const action = STATUS_ACTION_MAP[promise.status];
      const isUnseen = unseenCount++ < unseenLimit;
      
      return {
        id: `notif-${promise.id}`,
        promiseId: promise.id,
        sender: promise.sender,
        receiver: promise.receiver,
        time: promise.createdAt.getTime(),
        is_seen: !isUnseen,
        action,
        content: {
          CPaymentContract: {
            promise: { id: promise.id, status: promise.status },
            action,
          }
        }
      };
    });
};

// Action display messages
export const ACTION_MESSAGES: Record<NotificationAction, string> = {
  Promise: 'New promise created',
  Accepted: 'Promise accepted',
  Released: 'Payment released',
  Cancelled: 'Promise cancelled',
  Objected: 'Promise objected',
  Update: 'Promise updated',
};
