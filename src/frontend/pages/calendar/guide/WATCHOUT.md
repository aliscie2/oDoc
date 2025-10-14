# Common Mistakes - WATCHOUT!

## 🚨 Critical Issues

### 1. Token Expiration (Most Common!)
**Symptom**: 401 Unauthorized errors
**Fix**: Disconnect → Reconnect Google Calendar

### 2. Not Calling Google API
**Symptom**: Events appear locally but not in Google Calendar
**Fix**: Use `executeGoogleAction` before Redux dispatch

```typescript
// ❌ Bad
dispatch({ type: "ADD_EVENT", event });

// ✅ Good
if (isGoogleConnected) {
  await executeGoogleAction({ type: "ADD_EVENT", event });
}
dispatch({ type: "ADD_EVENT", event });
```

### 3. Missing Data Loading
**Symptom**: Calendar appears empty
**Fix**: Load calendar on mount

```typescript
useEffect(() => {
  const loadCalendar = async () => {
    const res = await backendActor.get_my_calendar();
    dispatch({ type: "SET_CALENDAR", calendar: res });
  };
  loadCalendar();
}, []);
```

### 4. Missing CSS
**Symptom**: No green/red/gray colors
**Fix**: Import `calendar.css`

### 5. Shared Calendar Google Button
**Symptom**: Shows owner's email instead of user's
**Fix**: Detect shared calendar context

```typescript
const isSharedCalendar = calendar?.owner !== profile?.id;
const emails = isSharedCalendar 
  ? JSON.parse(localStorage.getItem(`userGoogleEmails_${profile?.id}`) || '[]')
  : calendar?.google_ids || [];
```

## ✅ Best Practices

**Always Do**:
- Load calendar data on mount
- Check Google connection before API calls
- Dispatch to Redux after API calls
- Test on mobile
- Handle token expiration

**Never Do**:
- Assume tokens last forever
- Skip Redux dispatch
- Create stub implementations
- Ignore mobile users
- Silent failures

## 🐛 Debugging

**Token Expired?** → Disconnect → Connect → Retry
**Events Not Syncing?** → Check `executeGoogleAction` called
**UI Broken?** → Import calendar.css, test responsive
**Can't Debug?** → Check console, network tab
