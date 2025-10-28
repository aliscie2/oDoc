import {
  NotificationActions,
  NotificationInitialState,
  notificationInitialState,
} from "../types/notificationTypes";

export function notificationReducer(
  state: NotificationInitialState = notificationInitialState,
  action: NotificationActions,
): NotificationInitialState {
  switch (action.type) {
    case "NOTIFY": {
      let is_in = false;
      const updatedNotifications = state.notifications.map((n) => {
        if (n.id === action.new_notification.id) {
          is_in = true;
          return action.new_notification;
        }
        return n;
      });
      const isNewUnread = !is_in && !action.new_notification.is_seen;
      return {
        ...state,
        notifications: is_in
          ? updatedNotifications
          : [action.new_notification, ...state.notifications],
        totalCount: is_in ? state.totalCount : state.totalCount + 1,
        unreadCount: isNewUnread ? state.unreadCount + 1 : state.unreadCount,
      };
    }
    case "UPDATE_NOT_LIST":
      return {
        ...state,
        notifications: action.new_list,
      };

    case "APPEND_NOTIFICATIONS":
      return {
        ...state,
        notifications: [...state.notifications, ...action.notifications],
        hasMore: action.notifications.length > 0,
      };

    case "SET_TOTAL_COUNT":
      return {
        ...state,
        totalCount: action.count,
      };

    case "SET_UNREAD_COUNT":
      return {
        ...state,
        unreadCount: action.count,
      };

    case "SET_HAS_MORE":
      return {
        ...state,
        hasMore: action.hasMore,
      };

    case "UPDATE_NOTE":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, ...action } : n,
        ),
      };

    case "DELETE_NOTIFY": {
      const deletedNotification = state.notifications.find((n) => n.id === action.id);
      const wasUnread = deletedNotification && !deletedNotification.is_seen;
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.id),
        totalCount: Math.max(0, state.totalCount - 1),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }

    case "NOTIFICATION_SEEN": {
      const notificationToMark = state.notifications.find((n) => n.id === action.id);
      const wasUnreadBefore = notificationToMark && !notificationToMark.is_seen;
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, is_seen: true } : n,
        ),
        unreadCount: wasUnreadBefore ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }

    default:
      return state;
  }
}
