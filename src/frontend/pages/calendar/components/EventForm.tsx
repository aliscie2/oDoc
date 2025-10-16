import React from "react";
import { Box, Stack, TextField } from "@mui/material";
import { format } from "date-fns";

interface EventFormProps {
  eventData: {
    title: string;
    description: string;
    attendees: string[];
  };
  slotInfo: { start: Date; end: Date } | null;
  canEdit: boolean;
  onEventDataChange: (data: unknown) => void;
}

const EventForm: React.FC<EventFormProps> = ({
  eventData,
  slotInfo,
  canEdit,
  onEventDataChange,
}) => {
  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onEventDataChange({ ...eventData, [field]: e.target.value });
    };

  const handleAttendeesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emails = e.target.value
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    onEventDataChange({
      ...eventData,
      attendees: emails,
    });
  };

  return (
    <Stack spacing={2}>
      <TextField
        autoFocus
        label="Event Title"
        fullWidth
        value={eventData.title}
        onChange={handleChange("title")}
        disabled={!canEdit}
        required
        error={!eventData.title.trim() && eventData.title !== ""}
        helperText={
          !eventData.title.trim() && eventData.title !== ""
            ? "Title is required"
            : ""
        }
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={4}
        value={eventData.description}
        onChange={handleChange("description")}
        disabled={!canEdit}
      />

      {slotInfo && (
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Start Time"
            type="datetime-local"
            value={format(slotInfo.start, "yyyy-MM-dd'T'HH:mm")}
            InputProps={{ readOnly: true }}
            fullWidth
            disabled={!canEdit}
          />

          <TextField
            label="End Time"
            type="datetime-local"
            value={format(slotInfo.end, "yyyy-MM-dd'T'HH:mm")}
            InputProps={{ readOnly: true }}
            fullWidth
            disabled={!canEdit}
          />
        </Box>
      )}

      <TextField
        label="Attendees (optional)"
        placeholder="Enter email addresses separated by commas"
        fullWidth
        value={(eventData.attendees || []).join(", ")}
        onChange={handleAttendeesChange}
        disabled={!canEdit}
        helperText="Example: john@example.com, jane@example.com"
      />
    </Stack>
  );
};

export default EventForm;
