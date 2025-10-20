import React from "react";
import { Alert, Box, IconButton, Slide } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { ToastMessage } from "../hooks/useToast";

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        maxWidth: { xs: "calc(100vw - 32px)", sm: 400 },
      }}
    >
      {toasts.map((toast) => (
        <Slide
          key={toast.id}
          direction="left"
          in={true}
          mountOnEnter
          unmountOnExit
        >
          <Alert
            severity={toast.type}
            action={
              <IconButton
                size="small"
                onClick={() => onRemove(toast.id)}
                sx={{ color: "inherit" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
            sx={{
              boxShadow: 3,
              "& .MuiAlert-message": {
                wordBreak: "break-word",
              },
            }}
          >
            {toast.message}
          </Alert>
        </Slide>
      ))}
    </Box>
  );
};
