import { Promise, PromiseStatus, PromiseValidation } from "../types/contract";
import { PaymentStatus } from "$/declarations/backend/backend.did";

interface ValidationContext {
  currentUserName: string;
  currentBalance: number;
  promise: Promise;
}

// Map backend PaymentStatus to frontend PromiseStatus
export function mapBackendStatusToFrontend(
  backendStatus: PaymentStatus | PromiseStatus | string,
): {
  status: PromiseStatus;
  objectionText?: string;
} {
  // Handle if already a frontend status string (for compatibility)
  if (typeof backendStatus === "string") {
    const validStatuses: PromiseStatus[] = [
      "draft",
      "escrow_released",
      "escrow_approved",
      "confirmed",
      "objected",
      "released",
      "request_cancel",
      "cancelled",
    ];
    if (validStatuses.includes(backendStatus as PromiseStatus)) {
      return { status: backendStatus as PromiseStatus };
    }
    console.error("Invalid string status:", backendStatus);
    return { status: "draft" };
  }

  // Type guard: ensure backendStatus is an object
  if (!backendStatus || typeof backendStatus !== "object") {
    console.error("Invalid backendStatus:", backendStatus);
    return { status: "draft" }; // fallback for invalid input
  }

  if ("None" in backendStatus) return { status: "draft" };
  if ("HighPromise" in backendStatus) return { status: "escrow_released" };
  if ("ApproveHighPromise" in backendStatus)
    return { status: "escrow_approved" };
  if ("Confirmed" in backendStatus) return { status: "confirmed" };
  if ("Objected" in backendStatus)
    return { status: "objected", objectionText: backendStatus.Objected };
  if ("Released" in backendStatus) return { status: "released" };
  if ("RequestCancellation" in backendStatus)
    return { status: "request_cancel" };
  if ("ConfirmedCancellation" in backendStatus) return { status: "cancelled" };

  return { status: "draft" }; // fallback
}

// Map frontend PromiseStatus to backend PaymentStatus
export function mapFrontendStatusToBackend(
  status: PromiseStatus,
  objectionText?: string,
): PaymentStatus {
  switch (status) {
    case "draft":
      return { None: null };
    case "escrow_released":
      return { HighPromise: null };
    case "escrow_approved":
      return { ApproveHighPromise: null };
    case "confirmed":
      return { Confirmed: null };
    case "objected":
      return { Objected: objectionText || "" };
    case "released":
      return { Released: null };
    case "request_cancel":
      return { RequestCancellation: null };
    case "cancelled":
      return { ConfirmedCancellation: null };
    default:
      return { None: null };
  }
}

// Get available status transitions based on current user role and promise status
export function getAvailableStatusTransitions(
  promise: Promise,
  currentUserName: string,
): PromiseStatus[] {
  const isSender = promise.sender === currentUserName;
  const isReceiver = promise.receiver === currentUserName;
  const currentStatus = promise.status;

  if (isSender) {
    switch (currentStatus) {
      case "confirmed":
      case "escrow_approved":
        return ["request_cancel", "released"];
      case "request_cancel":
        // Sender can still release even during cancellation request
        return ["request_cancel", "released"];
      default:
        return ["draft", "released", "escrow_released"];
    }
  } else if (isReceiver) {
    switch (currentStatus) {
      case "escrow_released":
        return ["objected", "escrow_approved"];
      case "request_cancel":
        return ["objected", "cancelled"];
      default:
        return ["objected", "confirmed"];
    }
  }

  return [currentStatus]; // No transitions available
}

export function validatePromise(context: ValidationContext): PromiseValidation {
  const { currentUserName, currentBalance, promise } = context;
  const isReceiver = promise.receiver === currentUserName;
  const isSender = promise.sender === currentUserName;
  const errors: string[] = [];



  // Default validation
  const validation: PromiseValidation = {
    canEdit: false,
    canDelete: false,
    canChangeStatus: false,
    allowedStatuses: [],
    canObject: false,
    canRelease: false,
    canRequestCancellation: false,
    errors: [],
  };

  // Amount validation
  if (isSender && promise.amount && promise.amount > currentBalance) {
    errors.push(
      `Amount ${promise.amount} exceeds current balance ${currentBalance}`,
    );
  }

  // Sender and receiver cannot be the same
  if (promise.sender === promise.receiver) {
    errors.push("Sender and receiver cannot be the same person");
  }

  // Get allowed status transitions
  validation.allowedStatuses = getAvailableStatusTransitions(
    promise,
    currentUserName,
  );
  validation.canChangeStatus = validation.allowedStatuses.length > 1;

  // Status-based validation
  const status = promise.status;

  // Edit permissions - sender can edit most fields except in final/confirmed states
  if (isSender) {
    if (["draft", "escrow_released"].includes(status)) {
      validation.canEdit = true; // Sender can edit draft and escrow_released
    } else if (["confirmed", "escrow_approved"].includes(status)) {
      validation.canEdit = false; // Confirmed promises are locked (can only change status)
    } else if (["released", "cancelled"].includes(status)) {
      validation.canEdit = false; // Final states are read-only
    } else if (status === "objected") {
      validation.canEdit = false; // Sender cannot edit objected promises
    } else if (status === "request_cancel") {
      validation.canEdit = false; // Cannot edit during pending cancellation
    }
  } else if (isReceiver) {
    // Receiver can only edit objection text when status is objected
    if (status === "objected") {
      validation.canEdit = true;
    } else {
      validation.canEdit = false; // Receiver cannot edit promise details
    }
  }

  // Delete permissions (only sender can delete)
  if (isSender) {
    if (status === "draft" || status === "escrow_released") {
      validation.canDelete = true;
    } else if (status === "objected") {
      validation.canDelete = false; // Cannot delete objected promises
    } else if (status === "request_cancel") {
      validation.canDelete = false; // Cannot delete with pending cancellation
    } else if (status === "confirmed" || status === "escrow_approved") {
      validation.canDelete = false; // Cannot delete confirmed promises
    } else if (status === "released" || status === "cancelled") {
      validation.canDelete = false; // Cannot delete final states
    }
  }

  // Object permission (only receiver can object)
  if (isReceiver && !["released", "cancelled"].includes(status)) {
    validation.canObject = true;
  }

  // Release permission (only sender can release)
  if (isSender) {
    if (
      ["confirmed", "escrow_approved", "objected", "request_cancel"].includes(
        status,
      )
    ) {
      validation.canRelease = true;
    }
  }

  // Request cancellation permission (only sender, only from confirmed/escrow_approved)
  if (isSender && (status === "confirmed" || status === "escrow_approved")) {
    validation.canRequestCancellation = true;
  }

  validation.errors = errors;
  return validation;
}

export function getStatusColor(status: PromiseStatus, isDark: boolean) {
  const colors: Record<
    PromiseStatus,
    { bg: string; text: string; bgDark: string; textDark: string }
  > = {
    draft: {
      bg: "#f5f5f5",
      text: "#737373",
      bgDark: "#262626",
      textDark: "#a3a3a3",
    },
    escrow_released: {
      bg: "#eff6ff",
      text: "#2563eb",
      bgDark: "#1e3a8a",
      textDark: "#93c5fd",
    },
    escrow_approved: {
      bg: "#f0fdfa",
      text: "#0d9488",
      bgDark: "#134e4a",
      textDark: "#5eead4",
    },
    confirmed: {
      bg: "#f0fdf4",
      text: "#059669",
      bgDark: "#14532d",
      textDark: "#6ee7b7",
    },
    objected: {
      bg: "#fef3c7",
      text: "#d97706",
      bgDark: "#78350f",
      textDark: "#fcd34d",
    },
    released: {
      bg: "#f5f3ff",
      text: "#7c3aed",
      bgDark: "#4c1d95",
      textDark: "#c4b5fd",
    },
    request_cancel: {
      bg: "#fef9c3",
      text: "#ca8a04",
      bgDark: "#713f12",
      textDark: "#fde047",
    },
    cancelled: {
      bg: "#fee2e2",
      text: "#dc2626",
      bgDark: "#7f1d1d",
      textDark: "#fca5a5",
    },
  };

  return isDark
    ? { bg: colors[status].bgDark, text: colors[status].textDark }
    : { bg: colors[status].bg, text: colors[status].text };
}

export function getStatusLabel(status: PromiseStatus): string {
  const labels: Record<PromiseStatus, string> = {
    draft: "Draft",
    escrow_released: "High Promise (Escrow)",
    escrow_approved: "Approved High Promise",
    confirmed: "Confirmed",
    objected: "Objected",
    released: "Released",
    request_cancel: "Request Cancellation",
    cancelled: "Confirmed Cancellation",
  };
  return labels[status];
}

export function getValidationTooltip(
  action: "edit" | "delete" | "object" | "release" | "cancel",
  promise: Promise,
  validation: PromiseValidation,
): string | null {
  const status = promise.status;

  switch (action) {
    case "edit":
      if (validation.canEdit) return null;
      if (status === "confirmed" || status === "escrow_approved")
        return "Cannot edit confirmed promises. Only status change to cancellation request or release is allowed";
      if (status === "objected")
        return "Only receiver can edit objected promises";
      if (status === "released") return "Cannot edit released promises";
      if (status === "cancelled") return "Cannot edit cancelled promises";
      return "Cannot edit this promise";

    case "delete":
      if (validation.canDelete) return null;
      if (status === "confirmed" || status === "escrow_approved")
        return "Cannot delete confirmed promises. Use cancellation process instead";
      if (status === "objected")
        return "Cannot delete objected promises. Resolve objection first";
      if (status === "request_cancel")
        return "Cannot delete promise with pending cancellation request. Wait for receiver's response";
      if (status === "released") return "Released payments cannot be deleted";
      if (status === "cancelled") return "Cannot delete cancelled promises";
      return "Only sender can delete their own promises";

    case "object":
      if (validation.canObject) return null;
      if (status === "released") return "Cannot object to released promises";
      if (status === "cancelled") return "Cannot object to cancelled promises";
      return "Only receiver can object to promises";

    case "release":
      if (validation.canRelease) return null;
      if (status === "draft")
        return "Cannot release draft promises - confirm them first or set as high promise";
      if (status === "escrow_released")
        return "High promise in escrow - waiting for receiver to approve";
      if (status === "released") return "Promise already released";
      if (status === "cancelled") return "Cannot release cancelled promises";
      return "Only sender can release payment";

    case "cancel":
      if (validation.canRequestCancellation) return null;
      if (status === "draft") return "Delete draft promises instead";
      if (status === "objected")
        return "Cannot cancel objected promises - resolve objection first";
      if (status === "released") return "Cannot cancel released promises";
      if (status === "cancelled") return "Promise already cancelled";
      if (status === "request_cancel") return "Cancellation already requested";
      return "You can only request cancellation for confirmed or approved promises";

    default:
      return null;
  }
}
