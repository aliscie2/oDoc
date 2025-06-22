import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";

// Shared Fullscreen Dialog Component
export const FullscreenDialog = ({
  open,
  onClose,
  title,
  children,
  showTitle = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      fullScreen
      PaperProps={{
        sx: {
          margin: 0,
          maxHeight: "100vh",
          height: "100vh",
          width: "100vw",
          borderRadius: 0,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: showTitle ? "space-between" : "flex-end",
          alignItems: "center",
          padding: "8px 16px",
          margin: 0,
          minHeight: "auto",
        }}
      >
        {showTitle && <Typography variant="h6">{title}</Typography>}
        <IconButton
          onClick={onClose}
          sx={{
            color: "grey.500",
            "&:hover": { color: "grey.700" },
            padding: "4px",
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: 0,
          margin: 0,
          overflow: "hidden",
          height: "calc(100vh - 56px)", // Subtract header height
          width: "100%",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            padding: 0,
            margin: 0,
          }}
        >
          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FullscreenDialog;
