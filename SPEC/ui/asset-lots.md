# Asset Lots Page Specification

## Component Name
AssetLots - Asset lots detail page

## Purpose
Display all lots for a specific asset (identified by ticker) in a sortable table format. Shows lot history with pagination and sorting support. Each lot may have one or more matched sells displayed as sub-rows. This is a detail page navigable from Portfolio Overview.

## Layout

### Visual Structure
- Page header with title: "<ticker>: Lots" (e.g., "AAPL: Lots")
- Sortable table displaying lots (server-side sorted)
- Matched sells displayed as indented sub-rows under each lot (when present)
- Pagination controls (below table): Page navigation, page size selector, page info
- Loading indicator during data fetch
- Error message display area (conditionally visible)
- Empty state when no lots exist

### Component Hierarchy (MUI Components)
```
AssetLots
├── MUI Container
│   ├── MUI Box (header section)
│   │   └── MUI Typography (variant="h4", title: "{ticker}: Lots")
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
│               │           ├── Date (sortable, default)
│               │           ├── Ticker (sortable)
│               │           ├── Asset Type (sortable)
│               │           ├── Broker (sortable)
│               │           ├── Original Quantity (sortable)
│               │           ├── Remaining Quantity (sortable)
│               │           ├── Cost Basis (sortable)
│               │           ├── Realized P/L (sortable)
│               │           ├── Unrealized P/L (sortable)
│               │           └── Total P/L (sortable)
│               └── MUI TableBody
│                   └── MUI TableRow[] (for each lot in current page)
│                       ├── LotTableRow (lot data)
│                       └── MUI TableRow[] (matched sells as sub-rows, conditionally rendered)
│                           └── MUI TableCell[] (matched sell data with indentation)
│   └── MUI Box (pagination controls)
│       ├── MUI Pagination (page navigation)
│       ├── MUI Select (page size selector: 10, 20, 50, 100)
│       └── MUI Typography (page info: "Showing X-Y of Z lots")
```

## Props
- None (page-level component, ticker extracted from URL params)

## State

### Internal State
- `lots: Lot[]` - Array of lots for current page
- `loading: boolean` - Loading state during data fetch
- `error: string | null` - Error message to display
- `ticker: string` - Asset ticker extracted from URL params
- `sortBy: string` - Currently sorted column field name (default: "date")
- `sortOrder: 'asc' | 'desc'` - Sort direction (default: "asc")
- `currentPage: number` - Current page number (1-indexed, default: 1)
- `pageSize: number` - Number of items per page (default: 20, options: 10, 20, 50, 100)
- `totalItems: number` - Total number of lots across all pages
- `totalPages: number` - Total number of pages

## Interactions

### User Actions

1. **Page Load/Mount**
   - Extracts `ticker` from URL params using `useParams()`
   - Checks authentication status via `useAuth()`
   - If not authenticated, redirects to `/login`
   - If authenticated:
     - Logs page load at INFO level: `"Asset lots page loaded for ticker: {ticker}"`
     - Logs component mount at DEBUG level
     - Calls `portfolioService.getAssetLots(ticker)` with default parameters (page=1, size=20, sort_by="date", sort_order="asc") via `useAssetLots()` hook
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
   - Logs sort action at INFO level: `"Sorting lots by {column} {direction}"`
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
   - Retries `getAssetLots()` API call with current state parameters (ticker, page, size, sort_by, sort_order)
   - Logs retry attempt at INFO level: `"Retrying asset lots fetch"`

## API Calls

### Endpoint
- **Method**: GET
- **Path**: `/portfolio/lots/{ticker}`
- **Authentication**: Required (JWT token in Authorization header)
- **Path Parameters**:
  - `ticker` (required, string): Asset ticker symbol
- **Query Parameters**:
  - `page` (optional, integer, default: 1, minimum: 1): Page number (1-indexed)
  - `size` (optional, integer, default: 20, minimum: 1, maximum: 100): Number of items per page
  - `sort_by` (optional, string, default: "date"): Field to sort by (e.g., "date", "ticker", "asset_type", "broker", "original_quantity", "remaining_quantity", "cost_basis", "realized_pnl", "unrealized_pnl", "total_pnl")
  - `sort_order` (optional, string, default: "asc", pattern: "^(asc|desc)$"): Sort order
  - `start_date` (optional, string, ISO format YYYY-MM-DD): Start date for filtering lots (inclusive)
  - `end_date` (optional, string, ISO format YYYY-MM-DD): End date for filtering lots (inclusive)
- **Response (200)**: 
  ```typescript
  {
    lots: {
      items: Lot[],
      total: number,
      page: number,
      size: number,
      pages: number
    }
  }
  ```
  Where `Lot` contains:
  ```typescript
  {
    date: string,
    ticker: string,
    asset_type: string,
    broker: string,
    original_quantity: number,
    remaining_quantity: number,
    cost_basis: number,
    realized_pnl: number | null,
    unrealized_pnl: number | null,
    total_pnl: number | null,
    matched_sells: MatchedSell[]  // Array of matched sells (may be empty)
  }
  ```
  Where `MatchedSell` contains:
  ```typescript
  {
    trade: Trade,  // The sell trade
    consumed_quantity: number  // Quantity consumed from the lot
  }
  ```
- **Response (400)**: Bad Request (invalid date format, start_date > end_date, or invalid sort_by field)
- **Response (401)**: Unauthorized (token expired/invalid)
- **Response (404)**: Not Found (ticker not found)
- **Response (422)**: Validation Error (invalid query parameters)
- **Response (500)**: Server error

### Service Function
- `portfolioService.getAssetLots(ticker: string, params?: { page?: number, size?: number, sort_by?: string, sort_order?: 'asc' | 'desc', start_date?: string, end_date?: string }): Promise<PortfolioAssetLotsResponse>`
- Returns `PortfolioAssetLotsResponse` containing `lots` (Page_Lot_)
- Includes JWT token from AuthContext in Authorization header
- Passes ticker as path parameter and query parameters to API endpoint

### Data Fetching
- Fetches data on component mount with default parameters
- Re-fetches when:
  - Sort parameters change (sort_by, sort_order)
  - Pagination parameters change (page, size)
  - Ticker changes (if navigating to different asset)
  - Authentication state changes (if user re-authenticates)
- Uses `useAssetLots()` hook to manage fetching logic with parameters
- Each API call includes current state parameters for sorting and pagination

### Error Handling
- **400 Bad Request**: 
  - Display error message: "Invalid request. Please check your parameters."
  - Log error at ERROR level: `"Invalid request parameters: {error}"`
  - Show retry button
- **401 Unauthorized**: 
  - Log error at ERROR level: `"Authentication failed: {error}"`
  - Clear auth token
  - Redirect to `/login` page
- **404 Not Found**: 
  - Display error message: "Asset not found. The ticker may be invalid or you may not have access to this asset."
  - Log error at ERROR level: `"Asset not found: {ticker}"`
  - Show retry button
- **422 Validation Error**: 
  - Display validation errors from API response
  - Log error at ERROR level: `"Validation error: {error}"`
  - Show retry button
- **500 Server Error**: 
  - Display error message: "Unable to load lot data. Please try again."
  - Log error at ERROR level: `"Asset lots fetch failed: {error}"`
  - Show retry button
- **Network Error**: 
  - Display error message: "Network error. Please check your connection."
  - Log error at ERROR level: `"Network error fetching asset lots: {error}"`
  - Show retry button

## Validations

### Data Validations
- Validate API response structure
- Validate each lot has required fields
- Validate ticker from URL params is not empty
- Validate matched_sells array structure when present

### Display Validations
- Format numeric values appropriately (currency, decimals)
- Format dates appropriately (ISO format to display format)
- Handle missing/null data with placeholder text (e.g., "N/A" for null values)
- Handle empty matched_sells array (no sub-rows displayed)

## Sorting (Server-Side)

### Sortable Columns
1. **Date**: Field name "date" - Date sort (chronological order, default: ascending)
2. **Ticker**: Field name "ticker" - Alphabetical sort (A-Z or Z-A)
3. **Asset Type**: Field name "asset_type" - Alphabetical sort
4. **Broker**: Field name "broker" - Alphabetical sort
5. **Original Quantity**: Field name "original_quantity" - Numerical sort
6. **Remaining Quantity**: Field name "remaining_quantity" - Numerical sort
7. **Cost Basis**: Field name "cost_basis" - Numerical sort
8. **Realized P/L**: Field name "realized_pnl" - Numerical sort
9. **Unrealized P/L**: Field name "unrealized_pnl" - Numerical sort
10. **Total P/L**: Field name "total_pnl" - Numerical sort

### Sort Behavior
- **Server-side sorting**: All sorting performed by backend API
- Sort indicator visible in header using MUI `TableSortLabel` (↑ for asc, ↓ for desc)
- Default sort: `sort_by="date"`, `sort_order="asc"` (chronological order from beginning to present)
- Clicking same column toggles between "asc" and "desc"
- Clicking different column sets sort to that column with "asc" direction
- Sorting triggers API call with `sort_by` and `sort_order` query parameters
- When sort changes, resets to page 1
- Loading state shown during sort operation
- Sort state persists across page navigation within same session

## Matched Sells Display

### Sub-Row Structure
- Matched sells are displayed as sub-rows directly under their parent lot row
- Each matched sell is rendered as a separate `TableRow` component
- Sub-rows are visually indented to show hierarchy (e.g., `paddingLeft: 4` or similar)
- Sub-rows use a different background color or border styling to distinguish from lot rows
- Sub-rows span all table columns but display matched sell information

### Matched Sell Data Display
Each matched sell sub-row displays data aligned with the table columns:
- **Date** (column 1): From `matched_sell.trade.date` (formatted using `formatDate`)
- **Action** (column 2, in "Ticker" position): Always "Sell" (from `matched_sell.trade.action`, styled with action color)
- **Asset Type** (column 3): Empty, displays "—"
- **Broker** (column 4): From `matched_sell.trade.broker`
- **Original Quantity** (column 5): Consumed quantity from `matched_sell.consumed_quantity` (formatted using `formatQuantity`)
- **Remaining Quantity** (column 6): Empty, displays "—"
- **Cost Basis** (column 7): Empty, displays "—"
- **Realized P/L** (column 8): Empty, displays "—"
- **Unrealized P/L** (column 9): Empty, displays "—"
- **Total P/L** (column 10): From `matched_sell.trade.price` (formatted using `formatCurrency`)

Note: Matched sells use columns that make semantic sense for their data. The "Ticker" column shows the Action ("Sell"), the "Original Quantity" column shows the consumed quantity, and the "Total P/L" column shows the price. Other columns that don't apply to matched sells display "—".

### Visual Hierarchy
- Lot rows: Normal table row styling
- Matched sell sub-rows:
  - Indented with left padding (e.g., `paddingLeft: 4`)
  - Optional: Lighter background color or border to show association
  - Optional: Smaller font size or different styling
  - Clear visual connection to parent lot row

### Conditional Rendering
- Sub-rows are only rendered when `lot.matched_sells` array has items
- If `matched_sells` is empty or undefined, no sub-rows are displayed
- Each matched sell in the array gets its own sub-row

## Error Handling

### Error States
1. **Loading State**: Shows LoadingSpinner component, disables interactions
2. **Error State**: Shows ErrorMessage component with error text and retry button
3. **Empty State**: Shows message when lots array is empty: "No lots found for this asset"

### Error Recovery
- Retry button in ErrorMessage component
- Automatic retry on authentication renewal (if token refresh implemented)
- Graceful degradation: Show available data even if some fields are null

## Events

### Internal Events
- `onSort(column: string, direction: 'asc' | 'desc')`: Updates sort state and triggers API call with sort parameters
- `onPageChange(page: number)`: Updates current page and triggers API call with page parameter
- `onPageSizeChange(size: number)`: Updates page size, resets to page 1, and triggers API call
- `onRetry()`: Retries API call with current state parameters (ticker, page, size, sort_by, sort_order)

### External Events
- Navigation event: Redirects to `/login` if authentication fails
- Navigation event: Can be navigated to from Portfolio Overview via three-dot menu "Lots" option
- AuthContext subscription: Re-fetches data if authentication state changes

## Data Formatting

### Display Format
- **Currency values** (cost_basis, price, realized_pnl, unrealized_pnl, total_pnl): Format as USD currency with 2 decimal places (e.g., "$1,234.56")
- **Date**: Format ISO date string (YYYY-MM-DD) to display format (e.g., "Jan 15, 2024")
- **Quantity** (original_quantity, remaining_quantity, consumed_quantity): Display in full precision as returned from the API (arbitrary precision). The quantity should display exactly as returned from the API without decimal place constraints (e.g., "100", "0.5", "0.123456789").
- **Action**: Display as-is from API ("Sell" for matched sells)
- **Broker**: Display as-is from API (broker name string)
- **P/L values** (realized_pnl, unrealized_pnl, total_pnl): Format as currency with color coding (green for positive values, red for negative values). Null values display as "N/A"

### Styling
- Matched sell sub-rows: Use visual indentation and optional background color/border to show hierarchy
- Action (Sell): Can be color-coded or styled for visual distinction

## Accessibility

### ARIA Labels
- Table has `aria-label="Asset lots table"`
- Sortable headers: `aria-sort="ascending" | "descending" | "none"`
- Sort button in header: `aria-label="Sort by {column name} {direction}"`
- Loading spinner: `aria-label="Loading lot data"`, `aria-live="polite"`
- Error message: `role="alert"`, `aria-live="assertive"`
- Sub-rows: Consider using `aria-describedby` to associate matched sells with parent lot

### Keyboard Navigation
- Tab order: Table headers (sortable) → Table rows (lots) → Sub-rows (matched sells) → Pagination controls → Page size selector → Retry button (if visible)
- Enter/Space on sortable header toggles sort
- Arrow keys navigate table cells (optional enhancement)
- Pagination controls support keyboard navigation (arrow keys, Enter to select page)

### Screen Reader Support
- Table headers properly associated with data cells
- Sort state announced when changed: "Sorted by {column} {direction}"
- Loading state announced: "Loading lot data"
- Error messages announced immediately
- Lot data read row by row with column headers
- Matched sells announced as sub-items of their parent lot
- Pagination state announced: "Page {current} of {total}, showing {start}-{end} of {total_items} lots"
- Page size change announced: "Page size changed to {size} items per page"

## Pagination

### Pagination Controls
- **MUI Pagination Component**: Shows page numbers and navigation (first, previous, next, last)
- **Page Size Selector**: MUI `Select` dropdown with options: 10, 20, 50, 100 items per page
- **Page Info Display**: Shows "Showing X-Y of Z lots" (e.g., "Showing 1-20 of 156 lots")

### Pagination Behavior
- **Server-side pagination**: All pagination handled by backend API
- Default page size: 20 items per page
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
- Consider caching strategies for recently viewed assets (future enhancement)

## Styling Notes (MUI)
- Page uses MUI `Container` for consistent page width and margins
- Header uses MUI `Typography` with variant="h4"
- Table uses MUI `TableContainer` with `Paper` and `Table` components
- Sortable headers use MUI `TableSortLabel` component with built-in sort indicators
- Table cells use MUI `TableCell` with proper alignment (numeric right-aligned, text left-aligned)
- Hover states handled by MUI TableRow hover styling
- Alternating row colors via MUI TableRow with sx prop or theme overrides
- Sub-rows use indentation via `sx={{ paddingLeft: 4 }}` or similar
- Sub-rows may use lighter background color: `sx={{ backgroundColor: 'grey.50' }}` or similar
- Responsive: MUI TableContainer provides horizontal scroll on small screens
- Loading state: MUI `CircularProgress` centered using MUI `Box` with flexbox centering
- Error messages use MUI `Alert` with severity="error" and action prop for retry button
- Pagination uses MUI `Pagination` component with proper theming
- Page size selector uses MUI `Select` with `FormControl` and `InputLabel`
- Page info uses MUI `Typography` with variant="body2" or "caption"
- Pagination controls wrapped in MUI `Box` or `Stack` for layout and spacing
- Uses MUI spacing and theme system for consistent styling throughout


