import { useBackendContext } from "@/contexts/BackendContext";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const GmailConnection = () => {
  const { profile } = useSelector((state: any) => state.filesState);
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { backendActor } = useBackendContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const [emails, setEmails] = useState<string[]>(calendar?.googleIds || []);

  useEffect(() => {
    // Sync with calendar.googleIds when it changes
    if (calendar?.googleIds) {
      setEmails(calendar.googleIds);
    }
  }, [calendar?.googleIds]);

  const handleGoogleAuth = async () => {};

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRemoveEmail = async (emailId: string) => {
    // Update local state only
    setEmails((prev) => prev.filter((email) => email !== emailId));
  };

  const handleSetDefaultEmail = (emailId: string) => {
    if (emails[0] === emailId) return; // Already default

    // Update local state - move email to first position
    setEmails((prev) => {
      const filtered = prev.filter((email) => email !== emailId);
      return [emailId, ...filtered];
    });
  };

  // Don't show if no profile
  if (!profile) return null;

  // Handle case where googleIds might be null/undefined
  const googleIds = calendar?.googleIds || [];

  if (googleIds.length === 0) {
    return (
      <Tooltip title="When others create events will not be notified. Connect at least one Gmail">
        <Button variant="contained" color="error" onClick={handleGoogleAuth}>
          Connect Gmail
        </Button>
      </Tooltip>
    );
  }

  // Replace all calendar.googleIds references with emails
  return (
    <>
      <Button
        variant="contained"
        onClick={handleMenuClick}
        sx={{ minWidth: 150 }}
      >
        {emails.length > 1 ? "Emails" : emails[0]}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        {emails.map((email: string, index: number) => (
          <MenuItem key={email}>
            <Typography sx={{ flexGrow: 1 }}>{email}</Typography>
            {index === 0 ? (
              <Tooltip
                title="When others create new events you will be notified by this email"
                placement="top"
              >
                <IconButton size="small">
                  <StarIcon color="primary" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Set as default email">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefaultEmail(email);
                  }}
                >
                  <StarBorderIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Remove email">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveEmail(email);
                }}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </MenuItem>
        ))}
        <MenuItem onClick={handleGoogleAuth}>Add Another Email</MenuItem>
      </Menu>
    </>
  );
};

export default GmailConnection;
