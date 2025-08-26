import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import format from "date-fns/format";
import { RootState } from "../../../redux/reducers";
import GoogleCalendarButton from "./addEventToGoogleCalenar";
import { Link } from "react-router-dom";
import { useGoogleCalendar } from "./googleAccounts/useGoogleCalendar";
import { backendActor } from "@/utils/backendUtils";
import { Job } from "$/declarations/backend/backend.did";

// Job interface based on your Rust struct
const EventDialog = ({ open, onClose, slotInfo, selectedEvent = null }) => {
  // Using direct backendActor import
  const { profile } = useSelector((state: any) => state.filesState);
  const { calendar } = useSelector((state: RootState) => state.calendarState);
  const calendarOwnerId = calendar?.owner;

  const isEditMode = Boolean(selectedEvent);

  const canEdit =
    !isEditMode ||
    calendarOwnerId === profile?.id ||
    (selectedEvent && selectedEvent.created_by === profile?.id);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    recurrence: {
      frequency: "Weekly",
      interval: 1,
      count: null,
      until: null,
    },
    attendees: [],
  });
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);

  // Helper function to safely extract jobId from URL
  const getJobIdFromUrl = (): string | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const jobIdFromParam = urlParams.get("jobId");

      if (jobIdFromParam) {
        return jobIdFromParam;
      }

      // Fallback: parse manually if URLSearchParams doesn't work
      const searchString = window.location.search;
      const jobIdMatch = searchString.match(/[?&]jobId=([^&]*)/);
      return jobIdMatch ? decodeURIComponent(jobIdMatch[1]) : null;
    } catch (error) {
      console.warn("Error parsing jobId from URL:", error);
      return null;
    }
  };

  // Fetch job data when component mounts or jobId changes
  useEffect(() => {
    const fetchJobData = async () => {
      const jobId = getJobIdFromUrl();

      if (!jobId || !backendActor) {
        return;
      }

      setIsLoadingJob(true);
      setJobError(null);

      try {
        const jobData = await backendActor.get_job(jobId);

        if (jobData && jobData.length > 0) {
          setJob(jobData[0]);
        } else {
          setJobError("Job not found");
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
        setJobError("Failed to fetch job data");
      } finally {
        setIsLoadingJob(false);
      }
    };

    fetchJobData();
  }, [backendActor, open]); // Re-fetch when dialog opens

  // Generate event title and description from job data
  const generateEventDataFromJob = (job: Job) => {
    const jobTitlesStr =
      job.job_titles.length > 0 ? job.job_titles.join(", ") : "Job Opportunity";

    const title = `Interview: ${jobTitlesStr}`;

    let description = `Job Interview Details:\n\n`;
    description += `Position: ${jobTitlesStr}\n`;
    description += `Proficiency Level: ${job.proficiency_level}\n`;

    if (job.skills.length > 0) {
      description += `Required Skills: ${job.skills.join(", ")}\n`;
    }

    if (job.description) {
      description += `\nJob Description:\n${job.description}\n`;
    }

    if (job.contacts.length > 0) {
      description += `\nContact Information: ${job.contacts.join(", ")}\n`;
    }

    if (job.emails.length > 0) {
      description += `Email: ${job.emails.join(", ")}\n`;
    }

    return { title, description };
  };

  // Initialize event data
  useEffect(() => {
    if (selectedEvent) {
      // Edit mode: use existing event data
      setEventData({
        title: selectedEvent.title,
        description: selectedEvent.description,
        recurrence: (selectedEvent?.recurrence &&
          selectedEvent?.recurrence[0]) || {
          frequency: "Weekly",
          interval: 1,
          count: null,
          until: null,
        },
        attendees: selectedEvent.attendees,
      });
      setShowRecurrence(selectedEvent.recurrence?.length > 0);
    } else {
      // Create mode: potentially use job data
      const initialData = {
        title: "",
        description: "",
        recurrence: {
          frequency: "Weekly",
          interval: 1,
          count: null,
          until: null,
        },
        attendees: [],
      };

      // If we have job data and we're creating a new event, use job info
      if (job && !isEditMode) {
        const jobEventData = generateEventDataFromJob(job);
        initialData.title = jobEventData.title;
        initialData.description = jobEventData.description;
      }

      setEventData(initialData);
      setShowRecurrence(false);
    }
  }, [selectedEvent, job, isEditMode]);

  const handleChange = (field) => (event) => {
    setEventData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleRecurrenceChange = (field) => (event) => {
    setEventData((prev) => ({
      ...prev,
      recurrence: {
        ...prev.recurrence,
        [field]: event.target.value,
      },
    }));
  };

  const dispatch = useDispatch();
  const { executeGoogleAction, isConnected, calendarId } = useGoogleCalendar();

  const handleSubmit = async () => {
    // Validation
    if (!eventData.title.trim()) {
      alert("Event title is required");
      return;
    }

    if (!slotInfo?.start || !slotInfo?.end) {
      alert("Invalid event time slot");
      return;
    }

    const eventPayload = {
      id: selectedEvent?.id || Math.random().toString(),
      title: eventData.title.trim(),
      description: eventData.description.trim(),
      start_time: slotInfo.start.getTime() * 1e6,
      end_time: slotInfo.end.getTime() * 1e6,
      attendees: eventData.attendees,
      recurrence: showRecurrence ? [eventData.recurrence] : [],
      created_by: profile?.id,
    };

    try {
      if (isEditMode) {
        if (isConnected) {
          await executeGoogleAction({
            type: "UPDATE_EVENT",
            event: eventPayload,
          });
        }
        dispatch({ type: "UPDATE_EVENT", event: eventPayload });
      } else {
        const attendees = [calendar?.google_ids?.[0], calendarId].filter(
          Boolean,
        ); // Remove null/undefined values

        if (isConnected) {
          await executeGoogleAction({
            type: "ADD_EVENT",
            event: { ...eventPayload, attendees },
          });
        }
        dispatch({ type: "ADD_EVENT", event: eventPayload });
      }

      handleClose();
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent?.id) {
      alert("Cannot delete event: Invalid event ID");
      return;
    }

    try {
      if (isConnected) {
        await executeGoogleAction({
          type: "DELETE_EVENT",
          id: selectedEvent.id,
        });
      }
      dispatch({ type: "DELETE_EVENT", id: selectedEvent.id });
      handleClose();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const handleClose = () => {
    setEventData({
      title: "",
      description: "",
      recurrence: {
        frequency: "Weekly",
        interval: 1,
        count: null,
        until: null,
      },
      attendees: [],
    });
    setShowDeleteConfirm(false);
    setJobError(null);
    onClose();
  };

  // Delete confirmation dialog
  if (showDeleteConfirm) {
    return (
      <Dialog open={open} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? "Update Event" : "Create New Event"}
        {job && !isEditMode && (
          <Typography
            variant="caption"
            display="block"
            sx={{ mt: 1, opacity: 0.7 }}
          >
            Auto-filled from job: {job.job_titles.join(", ") || "Untitled Job"}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {/* Loading and error states */}
        {isLoadingJob && (
          <Typography variant="body2" sx={{ mb: 2, fontStyle: "italic" }}>
            Loading job information...
          </Typography>
        )}

        {jobError && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {jobError}
          </Typography>
        )}

        <Stack spacing={2} sx={{ mt: 1 }}>
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

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              label="Start Time"
              type="datetime-local"
              value={format(
                slotInfo?.start || new Date(),
                "yyyy-MM-dd'T'HH:mm",
              )}
              InputProps={{ readOnly: true }}
              fullWidth
              disabled={!canEdit}
            />

            <TextField
              label="End Time"
              type="datetime-local"
              value={format(slotInfo?.end || new Date(), "yyyy-MM-dd'T'HH:mm")}
              InputProps={{ readOnly: true }}
              fullWidth
              disabled={!canEdit}
            />
          </Box>

          {showRecurrence && (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={eventData.recurrence.frequency}
                  onChange={handleRecurrenceChange("frequency")}
                  label="Frequency"
                  disabled={!canEdit}
                >
                  <MenuItem value="Daily">Daily</MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Interval"
                type="number"
                value={eventData.recurrence.interval}
                onChange={handleRecurrenceChange("interval")}
                fullWidth
                InputProps={{ inputProps: { min: 1 } }}
                disabled={!canEdit}
              />
            </Box>
          )}

          <TextField
            disabled={!canEdit}
            label="Attendees"
            placeholder="Enter email addresses separated by commas"
            fullWidth
            value={eventData.attendees.join(", ")}
            onChange={(e) => {
              const emails = e.target.value
                .split(",")
                .map((email) => email.trim())
                .filter(Boolean);
              setEventData((prev) => ({
                ...prev,
                attendees: emails,
              }));
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        {selectedEvent && selectedEvent.created_by !== profile?.id && (
          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Typography
              sx={{
                opacity: 1,
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              color="primary"
              component={Link}
              to={`/user/?id=${selectedEvent.created_by}`}
            >
              See their profile
            </Typography>
          </Box>
        )}

        {canEdit && slotInfo && (
          <GoogleCalendarButton
            event={{
              title: eventData.title,
              description: eventData?.description,
              start_time: slotInfo?.start.getTime() * 1e6,
              end_time: slotInfo?.end.getTime() * 1e6,
            }}
          />
        )}

        {canEdit && (
          <Button
            onClick={() => setShowRecurrence(!showRecurrence)}
            color="primary"
          >
            {showRecurrence ? "Hide Recurrence" : "Add Recurrence"}
          </Button>
        )}

        {isEditMode && canEdit && (
          <Button onClick={() => setShowDeleteConfirm(true)} color="error">
            Delete
          </Button>
        )}

        <Button onClick={handleClose}>Close</Button>

        {canEdit && (
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            disabled={!eventData.title.trim() || isLoadingJob}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;
