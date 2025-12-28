# Login Page Specification

## Component Name
Login - Authentication page for user login

## Purpose
Allow users to authenticate with username and password credentials. On successful authentication, store JWT token and navigate to portfolio overview page.

## Layout

### Visual Structure
- Centered card/form on page
- Title: "Login" or "Sign In"
- Username input field with label
- Password input field with label
- Submit button (primary action)
- Error message display area (below form, conditionally visible)

### Component Hierarchy (MUI Components)
```
Login
├── MUI Container (centered, max-width)
│   └── MUI Paper (elevated card)
│       ├── MUI Typography (variant="h4" or "h5", title)
│       ├── MUI Box (form container)
│       │   ├── MUI TextField (username input)
│       │   │   ├── label: "Username"
│       │   │   └── fullWidth prop
│       │   ├── MUI TextField (password input, type="password")
│       │   │   ├── label: "Password"
│       │   │   └── fullWidth prop
│       │   ├── MUI Button (submit, variant="contained", type="submit")
│       │   │   ├── label: "Login" or "Sign In"
│       │   │   └── fullWidth prop
│       │   └── MUI Alert (error, conditionally rendered, severity="error")
│       │       └── Error text
```

## Props
- None (page-level component)

## State

### Internal State
- `username: string` - Username input value
- `password: string` - Password input value
- `error: string | null` - Error message to display
- `loading: boolean` - Loading state during authentication
- `submitted: boolean` - Track if form has been submitted (for validation display)

## Interactions

### User Actions
1. **Username Input**
   - User types in username field
   - Updates `username` state
   - Clears error message if present
   - Logs input change at DEBUG level

2. **Password Input**
   - User types in password field
   - Updates `password` state
   - Clears error message if present
   - Logs input change at DEBUG level

3. **Form Submit** (via button click or Enter key)
   - Validates inputs (see Validations)
   - If invalid, displays validation errors
   - If valid:
     - Sets `loading` to true
     - Disables submit button
     - Logs login attempt at INFO level: `"Login attempt for user: {username}"`
     - Calls `authService.login(username, password)`
     - On success:
       - Logs success at INFO level: `"Login successful for user: {username}"`
       - Stores JWT token via AuthContext
       - Navigates to `/portfolio` route
     - On error:
       - Sets `error` state with error message
       - Logs error at ERROR level: `"Login failed: {error message}"`
       - Sets `loading` to false
       - Enables submit button

4. **Input Blur** (optional validation on blur)
   - Validates individual field on blur
   - Shows field-specific error if invalid

## API Calls

### Endpoint
- **Method**: POST
- **Path**: `/login`
- **Request Body**: `{ username: string, password: string }`
- **Response (200)**: `{ access_token: string, token_type: string }`
- **Response (401)**: Authentication failed
- **Response (422)**: Validation error

### Service Function
- `authService.login(username: string, password: string): Promise<LoginResponse>`

### Error Handling
- **401 Unauthorized**: Display error message "Invalid username or password"
- **422 Validation Error**: Display validation errors from API response
- **Network Error**: Display error message "Network error. Please try again."
- **Other Errors**: Display generic error message "An error occurred. Please try again."

## Validations

### Client-Side Validations
1. **Username**
   - Required: Must not be empty
   - Min length: 1 character
   - Error message: "Username is required"

2. **Password**
   - Required: Must not be empty
   - Min length: 1 character
   - Error message: "Password is required"

### Validation Behavior
- Validate on submit
- Show validation errors below respective input fields or in consolidated error area
- Prevent API call if client-side validation fails
- Clear validation errors when user starts typing

## Error Handling

### Error States
1. **Validation Errors**: Display field-specific or form-level error messages
2. **API Errors**: Display error message from API or generic error message
3. **Network Errors**: Display network-specific error message

### Error Display
- ErrorMessage component displays error text
- Errors are cleared when:
  - User starts typing in any input field
  - New submission is attempted
  - Component unmounts

## Events

### Internal Events
- `onUsernameChange(value: string)`: Updates username state
- `onPasswordChange(value: string)`: Updates password state
- `onSubmit(event: FormEvent)`: Handles form submission

### External Events
- Navigation event: Redirects to `/portfolio` on successful login
- AuthContext update: Stores authentication token and user info

## Accessibility

### ARIA Labels
- Form has `aria-label="Login form"`
- Username input: `aria-label="Username"`, `aria-required="true"`
- Password input: `aria-label="Password"`, `aria-required="true"`
- Submit button: `aria-label="Submit login form"`
- Error message: `role="alert"`, `aria-live="polite"`

### Keyboard Navigation
- Tab order: Username → Password → Submit button
- Enter key submits form when focus is on any input or button
- Escape key clears error message (optional)

### Screen Reader Support
- All inputs have associated labels
- Error messages are announced when they appear
- Loading state is announced: "Logging in..." when loading is true

## Styling Notes (MUI)
- Page uses MUI `Container` with maxWidth="sm" for centered, responsive layout
- Form wrapped in MUI `Paper` component with elevation for card appearance
- MUI `TextField` components with fullWidth prop for consistent input styling
- MUI `Button` with variant="contained" and color="primary" for prominent submit button
- MUI `Alert` component with severity="error" for error messages
- Loading state: Button uses `loading` prop or shows MUI `CircularProgress` during authentication
- Uses MUI spacing system (theme.spacing()) for consistent gaps between form elements
- Typography uses MUI Typography component with appropriate variants

