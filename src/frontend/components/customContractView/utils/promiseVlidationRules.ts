import { CPayment } from "$/declarations/backend/backend.did";

export interface ValidationRule {
  name: string;
  validator: (
    payment: CPayment,
    profileId: string,
    oldPayment?: CPayment,
  ) => string | null;
  actions: string[];
  statusRestrictions?: string[];
}

const getStatus = (payment: CPayment): string =>
  Object.keys(payment.status)[0] || "None";

export const VALIDATION_RULES: ValidationRule[] = [
  {
    name: "sender_receiver_not_same",
    validator: (payment) =>
      payment.sender.toString() === payment.receiver.toString()
        ? "Sender and receiver cannot be the same person"
        : null,
    actions: ["create", "update"],
  },
  {
    name: "sender_can_release",
    validator: (payment, profileId) =>
      getStatus(payment) === "Released" &&
      payment.sender.toString() !== profileId
        ? "Only sender can release payment"
        : null,
    actions: ["create", "update"],
  },
  {
    name: "receiver_can_confirm",
    validator: (payment, profileId) =>
      getStatus(payment) === "Confirmed" &&
      payment.receiver.toString() !== profileId
        ? "Only receiver can confirm payment"
        : null,
    actions: ["update"],
  },
  {
    name: "receiver_can_approve",
    validator: (payment, profileId) =>
      getStatus(payment) === "ApproveHighPromise" &&
      payment.receiver.toString() !== profileId
        ? "Only receiver can approve high promise"
        : null,
    actions: ["update"],
  },
  {
    name: "receiver_can_object",
    validator: (payment, profileId) =>
      getStatus(payment) === "Objected" &&
      payment.receiver.toString() !== profileId
        ? "Only receiver can object to payment"
        : null,
    actions: ["update"],
  },
  {
    name: "sender_can_request_cancellation",
    validator: (payment, profileId, oldPayment) => {
      if (getStatus(payment) === "RequestCancellation") {
        if (payment.sender.toString() !== profileId) {
          return "Only sender can request cancellation";
        }
        if (oldPayment) {
          const oldStatus = getStatus(oldPayment);
          if (!["Confirmed", "ApproveHighPromise"].includes(oldStatus)) {
            return "You can only request cancellation for confirmed or approved promises";
          }
        }
      }
      return null;
    },
    actions: ["update"],
  },
  {
    name: "receiver_can_confirm_cancellation",
    validator: (payment, profileId) =>
      getStatus(payment) === "ConfirmedCancellation" &&
      payment.receiver.toString() !== profileId
        ? "Only receiver can confirm cancellation"
        : null,
    actions: ["update"],
  },
  {
    name: "sender_can_create_high_promise",
    validator: (payment, profileId) =>
      getStatus(payment) === "HighPromise" &&
      payment.sender.toString() !== profileId
        ? "Only sender can create high promise"
        : null,
    actions: ["create", "update"],
  },
  {
    name: "sender_can_delete_own",
    validator: (payment, profileId) =>
      payment.sender.toString() !== profileId
        ? "You can only delete your own promises"
        : null,
    actions: ["delete"],
  },
  {
    name: "no_update_objected_promise",
    validator: (payment, profileId, oldPayment) => {
      if (
        oldPayment &&
        getStatus(oldPayment) === "Objected" &&
        payment.sender.toString() === profileId
      ) {
        return "Cannot update objected promises. Only receiver can resolve objections";
      }
      return null;
    },
    actions: ["update"],
  },
  {
    name: "no_delete_objected",
    validator: (payment) =>
      getStatus(payment) === "Objected"
        ? "Cannot delete objected promises. Resolve objection first"
        : null,
    actions: ["delete"],
    statusRestrictions: ["Objected"],
  },
  {
    name: "no_update_cancellation_requested",
    validator: (payment, profileId, oldPayment) => {
      if (
        oldPayment &&
        getStatus(oldPayment) === "RequestCancellation" &&
        payment.sender.toString() === profileId
      ) {
        return "Cannot update promise with pending cancellation request. Wait for receiver's response";
      }
      return null;
    },
    actions: ["update"],
  },
  {
    name: "no_delete_cancellation_requested",
    validator: (payment) =>
      getStatus(payment) === "RequestCancellation"
        ? "Cannot delete promise with pending cancellation request. Wait for receiver's response"
        : null,
    actions: ["delete"],
    statusRestrictions: ["RequestCancellation"],
  },
  {
    name: "no_delete_confirmed",
    validator: (payment) =>
      ["Confirmed", "ApproveHighPromise"].includes(getStatus(payment))
        ? "Cannot delete confirmed promises. Use cancellation process instead"
        : null,
    actions: ["delete"],
    statusRestrictions: ["Confirmed", "ApproveHighPromise"],
  },
  {
    name: "no_delete_released",
    validator: (payment) =>
      getStatus(payment) === "Released"
        ? "Released payments cannot be deleted"
        : null,
    actions: ["delete"],
    statusRestrictions: ["Released"],
  },
];

export const validatePayment = (
  payment: CPayment,
  profileId: string,
  action: string,
  oldPayment?: CPayment,
): string | null => {
  for (const rule of VALIDATION_RULES) {
    if (rule.actions.includes(action)) {
      const error = rule.validator(payment, profileId, oldPayment);
      if (error) return error;
    }
  }
  return null;
};

export const canPerformAction = (
  payment: CPayment,
  profileId: string,
  action: string,
): boolean => {
  return validatePayment(payment, profileId, action) === null;
};

export const getActionTooltip = (
  payment: CPayment,
  profileId: string,
  action: string,
): string => {
  const error = validatePayment(payment, profileId, action);
  return error || "";
};

export const getAvailableStatusTransitions = (
  payment: CPayment,
  profileId: string,
): string[] => {
  const isSender = profileId === payment.sender.toString();
  const isReceiver = profileId === payment.receiver.toString();
  const currentStatus = getStatus(payment);

  if (isSender) {
    switch (currentStatus) {
      case "ApproveHighPromise":
      case "Confirmed":
        return ["RequestCancellation", "Released"];
      default:
        return ["None", "Released", "HighPromise"];
    }
  } else if (isReceiver) {
    switch (currentStatus) {
      case "HighPromise":
        return ["Objected", "ApproveHighPromise"];
      case "RequestCancellation":
        return ["Objected", "ConfirmedCancellation"];
      default:
        return ["Objected", "Confirmed"];
    }
  }
  return [];
};
