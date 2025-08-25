import { CPayment, Notification } from "../../declarations/backend/backend.did";

/**
 * Finds an unseen notification for a specific promise
 * @param promise - The promise to check for notifications
 * @param notifications - Array of all notifications
 * @returns The unseen notification or null if none found
 */
export const findUnseenNotificationForPromise = (
  promise: CPayment,
  notifications: Notification[]
): Notification | null => {
  // Method 1: Direct ID match
  const directMatch = notifications.find(
    (n) => n.id === promise.id && !n.is_seen
  );
  
  if (directMatch) return directMatch;

  // Method 2: Content match for CPaymentContract
  const contentMatch = notifications.find(
    (n) =>
      !n.is_seen &&
      "CPaymentContract" in n.content &&
      n.content.CPaymentContract[0].id === promise.id
  );
  
  return contentMatch || null;
};

/**
 * Counts unseen notifications for all promises in a contract
 * @param promises - Array of promises to check
 * @param notifications - Array of all notifications
 * @returns Number of unseen notifications
 */
export const countUnseenNotificationsForContract = (
  promises: CPayment[],
  notifications: Notification[]
): number => {
  if (!promises || !notifications) return 0;
  
  return promises.reduce((count, promise) => {
    const unseenNotification = findUnseenNotificationForPromise(promise, notifications);
    return unseenNotification ? count + 1 : count;
  }, 0);
};

/**
 * Gets all promise IDs that have unseen notifications
 * @param promises - Array of promises to check
 * @param notifications - Array of all notifications
 * @returns Array of promise IDs with unseen notifications
 */
export const getPromiseIdsWithUnseenNotifications = (
  promises: CPayment[],
  notifications: Notification[]
): string[] => {
  if (!promises || !notifications) return [];
  
  return promises
    .filter(promise => findUnseenNotificationForPromise(promise, notifications))
    .map(promise => promise.id);
};