import { Principal } from "@dfinity/principal";

/**
 * ⚠️ CRITICAL: MESSAGE ORDERING SYSTEM
 * 
 * Throughout the entire chat system, messages are stored in REVERSE CHRONOLOGICAL order.
 * This means the NEWEST message is always at index 0, and the OLDEST is at the end.
 * 
 * STORAGE FORMAT (in Redux/Backend):
 * messages: [
 *   { id: "msg_3", message: "Hi" },      // Index 0 - NEWEST MESSAGE
 *   { id: "msg_2", message: "Hello" },   // Index 1
 *   { id: "msg_1", message: "Hey" }      // Index 2 - OLDEST MESSAGE
 * ]
 * 
 * DISPLAY FORMAT (in UI):
 * The MessagesList component REVERSES this array for display:
 * ┌─────────────────┐
 * │ Hey             │ ← Oldest (from index 2)
 * │ Hello           │ ← Middle (from index 1)
 * │ Hi              │ ← Newest (from index 0)
 * └─────────────────┘
 * 
 * KEY RULES FOR DEVELOPERS:
 * 1. NEW messages: Add to BEGINNING → [newMsg, ...existingMessages]
 * 2. OLD messages (infinite scroll): Add to END → [...existingMessages, ...olderMessages]
 * 3. LAST message (chat list): Use index 0 → messages[0]
 * 4. DISPLAY: Reverse array → [...messages].reverse()
 * 
 * WHY THIS APPROACH?
 * - Backend returns messages newest first
 * - Efficient for showing recent messages (no need to find end of array)
 * - Chat list can quickly access last message (index 0)
 * - Consistent with backend data structure
 */

export interface Message {
  id: string;
  message: string;
  sender: Principal | string;
  date: bigint;
  seen_by: (Principal | string)[];
  chat_id: string;
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
  members: Principal[];
  admins: Principal[];
  creator: Principal;
  workspaces: string[];
  unread?: number;
}

export interface User {
  id: string;
  name: string;
  photo?: Uint8Array;
}

export interface ChatWindowPosition {
  x: number;
  y: number;
}

export interface CreateGroupFormData {
  name: string;
  members: User[];
  admins: User[];
  workspace: { id: string; name: string }[];
}
