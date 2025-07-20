import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
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
          height: "100vh",
          width: "100vw",
          borderRadius: 0,
        },
      }}
    >
      <DialogContent
        sx={{
          padding: 0,
          margin: 0,
          overflow: "auto",
          height: "100vh",
          width: "100%",
          position: "relative",
        }}
      >
        {children}

        <IconButton
          onClick={onClose}
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            backgroundColor: "background.paper",
            color: "grey.700",
            boxShadow: 3,
            zIndex: 9999,
            "&:hover": {
              backgroundColor: "grey.100",
              boxShadow: 6,
            },
          }}
        >
          <Close />
        </IconButton>
      </DialogContent>
    </Dialog>
  );
};
export default FullscreenDialog;
