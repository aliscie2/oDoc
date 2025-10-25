import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { notificationCache, notificationUtils } from "../lib/notifications";
import { darkTheme, lightTheme } from "../lib/theme-colors";
import {
  getStatusColor,
  getStatusLabel,
  getValidationTooltip,
  validatePromise,
  mapFrontendStatusToBackend,
} from "../lib/validation";
import { Promise, PromiseStatus } from "../types/contract";
import { ConditionCell } from "./ConditionCell";
import { ChevronDown, ChevronUp, Trash2 } from "./Icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { UserSelect } from "./UserSelect";
import { backendActor } from "@/utils/backendUtils";
import { CPayment, Notification } from "$/declarations/backend/backend.did";
import { useDispatch } from "react-redux";
import { Principal } from "@dfinity/principal";
interface PromiseCardProps {
  promise: Promise;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (promiseId: string, updates: Partial<Promise>) => void;
  onDelete: (promiseId: string) => void;
  onAddCondition: (promiseId: string) => void;
  onUpdateCondition: (
    promiseId: string,
    conditionId: string,
    fieldName: string,
    value: string,
  ) => void;
  onDeleteCondition: (promiseId: string, conditionId: string) => void;
  currentUserId: string;
  currentUserName?: string;
  currentBalance: number;
  notifications: Notification[];
  onMarkNotificationSeen: (notificationId: string) => void;
}

export function PromiseCard({
  promise,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAddCondition,
  onUpdateCondition,
  onDeleteCondition,
  currentUserId,
  currentUserName: _currentUserName,
  currentBalance,
  notifications,
  onMarkNotificationSeen,
}: PromiseCardProps) {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const colors = theme === "light" ? lightTheme : darkTheme;
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountValue, setAmountValue] = useState(
    promise.amount?.toString() || "",
  );
  const [objectionText, setObjectionText] = useState(
    promise.objectionText || "",
  );
  const [hasChanged, setHasChanged] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const validation = validatePromise({
    currentUserName: currentUserId, // Use Principal ID for validation
    currentBalance,
    promise,
  });

  // Ensure current status is always in the allowed statuses for the selector
  const selectStatuses = validation.allowedStatuses.includes(promise.status)
    ? validation.allowedStatuses
    : [promise.status, ...validation.allowedStatuses];

  // Find unseen notification - backend already filters notifications for current user
  const unseenNotification = useMemo(() => {
    return notificationUtils.findUnseen(promise.id, notifications);
  }, [promise.id, notifications]);

  useEffect(() => {
    setIsNew(true);
    const timer = setTimeout(() => setIsNew(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setHasChanged(true);
    const timer = setTimeout(() => setHasChanged(false), 500);
    return () => clearTimeout(timer);
  }, [promise]);

  useEffect(() => {
    setObjectionText(promise.objectionText || "");
  }, [promise.objectionText]);

  // Auto-derive title from first condition value
  const displayTitle =
    promise.conditions.length > 0
      ? promise.conditions[0].value
      : promise.title || "Untitled";

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.stopPropagation();
    const newStatus = e.target.value as PromiseStatus;

    const isReceiver = promise.receiver === currentUserId;
    const isSender = promise.sender === currentUserId;

    // Receiver actions - call backend directly (don't add to changes)
    if (isReceiver) {
      const cPayment = createCPayment();

      switch (newStatus) {
        case "confirmed": {
          await callBackendForReceiverAction(
            () => backendActor!.confirmed_c_payment(cPayment),
            "Failed to confirm promise",
          );
          break;
        }
        case "objected": {
          const reason = prompt("Enter objection reason:");
          if (reason === null) return;
          await callBackendForReceiverAction(
            () => backendActor!.object_on_cancel(cPayment, reason),
            "Failed to object to promise",
          );
          break;
        }
        case "cancelled": {
          await callBackendForReceiverAction(
            () => backendActor!.confirmed_cancellation(cPayment),
            "Failed to cancel promise",
          );
          break;
        }
        case "escrow_approved": {
          await callBackendForReceiverAction(
            () => backendActor!.approve_high_promise(cPayment),
            "Failed to approve escrow",
          );
          break;
        }
        default:
          alert("Invalid receiver action");
      }
    }
    // Sender actions - update through Redux (will be batched and saved via multi_updates)
    else if (isSender) {
      if (newStatus === "objected") {
        const reason = prompt("Enter objection reason:");
        if (reason === null) return;
        onUpdate(promise.id, {
          status: newStatus,
          objectionText: reason || "",
        });
      } else {
        onUpdate(promise.id, { status: newStatus });
      }
    }
  };

  const handleAmountClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (validation.canEdit) {
      setEditingAmount(true);
    }
  };

  const handleAmountBlur = () => {
    setEditingAmount(false);
    const value = parseFloat(amountValue);
    if (!isNaN(value)) {
      if (value <= currentBalance) {
        onUpdate(promise.id, { amount: value });
      } else {
        alert(`Amount cannot exceed current balance of $${currentBalance}`);
        setAmountValue(promise.amount?.toString() || "0");
      }
    }
  };

  const handleSenderChange = (_userName: string) => {
    // Sender is read-only, no action needed
  };

  const handleReceiverChange = (userName: string) => {
    onUpdate(promise.id, { receiver: userName });
  };

  const handleObjectionSave = async () => {
    const isReceiver = promise.receiver === currentUserId;

    // Receiver action - call backend directly
    if (isReceiver) {
      const cPayment = createCPayment();
      await callBackendForReceiverAction(
        () => backendActor!.object_on_cancel(cPayment, objectionText),
        "Failed to save objection",
      );
    } else {
      // Sender action - update through Redux
      onUpdate(promise.id, { objectionText, status: "objected" });
    }
  };

  // Sender actions
  const handleReleaseEscrow = () => {
    if (
      window.confirm(
        "Lock funds in escrow? Receiver will need to approve before you can release payment.",
      )
    ) {
      onUpdate(promise.id, { status: "escrow_released" });
    }
  };

  const handleReleasePayment = () => {
    if (window.confirm("Release payment to receiver? This cannot be undone.")) {
      onUpdate(promise.id, { status: "released" });
    }
  };

  const handleRequestCancellation = () => {
    if (
      window.confirm(
        "Request cancellation for this promise? Receiver must approve.",
      )
    ) {
      onUpdate(promise.id, { status: "request_cancel" });
    }
  };

  // Helper to create CPayment from Promise
  const createCPayment = (): CPayment => ({
    id: promise.id,
    contract_id: promise.contract_id,
    sender: Principal.fromText(promise.sender),
    receiver: Principal.fromText(promise.receiver),
    amount: promise.amount || 0,
    status: mapFrontendStatusToBackend(promise.status, promise.objectionText),
    date_created: promise.createdAt.getTime() * 1e6,
    date_released: 0,
    cells: promise.conditions.map((c) => ({
      id: c.id,
      field: c.fieldName,
      value: c.value,
    })),
  });

  // Helper to call backend for receiver actions
  // These actions update the backend directly and refetch the contract
  // They do NOT update filesState.changes because the backend already stores the changes
  const callBackendForReceiverAction = async (
    action: () => globalThis.Promise<unknown>,
    errorMessage: string,
  ) => {
    if (!backendActor) {
      alert("Backend not available");
      return;
    }

    setIsUpdating(true);
    try {
      // Call backend method (confirmed_c_payment, object_on_cancel, etc.)
      await action();

      // Refetch contract after backend call to get the updated state
      const result = await backendActor.get_contract(
        promise.sender,
        promise.contract_id,
      );

      if ("Ok" in result && "CustomContract" in result.Ok) {
        // SET_CONTRACT only updates state.contracts, NOT state.changes.contracts
        // This is correct because the backend already has the updated data
        // No need to add to filesState.changes since backend already persisted it
        dispatch({
          type: "SET_CONTRACT",
          contract: result.Ok.CustomContract,
        });
      }
    } catch (error: unknown) {
      console.error(errorMessage, error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      alert(errorMsg || errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // Receiver actions - call backend directly
  const handleConfirm = async () => {
    if (!window.confirm("Confirm this promise?")) return;
    await callBackendForReceiverAction(
      () => backendActor!.confirmed_c_payment(createCPayment()),
      "Failed to confirm promise",
    );
  };

  const handleApproveEscrow = async () => {
    if (!window.confirm("Approve this high promise escrow?")) return;
    await callBackendForReceiverAction(
      () => backendActor!.approve_high_promise(createCPayment()),
      "Failed to approve escrow",
    );
  };

  const handleObject = async () => {
    const reason = prompt("Enter objection reason:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Please provide an objection reason");
      return;
    }
    await callBackendForReceiverAction(
      () => backendActor!.object_on_cancel(createCPayment(), reason),
      "Failed to object to promise",
    );
  };

  const handleConfirmCancellation = async () => {
    if (!window.confirm("Confirm cancellation of this promise?")) return;
    await callBackendForReceiverAction(
      () => backendActor!.confirmed_cancellation(createCPayment()),
      "Failed to confirm cancellation",
    );
  };

  const statusColor = getStatusColor(promise.status, theme === "dark");
  const styles = getStyles(colors, hasChanged, isNew, !!unseenNotification);

  const isSender = promise.sender === currentUserId;
  const isReceiver = promise.receiver === currentUserId;

  // Handle card click - mark notification as seen and toggle expansion
  const handleHeaderClick = () => {
    if (
      unseenNotification &&
      !notificationCache.isProcessing(unseenNotification.id)
    ) {
      notificationCache.markProcessing(unseenNotification.id);
      onMarkNotificationSeen(unseenNotification.id);
      setTimeout(
        () => notificationCache.clearProcessing(unseenNotification.id),
        100,
      );
    }
    onToggle();
  };

  return (
    <TooltipProvider>
      <div
        style={{
          ...styles.card,
          ...(isCardHovered ? styles.cardHovered : {}),
        }}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        {unseenNotification && (
          <div style={styles.notificationBadge}>
            <span style={styles.badge}>New</span>
          </div>
        )}
        <div style={styles.cardHeader} onClick={handleHeaderClick}>
          <div style={styles.mainInfo}>
            <span style={styles.title} title={displayTitle}>
              {displayTitle}
            </span>
            {promise.status === "objected" && promise.objectionText ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <select
                    value={promise.status}
                    onChange={handleStatusChange}
                    disabled={!validation.canChangeStatus || isUpdating}
                    onMouseEnter={() => setHoveredElement("status")}
                    onMouseLeave={() => setHoveredElement(null)}
                    style={{
                      ...styles.statusSelect,
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                      ...(validation.canChangeStatus && !isUpdating
                        ? styles.statusSelectHoverable
                        : { opacity: 0.7, cursor: "not-allowed" }),
                      ...(hoveredElement === "status" &&
                      validation.canChangeStatus &&
                      !isUpdating
                        ? styles.statusSelectHovered
                        : {}),
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {selectStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    <strong>Objection:</strong> {promise.objectionText}
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <select
                value={promise.status}
                onChange={handleStatusChange}
                disabled={!validation.canChangeStatus || isUpdating}
                onMouseEnter={() => setHoveredElement("status")}
                onMouseLeave={() => setHoveredElement(null)}
                style={{
                  ...styles.statusSelect,
                  backgroundColor: statusColor.bg,
                  color: statusColor.text,
                  ...(validation.canChangeStatus && !isUpdating
                    ? styles.statusSelectHoverable
                    : { opacity: 0.7, cursor: "not-allowed" }),
                  ...(hoveredElement === "status" &&
                  validation.canChangeStatus &&
                  !isUpdating
                    ? styles.statusSelectHovered
                    : {}),
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {selectStatuses.map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
            )}
            <span style={styles.separator}>•</span>
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <UserSelect
                value={promise.sender}
                onChange={handleSenderChange}
                disabled={true}
                showTooltip={false}
              />
            </div>
            <span style={styles.arrow}>→</span>
            {validation.canEdit ? (
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseEnter={() => setHoveredElement("receiver")}
                onMouseLeave={() => setHoveredElement(null)}
                style={{
                  ...(hoveredElement === "receiver"
                    ? styles.userSelectHovered
                    : {}),
                }}
              >
                <UserSelect
                  value={promise.receiver}
                  onChange={handleReceiverChange}
                  disabled={false}
                />
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <UserSelect
                      value={promise.receiver}
                      onChange={handleReceiverChange}
                      disabled={true}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getValidationTooltip("edit", promise, validation)}</p>
                </TooltipContent>
              </Tooltip>
            )}
            <span style={styles.separator}>•</span>
            {editingAmount && validation.canEdit ? (
              <input
                type="number"
                value={amountValue}
                onChange={(e) => {
                  e.stopPropagation();
                  setAmountValue(e.target.value);
                }}
                onBlur={handleAmountBlur}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") handleAmountBlur();
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                style={styles.amountInput}
              />
            ) : validation.canEdit ? (
              <span
                style={{
                  ...styles.amount,
                  ...styles.editable,
                  ...(validation.errors.length > 0 ? styles.amountError : {}),
                  ...(hoveredElement === "amount" ? styles.amountHovered : {}),
                }}
                onClick={handleAmountClick}
                onMouseEnter={() => setHoveredElement("amount")}
                onMouseLeave={() => setHoveredElement(null)}
              >
                ${promise.amount?.toLocaleString() || "0"}
              </span>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    style={{
                      ...styles.amount,
                      opacity: 0.8,
                      cursor: "not-allowed",
                    }}
                  >
                    ${promise.amount?.toLocaleString() || "0"}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getValidationTooltip("edit", promise, validation)}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <button
            style={styles.expandButton}
            onClick={(e) => e.stopPropagation()}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {isExpanded && (
          <div style={styles.cardContent}>
            {/* Validation Errors */}
            {validation.errors.length > 0 && (
              <div style={styles.errorBox}>
                {validation.errors.map((error, idx) => (
                  <div key={idx} style={styles.errorText}>
                    ⚠️ {error}
                  </div>
                ))}
              </div>
            )}

            {/* Objection Section */}
            {promise.status === "objected" && (
              <div style={styles.objectionSection}>
                <label style={styles.objectionLabel}>Objection Reason:</label>
                {isReceiver ? (
                  <>
                    <textarea
                      value={objectionText}
                      onChange={(e) => setObjectionText(e.target.value)}
                      placeholder="Explain your objection..."
                      style={styles.objectionTextarea}
                      rows={3}
                      onFocus={(e) =>
                        (e.target.style.borderColor = colors.primary)
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = colors.border)
                      }
                    />
                    <button
                      onClick={handleObjectionSave}
                      style={styles.saveBtn}
                    >
                      Save Objection
                    </button>
                  </>
                ) : (
                  <div style={styles.objectionDisplay}>
                    {promise.objectionText || "No objection text provided"}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons Based on Status and Role */}
            <div style={styles.actionButtons}>
              {/* SENDER ACTIONS */}
              {isSender && (
                <>
                  {/* Release Escrow - only for draft status */}
                  {promise.status === "draft" && (
                    <button
                      onClick={handleReleaseEscrow}
                      style={styles.escrowBtn}
                    >
                      Release Escrow
                    </button>
                  )}

                  {/* Release Payment Button (Sender, for confirmed/escrow_approved/objected/request_cancel) */}
                  {validation.canRelease ? (
                    <button
                      onClick={handleReleasePayment}
                      style={styles.releaseBtn}
                    >
                      Release Payment
                    </button>
                  ) : (
                    (promise.status === "confirmed" ||
                      promise.status === "escrow_approved" ||
                      promise.status === "objected" ||
                      promise.status === "request_cancel") && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            style={{
                              ...styles.releaseBtn,
                              opacity: 0.5,
                              cursor: "not-allowed",
                            }}
                            disabled
                          >
                            Release Payment
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {getValidationTooltip(
                              "release",
                              promise,
                              validation,
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  )}

                  {/* Request Cancellation Button (Sender, for confirmed/escrow_approved) */}
                  {validation.canRequestCancellation ? (
                    <button
                      onClick={handleRequestCancellation}
                      style={styles.cancelBtn}
                    >
                      Request Cancellation
                    </button>
                  ) : (
                    (promise.status === "confirmed" ||
                      promise.status === "escrow_approved") && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            style={{
                              ...styles.cancelBtn,
                              opacity: 0.5,
                              cursor: "not-allowed",
                            }}
                            disabled
                          >
                            Request Cancellation
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {getValidationTooltip(
                              "cancel",
                              promise,
                              validation,
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )
                  )}
                </>
              )}

              {/* RECEIVER ACTIONS */}
              {isReceiver && (
                <>
                  {/* Confirm Promise - for draft status */}
                  {promise.status === "draft" && (
                    <button
                      onClick={handleConfirm}
                      style={{
                        ...styles.confirmBtn,
                        ...(isUpdating ? styles.buttonLoading : {}),
                      }}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "⏳ Confirming..." : "Confirm Promise"}
                    </button>
                  )}

                  {/* Approve Escrow - for escrow_released status */}
                  {promise.status === "escrow_released" && (
                    <button
                      onClick={handleApproveEscrow}
                      style={{
                        ...styles.approveBtn,
                        ...(isUpdating ? styles.buttonLoading : {}),
                      }}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "⏳ Approving..." : "Approve Escrow"}
                    </button>
                  )}

                  {/* Confirm Cancellation - for request_cancel status */}
                  {promise.status === "request_cancel" && (
                    <button
                      onClick={handleConfirmCancellation}
                      style={{
                        ...styles.confirmCancelBtn,
                        ...(isUpdating ? styles.buttonLoading : {}),
                      }}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "⏳ Confirming..." : "Confirm Cancellation"}
                    </button>
                  )}

                  {/* Object Button (Receiver, most statuses) */}
                  {validation.canObject && (
                    <button
                      onClick={handleObject}
                      style={{
                        ...styles.objectBtn,
                        ...(isUpdating ? styles.buttonLoading : {}),
                      }}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "⏳ Objecting..." : "Object to Promise"}
                    </button>
                  )}
                </>
              )}
            </div>

            <div style={styles.editRow}>
              {validation.canEdit ? (
                <button
                  onClick={() => onAddCondition(promise.id)}
                  style={{
                    ...styles.addBtn,
                    ...(hoveredElement === "add-btn" ? styles.addBtnHover : {}),
                  }}
                  onMouseEnter={() => setHoveredElement("add-btn")}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  + Add Condition
                </button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      style={{
                        ...styles.addBtn,
                        opacity: 0.5,
                        cursor: "not-allowed",
                      }}
                      disabled
                    >
                      + Add Condition
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getValidationTooltip("edit", promise, validation)}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <div style={styles.conditionsTable}>
              {promise.conditions.map((condition) => (
                <ConditionCell
                  key={condition.id}
                  condition={condition}
                  onUpdate={(id, fieldName, value) =>
                    onUpdateCondition(promise.id, id, fieldName, value)
                  }
                  onDelete={(id) => onDeleteCondition(promise.id, id)}
                  editable={validation.canEdit}
                />
              ))}
              {promise.conditions.length === 0 && (
                <div style={styles.emptyState}>
                  No conditions - click &quot;Add Condition&quot; to start
                </div>
              )}
            </div>

            {validation.canDelete ? (
              <>
                {deleteConfirm ? (
                  <div style={styles.deleteConfirm}>
                    <span style={styles.deleteText}>Delete this promise?</span>
                    <div style={styles.deleteActions}>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        style={styles.cancelDeleteBtn}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => onDelete(promise.id)}
                        style={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    style={styles.deleteInitBtn}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    style={{
                      ...styles.deleteInitBtn,
                      opacity: 0.5,
                      cursor: "not-allowed",
                    }}
                    disabled
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getValidationTooltip("delete", promise, validation)}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

const getStyles = (
  colors: typeof lightTheme,
  hasChanged: boolean,
  isNew: boolean,
  _hasUnseenNotification: boolean,
): Record<string, React.CSSProperties> => ({
  card: {
    backgroundColor: colors.cardBg,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.cardBorder,
    borderRadius: "8px",
    overflow: "visible",
    boxShadow: colors.cardShadow,
    opacity: isNew ? 0 : 1,
    transform: isNew ? "translateY(-20px)" : "translateY(0)",
    transition: "all 0.2s ease",
    position: "relative" as const,
  },
  cardHovered: {
    borderColor: colors.primary,
    boxShadow: `0 0 0 1px ${colors.primary}, ${colors.cardShadow}`,
  },
  notificationBadge: {
    position: "absolute" as const,
    top: "-8px",
    right: "12px",
    zIndex: 10,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.65rem",
    height: "20px",
    padding: "0 8px",
    borderRadius: "10px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.02em",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
  },
  cardHeader: {
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: colors.cardBg,
  },
  mainInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    fontSize: "13px",
    flexWrap: "wrap" as const,
  },
  title: {
    fontWeight: 600,
    fontSize: "14px",
    color: colors.text,
    transition: "color 0.3s ease",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  statusSelect: {
    padding: "3px 10px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    appearance: "none" as const,
    transition: "all 0.2s ease",
    letterSpacing: "0.03em",
    textTransform: "uppercase" as const,
  },
  statusSelectHoverable: {
    cursor: "pointer",
  },
  statusSelectHovered: {
    boxShadow: `0 0 0 2px ${colors.primary}40`,
    transform: "scale(1.05)",
  },
  userSelectHovered: {
    transform: "scale(1.02)",
    transition: "transform 0.2s ease",
  },
  separator: {
    color: colors.textMuted,
  },
  arrow: {
    color: colors.textMuted,
    fontSize: "12px",
  },
  amount: {
    fontWeight: 500,
    color: colors.text,
    padding: "2px 6px",
    borderRadius: "3px",
    transform: hasChanged ? "scale(1.1)" : "scale(1)",
    transition: "all 0.3s ease",
  },
  amountError: {
    color: colors.error,
    textDecoration: "underline",
  },
  amountHovered: {
    backgroundColor: colors.accent,
    boxShadow: `0 0 0 2px ${colors.primary}40`,
  },
  editable: {
    cursor: "pointer",
  },
  amountInput: {
    width: "80px",
    padding: "3px 8px",
    border: `2px solid ${colors.primary}`,
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: 600,
    outline: "none",
    backgroundColor: colors.inputBg,
    color: colors.text,
    transition: "border-color 0.2s ease",
  },
  expandButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: colors.textSecondary,
    display: "flex",
    alignItems: "center",
  },
  cardContent: {
    padding: "16px",
    borderTop: `1px solid ${colors.borderLight}`,
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
    animation: "slideDown 0.3s ease",
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    border: `1px solid ${colors.errorBorder}`,
    borderRadius: "4px",
    padding: "10px",
    marginTop: "10px",
  },
  errorText: {
    color: colors.error,
    fontSize: "12px",
    fontWeight: 500,
  },
  objectionSection: {
    backgroundColor: colors.accent,
    borderRadius: "4px",
    padding: "10px",
    marginTop: "10px",
  },
  objectionLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: 500,
    color: colors.text,
    marginBottom: "6px",
  },
  objectionTextarea: {
    width: "100%",
    padding: "10px",
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    fontSize: "13px",
    backgroundColor: colors.inputBg,
    color: colors.text,
    resize: "vertical" as const,
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s ease",
  },
  objectionDisplay: {
    padding: "8px",
    backgroundColor: colors.inputBg,
    borderRadius: "4px",
    fontSize: "13px",
    color: colors.text,
    fontStyle: "italic",
  },
  saveBtn: {
    marginTop: "6px",
    padding: "6px 12px",
    backgroundColor: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "background-color 0.2s ease",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
  },
  releaseBtn: {
    padding: "6px 12px",
    backgroundColor: colors.accent,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  cancelBtn: {
    padding: "6px 12px",
    backgroundColor: colors.accent,
    color: colors.error,
    border: `1px solid ${colors.error}`,
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  objectBtn: {
    padding: "6px 12px",
    backgroundColor: colors.warning,
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 500,
  },
  escrowBtn: {
    padding: "6px 12px",
    backgroundColor: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  confirmBtn: {
    padding: "6px 12px",
    backgroundColor: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  approveBtn: {
    padding: "6px 12px",
    backgroundColor: "#0d9488",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  confirmCancelBtn: {
    padding: "6px 12px",
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
    position: "relative" as const,
  },
  editRow: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
  },
  addBtn: {
    padding: "6px 12px",
    backgroundColor: colors.primary,
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#ffffff",
    fontWeight: 600,
    transition: "background-color 0.2s ease",
  },
  addBtnHover: {
    backgroundColor: colors.primaryHover,
  },
  conditionsTable: {
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    overflow: "hidden",
  },
  emptyState: {
    padding: "20px",
    textAlign: "center" as const,
    color: colors.textMuted,
    fontSize: "12px",
  },
  deleteConfirm: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    backgroundColor: colors.errorBg,
    borderRadius: "4px",
    animation: "fadeIn 0.2s ease",
  },
  deleteText: {
    fontSize: "12px",
    color: colors.error,
    fontWeight: 500,
  },
  deleteActions: {
    display: "flex",
    gap: "6px",
  },
  cancelDeleteBtn: {
    padding: "4px 10px",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.cardBg,
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
    color: colors.text,
  },
  deleteBtn: {
    padding: "4px 10px",
    border: "none",
    backgroundColor: colors.error,
    color: "#fff",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  deleteInitBtn: {
    padding: "6px 10px",
    border: `1px solid ${colors.border}`,
    backgroundColor: "transparent",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    color: colors.textSecondary,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "4px",
    alignSelf: "flex-start",
    transition: "all 0.2s ease",
  },
});
