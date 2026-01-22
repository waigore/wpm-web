# Asset Trades Page Specification

## Component Name
AssetTrades - Asset trades detail page

## Purpose
Display all trades for a specific asset (identified by ticker) in a sortable table format. Shows trade history from the beginning to the present with pagination and sorting support. This is a detail page navigable from Portfolio Overview.

## Layout

### Visual Structure
- Page header with title: "<ticker>: Trades" (e.g., "AAPL: Trades")
- Trades Graph section showing historical price and trade markers above the trades table
- Sortable table displaying trades (server-side sorted)
- Pagination controls (below table): Page navigation, page size selector, page info
- Loading indicator during data fetch
- Error message display area (conditionally visible)
- Empty state when no trades exist

### Component Hierarchy (MUI Components)
```
AssetTrades
├── MUI Container
│   ├── MUI Box (header section)
│   │   └── MUI Typography (variant="h4", title: "{ticker}: Trades")
│   ├── Trades Graph section
│   │   ├── MUI Box (control section)
│   │   │   ├── MUI ToggleButtonGroup (granularity)
│   │   │   │   ├── MUI ToggleButton (Daily)
│   │   │   │   └── MUI ToggleButton (Weekly)
│   │   │   └── MUI ToggleButtonGroup (date range)
│   │   │       ├── MUI ToggleButton (YTD)
│   │   │       ├── MUI ToggleButton (1y)
│   │   │       └── MUI ToggleButton (2y)
│   │   ├── MUI CircularProgress (loading price data, conditionally rendered, centered)
│   │   ├── MUI Alert (error loading price data, conditionally rendered, severity="error")
│   │   │   ├── Error text
│   │   │   └── MUI Button (retry action)
│   │   └── MUI Paper (Trades Graph container)
│   │       └── Recharts ResponsiveContainer
│   │           └── Recharts LineChart
│   │               ├── Recharts CartesianGrid
│   │               ├── Recharts XAxis (date, formatted as DD MMM YY)
│   │               ├── Recharts YAxis (price, formatted as currency)
│   │               ├── Recharts Tooltip (shows date, price, and trades)
│   │               ├── Recharts Legend (optional)
│   │               ├── Recharts Line (dataKey: \"price\" - historical price line)
│   │               ├── Recharts ReferenceLine (y=current_price, dotted, label=\"Current price\")
│   │               └── Trade markers overlaid on price line (custom dots or Scatter)
│   ├── MUI CircularProgress (loading trades table, conditionally rendered, centered)
│   ├── MUI Alert (error loading trades, conditionally rendered, severity="error")
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
│               │           ├── Action (sortable)
│               │           ├── Broker (sortable)
│               │           ├── Order Instruction (sortable)
│               │           ├── Quantity (sortable)
│               │           └── Price (sortable)
│               └── MUI TableBody
│                   └── MUI TableRow[] (for each trade in current page)
│                       └── MUI TableCell[] (trade data)
│   └── MUI Box (pagination controls)
│       ├── MUI Pagination (page navigation)
│       ├── MUI Select (page size selector: 10, 20, 50, 100)
│       └── MUI Typography (page info: "Showing X-Y of Z trades")
```

## Props
- None (page-level component, ticker extracted from URL params)

## State

### Internal State
- `trades: Trade[]` - Array of trades for current page
- `loading: boolean` - Loading state during trades data fetch
- `error: string | null` - Error message to display for trades table
- `ticker: string` - Asset ticker extracted from URL params
- `sortBy: string` - Currently sorted column field name (default: "date")
- `sortOrder: 'asc' | 'desc'` - Sort direction (default: "asc")
- `currentPage: number` - Current page number (1-indexed, default: 1)
- `pageSize: number` - Number of items per page (default: 20, options: 10, 20, 50, 100)
- `totalItems: number` - Total number of trades across all pages
- `totalPages: number` - Total number of pages
- `granularity: 'daily' | 'weekly'` - Selected graph granularity (default: 'weekly' or 'daily' based on UX)
- `dateRange: 'ytd' | '1y' | '2y'` - Selected graph date range (default: 'ytd')
- `startDate: string | null` - Calculated start date for price history and trade markers based on `dateRange`
- `endDate: string | null` - End date for price history and trade markers (defaults to null, API uses today)
- `pricePoints: PricePoint[]` - Historical price points for the asset from `/asset/prices/{ticker}`
- `currentPrice: number | null` - Current market price in USD from `/asset/prices/{ticker}`
- `priceLoading: boolean` - Loading state during price history fetch
- `priceError: string | null` - Error message to display for Trades Graph

## Interactions

### User Actions

1. **Page Load/Mount**
   - Extracts `ticker` from URL params using `useParams()`
   - Checks authentication status via `useAuth()`
   - If not authenticated, redirects to `/login`
   - If authenticated:
     - Logs page load at INFO level: `"Asset trades page loaded for ticker: {ticker}"`
     - Logs component mount at DEBUG level
     - Calls `portfolioService.getAssetTrades(ticker)` with default parameters (page=1, size=20, sort_by="date", sort_order="asc") via `useAssetTrades()` hook
     - Sets `loading` state to true for trades table
     - Calculates initial `startDate` and `endDate` for Trades Graph based on default `dateRange` ('ytd') and `granularity` (e.g., 'weekly')
     - Calls `portfolioService.getAssetPriceHistory(ticker)` via `useAssetPriceHistory()` hook with calculated `start_date` and `end_date`
     - Sets `priceLoading` state to true for Trades Graph

2. **Column Header Click** (server-side sorting)
   - User clicks on sortable column header
   - If same column clicked:
     - Toggles sort direction (asc → desc → asc)
   - If different column clicked:
     - Sets new sort column (`sortBy`)
     - Sets sort direction to 'asc' (`sortOrder`)
   - Resets to page 1 (`currentPage = 1`)
   - Triggers API call with new sort parameters
   - Logs sort action at INFO level: `"Sorting trades by {column} {direction}"`
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
   - For trades table error:
     - Clears `error` state
     - Retries `getAssetTrades()` API call with current state parameters (ticker, page, size, sort_by, sort_order)
     - Logs retry attempt at INFO level: `"Retrying asset trades fetch"`
   - For Trades Graph price error:
     - Clears `priceError` state
     - Retries `getAssetPriceHistory()` API call with current graph state parameters (ticker, start_date, end_date)
     - Logs retry attempt at INFO level: `"Retrying asset price history fetch"`

6. **Granularity Toggle (Trades Graph)**
   - User clicks on graph granularity toggle button (Daily, Weekly)
   - Updates `granularity` state
   - Recalculates bucketing of price points and associated trades:
     - **Daily**: Uses all daily price points in range and attaches trades by exact trade date
     - **Weekly**: Groups price points into Monday-based weeks (or equivalent) and selects a representative price for each week; bucket trades into the corresponding week
   - Immediately triggers price-history API call if implementation chooses to align with backend defaults, otherwise reuses existing `pricePoints` and recomputes buckets on the client
   - Logs granularity change at INFO level: `"Trades graph granularity changed to {granularity}"`
   - Shows loading state during API call (if refetched)

7. **Date Range Toggle (Trades Graph)**
   - User clicks on graph date range toggle button (YTD, 1y, 2y)
   - Updates `dateRange` state
   - Calculates new `startDate` based on selection:
     - YTD: `startDate = new Date(currentYear, 0, 1).toISOString().split('T')[0]`
     - 1y: `startDate = new Date(today - 365 days).toISOString().split('T')[0]`
     - 2y: `startDate = new Date(today - 730 days).toISOString().split('T')[0]`
   - `endDate` remains `null` (API defaults to today)
   - Immediately triggers price-history API call with new date range parameters
   - Recomputes which trades fall within the selected date range for marker display
   - Logs date range change at INFO level: `"Trades graph date range changed to {dateRange}"`
   - Shows loading state during API call

## API Calls

### Endpoint
- **Method**: GET
- **Path**: `/portfolio/trades/{ticker}`
- **Authentication**: Required (JWT token in Authorization header)
- **Path Parameters**:
  - `ticker` (required, string): Asset ticker symbol
- **Query Parameters**:
  - `page` (optional, integer, default: 1, minimum: 1): Page number (1-indexed)
  - `size` (optional, integer, default: 20, minimum: 1, maximum: 100): Number of items per page
  - `sort_by` (optional, string, default: "date"): Field to sort by (e.g., "date", "ticker", "asset_type", "action", "order_instruction", "quantity", "price", "broker")
  - `sort_order` (optional, string, default: "asc", pattern: "^(asc|desc)$"): Sort order
  - `start_date` (optional, string, ISO format YYYY-MM-DD): Start date for filtering trades (inclusive)
  - `end_date` (optional, string, ISO format YYYY-MM-DD): End date for filtering trades (inclusive)
- **Response (200)**: 
  ```typescript
  {
    trades: {
      items: Trade[],
      total: number,
      page: number,
      size: number,
      pages: number
    }
  }
  ```
- **Response (400)**: Bad Request (invalid date format, start_date > end_date, or invalid sort_by field)
- **Response (401)**: Unauthorized (token expired/invalid)
- **Response (404)**: Not Found (ticker not found)
- **Response (422)**: Validation Error (invalid query parameters)
- **Response (500)**: Server error

### Service Function
- `portfolioService.getAssetTrades(ticker: string, params?: { page?: number, size?: number, sort_by?: string, sort_order?: 'asc' | 'desc', start_date?: string, end_date?: string }): Promise<PortfolioAssetTradesResponse>`
- Returns `PortfolioAssetTradesResponse` containing `trades` (Page_Trade_)
- Includes JWT token from AuthContext in Authorization header
- Passes ticker as path parameter and query parameters to API endpoint

### Data Fetching
- Fetches data on component mount with default parameters
- Re-fetches when:
  - Sort parameters change (sort_by, sort_order)
  - Pagination parameters change (page, size)
  - Ticker changes (if navigating to different asset)
  - Authentication state changes (if user re-authenticates)
- Uses `useAssetTrades()` hook to manage fetching logic with parameters
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
  - Display error message: "Unable to load trade data. Please try again."
  - Log error at ERROR level: `"Asset trades fetch failed: {error}"`
  - Show retry button
- **Network Error**: 
  - Display error message: "Network error. Please check your connection."
  - Log error at ERROR level: `"Network error fetching asset trades: {error}"`
  - Show retry button

## Validations

### Data Validations
- Validate API response structure
- Validate each trade has required fields
- Validate ticker from URL params is not empty

### Display Validations
- Format numeric values appropriately (currency, decimals)
- Format dates appropriately (ISO format to display format)
- Handle missing/null data with placeholder text (e.g., "N/A" for null values)

## Sorting (Server-Side)

### Sortable Columns
1. **Date**: Field name "date" - Date sort (chronological order, default: ascending)
2. **Ticker**: Field name "ticker" - Alphabetical sort (A-Z or Z-A)
3. **Asset Type**: Field name "asset_type" - Alphabetical sort
4. **Action**: Field name "action" - Alphabetical sort (Buy/Sell)
5. **Order Instruction**: Field name "order_instruction" - Alphabetical sort
6. **Quantity**: Field name "quantity" - Numerical sort
7. **Price**: Field name "price" - Numerical sort
8. **Broker**: Field name "broker" - Alphabetical sort

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

## Error Handling

### Error States
1. **Loading State**: Shows LoadingSpinner component, disables interactions
2. **Error State**: Shows ErrorMessage component with error text and retry button
3. **Empty State**: Shows message when trades array is empty: "No trades found for this asset"

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
- Navigation event: Can be navigated to from Portfolio Overview via three-dot menu
- AuthContext subscription: Re-fetches data if authentication state changes

## Data Formatting

### Display Format
- **Currency values** (price): Format as USD currency with 2 decimal places (e.g., "$1,234.56")
- **Date**: Format ISO date string (YYYY-MM-DD) to display format (e.g., "Jan 15, 2024" or "2024-01-15")
- **Quantity**: Display in full precision as returned from the API (arbitrary precision). The quantity should display exactly as returned from the API without decimal place constraints (e.g., "100", "0.5", "0.123456789").
- **Action**: Display as-is from API ("Buy" or "Sell")
- **Order Instruction**: Display as capitalized text (e.g., "Limit", "Market", "Lump Sum")
- **Broker**: Display as-is from API (broker name string)

### Styling
- Action (Buy/Sell): Can be color-coded or styled for visual distinction
- Order instruction: Can be color-coded or styled for visual distinction

## Accessibility

### ARIA Labels
- Table has `aria-label="Asset trades table"`
- Sortable headers: `aria-sort="ascending" | "descending" | "none"`
- Sort button in header: `aria-label="Sort by {column name} {direction}"`
- Loading spinner: `aria-label="Loading trade data"`, `aria-live="polite"`
- Error message: `role="alert"`, `aria-live="assertive"`

### Keyboard Navigation
- Tab order: Table headers (sortable) → Table rows → Pagination controls → Page size selector → Retry button (if visible)
- Enter/Space on sortable header toggles sort
- Arrow keys navigate table cells (optional enhancement)
- Pagination controls support keyboard navigation (arrow keys, Enter to select page)

### Screen Reader Support
- Table headers properly associated with data cells
- Sort state announced when changed: "Sorted by {column} {direction}"
- Loading state announced: "Loading trade data"
- Error messages announced immediately
- Trade data read row by row with column headers
- Pagination state announced: "Page {current} of {total}, showing {start}-{end} of {total_items} trades"
- Page size change announced: "Page size changed to {size} items per page"

## Pagination

### Pagination Controls
- **MUI Pagination Component**: Shows page numbers and navigation (first, previous, next, last)
- **Page Size Selector**: MUI `Select` dropdown with options: 10, 20, 50, 100 items per page
- **Page Info Display**: Shows "Showing X-Y of Z trades" (e.g., "Showing 1-20 of 156 trades")

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
- Responsive: MUI TableContainer provides horizontal scroll on small screens
- Loading state: MUI `CircularProgress` centered using MUI `Box` with flexbox centering
- Error messages use MUI `Alert` with severity="error" and action prop for retry button
- Pagination uses MUI `Pagination` component with proper theming
- Page size selector uses MUI `Select` with `FormControl` and `InputLabel`
- Page info uses MUI `Typography` with variant="body2" or "caption"
- Pagination controls wrapped in MUI `Box` or `Stack` for layout and spacing
- Uses MUI spacing and theme system for consistent styling throughout

