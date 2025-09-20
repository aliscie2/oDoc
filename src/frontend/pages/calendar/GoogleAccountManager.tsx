import React, { useState, useEffect } from "react";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Box,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import {
  Google as GoogleIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useGoogleCalendar } from "./googleAccounts/useGoogleCalendar";

interface GoogleAccountManagerProps {
  size?: "small" | "medium" | "large";
}

const GoogleAccountManager: React.FC<GoogleAccountManagerProps> = ({ 
  size = "medium" 
}) => {
  const { 
    emails, 
    connectGoogleCalendar, 
    setDefaultEmail, 
    removeEmail,
    loading,
    isConnected,
    disConnectCalendar,
    error
  } = useGoogleCalendar();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [syncTimeout, setSyncTimeout] = useState(false);
  const open = Boolean(anchorEl);

  // Handle stuck syncing state
  useEffect(() => {
    if (isConnected && emails.length === 0 && !loading) {
      const timer = setTimeout(() => {
        setSyncTimeout(true);
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timer);
    } else {
      setSyncTimeout(false);
    }
  }, [isConnected, emails.length, loading]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveEmail = async (emailId: string) => {
    removeEmail(emailId);
    handleMenuClose();
  };

  const handleSetDefaultEmail = (emailId: string) => {
    if (emails[0] === emailId) return;
    setDefaultEmail(emailId);
    handleMenuClose();
  };

  const handleConnect = async () => {
    setSyncTimeout(false);
    try {
      // This should trigger OAuth popup and request calendar permissions
      await connectGoogleCalendar();
      // Success handling is managed by the hook's state updates
    } catch (error) {
      console.error("Failed to connect Google account:", error);
      // Error will be shown via the error state from the hook
    }
  };

  const handleAddAccount = async () => {
    handleMenuClose();
    // Each additional connection should request fresh calendar permissions
    try {
      await connectGoogleCalendar();
    } catch (error) {
      console.error("Failed to add additional Google account:", error);
    }
  };

  const handleRetryConnection = async () => {
    setSyncTimeout(false);
    disConnectCalendar(); // Clear the stuck state
    try {
      await connectGoogleCalendar();
    } catch (error) {
      console.error("Retry connection failed:", error);
    }
  };

  // No accounts connected
  if (emails.length === 0 && !isConnected) {
    return (
      <Box>
        <Tooltip title="Connect Google Calendar & Gmail for notifications">
          <Button
            variant="outlined"
            color={error ? "error" : "primary"}
            onClick={handleConnect}
            disabled={loading}
            size={size as "small" | "medium" | "large"}
            startIcon={loading ? undefined : <GoogleIcon />}
            sx={{
              borderColor: error ? "#f44336" : "#4285F4",
              color: error ? "#f44336" : "#4285F4",
              "&:hover": {
                borderColor: error ? "#d32f2f" : "#3367D6",
                backgroundColor: error 
                  ? "rgba(244, 67, 54, 0.04)" 
                  : "rgba(66, 133, 244, 0.04)",
              },
            }}
          >
            {loading ? "Connecting..." : error ? "Retry Connection" : "Connect Google"}
          </Button>
        </Tooltip>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mt: 1, fontSize: "0.75rem" }}
            onClose={() => {/* Clear error if needed */}}
          >
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  // Connected but no emails in backend yet (transitional state)
  if (isConnected && emails.length === 0) {
    if (syncTimeout) {
      return (
        <Tooltip title="Connection seems stuck. Click to retry.">
          <Button
            variant="outlined"
            color="warning"
            size={size as "small" | "medium" | "large"}
            startIcon={<WarningIcon />}
            onClick={handleRetryConnection}
            sx={{
              borderColor: "#FF9800",
              color: "#FF9800",
              "&:hover": {
                borderColor: "#F57C00",
                backgroundColor: "rgba(255, 152, 0, 0.04)",
              },
            }}
          >
            Retry Connection
          </Button>
        </Tooltip>
      );
    }

    return (
      <Tooltip title="Google Calendar connected, syncing accounts...">
        <Button
          variant="contained"
          disabled
          size={size as "small" | "medium" | "large"}
          startIcon={<GoogleIcon />}
          sx={{
            backgroundColor: "#4285F4",
            opacity: 0.7,
          }}
        >
          Syncing...
        </Button>
      </Tooltip>
    );
  }

  // Single account connected
  if (emails.length === 1) {
    return (
      <>
        <Tooltip title={`Connected: ${emails[0]} - Click to manage`}>
          <Button
            variant="contained"
            onClick={handleMenuClick}
            size={size as "small" | "medium" | "large"}
            startIcon={<GoogleIcon />}
            sx={{
              backgroundColor: "#4285F4",
              "&:hover": { backgroundColor: "#3367D6" },
              textTransform: "none",
              maxWidth: 200,
              position: "relative",
            }}
          >
            <Box sx={{ 
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              whiteSpace: "nowrap" 
            }}>
              {emails[0]}
            </Box>
            {/* Connection indicator */}
            <Box
              sx={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#4CAF50",
                border: "2px solid white",
              }}
            />
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
        />
      </>
    );
  }

  // Multiple accounts connected
  return (
    <>
      <Tooltip title={`${emails.length} Google accounts connected - Click to manage`}>
        <Button
          variant="contained"
          onClick={handleMenuClick}
          size={size as "small" | "medium" | "large"}
          startIcon={<GoogleIcon />}
          sx={{
            backgroundColor: "#4285F4",
            "&:hover": { backgroundColor: "#3367D6" },
            position: "relative",
          }}
        >
          {emails.length} Accounts
          {/* Connection indicator */}
          <Box
            sx={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#4CAF50",
              border: "2px solid white",
            }}
          />
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
}) => (
  <Menu 
    anchorEl={anchorEl} 
    open={open} 
    onClose={onClose}
    slotProps={{
      paper: {
        sx: { 
          mt: 0.5, 
          borderRadius: 1, 
          minWidth: 280,
          maxWidth: 350,
        }
      }
    }}
  >
    <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#4CAF50",
        }}
      />
      <Typography variant="subtitle2" color="text.secondary">
        Connected Google Accounts
      </Typography>
    </Box>
    
    {emails.map((email, index) => (
      <MenuItem key={email} sx={{ px: 2, py: 1 }}>
        <Box sx={{ flexGrow: 1, mr: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: index === 0 ? 600 : 400 }}>
            {email}
          </Typography>
          {index === 0 && (
            <Chip 
              label="Primary" 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ mt: 0.5, height: 20, fontSize: "0.7rem" }}
            />
          )}
        </Box>
        
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {index === 0 ? (
            <Tooltip title="Primary account for notifications">
              <IconButton size="small" disabled>
                <StarIcon color="primary" fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Set as primary">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefaultEmail(email);
                }}
              >
                <StarBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Remove account">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveEmail(email);
              }}
              color="error"
            >
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
    
    <Divider sx={{ my: 1 }} />
    
    <MenuItem 
      onClick={() => {
        onDisconnect();
        onClose();
      }} 
      sx={{ px: 2, py: 1, color: "error.main" }}
    >
      <LogoutIcon sx={{ mr: 1 }} fontSize="small" />
      <Typography variant="body2">Disconnect All</Typography>
    </MenuItem>
  </Menu>
);

export default GoogleAccountManager;