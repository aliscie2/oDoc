// Type definitions for contract management

export type PromiseStatus = 
  | 'draft'              // None - Initial state
  | 'escrow_released'    // HighPromise - High promise (funds in escrow, not released yet)
  | 'escrow_approved'    // ApproveHighPromise - High promise approved by receiver
  | 'confirmed'          // Confirmed - Promise confirmed by receiver
  | 'objected'           // Objected - Promise objected with reason text
  | 'released'           // Released - Payment released (final state)
  | 'request_cancel'     // RequestCancellation - Sender requests cancellation
  | 'cancelled';         // ConfirmedCancellation - Cancellation confirmed (final state)

export interface Condition {
  id: string;
  fieldName: string;
  value: string;
}

export interface Promise {
  id: string;
  contract_id: string;
  title: string;
  status: PromiseStatus;
  sender: string;
  receiver: string;
  amount?: number;
  conditions: Condition[];
  createdAt: Date;
  objectionText?: string;
}

export interface Contract {
  id: string;
  name: string;
  creatorId: string;
  creatorName: string; // For notification logic (contract creator check)
  promises: Promise[];
}

export type ViewMode = 'promises' | 'payments';

export type UserRole = 'creator' | 'participant';

export interface ValidationRules {
  maxAmount?: number;
  allowedStatuses?: PromiseStatus[];
}

export interface PromiseValidation {
  canEdit: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;
  allowedStatuses: PromiseStatus[];
  canObject: boolean;
  canRelease: boolean;
  canRequestCancellation: boolean;
  errors: string[];
}
