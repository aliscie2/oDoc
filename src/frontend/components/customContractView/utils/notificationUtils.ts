import { CPayment, Notification } from "$/declarations/backend/backend.did";

export const findUnseenNotificationForPromise = (
  promise: CPayment,
  notifications: Notification[],
): Notification | null => {
  // Check for direct promise ID match
  const directMatch = notifications.find(
    (n) => n.id === promise.id && !n.is_seen,
  );
  if (directMatch) return directMatch;

  // Check for CPaymentContract content with matching promise ID
  const contentMatch = notifications.find(
    (n) =>
      !n.is_seen &&
      "CPaymentContract" in n.content &&
      n.content.CPaymentContract[0].id === promise.id,
  );
  return contentMatch || null;
};

// Track notifications that are being processed to avoid duplicate calls
const processingNotifications = new Set<string>();

export const isNotificationAlreadyCalled = (
  notificationId: string,
): boolean => {
  return processingNotifications.has(notificationId);
};

export const markNotificationAsCalled = (notificationId: string): void => {
  processingNotifications.add(notificationId);
};

export const removeNotificationFromProcessing = (
  notificationId: string,
): void => {
  processingNotifications.delete(notificationId);
};
