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
    (action: any, context?: any) => any
  > = {
    // Calendar Actions
    ADD_EVENT: (action) => ({ type: "DELETE_EVENT", id: action.event?.id }),
    DELETE_EVENT: (action, context) => ({
      type: "ADD_EVENT",
      event: context?.deletedEvent,
    }),
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
    CALENDAR: (message) => ({
      deletedEvent: message.prev_cal?.events?.find((e: any) =>
        message.actions?.some(
          (a: any) => a.type === "DELETE_EVENT" && a.id === e.id,
        ),
      ),
      originalEvent: message.prev_cal?.events?.find((e: any) =>
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
    }),

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

// ===== MAIN UNDO/REDO MANAGER =====
export class UndoRedoManager {
  private static snapshots = new Map<string, ActionSnapshot>();

  static createSnapshot(
    messageId: string,
    actionType: string,
    originalActions: any[],
    message: any,
  ): ActionSnapshot {
    const context = ContextExtractor.extract(actionType, message);

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
        // For CALENDAR, originalActions are already processed Redux actions
        undoActions = originalActions
          .map((action) => {
            const undoAction = ActionReverser.reverse(action, context);
            return undoAction;
          })
          .filter((action) => action !== null);

        // Redo actions are the original processed Redux actions
        redoActions = [...originalActions];
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

    this.snapshots.set(messageId, snapshot);
    return snapshot;
  }

  static getSnapshot(messageId: string): ActionSnapshot | undefined {
    return this.snapshots.get(messageId);
  }

  static executeUndo(messageId: string, dispatch: Dispatch): boolean {
    const snapshot = this.snapshots.get(messageId);

    if (!snapshot || !snapshot.undoActions.length) {
      return false;
    }

    try {
      snapshot.undoActions.forEach((action) => {
        if (action) {
          console.log("↩️ Undo Dispatching:", action.type, action);
          dispatch(action);
        }
      });
      return true;
    } catch (error) {
      console.error("Undo failed:", error);
      return false;
    }
  }

  static executeRedo(messageId: string, dispatch: Dispatch): boolean {
    const snapshot = this.snapshots.get(messageId);

    if (!snapshot || !snapshot.redoActions.length) {
      return false;
    }

    try {
      snapshot.redoActions.forEach((action) => {
        if (action) {
          console.log("↪️ Redo Dispatching:", action.type, action);
          dispatch(action);
        }
      });
      return true;
    } catch (error) {
      console.error("Redo failed:", error);
      return false;
    }
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
    reverser: (action: any, context?: any) => any,
  ) {
    ActionReverser.registerReverser(actionType, reverser);
  }

  static registerContextExtractor(
    actionType: string,
    extractor: (message: any) => any,
  ) {
    ContextExtractor.registerExtractor(actionType, extractor);
  }
}

// ===== REACT HOOK =====
export const useUndoRedo = (dispatch: Dispatch) => {
  const createSnapshot = (
    messageId: string,
    actionType: string,
    actions: any[],
    message: any,
  ) => {
    return UndoRedoManager.createSnapshot(
      messageId,
      actionType,
      actions,
      message,
    );
  };

  const undo = (messageId: string): boolean => {
    return UndoRedoManager.executeUndo(messageId, dispatch);
  };

  const redo = (messageId: string): boolean => {
    return UndoRedoManager.executeRedo(messageId, dispatch);
  };

  const getState = (messageId: string): UndoRedoState => {
    return UndoRedoManager.getUndoRedoState(messageId);
  };

  return { createSnapshot, undo, redo, getState };
};

export default UndoRedoManager;
