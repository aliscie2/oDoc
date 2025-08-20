// undoActions.js
export function undoCalendarAction(message) {
  if (message.action_type !== "CALENDAR" || !message.actions?.length)
    return null;

  return message.actions.map((action) => {
    // let type = action.data?.type || action.type
    switch (action.type) {
      case "ADD_EVENT":
        return { type: "DELETE_EVENT", id: action.event.id };

      case "DELETE_EVENT":
        const deletedEvent = message.perv_cal?.events?.find(
          (e) => e.id === action.id,
        );
        if (!deletedEvent) return null;
        return {
          type: "ADD_EVENT",
          event: {
            id: deletedEvent.id,
            title: deletedEvent.title,
            date: new Date(
              deletedEvent.start_time / 1000000,
            ).toLocaleDateString("en-GB"),
            start_time: new Date(
              deletedEvent.start_time / 1000000,
            ).toLocaleTimeString("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
            end_time: new Date(
              deletedEvent.end_time / 1000000,
            ).toLocaleTimeString("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
            description:
              deletedEvent.description === "null"
                ? ""
                : deletedEvent.description || "",
            attendees: deletedEvent.attendees || [],
            recurrence: deletedEvent.recurrence || [],
          },
        };

      case "UPDATE_EVENT":
        const originalEvent = message.perv_cal?.events?.find(
          (e) => e.id === action.event.id,
        );
        if (!originalEvent) return null;
        return {
          type: "UPDATE_EVENT",
          event: {
            id: originalEvent.id,
            title: originalEvent.title,
            date: new Date(
              originalEvent.start_time / 1000000,
            ).toLocaleDateString("en-GB"),
            start_time: new Date(
              originalEvent.start_time / 1000000,
            ).toLocaleTimeString("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
            end_time: new Date(
              originalEvent.end_time / 1000000,
            ).toLocaleTimeString("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }),
            description:
              originalEvent.description === "null"
                ? ""
                : originalEvent.description || "",
            attendees: originalEvent.attendees || [],
            recurrence: originalEvent.recurrence || [],
          },
        };

      case "ADD_AVAILABILITY":
        return { type: "DELETE_AVAILABILITY", id: action.availability.id };

      case "DELETE_AVAILABILITY":
        const deletedAvail = message.perv_cal?.availabilities?.find(
          (a) => a.id === action.id,
        );
        if (!deletedAvail) return null;
        return { type: "ADD_AVAILABILITY", availability: deletedAvail };

      case "UPDATE_AVAILABILITY":
        const originalAvail = message.perv_cal?.availabilities?.find(
          (a) => a.id === action.availability.id,
        );
        if (!originalAvail) return null;
        return { type: "UPDATE_AVAILABILITY", availability: originalAvail };

      case "UPDATE_BLOCKED_TIME":
        const originalBlocked = message.perv_cal?.availabilities?.find(
          (a) => a.id === action.blocked_time.id,
        );
        if (!originalBlocked) return null;
        return { type: "UPDATE_BLOCKED_TIME", blocked_time: originalBlocked };

      case "DELETE_BLOCKED_TIME":
        const deletedBlocked = message.perv_cal?.availabilities?.find(
          (a) => a.id === action.id,
        );
        if (!deletedBlocked) return null;
        return { type: "ADD_AVAILABILITY", availability: deletedBlocked };

      default:
        return null;
    }
  });
}

export const undoJobAction = (message) => {
  if (
    message.action_type !== "JOB" ||
    !message.actions?.length ||
    !message.prev_job
  )
    return null;

  const undoUpdates = [];

  message.actions.forEach((action) => {
    const field = action.field;
    const prevValue = message.prev_job[field];

    if (prevValue !== undefined) {
      undoUpdates.push({
        field: field,
        values: Array.isArray(prevValue) ? prevValue : [prevValue],
      });
    } else {
      undoUpdates.push({
        field: field,
        values: [],
      });
    }
  });
  const category = Object.keys(
    message.prev_job.category || message.curr_job.category,
  )[0];

  return {
    type: "UPDATE_FIELDS",
    updates: undoUpdates,
    category,
    required_match_score:
      message.prev_job.required_match_score ||
      message.curr_job.required_match_score,
  };
};
