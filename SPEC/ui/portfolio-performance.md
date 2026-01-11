# Portfolio Performance Page Specification

## Component Name
PortfolioPerformance - Portfolio performance visualization page

## Purpose
Display portfolio total market value over time as a line graph. Supports different granularities (daily, weekly, monthly) and date ranges (portfolio start, YTD, 52w) with immediate API refresh on toggle changes. This is a detail page navigable from Portfolio Overview.

## Layout

### Visual Structure
- Page header with title: "Portfolio Performance"
- Breadcrumbs navigation: Home > Portfolio > Performance
- Control section with two toggle groups:
  - Granularity toggle: Daily, Weekly, Monthly
  - Date range toggle: Portfolio Start, YTD, 52w
- Line graph displaying portfolio total market value over time
- Loading indicator during data fetch
- Error message display area (conditionally visible)
- Empty state when no data exists

### Component Hierarchy (MUI Components)
```
PortfolioPerformance
├── MUI Container
│   ├── Breadcrumbs component
│   │   └── Items: [{ label: 'Home', path: '/portfolio' }, { label: 'Portfolio', path: '/portfolio' }, { label: 'Performance' }]
│   ├── MUI Box (header section)
│   │   └── MUI Typography (variant="h4", title: "Portfolio Performance")
│   ├── MUI Box (control section)
│   │   ├── MUI ToggleButtonGroup (granularity)
│   │   │   ├── MUI ToggleButton (Daily)
│   │   │   ├── MUI ToggleButton (Weekly)
│   │   │   └── MUI ToggleButton (Monthly)
│   │   └── MUI ToggleButtonGroup (date range)
│   │       ├── MUI ToggleButton (Portfolio Start)
│   │       ├── MUI ToggleButton (YTD)
│   │       └── MUI ToggleButton (52w)
│   ├── MUI CircularProgress (loading, conditionally rendered, centered)
│   ├── MUI Alert (error, conditionally rendered, severity="error")
│   │   ├── Error text
│   │   └── MUI Button (retry action)
│   └── MUI Paper (chart container)
│       └── Recharts ResponsiveContainer
│           └── Recharts LineChart
│               ├── Recharts CartesianGrid
│               ├── Recharts XAxis (date, formatted)
│               ├── Recharts YAxis (total_market_value, formatted as currency)
│               ├── Recharts Tooltip (shows date and formatted currency)
│               ├── Recharts Legend (optional)
│               └── Recharts Line (dataKey: "total_market_value")
```

## Props
- None (page-level component)

## State

### Internal State
- `historyPoints: PortfolioHistoryPoint[]` - Array of portfolio history points from API
- `loading: boolean` - Loading state during data fetch
- `error: string | null` - Error message to display
- `granularity: 'daily' | 'weekly' | 'monthly'` - Selected granularity (default: 'daily')
- `dateRange: 'portfolio_start' | 'ytd' | '52w'` - Selected date range (default: 'ytd')
- `startDate: string | null` - Calculated start date based on dateRange selection
- `endDate: string | null` - End date (defaults to null, API uses today)

## Interactions

### User Actions

1. **Page Load/Mount**
   - Checks authentication status via `useAuth()`
   - If not authenticated, redirects to `/login`
   - If authenticated:
     - Logs page load at INFO level: `"Portfolio performance page loaded"`
     - Logs component mount at DEBUG level
     - Calculates initial `startDate` and `endDate` based on default `dateRange` ('ytd') and `granularity` ('daily')
     - Calls `portfolioService.getPortfolioPerformance()` with default parameters via `usePortfolioPerformance()` hook
     - Sets loading state to true

2. **Granularity Toggle**
   - User clicks on granularity toggle button (Daily, Weekly, Monthly)
   - Updates `granularity` state
   - Immediately triggers API call with new granularity parameter
   - Logs granularity change at INFO level: `"Granularity changed to {granularity}"`
   - Shows loading state during API call
   - Updates graph with new data points

3. **Date Range Toggle**
   - User clicks on date range toggle button (Portfolio Start, YTD, 52w)
   - Updates `dateRange` state
   - Calculates new `startDate` based on selection:
     - Portfolio Start: `startDate = null` (let API default to portfolio start date)
     - YTD: `startDate = new Date(currentYear, 0, 1).toISOString().split('T')[0]`
     - 52w: `startDate = new Date(today - 365 days).toISOString().split('T')[0]`
   - Immediately triggers API call with new date range parameters
   - Logs date range change at INFO level: `"Date range changed to {dateRange}"`
   - Shows loading state during API call
   - Updates graph with new data points

4. **Retry on Error**
   - User clicks retry button in error message
   - Clears error state
   - Retries `getPortfolioPerformance()` API call with current state parameters (startDate, endDate, granularity)
   - Logs retry attempt at INFO level: `"Retrying portfolio performance fetch"`

## API Calls

### Endpoint
- **Method**: GET
- **Path**: `/portfolio/all/performance`
- **Authentication**: Required (JWT token in Authorization header)
- **Query Parameters**:
  - `start_date` (optional, string, ISO format YYYY-MM-DD): Start date for performance tracking (defaults to portfolio start_date if not provided)
  - `end_date` (optional, string, ISO format YYYY-MM-DD): End date for performance tracking (defaults to today if not provided)
  - `granularity` (optional, string, default: "daily", pattern: "^(daily|weekly|monthly)$"): Granularity level - "daily" (default), "weekly" (Monday-based), or "monthly" (start of month)
- **Response (200)**: 
  ```typescript
  {
    history_points: PortfolioHistoryPoint[]
  }
  ```
  Where `PortfolioHistoryPoint` is:
  ```typescript
  {
    date: string; // ISO format YYYY-MM-DD
    total_market_value: number; // >= 0.0
    asset_positions: { [ticker: string]: number };
    prices: { [ticker: string]: number };
  }
  ```
- **Response (400)**: Bad Request (invalid date format, date range is invalid, granularity is invalid, or end_date > cache_end_date)
- **Response (401)**: Unauthorized (token expired/invalid)
- **Response (422)**: Validation Error (invalid query parameters, e.g., invalid granularity value)
- **Response (500)**: Server error (historical portfolio or performance cache is not available)

### Service Function
- `portfolioService.getPortfolioPerformance(params?: { start_date?: string | null, end_date?: string | null, granularity?: 'daily' | 'weekly' | 'monthly' }): Promise<PortfolioPerformanceResponse>`
- Returns `PortfolioPerformanceResponse` containing `history_points` array
- Includes JWT token from AuthContext in Authorization header
- Passes query parameters to API endpoint

### Data Fetching
- Fetches data on component mount with default parameters (granularity='daily', dateRange='ytd')
- Re-fetches when:
  - Granularity changes
  - Date range changes (which updates startDate)
  - Authentication state changes (if user re-authenticates)
- Uses `usePortfolioPerformance()` hook to manage fetching logic with parameters
- Each API call includes current state parameters for start_date, end_date, and granularity

### Error Handling
- **400 Bad Request**: 
  - Display error message: "Invalid request. Please check your date range or granularity settings."
  - Log error at ERROR level: `"Invalid request parameters: {error}"`
  - Show retry button
- **401 Unauthorized**: 
  - Log error at ERROR level: `"Authentication failed: {error}"`
  - Clear auth token
  - Redirect to `/login` page
- **422 Validation Error**: 
  - Display validation errors from API response
  - Log error at ERROR level: `"Validation error: {error}"`
  - Show retry button
- **500 Server Error**: 
  - Display error message: "Unable to load performance data. Please try again."
  - Log error at ERROR level: `"Portfolio performance fetch failed: {error}"`
  - Show retry button
- **Network Error**: 
  - Display error message: "Network error. Please check your connection."
  - Log error at ERROR level: `"Network error fetching portfolio performance: {error}"`
  - Show retry button

## Validations

### Data Validations
- Validate API response structure
- Validate each history point has required fields (date, total_market_value)
- Validate date format (ISO YYYY-MM-DD)
- Validate total_market_value is non-negative number

### Display Validations
- Format numeric values appropriately (currency for Y-axis)
- Format dates appropriately (ISO format to display format for X-axis and tooltip)
- Handle missing/null data with placeholder text or empty state
- Handle empty history_points array with empty state message

## Date Range Calculations

### Portfolio Start
- `start_date = null` (not passed to API)
- API defaults to portfolio start_date
- End date: `end_date = null` (defaults to today)

### YTD (Year to Date)
- `start_date = new Date(currentYear, 0, 1).toISOString().split('T')[0]` (January 1st of current year)
- Example: If today is 2024-03-15, start_date = "2024-01-01"
- End date: `end_date = null` (defaults to today)

### 52w (52 Weeks / 1 Year)
- `start_date = new Date(today - 365 days).toISOString().split('T')[0]`
- Example: If today is 2024-03-15, start_date = "2023-03-15"
- End date: `end_date = null` (defaults to today)

## Graph Configuration

### X-Axis (Date)
- Data key: `date` (from PortfolioHistoryPoint)
- Format: Display formatted date (e.g., "Jan 15, 2024" or "2024-01-15")
- Type: Category or Time (depending on recharts configuration)
- Label: "Date" (optional)

### Y-Axis (Total Market Value)
- Data key: `total_market_value` (from PortfolioHistoryPoint)
- Format: Currency format (e.g., "$1,234.56")
- Type: Number
- Label: "Portfolio Value" or "Market Value (USD)"
- Domain: Auto-scaled based on data range

### Line
- Data key: `total_market_value`
- Color: Use theme primary color or appropriate chart color
- Stroke width: 2-3px
- Dot: Optional (can show dots on data points or hide for cleaner look)

### Tooltip
- Shows on hover
- Displays:
  - Date: Formatted date string
  - Total Market Value: Formatted currency (e.g., "$123,456.78")
- Custom formatting using recharts Tooltip component

### Responsive Container
- Uses recharts `ResponsiveContainer` for responsive sizing
- Height: 400-600px (adjustable)
- Width: 100% of container

## Error Handling

### Error States
1. **Loading State**: Shows LoadingSpinner component, disables interactions
2. **Error State**: Shows ErrorMessage component with error text and retry button
3. **Empty State**: Shows message when history_points array is empty: "No performance data available for the selected date range"

### Error Recovery
- Retry button in ErrorMessage component
- Automatic retry on authentication renewal (if token refresh implemented)
- Graceful degradation: Show available data even if some fields are null

## Events

### Internal Events
- `onGranularityChange(granularity: 'daily' | 'weekly' | 'monthly')`: Updates granularity state and triggers API call
- `onDateRangeChange(dateRange: 'portfolio_start' | 'ytd' | '52w')`: Updates dateRange state, calculates startDate, and triggers API call
- `onRetry()`: Retries API call with current state parameters (startDate, endDate, granularity)

### External Events
- Navigation event: Redirects to `/login` if authentication fails
- Navigation event: Can be navigated to from Portfolio Overview via Performance button
- AuthContext subscription: Re-fetches data if authentication state changes

## Data Formatting

### Display Format
- **Currency values** (total_market_value): Format as USD currency with 2 decimal places (e.g., "$1,234.56")
- **Date**: Format ISO date string (YYYY-MM-DD) to display format (e.g., "Jan 15, 2024")
- **Y-axis labels**: Format as currency (e.g., "$100K", "$200K" for large values)

### Styling
- Graph uses theme colors consistent with application design
- Toggle buttons use MUI ToggleButtonGroup styling
- Chart container uses MUI Paper for elevation and styling

## Accessibility

### ARIA Labels
- Chart container: `aria-label="Portfolio performance chart"`
- Granularity toggle: `aria-label="Select granularity"`
- Date range toggle: `aria-label="Select date range"`
- Loading spinner: `aria-label="Loading performance data"`, `aria-live="polite"`
- Error message: `role="alert"`, `aria-live="assertive"`

### Keyboard Navigation
- Tab order: Granularity toggle → Date range toggle → Chart (if interactive) → Retry button (if visible)
- Toggle buttons support keyboard navigation (Arrow keys, Enter/Space to select)
- Chart tooltip accessible via keyboard (if supported by recharts)

### Screen Reader Support
- Toggle state announced when changed: "Granularity changed to {granularity}", "Date range changed to {dateRange}"
- Loading state announced: "Loading performance data"
- Error messages announced immediately
- Chart data can be described in text format (optional enhancement)

## Performance Considerations
- API calls triggered on toggle changes (no debouncing needed for user-initiated actions)
- Loading states prevent multiple simultaneous API calls
- Graph re-renders only when data changes
- Log component re-renders at DEBUG level to track performance
- Consider caching strategies for recently viewed date ranges (future enhancement)

## Styling Notes (MUI)
- Page uses MUI `Container` for consistent page width and margins
- Header uses MUI `Typography` with variant="h4"
- Toggle groups use MUI `ToggleButtonGroup` and `ToggleButton` components
- Chart container uses MUI `Paper` for elevation and styling
- Loading state: MUI `CircularProgress` centered using MUI `Box` with flexbox centering
- Error messages use MUI `Alert` with severity="error" and action prop for retry button
- Uses MUI spacing and theme system for consistent styling throughout
- Recharts components styled to match MUI theme colors
