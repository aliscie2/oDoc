# Calendar Features Documentation

## Overview

This document outlines all features available in the calendar system, including personal calendar management, shared calendar viewing, Google Calendar integration, and event management capabilities.

---

## 1. Calendar Management

### Personal Calendar

- **Get My Calendar**: Load user's own calendar with all events and settings
- **Calendar Ownership**: Track calendar owner and manage permissions
- **Calendar Sharing**: Generate shareable calendar links for others to view

### Shared Calendar Viewing

- **View Shared Calendars**: Access calendars shared by other users via unique calendar ID
- **Owner Busy Time Display**: View calendar owner's busy/blocked time slots as read-only
- **Separate Context Management**: Maintain separate state for personal vs shared calendar views

---

## 2. Google Calendar Integration

### Connection & Authentication

- **OAuth2 Authentication**: Secure Google account connection using OAuth2 flow
- **Multi-Account Support**: Connect and manage multiple Google accounts simultaneously
- **Token Management**: Automatic token storage and refresh handling
- **Account Switching**: Set default account and switch between connected accounts

### Calendar Synchronization

- **Two-Way Sync**: Events sync between platform and Google Calendar
- **Real-Time Updates**: Automatic refresh of Google Calendar events
- **Event Creation**: Create events directly in Google Calendar
- **Event Updates**: Modify existing Google Calendar events
- **Event Deletion**: Remove events from Google Calendar
- **Batch Operations**: Handle multiple calendar operations efficiently

### Public Calendar Features

- **iCal URL Generation**: Automatically generate public iCal URLs for connected calendars
- **Calendar ACL Management**: Set calendar to public for iCal access
- **iCal URL Storage**: Store public iCal URLs in backend for sharing
- **Cross-Platform Access**: Enable calendar access via standard iCal format

### Shared Calendar Integration

- **Personal Google Connection**: Connect your own Google Calendar while viewing someone else's shared calendar
- **Separate Email Management**: Maintain your Google account separately from calendar owner's accounts
- **User-Specific Tokens**: Store authentication tokens per user for multi-user support

---

## 3. Event Management

### Event CRUD Operations

- **Create Events**: Add new events with title, description, time, and attendees
- **Update Events**: Modify existing event details
- **Delete Events**: Remove events from calendar
- **Event Validation**: Comprehensive validation before creating/updating events

### Event Properties

- **Title & Description**: Basic event information
- **Start & End Time**: Event scheduling with nanosecond precision
- **Attendees**: Add multiple attendees to events
- **Recurrence**: Support for recurring events (planned)
- **Creator Tracking**: Track who created each event
- **Google Event Flag**: Distinguish between backend and Google Calendar events

### Event Permissions

- **Owner Permissions**: Full control over all events in owned calendars
- **Creator Permissions**: Edit/delete own events
- **Google Event Permissions**: Manage events created via connected Google accounts
- **Read-Only Events**: View-only access to owner's busy time slots in shared calendars

---

## 4. Availability Management

### Availability Slots

- **Create Availability**: Define when you're available for meetings
- **Update Availability**: Modify existing availability windows
- **Delete Availability**: Remove availability slots
- **Blocked Time**: Mark time slots as unavailable

### Scheduling Patterns

- **Weekly Recurring**: Set availability that repeats weekly
- **Custom Days**: Select specific days of the week
- **Quick Presets**:
  - Every day (Monday-Sunday)
  - Weekdays (Monday-Friday)
  - Weekends (Saturday-Sunday)
- **Time Slots**: Define specific time ranges for availability
- **Valid Until**: Set expiration dates for availability rules

### Availability Display

- **Visual Indicators**: Show availability status on calendar
- **Blocked Slot Icons**: Display blocked time with visual markers
- **Day Summary**: Quick view of which days are available

---

## 5. Job Integration

### Job-Based Event Creation

- **URL Parameter Support**: Accept jobId from URL query parameters
- **Automatic Job Fetching**: Load job details from backend
- **Auto-Populate Event Form**: Pre-fill event details from job information
- **Interview Scheduling**: Create interview events with job context

### Job Data Integration

- **Job Titles**: Display position information
- **Proficiency Level**: Show required experience level
- **Skills**: List required skills for the position
- **Job Description**: Include full job description in event
- **Contact Information**: Add hiring manager contacts
- **Email Addresses**: Include relevant email addresses

---

## 6. Free/Busy Time Management

### Owner Calendar Busy Times

- **FreeBusy API**: Fetch busy times from owner's Google Calendar
- **iCal Parsing**: Parse iCal data to extract busy time slots
- **Blocked Slot Display**: Show owner's busy times as blocked on shared calendars
- **CORS Proxy**: Handle cross-origin requests for iCal data

### Caching & Performance

- **5-Minute Cache**: Cache busy time data to reduce API calls
- **Rate Limiting**: Prevent excessive API requests (1 second delay between requests)
- **30-Day Lookahead**: Fetch busy times for next 30 days
- **Automatic Refresh**: Update busy times periodically

### Privacy Features

- **Public Calendar Check**: Verify calendar is public before fetching
- **Error Handling**: Graceful handling of private calendars
- **Minimal Data Exposure**: Only show busy/free status, not event details

---

## 7. Validation System

### Validation Scenarios

- **Own Calendar + Google Connected**: Full validation with Google sync
- **Own Calendar + Backend Only**: Validation without Google integration
- **Shared Calendar Basic**: Read-only validation for shared calendars

### Validation Rules

- **Event Data Validation**: Check title, description, and attendee format
- **Time Slot Validation**: Ensure valid start/end times
- **Permission Validation**: Verify user has rights to perform action
- **Conflict Detection**: Check for scheduling conflicts
- **Google Event Validation**: Special rules for Google Calendar events

### Validation Context

- **Calendar Context**: Current calendar being viewed
- **User Profile**: Current user information
- **Google Connection Status**: Whether Google Calendar is connected
- **Event Context**: Existing event data for updates

---

## 8. Redux State Management

### Calendar State Actions

- **SET_CALENDAR**: Load user's personal calendar
- **SET_SHARED_CALENDAR**: Load a shared calendar view
- **CLEAR_SHARED_CALENDAR**: Clean up when leaving shared calendar
- **SET_USER_CALENDAR**: Update user's calendar in shared context

### Event State Actions

- **ADD_EVENT**: Create new event in calendar
- **UPDATE_EVENT**: Modify existing event
- **DELETE_EVENT**: Remove event from calendar
- **SET_GOOGLE_CALENDAR**: Load Google Calendar events
- **CLEAR_GOOGLE_CALENDAR**: Remove all Google events
- **SET_OWNER_GOOGLE_EVENTS**: Load owner's events as blocked slots

### Email Management Actions

- **ADD_CALENDAR_EMAIL**: Add Google account to calendar
- **REMOVE_CALENDAR_EMAIL**: Remove Google account from calendar

### Availability Actions

- **ADD_AVAILABILITY**: Create new availability slot
- **UPDATE_AVAILABILITY**: Modify existing availability
- **DELETE_AVAILABILITY**: Remove availability slot

---

## 9. Backend Integration

### Calendar Operations

- `get_my_calendar()`: Fetch user's personal calendar
- `get_calendar(id)`: Fetch any calendar by ID
- `add_google_calendar_id(calendar_id, emails)`: Link Google accounts to calendar
- `remove_google_calendar_id(calendar_id, email)`: Unlink Google account
- `store_calendar_public_url(calendar_id, url)`: Save iCal public URL

### Job Operations

- `get_job(job_id)`: Fetch job details for interview scheduling

---

## 10. User Interface Components

### Main Components

- **Calendar View**: Primary calendar display with event grid
- **Shared Calendar View**: Specialized view for viewing others' calendars
- **Event Dialog**: Modal for creating/editing events
- **Event Form**: Form fields for event details
- **Event Delete Confirmation**: Confirmation dialog for deletions

### Management Components

- **Google Account Manager**: Manage connected Google accounts
- **Availability Manager**: Configure availability schedules
- **Share Calendar Button**: Generate and copy shareable links
- **Timezone Display**: Show current timezone information
- **Toolbar**: Calendar navigation and view controls

### Integration Components

- **Event Job Integration**: Handle job-based event creation
- **Time Picker**: Custom time selection interface

---

## 11. Utility Features

### Time Management

- **Timezone Support**: Handle multiple timezones
- **Nanosecond Precision**: Store times with nanosecond accuracy
- **Date Conversion**: Convert between various date formats
- **Time Range Calculation**: Calculate event durations

### Data Conversion

- **Google Event Serialization**: Convert platform events to Google Calendar format
- **iCal Parsing**: Parse iCal data into event objects
- **Timestamp Conversion**: Handle various timestamp formats

### Error Handling

- **Validation Errors**: User-friendly validation messages
- **API Error Handling**: Graceful handling of API failures
- **Token Expiration**: Automatic detection and handling of expired tokens
- **Network Errors**: Retry logic and error messages

---

## 12. Security & Privacy

### Authentication

- **OAuth2 Security**: Industry-standard authentication
- **Token Storage**: Secure local storage of access tokens
- **User-Specific Data**: Separate data per user account

### Permissions

- **Owner-Only Actions**: Restrict certain actions to calendar owners
- **Creator Permissions**: Users can only edit their own events
- **Read-Only Shared Access**: Shared calendars are view-only by default

### Data Privacy

- **Minimal Data Exposure**: Only show necessary information
- **Public Calendar Opt-In**: Users must explicitly make calendars public
- **Secure API Calls**: All API calls use authentication tokens

---

## Feature Summary

### Core Capabilities

✅ Personal calendar management
✅ Shared calendar viewing
✅ Google Calendar integration (multi-account)
✅ Event CRUD operations
✅ Availability scheduling
✅ Job-based interview scheduling
✅ Free/busy time display
✅ iCal URL generation and parsing
✅ Comprehensive validation system
✅ Real-time synchronization
✅ Multi-timezone support
✅ Permission-based access control

### Integration Points

- Google Calendar API (OAuth2, Events, FreeBusy)
- Backend API (Calendar, Events, Jobs)
- iCal format support
- CORS proxy for cross-origin requests
- Redux state management
- URL parameter handling

### User Experience

- Intuitive event creation and editing
- Visual busy time indicators
- Quick availability presets
- Multi-account management
- Shareable calendar links
- Auto-populated interview events
- Real-time updates
- Error recovery and validation feedback
