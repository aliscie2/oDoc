import { useState } from "react";
import { useTheme, Theme } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Plus, Trash2 } from "./Icons";
import { ViewMode } from "../types/contract";
import { encodeContractUrl } from "@/utils/urlEncoder";

interface ContractHeaderProps {
  contractName: string;
  contractId: string;
  contractCreator: string;
  currentUserId: string;
  onContractNameChange: (name: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNewPromise: () => void;
  onDeleteContract: () => void;
  promisesCount: number;
  paymentsCount: number;
  currentBalance: number;
}

export function ContractHeader({
  contractName,
  contractId,
  contractCreator,
  currentUserId,
  onContractNameChange,
  viewMode,
  onViewModeChange,
  onNewPromise,
  onDeleteContract,
  promisesCount,
  paymentsCount,
  currentBalance,
}: ContractHeaderProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(contractName);
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpenButtonHovered, setIsOpenButtonHovered] = useState(false);

  const isCreator = contractCreator === currentUserId;
  const isContractPage = location.pathname.includes("/contract");

  const handleOpenInFull = () => {
    const encoded = encodeContractUrl({
      id: contractId,
      owner: contractCreator,
    });
    navigate(`/contract?data=${encoded}`);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      onContractNameChange(titleValue);
    } else {
      setTitleValue(contractName);
    }
  };

  const handleDeleteClick = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this contract? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteContract();
    } catch (error) {
      console.error("Failed to delete contract:", error);
      alert("Failed to delete contract. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const styles = getStyles(theme);

  return (
    <div style={styles.header}>
      <div style={styles.container}>
        {!isContractPage && (
          <button
            onClick={handleOpenInFull}
            style={{
              ...styles.openInFullButton,
              ...(isOpenButtonHovered
                ? {
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.primary.main,
                  }
                : {}),
            }}
            onMouseEnter={() => setIsOpenButtonHovered(true)}
            onMouseLeave={() => setIsOpenButtonHovered(false)}
            title="Open in full page"
          >
            <OpenInFullIcon style={{ fontSize: 18 }} />
          </button>
        )}
        {isCreator && isEditingTitle ? (
          <input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
            autoFocus
            style={styles.titleInput}
          />
        ) : (
          <h1
            style={{
              ...styles.title,
              ...(isCreator && isTitleHovered ? styles.titleHovered : {}),
              cursor: isCreator ? "pointer" : "default",
            }}
            onClick={() => isCreator && setIsEditingTitle(true)}
            onMouseEnter={() => isCreator && setIsTitleHovered(true)}
            onMouseLeave={() => isCreator && setIsTitleHovered(false)}
          >
            {contractName || "Untitled"}
          </h1>
        )}

        <div style={styles.tabs}>
          <button
            onClick={() => onViewModeChange("promises")}
            style={{
              ...styles.tab,
              ...(viewMode === "promises" ? styles.tabActive : {}),
            }}
          >
            Promises{" "}
            <span
              style={{
                ...styles.badge,
                ...(viewMode === "promises" ? styles.badgeActive : {}),
              }}
            >
              {promisesCount}
            </span>
          </button>
          <button
            onClick={() => onViewModeChange("payments")}
            style={{
              ...styles.tab,
              ...(viewMode === "payments" ? styles.tabActive : {}),
            }}
          >
            Payments{" "}
            <span
              style={{
                ...styles.badge,
                ...(viewMode === "payments" ? styles.badgeActive : {}),
              }}
            >
              {paymentsCount}
            </span>
          </button>
        </div>

        {isCreator && (
          <div style={styles.actions}>
            {isContractPage && (
              <div style={styles.balance}>
                Balance:{" "}
                <span style={styles.balanceAmount}>
                  ${currentBalance.toLocaleString()}
                </span>
              </div>
            )}
            <button onClick={onNewPromise} style={styles.addButton}>
              <Plus size={16} />
              <span style={styles.addButtonText}>New</span>
            </button>
            <button
              onClick={handleDeleteClick}
              style={styles.deleteButton}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <CircularProgress size={16} style={{ color: "inherit" }} />
              ) : (
                <Trash2 size={16} />
              )}
              <span style={styles.deleteButtonText}>
                {isDeleting ? "Deleting..." : "Delete"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const getStyles = (theme: Theme): Record<string, React.CSSProperties> => ({
  header: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap" as const,
  },
  openInFullButton: {
    padding: "8px",
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: theme.palette.text.primary,
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
  },
  titleHovered: {
    backgroundColor: theme.palette.action.hover,
  },
  titleInput: {
    fontSize: "16px",
    fontWeight: 700,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: "4px",
    padding: "5px 10px",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  tabs: {
    display: "flex",
    gap: "6px",
    flex: 1,
    minWidth: "200px",
  },
  tab: {
    padding: "6px 14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: 600,
    color: theme.palette.text.secondary,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  },
  tabActive: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  badge: {
    backgroundColor: theme.palette.divider,
    padding: "2px 7px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: "1",
  },
  badgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    color: "#ffffff",
  },
  actions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  balance: {
    padding: "8px 14px",
    backgroundColor: theme.palette.action.hover,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: "4px",
    fontSize: "13px",
    color: theme.palette.text.secondary,
    fontWeight: 600,
  },
  balanceAmount: {
    color: theme.palette.text.primary,
    fontWeight: 700,
  },
  addButton: {
    padding: "8px 16px",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 700,
    transition: "background-color 0.2s ease",
  },
  addButtonText: {
    display: "inline",
  },
  deleteButton: {
    padding: "8px 16px",
    backgroundColor: theme.palette.error.main,
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    fontWeight: 700,
    transition: "background-color 0.2s ease, opacity 0.2s ease",
    opacity: 1,
  },
  deleteButtonText: {
    display: "inline",
  },
});
