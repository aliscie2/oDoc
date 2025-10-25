# Application Architecture

Clean, centralized architecture optimized for easy integration and maintenance.

## Design Principles

✅ **Single Source of Truth** - All state in App.tsx  
✅ **Generic Utilities** - Reusable, composable functions  
✅ **Clear Separation** - State, handlers, and UI clearly separated  
✅ **Type Safety** - Full TypeScript coverage  
✅ **Easy Integration** - Simple prop drilling, minimal complexity

## State Management

### App.tsx - Main State Container

All application state centralized in one place:

```typescript
// User Context
const currentUserName = getCurrentUserName();

// Core Data
const [contract, setContract] = useState<Contract>(mockContract);
const [currentBalance, setCurrentBalance] = useState(10000);
const [notifications, setNotifications] = useState<Notification[]>(...);
```

### Handler Functions

Organized by domain for clarity:

**Promise Management:**
- `handleAddPromise()` - Create new promise
- `handleDeletePromise()` - Remove promise
- `handleUpdatePromise()` - Update promise + auto-create notifications

**Contract Management:**
- `handleContractNameChange()` - Update contract name

**Notification Management:**
- `handleMarkNotificationSeen()` - Mark notification as read

## Component Hierarchy

```
App.tsx (State Container)
└── ThemeProvider
    └── AgreementView (Layout & Logic)
        ├── ContractHeader (Title, tabs, actions)
        └── PromiseCard[] (Individual promises)
            ├── UserSelect (Sender/Receiver dropdowns)
            └── ConditionCell[] (Promise conditions)
```

## Data Flow

### Top-Down (Props)
```
App.tsx
  ↓ contract, notifications, handlers
AgreementView
  ↓ promise, notifications, handlers
PromiseCard
  ↓ Display & interactions
```

### Bottom-Up (Events)
```
User clicks card
  → PromiseCard calls onMarkNotificationSeen()
  → AgreementView passes to App.tsx
  → App.tsx updates notification state
  → Re-render with new state
```

## Utility Libraries

### /lib/notifications.ts
Generic notification system:

```typescript
// Main utilities
notificationUtils = {
  findUnseen()      // Find unseen notification
  create()          // Create new notification  
  markSeen()        // Update seen status
  getUnseenCount()  // Count unseen items
}

// Processing cache
notificationCache = {
  isProcessing()    // Check processing state
  markProcessing()  // Mark as processing
  clearProcessing() // Clear processing state
}

// Helpers
getActionFromStatus()         // Map status → action
generateMockNotifications()   // Create demo data
```

### /lib/validation.ts
Promise validation rules:

```typescript
validatePromise()         // Main validation function
getStatusColor()          // Status badge colors
getStatusLabel()          // Status display text
getValidationTooltip()    // Tooltip messages
```

### /lib/theme-colors.ts
Theme color definitions:

```typescript
lightTheme  // Light mode colors
darkTheme   // Dark mode colors
```

### /lib/users-data.ts
Mock user data:

```typescript
users[]  // User list with avatars
```

### /lib/mock-data.ts
Demo contract data:

```typescript
mockContract      // Sample contract with promises
currentUserId     // Current user ID
getCurrentUserName()  // Get current user name
```

## Type System

### /types/contract.ts
Core type definitions:

```typescript
Promise           // Individual promise
Contract          // Contract with promises
PromiseStatus     // Status enum
Condition         // Promise condition
ViewMode          // View mode (promises/payments)
PromiseValidation // Validation result
```

## Integration Points

### Adding New Features

**1. Add State to App.tsx:**
```typescript
const [newFeature, setNewFeature] = useState(initialValue);
```

**2. Create Handler:**
```typescript
const handleNewFeature = (params) => {
  setNewFeature(updated);
};
```

**3. Pass to Components:**
```typescript
<AgreementView
  newFeature={newFeature}
  onNewFeature={handleNewFeature}
/>
```

**4. Use in Component:**
```typescript
function AgreementView({ newFeature, onNewFeature }) {
  // Use the feature
}
```

### Backend Integration

Ready for backend by replacing handlers:

```typescript
// Current (mock)
const handleUpdatePromise = (id, updates) => {
  setContract(prev => ({ ...prev, promises: updated }));
};

// With backend
const handleUpdatePromise = async (id, updates) => {
  await api.updatePromise(id, updates);
  setContract(await api.fetchContract());
};
```

## Best Practices

### State Updates
✅ Use functional updates: `setState(prev => ...)`  
✅ Keep updates immutable  
✅ Batch related state changes

### Component Design
✅ Single responsibility  
✅ Props clearly typed  
✅ Handlers passed from parent

### Performance
✅ Memoize expensive computations  
✅ Use processing cache for operations  
✅ Minimize re-renders with useMemo

### Code Organization
✅ Group related functions  
✅ Clear naming conventions  
✅ Comments for complex logic  
✅ Consistent formatting

## File Structure

```
/components     - React components
/contexts       - React contexts (theme)
/lib            - Utility functions
/types          - TypeScript definitions
/styles         - Global CSS
/guidelines     - Documentation
```

## Key Files

**App.tsx** - Main state container (96 lines)  
**AgreementView.tsx** - Layout and list logic  
**PromiseCard.tsx** - Individual promise display  
**notifications.ts** - Generic notification utilities  
**validation.ts** - Promise validation logic  
**contract.ts** - Core type definitions

## Testing Strategy

### Unit Tests
- Utility functions (notifications, validation)
- Pure functions (status mapping, formatting)

### Integration Tests  
- State updates (handlers)
- Notification flow
- Validation rules

### E2E Tests
- User workflows
- Promise CRUD operations
- Notification interactions
