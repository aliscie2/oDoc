import { CPayment, CustomContract } from "$/declarations/backend/backend.did";
import { RootState } from "@/redux/reducers";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AddIcon from "@mui/icons-material/Add";
import DateRangeIcon from "@mui/icons-material/DateRange";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import HandshakeIcon from "@mui/icons-material/Handshake";
import PaymentIcon from "@mui/icons-material/Payment";
import {
  Badge,
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
import { memo, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createShortContractUrl } from "../../utils/urlEncoder";
import UserAvatarMenu from "../MainComponents/UserAvatarMenu";
import CopyButton from "../MuiComponents/copyButton";
import DeleteContractButton from "./deleteContractButton";
import { getStatusOptions } from "./utils";
import { backendActor } from "../../utils/backendUtils";
import { useAgreementView } from "./hooks/useAgreementView";
import { usePromiseActions } from "./hooks/usePromiseActions";
import { useUserData } from "./hooks/useUserData";
import { RESPONSIVE_STYLES, FIELD_CONFIGS } from "./constants";
import { formatStatus, getStatusConfig } from "./utils/statusUtils";
import {
  findUnseenNotificationForPromise,
  isNotificationAlreadyCalled,
  markNotificationAsCalled,
  removeNotificationFromProcessing,
} from "./utils/notificationUtils";

interface AppState {
  filesState: {
    profile: { id: string; name: string };
    all_friends: any[]; // Array of User objects extracted from Friends
    wallet: { balance: number };
    contracts: Record<string, { promises: CPayment[] }>;
  };
  notificationState: {
    notifications: any[];
  };
}

// Optimized Condition Cell Component
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
    if (newField !== cell.field) onUpdateField(cell.field, newField);
  }, [fieldValue, cell.field, onUpdateField, isEditable]);

  const handleContentBlur = useCallback(() => {
    if (!isEditable || contentValue === cell.value) return;
    onUpdateValue(cell.field, contentValue);
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
            fullWidth
            disabled={!isEditable}
            {...FIELD_CONFIGS.standardTextField}
            slotProps={{
              input: { sx: { fontWeight: 600, fontSize: "0.95rem" } },
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
            fullWidth
            disabled={!isEditable}
            sx={{ mt: 1, ...FIELD_CONFIGS.standardTextField.sx }}
            slotProps={{
              input: { sx: { color: "text.secondary", fontSize: "0.875rem" } },
            }}
          />
        }
      />
    </ListItem>
  );
});

// Optimized Promise Card Header
const PromiseCardHeader = memo<{
  promise: CPayment;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => Promise<void>;
  onAmountChange: (amount: string) => Promise<void>;
  onReceiverChange: (receiver: string) => Promise<void>;
  isEditable: boolean;
  canEditStatus: (promise: CPayment) => boolean;
  viewMode?: "promises" | "payments";
  contract: CustomContract;
}>(
  ({
    promise,
    isExpanded,
    onToggle,
    onStatusChange,
    onAmountChange,
    onReceiverChange,
    isEditable,
    canEditStatus,
    viewMode = "promises",
    contract,
  }) => {
    const getUserData = useUserData();
    const { profile, all_friends } = useSelector(
      (state: AppState) => state.filesState,
    );
    const { notifications } = useSelector(
      (state: AppState) => state.notificationState,
    );
    // Using direct backendActor import
    const dispatch = useDispatch();

    const statusConfig = getStatusConfig(promise.status);
    const senderData = getUserData(promise.sender);
    const receiverData = getUserData(promise.receiver);
    const statusOptions = useMemo(
      () => getStatusOptions(promise, profile.id),
      [promise, profile.id],
    );

    const unseenNotification = useMemo(() => {
      if (contract.creator?.toString() === profile.id) return null;
      return findUnseenNotificationForPromise(promise, notifications);
    }, [contract.creator, profile.id, promise, notifications]);

    const firstCellTitle =
      promise.cells?.[0]?.value
        ?.replace(/_/g, " ")
        .split(" ")
        .slice(0, 5)
        .join(" ") + "..." || "Agreement";

    const handleHeaderClick = async (e: React.MouseEvent) => {
      if (isExpanded && (e.target as HTMLElement).closest(".editable-field")) {
        e.stopPropagation();
        return;
      }

      if (
        unseenNotification &&
        backendActor &&
        !isNotificationAlreadyCalled(unseenNotification.id)
      ) {
        try {
          markNotificationAsCalled(unseenNotification.id);
          await backendActor.see_notifications([unseenNotification.id]);

          // Update notification state using dispatch
          const updatedNotifications = notifications.map((notification) => {
            if (notification.id === unseenNotification.id) {
              return { ...notification, is_seen: true };
            }
            return notification;
          });

          dispatch({
            type: "UPDATE_NOT_LIST",
            new_list: updatedNotifications,
          });
        } catch (error) {
          console.error("Error marking notification as seen:", error);
          removeNotificationFromProcessing(unseenNotification.id);
        }
      }
      onToggle();
    };

    const shouldShowReceiver =
      viewMode === "promises" ||
      receiverData.name !== "Unknown" ||
      (promise.amount && promise.amount > 0);
    const shouldShowAmount =
      (viewMode === "promises" ||
        receiverData.name !== "Unknown" ||
        (promise.amount && promise.amount > 0)) &&
      !(promise.sender.toString() !== profile.id && promise.amount === 0);

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
            gap: { xs: 1, sm: 2 },
            minHeight: "48px",
          }}
        >
          {/* Title and Status */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
              flex: "1 1 auto",
              minWidth: 0, // Allow shrinking
              maxWidth: { xs: "100%", sm: "40%" },
              order: { xs: 1, sm: 1 },
            }}
          >
            <Typography
              variant={isExpanded ? "h6" : "body1"}
              fontWeight={700}
              sx={{
                color: "primary.main",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: "1 1 auto",
                minWidth: 0,
              }}
            >
              {firstCellTitle}
            </Typography>
            {isExpanded ? (
              <Box
                className="editable-field"
                onClick={(e) => e.stopPropagation()}
                sx={{ flex: "0 0 auto" }}
              >
                <TextField
                  label="Status"
                  select
                  size="small"
                  value={Object.keys(promise.status)[0] || "None"}
                  onChange={(e) => onStatusChange(e.target.value)}
                  disabled={!canEditStatus(promise)}
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
                  flex: "0 0 auto",
                }}
              />
            )}
          </Box>

          {/* Sender and Receiver */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: "1 1 auto",
              justifyContent: "center",
              minWidth: 0, // Allow shrinking
              maxWidth: { xs: "100%", sm: "35%" },
              order: { xs: 3, sm: 2 },
            }}
          >
            <UserAvatarMenu user={senderData.user} />
            <Typography
              variant={isExpanded ? "body2" : "caption"}
              fontWeight={600}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "80px",
              }}
            >
              {(() => {
                const displayName =
                  profile.id === promise.sender.toString() && isExpanded
                    ? "You"
                    : senderData.name;
                console.log(
                  "Sender display name:",
                  displayName,
                  "profile.id:",
                  profile.id,
                  "promise.sender:",
                  promise.sender.toString(),
                  "senderData:",
                  senderData,
                  "isExpanded:",
                  isExpanded,
                );
                return displayName;
              })()}
            </Typography>

            {shouldShowReceiver && (
              <>
                <Box sx={{ mx: 1 }}>→</Box>
                {isExpanded &&
                isEditable &&
                profile.id !== promise.receiver.toString() ? (
                  <Box
                    className="editable-field"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TextField
                      label="Receiver"
                      select
                      size="small"
                      value={(() => {
                        const receiverName =
                          all_friends?.find(
                            (x) => x.id === promise.receiver.toString(),
                          )?.name || getUserData(promise.receiver).name;
                        console.log(
                          "Receiver dropdown value:",
                          receiverName,
                          "promise.receiver:",
                          promise.receiver.toString(),
                          "all_friends:",
                          all_friends,
                        );
                        return receiverName;
                      })()}
                      onChange={(e) => onReceiverChange(e.target.value)}
                      disabled={!isEditable}
                      sx={{ minWidth: 120 }}
                    >
                      {all_friends
                        ?.map((user: any) => {
                          // all_friends contains User objects, not Friend objects
                          if (!user || !user.name || user.id === profile.id)
                            return null;
                          return (
                            <MenuItem key={user.id} value={user.name}>
                              {user.name}
                            </MenuItem>
                          );
                        })
                        .filter(Boolean)}
                    </TextField>
                  </Box>
                ) : (
                  <>
                    <UserAvatarMenu user={receiverData.user} />
                    <Typography
                      variant={isExpanded ? "body2" : "caption"}
                      fontWeight={600}
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "80px",
                      }}
                    >
                      {(() => {
                        const displayName =
                          profile.id === promise.receiver.toString() &&
                          isExpanded
                            ? "You"
                            : receiverData.name;
                        console.log(
                          "Receiver display name:",
                          displayName,
                          "profile.id:",
                          profile.id,
                          "promise.receiver:",
                          promise.receiver.toString(),
                          "isExpanded:",
                          isExpanded,
                        );
                        return displayName;
                      })()}
                    </Typography>
                  </>
                )}
              </>
            )}
          </Box>

          {/* Amount */}
          {shouldShowAmount && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: "0 0 auto",
                justifyContent: "flex-end",
                minWidth: "120px",
                maxWidth: "200px",
                order: { xs: 2, sm: 3 },
              }}
            >
              <AccountBalanceWalletIcon color="success" fontSize="small" />
              {isExpanded && isEditable ? (
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
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  ${promise.amount?.toLocaleString() || 0}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
);

// Optimized Contract Header
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
    const isMobile = useMediaQuery(
      theme.breakpoints.down(RESPONSIVE_STYLES.mobileBreakpoint),
    );

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
          p: RESPONSIVE_STYLES.containerPadding,
          mb: 2,
          borderRadius: 1.5,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          minHeight: RESPONSIVE_STYLES.minHeight,
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        {/* Left Section */}
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
                onClick={() =>
                  navigate(
                    createShortContractUrl({
                      id: contract.id,
                      owner: contract.creator?.toString() || "",
                    }).replace(window.location.origin, ""),
                  )
                }
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
            disabled={contract.creator?.toString() !== profile.id}
            size="small"
            sx={{
              flex: 1,
              minWidth: { xs: 120, sm: 180 },
              maxWidth: { xs: 200, sm: 280 },
              ...FIELD_CONFIGS.standardTextField.sx,
            }}
            {...FIELD_CONFIGS.standardTextField}
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
              fontSize: RESPONSIVE_STYLES.buttonSize,
              fontWeight: 500,
              border: "1px solid",
              borderColor: "divider",
              minHeight: RESPONSIVE_STYLES.minHeight,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "&:hover": { bgcolor: "primary.dark" },
              },
            },
          }}
        >
          <ToggleButton value="promises">
            <HandshakeIcon
              sx={{ fontSize: RESPONSIVE_STYLES.iconSize, mr: 0.5 }}
            />
            {isMobile
              ? `P (${contract.promises?.length || 0})`
              : `Promises (${contract.promises?.length || 0})`}
          </ToggleButton>
          <ToggleButton value="payments">
            <PaymentIcon
              sx={{ fontSize: RESPONSIVE_STYLES.iconSize, mr: 0.5 }}
            />
            {isMobile
              ? `Pay (${contract.payments?.length || 0})`
              : `Payments (${contract.payments?.length || 0})`}
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Right Section */}
        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.5, sm: 1 },
            alignItems: "center",
            order: { xs: 2, md: 3 },
            flex: { xs: "0 0 auto", md: "0 0 auto" },
          }}
        >
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
                fontSize: RESPONSIVE_STYLES.buttonSize,
                fontWeight: 600,
                borderRadius: 1,
                textTransform: "none",
                minHeight: RESPONSIVE_STYLES.minHeight,
              }}
            >
              {isMobile ? "+" : "New"}
            </Button>
          )}
          {contract.creator?.toString() === profile.id && (
            <DeleteContractButton contractId={contract.id} />
          )}
          <Button
            onClick={onSwitchToTable}
            variant="outlined"
            size="small"
            sx={{
              px: { xs: 1, sm: 2 },
              py: { xs: 0.25, sm: 0.5 },
              fontSize: RESPONSIVE_STYLES.buttonSize,
              textTransform: "none",
              minHeight: RESPONSIVE_STYLES.minHeight,
            }}
          >
            {isMobile ? "Table" : "Table View"}
          </Button>
        </Box>
      </Box>
    );
  },
);

// Optimized Promise Card
const PromiseCard = memo<{
  promise: CPayment;
  isExpanded: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  isEditable: boolean;
  canEditStatus: (promise: CPayment) => boolean;
  viewMode?: "promises" | "payments";
  contract: CustomContract;
}>(
  ({
    promise,
    isExpanded,
    onToggle,
    isDarkMode,
    isEditable,
    canEditStatus,
    viewMode = "promises",
    contract,
  }) => {
    const {
      updatePromise,
      handleStatusChange,
      handleAmountChange,
      handleReceiverChange,
      handleDeletePromise,
    } = usePromiseActions(promise, isEditable, canEditStatus(promise));
    const { profile } = useSelector((state: AppState) => state.filesState);
    const { notifications } = useSelector(
      (state: AppState) => state.notificationState,
    );
    console.log({ notifications });

    const handleCellActions = useMemo(
      () => ({
        updateField: (oldField: string, newField: string) => {
          const cells =
            promise.cells?.map((c) =>
              c.field === oldField
                ? { ...c, field: newField, id: `${promise.id}_${newField}` }
                : c,
            ) || [];
          updatePromise({ cells });
        },
        updateValue: (field: string, value: string) => {
          const cells =
            promise.cells?.map((c) =>
              c.field === field ? { ...c, value } : c,
            ) || [];
          updatePromise({ cells });
        },
        add: () => {
          if (!isEditable) return;
          const existingCount =
            promise.cells?.filter((c) => c.field.startsWith("condition"))
              .length || 0;
          const field = `condition_${existingCount + 1}`;
          const newCell = { id: `${promise.id}_${field}`, field, value: "" };
          updatePromise({ cells: [...(promise.cells || []), newCell] });
        },
        remove: (field: string) => {
          if (!isEditable) return;
          const cells = promise.cells?.filter((c) => c.field !== field) || [];
          updatePromise({ cells });
        },
      }),
      [promise.cells, promise.id, updatePromise, isEditable],
    );

    const hasUnseenNotification = useMemo(() => {
      if (contract.creator?.toString() === profile.id) return false;
      return findUnseenNotificationForPromise(promise, notifications) !== null;
    }, [contract.creator, profile.id, promise, notifications]);

    return (
      <Box sx={{ position: "relative" }}>
        {hasUnseenNotification && (
          <Badge
            badgeContent="New"
            color="error"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              "& .MuiBadge-badge": {
                fontSize: "0.65rem",
                height: "18px",
                minWidth: "32px",
                padding: "0 6px",
                borderRadius: "9px",
              },
            }}
          />
        )}
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: isDarkMode ? "grey.800" : "grey.200",
            "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
            ...(hasUnseenNotification && {
              border: "2px solid #dc2626",
              borderRadius: 1,
            }),
          }}
        >
          <PromiseCardHeader
            promise={promise}
            isExpanded={isExpanded}
            onToggle={onToggle}
            onStatusChange={handleStatusChange}
            onAmountChange={handleAmountChange}
            onReceiverChange={handleReceiverChange}
            isEditable={isEditable}
            canEditStatus={canEditStatus}
            viewMode={viewMode}
            contract={contract}
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
                    <DescriptionIcon
                      sx={{ fontSize: 48, opacity: 0.3, mb: 1 }}
                    />
                    <Typography variant="body2">
                      No conditions defined yet.
                    </Typography>
                  </Box>
                )}
              </Box>

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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DateRangeIcon fontSize="small" color="disabled" />
                  <Typography variant="body2" color="text.secondary">
                    Created{" "}
                    {new Date(
                      promise.date_created / 1000000,
                    ).toLocaleDateString()}
                  </Typography>
                </Box>

                {isEditable && (
                  <Box sx={{ display: "flex", gap: 1 }}>
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
                  </Box>
                )}
              </Box>
            </CardContent>
          </Collapse>
        </Card>
      </Box>
    );
  },
);

// Main Optimized Agreement View Component
const AgreementView = memo<{
  contract: CustomContract;
  isDarkMode: boolean;
  onSwitchToTable: () => void;
  customContract: { name: string };
}>(({ contract, isDarkMode, onSwitchToTable }) => {
  const {
    expandedCards,
    viewMode,
    hideReceivedPromises,
    setHideReceivedPromises,
    isOnContractPage,
    currentData,
    isEditable,
    canEditStatus,
    toggleCard,
    handleAddPromise,
    handleViewModeChange,
  } = useAgreementView(contract);

  if (!contract?.id) {
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

  return (
    <Box
      sx={{
        p: RESPONSIVE_STYLES.containerPadding,
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
                  canEditStatus={canEditStatus}
                  viewMode={viewMode}
                  contract={contract}
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
