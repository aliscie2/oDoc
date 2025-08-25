import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/reducers";
import {
  Notification,
  CPayment,
} from "../../../../declarations/backend/backend.did";

export const useContractNotifications = () => {
  const { notifications } = useSelector(
    (state: RootState) => state.notificationState,
  );

  console.log(
    "useContractNotifications initialized with",
    notifications.length,
    "total notifications",
  );

  // Filter and group contract notifications
  const contractNotificationMap = useMemo(() => {
    const contractNotifications = notifications.filter(
      (notification: Notification) =>
        "CPaymentContract" in notification.content,
    );

    console.log(
      "Found",
      contractNotifications.length,
      "contract payment notifications",
    );

    const notificationsByContract = new Map<string, Notification[]>();

    contractNotifications.forEach((notification) => {
      if ("CPaymentContract" in notification.content) {
        const payment: CPayment = notification.content.CPaymentContract[0];
        const contractId = payment.contract_id;

        if (!notificationsByContract.has(contractId)) {
          notificationsByContract.set(contractId, []);
        }
        notificationsByContract.get(contractId)!.push(notification);
      }
    });

    console.log(
      "Grouped notifications into",
      notificationsByContract.size,
      "contracts",
    );

    return notificationsByContract;
  }, [notifications]);

  return {
    contractNotificationMap,
  };
};
