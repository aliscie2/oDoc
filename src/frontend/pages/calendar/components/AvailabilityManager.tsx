// Availability Management Component - Simplified
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Stack,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  DoNotDisturb as DoNotDisturbIcon,
} from "@mui/icons-material";

interface TimeSlot {
  start_time: bigint;
  end_time: bigint;
}

interface Availability {
  id: string;
  title: string[];
  is_blocked: boolean;
  schedule_type: {
    WeeklyRecurring?: {
      days: number[];
      valid_until: number[];
    };
  };
  time_slots: TimeSlot[];
}

const AvailabilityManager: React.FC = () => {
  const dispatch = useDispatch();
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { profile } = useSelector((state: any) => state.filesState);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] =
    useState<Availability | null>(null);

  const isOwner = calendar?.owner === profile?.id;
  const availabilities = calendar?.availabilities || [];

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDialogOpen = (availability?: Availability) => {
    if (availability) {
      setSelectedAvailability(availability);
    } else {
      setSelectedAvailability({
        id: Math.random().toString(),
        title: [""],
        is_blocked: false,
        schedule_type: {
          WeeklyRecurring: {
            days: [1],
            valid_until: [],
          },
        },
        time_slots: [
          {
            start_time: BigInt(9 * 60 * 60 * 1000000000),
            end_time: BigInt(17 * 60 * 60 * 1000000000),
          },
        ],
      });
    }
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedAvailability(null);
  };

  const handleSave = () => {
    if (selectedAvailability) {
      dispatch({
        type: selectedAvailability.id
          ? "UPDATE_AVAILABILITY"
          : "ADD_AVAILABILITY",
        availability: selectedAvailability,
      });
      handleDialogClose();
    }
  };

  const handleDelete = () => {
    if (selectedAvailability) {
      dispatch({
        type: "DELETE_AVAILABILITY",
        id: selectedAvailability.id,
      });
      handleDialogClose();
    }
  };

  const formatDays = (days: number[]) => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => dayNames[day - 1]).join(", ");
  };

  return (
    <>
      <Button onClick={handleMenuOpen}>Availabilities</Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {isOwner && (
          <>
            <MenuItem onClick={() => handleDialogOpen()}>
              <AddIcon sx={{ mr: 1 }} /> Add New Availability
            </MenuItem>
            <Divider />
          </>
        )}

        {availabilities.map((availability: Availability) => (
          <MenuItem
            key={availability.id}
            onClick={() => handleDialogOpen(availability)}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography>
                {availability.title[0] || "Untitled"}
                {availability.schedule_type.WeeklyRecurring && (
                  <Typography component="span" color="text.secondary">
                    {" • "}
                    {formatDays(
                      availability.schedule_type.WeeklyRecurring.days,
                    )}
                  </Typography>
                )}
              </Typography>
              {availability.is_blocked && <DoNotDisturbIcon color="error" />}
            </Stack>
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedAvailability?.id
            ? "Edit Availability"
            : "Create Availability"}
        </DialogTitle>
        <DialogContent>
          {selectedAvailability && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Title"
                value={selectedAvailability.title[0] || ""}
                onChange={(e) =>
                  setSelectedAvailability({
                    ...selectedAvailability,
                    title: [e.target.value],
                  })
                }
                fullWidth
                disabled={!isOwner}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={selectedAvailability.is_blocked}
                    onChange={(e) =>
                      setSelectedAvailability({
                        ...selectedAvailability,
                        is_blocked: e.target.checked,
                      })
                    }
                  />
                }
                label="Block this time slot"
                disabled={!isOwner}
              />

              {selectedAvailability.schedule_type.WeeklyRecurring && (
                <FormControl fullWidth>
                  <InputLabel>Days</InputLabel>
                  <Select
                    multiple
                    value={
                      selectedAvailability.schedule_type.WeeklyRecurring.days
                    }
                    onChange={(e) => {
                      const days = e.target.value as number[];
                      setSelectedAvailability({
                        ...selectedAvailability,
                        schedule_type: {
                          WeeklyRecurring: {
                            ...selectedAvailability.schedule_type
                              .WeeklyRecurring!,
                            days: days,
                          },
                        },
                      });
                    }}
                    disabled={!isOwner}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as number[]).map((day) => (
                          <Chip
                            key={day}
                            label={
                              ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                                day - 1
                              ]
                            }
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <MenuItem key={day} value={day}>
                        {
                          [
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                            "Saturday",
                            "Sunday",
                          ][day - 1]
                        }
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {selectedAvailability?.id && isOwner && (
            <Button onClick={handleDelete} color="error">
              Delete
            </Button>
          )}
          <Button onClick={handleDialogClose}>Cancel</Button>
          {isOwner && (
            <Button onClick={handleSave} variant="contained">
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AvailabilityManager;
