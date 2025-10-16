import { Principal } from "@dfinity/principal";
import { User, Message } from "./types";

/**
 * Get display name for a sender
 */
export const getSenderName = (
  sender: Principal | string,
  currentUserId: string,
  allFriends: User[],
): string => {
  const senderStr = sender instanceof Principal ? sender.toString() : sender;

  if (senderStr === currentUserId) {
    return "You";
  }

  const friend = allFriends.find((u) => u.id === senderStr);
  return friend?.name || senderStr.slice(0, 8);
};

/**
 * Check if sender is current user
 */
export const isCurrentUser = (
  sender: Principal | string,
  currentUserId: string,
): boolean => {
  const senderStr = sender instanceof Principal ? sender.toString() : sender;
  return senderStr === currentUserId;
};

/**
 * Calculate unread messages count
 */
export const getUnreadCount = (
  messages: Message[],
  currentUserId: string,
): number => {
  return messages.reduce((count, message) => {
    const isSeen = message.seen_by.some(
      (user) => user.toString() === currentUserId,
    );
    return count + (isSeen ? 0 : 1);
  }, 0);
};

/**
 * Convert image bytes to blob URL
 */
export const convertToBlobLink = (photo?: Uint8Array): string | undefined => {
  if (!photo || photo.length === 0) return undefined;
  const blob = new Blob([photo], { type: "image/jpeg" });
  return URL.createObjectURL(blob);
};

/**
 * Format Principal to string safely
 */
export const principalToString = (principal: Principal | string): string => {
  return principal instanceof Principal ? principal.toString() : principal;
};
