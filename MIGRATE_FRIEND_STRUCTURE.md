# Migrate Friend Structure - Backend Optimization

## 🎯 Goal

Reduce Redux state size by storing only user IDs instead of full User objects in Friend notifications.

---

## 📊 Current Problem

**File:** `src/backend/src/friends/types.rs`

```rust
// TODO sender: string, receiver: string instead of full user
#[derive(Eq, PartialOrd, PartialEq, Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Friend {
    pub id: String,
    pub sender: User,      // ← Full User object with 140KB photo!
    pub receiver: User,    // ← Full User object with 140KB photo!
    pub confirmed: bool,
}
```

**Impact:**
- Each Friend object = ~300KB (2 User objects with photos)
- Stored in notifications, friends list, etc.
- Causes massive Redux state bloat
- Slow serialization and network transfer

---

## ✅ Proposed Solution

### New Structure:

```rust
#[derive(Eq, PartialOrd, PartialEq, Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Friend {
    pub id: String,
    pub sender_id: String,      // ← Just the ID!
    pub receiver_id: String,    // ← Just the ID!
    pub confirmed: bool,
}
```

**Benefits:**
- Each Friend object = ~100 bytes (just IDs)
- 99.97% size reduction per Friend
- Faster serialization
- Smaller network payloads
- Frontend fetches User details separately when needed

---

## 🔄 Migration Strategy

### Phase 1: Add Backward Compatibility

Update `src/backend/src/friends/types.rs`:

```rust
use candid::{CandidType, Decode, Deserialize, Serialize};
use std::borrow::Cow;

// New optimized structure
#[derive(Eq, PartialOrd, PartialEq, Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct Friend {
    pub id: String,
    pub sender_id: String,
    pub receiver_id: String,
    pub confirmed: bool,
}

impl Friend {
    /// Decode Friend from bytes with backward compatibility
    /// Handles both old format (with full User objects) and new format (with IDs)
    pub fn from_bytes(bytes: Cow<[u8]>) -> Self {
        // Try to decode with new format first
        if let Ok(friend) = Decode!(bytes.as_ref(), Self) {
            return friend;
        }

        // Fallback: Try to decode with old format (with full User objects)
        #[derive(Clone, Debug, Serialize, CandidType, Deserialize)]
        struct OldFriendStructure {
            pub id: String,
            pub sender: User,
            pub receiver: User,
            pub confirmed: bool,
        }

        if let Ok(old_friend) = Decode!(bytes.as_ref(), OldFriendStructure) {
            // Convert old format to new format
            return Friend {
                id: old_friend.id,
                sender_id: old_friend.sender.id,
                receiver_id: old_friend.receiver.id,
                confirmed: old_friend.confirmed,
            };
        }

        // If both fail, panic (should never happen in production)
        panic!("Failed to decode Friend from bytes");
    }

    /// Create Friend from old format (for migration)
    pub fn from_old_format(id: String, sender: User, receiver: User, confirmed: bool) -> Self {
        Friend {
            id,
            sender_id: sender.id,
            receiver_id: receiver.id,
            confirmed,
        }
    }
}
```

---

### Phase 2: Update Storage Layer

Update all places that store/load Friend objects:

```rust
// When loading from stable storage
let friend = Friend::from_bytes(bytes);

// When creating new Friend
let friend = Friend {
    id: generate_id(),
    sender_id: sender.id.clone(),
    receiver_id: receiver.id.clone(),
    confirmed: false,
};
```

---

### Phase 3: Update API Responses

#### Option A: Keep Frontend Compatible (Recommended)

Create a frontend-compatible response type:

```rust
// For API responses only
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct FEFriend {
    pub id: String,
    pub sender: User,
    pub receiver: User,
    pub confirmed: bool,
}

impl Friend {
    /// Convert to frontend format (fetch full User objects)
    pub fn to_fe_friend(&self, users: &HashMap<String, User>) -> FEFriend {
        FEFriend {
            id: self.id.clone(),
            sender: users.get(&self.sender_id).cloned().unwrap_or_default(),
            receiver: users.get(&self.receiver_id).cloned().unwrap_or_default(),
            confirmed: self.confirmed,
        }
    }
}

// In API endpoint
pub fn get_friends() -> Vec<FEFriend> {
    let friends = load_friends();
    let users = load_users();
    
    friends.iter()
        .map(|f| f.to_fe_friend(&users))
        .collect()
}
```

#### Option B: Update Frontend (Better Long-term)

Return just IDs and let frontend fetch User details:

```rust
// Return new format
pub fn get_friends() -> Vec<Friend> {
    load_friends()
}

// Add endpoint to fetch multiple users
pub fn get_users_by_ids(ids: Vec<String>) -> Vec<User> {
    ids.iter()
        .filter_map(|id| load_user(id))
        .collect()
}
```

Frontend:
```typescript
// Fetch friends
const friends = await backend.get_friends();

// Extract unique user IDs
const userIds = [...new Set([
  ...friends.map(f => f.sender_id),
  ...friends.map(f => f.receiver_id)
])];

// Fetch user details
const users = await backend.get_users_by_ids(userIds);

// Combine in Redux
dispatch({
  type: 'SET_FRIENDS',
  friends,
  users: users.reduce((acc, u) => ({ ...acc, [u.id]: u }), {})
});
```

---

## 📝 Migration Checklist

### Backend Changes:

- [ ] Add `from_bytes()` method with backward compatibility
- [ ] Add `from_old_format()` helper method
- [ ] Update Friend struct to use `sender_id` and `receiver_id`
- [ ] Update all Friend creation code
- [ ] Update all Friend storage/loading code
- [ ] Add migration script to convert existing data
- [ ] Test backward compatibility with old data

### API Changes:

- [ ] Decide: Keep FEFriend or update frontend?
- [ ] If keeping FEFriend: Create `to_fe_friend()` method
- [ ] If updating frontend: Add `get_users_by_ids()` endpoint
- [ ] Update `get_friends()` endpoint
- [ ] Update `get_initial_data()` endpoint
- [ ] Update notification endpoints

### Frontend Changes (if Option B):

- [ ] Update Redux state to store users separately
- [ ] Update Friend type definitions
- [ ] Add user lookup logic
- [ ] Update components to fetch user details
- [ ] Update castingActor.ts (no more photo conversion needed!)

### Testing:

- [ ] Test with old Friend data (backward compatibility)
- [ ] Test with new Friend data
- [ ] Test friend request flow
- [ ] Test notifications
- [ ] Test Redux state size (should be much smaller)
- [ ] Test performance (should be faster)

---

## 🎯 Expected Impact

### Before Migration:
```
Friend object: ~300KB
10 friends: ~3MB
100 friends: ~30MB
```

### After Migration:
```
Friend object: ~100 bytes
10 friends: ~1KB
100 friends: ~10KB
```

**Reduction: 99.97% smaller!**

---

## ⚠️ Important Notes

1. **Backward Compatibility is Critical:**
   - Use `from_bytes()` to handle both old and new formats
   - Don't break existing data
   - Test thoroughly before deploying

2. **Migration Script:**
   - Create a one-time migration to convert all existing Friend objects
   - Run during canister upgrade
   - Keep backup of old data

3. **Frontend Impact:**
   - If using Option A (FEFriend), no frontend changes needed
   - If using Option B, requires frontend refactor
   - Option A is safer for initial deployment

4. **Notification Impact:**
   - Notifications with FriendRequest will be much smaller
   - No more 300KB notifications!
   - Redux state will be dramatically smaller

---

## 🚀 Recommended Approach

**Phase 1 (Immediate):**
1. Implement `from_bytes()` with backward compatibility
2. Keep using `FEFriend` for API responses
3. Deploy and test

**Phase 2 (Future):**
1. Add `get_users_by_ids()` endpoint
2. Update frontend to fetch users separately
3. Remove `FEFriend` and use optimized Friend everywhere
4. Even better performance!

---

## 📚 Related Files

- `src/backend/src/friends/types.rs` - Friend struct definition
- `src/backend/src/friends/mod.rs` - Friend operations
- `src/backend/src/notifications/types.rs` - Notification types
- `src/frontend/utils/castingActor.ts` - Frontend conversion (can be simplified after migration)
- `src/frontend/redux/reducers/filesReducer.ts` - Friends storage in Redux

---

**Priority:** HIGH 🔴  
**Complexity:** MEDIUM  
**Impact:** MASSIVE (99.97% size reduction)  
**Backward Compatible:** YES (with from_bytes method)
