import { Principal } from "@dfinity/principal";
import { Message, User } from "./types";

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
  const usrs = []
  
  return messages.reduce((count, message) => {
    const senderStr = message.sender instanceof Principal 
      ? message.sender.toString() 
      : message.sender;
    
    // Skip if current user is the sender
    if (senderStr === currentUserId) {
      return count;
    }
    
    // Skip if current user has seen this message
    const isSeen = message.seen_by.some(user => {
      const userStr = user instanceof Principal ? user.toString() : user;
      console.log({userStr,currentUserId})
      return userStr === currentUserId;
    });
    
    if (isSeen) {
      return count;
    }
    
    // Message is unread
    return count + 1;
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
