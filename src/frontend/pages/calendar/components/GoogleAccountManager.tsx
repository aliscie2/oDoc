// Google Account Manager Component - Simplified
import React, { useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import {
  Google as GoogleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import { useGoogleCalendar } from "../googleAccounts/useGoogleCalendar";

interface GoogleAccountManagerProps {
  size?: "small" | "medium" | "large";
  buttonText?: string;
  isSharedCalendar?: boolean; // New prop to indicate shared calendar context
}

const GoogleAccountManager: React.FC<GoogleAccountManagerProps> = ({
  size = "medium",
  buttonText,
  isSharedCalendar = false,
}) => {
  const {
    emails,
    connectGoogleCalendar,
    setDefaultEmail,
    removeEmail,
    loading,
    isConnected,
    disConnectCalendar,
    error,
    refreshGoogleCalendarEvents,
  } = useGoogleCalendar();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleConnect = async () => {
    try {
      await connectGoogleCalendar();
    } catch (error) {
      console.error("Failed to connect Google account:", error);
    }
  };

  const handleAddAccount = async () => {
    handleMenuClose();
    try {
      await connectGoogleCalendar();
    } catch (error) {
      console.error("Failed to add additional Google account:", error);
    }
  };

  const handleRemoveEmail = async (emailId: string) => {
    await removeEmail(emailId);
    handleMenuClose();
  };

  const handleSetDefaultEmail = (emailId: string) => {
    if (emails[0] === emailId) return;
    setDefaultEmail(emailId);
    handleMenuClose();
  };

  // Determine button text based on context
  const getButtonText = () => {
    if (loading) return "Connecting...";
    if (error) return "Retry";
    if (buttonText) return buttonText;
    if (isSharedCalendar) return "Connect My Google";
    return "Connect Google";
  };

  const getTooltipText = () => {
    if (isSharedCalendar) {
      return "Connect your own Google Calendar to sync your events";
    }
    return "Connect Google Calendar for sync";
  };

  // No accounts connected
  if (emails.length === 0 && !isConnected) {
    return (
      <Tooltip title={getTooltipText()}>
        <Button
          variant="outlined"
          color={error ? "error" : "primary"}
          onClick={handleConnect}
          disabled={loading}
          size={size}
          startIcon={loading ? undefined : <GoogleIcon />}
          sx={{
            borderColor: error ? "#f44336" : "#4285F4",
            color: error ? "#f44336" : "#4285F4",
            textTransform: "none",
          }}
        >
          {getButtonText()}
        </Button>
      </Tooltip>
    );
  }

  // Connected but syncing
  if (isConnected && emails.length === 0) {
    return (
      <Button
        variant="contained"
        disabled
        size={size}
        startIcon={<GoogleIcon />}
        sx={{ backgroundColor: "#4285F4", opacity: 0.7 }}
      >
        Syncing...
      </Button>
    );
  }

  // Single account
  if (emails.length === 1) {
    const displayText = isSharedCalendar ? "My Google" : emails[0];
    const tooltipText = isSharedCalendar 
      ? `Your Google account connected: ${emails[0]}`
      : `Connected: ${emails[0]}`;
    
    return (
      <>
        <Tooltip title={tooltipText}>
          <Button
            variant="contained"
            onClick={handleMenuClick}
            size={size}
            startIcon={<GoogleIcon />}
            sx={{
              backgroundColor: "#4285F4",
              "&:hover": { backgroundColor: "#3367D6" },
              textTransform: "none",
              maxWidth: 200,
            }}
          >
            <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayText}
            </Box>
          </Button>
        </Tooltip>
        <AccountMenu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          emails={emails}
          onRemoveEmail={handleRemoveEmail}
          onSetDefaultEmail={handleSetDefaultEmail}
          onAddAccount={handleAddAccount}
          onDisconnect={disConnectCalendar}
          onRefresh={refreshGoogleCalendarEvents}
          isSharedCalendar={isSharedCalendar}
        />
      </>
    );
  }

  // Multiple accounts
  const displayText = isSharedCalendar ? "My Google" : `${emails.length} Accounts`;
  const tooltipText = isSharedCalendar
    ? `Your ${emails.length} Google accounts connected`
    : `${emails.length} Google accounts connected`;
  
  return (
    <>
      <Tooltip title={tooltipText}>
        <Button
          variant="contained"
          onClick={handleMenuClick}
          size={size}
          startIcon={<GoogleIcon />}
          sx={{ 
            backgroundColor: "#4285F4", 
            "&:hover": { backgroundColor: "#3367D6" },
            textTransform: "none",
          }}
        >
          {displayText}
        </Button>
      </Tooltip>
      <AccountMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        emails={emails}
        onRemoveEmail={handleRemoveEmail}
        onSetDefaultEmail={handleSetDefaultEmail}
        onAddAccount={handleAddAccount}
        onDisconnect={disConnectCalendar}
        onRefresh={refreshGoogleCalendarEvents}
        isSharedCalendar={isSharedCalendar}
      />
    </>
  );
};

interface AccountMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  emails: string[];
  onRemoveEmail: (email: string) => void;
  onSetDefaultEmail: (email: string) => void;
  onAddAccount: () => void;
  onDisconnect: () => void;
  onRefresh: () => void;
  isSharedCalendar?: boolean;
}

const AccountMenu: React.FC<AccountMenuProps> = ({
  anchorEl,
  open,
  onClose,
  emails,
  onRemoveEmail,
  onSetDefaultEmail,
  onAddAccount,
  onDisconnect,
  onRefresh,
  isSharedCalendar = false,
}) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    PaperProps={{ sx: { mt: 0.5, minWidth: 280, maxWidth: 350 } }}
  >
    <Box sx={{ px: 2, py: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {isSharedCalendar ? "Your Google Accounts" : "Connected Google Accounts"}
      </Typography>
      {isSharedCalendar && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          These are YOUR accounts, not the calendar owner&apos;s
        </Typography>
      )}
    </Box>

    {emails.map((email, index) => (
      <MenuItem key={email} sx={{ px: 2, py: 1 }}>
        <Box sx={{ flexGrow: 1, mr: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: index === 0 ? 600 : 400 }}>
            {email}
          </Typography>
          {index === 0 && (
            <Chip label="Primary" size="small" color="primary" variant="outlined" sx={{ mt: 0.5, height: 20 }} />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          {index === 0 ? (
            <IconButton size="small" disabled>
              <StarIcon color="primary" fontSize="small" />
            </IconButton>
          ) : (
            <Tooltip title="Set as primary">
              <IconButton size="small" onClick={() => onSetDefaultEmail(email)}>
                <StarBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Remove account">
            <IconButton size="small" onClick={() => onRemoveEmail(email)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </MenuItem>
    ))}

    <Divider sx={{ my: 1 }} />

    <MenuItem onClick={onAddAccount} sx={{ px: 2, py: 1 }}>
      <AddIcon sx={{ mr: 1 }} fontSize="small" />
      <Typography variant="body2">Add Another Account</Typography>
    </MenuItem>

    <MenuItem onClick={() => { onRefresh(); onClose(); }} sx={{ px: 2, py: 1 }}>
      <RefreshIcon sx={{ mr: 1 }} fontSize="small" />
      <Typography variant="body2">Refresh Calendar Events</Typography>
    </MenuItem>

    <Divider sx={{ my: 1 }} />

    <MenuItem onClick={() => { onDisconnect(); onClose(); }} sx={{ px: 2, py: 1, color: "error.main" }}>
      <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
      <Typography variant="body2">Disconnect All</Typography>
    </MenuItem>
  </Menu>
);

export default GoogleAccountManager;
