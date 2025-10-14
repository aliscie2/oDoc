import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface EventDeleteConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle?: string;
}

const EventDeleteConfirmation: React.FC<EventDeleteConfirmationProps> = ({
  open,
  onClose,
  onConfirm,
  eventTitle,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Event</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete{" "}
          {eventTitle ? `"${eventTitle}"` : "this event"}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDeleteConfirmation;
