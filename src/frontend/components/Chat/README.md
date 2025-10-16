# Chat System Documentation

## 🚨 CRITICAL: Message Ordering System

### ⚠️ READ THIS FIRST

Messages are stored in **REVERSE CHRONOLOGICAL** order (newest first).
**Index 0 = NEWEST message, Index N = OLDEST message**

This is the most important thing to understand when working with the chat system!

---

## Table of Contents

1. [Message Ordering Rules](#message-ordering-rules)
2. [Visual Guide](#visual-guide)
3. [Code Examples](#code-examples)
4. [System Architecture](#system-architecture)
5. [Quick Start](#quick-start)
6. [Common Mistakes](#common-mistakes)
7. [Testing Checklist](#testing-checklist)

---

## Message Ordering Rules

### Storage Format (Redux/Backend)

```javascript
messages: [
  { id: "msg_3", message: "Hi", date: 1000 }, // Index 0 - NEWEST
  { id: "msg_2", message: "Hello", date: 900 }, // Index 1
  { id: "msg_1", message: "Hey", date: 800 }, // Index 2 - OLDEST
];
```

### Display Format (UI)

```
┌─────────────────────────┐
│ Hey      (800)          │ ← Oldest (from index 2)
│ Hello    (900)          │ ← Middle (from index 1)
│ Hi       (1000)         │ ← Newest (from index 0)
└─────────────────────────┘
```

### Key Rules

#### 1. Adding NEW Messages

```typescript
// ✅ CORRECT - Add to BEGINNING
messages: [newMessage, ...existingMessages];

// ❌ WRONG - Don't add to end
messages: [...existingMessages, newMessage];
```

#### 2. Loading OLDER Messages (Infinite Scroll)

```typescript
// ✅ CORRECT - Add to END
messages: [...existingMessages, ...olderMessages];

// ❌ WRONG - Don't add to beginning
messages: [...olderMessages, ...existingMessages];
```

#### 3. Displaying Messages

```typescript
// ✅ CORRECT - Reverse for display
const sortedMessages = [...chat.messages].reverse();

// ❌ WRONG - Don't display as-is
const sortedMessages = chat.messages;
```

#### 4. Getting Last Message (Chat List)

```typescript
// ✅ CORRECT - Use index 0
const lastMessage = chat.messages[0]?.message;

// ❌ WRONG - Don't use last index
const lastMessage = chat.messages[chat.messages.length - 1]?.message;
```

---

## Visual Guide

### Message Flow Diagram

```
USER SENDS "Hi"
      ↓
ChatWindow.handleSendMessage
  Creates: { id: "msg_123", message: "Hi", date: 1000 }
  Dispatches: [newMessage, ...existingMessages]  ← PREPEND
      ↓
Redux Store (chatsReducer)
  BEFORE:  [msg2(900), msg1(800)]
  AFTER:   [msg3(1000), msg2(900), msg1(800)]  ← Hi is at [0]
            ↑ NEWEST              ↑ OLDEST
      ↓
MessagesList Component
  Receives: [msg3(1000), msg2(900), msg1(800)]
  Reverses: [...messages].reverse()
  Result:   [msg1(800), msg2(900), msg3(1000)]
      ↓
User Sees (UI)
  ┌────────────────────────────────┐
  │ Hey      (800)  ← Oldest       │
  │ Hello    (900)                 │
  │ Hi       (1000) ← Newest       │
  └────────────────────────────────┘
```

### Infinite Scroll Flow

```
USER SCROLLS TO TOP
      ↓
useInfiniteScroll.handleScroll
  Detects: scrollTop === 0
  Calls: backendActor.load_more_messages()
      ↓
Backend Returns
  olderMessages: [msg0(700), msg-1(600), msg-2(500)]
      ↓
ChatWindow.onLoadMore
  Current:  [msg3(1000), msg2(900), msg1(800)]
  Loaded:   [msg0(700), msg-1(600), msg-2(500)]
  Combines: [...current, ...loaded]  ← APPEND to END
  Result:   [msg3(1000), msg2(900), msg1(800), msg0(700), msg-1(600), msg-2(500)]
             ↑ NEWEST                                              ↑ OLDEST
```

### Memory Aid - Think of it as a STACK

```
STORAGE (Stack):          DISPLAY (Flipped):
┌─────────────┐          ┌─────────────┐
│ Hi (newest) │ [0]      │ Hey (oldest)│ Top
├─────────────┤          ├─────────────┤
│ Hello       │ [1]      │ Hello       │
├─────────────┤          ├─────────────┤
│ Hey (oldest)│ [2]      │ Hi (newest) │ Bottom
└─────────────┘          └─────────────┘
```

---

## Code Examples

### Example 1: Adding New Message

```typescript
// Current state
messages: [
  { id: "2", message: "Hello", date: 900 },
  { id: "1", message: "Hey", date: 800 }
]

// New message
newMessage: { id: "3", message: "Hi", date: 1000 }

// ✅ CORRECT: Prepend
messages: [newMessage, ...messages]

// Result
messages: [
  { id: "3", message: "Hi", date: 1000 },    ← NEW at [0]
  { id: "2", message: "Hello", date: 900 },
  { id: "1", message: "Hey", date: 800 }
]
```

### Example 2: Loading Older Messages

```typescript
// Current state
messages: [
  { id: "3", message: "Hi", date: 1000 },
  { id: "2", message: "Hello", date: 900 }
]

// Loaded older messages
olderMessages: [
  { id: "1", message: "Hey", date: 800 },
  { id: "0", message: "Yo", date: 700 }
]

// ✅ CORRECT: Append
messages: [...messages, ...olderMessages]

// Result
messages: [
  { id: "3", message: "Hi", date: 1000 },
  { id: "2", message: "Hello", date: 900 },
  { id: "1", message: "Hey", date: 800 },    ← OLDER at end
  { id: "0", message: "Yo", date: 700 }
]
```

---

## System Architecture

### File Structure

```
Chat/
├── README.md                    # This file - Complete documentation
├── index.tsx                   # Main ChatNotifications component
├── ChatWindow.tsx              # Individual chat window dialog
├── MessagesList.tsx            # Messages display with infinite scroll
├── MessageInput.tsx            # Message input field
├── CreateGroupDialog.tsx       # Create group chat dialog
├── ChatSettingsDialog.tsx      # Edit group chat settings
├── types.ts                    # TypeScript interfaces (with ordering docs)
├── utils.ts                    # Helper functions
└── hooks/
    ├── useChatOperations.ts    # CRUD operations
    └── useInfiniteScroll.ts    # Infinite scroll logic
```

### Key Components

#### ChatNotifications (index.tsx)

- Shows chat icon with unread badge
- Displays chat list in dropdown menu
- **Create New Group** button to create group chats
- **Load More Chats** button for pagination
- Manages open chat windows
- Filters chats by workspace

#### ChatWindow (ChatWindow.tsx)

- Individual chat dialog
- Handles message display and input
- **Settings icon** (gear) for group chat creators
- Edit group name, members, admins, and workspaces
- Delete group chat option
- Integrates infinite scroll
- Auto-scrolls to bottom on new messages
- Full screen on mobile

#### MessagesList (MessagesList.tsx)

- Displays messages in chronological order (oldest to newest)
- Shows sender avatars and names
- Infinite scroll support
- Loading indicators
- Styled message bubbles

#### MessageInput (MessageInput.tsx)

- Text input with send button
- Enter to send, Shift+Enter for new line
- Loading state during send
- Auto-clears on successful send

### Code Comments

All critical sections are marked with:

```
⚠️ CRITICAL: MESSAGE ORDERING
```

Search for this marker in:

- `src/frontend/redux/reducers/chatsReducer.ts`
- `src/frontend/components/Chat/ChatWindow.tsx`
- `src/frontend/components/Chat/MessagesList.tsx`
- `src/frontend/components/Chat/index.tsx`
- `src/frontend/components/Chat/hooks/useInfiniteScroll.ts`
- `src/frontend/components/Chat/types.ts`

---

## Quick Start

### Display Chat Icon in Navbar

```tsx
import ChatNotifications from "@/components/Chat";

<ChatNotifications />;
```

### Features Available

#### 1. Create Group Chat

- Click the chat icon in the navbar
- Click "Create New Group" button
- Fill in group name, select members, admins, and workspaces
- Click "Create Group"

#### 2. Load More Chats

- Scroll to the bottom of the chat list
- Click "Load More Chats" button
- Loads additional chats from the backend

#### 3. Edit Group Chat Settings

- Open a group chat (that you created)
- Click the gear icon (⚙️) in the top right
- Edit group name, members, admins, and workspaces
- Click "Save Changes" to update
- Click "Delete Chat" to remove the group (confirmation required)

**Note**: Only the chat creator can access settings. Private chats cannot be edited.

#### 4. Open Multiple Chats

- Click on any chat in the list to open it
- Multiple chat windows can be open simultaneously
- Full screen on mobile devices

### Create a New Chat Programmatically

```tsx
import { useDispatch } from "react-redux";
import { Principal } from "@dfinity/principal";
import { backendActor } from "@/utils/backendUtils";

const dispatch = useDispatch();

const createChat = async (userId: string, currentUserId: string) => {
  const newChat = {
    id: `chat-${Date.now()}`,
    name: "private_chat",
    messages: [],
    members: [Principal.fromText(currentUserId), Principal.fromText(userId)],
    admins: [Principal.fromText(currentUserId), Principal.fromText(userId)],
    creator: Principal.fromText(currentUserId),
    workspaces: [],
  };

  const result = await backendActor.make_new_chat_room(newChat);
  if ("Ok" in result) {
    dispatch({ type: "SET_CHATS", chats: [newChat, ...existingChats] });
  }
};
```

---

## Common Mistakes

### ❌ Mistake 1: Adding new messages to the end

```typescript
// WRONG
messages: [...existingMessages, newMessage];
```

**Result**: New messages appear at the top instead of bottom

### ❌ Mistake 2: Not reversing for display

```typescript
// WRONG
{chat.messages.map(message => ...)}
```

**Result**: Messages display newest at top (backwards)

### ❌ Mistake 3: Using wrong index for last message

```typescript
// WRONG
const lastMessage = chat.messages[chat.messages.length - 1];
```

**Result**: Shows oldest message instead of newest

### ❌ Mistake 4: Prepending older messages

```typescript
// WRONG
messages: [...olderMessages, ...existingMessages];
```

**Result**: Infinite scroll breaks message order

---

## Testing Checklist

When modifying message-related code, verify:

- [ ] New messages appear at the bottom of the chat (most recent)
- [ ] Chat list shows the correct last message
- [ ] Infinite scroll loads older messages at the top
- [ ] Message order is consistent after page refresh
- [ ] Optimistic updates maintain correct order
- [ ] No console errors
- [ ] Mobile full screen works
- [ ] Dark mode has good contrast
- [ ] Light mode has good contrast

---

## Quick Reference

| Operation           | Code Pattern            | Location                      |
| ------------------- | ----------------------- | ----------------------------- |
| Add new message     | `[newMsg, ...msgs]`     | Reducer, ChatWindow           |
| Load older messages | `[...msgs, ...oldMsgs]` | ChatWindow, useInfiniteScroll |
| Display messages    | `[...msgs].reverse()`   | MessagesList                  |
| Get last message    | `msgs[0]`               | Chat index                    |

---

## Quick Decision Tree

```
Are you adding a message?
│
├─ Is it NEW (just sent)?
│  └─ YES → Prepend: [newMsg, ...messages]
│
└─ Is it OLD (from infinite scroll)?
   └─ YES → Append: [...messages, ...oldMsgs]

Are you displaying messages?
└─ YES → Reverse: [...messages].reverse()

Are you showing last message in chat list?
└─ YES → Use index 0: messages[0]
```

---

## Why This Approach?

### Advantages

1. **Backend Consistency**: Backend returns messages newest first
2. **Performance**: Quick access to recent messages (no array traversal)
3. **Chat List Efficiency**: Last message is always at index 0
4. **Infinite Scroll**: Natural append operation for older messages

### Trade-offs

- Requires reversing array for display
- Can be confusing for new developers (hence this documentation!)

---

## Key Features

### Performance

- React.memo on all components
- useMemo for expensive computations
- useCallback for stable function references
- Infinite scroll for large message lists
- Optimistic updates for better UX

### User Experience

- Smooth scrolling to bottom on new messages
- Loading states for async operations
- Unread message badges
- Auto-scroll maintains position when loading more
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Accessible ARIA labels
- Full screen on mobile
- High contrast colors (Neo style)

### Code Quality

- No console.logs in production
- Proper TypeScript typing
- Clear separation of concerns
- Comprehensive documentation
- Inline comments for critical sections

---

## Mobile Support

Chat windows are full screen on mobile devices:

- Height: 100vh on mobile, 70vh on desktop
- Full screen dialog on mobile
- Touch-friendly buttons
- Responsive layouts

---

## Theme & Styling

### Neo Style Features

- High contrast colors for better readability
- Vibrant primary colors (blue/purple)
- Message bubbles with clear distinction:
  - Own messages: Blue with white text and glow effect
  - Other messages: High contrast gray with borders
- Smooth transitions and animations
- Modern border radius
- Subtle shadows and glows

### Color Contrast

- Dark mode: True black background with high contrast text
- Light mode: Pure white background with dark text
- Message bubbles optimized for readability
- Borders visible in both modes

---

## Need Help?

1. **Search for comments**: Look for `⚠️ CRITICAL: MESSAGE ORDERING`
2. **Check this documentation**: All information is in this file
3. **Review examples**: See code examples above
4. **Test your changes**: Use the testing checklist

---

## Related Files

All files with message ordering logic:

- `src/frontend/components/Chat/types.ts` - Type definitions with ordering docs
- `src/frontend/redux/reducers/chatsReducer.ts` - Redux state management
- `src/frontend/components/Chat/ChatWindow.tsx` - Chat window component
- `src/frontend/components/Chat/MessagesList.tsx` - Message display
- `src/frontend/components/Chat/index.tsx` - Chat list
- `src/frontend/components/Chat/hooks/useInfiniteScroll.ts` - Infinite scroll logic

---

## Summary

> **Messages are stored NEWEST FIRST (reverse chronological)**
>
> - Index 0 = Newest message
> - Index N = Oldest message
> - Display requires reversing the array
> - New messages go at the beginning
> - Old messages go at the end

**This is the #1 thing to remember when working with the chat system!**
