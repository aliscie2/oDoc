import React, { useState } from "react";
import {
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { Share, ContentCopy, Check } from "@mui/icons-material";

interface ShareCalendarButtonProps {
  shareLink: string;
  variant?: "button" | "icon";
  size?: "small" | "medium" | "large";
}

/**
 * ShareCalendarButton Component
 * Provides a professional way to share calendar links with copy functionality
 */
const ShareCalendarButton: React.FC<ShareCalendarButtonProps> = ({
  shareLink,
  variant = "button",
  size = "small",
}) => {
  const [copied, setCopied] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setShowSnackbar(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setShowSnackbar(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleQuickCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await handleCopy();
  };

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  if (variant === "icon") {
    return (
      <>
        <Tooltip title={copied ? "Copied!" : "Share Calendar"}>
          <IconButton
            onClick={handleQuickCopy}
            size={size}
            sx={{
              color: copied ? "success.main" : "primary.main",
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: "primary.light",
                transform: "scale(1.05)",
              },
            }}
          >
            {copied ? <Check fontSize={size} /> : <Share fontSize={size} />}
          </IconButton>
        </Tooltip>

        <Snackbar
          open={showSnackbar}
          autoHideDuration={2000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Calendar link copied to clipboard!
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        startIcon={<Share />}
        size={size}
        variant="outlined"
        sx={{
          textTransform: "none",
          fontWeight: 500,
          borderColor: "divider",
          color: "text.primary",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "primary.light",
          },
        }}
      >
        Share
      </Button>

      <Dialog
        open={showDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Share color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Share Calendar
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Share this link with others to give them view access to your calendar.
              They'll be able to see your events and availability.
            </Typography>

            <Box
              sx={{
                p: 2,
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
              }}
            >
              <TextField
                fullWidth
                value={shareLink}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <IconButton
                      onClick={handleCopy}
                      size="small"
                      sx={{
                        color: copied ? "success.main" : "primary.main",
                      }}
                    >
                      {copied ? <Check /> : <ContentCopy />}
                    </IconButton>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "background.paper",
                  },
                }}
              />
            </Box>

            {copied && (
              <Alert severity="success" variant="outlined">
                Link copied to clipboard!
              </Alert>
            )}

            <Box
              sx={{
                p: 2,
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(6, 174, 212, 0.15)'
                  : 'rgba(6, 174, 212, 0.08)',
                borderRadius: 1,
                border: 1,
                borderColor: "info.main",
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: (theme) => theme.palette.mode === 'dark' 
                    ? 'info.light' 
                    : 'info.dark' 
                }}
              >
                <strong>Note:</strong> Anyone with this link can view your calendar.
                To revoke access, you&apos;ll need to create a new calendar.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Close
          </Button>
          <Button
            onClick={handleCopy}
            variant="contained"
            startIcon={copied ? <Check /> : <ContentCopy />}
          >
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Calendar link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareCalendarButton;
