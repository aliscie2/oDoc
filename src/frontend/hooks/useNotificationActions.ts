import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backendActor } from "@/utils/backendUtils";
import { RootState } from "@/redux/reducers";
import { Notification } from "$/declarations/backend/backend.did";

export const useNotificationActions = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector(
    (state: RootState) => state.notificationState
  );

  const markAsRead = useCallback(
    async (notificationId: string) => {
      const notification = notifications.find(
        (n: Notification) => n.id === notificationId
      );
      if (!notification || notification.is_seen) return;

      try {
        await backendActor?.see_notifications([notificationId]);
        dispatch({ type: "NOTIFICATION_SEEN", id: notificationId });

        // Re-fetch unread count from backend to ensure accuracy
        const freshUnreadCount =
          await backendActor?.get_unread_notifications_count();
        if (freshUnreadCount !== undefined) {
          dispatch({
            type: "SET_UNREAD_COUNT",
            count: Number(freshUnreadCount),
          });
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [notifications, dispatch]
  );

  const markAllAsRead = useCallback(
    async (notificationIds?: string[]) => {
      const unreadIds =
        notificationIds ||
        notifications
          .filter((n: Notification) => !n.is_seen)
          .map((n: Notification) => n.id);

      if (unreadIds.length === 0) return;

      try {
        await backendActor?.see_notifications(unreadIds);
        // Update all at once in Redux
        dispatch({
          type: "UPDATE_NOT_LIST",
          new_list: notifications.map((n: Notification) =>
            unreadIds.includes(n.id) ? { ...n, is_seen: true } : n
          ),
        });

        // Re-fetch unread count from backend instead of calculating locally
        const freshUnreadCount =
          await backendActor?.get_unread_notifications_count();
        if (freshUnreadCount !== undefined) {
          dispatch({
            type: "SET_UNREAD_COUNT",
            count: Number(freshUnreadCount),
          });
        }
      } catch (error) {
        console.error("Error marking all as read:", error);
      }
    },
    [notifications, dispatch]
  );

  return {
    markAsRead,
    markAllAsRead,
  };
};
