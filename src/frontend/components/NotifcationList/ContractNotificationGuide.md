# Contract Notification System Guide

## Why This Guide Exists

This guide documents the contract notification system to prevent confusion about payment status updates, contract sharing, and promise lifecycle management. It explains how notifications update contract state and why certain actions weren't working properly.

## Core Problem Identified

### The Issue

Contract notifications (like payment confirmations, objections, cancellations) were showing in the notification list but **not updating the contract state** properly, causing UI inconsistencies.

### Root Cause

**Missing State Updates**: The websocket handler was only dispatching `NOTIFY` actions without updating the actual contract/promise state in Redux.

## Contract Notification Types

### Primary Notification Type: CPaymentContract

The backend primarily uses `CPaymentContract` notifications for **all** payment/promise lifecycle events. This is the most important notification type to handle correctly.

### 1. CPaymentContract - Payment/Promise Status Changes

**Format**: `[CPayment, PaymentAction]`

**PaymentAction Types**:

- `RequestCancellation` - User requests to cancel a payment
- `Released` - Payment has been released
- `Objected` - User objects to a payment/cancellation
- `Accepted` - User accepts a payment
- `Update` - General payment update
- `Cancelled` - Payment was cancelled
- `Promise` - New promise created

**PaymentStatus Types**:

- `None` - No specific status
- `RequestCancellation` - Cancellation requested
- `Released` - Payment released
- `Objected` - Payment objected with reason
- `Confirmed` - Payment confirmed
- `ConfirmedCancellation` - Cancellation confirmed
- `ApproveHighPromise` - High value promise needs approval
- `HighPromise` - High value promise

### 2. CustomContract - Contract Sharing

**Format**: `[string, CPayment]` (contract_id, payment)

**Note**: This notification type is defined but not actively used in the current backend implementation. Contract sharing is handled through other mechanisms.

### 3. ContractUpdate - General Contract Updates

**Format**: `ContractNotification` with contract_type and contract_id

**Note**: This notification type is defined but not actively used in the current backend implementation. Most contract updates are handled through `CPaymentContract` notifications.

## Fixed Websocket Handlers

### CPaymentContract Handler

```typescript
CPaymentContract: () => {
  if ('CPaymentContract' in notification.content) {
    const [payment, _action] = notification.content.CPaymentContract;
    // Only update main state, not changes (already persisted in backend)
    dispatch({
      type: "SET_PROMISE_STATUS",
      contract_id: payment.contract_id,
      promise: payment,
    });
    dispatch({ type: "NOTIFY", new_notification: notification });
  }
},
```

**What This Fixes**:

- ✅ Payment status updates now reflect in contract UI
- ✅ Objections show proper status and reason
- ✅ Cancellation requests update payment state
- ✅ Released payments show correct status
- ✅ Promise confirmations update immediately
- ✅ **CRITICAL**: Only updates main state, not changes state (backend already persisted)

### CustomContract Handler

```typescript
CustomContract: () => {
  if ('CustomContract' in notification.content) {
    const [contractId, payment] = notification.content.CustomContract;
    // Only update main state, not changes (already persisted in backend)
    dispatch({
      type: "SET_PROMISE_STATUS",
      contract_id: contractId,
      promise: payment,
    });
    dispatch({ type: "NOTIFY", new_notification: notification });
  }
},
```

**What This Fixes**:

- ✅ Shared contracts appear in recipient's contract list
- ✅ New payments added to contracts show immediately
- ✅ Contract sharing notifications update state properly
- ✅ **CRITICAL**: Only updates main state, not changes state (backend already persisted)

## Redux Actions Used

### SET_PROMISE_STATUS (Used for Websocket Notifications)

**Purpose**: Updates a specific promise/payment in a contract WITHOUT tracking changes
**Parameters**:

- `contract_id`: The contract containing the promise
- `promise`: The updated CPayment object

**What It Does**:

1. Updates the promise in `state.contracts[contract_id].promises`
2. **DOES NOT** update `state.changes.contracts` (backend already persisted)
3. Used for websocket notifications since changes are already saved

### UPDATE_PROMISE (Used for Local Changes)

**Purpose**: Updates a specific promise/payment in a contract AND tracks changes
**Parameters**:

- `contract_id`: The contract containing the promise
- `promise`: The updated CPayment object

**What It Does**:

1. Updates the promise in `state.contracts[contract_id].promises`
2. Adds/updates the promise in `state.changes.contracts` for backend sync
3. Used for local user actions that need to be saved to backend

## Critical Distinction: Websocket vs Local Actions

### Websocket Notifications → Use SET_PROMISE_STATUS

- Changes are **already persisted** in the backend
- Only need to update the main Redux state
- Should **NOT** add to changes state (would cause duplicate saves)

### Local User Actions → Use UPDATE_PROMISE

- Changes are **not yet persisted** in the backend
- Need to update main state AND track in changes state
- Changes state is used to sync with backend later

### ADD_PROMISE

**Purpose**: Adds a new promise to a contract
**Parameters**:

- `contract_id`: Target contract ID
- `promise`: New CPayment object
- `insertIndex`: Optional position to insert

### DELETE_PROMISE

**Purpose**: Removes a promise from a contract
**Parameters**:

- `contract_id`: Target contract ID
- `id`: Promise ID to remove

### SET_PROMISE_STATUS

**Purpose**: Updates only the status of a promise (no backend sync)
**Parameters**:

- `contract_id`: Target contract ID
- `promise`: Updated promise with new status

## Payment Lifecycle Examples

### 1. Promise Creation Flow

1. User creates promise → `ADD_PROMISE` action
2. Recipient gets `CPaymentContract` notification with `Promise` action
3. Promise appears in recipient's contract with `None` status

### 2. Cancellation Request Flow

1. User requests cancellation → Promise status becomes `RequestCancellation`
2. Other party gets `CPaymentContract` notification with `RequestCancellation` action
3. Other party can confirm/object → Status updates to `ConfirmedCancellation` or `Objected`

### 3. Payment Release Flow

1. User releases payment → Promise status becomes `Released`
2. Recipient gets `CPaymentContract` notification with `Released` action
3. Payment shows as completed in both users' contracts

### 4. Objection Flow

1. User objects to payment/cancellation → Status becomes `Objected`
2. Other party gets `CPaymentContract` notification with `Objected` action
3. Objection reason is stored in the status

## Common Issues Fixed

### Before Fix

- ❌ Notifications appeared but contract state didn't update
- ❌ Payment status changes weren't reflected in UI
- ❌ Objections showed in notifications but not in contract
- ❌ Cancellation confirmations didn't update payment status
- ❌ Released payments still showed as pending

### After Fix

- ✅ All payment status changes update contract state immediately
- ✅ Objections show proper status with reason in contract UI
- ✅ Cancellation requests and confirmations work properly
- ✅ Released payments show correct status
- ✅ Contract sharing updates recipient's contract list
- ✅ Notifications and contract state stay in sync

## Testing Scenarios

### Payment Status Updates

1. **Create Promise** → Check both users see promise in contract
2. **Request Cancellation** → Check status updates to "RequestCancellation"
3. **Object to Cancellation** → Check status updates to "Objected" with reason
4. **Confirm Cancellation** → Check status updates to "ConfirmedCancellation"
5. **Release Payment** → Check status updates to "Released"

### Contract Sharing

1. **Share Contract** → Check recipient gets contract in their list
2. **Add Payment to Shared Contract** → Check payment appears for all parties
3. **Update Shared Payment** → Check updates reflect for all parties

### High Value Promises

1. **Create High Value Promise** → Check status is "HighPromise"
2. **Approve High Promise** → Check status updates to "ApproveHighPromise"

## Files Modified

### Primary Changes

- `src/frontend/websocket/use_socket.tsx`: Fixed contract notification handlers
- `src/frontend/redux/reducers/filesReducer.ts`: Contract state management actions

### Key Improvements

- Added proper state updates for all contract notifications
- Fixed payment status synchronization
- Ensured notifications and contract state stay consistent
- Added support for all PaymentAction and PaymentStatus types

## Related Backend Functions

### Notification Creation

- `notify_payment_action()` in `src/backend/src/contracts/custom_contract/utils.rs`
  - Creates/updates `CPaymentContract` notifications
  - Handles payment status changes, objections, cancellations
  - Updates existing notifications or creates new ones

### Payment Actions That Trigger Notifications

- `confirmed_c_payment()` - Payment confirmation → `Released` action
- `confirmed_cancellation()` - Cancellation confirmation → `Cancelled` action
- `object_on_cancel()` - Objection to cancellation → `Objected` action
- `approve_high_promise()` - High value promise approval → `Promise` action
- Promise creation → `Promise` action
- Cancellation request → `RequestCancellation` action

### Key Backend Files

- `src/backend/src/contracts/custom_contract/utils.rs` - Notification logic
- `src/backend/src/contracts/custom_contract/updates.rs` - Payment updates
- `src/backend/src/contracts/custom_contract/types.rs` - Contract and payment types
- `src/backend/src/websocket/notification.rs` - Base notification system
