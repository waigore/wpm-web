# App Bar Specification

## Component Name
AppBar - Application navigation bar for protected screens

## Purpose
Provide a consistent navigation bar that appears on all protected screens (e.g., Portfolio Overview). The AppBar displays the application name "WPM" on the left, a hamburger menu button (empty for now), and a logout button on the right. It serves as a cross-cutting UI component for authenticated users.

## Layout

### Visual Structure
- Horizontal bar at the top of protected screens
- App name "WPM" displayed on the left side
- Hamburger menu icon button (no menu items for now, but structure in place)
- Logout button on the far right
- Consistent styling using MUI AppBar component

### Component Hierarchy (MUI Components)
```
AppBar
├── MUI AppBar (position="static" or "sticky", color="primary")
│   └── MUI Toolbar (horizontal container)
│       ├── MUI IconButton (hamburger menu, edge="start")
│       │   └── MUI MenuIcon (from @mui/icons-material)
│       ├── MUI Typography (variant="h6", app name "WPM")
│       │   └── sx={{ flexGrow: 1 }} or ml spacing
│       └── MUI Button or IconButton (logout, edge="end")
│           └── "Logout" text or LogoutIcon
```

## Props

### Required Props
- None (component uses hooks for authentication state)

### Optional Props
- None

## State

### Internal State
- `menuAnchorEl: HTMLElement | null` - Anchor element for hamburger menu (for future use, currently not used)

### External State (from hooks)
- `isAuthenticated: boolean` - From `useAuth()` hook, determines if user is authenticated
- `user: string | null` - From `useAuth()` hook, current username (optional, for future display)

## Interactions

### User Actions

1. **Hamburger Menu Click**
   - User clicks hamburger menu icon button
   - Currently no action (menu structure in place but empty)
   - Logs menu click at DEBUG level: `"Hamburger menu clicked"` with context `"AppBar"`
   - Future: Opens menu with navigation items

2. **Logout Button Click**
   - User clicks logout button
   - Calls `logout()` from `useAuth()` hook
   - `logout()` performs the following:
     - Deletes `auth_token` from localStorage
     - Deletes `auth_user` from localStorage
     - Clears OpenAPI token configuration
     - Updates AuthContext to set token and user to `null`
   - After logout, navigates to `/login` route using `useNavigate()` from `react-router-dom`
   - Logs logout event at INFO level: `"User logged out"` with context `"AppBar"`

## API Calls

### Endpoints
- None (AppBar does not make API calls directly)

### Service Functions
- None (uses `useAuth()` hook which internally manages authentication state)

## Validations

### Client-Side Validations
- None required (AppBar is a navigation component, not a form)

## Error Handling

### Error States
- None (AppBar does not handle errors directly)
- If logout fails (unlikely), the navigation will still occur and user will be redirected to login

## Events

### Internal Events
- `onMenuClick(event: React.MouseEvent<HTMLElement>)`: Handles hamburger menu click (currently no-op)
- `onLogoutClick(event: React.MouseEvent<HTMLElement>)`: Handles logout button click

### External Events
- Navigation event: Redirects to `/login` on logout
- AuthContext update: Logout clears authentication state

## Accessibility

### ARIA Labels
- AppBar has `role="banner"` or uses semantic HTML
- Hamburger menu button: `aria-label="Open navigation menu"`, `aria-expanded="false"` (or true when menu is open)
- Logout button: `aria-label="Logout"` or visible text "Logout"
- App name "WPM": Can use `aria-label="WPM application"` or rely on visible text

### Keyboard Navigation
- Tab order: Hamburger menu → Logout button
- Enter or Space key activates buttons
- Escape key closes menu (when menu is implemented)

### Screen Reader Support
- All interactive elements have accessible labels
- App name is announced as "WPM"
- Button actions are clearly labeled

## Styling Notes (MUI)

- Uses MUI `AppBar` component with `position="static"` or `position="sticky"` for top positioning
- Uses MUI `Toolbar` component for horizontal layout and spacing
- AppBar uses `color="primary"` to match theme
- Typography for app name uses `variant="h6"` for appropriate sizing
- IconButton for hamburger menu uses `edge="start"` for left positioning
- Logout button uses `edge="end"` for right positioning
- Uses MUI spacing system (theme.spacing()) for consistent gaps
- AppBar should span full width of viewport
- Toolbar uses `sx` prop for flexbox layout (flexGrow, justifyContent, etc.)

## Integration Notes

- AppBar is wrapped in `ProtectedLayout` component
- `ProtectedLayout` conditionally renders AppBar only when user is authenticated
- AppBar appears on all protected routes (e.g., `/portfolio`)
- AppBar does not appear on public routes (e.g., `/login`)





