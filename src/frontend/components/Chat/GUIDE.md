# Chat System Implementation Guide

## 📁 Directory Structure

```
src/frontend/components/Chat/
├── components/
│   ├── ToastContainer.tsx          # Toast notification UI component
│   ├── ChatSettingsDialog.tsx      # Chat settings modal
│   ├── MessagesList.tsx            # Messages display component
│   ├── MessageInput.tsx            # Message input component
│   └── CreateGroupDialog.tsx       # Group creation modal
├── ErrorBoundary/
│   └── ChatErrorBoundary.tsx       # React error boundary for chat
├── hooks/
│   ├── useChatErrorHandler.ts      # Chat-specific error handling
│   ├── useIsMobile.ts              # Mobile viewport detection
│   ├── useToast.ts                 # Toast notification management
│   ├── useChatOperations.ts        # Chat CRUD operations
│   └── useInfiniteScroll.ts        # Infinite scroll for messages
├── utils/
│   └── chatUtils.ts                # Chat utility functions
├── chatFoatingWindowPage.tsx       # Desktop floating chat window
└── index.tsx                       # Main chat component
```

## 🎯 Key Components

### 1. Main Chat Component (`index.tsx`)
- **Purpose**: Dropdown chat list for desktop/mobile navigation
- **Features**: 
  - Device detection (mobile vs desktop)
  - Chat list with unread counts
  - Create group functionality
  - Expand to full page option

### 2. Chat Pages
- **ChatsPage.tsx**: Full-screen chat list page
- **chatMobilePage.tsx**: Individual chat conversation page
- **NotificationsPage.tsx**: Full-screen notifications page

### 3. Settings & Permissions
- **Settings Icon Logic**: Only show for group chats where user is creator
- **Creator Check**: `chat.creator?.toString() === profile?.id`
- **Show Condition**: `!isPrivateChat && isCreator`

## 🔧 Common Patterns

### Mobile Detection
```typescript
import { useIsMobile } from "./hooks/useIsMobile";

const MyComponent = () => {
  const isMobile = useIsMobile(); // Uses 'sm' breakpoint
  
  const handleClick = () => {
    if (isMobile) {
      navigate("/chats"); // Full page on mobile
    } else {
      setAnchorEl(e.currentTarget); // Dropdown on desktop
    }
  };
};
```

### Settings Icon Implementation
```typescript
const isPrivateChat = chat.name === "private_chat";
const isCreator = chat.creator?.toString() === profile?.id;
const showSettings = !isPrivateChat && isCreator;

return (
  <Toolbar>
    {/* Other header content */}
    {showSettings && (
      <IconButton onClick={() => setIsSettingsOpen(true)}>
        <Settings />
      </IconButton>
    )}
  </Toolbar>
);
```

### Expand Icon Usage
```typescript
import OpenInFullIcon from "@mui/icons-material/OpenInFull";

const handleExpandClick = () => {
  setAnchorEl(null);
  navigate("/chats"); // or "/notifications"
};

return (
  <IconButton onClick={handleExpandClick}>
    <OpenInFullIcon />
  </IconButton>
);
```

## 📱 Mobile vs Desktop Behavior

### Navigation Buttons
- **Mobile**: Direct navigation to full pages
- **Desktop**: Show dropdown with expand option

### Bottom Navigation
- **Visible on**: `/`, `/notifications`, `/chats`, `/calendar`, `/contracts`
- **Hidden on**: `/chat/:id` (individual chat pages)
- **Logic**: `location.pathname.startsWith("/chat/") && location.pathname !== "/chats"`

### Page Heights
- **Mobile**: `calc(100vh - 56px)` (account for bottom nav)
- **Desktop**: `100vh` (no bottom nav)

## 🚨 Common Issues & Solutions

### Issue: Settings Icon Missing
**Problem**: Settings gear icon doesn't appear in full-screen chat page
**Solution**: 
1. Add creator check logic
2. Import Settings icon
3. Add conditional rendering
4. Include ChatSettingsDialog

### Issue: Mobile Navigation Overlap
**Problem**: Bottom nav disappears or overlaps content
**Solution**:
1. Update hideBottomNav logic
2. Use proper height calculations
3. Add padding for safety margin

### Issue: TypeScript Errors
**Problem**: `isMobile` prop doesn't exist on components
**Solution**: Remove prop, use internal device detection

### Issue: Wrong Expand Icons
**Problem**: Components use ExpandMoreIcon instead of OpenInFullIcon
**Solution**: Update imports and icon usage

## 🔄 Recurring Problems Prevention

### 1. Settings Icon Consistency
- Always check both mobile and desktop implementations
- Use same creator logic across all chat pages
- Test with different user roles (creator vs member)

### 2. Navigation Logic Stability
- Commit navigation changes immediately
- Test on actual mobile devices
- Document the exact logic used

### 3. Icon Consistency
- Use OpenInFullIcon for expand actions
- Standardize icon imports across components
- Create constants for commonly used icons

### 4. TypeScript Safety
- Remove props that don't exist in component interfaces
- Use internal hooks for device detection
- Fix type errors immediately when they appear

## 📋 Testing Checklist

### Before Deployment:
- [ ] Settings icon appears for group creators
- [ ] Settings icon hidden for private chats
- [ ] Settings icon hidden for non-creators
- [ ] Mobile navigation stays visible on list pages
- [ ] Mobile navigation hides on individual chat pages
- [ ] Expand icons work on desktop dropdowns
- [ ] No TypeScript errors in console
- [ ] All chat operations work (create, send, settings)

### Cross-Platform Testing:
- [ ] Test on actual mobile devices
- [ ] Test on different screen sizes
- [ ] Test desktop dropdown behavior
- [ ] Test navigation between pages
- [ ] Test with different user permissions

## 🛠 Development Workflow

### Making Changes:
1. **Check current state** - Verify what's working
2. **Make atomic changes** - One issue at a time
3. **Test immediately** - Don't accumulate changes
4. **Commit frequently** - Prevent loss of progress
5. **Document changes** - Update this guide if needed

### Debugging Issues:
1. **Check console errors** - TypeScript and runtime errors
2. **Verify component props** - Ensure props exist in interfaces
3. **Test mobile vs desktop** - Different code paths
4. **Check Redux state** - Data availability and structure
5. **Verify permissions** - User roles and chat types

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Look for similar patterns in working components
3. Test on both mobile and desktop
4. Check the comprehensive checklist for known issues
5. Make small, testable changes