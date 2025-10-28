# Mock Notification System

Production-aligned notification system for contract promises - mirrors real WebSocket/Redux patterns.

## Features (Production-Aligned)

### Visual Indicators

**Unseen Notification Badge:**

- Red "New" badge appears in the top-right corner of promise cards
- Only shown to **receivers**, not senders
- Contract creator doesn't see notifications about their own contract
- Badge automatically positioned above the card border

**Card Interactions:**

- Clicking/expanding a card with an unseen notification marks it as seen
- Badge disappears immediately
- Prevents duplicate API calls with processing cache
- Mimics production's `see_notifications` backend call

### Notification Logic

**Who Gets Notifications:**

- Only the **receiver** of a promise gets notifications
- The sender/creator does not see notifications for promises they send
- Example: If Alice sends a promise to Bob, only Bob sees the notification

**When Notifications Appear:**

- New promise created (status: active)
- Promise status changes (accepted, confirmed, objected, released, cancelled)
- Promise updates

### Mock Data

The system generates mock notifications for demonstration:

**Initial State:**

- Alice Johnson (current user) receives 3 promises
- First 2 are marked as unseen (show red badge/border)
- Third is marked as seen (no visual indicator)

**Dynamic Creation:**

- When you change a promise status where you are NOT the receiver, a notification is created for the receiver
- New notifications are always unseen

## Architecture (Mirrors Production Patterns)

### State Management (App.tsx)

Centralized state mimicking Redux in production:

```typescript
// Core application state (mocks Redux store)
const [contract, setContract] = useState<Contract>(mockContract);
const [currentBalance, setCurrentBalance] = useState(10000);
const [notifications, setNotifications] = useState<Notification[]>(...);

// Handlers (mock Redux actions)
handleAddPromise()           // Add new promise
handleDeletePromise()        // Delete promise
handleUpdatePromise()        // Update + auto-create notifications (like WebSocket)
handleContractNameChange()   // Update contract name
handleMarkNotificationSeen() // Mark as seen (mocks backend API call)
```

### Production Alignment

**What's the same:**

- Notification structure (`id`, `sender`, `receiver`, `time`, `is_seen`)
- Content types (`CPaymentContract`, `CustomContract`, etc.)
- Two-strategy notification matching (direct ID + content-based)
- Contract creator logic (creator doesn't see their own notifications)
- Receiver-only notifications (senders don't get notified)
- Processing state to prevent duplicates

**What's simplified:**

- Uses React state instead of Redux
- Mock data instead of WebSocket real-time updates
- Frontend-only instead of backend API calls
- Single notification type (CPaymentContract) vs. multiple types

### Utilities (lib/notifications.ts)

Production-aligned notification utilities:

```typescript
// Notification interface (matches production backend)
interface Notification {
  id: string;
  promiseId: string;
  sender: string;
  receiver: string;
  time: number;                    // Production uses 'time'
  is_seen: boolean;
  content?: NoteContent;           // Production content wrapper
  action: NotificationAction;      // Denormalized for mock
}

// Main utilities (mirrors production logic)
notificationUtils = {
  findUnseen()   // Two-strategy matching (like production)
                 // Strategy 1: Direct ID match
                 // Strategy 2: Content-based match

  create()       // Creates with CPaymentContract content
  markSeen()     // Updates is_seen (mocks backend API)
  getUnseenCount() // Count unseen
}

// Processing cache (prevents duplicate API calls)
notificationCache = {
  isProcessing()   // Check if already processing
  markProcessing() // Mark as processing
  clearProcessing() // Clear processing flag
}

// Helpers
getActionFromStatus()  // Maps PromiseStatus → NotificationAction
generateMockNotifications() // Filters with contract creator logic
```

### Display (PromiseCard.tsx)

Production-aligned notification display:

**Lookup Logic (mirrors production):**

```typescript
const unseenNotification = useMemo(() => {
  // 1. Only receivers see notifications (not senders)
  if (promise.receiver !== currentUserName) return null;

  // 2. Use two-strategy matching (like production)
  return notificationUtils.findUnseen(promise.id, notifications);
}, [promise.id, promise.receiver, currentUserName, notifications]);
```

**Click Handler (mocks backend API call):**

```typescript
const handleHeaderClick = () => {
  if (unseenNotification && !notificationCache.isProcessing(id)) {
    notificationCache.markProcessing(id); // Prevent duplicates
    onMarkNotificationSeen(id); // Mocks see_notifications API
    setTimeout(() => notificationCache.clearProcessing(id), 100);
  }
  onToggle();
};
```

## Production Integration Path

### Current Mock → Production Migration

**Step 1: Replace State with Redux**

```typescript
// Mock (current)
const [notifications, setNotifications] = useState<Notification[]>([]);

// Production
const notifications = useSelector(selectNotifications);
const dispatch = useDispatch();
```

**Step 2: Add WebSocket Handler**

```typescript
// Production WebSocket receives notification
socket.onmessage = (event) => {
  const notification = parseNotification(event.data);
  dispatch({ type: "NOTIFY", payload: { new_notification: notification } });
};
```

**Step 3: Replace Mock API with Real Backend**

```typescript
// Mock (current)
const handleMarkSeen = (id) => {
  setNotifications((prev) => notificationUtils.markSeen(prev, id));
};

// Production
const handleMarkSeen = async (id) => {
  if (!backendActor) return;
  try {
    await backendActor.see_notifications([id]);
    dispatch({ type: "UPDATE_NOTE", payload: { id } });
  } catch (error) {
    console.error("Failed to mark as seen:", error);
  }
};
```

**Step 4: Keep Everything Else**
All the logic in PromiseCard, notification matching, and UI components work as-is!

## Production Patterns Implemented

✅ **Contract Creator Check** - Creator doesn't see their own notifications  
✅ **Receiver-Only Logic** - Only receivers get notifications, not senders  
✅ **Two-Strategy Matching** - Direct ID + content-based lookups  
✅ **NoteContent Structure** - CPaymentContract wrapper with promise + action  
✅ **Processing State** - Prevents duplicate API calls  
✅ **Memoized Lookups** - Efficient notification finding  
✅ **Production Types** - Same interface as backend (`id`, `sender`, `receiver`, `time`, `is_seen`)

## Production vs Mock

| Feature                | Production                         | Mock                  | Migration Effort               |
| ---------------------- | ---------------------------------- | --------------------- | ------------------------------ |
| **Data Structure**     | ✅ Same                            | ✅ Same               | None - already aligned         |
| **Notification Types** | Multiple (Friends, Messages, etc.) | CPaymentContract only | Add new content types          |
| **State Management**   | Redux                              | React State           | Replace setState with dispatch |
| **Real-time Updates**  | WebSocket                          | Mock data             | Add WebSocket handler          |
| **Backend API**        | see_notifications()                | Mock function         | Replace with actor call        |
| **Matching Logic**     | ✅ Two-strategy                    | ✅ Two-strategy       | None - already aligned         |
| **Creator Check**      | ✅ Implemented                     | ✅ Implemented        | None - already aligned         |
| **Receiver Logic**     | ✅ Implemented                     | ✅ Implemented        | None - already aligned         |
| **UI Components**      | PromiseCard                        | PromiseCard           | None - works as-is             |

## Ready for Production

The mock is designed to minimize migration effort:

- ✅ Data structures match production backend
- ✅ Business logic (creator check, receiver-only) implemented
- ✅ Matching strategies align with production
- ✅ UI components work without changes
- 🔄 Just swap state management (Redux) and add WebSocket
