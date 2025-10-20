# Friend Request Notification System Guide

## Why This Guide Exists

This guide documents the friend request notification system architecture to prevent future confusion and avoid repeated investigation of type mismatches between backend `Friend` and frontend `FEFriend` types.

## Core Problem Identified

### The Issue

When receiving friend requests via websocket notifications, the `FriendshipButton` component was showing "Add Friend" instead of "Accept/Decline" buttons.

### Root Cause

**Type Mismatch**: Backend sends `Friend` objects in notifications, but frontend expects `FEFriend` objects in the friends array.

```typescript
// Backend Friend type (in notifications)
interface Friend {
  id: string;
  sender: User;
  receiver: User;
  confirmed: boolean;
}

// Frontend FEFriend type (expected in friends array)
interface FEFriend {
  id: string;
  is_sender: boolean;
  confirmed: boolean;
  name: string;
  description: string;
  email: string;
  photo: Uint8Array | number[];
}
```

## Architecture Overview

### Backend Structure

1. **Friend Storage**: Uses `Friend` type with `sender` and `receiver` objects
2. **Notifications**: Stores complete `Friend` objects as historical records
3. **Initial Data**: Converts `Friend[]` to `FEFriend[]` using `convert_friends_to_fe_friends()`
4. **Websocket Notifications**: Sends raw `Friend` objects (preserves history)

### Frontend Structure

1. **Friends State**: Stores `FEFriend[]` array for UI compatibility
2. **FriendshipButton**: Relies on `is_sender` boolean to determine button state
3. **Websocket Handler**: Must convert `Friend` to `FEFriend` format

## Why We Keep Backend Unchanged

### Notifications as Historical Records

- Notifications serve as an **audit trail** of all friendship actions
- Changing notification structure would break historical data
- Backend `Friend` objects contain complete user information for historical context

### Existing Conversion Logic

- Backend already has `convert_friends_to_fe_friends()` function
- Initial data load properly converts `Friend[]` to `FEFriend[]`
- Only websocket notifications need frontend conversion

## Solution Implementation

### All Friend-Related Notification Handlers

#### 1. FriendRequest - New friend request received

```typescript
FriendRequest: () => {
  if ('FriendRequest' in notification.content) {
    const friendData = notification.content.FriendRequest.friend;
    // Convert Friend to FEFriend format for frontend compatibility
    const feFriend = {
      id: friendData.receiver.id === profile?.id ? friendData.sender.id : friendData.receiver.id,
      is_sender: friendData.sender.id === profile?.id,
      confirmed: friendData.confirmed,
      name: friendData.receiver.id === profile?.id ? friendData.sender.name : friendData.receiver.name,
      description: friendData.receiver.id === profile?.id ? friendData.sender.description : friendData.receiver.description,
      email: friendData.receiver.id === profile?.id ? friendData.sender.email : friendData.receiver.email,
      photo: friendData.receiver.id === profile?.id ? friendData.sender.photo : friendData.receiver.photo,
    };
    dispatch({ type: "ADD_FRIEND", friend: feFriend });
    dispatch({ type: "NOTIFY", new_notification: notification });
  }
},
```

#### 2. AcceptFriendRequest - Someone accepted our friend request

```typescript
AcceptFriendRequest: () => {
  // When someone accepts our friend request, update the friendship to confirmed
  dispatch({ type: "UPDATE_FRIEND", id: sender.toText(), confirmed: true });
  dispatch({ type: "NOTIFY", new_notification: notification });
},
```

#### 3. CancelFriendRequest - Someone canceled their friend request to us

```typescript
CancelFriendRequest: () => {
  // When someone cancels their friend request to us, remove the friendship
  dispatch({ type: "REMOVE_FRIEND", id: sender.toText() });
  dispatch({ type: "NOTIFY", new_notification: notification });
},
```

#### 4. RejectFriendRequest - Someone rejected our friend request

```typescript
RejectFriendRequest: () => {
  // When someone rejects our friend request, remove the friendship
  dispatch({ type: "REMOVE_FRIEND", id: sender.toText() });
  dispatch({ type: "NOTIFY", new_notification: notification });
},
```

#### 5. Unfriend - Someone unfriended us (handled in special case)

```typescript
if (data.text === "Delete" || key === "Unfriend") {
  dispatch({ type: "DELETE_NOTIFY", id });
  dispatch({
    type: "REMOVE_FRIEND",
    id: sender.toText() === profile?.id ? receiver.toText() : sender.toText(),
  });
  return;
}
```

### Key Conversion Logic

1. **ID Selection**: Use the other user's ID (not current user's)
2. **is_sender**: `true` if current user is the sender
3. **User Data**: Extract from sender or receiver based on current user's role
4. **Preserve**: `confirmed` status and friendship ID

## FriendshipButton State Logic

### Button States

```typescript
const isRequestReceiver =
  friendRelation && !friendRelation.confirmed && !friendRelation.is_sender;
```

- **Add Friend**: No friendship relation exists
- **Cancel Request**: `!confirmed && is_sender` (user sent request)
- **Accept/Decline**: `!confirmed && !is_sender` (user received request)
- **Unfriend**: `confirmed` (friendship established)

## Files Modified

### Primary Changes

- `src/frontend/websocket/use_socket.tsx`: Added Friend→FEFriend conversion
- `src/frontend/components/FriendshipButton.tsx`: Fixed type issues and notification handling

### Type Safety Improvements

- Added proper type guards (`'FriendRequest' in notification.content`)
- Fixed notification content access patterns
- Imported proper `Notification` type

## Future Considerations

### If Backend Changes Are Needed

- Consider creating a separate `NotificationFriend` type that extends `FEFriend`
- Maintain backward compatibility with existing notifications
- Update DID file to reflect new types

## Complete Notification Flow Testing

### Friend Request Lifecycle

1. **Send Request**: User A sends friend request to User B

   - User A sees "Cancel" button in FriendshipButton
   - User B receives `FriendRequest` notification
   - User B sees "Accept/Decline" buttons in FriendshipButton

2. **Accept Request**: User B accepts the request

   - User B's friendship status updates to `confirmed: true`
   - User A receives `AcceptFriendRequest` notification
   - User A's friendship status updates to `confirmed: true`
   - Both users see "Unfriend" button

3. **Cancel Request**: User A cancels their request before acceptance

   - User B receives `CancelFriendRequest` notification
   - User B's friendship is removed from state
   - User A's friendship is removed from state

4. **Reject Request**: User B rejects the request

   - User A receives `RejectFriendRequest` notification
   - User A's friendship is removed from state
   - User B's friendship is removed from state

5. **Unfriend**: Either user unfriends the other
   - Other user receives `Unfriend` notification
   - Both users' friendships are removed from state
   - Both users see "Add Friend" button again

### All Notification Types Handled

- ✅ `FriendRequest` - Adds friend with conversion
- ✅ `AcceptFriendRequest` - Updates friend to confirmed
- ✅ `CancelFriendRequest` - Removes friend
- ✅ `RejectFriendRequest` - Removes friend
- ✅ `Unfriend` - Removes friend (special case)
- ✅ `NewMessage` - Adds message notification
- ✅ `CustomContract` - Updates contract
- ✅ `ContractUpdate` - Adds notification
- ✅ `CPaymentContract` - Adds notification
- ✅ `ApproveShareRequest` - Adds notification
- ✅ `ApplyShareRequest` - Adds notification
- ✅ `ReceivedDeposit` - Adds notification
- ✅ `RemovedFromChat` - Adds notification

## Related Backend Functions

- `convert_friends_to_fe_friends()` in `src/backend/src/queries.rs`
- `notify_friend_request()` in `src/backend/src/websocket/notification.rs`
- `send_friend_request()` in `src/backend/src/friends/updates.rs`
