import { CPayment, CustomContract } from "$/declarations/backend/backend.did";
import { Principal } from "@dfinity/principal";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import CancelIcon from "@mui/icons-material/Cancel";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  ListItem,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserAvatarMenu from "../MainComponents/UserAvatarMenu";
import DeleteContractButton from "./deleteContractButton";
import { createNewPromis, getStatusOptions } from "./utils";
import { debounce } from "lodash";
import ShareIcon from "@mui/icons-material/Share";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CopyButton from "../MuiComponents/copyButton";
interface User {
  id: string;
  name: string;
}

interface AppState {
  filesState: {
    profile: User;
    all_friends: User[];
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
const usePromiseActions = (promise: CPayment) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { profile, all_friends, wallet, contracts } = useSelector(
    (state: AppState) => state.filesState,
  );

  const updatePromise = useCallback(
    (updates: Partial<CPayment>) => {
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
    [dispatch, promise, contracts],
  );

  const handleStatusChange = useCallback(
    (newStatus: string) => {
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
    [updatePromise],
  );

  const handleAmountChange = useCallback(
    (newAmount: string) => {
      const amount = parseFloat(newAmount) || 0;
      if (amount > wallet.balance) {
        enqueueSnackbar("Error: Not enough balance", { variant: "error" });
        return;
      }
      updatePromise({ amount });
    },
    [updatePromise, wallet.balance, enqueueSnackbar],
  );

  const handleReceiverChange = useCallback(
    (newReceiver: string) => {
      const user = all_friends?.find((u) => u.name === newReceiver);
      if (!user || promise.sender.toString() === user.id) {
        enqueueSnackbar("Error: You can't send to yourself", {
          variant: "error",
        });
        return;
      }
      updatePromise({ receiver: Principal.fromText(user.id) });
    },
    [updatePromise, all_friends, promise.sender, enqueueSnackbar],
  );

  const handleDeletePromise = useCallback(() => {
    if (window.confirm("Delete this agreement?")) {
      dispatch({
        type: "DELETE_PROMISE",
        contract_id: promise.contract_id,
        id: promise.id,
      });
    }
  }, [dispatch, promise]);

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

// Editable field component
const EditableField = memo<{
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
}>(({ value, onSave, multiline = false, placeholder = "Click to edit..." }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Stack spacing={1}>
        <TextField
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          multiline={multiline}
          rows={multiline ? 3 : 1}
          fullWidth
          variant="outlined"
          size="small"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && !multiline) handleSave();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <IconButton onClick={handleSave} size="small" color="success">
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={handleCancel} size="small" color="error">
            <CancelIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    );
  }

  return (
    <Box
      onClick={() => setIsEditing(true)}
      sx={{
        cursor: "text",
        minHeight: multiline ? "3rem" : "auto",
        p: 1,
        borderRadius: 1,
        border: "1px dashed transparent",
        "&:hover": { borderColor: "primary.main", bgcolor: "grey.50" },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: value ? "text.primary" : "text.secondary",
          fontStyle: value ? "normal" : "italic",
        }}
      >
        {value || placeholder}
      </Typography>
    </Box>
  );
});

// Condition cell component
const ConditionCell = memo<{
  cell: { id: string; field: string; value: string };
  onUpdateField: (oldField: string, newField: string) => void;
  onUpdateValue: (field: string, value: string) => void;
  onRemove: (field: string) => void;
}>(({ cell, onUpdateField, onUpdateValue, onRemove }) => {
  const [fieldValue, setFieldValue] = useState(cell.field.replace(/_/g, " "));
  const [contentValue, setContentValue] = useState(cell.value);

  const handleFieldBlur = useCallback(() => {
    const newField = fieldValue.replace(/\s+/g, "_");
    if (newField !== cell.field) {
      onUpdateField(cell.field, newField);
    }
  }, [fieldValue, cell.field, onUpdateField]);

  const handleContentBlur = useCallback(() => {
    if (contentValue !== cell.value) {
      onUpdateValue(cell.field, contentValue);
    }
  }, [contentValue, cell.value, cell.field, onUpdateValue]);

  return (
    <Paper elevation={0} sx={{ border: "1px solid", borderColor: "grey.300" }}>
      <ListItem sx={{ flexDirection: "column", alignItems: "stretch", py: 2 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", mb: 1, width: "100%" }}
        >
          <TextField
            value={fieldValue}
            onChange={(e) => setFieldValue(e.target.value)}
            onBlur={handleFieldBlur}
            variant="standard"
            sx={{
              flex: 1,
              "& .MuiInput-underline:before": { display: "none" },
              "& .MuiInput-underline:after": { display: "none" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                display: "none",
              },
            }}
            InputProps={{
              sx: { fontWeight: 600, fontSize: "0.95rem" },
            }}
          />
          <Tooltip title="Remove condition">
            <IconButton
              onClick={() => onRemove(cell.field)}
              size="small"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <TextField
          value={contentValue}
          onChange={(e) => setContentValue(e.target.value)}
          onBlur={handleContentBlur}
          multiline
          rows={2}
          placeholder="Describe this condition..."
          variant="standard"
          fullWidth
          sx={{
            "& .MuiInput-underline:before": { display: "none" },
            "& .MuiInput-underline:after": { display: "none" },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              display: "none",
            },
          }}
          InputProps={{
            sx: { color: "text.secondary", fontSize: "0.875rem" },
          }}
        />
      </ListItem>
    </Paper>
  );
});
// Promise card header
const PromiseCardHeader = memo<{
  promise: CPayment;
  isExpanded: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}>(({ promise, isExpanded, onToggle, isDarkMode }) => {
  const getUserData = useUserData();
  const statusConfig = getStatusConfig(promise.status);
  const senderData = getUserData(promise.sender);
  const receiverData = getUserData(promise.receiver);

  return (
    <Box
      onClick={onToggle}
      sx={{
        p: isExpanded ? 3 : 1,
        cursor: "pointer",
        background: isDarkMode
          ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Grid container alignItems="center" spacing={isExpanded ? 2 : 1}>
        <Grid item xs={12} sm={6}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={isExpanded ? 2 : 1}
          >
            <Chip
              label={`${statusConfig.icon} ${formatStatus(promise.status)}`}
              size="small"
              sx={{
                bgcolor: statusConfig.bg,
                color: statusConfig.color,
                fontWeight: 600,
              }}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <UserAvatarMenu user={senderData.user} />
              <Typography
                variant={isExpanded ? "body2" : "caption"}
                fontWeight={600}
              >
                {senderData.name}
              </Typography>
              <Box sx={{ mx: 1 }}>→</Box>
              <UserAvatarMenu user={receiverData.user} />
              <Typography
                variant={isExpanded ? "body2" : "caption"}
                fontWeight={600}
              >
                {receiverData.name}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          sx={{ textAlign: { xs: "left", sm: "right" } }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            justifyContent={{ xs: "flex-start", sm: "flex-end" }}
          >
            <AccountBalanceWalletIcon color="success" fontSize="small" />
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
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
});

// Main promise card component
const PromiseCard = memo<{
  promise: CPayment;
  isExpanded: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}>(({ promise, isExpanded, onToggle, isDarkMode }) => {
  const { profile, all_friends } = useSelector(
    (state: AppState) => state.filesState,
  );
  const {
    updatePromise,
    handleStatusChange,
    handleAmountChange,
    handleReceiverChange,
    handleDeletePromise,
  } = usePromiseActions(promise);
  const getUserData = useUserData();
  const statusOptions = useMemo(
    () => getStatusOptions(promise, profile.id),
    [promise, profile.id],
  );

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
      const existingCount =
        promise.cells?.filter((c) => c.field.startsWith("condition")).length ||
        0;
      const field = `condition_${existingCount + 1}`;
      const newCell = { id: `${promise.id}_${field}`, field, value: "" };
      updatePromise({ cells: [...(promise.cells || []), newCell] });
    }, [promise.cells, promise.id, updatePromise]),

    remove: useCallback(
      (field: string) => {
        const cells = promise.cells?.filter((c) => c.field !== field) || [];
        updatePromise({ cells });
      },
      [promise.cells, updatePromise],
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
      />

      <Collapse in={isExpanded}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Status"
                select
                fullWidth
                size="small"
                value={Object.keys(promise.status)[0] || "None"}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Amount"
                type="number"
                fullWidth
                size="small"
                value={promise.amount || 0}
                onChange={(e) => handleAmountChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Receiver"
                select
                fullWidth
                size="small"
                value={getUserData(promise.receiver).name}
                onChange={(e) => handleReceiverChange(e.target.value)}
              >
                {all_friends?.map((f) => (
                  <MenuItem key={f.id} value={f.name}>
                    {f.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <DateRangeIcon fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">
              Created on{" "}
              {new Date(promise.date_created / 1000000).toLocaleDateString()}
            </Typography>
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <DescriptionIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Agreement Conditions
              </Typography>
            </Box>

            <Stack spacing={2}>
              {promise.cells?.map((cell, index) => (
                <ConditionCell
                  cell={cell}
                  onUpdateField={handleCellActions.updateField}
                  onUpdateValue={handleCellActions.updateValue}
                  onRemove={handleCellActions.remove}
                />
              ))}

              <Button
                onClick={handleCellActions.add}
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ borderStyle: "dashed", py: 1.5 }}
              >
                Add New Condition
              </Button>

              {!promise.cells?.length && (
                <Box
                  sx={{ textAlign: "center", py: 3, color: "text.secondary" }}
                >
                  <DescriptionIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="body2">
                    No conditions defined yet.
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              onClick={handleDeletePromise}
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              fullWidth
            >
              Delete Agreement
            </Button>
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
});

const ShareContractButton = memo<{ contractId: string }>(({ contractId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isShared, setShared] = useState(false);
  const handleShare = useCallback(() => {
    const shareUrl = `${window.location.origin}/contract?id=${contractId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => setShared(true))
      .catch(() =>
        enqueueSnackbar("Failed to copy link", { variant: "error" }),
      );
  }, [contractId, enqueueSnackbar]);

  useEffect(() => {
    setTimeout(() => {
      setShared(false);
    }, 1000);
  }, [isShared]);
  return (
    <Tooltip title={isShared ? "✅ Link is copied" : "Share contract"}>
      <IconButton onClick={handleShare} size="small" color="primary">
        {isShared ? <CheckCircleIcon /> : <ShareIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
});

const AgreementView = memo<{
  contract: CustomContract;
  profile: User;
  isDarkMode: boolean;
  onSwitchToTable: () => void;
  customContract: { name: string };
}>(({ contract, profile, isDarkMode, onSwitchToTable }) => {
  const dispatch = useDispatch();
  const [expandedCards, setExpandedCards] = useState(new Set<string>());

  const handleContractNameChange = debounce((e) => {
    dispatch({
      type: "RENAME_SMART_CONTRACT",
      contract_id: contract.id,
      new_name: e.target.value,
    });
  }, 250);

  const toggleCard = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleAddPromise = useCallback(() => {
    dispatch({
      type: "ADD_PROMISE",
      contract_id: contract.id,
      promise: createNewPromis(Principal.fromText(profile.id), contract.id),
      insertIndex: contract.promises?.length || 0,
    });
  }, [dispatch, contract, profile.id]);

  return (
    <Box sx={{ p: 3, maxHeight: "70vh", overflowY: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <CopyButton
            title={"Share contract url."}
            value={`${window.location.origin}/contract?id=${contract.id}`}
          />

          <TextField
            defaultValue={contract?.name || "Untitled"}
            onChange={handleContractNameChange}
            variant="standard"
            sx={{
              "& .MuiInput-underline:before": { display: "none" },
              "& .MuiInput-underline:after": { display: "none" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                display: "none",
              },
            }}
            InputProps={{
              sx: { fontSize: "1.5rem", fontWeight: 700 },
            }}
          />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            onClick={handleAddPromise}
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Agreement
          </Button>
          <DeleteContractButton contractId={contract.id} />
          <Button onClick={onSwitchToTable} variant="outlined">
            Table View
          </Button>
        </Stack>
      </Box>

      {!contract.promises?.length ? (
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
          <AccountBalanceWalletIcon
            sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Agreements Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first agreement to get started with secure transactions.
          </Typography>
          <Button
            onClick={handleAddPromise}
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
          >
            Create First Agreement
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {contract.promises.map((promise, index) => (
            <Fade key={promise.id} in timeout={200 + index * 100}>
              <div>
                <PromiseCard
                  promise={promise}
                  isExpanded={expandedCards.has(promise.id)}
                  onToggle={() => toggleCard(promise.id)}
                  isDarkMode={isDarkMode}
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
