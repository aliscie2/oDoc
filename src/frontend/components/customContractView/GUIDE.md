# Custom Contract View - Complete Guide

## Table of Contents

1. [Overview](#overview)
2. [Status System](#status-system)
3. [Validation Rules](#validation-rules)
4. [Backend Integration](#backend-integration)
5. [Performance](#performance)
6. [Troubleshooting](#troubleshooting)
7. [Testing](#testing)

---

## Overview

The Custom Contract View is a React-based UI for managing promises/payments between users. It supports complex status workflows, role-based permissions, and real-time backend synchronization.

### Key Features
- 8 distinct promise statuses with clear transitions
- Role-based permissions (sender/receiver)
- Real-time backend validation
- Optimized Redux state management
- Loading indicators for async operations
- Comprehensive validation with helpful error messages
- Separate views for active promises and completed payments

### Promise vs Payment Views

The UI provides two distinct views accessible via header buttons:

- **Promises View**: Shows all unreleased promises (status ≠ "Released")
- **Payments View**: Shows only released/completed promises (status = "Released")

**Backend Storage:**
- Backend stores unreleased promises in `contract.promises[]`
- Backend stores released promises in `contract.payments[]`

**Frontend Display:**
- `ContractPage.tsx` merges both arrays into `contract.promises[]` for unified display
- `AgreementView.tsx` filters by status to show correct view
- Deduplication ensures no promise appears twice

---

## Status System

### Status Types

| Backend Status | Frontend Display | Description |
|---|---|---|
| `None` | **Draft** | Initial state when promise is created |
| `HighPromise` | **Escrow Released** | Sender locked funds in escrow |
| `ApproveHighPromise` | **Escrow Approved** | Receiver approved the escrow |
| `Confirmed` | **Confirmed** | Promise confirmed by receiver |
| `Objected(text)` | **Objected** | Receiver objected with reason |
| `Released` | **Released** | Payment released (final) |
| `RequestCancellation` | **Request Cancellation** | Sender requested cancellation |
| `ConfirmedCancellation` | **Cancelled** | Cancellation confirmed (final) |

### Status Flow Diagram

```
Draft (None)
  ├─ Sender → Release Escrow → Escrow Released
  │                              ├─ Receiver → Approve → Escrow Approved
  │                              │                         ├─ Sender → Release → Released ✓
  │                              │                         └─ Sender → Request Cancel → ...
  │                              └─ Receiver → Object → Objected
  ├─ Sender → Release → Released ✓
  └─ Receiver → Confirm → Confirmed
                           ├─ Sender → Release → Released ✓
                           ├─ Sender → Request Cancel → Request Cancellation
                           │                              ├─ Receiver → Confirm → Cancelled ✓
                           │                              ├─ Receiver → Object → Objected
                           │                              └─ Sender → Release → Released ✓
                           └─ Receiver → Object → Objected
```

### Status Mapping Functions

**Location:** `src/frontend/components/customContractView/lib/validation.ts`

```typescript
// Backend → Frontend
export function mapBackendStatusToFrontend(
  backendStatus: PaymentStatus | PromiseStatus | string
): { status: PromiseStatus; objectionText?: string }

// Frontend → Backend
export function mapFrontendStatusToBackend(
  status: PromiseStatus,
  objectionText?: string
): PaymentStatus
```

### Critical Edge Cases

#### 1. Sender Can Release During Cancellation
```
RequestCancellation → Released ✅ ALLOWED
```
Even after requesting cancellation, sender can still fulfill the promise.

#### 2. Confirmed Promises Are Locked
```
Confirmed → RequestCancellation ✅ ALLOWED
Confirmed → Released ✅ ALLOWED
Confirmed → anything else ❌ BLOCKED
```

#### 3. Objected Promises Block Sender
```
Objected → (sender update) ❌ BLOCKED
Objected → (receiver update) ✅ ALLOWED
```

#### 4. Objection Text Required
Backend stores objection text in the status variant:
```typescript
PaymentStatus::Objected(String)
```
Frontend must extract and display this text.

---

## Validation Rules

### Permission Matrix

| Status | Sender Can | Receiver Can |
|---|---|---|
| draft | Edit, Delete, Release Escrow, Release Payment | Confirm, Object |
| escrow_released | - | Approve Escrow, Object |
| escrow_approved | Release Payment, Request Cancellation | Object |
| confirmed | Release Payment, Request Cancellation | Object |
| objected | Release Payment | Edit objection text |
| request_cancel | Release Payment | Confirm Cancellation, Object |
| released | - | - |
| cancelled | - | - |

### 17 Backend Validation Rules

**Source:** `src/backend/src/contracts/custom_contract/validation_promise_rules.rs`

1. **sender_receiver_not_same** - Sender and receiver must be different
2. **sender_can_release** - Only sender can release payment
3. **receiver_can_confirm** - Only receiver can confirm
4. **receiver_can_approve** - Only receiver can approve escrow
5. **receiver_can_object** - Only receiver can object
6. **sender_can_request_cancellation** - Only sender can request cancellation (from Confirmed/ApproveHighPromise)
7. **receiver_can_confirm_cancellation** - Only receiver can confirm cancellation
8. **sender_can_create_high_promise** - Only sender can create high promise
9. **sender_can_delete_own** - Only sender can delete own promises
10. **no_update_objected_promise** - Sender blocked, receiver can update
11. **no_delete_objected** - Cannot delete objected promises
12. **no_update_cancellation_requested** - Sender blocked EXCEPT can release
13. **no_delete_cancellation_requested** - Cannot delete during cancellation
14. **no_update_confirmed_by_sender** - Only RequestCancellation or Released allowed
15. **no_delete_confirmed** - Cannot delete confirmed promises
16. **no_delete_released** - Cannot delete released payments
17. **sufficient_balance** - Amount must not exceed balance

### Validation Functions

**Location:** `src/frontend/components/customContractView/lib/validation.ts`

```typescript
// Get allowed status transitions
export function getAvailableStatusTransitions(
  promise: Promise,
  currentUserName: string
): PromiseStatus[]

// Validate promise with all rules
export function validatePromise(
  context: ValidationContext
): PromiseValidation

// Get tooltip for disabled actions
export function getValidationTooltip(
  action: "edit" | "delete" | "object" | "release" | "cancel",
  promise: Promise,
  validation: PromiseValidation
): string | null
```

---

## Backend Integration

### Receiver Actions Call Backend Directly

**Location:** `src/frontend/components/customContractView/components/PromiseCard.tsx`

Receiver actions trigger immediate backend calls:

```typescript
// Confirm Promise
await backendActor.confirmed_c_payment(cPayment)

// Approve Escrow
await backendActor.approve_high_promise(cPayment)

// Object to Promise
await backendActor.object_on_cancel(cPayment, reason)

// Confirm Cancellation
await backendActor.confirmed_cancellation(cPayment)
```

After backend call:
1. Contract is refetched from backend
2. Redux state updated with fresh data via `SET_CONTRACT`
3. UI reflects new state

### Sender Actions Use Redux

Sender actions update through Redux:
```typescript
dispatch({
  type: "UPDATE_PROMISE", // Singular - only changed promise
  contract_id: contractId,
  promise: updatedPromise,
});
```

These are batched and sent to backend via `multi_updates` endpoint.

### Loading States

All receiver action buttons show loading indicators:

```typescript
<button 
  onClick={handleConfirm} 
  disabled={isUpdating}
  style={{
    ...styles.confirmBtn,
    ...(isUpdating ? styles.buttonLoading : {}),
  }}
>
  {isUpdating ? "⏳ Confirming..." : "Confirm Promise"}
</button>
```

---

## Performance Optimizations

### 1. Fixed Infinite Loop in useContractsNotifications

**Problem:** `loadedContracts` in useEffect dependency array caused infinite loop

**Solution:** Removed from dependencies
```typescript
useEffect(() => {
  // ... loading logic
}, [
  notifications,
  contracts,
  backendActor,
  dispatch,
  profile,
  // loadedContracts, // REMOVED
]);
```

### 2. Removed Excessive Console Logging

**Removed:**
- `console.log({ state })` from App.tsx
- `console.log('🔝 Navbar Debug:', ...)` from topNavBar

**Impact:** Massive performance improvement

### 3. Optimized Promise Updates

**Before:** Dispatched entire promise array
```typescript
dispatch({
  type: "UPDATE_PROMISES", // Plural
  promises: updatedPromises, // All promises
});
```

**After:** Dispatch only changed promise
```typescript
dispatch({
  type: "UPDATE_PROMISE", // Singular
  promise: updatedPromise, // Only changed one
});
```

**Impact:**
- Only changed promise card re-renders
- Backend receives only changed data
- Performance scales with many promises

---

## Component Architecture

### File Structure

```
src/frontend/components/customContractView/
├── components/
│   ├── AgreementView.tsx       # Main container
│   ├── PromiseCard.tsx         # Individual promise card
│   ├── ContractHeader.tsx      # Header with filters
│   ├── ConditionCell.tsx       # Editable condition
│   └── UserSelect.tsx          # User selector dropdown
├── contexts/
│   └── ThemeContext.tsx        # Light/dark theme
├── lib/
│   ├── validation.ts           # All validation logic
│   ├── notifications.ts        # Notification utilities
│   └── theme-colors.ts         # Theme color definitions
├── types/
│   └── contract.ts             # TypeScript types
├── hooks/
│   └── usePromiseActions.ts    # Promise action handlers
└── index.tsx                   # Main export
```

### Key Components

#### ContractPage (Parent Component)
**Location:** `src/frontend/pages/contracts/ContractPage.tsx`

Handles data preparation before passing to CustomContractViewer:

```typescript
const filteredContract = useMemo(() => {
  // Merge backend arrays: promises[] + payments[]
  const allPromises = [
    ...(currentContract.promises || []),
    ...(currentContract.payments || []),
  ];
  
  // Deduplicate by ID
  const seenIds = new Set<string>();
  const mergedPromises = allPromises.filter((p) => {
    if (seenIds.has(p.id)) return false;
    seenIds.add(p.id);
    return true;
  });

  return {
    ...currentContract,
    promises: mergedPromises,  // All promises (released + unreleased)
    payments: [],              // Cleared to avoid confusion
  };
}, [currentContract, profile]);
```

**Why This Matters:**
- Backend stores released promises in separate `payments[]` array
- UI needs all promises in one array to filter by status
- Deduplication prevents showing same promise twice

#### AgreementView
**Location:** `src/frontend/components/customContractView/components/AgreementView.tsx`

Main container that filters promises based on view mode:

```typescript
// Filter by status for current view
const filteredPromises =
  viewMode === "payments"
    ? contract.promises.filter((p) => Object.keys(p.status)[0] === "Released")
    : contract.promises.filter((p) => Object.keys(p.status)[0] !== "Released");

// Calculate counts for header buttons
const paymentsCount = contract.promises.filter(
  (p) => Object.keys(p.status)[0] === "Released",
).length;

const promisesCount = contract.promises.filter(
  (p) => Object.keys(p.status)[0] !== "Released",
).length;
```

**Responsibilities:**
- Container for all promise cards
- Handles filtering (promises vs payments)
- Maps backend CPayment to frontend Promise
- Manages expanded card state
- Passes correct counts to ContractHeader

#### PromiseCard
- Displays individual promise
- Shows status with color coding
- Action buttons based on role and status
- Editable conditions
- Objection text display
- Loading indicators

#### Validation Module
- Status mapping functions
- Permission checks
- Available transitions logic
- Validation tooltips
- Status labels and colors

---

## Testing Guide

### Status Transitions

- [ ] Sender creates draft promise
- [ ] Sender releases escrow (draft → escrow_released)
- [ ] Receiver approves escrow (escrow_released → escrow_approved)
- [ ] Receiver confirms promise (draft → confirmed)
- [ ] Receiver objects with text (any → objected)
- [ ] Sender releases payment (confirmed → released)
- [ ] Sender requests cancellation (confirmed → request_cancel)
- [ ] Sender releases during cancellation (request_cancel → released)
- [ ] Receiver confirms cancellation (request_cancel → cancelled)

### Validation Rules

- [ ] Sender cannot object
- [ ] Receiver cannot release
- [ ] Cannot edit released promises
- [ ] Cannot edit objected promises (sender blocked)
- [ ] Receiver can resolve objections
- [ ] Cannot delete confirmed promises
- [ ] Amount validation against balance
- [ ] Sender/receiver cannot be same person
- [ ] Sender can release during cancellation
- [ ] Sender cannot update confirmed except to release/cancel
- [ ] Cancellation only from confirmed/escrow_approved

### UI Display

- [ ] All status labels display correctly
- [ ] All status colors display correctly (light/dark mode)
- [ ] Objection tooltip shows text
- [ ] Action buttons show/hide correctly
- [ ] Action buttons enable/disable correctly
- [ ] Tooltips show correct validation messages
- [ ] Status dropdown shows only allowed transitions
- [ ] Loading indicators appear during backend calls
- [ ] Confirmation dialogs appear for actions

### Promise/Payment Views

- [ ] "Promises" button shows only unreleased promises
- [ ] "Payments" button shows only released promises
- [ ] Promise count is accurate (excludes released)
- [ ] Payment count is accurate (only released)
- [ ] No duplicates appear in either view
- [ ] After releasing promise, it moves to Payments view
- [ ] After page reload, released promises still in Payments view
- [ ] Non-creator users see filtered promises/payments correctly

### Performance

- [ ] No infinite loops in console
- [ ] Console logs minimal (< 10 per action)
- [ ] Promise updates only re-render affected card
- [ ] Backend calls happen once per action
- [ ] No Redux action spam in DevTools

---

## Quick Reference

### Action Buttons by Role

**Sender Actions:**
1. Release Escrow (draft)
2. Release Payment (confirmed/escrow_approved/objected/request_cancel)
3. Request Cancellation (confirmed/escrow_approved)

**Receiver Actions:**
1. Confirm Promise (draft)
2. Approve Escrow (escrow_released)
3. Confirm Cancellation (request_cancel)
4. Object to Promise (most statuses)

### Common Issues

**Issue:** Status selector shows empty value
**Solution:** Ensure current status is in `selectStatuses` array

**Issue:** Button disabled with no tooltip
**Solution:** Check `validation.canXXX` flags and add tooltip

**Issue:** Objection text not showing
**Solution:** Extract from `backendStatus.Objected` field

**Issue:** Performance slow with many promises
**Solution:** Use `UPDATE_PROMISE` (singular) not `UPDATE_PROMISES`

---

## Troubleshooting

### "Invalid status for new payment creation"

**Cause:** Receiver actions were adding promises to `filesState.changes`, causing conflicts when saving.

**Solution:** Receiver actions must call backend directly and use `SET_CONTRACT` (not `UPDATE_PROMISE`):

```typescript
// ✅ CORRECT: Receiver action
const handleConfirm = async () => {
  await backendActor.confirmed_c_payment(promise);
  const result = await backendActor.get_contract(sender, contractId);
  dispatch({ type: "SET_CONTRACT", contract: result.Ok.CustomContract });
};

// ❌ WRONG: Don't use UPDATE_PROMISE for receiver actions
onUpdate(promise.id, { status: "confirmed" });
```

### Infinite Re-renders

**Cause:** useEffect dependency includes state that the effect updates.

**Solution:**
```typescript
// ❌ BAD: Circular dependency
useEffect(() => {
  setLoadedContracts(prev => new Map(prev).set(id, contract));
}, [loadedContracts]); // Triggers itself!

// ✅ GOOD: Remove from dependencies
useEffect(() => {
  setLoadedContracts(prev => new Map(prev).set(id, contract));
}, [id, contract]);
```

### Status Selector Empty

**Cause:** Current status not in allowed transitions.

**Solution:**
```typescript
const selectStatuses = validation.allowedStatuses.includes(promise.status)
  ? validation.allowedStatuses
  : [promise.status, ...validation.allowedStatuses];
```

### All Cards Re-render on Single Update

**Cause:** Using `UPDATE_PROMISES` (plural) action.

**Solution:**
```typescript
// ❌ BAD: Updates entire array
dispatch({ type: "UPDATE_PROMISES", promises: allPromises });

// ✅ GOOD: Update only changed promise
dispatch({ type: "UPDATE_PROMISE", promise: changedPromise });
```

### Backend Not Called

**Cause:** Using Redux update instead of backend call for receiver actions.

**Solution:** Always call backend directly for receiver actions (confirm, approve, object, cancel).

### Objection Text Not Displaying

**Cause:** Not extracting text from backend status.

**Solution:**
```typescript
const { status, objectionText } = mapBackendStatusToFrontend(payment.status);
<PromiseCard promise={{ ...promise, objectionText }} />
```

---

## Performance Tips

1. **Remove console.logs** - They slow down the app significantly
2. **Use UPDATE_PROMISE (singular)** - Only re-renders affected card
3. **Batch Redux updates** - Use `batch()` for multiple updates
4. **Memoize selectors** - Use `createSelector` from reselect
5. **Check dependencies** - Avoid circular useEffect dependencies

---

## Backend Integration

### Two Types of Updates

**Sender Actions** (Redux → Batch Save)
- Edit amount, receiver, conditions, status dropdown
- Flow: Edit → `UPDATE_PROMISE` → `filesState.changes` → `multi_updates`
- Updates: BOTH `state.contracts` AND `state.changes.contracts`

**Receiver Actions** (Direct Backend Calls)
- Confirm, approve escrow, object, confirm cancellation
- Flow: Click → Backend method → Refetch → `SET_CONTRACT`
- Updates: ONLY `state.contracts`, NOT `state.changes.contracts`
- Backend methods: `confirmed_c_payment`, `approve_high_promise`, `object_on_cancel`, `confirmed_cancellation`

### Why This Matters

Receiver actions call backend immediately and persist changes. If they also updated `filesState.changes`, those changes would be sent again during save, causing "Invalid status" errors because the backend already processed them.

---

## Additional Resources

- Backend validation: `src/backend/src/contracts/custom_contract/validation_promise_rules.rs`
- Backend updates: `src/backend/src/contracts/custom_contract/updates.rs`
- Redux reducer: `src/frontend/redux/reducers/filesReducer.ts`
- Save logic: `src/frontend/components/Actions/useDocsSave.tsx`

---

**Version:** 1.0 | **Status:** ✅ Production Ready | **Updated:** October 2024
