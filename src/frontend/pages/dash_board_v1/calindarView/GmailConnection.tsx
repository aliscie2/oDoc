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
import { useGoogleCalendar } from "./googleAccounts/useGoogleCalendar";
const GmailConnection = () => {
  const { profile } = useSelector((state) => state.filesState);
  const { emails, connectGoogleCalendar, setDefaultEmail, removeEmail } =
    useGoogleCalendar();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleRemoveEmail = async (emailId) => {
    removeEmail(emailId);
    handleMenuClose();
  };

  const handleSetDefaultEmail = (emailId) => {
    if (emails[0] === emailId) return;
    setDefaultEmail(emailId);
    handleMenuClose();
  };

  const handleAddEmail = async () => {
    handleMenuClose();
    await connectGoogleCalendar();
    // await connectCal()
  };

  if (!profile) return null;

  if (emails.length === 0) {
    return (
      <Tooltip title="When others create events will not be notified. Connect at least one Gmail">
        <Button
          variant="contained"
          color="error"
          onClick={connectGoogleCalendar}
        >
          Connect Gmail
        </Button>
      </Tooltip>
    );
  }

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
        {emails.map((email, index) => (
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
                  onClick={(e) => (
                    e.stopPropagation(), handleSetDefaultEmail(email)
                  )}
                >
                  <StarBorderIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Remove email">
              <IconButton
                size="small"
                onClick={(e) => (e.stopPropagation(), handleRemoveEmail(email))}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </MenuItem>
        ))}
        <MenuItem onClick={handleAddEmail}>Add Another Email</MenuItem>
      </Menu>
    </>
  );
};

export default GmailConnection;
