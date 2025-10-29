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
  Stack,
  Typography,
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
  const { profile } = useSelector((state: unknown) => state.filesState);

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

  const formatDays = (days: number[] | Uint32Array) => {
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    // Convert Uint32Array to regular array if needed
    const daysArray = Array.from(days);

    // Handle special cases for better UX
    if (daysArray.length === 7) {
      return "Every day";
    }
    if (
      daysArray.length === 5 &&
      daysArray.every((day) => day >= 1 && day <= 5)
    ) {
      return "Weekdays";
    }
    if (
      daysArray.length === 2 &&
      daysArray.includes(6) &&
      daysArray.includes(7)
    ) {
      return "Weekends";
    }

    return daysArray
      .map((day) => dayNames[day - 1])
      .filter(Boolean)
      .join(", ");
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
            sx={{ py: 1.5 }}
          >
            <Stack
              direction="column"
              alignItems="flex-start"
              spacing={0.5}
              sx={{ width: "100%" }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ width: "100%" }}
              >
                <Typography variant="body2" fontWeight="medium">
                  {availability.title[0] || "Untitled"}
                </Typography>
                {availability.is_blocked && (
                  <DoNotDisturbIcon color="error" fontSize="small" />
                )}
              </Stack>
              {availability.schedule_type.WeeklyRecurring && (
                <Typography variant="caption" color="text.secondary">
                  {formatDays(availability.schedule_type.WeeklyRecurring.days)}
                </Typography>
              )}
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
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quick Presets
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedAvailability({
                          ...selectedAvailability,
                          schedule_type: {
                            WeeklyRecurring: {
                              ...selectedAvailability.schedule_type
                                .WeeklyRecurring!,
                              days: [1, 2, 3, 4, 5, 6, 7],
                            },
                          },
                        });
                      }}
                      disabled={!isOwner}
                    >
                      Every day
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedAvailability({
                          ...selectedAvailability,
                          schedule_type: {
                            WeeklyRecurring: {
                              ...selectedAvailability.schedule_type
                                .WeeklyRecurring!,
                              days: [1, 2, 3, 4, 5],
                            },
                          },
                        });
                      }}
                      disabled={!isOwner}
                    >
                      Weekdays
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setSelectedAvailability({
                          ...selectedAvailability,
                          schedule_type: {
                            WeeklyRecurring: {
                              ...selectedAvailability.schedule_type
                                .WeeklyRecurring!,
                              days: [6, 7],
                            },
                          },
                        });
                      }}
                      disabled={!isOwner}
                    >
                      Weekends
                    </Button>
                  </Stack>

                  <FormControl fullWidth>
                    <InputLabel>Custom Days</InputLabel>
                    <Select
                      multiple
                      value={Array.from(
                        selectedAvailability.schedule_type.WeeklyRecurring
                          .days || [],
                      )}
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
                      renderValue={(selected) => {
                        const selectedArray = Array.from(selected as number[]);
                        return (
                          <Typography variant="body2" color="text.secondary">
                            {formatDays(selectedArray)}
                          </Typography>
                        );
                      }}
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
                </>
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
