// Generic Undo/Redo System
import { Dispatch } from "redux";

// ===== TYPES =====
export interface ActionSnapshot {
  id: string;
  timestamp: number;
  actionType: string;
  originalActions: any[];
  undoActions: any[];
  redoActions: any[];
  metadata?: Record<string, any>;
}

export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  snapshot?: ActionSnapshot;
}

// ===== GENERIC ACTION REVERSER =====
class ActionReverser {
  private static reverseMap: Record<
    string,
    (action: any, context?: any) => unknown
  > = {
    // Calendar Actions
    ADD_EVENT: (action) => {
      const reverseAction = { type: "DELETE_EVENT", id: action.event?.id };
      console.log("[UNDO] Reversing ADD_EVENT:", {
        eventId: action.event?.id,
        reverseAction,
      });
      return reverseAction;
    },
    DELETE_EVENT: (action, context) => {
      // Find the specific event that was deleted by this action
      let eventToRestore = context?.deletedEvent;

      // If we have multiple deleted events, find the one matching this action
      if (context?.deletedEvents && context.deletedEvents.length > 0) {
        eventToRestore =
          context.deletedEvents.find((e: any) => e.id === action.id) ||
          context.deletedEvents[0];
      }

      const reverseAction = {
        type: "ADD_EVENT",
        event: eventToRestore,
      };

      console.log("[UNDO] Reversing DELETE_EVENT:", {
        actionId: action.id,
        foundEvent: eventToRestore,
        contextDeletedEventsCount: context?.deletedEvents?.length || 0,
      });

      return reverseAction;
    },
    UPDATE_EVENT: (action, context) => ({
      type: "UPDATE_EVENT",
      event: context?.originalEvent,
    }),
    ADD_AVAILABILITY: (action) => ({
      type: "DELETE_AVAILABILITY",
      id: action.availability?.id,
    }),
    DELETE_AVAILABILITY: (action, context) => ({
      type: "ADD_AVAILABILITY",
      availability: context?.deletedAvailability,
    }),
    UPDATE_AVAILABILITY: (action, context) => ({
      type: "UPDATE_AVAILABILITY",
      availability: context?.originalAvailability,
    }),

    // Job Actions
    UPDATE_FIELDS: (action, context) => {
      if (!context?.previousUpdates) {
        console.warn(
          "No previousUpdates in context for UPDATE_FIELDS reversal",
        );
        return null;
      }

      return {
        type: "UPDATE_FIELDS",
        updates: context.previousUpdates,
        category: context.previousCategory || action.category,
        required_match_score:
          context.previousScore || action.required_match_score,
      };
    },

    // Contract Actions
    ADD_PROMISE: (action) => ({
      type: "DELETE_PROMISE",
      contract_id: action.contract_id,
      id: action.promise?.id,
    }),
    DELETE_PROMISE: (action, context) => ({
      type: "ADD_PROMISE",
      contract_id: action.contract_id,
      promise: context?.deletedPromise,
      insertIndex: context?.insertIndex || 0,
    }),
    UPDATE_PROMISE: (action, context) => ({
      type: "UPDATE_PROMISE",
      contract_id: action.contract_id,
      promise: context?.originalPromise,
    }),
    ADD_CONTRACT: (action) => ({
      type: "REMOVE_CONTRACT",
      id: action.contract?.id,
    }),
    REMOVE_CONTRACT: (action, context) => ({
      type: "ADD_CONTRACT",
      contract: context?.removedContract,
    }),
  };

  static reverse(action: any, context?: any): any {
    const reverser = this.reverseMap[action.type];
    if (!reverser) {
      console.warn(`No reverse action defined for: ${action.type}`);
      return null;
    }
    return reverser(action, context);
  }

  static registerReverser(
    actionType: string,
    reverser: (action: any, context?: any) => any,
  ) {
    this.reverseMap[actionType] = reverser;
  }
}

// ===== CONTEXT EXTRACTOR =====
class ContextExtractor {
  private static extractors: Record<string, (message: any) => any> = {
    CALENDAR: (message) => {
      console.log(
        "[UNDO] Extracting calendar context - actions:",
        message.actions,
      );

      // Create a map of all events for easier lookup
      const allPrevEvents = [
        ...(message.prev_cal?.events || []),
        ...(message.prev_google_events || []),
        ...(message.google_events || []),
        ...(message.current_google_events || []),
        ...(message.current_calendar?.events || []),
      ];

      console.log(
        "[UNDO] All previous events available:",
        allPrevEvents.length,
      );

      // Find deleted events by matching action IDs with available events
      const deletedEvents =
        message.actions
          ?.filter((a: any) => a.type === "DELETE_EVENT")
          ?.map((action: any) => {
            const foundEvent = allPrevEvents.find(
              (e: any) => e.id === action.id,
            );
            console.log(
              `[UNDO] Looking for deleted event ${action.id}:`,
              foundEvent ? "FOUND" : "NOT FOUND",
            );
            return foundEvent;
          })
          ?.filter(Boolean) || [];

      console.log("[UNDO] Found deleted events:", deletedEvents.length);

      return {
        deletedEvents: deletedEvents,
        deletedEvent: deletedEvents[0],
        originalEvent: allPrevEvents.find((e: any) =>
          message.actions?.some(
            (a: any) => a.type === "UPDATE_EVENT" && a.event?.id === e.id,
          ),
        ),
        deletedAvailability: message.prev_cal?.availabilities?.find((a: any) =>
          message.actions?.some(
            (action: any) =>
              action.type === "DELETE_AVAILABILITY" && action.id === a.id,
          ),
        ),
        originalAvailability: message.prev_cal?.availabilities?.find((a: any) =>
          message.actions?.some(
            (action: any) =>
              action.type === "UPDATE_AVAILABILITY" &&
              action.availability?.id === a.id,
          ),
        ),
      };
    },

    JOB: (message) => {
      if (!message.prev_job) {
        return {};
      }

      // For JOB actions, the actions array contains the updates that were applied
      let updatesArray: any[] = [];

      if (message.actions && Array.isArray(message.actions)) {
        // The actions array contains the updates directly
        updatesArray = message.actions;
      }

      const previousUpdates = updatesArray
        .map((update: any) => {
          // Handle both tuple format [field, values] and object format {field, values}
          let field: string;
          let currentValues: string[];

          if (Array.isArray(update)) {
            // Tuple format: [field, values]
            field = update[0];
            currentValues = update[1];
          } else if (update.field) {
            // Object format: {field, values}
            field = update.field;
            currentValues = update.values;
          } else {
            return null;
          }

          const prevValue = message.prev_job[field];

          // Return in object format for consistency
          return {
            field: field,
            values:
              prevValue !== undefined
                ? Array.isArray(prevValue)
                  ? prevValue
                  : [prevValue]
                : [],
          };
        })
        .filter(Boolean); // Remove null entries

      return {
        previousUpdates,
        previousCategory: message.prev_job?.category
          ? Object.keys(message.prev_job.category)[0]
          : undefined,
        previousScore: message.prev_job?.required_match_score,
      };
    },

    CONTRACT: (message) => ({
      deletedPromise: message.prev_contract?.promises?.find((p: any) =>
        message.actions?.some(
          (a: any) => a.type === "DELETE_PROMISE" && a.id === p.id,
        ),
      ),
      originalPromise: message.prev_contract?.promises?.find((p: any) =>
        message.actions?.some(
          (a: any) => a.type === "UPDATE_PROMISE" && a.promise?.id === p.id,
        ),
      ),
      removedContract: message.prev_contract,
    }),
  };

  static extract(actionType: string, message: any): any {
    const extractor = this.extractors[actionType];
    return extractor ? extractor(message) : {};
  }

  static registerExtractor(
    actionType: string,
    extractor: (message: any) => any,
  ) {
    this.extractors[actionType] = extractor;
  }
}

// ===== CALENDAR ROUTING INTERFACE =====
interface CalendarRouter {
  isGoogleConnected: boolean;
  executeGoogleAction: (action: any) => Promise<any>;
  dispatch: Dispatch;
}

// ===== MAIN UNDO/REDO MANAGER =====
export class UndoRedoManager {
  private static snapshots = new Map<string, ActionSnapshot>();
  private static calendarRouter: CalendarRouter | null = null;

  static createSnapshot(
    messageId: string,
    actionType: string,
    originalActions: any[],
    message: any,
  ): ActionSnapshot {
    console.log("[UNDO] Creating snapshot:", {
      messageId,
      actionType,
      actionsCount: originalActions.length,
    });

    const context = ContextExtractor.extract(actionType, message);
    console.log("[UNDO] Extracted context:", context);

    let undoActions: any[] = [];
    let redoActions: any[] = [];

    if (actionType === "JOB" && originalActions.length > 0) {
      // For JOB actions, we need to create UPDATE_FIELDS actions
      const undoAction = ActionReverser.reverse(
        {
          type: "UPDATE_FIELDS",
          updates: originalActions,
          category: message.category,
          required_match_score: message.required_match_score,
        },
        context,
      );

      if (undoAction) {
        undoActions = [undoAction];
      }

      // Redo action recreates the original UPDATE_FIELDS
      redoActions = [
        {
          type: "UPDATE_FIELDS",
          updates: originalActions,
          category: message.category,
          required_match_score: message.required_match_score,
        },
      ];
    } else {
      // For other action types, use the original logic
      if (actionType === "CALENDAR") {
        console.log(
          "[UNDO] Processing CALENDAR snapshot - original actions:",
          originalActions,
        );

        // For CALENDAR, originalActions are already processed Redux actions
        undoActions = originalActions
          .map((action) => {
            const undoAction = ActionReverser.reverse(action, context);
            console.log("[UNDO] Generated undo action:", undoAction);
            return undoAction;
          })
          .filter((action) => action !== null);

        // Redo actions are the original processed Redux actions
        redoActions = [...originalActions];

        console.log("[UNDO] Final undo actions:", undoActions);
        console.log("[UNDO] Final redo actions:", redoActions);
      } else {
        // For non-CALENDAR actions, use the original logic
        undoActions = originalActions
          .map((action) => {
            const undoAction = ActionReverser.reverse(action, context);
            return undoAction;
          })
          .filter((action) => action !== null);

        redoActions = [...originalActions];
      }
    }

    const snapshot: ActionSnapshot = {
      id: messageId,
      timestamp: Date.now(),
      actionType,
      originalActions,
      undoActions,
      redoActions,
      metadata: { context, message },
    };

    console.log("[UNDO] Snapshot created:", {
      id: snapshot.id,
      undoActionsCount: snapshot.undoActions.length,
      redoActionsCount: snapshot.redoActions.length,
    });

    this.snapshots.set(messageId, snapshot);
    return snapshot;
  }

  static getSnapshot(messageId: string): ActionSnapshot | undefined {
    return this.snapshots.get(messageId);
  }

  static async executeUndo(
    messageId: string,
    dispatch: Dispatch,
  ): Promise<boolean> {
    console.log("[UNDO] ========== UNDO EXECUTION START ==========");
    console.log("[UNDO] Message ID:", messageId);

    const snapshot = this.snapshots.get(messageId);

    if (!snapshot) {
      console.log("[UNDO] ❌ No snapshot found for message ID:", messageId);
      return false;
    }

    console.log("[UNDO] Snapshot found:", {
      actionType: snapshot.actionType,
      undoActionsCount: snapshot.undoActions.length,
      undoActions: snapshot.undoActions,
    });

    if (!snapshot.undoActions.length) {
      console.log("[UNDO] ❌ No undo actions in snapshot");
      return false;
    }

    try {
      for (let i = 0; i < snapshot.undoActions.length; i++) {
        const action = snapshot.undoActions[i];
        console.log(
          `[UNDO] Executing action ${i + 1}/${snapshot.undoActions.length}:`,
          action,
        );

        if (action) {
          // Route calendar actions properly
          if (this.isCalendarAction(action.type)) {
            console.log("[UNDO] Routing to calendar system");
            await this.routeCalendarAction(action, dispatch);
          } else {
            console.log("[UNDO] Direct dispatch");
            dispatch(action);
          }
        } else {
          console.log("[UNDO] ⚠️ Null action, skipping");
        }
      }

      console.log("[UNDO] ✅ UNDO EXECUTION COMPLETE");
      return true;
    } catch (error) {
      console.error("[UNDO] ❌ UNDO EXECUTION FAILED:", error);
      return false;
    }
  }

  static async executeRedo(
    messageId: string,
    dispatch: Dispatch,
  ): Promise<boolean> {
    console.log("[REDO] ========== REDO EXECUTION START ==========");
    console.log("[REDO] Message ID:", messageId);

    const snapshot = this.snapshots.get(messageId);

    if (!snapshot || !snapshot.redoActions.length) {
      console.log("[REDO] ❌ No snapshot or no redo actions");
      return false;
    }

    console.log("[REDO] Redo actions:", snapshot.redoActions);

    try {
      for (const action of snapshot.redoActions) {
        if (action) {
          console.log("[REDO] Executing action:", action);

          // Route calendar actions properly
          if (this.isCalendarAction(action.type)) {
            console.log("[REDO] Routing to calendar system");
            await this.routeCalendarAction(action, dispatch);
          } else {
            console.log("[REDO] Direct dispatch");
            dispatch(action);
          }
        }
      }
      console.log("[REDO] ✅ REDO EXECUTION COMPLETE");
      return true;
    } catch (error) {
      console.error("[REDO] ❌ REDO EXECUTION FAILED:", error);
      return false;
    }
  }

  private static isCalendarAction(actionType: string): boolean {
    return [
      "ADD_EVENT",
      "DELETE_EVENT",
      "UPDATE_EVENT",
      "ADD_AVAILABILITY",
      "DELETE_AVAILABILITY",
      "UPDATE_AVAILABILITY",
    ].includes(actionType);
  }

  private static isAIGeneratedEventId(id: string): boolean {
    // AI-generated IDs start with 'evt_' or 'ai_'
    // Pattern: evt_timestamp or ai_timestamp
    const isAIGenerated = /^(evt_|ai_)/.test(id);
    console.log("[UNDO] AI ID check:", { id, isAIGenerated });
    return isAIGenerated;
  }

  private static async routeCalendarAction(
    action: any,
    dispatch: Dispatch,
  ): Promise<void> {
    console.log("[UNDO] Calendar action routing:", action.type);

    if (!this.calendarRouter) {
      console.log("[UNDO] No calendar router, using direct dispatch");
      dispatch(action);
      return;
    }

    const { isGoogleConnected, executeGoogleAction } = this.calendarRouter;
    const eventId = action.id || action.event?.id;
    const isAIGeneratedId = eventId && this.isAIGeneratedEventId(eventId);

    console.log("[UNDO] Event details:", {
      eventId,
      isAIGeneratedId,
      isGoogleConnected,
      actionType: action.type,
    });

    // Special handling for AI-generated events
    // AI-generated events are only in Redux, not in backend/Google Calendar
    // So we dispatch to Redux but don't call the API
    if (isAIGeneratedId) {
      console.log(
        "[UNDO] AI-generated event - dispatching to Redux only (not calling API)",
      );
      dispatch(action);
      return;
    }

    // Route to Google Calendar if connected, otherwise to backend
    if (
      isGoogleConnected &&
      ["ADD_EVENT", "DELETE_EVENT", "UPDATE_EVENT"].includes(action.type)
    ) {
      console.log("[UNDO] Routing to Google Calendar");

      try {
        const result = await executeGoogleAction(action);
        console.log(
          "[UNDO] Google Calendar result:",
          result ? "SUCCESS" : "FAILED",
        );

        if (!result) {
          console.log("[UNDO] Fallback to backend dispatch");
          dispatch(action);
        }
      } catch (error) {
        console.error("[UNDO] Google Calendar error:", error);
        console.log("[UNDO] Fallback to backend dispatch");
        dispatch(action);
      }
    } else {
      console.log("[UNDO] Routing to backend");
      dispatch(action);
    }
  }

  static setCalendarRouter(router: CalendarRouter): void {
    this.calendarRouter = router;
  }

  static getUndoRedoState(messageId: string): UndoRedoState {
    const snapshot = this.snapshots.get(messageId);
    return {
      canUndo: Boolean(snapshot?.undoActions.length),
      canRedo: Boolean(snapshot?.redoActions.length),
      snapshot,
    };
  }

  static clearSnapshot(messageId: string): void {
    this.snapshots.delete(messageId);
  }

  static clearAllSnapshots(): void {
    this.snapshots.clear();
  }

  // Extension methods
  static registerActionReverser(
    actionType: string,
    reverser: (action: any, context?: any) => unknown,
  ) {
    ActionReverser.registerReverser(actionType, reverser);
  }

  static registerContextExtractor(
    actionType: string,
    extractor: (message: unknown) => unknown,
  ) {
    ContextExtractor.registerExtractor(actionType, extractor);
  }
}

// ===== REACT HOOK =====
export const useUndoRedo = (
  dispatch: Dispatch,
  calendarRouter?: CalendarRouter,
) => {
  // Set up calendar router if provided
  if (calendarRouter) {
    UndoRedoManager.setCalendarRouter(calendarRouter);
  }

  const createSnapshot = (
    messageId: string,
    actionType: string,
    actions: unknown[],
    message: unknown,
  ) => {
    return UndoRedoManager.createSnapshot(
      messageId,
      actionType,
      actions,
      message,
    );
  };

  const undo = async (messageId: string): Promise<boolean> => {
    return UndoRedoManager.executeUndo(messageId, dispatch);
  };

  const redo = async (messageId: string): Promise<boolean> => {
    return UndoRedoManager.executeRedo(messageId, dispatch);
  };

  const getState = (messageId: string): UndoRedoState => {
    return UndoRedoManager.getUndoRedoState(messageId);
  };

  return { createSnapshot, undo, redo, getState };
};

export default UndoRedoManager;
