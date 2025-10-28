import { Notification } from "$/declarations/backend/backend.did";

export type NotificationActions =
  | { type: "NOTIFY"; new_notification: Notification }
  | { type: "UPDATE_NOT_LIST"; new_list: Notification[] }
  | { type: "APPEND_NOTIFICATIONS"; notifications: Notification[] }
  | { type: "SET_TOTAL_COUNT"; count: number }
  | { type: "SET_UNREAD_COUNT"; count: number }
  | { type: "SET_HAS_MORE"; hasMore: boolean }
  | { type: "DELETE_NOTIFY"; id: string }
  | { type: "UPDATE_NOTE"; id: string }
  | { type: "NOTIFICATION_SEEN"; id: string };

// | FriendsActions;

export interface NotificationInitialState {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
  hasMore: boolean;
}

export const notificationInitialState: NotificationInitialState = {
  notifications: [],
  totalCount: 0,
  unreadCount: 0,
  hasMore: true,
};
