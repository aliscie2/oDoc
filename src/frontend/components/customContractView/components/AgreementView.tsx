import { useState } from "react";
import { ContractHeader } from "./ContractHeader";
import { PromiseCard } from "./PromiseCard";
import { CustomContract } from "$/declarations/backend/backend.did";
import { ViewMode, Promise } from "../types/contract";
import { useTheme } from "../contexts/ThemeContext";
import { lightTheme, darkTheme } from "../lib/theme-colors";
import { Notification } from "$/declarations/backend/backend.did";
import { mapBackendStatusToFrontend, mapFrontendStatusToBackend } from "../lib/validation";

interface AgreementViewProps {
  contract: CustomContract;
  currentUserId: string;
  currentUserName: string;
  currentBalance: number;
  notifications: Notification[];
  isContractPage?: boolean;
  onAddPromise?: () => void;
  onDeletePromise?: (promiseId: string) => void;
  onUpdatePromise?: (promiseId: string, updates: Partial<Promise>) => void;
  onContractNameChange?: (name: string) => void;
  onDeleteContract?: () => void;
  onMarkNotificationSeen?: (notificationId: string) => void;
}

export function AgreementView({
  contract,
  currentUserId,
  currentUserName,
  currentBalance,
  notifications,
  isContractPage: _isContractPage = true,
  onAddPromise = () => {},
  onDeletePromise = () => {},
  onUpdatePromise = () => {},
  onContractNameChange = () => {},
  onDeleteContract = () => {},
  onMarkNotificationSeen = () => {},
}: AgreementViewProps) {
  const { theme } = useTheme();
  const colors = theme === "light" ? lightTheme : darkTheme;
  const [viewMode, setViewMode] = useState<ViewMode>("promises");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const filteredPromises =
    viewMode === "payments"
      ? contract.promises.filter((p) => Object.keys(p.status)[0] === "Released")
      : contract.promises.filter((p) => Object.keys(p.status)[0] !== "Released");

  const paymentsCount = contract.promises.filter(
    (p) => Object.keys(p.status)[0] === "Released",
  ).length;
  
  const promisesCount = contract.promises.filter(
    (p) => Object.keys(p.status)[0] !== "Released",
  ).length;

  const handleToggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Wrapper to convert frontend status to backend format before updating
  const handlePromiseUpdate = (promiseId: string, updates: Partial<Promise>) => {
    // If status is being updated, convert it to backend format
    if (updates.status) {
      const backendStatus = mapFrontendStatusToBackend(
        updates.status,
        updates.objectionText
      );
      onUpdatePromise(promiseId, {
        ...updates,
        status: backendStatus as unknown as Promise["status"], // Backend expects PaymentStatus object
      });
    } else {
      onUpdatePromise(promiseId, updates);
    }
  };

  const handleAddCondition = (promiseId: string) => {
    // Add a new condition (cell) to the promise
    const promise = contract.promises.find((p) => p.id === promiseId);
    if (!promise) return;

    const newCondition = {
      id: `condition_${Date.now()}`,
      field: "New Condition",
      value: "",
    };

    const updatedCells = [...(promise.cells || []), newCondition];

    // Type assertion needed because cells aren't part of Promise type but are in CPayment
    onUpdatePromise(promiseId, {
      cells: updatedCells,
    } as Partial<Promise>);
  };

  const handleUpdateCondition = (
    promiseId: string,
    conditionId: string,
    fieldName: string,
    value: string,
  ) => {
    // Update a condition (cell) in the promise
    const promise = contract.promises.find((p) => p.id === promiseId);
    if (!promise) return;

    const updatedCells = (promise.cells || []).map((cell) =>
      cell.id === conditionId ? { ...cell, field: fieldName, value } : cell,
    );

    // Type assertion needed because cells aren't part of Promise type but are in CPayment
    onUpdatePromise(promiseId, {
      cells: updatedCells,
    } as Partial<Promise>);
  };

  const handleDeleteCondition = (promiseId: string, conditionId: string) => {
    // Delete a condition (cell) from the promise
    const promise = contract.promises.find((p) => p.id === promiseId);
    if (!promise) return;

    const updatedCells = (promise.cells || []).filter(
      (cell) => cell.id !== conditionId,
    );

    // Type assertion needed because cells aren't part of Promise type but are in CPayment
    onUpdatePromise(promiseId, {
      cells: updatedCells,
    } as Partial<Promise>);
  };

  const styles = getStyles(colors);

  return (
    <div style={styles.container}>
      <ContractHeader
        contractName={contract.name}
        contractId={contract.id}
        contractCreator={contract.creator}
        currentUserId={currentUserId}
        onContractNameChange={onContractNameChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewPromise={onAddPromise}
        onDeleteContract={onDeleteContract}
        promisesCount={promisesCount}
        paymentsCount={paymentsCount}
        currentBalance={currentBalance}
      />

      <div style={styles.content}>
        {filteredPromises.length > 0 ? (
          <div style={styles.cardList}>
            {filteredPromises.map((payment) => {
              // Map backend PaymentStatus to frontend PromiseStatus
              const { status: mappedStatus, objectionText } = 
                mapBackendStatusToFrontend(payment.status);

              // Convert CPayment to Promise type for display
              // Map cells to conditions
              const conditions = (payment.cells || []).map((cell) => ({
                id: cell.id,
                fieldName: cell.field,
                value: cell.value,
              }));

              const promise: Promise = {
                id: payment.id,
                contract_id: payment.contract_id,
                title: "Payment", // CPayment doesn't have a title field
                status: mappedStatus,
                sender: payment?.sender?.toString(),
                receiver: payment?.receiver?.toString(),
                amount: Number(payment.amount),
                conditions: conditions,
                createdAt: new Date(payment.date_created),
                objectionText,
              };

              return (
                <PromiseCard
                  key={payment.id}
                  promise={promise}
                  isExpanded={expandedCards.has(payment.id)}
                  onToggle={() => handleToggleCard(payment.id)}
                  onUpdate={handlePromiseUpdate}
                  onDelete={onDeletePromise}
                  onAddCondition={handleAddCondition}
                  onUpdateCondition={handleUpdateCondition}
                  onDeleteCondition={handleDeleteCondition}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  currentBalance={currentBalance}
                  notifications={notifications}
                  onMarkNotificationSeen={onMarkNotificationSeen}
                />
              );
            })}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.textMuted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: "12px" }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h3 style={styles.emptyTitle}>
              {viewMode === "promises" ? "No Promises Yet" : "No Payments Yet"}
            </h3>
            <p style={styles.emptyText}>
              {viewMode === "promises"
                ? "Get started by creating your first promise"
                : "Completed promises will appear here as payments"}
            </p>
            {viewMode === "promises" && (
              <button onClick={onAddPromise} style={styles.createButton}>
                Create Promise
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const getStyles = (
  colors: typeof lightTheme,
): Record<string, React.CSSProperties> => ({
  container: {
    minHeight: "100vh",
    backgroundColor: colors.bg,
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  cardList: {
  display: "flex",
  flexDirection: "column" as const,
  gap: "16px",
  maxHeight: "calc(100vh - 250px)", // Adjust based on your header height
  overflowY: "auto" as const,
  paddingRight: "4px", // Prevent content jump when scrollbar appears
},
  emptyState: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center" as const,
  },
  emptyTitle: {
    margin: "0 0 6px 0",
    fontSize: "16px",
    fontWeight: 500,
    color: colors.text,
  },
  emptyText: {
    margin: "0 0 20px 0",
    fontSize: "13px",
    color: colors.textSecondary,
  },
  createButton: {
    padding: "8px 16px",
    backgroundColor: colors.primary,
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
  },
});
