// Event CRUD operations hook
import { useDispatch, useSelector } from "react-redux";
import { useGoogleCalendar } from "./useGoogleCalendar";
import { ValidationEngine } from "../validation";

export const useEventActions = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: any) => state.filesState);
  const { calendar } = useSelector((state: any) => state.calendarState);
  const { isConnected, executeGoogleAction, refreshGoogleCalendarEvents } =
    useGoogleCalendar();

  const createEvent = async (
    eventData: any,
    slotInfo: any,
    onSuccess: () => void,
    onError: (message: string) => void,
  ) => {
    try {
      // Validate event before creation
      const validationContext = {
        calendar,
        profile,
        eventData: {
          title: eventData.title,
          description: eventData.description,
          attendees: eventData.attendees || [],
        },
        slotInfo,
        isGoogleConnected:
          isConnected && calendar?.google_ids && calendar.google_ids.length > 0,
      };

      const validationResult = ValidationEngine.validate(validationContext);

      if (!validationResult.isValid) {
        console.error(
          "❌ [EventActions] Validation failed:",
          validationResult.errors,
        );
        onError(validationResult.errors.join("\n"));
        return;
      }

      // Display warnings if any
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        console.warn(
          "⚠️ [EventActions] Validation warnings:",
          validationResult.warnings,
        );
      }

      const eventPayload = {
        id: `evt_${Date.now()}`,
        title: eventData.title.trim(),
        description: eventData.description.trim(),
        start_time: slotInfo.start.getTime() * 1e6,
        end_time: slotInfo.end.getTime() * 1e6,
        attendees: eventData.attendees || [],
        recurrence: [],
        created_by: profile?.id,
      };

      // Check if Google Calendar is connected
      const isGoogleConnected =
        isConnected && calendar?.google_ids && calendar.google_ids.length > 0;

      if (isGoogleConnected) {
        // Create in Google Calendar
        const result = await executeGoogleAction({
          type: "ADD_EVENT",
          event: eventPayload,
        });

        if (result) {
          // Refresh to get the actual Google Calendar event
          setTimeout(async () => {
            await refreshGoogleCalendarEvents();
          }, 1000);
          onSuccess();
        } else {
          console.error(
            "❌ [EventActions] Failed to create event in Google Calendar",
          );
          onError("Failed to create event in Google Calendar");
        }
      } else {
        // Create in backend only
        dispatch({ type: "ADD_EVENT", event: eventPayload });
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating event:", error);
      onError("Failed to create event. Please try again.");
    }
  };

  const updateEvent = async (
    eventData: any,
    slotInfo: any,
    selectedEvent: unknown,
    onSuccess: () => void,
    onError: (message: string) => void,
  ) => {
    try {
      // Validate event before update
      const validationContext = {
        calendar,
        profile,
        eventData: {
          title: eventData.title,
          description: eventData.description,
          attendees: eventData.attendees || [],
        },
        slotInfo,
        selectedEvent,
        isGoogleConnected:
          isConnected && calendar?.google_ids && calendar.google_ids.length > 0,
      };

      const validationResult = ValidationEngine.validate(validationContext);

      if (!validationResult.isValid) {
        console.error(
          "❌ [EventActions] Validation failed:",
          validationResult.errors,
        );
        onError(validationResult.errors.join("\n"));
        return;
      }

      // Display warnings if any
      if (validationResult.warnings && validationResult.warnings.length > 0) {
        console.warn(
          "⚠️ [EventActions] Validation warnings:",
          validationResult.warnings,
        );
      }

      const eventPayload = {
        id: selectedEvent.id,
        title: eventData.title.trim(),
        description: eventData.description.trim(),
        start_time: slotInfo.start.getTime() * 1e6,
        end_time: slotInfo.end.getTime() * 1e6,
        attendees: eventData.attendees || [],
        recurrence: [],
        created_by: profile?.id,
      };

      const isGoogleConnected =
        isConnected && calendar?.google_ids && calendar.google_ids.length > 0;
      const isGoogleEvent = selectedEvent.isGoogleEvent;

      if (isGoogleConnected && isGoogleEvent) {
        const result = await executeGoogleAction({
          type: "UPDATE_EVENT",
          event: eventPayload,
        });

        if (result) {
          setTimeout(async () => {
            await refreshGoogleCalendarEvents();
          }, 1000);
          onSuccess();
        } else {
          onError("Failed to update event in Google Calendar");
        }
      } else {
        dispatch({ type: "UPDATE_EVENT", event: eventPayload });
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating event:", error);
      onError("Failed to update event. Please try again.");
    }
  };

  const deleteEvent = async (
    selectedEvent: unknown,
    onSuccess: () => void,
    onError: (message: string) => void,
  ) => {
    try {
      const isGoogleConnected =
        isConnected && calendar?.google_ids && calendar.google_ids.length > 0;
      const isGoogleEvent =
        selectedEvent.isGoogleEvent ||
        (selectedEvent.id && selectedEvent.id.includes("@"));

      if (isGoogleConnected && isGoogleEvent) {
        // Extract the actual Google Calendar event ID
        let googleEventId = selectedEvent.originalId || selectedEvent.id;
        if (googleEventId.includes("_")) {
          const parts = googleEventId.split("_");
          googleEventId = parts[parts.length - 1];
        }

        const result = await executeGoogleAction({
          type: "DELETE_EVENT",
          id: googleEventId,
        });

        if (result) {
          setTimeout(async () => {
            await refreshGoogleCalendarEvents();
          }, 1000);
          onSuccess();
        } else {
          onError("Failed to delete event from Google Calendar");
        }
      } else {
        dispatch({ type: "DELETE_EVENT", id: selectedEvent.id });
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      onError("Failed to delete event. Please try again.");
    }
  };

  return {
    createEvent,
    updateEvent,
    deleteEvent,
  };
};
