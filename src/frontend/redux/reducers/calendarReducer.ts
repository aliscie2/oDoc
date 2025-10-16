import {
  Availability,
  Calendar,
  CalendarActions,
} from "$/declarations/backend/backend.did";

const calendar_actions: CalendarActions = {
  delete_availabilities: [],
  delete_events: [],
  events: [],
  availabilities: [],
};

const calendar: Calendar = {
  id: "string",
  owner: "string",
  events: [],
  availabilities: [],
};

const initialState: any = {
  calendar_actions,
  calendar,
  current_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  google_events: [],
  owner_google_events: [],
  is_google_connected: false,
  calendarChanged: false,
  isInitlized: false,
  sharedCalendar: null, // Add shared calendar state
};

export function calendarReducer(state = initialState, action: any): unknown {
  switch (action.type) {
    case "SET_SHARED_CALENDAR":
      return {
        ...state,
        sharedCalendar: action.sharedCalendar,
      };

    case "CLEAR_SHARED_CALENDAR":
      return {
        ...state,
        sharedCalendar: null,
        owner_google_events: [],
      };

    case "SET_TRAINING_DATA":
      return {
        ...state,
        training_data: {
          output: action.training_data.output,
          input: action.training_data.input || state.training_data.input,
        },
      };

    case "SET_TIMEZONE":
      return {
        ...state,
        current_timezone: action.current_timezone,
      };

    case "SET_CALENDAR":
      return {
        ...state,
        isInitlized: true,
        calendarChanged: false,
        calendar_actions: {
          ...state.calendar_actions,
          // Only reset if calendarChanged is false
          ...(state.calendarChanged ? {} : calendar_actions),
        },
        calendar: action.calendar,
      };

    case "SET_CALENDAR_CHANGED":
      return {
        ...state,
        calendarChanged: action.calendarChanged,
        calendar_actions: action.calendarChanged
          ? state.calendar_actions
          : calendar_actions,
      };

    case "ADD_EVENTS":
      return state.is_google_connected
        ? {
            ...state,
            google_events: [
              ...state.google_events,
              ...action.events.map((e: unknown) => ({
                ...e,
                id: e.id || Math.random().toString(),
                isGoogleEvent: true,
              })),
            ],
          }
        : {
            ...state,
            calendarChanged: true, // Already set
            calendar_actions: {
              ...state.calendar_actions,
              events: [
                ...state.calendar_actions.events,
                ...action.events.map((e: unknown) => ({
                  ...e,
                  id: e.id || Math.random().toString(),
                })),
              ],
            },
            calendar: {
              ...state.calendar,
              events: [
                ...state.calendar.events,
                ...action.events.map((e: unknown) => ({
                  ...e,
                  id: e.id || Math.random().toString(),
                })),
              ],
            },
          };

    case "ADD_EVENT":
      const newEvent = {
        ...action.event,
        id: action.event.id || Math.random().toString(),
      };
      return state.is_google_connected
        ? {
            ...state,
            google_events: [
              ...state.google_events,
              { ...newEvent, isGoogleEvent: true },
            ],
          }
        : {
            ...state,
            calendarChanged: true, // Already set
            calendar_actions: {
              ...state.calendar_actions,
              events: [...state.calendar_actions.events, newEvent],
            },
            calendar: {
              ...state.calendar,
              events: [...state.calendar.events, newEvent],
            },
          };

    case "UPDATE_EVENT":
      const updatedEvent = {
        ...action.event,
        created_by: action.event.created_by || state.calendar.owner,
      };
      if (state.is_google_connected) {
        const isInGoogleEvents = state.google_events.some(
          (e) => e.id === updatedEvent.id,
        );
        return {
          ...state,
          calendarChanged: state.calendar.events.some(
            (e) => e.id === updatedEvent.id,
          ), // Set if in calendar
          google_events: isInGoogleEvents
            ? state.google_events.map((e) =>
                e.id === updatedEvent.id
                  ? { ...updatedEvent, isGoogleEvent: true }
                  : e,
              )
            : state.google_events,
          calendar: {
            ...state.calendar,
            events: state.calendar.events.some((e) => e.id === updatedEvent.id)
              ? state.calendar.events.map((e) =>
                  e.id === updatedEvent.id ? updatedEvent : e,
                )
              : state.calendar.events,
          },
          calendar_actions: state.calendar.events.some(
            (e) => e.id === updatedEvent.id,
          )
            ? {
                ...state.calendar_actions,
                events: state.calendar_actions.events.map((e) =>
                  e.id === updatedEvent.id ? updatedEvent : e,
                ),
              }
            : state.calendar_actions,
        };
      } else {
        return {
          ...state,
          calendarChanged: true, // Already set
          calendar_actions: {
            ...state.calendar_actions,
            events: state.calendar_actions.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e,
            ),
          },
          calendar: {
            ...state.calendar,
            events: state.calendar.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e,
            ),
          },
        };
      }

    case "DELETE_EVENT":
      if (state.is_google_connected) {
        const isInGoogleEvents = state.google_events.some(
          (e) => e.id === action.id,
        );
        const isInCalendarEvents = state.calendar.events.some(
          (e) => e.id === action.id,
        );

        return {
          ...state,
          calendarChanged: isInCalendarEvents, // Set if in calendar
          google_events: isInGoogleEvents
            ? state.google_events.filter((e) => e.id !== action.id)
            : state.google_events,
          calendar: {
            ...state.calendar,
            events: isInCalendarEvents
              ? state.calendar.events.filter((e) => e.id !== action.id)
              : state.calendar.events,
          },
          calendar_actions: isInCalendarEvents
            ? {
                ...state.calendar_actions,
                delete_events: [
                  ...state.calendar_actions.delete_events,
                  action.id,
                ],
              }
            : state.calendar_actions,
        };
      } else {
        return {
          ...state,
          calendarChanged: true, // Already set
          calendar_actions: {
            ...state.calendar_actions,
            delete_events: [...state.calendar_actions.delete_events, action.id],
          },
          calendar: {
            ...state.calendar,
            events: state.calendar.events.filter((e) => e.id !== action.id),
          },
        };
      }

    case "ADD_AVAILABILITIES":
      return {
        ...state,
        calendarChanged: true,
        calendar_actions: {
          ...state.calendar_actions,
          availabilities: [
            ...state.calendar_actions.availabilities,
            ...action.availabilities,
          ],
        },
        calendar: {
          ...state.calendar,
          availabilities: [
            ...state.calendar.availabilities,
            ...action.availabilities,
          ],
        },
      };

    case "ADD_AVAILABILITY":
      return {
        ...state,
        calendarChanged: true,
        calendar_actions: {
          ...state.calendar_actions,
          availabilities: [
            ...state.calendar_actions.availabilities,
            action.availability,
          ],
        },
        calendar: {
          ...state.calendar,
          availabilities: [
            ...state.calendar.availabilities,
            action.availability,
          ],
        },
      };

    case "UPDATE_AVAILABILITY": {
      const existingAvailabilityIndex =
        state.calendar_actions.availabilities.findIndex(
          (availability: Availability) =>
            availability.id === action.availability.id,
        );

      const updatedAvailabilities =
        existingAvailabilityIndex === -1
          ? [...state.calendar_actions.availabilities, action.availability] // Add new
          : state.calendar_actions.availabilities.map(
              (
                availability: Availability, // Update existing
              ) =>
                availability.id === action.availability.id
                  ? action.availability
                  : availability,
            );

      return {
        ...state,
        calendarChanged: true,
        calendar_actions: {
          ...state.calendar_actions,
          availabilities: updatedAvailabilities,
        },
        calendar: {
          ...state.calendar,
          availabilities: state.calendar.availabilities.map(
            (availability: Availability) =>
              availability.id === action.availability.id
                ? action.availability
                : availability,
          ),
        },
      };
    }

    case "DELETE_AVAILABILITY":
      return {
        ...state,
        calendarChanged: true,
        calendar_actions: {
          ...state.calendar_actions,
          delete_availabilities: [
            ...state.calendar_actions.delete_availabilities,
            action.id,
          ],
        },
        calendar: {
          ...state.calendar,
          availabilities: state.calendar.availabilities.filter(
            (availability: Availability) => availability.id !== action.id,
          ),
        },
      };

    case "SET_GOOGLE_CALENDAR":
      return {
        ...state,
        is_google_connected: true,
        google_events: action.events.map((event) => ({
          ...event,
          // Don't add another prefix - events already have email_originalId format
          // and we need to preserve originalId for API operations
          isGoogleEvent: true, // Add flag to identify Google events
          // Preserve the created_by field which should be the Google account email
          // Preserve originalId for API operations
        })),
      };

    case "MERGE_GOOGLE_CALENDAR_EVENTS":
      // Remove existing events from this account and add new ones
      const accountEmail = action.accountEmail;
      const existingEvents = state.google_events.filter(
        (event) => event.created_by !== accountEmail,
      );
      const newEvents = action.events.map((event) => ({
        ...event,
        isGoogleEvent: true,
        // Don't add google_ prefix here as it's already handled in the hook
      }));

      return {
        ...state,
        is_google_connected: true,
        google_events: [...existingEvents, ...newEvents],
      };

    case "ADD_CALENDAR_EMAIL":
      if (state.calendar.id === action.id) {
        return {
          ...state,
          calendar: {
            ...state.calendar,
            google_ids: [...(state.calendar.google_ids || []), action.email],
          },
        };
      }
      return {
        ...state,
        calendar: {
          ...state.calendar,
          google_ids: [...(state.calendar.google_ids || []), action.email],
          id: action.id,
        },
      };

    case "REMOVE_CALENDAR_EMAIL":
      return {
        ...state,
        calendar: {
          ...state.calendar,
          google_ids: (state.calendar.google_ids || []).filter(
            (email: string) => email !== action.email,
          ),
        },
      };

    case "ADD_GOOGLE_EVENT_OPTIMISTIC":
      // Add optimistic event immediately for instant UI feedback
      return {
        ...state,
        google_events: [
          ...state.google_events,
          {
            ...action.event,
            isGoogleEvent: true,
            isPending: true, // Mark as pending sync
          },
        ],
      };

    case "UPDATE_GOOGLE_EVENT_OPTIMISTIC":
      // Update Google event optimistically for instant UI feedback
      return {
        ...state,
        google_events: state.google_events.map((event) =>
          event.id === action.event.id
            ? { ...action.event, isGoogleEvent: true, isPending: true }
            : event,
        ),
      };

    case "DELETE_GOOGLE_EVENT_OPTIMISTIC":
      // Delete Google event optimistically for instant UI feedback
      return {
        ...state,
        google_events: state.google_events.filter(
          (event) => event.id !== action.id,
        ),
      };

    case "REMOVE_OPTIMISTIC_EVENT":
      // Remove optimistic event (usually after real event is loaded)
      return {
        ...state,
        google_events: state.google_events.filter(
          (event) => event.id !== action.id,
        ),
      };

    case "CLEAR_GOOGLE_CALENDAR":
      return {
        ...state,
        is_google_connected: false,
        google_events: [],
        calendar: {
          ...state.calendar,
          google_ids: [],
        },
      };

    case "SET_OWNER_GOOGLE_EVENTS":
      return {
        ...state,
        owner_google_events: action.events,
      };

    case "CLEAR_CALENDAR_ACTIONS":
      return {
        ...state,
        calendar_actions: {
          delete_availabilities: [],
          delete_events: [],
          events: [],
          availabilities: [],
        },
      };

    default:
      return state;
  }
}
