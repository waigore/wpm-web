# Session Expired Page Specification

## Component Name
SessionExpired - Auto-redirect page for expired authentication sessions

## Purpose
Display a message to users when their authentication session has expired or become invalid. Automatically redirect users to the login page after a 5-second countdown timer.

## Layout

### Visual Structure
- Centered card/message on page
- Title: "Session Expired" or "Your Session Has Expired"
- Message explaining the session expiration
- Countdown timer showing remaining seconds (5, 4, 3, 2, 1)
- Optional: Manual redirect link/button (not required per spec, but can be added)

### Component Hierarchy (MUI Components)
```
SessionExpired
├── MUI Container (centered, max-width)
│   └── MUI Paper (elevated card)
│       ├── MUI Typography (variant="h4" or "h5", title)
│       ├── MUI Typography (variant="body1", message text)
│       └── MUI Box (countdown container)
│           └── MUI Typography (variant="h6" or "h4", countdown number)
```

## Props
- None (page-level component)

## State

### Internal State
- `countdown: number` - Remaining seconds before redirect (starts at 5, decrements to 0)
- `intervalId: NodeJS.Timeout | null` - Reference to countdown interval for cleanup

## Interactions

### User Actions
1. **Page Load/Mount**
   - Component mounts when user is redirected to `/session-expired` route
   - Logs session expiration at INFO level: `"Session expired, redirecting to login"`
   - Starts countdown timer from 5 seconds
   - Clears `session_expired` flag from localStorage

2. **Countdown Timer**
   - Updates every 1 second
   - Decrements `countdown` state from 5 to 0
   - Displays current countdown value prominently
   - When countdown reaches 0:
     - Clears interval
     - Navigates to `/login` route
     - Logs redirect at INFO level: `"Redirecting to login page"`

3. **Component Unmount**
   - Cleans up countdown interval to prevent memory leaks
   - Ensures no redirect occurs if user navigates away

## API Calls
- None (this page does not make API calls)

## Validations
- None (no user input required)

## Error Handling

### Error States
- If navigation fails, log error at ERROR level
- If interval cleanup fails, log warning at WARN level

### Error Display
- No error states to display (page is informational only)

## Events

### Internal Events
- `onMount()`: Initializes countdown timer
- `onCountdownTick()`: Decrements countdown and checks if redirect is needed
- `onUnmount()`: Cleans up interval

### External Events
- Navigation event: Redirects to `/login` after 5 seconds
- Logging events: Logs session expiration and redirect actions

## Accessibility

### ARIA Labels
- Container has `aria-label="Session expired notification"`
- Countdown timer has `aria-live="polite"` to announce updates
- Countdown number has `aria-label="Redirecting in {countdown} seconds"`

### Keyboard Navigation
- No interactive elements (page is informational only)
- User can navigate away using browser back button or address bar

### Screen Reader Support
- Title and message are announced when page loads
- Countdown updates are announced every second: "Redirecting in {countdown} seconds"
- Final redirect is announced: "Redirecting to login page"

## Styling Notes (MUI)
- Page uses MUI `Container` with maxWidth="sm" for centered, responsive layout
- Content wrapped in MUI `Paper` component with elevation for card appearance
- Title uses MUI `Typography` with variant="h4" or "h5"
- Message uses MUI `Typography` with variant="body1"
- Countdown number uses MUI `Typography` with variant="h6" or "h4" for prominence
- Countdown number can use primary color or accent color for visual emphasis
- Uses MUI spacing system (theme.spacing()) for consistent gaps between elements
- Centered alignment for all text content
- Simple, clean design with minimal styling

## Implementation Notes
- Use `useEffect` hook with cleanup function for countdown timer
- Use `useNavigate` hook from react-router-dom for navigation
- Use `setInterval` for countdown, clear with `clearInterval` in cleanup
- Clear `session_expired` flag from localStorage on mount
- Ensure proper cleanup to prevent memory leaks and unwanted redirects
