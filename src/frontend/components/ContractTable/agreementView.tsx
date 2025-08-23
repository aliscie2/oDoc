import {
  CPayment,
  CustomContract,
  Friend,
} from "$/declarations/backend/backend.did";
import { RootState } from "@/redux/reducers";
import { Principal } from "@dfinity/principal";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import HandshakeIcon from "@mui/icons-material/Handshake";
import PaymentIcon from "@mui/icons-material/Payment";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Fade,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { debounce } from "lodash";
import { useSnackbar } from "notistack";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { createShortContractUrl } from "../../utils/urlEncoder";
import UserAvatarMenu from "../MainComponents/UserAvatarMenu";
import CopyButton from "../MuiComponents/copyButton";
import DeleteContractButton from "./deleteContractButton";
import { createNewPromis, getStatusOptions } from "./utils";

interface User {
  id: string;
  name: string;
}

interface AppState {
  filesState: {
    profile: User;
    all_friends: Friend[];
    wallet: { balance: number };
    contracts: Record<string, { promises: CPayment[] }>;
  };
}

// Utility functions
const formatStatus = (status: any): string => {
  const key = Object.keys(status || {})[0] || "None";
  return key === "Objected" && status?.[key] ? `${key}: ${status[key]}` : key;
};

const getStatusConfig = (status: any) => {
  const configs = {
    None: { color: "#64748b", bg: "#f1f5f9", icon: "⏳" },
    Released: { color: "#059669", bg: "#ecfdf5", icon: "✅" },
    Confirmed: { color: "#0284c7", bg: "#eff6ff", icon: "🤝" },
    Objected: { color: "#dc2626", bg: "#fef2f2", icon: "⚠️" },
    HighPromise: { color: "#ea580c", bg: "#fff7ed", icon: "⭐" },
  };
  const key = Object.keys(status || {})[0] || "None";
  return configs[key as keyof typeof configs] || configs.None;
};

// Custom hooks
const usePromiseActions = (promise: CPayment, isEditable: boolean) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { profile, all_friends, wallet, contracts } = useSelector(
    (state: AppState) => state.filesState,
  );

  const updatePromise = useCallback(
    (updates: Partial<CPayment>) => {
      if (!isEditable) return;

      const currentContract = Object.values(contracts).find((c) =>
        c.promises?.some((p) => p.id === promise.id),
      );
      if (!currentContract) return;

      const updatedPromises = currentContract.promises.map((p) =>
        p.id === promise.id ? { ...p, ...updates } : p,
      );

      dispatch({
        type: "UPDATE_PROMISES",
        contract_id: promise.contract_id,
        promises: updatedPromises,
      });
    },
    [dispatch, promise, contracts, isEditable],
  );

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      if (!isEditable) return;

      const statusMap: Record<string, any> = {
        None: { None: null },
        Released: { Released: null },
        Confirmed: { Confirmed: null },
        HighPromise: { HighPromise: null },
      };

      if (newStatus === "Objected") {
        const reason = prompt("Enter objection reason:");
        if (reason === null) return;
        statusMap.Objected = { Objected: reason || "" };
      }

      updatePromise({ status: statusMap[newStatus] });
    },
    [updatePromise, isEditable],
  );

  const handleAmountChange = useCallback(
    (newAmount: string) => {
      if (!isEditable) return;

      const amount = parseFloat(newAmount) || 0;
      if (amount > wallet.balance) {
        enqueueSnackbar("Error: Not enough balance", { variant: "error" });
        return;
      }
      updatePromise({ amount });
    },
    [updatePromise, wallet.balance, enqueueSnackbar, isEditable],
  );

  const handleReceiverChange = useCallback(
    (newReceiver: string) => {
      if (!isEditable) return;

      const user = all_friends?.find((u) => u.name === newReceiver);
      if (!user || promise.sender.toString() === user.id) {
        enqueueSnackbar("Error: You can't send to yourself", {
          variant: "error",
        });
        return;
      }
      updatePromise({ receiver: Principal.fromText(user.id) });
    },
    [updatePromise, all_friends, promise.sender, enqueueSnackbar, isEditable],
  );

  const handleDeletePromise = useCallback(() => {
    if (!isEditable) return;

    if (window.confirm("Delete this agreement?")) {
      dispatch({
        type: "DELETE_PROMISE",
        contract_id: promise.contract_id,
        id: promise.id,
      });
    }
  }, [dispatch, promise, isEditable]);

  return {
    updatePromise,
    handleStatusChange,
    handleAmountChange,
    handleReceiverChange,
    handleDeletePromise,
  };
};

const useUserData = () => {
  const { profile, all_friends } = useSelector(
    (state: AppState) => state.filesState,
  );

  return useCallback(
    (principalId: Principal) => {
      const id = principalId?.toString();
      if (id === profile.id) return { name: "You", user: profile };
      const friend = all_friends?.find((u) => u.id === id);
      return { name: friend?.name || "Unknown", user: friend };
    },
    [profile, all_friends],
  );
};

// Condition cell component
const ConditionCell = memo<{
  cell: { id: string; field: string; value: string };
  onUpdateField: (oldField: string, newField: string) => void;
  onUpdateValue: (field: string, value: string) => void;
  onRemove: (field: string) => void;
  isEditable: boolean;
}>(({ cell, onUpdateField, onUpdateValue, onRemove, isEditable }) => {
  const [fieldValue, setFieldValue] = useState(cell.field.replace(/_/g, " "));
  const [contentValue, setContentValue] = useState(cell.value);

  const handleFieldBlur = useCallback(() => {
    if (!isEditable) return;
    const newField = fieldValue.replace(/\s+/g, "_");
    if (newField !== cell.field) {
      onUpdateField(cell.field, newField);
    }
  }, [fieldValue, cell.field, onUpdateField, isEditable]);

  const handleContentBlur = useCallback(() => {
    if (!isEditable) return;
    if (contentValue !== cell.value) {
      onUpdateValue(cell.field, contentValue);
    }
  }, [contentValue, cell.value, cell.field, onUpdateValue, isEditable]);

  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        {isEditable ? (
          <Tooltip title="Remove condition">
            <IconButton
              onClick={() => onRemove(cell.field)}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Box
            sx={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DescriptionIcon fontSize="small" color="disabled" />
          </Box>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={
          <TextField
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            onBlur={handleFieldBlur}
            variant="standard"
            fullWidth
            disabled={!isEditable}
            sx={{
              "& .MuiInput-underline:before": { display: "none" },
              "& .MuiInput-underline:after": { display: "none" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                display: "none",
              },
            }}
            slotProps={{
              input: {
                sx: { fontWeight: 600, fontSize: "0.95rem" },
              },
            }}
          />
        }
        secondary={
          <TextField
            value={contentValue}
            onChange={(e) => setContentValue(e.target.value)}
            onBlur={handleContentBlur}
            multiline
            rows={2}
            placeholder={isEditable ? "Describe this condition..." : ""}
            variant="standard"
            fullWidth
            disabled={!isEditable}
            sx={{
              mt: 1,
              "& .MuiInput-underline:before": { display: "none" },
              "& .MuiInput-underline:after": { display: "none" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                display: "none",
              },
            }}
            slotProps={{
              input: {
                sx: { color: "text.secondary", fontSize: "0.875rem" },
              },
            }}
          />
        }
      />
    </ListItem>
  );
});
// Promise card header
const PromiseCardHeader = memo<{
  promise: CPayment;
  isExpanded: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  onStatusChange: (status: string) => void;
  onAmountChange: (amount: string) => void;
  onReceiverChange: (receiver: string) => void;
  isEditable: boolean;
  viewMode?: "promises" | "payments";
}>(
  ({
    promise,
    isExpanded,
    onToggle,
    isDarkMode,
    onStatusChange,
    onAmountChange,
    onReceiverChange,
    isEditable,
    viewMode = "promises",
  }) => {
    const getUserData = useUserData();
    const { profile, all_friends } = useSelector(
      (state: AppState) => state.filesState,
    );
    const statusConfig = getStatusConfig(promise.status);
    const senderData = getUserData(promise.sender);
    const receiverData = getUserData(promise.receiver);
    const statusOptions = useMemo(
      () => getStatusOptions(promise, profile.id),
      [promise, profile.id],
    );

    // Get the first cell field as title (first 6 words only)
    const firstCellTitle =
      promise.cells && promise.cells.length > 0
        ? promise.cells[0].value
            ?.replace(/_/g, " ")
            .split(" ")
            .slice(0, 5)
            .join(" ") + "..." || "Agreement"
        : "Agreement";

    const handleHeaderClick = (e: React.MouseEvent) => {
      // Don't toggle when clicking on editable fields in expanded mode
      if (isExpanded && (e.target as HTMLElement).closest(".editable-field")) {
        e.stopPropagation();
        return;
      }
      // Always allow toggle
      onToggle();
    };

    return (
      <Box
        onClick={handleHeaderClick}
        sx={{
          p: isExpanded ? 3 : 1,
          cursor: "pointer",
          background: "background.header",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Left side - Title and Status */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
              minWidth: "200px",
            }}
          >
            <Typography
              variant={isExpanded ? "h6" : "body1"}
              fontWeight={700}
              sx={{ color: "primary.main" }}
            >
              {firstCellTitle}
            </Typography>

            {isExpanded ? (
              <Box
                className="editable-field"
                onClick={(e) => e.stopPropagation()}
              >
                <TextField
                  label="Status"
                  select
                  size="small"
                  value={Object.keys(promise.status)[0] || "None"}
                  onChange={(e) => onStatusChange(e.target.value)}
                  disabled={!isEditable}
                  sx={{ minWidth: 120 }}
                >
                  {statusOptions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            ) : (
              <Chip
                label={`${statusConfig.icon} ${formatStatus(promise.status)}`}
                size="small"
                sx={{
                  bgcolor: statusConfig.bg,
                  color: statusConfig.color,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>

          {/* Center - Sender and Receiver */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: 1,
              justifyContent: "center",
              minWidth: "200px",
            }}
          >
            <UserAvatarMenu user={senderData.user} />
            <Typography
              variant={isExpanded ? "body2" : "caption"}
              fontWeight={600}
            >
              {senderData.name}
            </Typography>

            {/* Smart visibility logic for receiver */}
            {(() => {
              const hasAmount = promise.amount && promise.amount > 0;
              const hasReceiver = receiverData.name !== "Unknown";
              // For payments: hide receiver when both amount is 0 and receiver is unknown
              // For promises: always show receiver section
              const shouldShowReceiver =
                viewMode === "promises" || hasReceiver || hasAmount;

              return shouldShowReceiver ? (
                <>
                  <Box sx={{ mx: 1 }}>→</Box>
                  {isExpanded ? (
                    <Box
                      className="editable-field"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TextField
                        label="Receiver"
                        select
                        size="small"
                        value={getUserData(promise.receiver).name}
                        onChange={(e) => onReceiverChange(e.target.value)}
                        disabled={!isEditable}
                        sx={{ minWidth: 120 }}
                      >
                        {all_friends?.map((f) => (
                          <MenuItem key={f.id} value={f.name}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  ) : (
                    <>
                      <UserAvatarMenu user={receiverData.user} />
                      <Typography
                        variant={isExpanded ? "body2" : "caption"}
                        fontWeight={600}
                      >
                        {receiverData.name}
                      </Typography>
                    </>
                  )}
                </>
              ) : null;
            })()}
          </Box>

          {/* Right side - Amount */}
          {(() => {
            const hasAmount = promise.amount && promise.amount > 0;
            const hasReceiver = receiverData.name !== "Unknown";
            // For payments: hide amount when both amount is 0 and receiver is unknown
            // For promises: always show amount section
            const shouldShowAmount =
              viewMode === "promises" || hasAmount || hasReceiver;

            return shouldShowAmount ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flex: 1,
                  justifyContent: "flex-end",
                  minWidth: "150px",
                }}
              >
                <AccountBalanceWalletIcon color="success" fontSize="small" />
                {isExpanded ? (
                  <Box
                    className="editable-field"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TextField
                      label="Amount"
                      type="number"
                      size="small"
                      value={promise.amount || 0}
                      onChange={(e) => onAmountChange(e.target.value)}
                      disabled={!isEditable}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        },
                      }}
                      sx={{ minWidth: 120 }}
                    />
                  </Box>
                ) : (
                  <Typography
                    variant={isExpanded ? "h6" : "body2"}
                    sx={{
                      fontWeight: 700,
                      color: "success.main",
                      fontFamily: "monospace",
                    }}
                  >
                    ${promise.amount?.toLocaleString() || 0}
                  </Typography>
                )}
              </Box>
            ) : null;
          })()}
        </Box>
      </Box>
    );
  },
);

// Contract Header Component
const ContractHeader = memo<{
  contract: CustomContract;
  viewMode: "promises" | "payments";
  onViewModeChange: (
    event: React.MouseEvent<HTMLElement>,
    newMode: "promises" | "payments" | null,
  ) => void;
  onAddPromise: () => void;
  onSwitchToTable: () => void;
  isEditable: boolean;
  isOnContractPage: boolean;
  hideReceivedPromises?: boolean;
  onHideReceivedPromisesChange?: (checked: boolean) => void;
}>(
  ({
    contract,
    viewMode,
    onViewModeChange,
    onAddPromise,
    onSwitchToTable,
    isEditable,
    isOnContractPage,
    hideReceivedPromises,
    onHideReceivedPromisesChange,
  }) => {
    const { profile } = useSelector((state: RootState) => state.filesState);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const handleContractNameChange = debounce((e) => {
      dispatch({
        type: "RENAME_SMART_CONTRACT",
        contract_id: contract.id,
        new_name: e.target.value,
      });
    }, 250);

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 1, sm: 2 },
          p: { xs: 1, sm: 1.5 },
          mb: 2,
          borderRadius: 1.5,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          minHeight: { xs: 48, sm: 56 },
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        {/* Left Section - Share, Open, Title */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 0.5, sm: 1 },
            flex: { xs: "1 1 100%", md: "1 1 auto" },
            order: { xs: 1, md: 1 },
            minWidth: 0,
          }}
        >
          <CopyButton
            title="Share contract url"
            value={createShortContractUrl({
              id: contract.id,
              owner: contract.creator?.toString() || "",
            })}
          />
          
          {!isOnContractPage && (
            <Tooltip title="Open full view">
              <IconButton
                onClick={() => {
                  navigate(`/contract?id=${contract.id}`);
                }}
                size="small"
                color="primary"
                sx={{ p: { xs: 0.25, sm: 0.5 } }}
              >
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <TextField
            defaultValue={contract?.name || "Untitled"}
            onChange={handleContractNameChange}
            variant="standard"
            size="small"
            sx={{
              flex: 1,
              minWidth: { xs: 120, sm: 180 },
              maxWidth: { xs: 200, sm: 280 },
              "& .MuiInput-underline:before": { display: "none" },
              "& .MuiInput-underline:after": { display: "none" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                display: "none",
              },
            }}
            slotProps={{
              input: {
                sx: {
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                  fontWeight: 600,
                  color: "primary.main",
                },
              },
            }}
          />
        </Box>

        {/* Center Section - Toggle Buttons */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={onViewModeChange}
          size="small"
          sx={{
            order: { xs: 3, md: 2 },
            flex: { xs: "1 1 100%", md: "0 0 auto" },
            justifyContent: { xs: "center", md: "flex-start" },
            "& .MuiToggleButton-root": {
              px: { xs: 1, sm: 1.5 },
              py: { xs: 0.25, sm: 0.5 },
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              fontWeight: 500,
              border: "1px solid",
              borderColor: "divider",
              minHeight: { xs: 28, sm: 32 },
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              },
            },
          }}
        >
          <ToggleButton value="promises">
            <HandshakeIcon sx={{ fontSize: { xs: 12, sm: 14 }, mr: 0.5 }} />
            {isMobile
              ? `P (${contract.promises?.length || 0})`
              : `Promises (${contract.promises?.length || 0})`}
          </ToggleButton>
          <ToggleButton value="payments">
            <PaymentIcon sx={{ fontSize: { xs: 12, sm: 14 }, mr: 0.5 }} />
            {isMobile
              ? `Pay (${contract.payments?.length || 0})`
              : `Payments (${contract.payments?.length || 0})`}
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Right Section - Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.5, sm: 1 },
            alignItems: "center",
            order: { xs: 2, md: 3 },
            flex: { xs: "0 0 auto", md: "0 0 auto" },
          }}
        >
          {/* Filter toggle - only show when viewing promises and contract creator is different from current user */}
          {viewMode === "promises" &&
            contract.creator?.toString() !== profile.id &&
            onHideReceivedPromisesChange && (
              <FormControlLabel
                control={
                  <Switch
                    checked={hideReceivedPromises}
                    onChange={(e) =>
                      onHideReceivedPromisesChange(e.target.checked)
                    }
                    size="small"
                  />
                }
                label="my promises"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                    color: "text.secondary",
                  },
                }}
              />
            )}

          {isEditable && viewMode === "promises" && (
            <Button
              onClick={onAddPromise}
              variant="contained"
              startIcon={!isMobile && <AddIcon sx={{ fontSize: 14 }} />}
              size="small"
              sx={{
                px: { xs: 1, sm: 2 },
                py: { xs: 0.25, sm: 0.5 },
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                fontWeight: 600,
                borderRadius: 1,
                textTransform: "none",
                minHeight: { xs: 28, sm: 32 },
              }}
            >
              {isMobile ? "+" : "New"}
            </Button>
          )}

          <DeleteContractButton contractId={contract.id} />

          <Button
            onClick={onSwitchToTable}
            variant="outlined"
            size="small"
            sx={{
              px: { xs: 1, sm: 2 },
              py: { xs: 0.25, sm: 0.5 },
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
              textTransform: "none",
              minHeight: { xs: 28, sm: 32 },
            }}
          >
            {isMobile ? "Table" : "Table View"}
          </Button>
        </Box>
      </Box>
    );
  },
);

// Main promise card component
const PromiseCard = memo<{
  promise: CPayment;
  isExpanded: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  isEditable: boolean;
  viewMode?: "promises" | "payments";
}>(
  ({
    promise,
    isExpanded,
    onToggle,
    isDarkMode,
    isEditable,
    viewMode = "promises",
  }) => {
    const {
      updatePromise,
      handleStatusChange,
      handleAmountChange,
      handleReceiverChange,
      handleDeletePromise,
    } = usePromiseActions(promise, isEditable);

    const handleCellActions = {
      updateField: useCallback(
        (oldField: string, newField: string) => {
          const cells =
            promise.cells?.map((c) =>
              c.field === oldField
                ? { ...c, field: newField, id: `${promise.id}_${newField}` }
                : c,
            ) || [];
          updatePromise({ cells });
        },
        [promise.cells, promise.id, updatePromise],
      ),

      updateValue: useCallback(
        (field: string, value: string) => {
          const cells =
            promise.cells?.map((c) =>
              c.field === field ? { ...c, value } : c,
            ) || [];
          updatePromise({ cells });
        },
        [promise.cells, updatePromise],
      ),

      add: useCallback(() => {
        if (!isEditable) return;
        const existingCount =
          promise.cells?.filter((c) => c.field.startsWith("condition"))
            .length || 0;
        const field = `condition_${existingCount + 1}`;
        const newCell = { id: `${promise.id}_${field}`, field, value: "" };
        updatePromise({ cells: [...(promise.cells || []), newCell] });
      }, [promise.cells, promise.id, updatePromise, isEditable]),

      remove: useCallback(
        (field: string) => {
          if (!isEditable) return;
          const cells = promise.cells?.filter((c) => c.field !== field) || [];
          updatePromise({ cells });
        },
        [promise.cells, updatePromise, isEditable],
      ),
    };

    return (
      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: isDarkMode ? "grey.800" : "grey.200",
          "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
        }}
      >
        <PromiseCardHeader
          promise={promise}
          isExpanded={isExpanded}
          onToggle={onToggle}
          isDarkMode={isDarkMode}
          onStatusChange={handleStatusChange}
          onAmountChange={handleAmountChange}
          onReceiverChange={handleReceiverChange}
          isEditable={isEditable}
          viewMode={viewMode}
        />

        <Collapse in={isExpanded}>
          <CardContent>
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <DescriptionIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Agreement Conditions
                </Typography>
              </Box>

              {promise.cells?.length ? (
                <List
                  sx={{ width: "100%", bgcolor: "background.paper", mb: 3 }}
                >
                  {promise.cells.map((cell, index) => (
                    <Box key={cell.id}>
                      <ConditionCell
                        cell={cell}
                        onUpdateField={handleCellActions.updateField}
                        onUpdateValue={handleCellActions.updateValue}
                        onRemove={handleCellActions.remove}
                        isEditable={isEditable}
                      />
                      {index < promise.cells.length - 1 && (
                        <Divider variant="inset" component="li" />
                      )}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 3,
                    color: "text.secondary",
                    mb: 3,
                  }}
                >
                  <DescriptionIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    No conditions defined yet.
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Bottom action bar with date, add condition, and delete */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pt: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              {/* Left side - Date created */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DateRangeIcon fontSize="small" color="disabled" />
                <Typography variant="body2" color="text.secondary">
                  Created{" "}
                  {new Date(
                    promise.date_created / 1000000,
                  ).toLocaleDateString()}
                </Typography>
              </Box>

              {/* Right side - Action buttons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {isEditable && (
                  <>
                    <Button
                      onClick={handleCellActions.add}
                      variant="outlined"
                      startIcon={<AddIcon />}
                      size="small"
                      sx={{ borderStyle: "dashed" }}
                    >
                      Add Condition
                    </Button>
                    <Button
                      onClick={handleDeletePromise}
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      size="small"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </CardContent>
        </Collapse>
      </Card>
    );
  },
);

const AgreementView = memo<{
  contract: CustomContract;
  isDarkMode: boolean;
  onSwitchToTable: () => void;
  customContract: { name: string };
}>(({ contract, isDarkMode, onSwitchToTable }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { profile } = useSelector((state: AppState) => state.filesState);

  // Handle empty or invalid contract
  if (!contract || !contract.id) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "200px",
          gap: 2,
          color: "text.secondary",
        }}
      >
        <DescriptionIcon sx={{ fontSize: 48, opacity: 0.3 }} />
        <Typography variant="h6">Contract not found</Typography>
        <Typography variant="body2">
          This contract may not exist or failed to load.
        </Typography>
        <Button onClick={onSwitchToTable} variant="outlined">
          Switch to Table View
        </Button>
      </Box>
    );
  }
  const [expandedCards, setExpandedCards] = useState(new Set<string>());
  const [viewMode, setViewMode] = useState<"promises" | "payments">("promises");

  // Filter toggle state - load from localStorage
  const [hideReceivedPromises, setHideReceivedPromises] = useState(() => {
    const saved = localStorage.getItem("hideReceivedPromises");
    return saved ? JSON.parse(saved) : false;
  });

  // Save filter state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "hideReceivedPromises",
      JSON.stringify(hideReceivedPromises),
    );
  }, [hideReceivedPromises]);

  // Check if we're already on the contract page
  const isOnContractPage =
    location.pathname === "/contract" || location.pathname.startsWith("?id");

  // Determine if current user can edit
  const isCreator = profile.id === contract.creator?.toString();

  // Apply filter to promises when contract creator is different from profile ID
  const filteredPromises = useMemo(() => {
    if (viewMode !== "promises" || !contract.promises) return contract.promises;

    // Only apply filter if contract creator is different from current user AND filter is enabled
    if (contract.creator?.toString() !== profile.id && hideReceivedPromises) {
      return contract.promises.filter(
        (p) => p.receiver.toText() === profile.id,
      );
    }

    return contract.promises;
  }, [
    contract.promises,
    contract.creator,
    profile.id,
    viewMode,
    hideReceivedPromises,
  ]);

  // Get current data based on view mode
  const currentData =
    viewMode === "promises" ? filteredPromises : contract.payments;
  const isEditable = viewMode === "promises" && isCreator;

  const toggleCard = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddPromise = useCallback(() => {
    if (!isEditable) return;
    dispatch({
      type: "ADD_PROMISE",
      contract_id: contract.id,
      promise: createNewPromis(Principal.fromText(profile.id), contract.id),
      insertIndex: contract.promises?.length || 0,
    });
  }, [dispatch, contract, profile.id, isEditable]);

  const handleViewModeChange = useCallback(
    (
      _: React.MouseEvent<HTMLElement>,
      newMode: "promises" | "payments" | null,
    ) => {
      if (newMode !== null) {
        setViewMode(newMode);
      }
    },
    [],
  );

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        maxHeight: "70vh",
        overflowY: "auto",
        bgcolor: "background.default",
      }}
    >
      <ContractHeader
        contract={contract}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onAddPromise={handleAddPromise}
        onSwitchToTable={onSwitchToTable}
        isEditable={isEditable}
        isOnContractPage={isOnContractPage}
        hideReceivedPromises={hideReceivedPromises}
        onHideReceivedPromisesChange={setHideReceivedPromises}
      />

      {!currentData?.length ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 3,
            bgcolor: isDarkMode ? "grey.900" : "grey.50",
          }}
        >
          {viewMode === "promises" ? (
            <HandshakeIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
          ) : (
            <PaymentIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          )}
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {viewMode === "promises" ? "Promises" : "Payments"} Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {viewMode === "promises"
              ? "Create your first promise to get started with secure transactions."
              : "Payments will appear here when promises are released."}
          </Typography>
          {isEditable && viewMode === "promises" && (
            <Button
              onClick={handleAddPromise}
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
            >
              Create First Promise
            </Button>
          )}
        </Box>
      ) : (
        <Stack spacing={2}>
          {currentData.map((item, index) => (
            <Fade key={item.id} in timeout={200 + index * 100}>
              <div>
                <PromiseCard
                  promise={item}
                  isExpanded={expandedCards.has(item.id)}
                  onToggle={() => toggleCard(item.id)}
                  isDarkMode={isDarkMode}
                  isEditable={isEditable}
                  viewMode={viewMode}
                />
              </div>
            </Fade>
          ))}
        </Stack>
      )}
    </Box>
  );
});

export default AgreementView;
