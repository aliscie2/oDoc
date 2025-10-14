# Calendar System Guide

## Architecture

```
calendar/
├── types/          # TypeScript definitions
├── hooks/          # useCalendar, useEventActions, useGoogleCalendar
├── components/     # EventDialog, EventForm, Toolbar, etc.
├── utils/          # Serializers, converters, styles
├── index.tsx       # Main component
└── calendar.css    # Responsive styling
```

## Core Hooks

**useCalendar** - Main logic, event processing, slot status
**useEventActions** - Event CRUD with smart routing
**useGoogleCalendar** - OAuth 2.0, token management, API calls

## Features

**Event Management**: Create/edit/delete, attendees, smart routing
**Google Integration**: OAuth 2.0, multi-account, auto-sync
**Availability**: Weekly schedules, visual indicators
**Responsive**: Mobile/tablet/desktop, dark mode

## Data Flow

```
User Input → Validation → Smart Routing →
├─ Google Calendar API (if connected)
├─ Backend API (always)
└─ Redux State → UI Update
```

## Technical Details

**Time Format**: Nanoseconds (ms × 1,000,000)
**Event IDs**: Google = `email_id`, Backend = `evt_timestamp`
**Days**: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=7

## Common Issues

**Token Expired (401)**: Disconnect → Connect → Retry
**Events Not Syncing**: Check `executeGoogleAction` called
**Availability Not Showing**: Verify CSS loaded, check days/times

## API Reference

```typescript
// useCalendar
const { events, handleSelectSlot, getSlotStatus } = useCalendar();

// useEventActions
const { createEvent, updateEvent, deleteEvent } = useEventActions();

// useGoogleCalendar
const { isConnected, emails, connectGoogleCalendar } = useGoogleCalendar();
```

## Environment

```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```
