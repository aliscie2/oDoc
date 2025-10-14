// Event Dialog Component
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import EventForm from "./EventForm";
import EventDeleteConfirmation from "./EventDeleteConfirmation";
import EventJobIntegration from "./EventJobIntegration";
import { useEventActions } from "../hooks/useEventActions";

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  slotInfo: any;
  selectedEvent?: any;
}

const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onClose,
  slotInfo,
  selectedEvent,
}) => {
  const { profile } = useSelector((state: any) => state.filesState);
  const { calendar } = useSelector((state: unknown) => state.calendarState);
  const { createEvent, updateEvent, deleteEvent } = useEventActions();

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    attendees: [],
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jobData, setJobData] = useState<any>(null);

  useEffect(() => {
    if (selectedEvent) {
      setEventData({
        title: selectedEvent.title || "",
        description: selectedEvent.description || "",
        attendees: selectedEvent.attendees || [],
      });
    } else {
      setEventData({
        title: "",
        description: "",
        attendees: [],
      });
    }
  }, [selectedEvent, open]);

  const handleSubmit = async () => {
    setIsSaving(true);

    const onSuccess = () => {
      handleClose();
    };

    const onError = (message: string) => {
      alert(message);
      setIsSaving(false);
    };

    try {
      if (selectedEvent) {
        await updateEvent(eventData, slotInfo, selectedEvent, onSuccess, onError);
      } else {
        await createEvent(eventData, slotInfo, onSuccess, onError);
      }
    } catch (error) {
      onError("An unexpected error occurred");
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;

    const onSuccess = () => {
      setShowDeleteConfirm(false);
      handleClose();
    };

    const onError = (message: string) => {
      alert(message);
      setShowDeleteConfirm(false);
    };

    await deleteEvent(selectedEvent, onSuccess, onError);
  };

  const handleClose = () => {
    setEventData({
      title: "",
      description: "",
      attendees: [],
    });
    setShowDeleteConfirm(false);
    setIsSaving(false);
    onClose();
  };

  const isEditMode = Boolean(selectedEvent);
  const canEdit =
    !isEditMode ||
    calendar?.owner === profile?.id ||
    (selectedEvent && selectedEvent.created_by === profile?.id);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditMode ? "Update Event" : "Create New Event"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <EventJobIntegration
            isEditMode={isEditMode}
            onJobDataLoaded={setJobData}
            onEventDataGenerated={(data) => {
              setEventData((prev) => ({
                ...prev,
                title: data.title || prev.title,
                description: data.description || prev.description,
              }));
            }}
          />
          <EventForm
            eventData={eventData}
            slotInfo={slotInfo}
            canEdit={canEdit}
            onEventDataChange={setEventData}
          />
        </DialogContent>
        <DialogActions>
          {isEditMode && canEdit && (
            <Button onClick={() => setShowDeleteConfirm(true)} color="error">
              Delete
            </Button>
          )}
          <Button onClick={handleClose}>Cancel</Button>
          {canEdit && (
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={!eventData.title.trim() || isSaving}
            >
              {isSaving ? "Saving..." : isEditMode ? "Update" : "Create"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <EventDeleteConfirmation
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        eventTitle={selectedEvent?.title}
      />
    </>
  );
};

export default EventDialog;
