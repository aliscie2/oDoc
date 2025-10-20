// chatTypesAndActionTypes.ts
import { Chat, Message } from "../../../declarations/backend/backend.did";
import { Principal } from "@dfinity/principal";

// Action Type Constants
export const OPEN_CHAT = "OPEN_CHAT";
export const SET_CHATS = "SET_CHATS";
export const SEND_MESSAGE = "SEND_MESSAGE";
export const UPDATE_MESSAGE = "UPDATE_MESSAGE";
export const ADD_NOTIFICATION = "ADD_NOTIFICATION";
export const UPDATE_NOTIFICATION = "UPDATE_NOTIFICATION";
export const SET_CHATS_NOTIFICATIONS = "SET_CHATS_NOTIFICATIONS";
export const DELETE_CHATS_NOTIFICATIONS = "DELETE_CHATS_NOTIFICATIONS";

export const ADD_CHATS_NOTIFICATIONS = "ADD_CHATS_NOTIFICATIONS";
export const DELETE_CHAT = "DELETE_CHAT";
export const UPDATE_CHAT = "UPDATE_CHAT";
export const ADD_CHAT = "ADD_CHAT";
export const EXTEND_CHATS = "EXTEND_CHATS";
export const TOGGLE_CHAT_MINIMIZE = "TOGGLE_CHAT_MINIMIZE";
export const CLOSE_CHAT_WINDOW = "CLOSE_CHAT_WINDOW";

// Action Types
export type ChatActions =
  | { type: typeof OPEN_CHAT; chatId: string; current_user?: Principal }
  | { type: typeof SET_CHATS; chats: Chat[] }
  | { type: typeof EXTEND_CHATS; chats: Chat[] }
  | { type: typeof SEND_MESSAGE; message: Message }
  | { type: typeof UPDATE_MESSAGE; message: Message }
  | { type: typeof ADD_NOTIFICATION; message: Message }
  | { type: typeof UPDATE_NOTIFICATION; message: Message }
  | { type: typeof SET_CHATS_NOTIFICATIONS; messages: Message[] }
  | { type: typeof DELETE_CHATS_NOTIFICATIONS; chat_id: string }
  | { type: typeof DELETE_CHAT; chat_id: string }
  | { type: typeof UPDATE_CHAT; chat: Chat }
  | { type: typeof ADD_CHATS_NOTIFICATIONS; message: Message }
  | { type: typeof ADD_CHAT; chat: Chat }
  | { type: typeof TOGGLE_CHAT_MINIMIZE; chatId: string }
  | { type: typeof CLOSE_CHAT_WINDOW; chatId: string };

// State Types
export type ChatState = {
  current_chat_id: string | false;
  chats: Array<Chat>;
  current_user: Principal;
  chats_notifications: Array<Message>;
  openChatWindows: Record<string, { isMinimized: boolean }>;
};

// Initial State
export const initialChatsState: ChatState = {
  current_chat_id: false,
  current_user: Principal.fromText("2vxsx-fae"),
  chats: [],
  chats_notifications: [],
  openChatWindows: {},
};
