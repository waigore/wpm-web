# Portfolio Overview Page Specification

## Component Name
PortfolioOverview - Main portfolio positions display page

## Purpose
Display user's portfolio positions in a sortable table format. Shows all positions with their details including ticker, asset type, quantities, prices, and gains/losses.

## Layout

### Visual Structure
- Page header with title: "Portfolio Overview" or "My Portfolio"
- Portfolio totals section (required): Single row displaying total market value, total unrealized gain/loss, and total cost basis
- Sortable table displaying positions (server-side sorted)
- Pagination controls (below table): Page navigation, page size selector, page info
- Loading indicator during data fetch
- Error message display area (conditionally visible)
- Optional: Empty state when no positions exist

### Component Hierarchy (MUI Components)
```
PortfolioOverview
├── MUI Container
│   ├── MUI Box (header section)
│   │   └── MUI Typography (variant="h4", title)
│   ├── MUI Box (portfolio totals section, single row)
│   │   ├── MUI Paper or MUI Card (Market Value)
│   │   │   ├── MUI Typography (label: "Market Value")
│   │   │   └── MUI Typography (value: {total_market_value}, formatted currency)
│   │   ├── MUI Paper or MUI Card (Cost Basis)
│   │   │   ├── MUI Typography (label: "Cost Basis")
│   │   │   └── MUI Typography (value: {total_cost_basis}, formatted currency)
│   │   └── MUI Paper or MUI Card (Unrealized Gain/Loss)
│   │       ├── MUI Typography (label: "Unrealized P/L")
│   │       └── MUI Typography (value: {total_unrealized_gain_loss}, formatted currency, colored)
│   ├── MUI CircularProgress (loading, conditionally rendered, centered)
│   ├── MUI Alert (error, conditionally rendered, severity="error")
│   │   ├── Error text
│   │   └── MUI Button (retry action)
│   └── MUI TableContainer
│       └── MUI Paper
│           └── MUI Table
│               ├── MUI TableHead
│               │   └── MUI TableRow
│               │       └── MUI TableCell[] (with MUI TableSortLabel)
│               │           ├── Ticker (sortable)
│               │           ├── Asset Type (sortable)
│               │           ├── Quantity (sortable)
│               │           ├── Average Price (sortable)
│               │           ├── Cost Basis (sortable)
│               │           ├── Current Price (sortable)
│               │           ├── Market Value (sortable)
│               │           ├── Unrealized Gain/Loss (sortable)
│               │           └── Allocation % (sortable)
│               └── MUI TableBody
│                   └── MUI TableRow[] (for each position in current page)
│                       └── MUI TableCell[] (position data)
│   └── MUI Box (pagination controls)
│       ├── MUI Pagination (page navigation)
│       ├── MUI Select (page size selector: 10, 20, 50, 100)
│       └── MUI Typography (page info: "Showing X-Y of Z positions")
```

## Props
- None (page-level component)

## State

### Internal State
- `positions: Position[]` - Array of portfolio positions for current page
- `loading: boolean` - Loading state during data fetch
- `error: string | null` - Error message to display
- `sortBy: string` - Currently sorted column field name (default: "ticker")
- `sortOrder: 'asc' | 'desc'` - Sort direction (default: "asc")
- `currentPage: number` - Current page number (1-indexed, default: 1)
- `pageSize: number` - Number of items per page (default: 50, options: 10, 20, 50, 100)
- `totalItems: number` - Total number of positions across all pages
- `totalPages: number` - Total number of pages
- `totalMarketValue: number | null` - Total market value across all positions (from API)
- `totalUnrealizedGainLoss: number | null` - Total unrealized gain/loss across all positions (from API)
- `totalCostBasis: number` - Total cost basis across all positions (from API)

## Interactions

### User Actions

1. **Page Load/Mount**
   - Checks authentication status via `useAuth()`
   - If not authenticated, redirects to `/login`
   - If authenticated:
     - Logs page load at INFO level: `"Portfolio overview page loaded"`
     - Logs component mount at DEBUG level
     - Calls `portfolioService.getAllPositions()` with default parameters (page=1, size=50, sort_by="ticker", sort_order="asc") via `usePortfolio()` hook
     - Sets loading state to true

2. **Column Header Click** (server-side sorting)
   - User clicks on sortable column header
   - If same column clicked:
     - Toggles sort direction (asc → desc → asc)
   - If different column clicked:
     - Sets new sort column (`sortBy`)
     - Sets sort direction to 'asc' (`sortOrder`)
   - Resets to page 1 (`currentPage = 1`)
   - Triggers API call with new sort parameters
   - Logs sort action at INFO level: `"Sorting by {column} {direction}"`
   - Shows loading state during API call
   - Updates table display with sorted results from server

3. **Page Navigation** (pagination)
   - User clicks on pagination control (next, previous, specific page number)
   - Updates `currentPage` state
   - Triggers API call with new page parameter
   - Logs page change at INFO level: `"Navigated to page {page}"`
   - Shows loading state during API call
   - Updates table display with new page of results

4. **Page Size Change** (pagination)
   - User selects different page size from dropdown (10, 20, 50, 100)
   - Updates `pageSize` state
   - Resets to page 1 (`currentPage = 1`)
   - Triggers API call with new size parameter
   - Logs page size change at INFO level: `"Page size changed to {size}"`
   - Shows loading state during API call
   - Updates table display with new page size results

5. **Retry on Error**
   - User clicks retry button in error message
   - Clears error state
   - Retries `getAllPositions()` API call with current state parameters (page, size, sort_by, sort_order)
   - Logs retry attempt at INFO level: `"Retrying portfolio fetch"`

## API Calls

### Endpoint
- **Method**: GET
- **Path**: `/portfolio/all`
- **Authentication**: Required (JWT token in Authorization header)
- **Query Parameters**:
  - `page` (optional, integer, default: 1, minimum: 1): Page number (1-indexed)
  - `size` (optional, integer, default: 50, minimum: 1, maximum: 100): Number of items per page
  - `sort_by` (optional, string, default: "ticker"): Field to sort by (e.g., "ticker", "asset_type", "quantity", "cost_basis", "market_value", "unrealized_gain_loss", "allocation_percentage")
  - `sort_order` (optional, string, default: "asc", pattern: "^(asc|desc)$"): Sort order
- **Response (200)**: 
  ```typescript
  {
    positions: {
      items: Position[],
      total: number,
      page: number,
      size: number,
      pages: number
    },
    total_market_value: number | null,
    total_unrealized_gain_loss: number | null,
    total_cost_basis: number
  }
  ```
- **Response (400)**: Bad Request (invalid sort_by field)
- **Response (401)**: Unauthorized (token expired/invalid)
- **Response (422)**: Validation Error (invalid query parameters)
- **Response (500)**: Server error

### Service Function
- `portfolioService.getAllPositions(params?: { page?: number, size?: number, sort_by?: string, sort_order?: 'asc' | 'desc' }): Promise<PortfolioAllResponse>`
- Returns `PortfolioAllResponse` containing `positions` (Page_Position_), `total_market_value`, `total_unrealized_gain_loss`, and `total_cost_basis`
- Includes JWT token from AuthContext in Authorization header
- Passes query parameters to API endpoint

### Data Fetching
- Fetches data on component mount with default parameters
- Re-fetches when:
  - Sort parameters change (sort_by, sort_order)
  - Pagination parameters change (page, size)
  - Authentication state changes (if user re-authenticates)
- Uses `usePortfolio()` hook to manage fetching logic with parameters
- Each API call includes current state parameters for sorting and pagination

### Error Handling
- **400 Bad Request**: 
  - Display error message: "Invalid sort field. Please try again."
  - Log error at ERROR level: `"Invalid sort_by parameter: {error}"`
  - Reset to default sort (ticker, asc) and refetch
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
  - Display error message: "Unable to load portfolio data. Please try again."
  - Log error at ERROR level: `"Portfolio fetch failed: {error}"`
  - Show retry button
- **Network Error**: 
  - Display error message: "Network error. Please check your connection."
  - Log error at ERROR level: `"Network error fetching portfolio: {error}"`
  - Show retry button

## Validations

### Data Validations
- Validate API response structure
- Validate each position has required fields
- Handle null/undefined values gracefully (e.g., `current_price`, `market_value`, `unrealized_gain_loss` may be null)

### Display Validations
- Format numeric values appropriately (currency, decimals)
- Handle missing/null data with placeholder text (e.g., "N/A" for null prices)

## Sorting (Server-Side)

### Sortable Columns
1. **Ticker**: Field name "ticker" - Alphabetical sort (A-Z or Z-A)
2. **Asset Type**: Field name "asset_type" - Alphabetical sort
3. **Quantity**: Field name "quantity" - Numerical sort
4. **Average Price**: Field name "average_price" - Numerical sort
5. **Cost Basis**: Field name "cost_basis" - Numerical sort
6. **Current Price**: Field name "current_price" - Numerical sort (null handling handled by server)
7. **Market Value**: Field name "market_value" - Numerical sort (null handling handled by server)
8. **Unrealized Gain/Loss**: Field name "unrealized_gain_loss" - Numerical sort (null handling handled by server)
9. **Allocation %**: Field name "allocation_percentage" - Numerical sort (0.00-100.00, null handling handled by server)

### Sort Behavior
- **Server-side sorting**: All sorting performed by backend API
- Sort indicator visible in header using MUI `TableSortLabel` (↑ for asc, ↓ for desc)
- Default sort: `sort_by="ticker"`, `sort_order="asc"` (API defaults)
- Clicking same column toggles between "asc" and "desc"
- Clicking different column sets sort to that column with "asc" direction
- Sorting triggers API call with `sort_by` and `sort_order` query parameters
- When sort changes, resets to page 1
- Loading state shown during sort operation
- Sort state persists across page navigation within same session

## Error Handling

### Error States
1. **Loading State**: Shows LoadingSpinner component, disables interactions
2. **Error State**: Shows ErrorMessage component with error text and retry button
3. **Empty State** (optional): Shows message when positions array is empty: "No positions found"

### Error Recovery
- Retry button in ErrorMessage component
- Automatic retry on authentication renewal (if token refresh implemented)
- Graceful degradation: Show available data even if some fields are null

## Events

### Internal Events
- `onSort(column: string, direction: 'asc' | 'desc')`: Updates sort state and triggers API call with sort parameters
- `onPageChange(page: number)`: Updates current page and triggers API call with page parameter
- `onPageSizeChange(size: number)`: Updates page size, resets to page 1, and triggers API call
- `onRetry()`: Retries API call with current state parameters (page, size, sort_by, sort_order)

### External Events
- Navigation event: Redirects to `/login` if authentication fails
- AuthContext subscription: Re-fetches data if authentication state changes

## Data Formatting

### Display Format
- **Currency values** (cost_basis, market_value, unrealized_gain_loss, average_price, current_price): Format as USD currency with 2 decimal places (e.g., "$1,234.56")
- **Portfolio totals** (total_market_value, total_unrealized_gain_loss, total_cost_basis): Format as USD currency with 2 decimal places using `formatCurrency()` utility
- **Quantity**: Display in full precision as returned from the API (arbitrary precision). The quantity should display exactly as returned from the API without decimal place constraints (e.g., "100", "0.5", "0.123456789").
- **Allocation Percentage** (allocation_percentage): Format as percentage with 2 decimal places (e.g., "25.50%"). Value range is 0.00-100.00. Null values display as "N/A".
- **Percentages** (if calculated): Format as percentage with 2 decimal places (e.g., "+5.23%")
- **Null values**: Display as "N/A" or "-" (applies to total_market_value, total_unrealized_gain_loss, and allocation_percentage which may be null)

### Gain/Loss Styling
- Positive unrealized gain: Green text/color (MUI success color)
- Negative unrealized gain: Red text/color (MUI error color)
- Zero or null: Default text color
- Portfolio totals row: Unrealized gain/loss card uses color styling based on value (positive/negative/null)

## Accessibility

### ARIA Labels
- Table has `aria-label="Portfolio positions table"`
- Sortable headers: `aria-sort="ascending" | "descending" | "none"`
- Sort button in header: `aria-label="Sort by {column name} {direction}"`
- Loading spinner: `aria-label="Loading portfolio data"`, `aria-live="polite"`
- Error message: `role="alert"`, `aria-live="assertive"`

### Keyboard Navigation
- Tab order: Table headers (sortable) → Table rows → Pagination controls → Page size selector → Retry button (if visible)
- Enter/Space on sortable header toggles sort
- Arrow keys navigate table cells (optional enhancement)
- Pagination controls support keyboard navigation (arrow keys, Enter to select page)

### Screen Reader Support
- Table headers properly associated with data cells
- Sort state announced when changed: "Sorted by {column} {direction}"
- Loading state announced: "Loading portfolio data"
- Error messages announced immediately
- Position data read row by row with column headers
- Pagination state announced: "Page {current} of {total}, showing {start}-{end} of {total_items} positions"
- Page size change announced: "Page size changed to {size} items per page"

## Pagination

### Pagination Controls
- **MUI Pagination Component**: Shows page numbers and navigation (first, previous, next, last)
- **Page Size Selector**: MUI `Select` dropdown with options: 10, 20, 50, 100 items per page
- **Page Info Display**: Shows "Showing X-Y of Z positions" (e.g., "Showing 1-50 of 237 positions")

### Pagination Behavior
- **Server-side pagination**: All pagination handled by backend API
- Default page size: 50 items per page
- Page numbering is 1-indexed (first page is page 1)
- Changing page triggers API call with new `page` parameter
- Changing page size resets to page 1 and triggers API call with new `size` parameter
- Loading state shown during page navigation
- Pagination state persists across sort changes
- Total pages calculated from API response (`pages` field)
- Pagination controls disabled/hidden when loading or on error

### Page Navigation
- User can navigate using:
  - Previous/Next buttons
  - Direct page number clicks
  - First/Last page buttons (if provided by MUI Pagination)
- Page info updates based on API response metadata (`total`, `page`, `size`, `pages`)

## Performance Considerations
- Server-side sorting and pagination reduce client-side processing
- Only current page of data loaded and rendered
- API calls triggered on sort/pagination changes (no debouncing needed for user-initiated actions)
- Loading states prevent multiple simultaneous API calls
- Log component re-renders at DEBUG level to track performance
- Consider caching strategies for recently viewed pages (future enhancement)

## Styling Notes (MUI)
- Page uses MUI `Container` for consistent page width and margins
- Header uses MUI `Typography` with variant="h4" or "h5"
- Portfolio totals section: Single row using MUI `Box` with `display: flex`, `gap: 2`, positioned directly underneath page title
- Portfolio totals cards: Each total displayed in MUI `Paper` or `Card` component with elevation, consistent padding and spacing
- Table uses MUI `TableContainer` with `Paper` and `Table` components
- Sortable headers use MUI `TableSortLabel` component with built-in sort indicators
- Table cells use MUI `TableCell` with proper alignment (numeric right-aligned, text left-aligned)
- Hover states handled by MUI TableRow hover styling
- Alternating row colors via MUI TableRow with sx prop or theme overrides
- Responsive: MUI TableContainer provides horizontal scroll on small screens
- Loading state: MUI `CircularProgress` centered using MUI `Box` with flexbox centering
- Error messages use MUI `Alert` with severity="error" and action prop for retry button
- Gain/loss colors use MUI `Typography` with color prop or sx styling (success/error colors)
- Pagination uses MUI `Pagination` component with proper theming
- Page size selector uses MUI `Select` with `FormControl` and `InputLabel`
- Page info uses MUI `Typography` with variant="body2" or "caption"
- Pagination controls wrapped in MUI `Box` or `Stack` for layout and spacing
- Uses MUI spacing and theme system for consistent styling throughout

