# Portfolio Allocation Page Specification

## Component Name
PortfolioAllocation - Portfolio allocation visualization page with 2-tier nested pie chart and treemap views

## Purpose
Display portfolio allocation as either a 2-tier nested pie chart or a treemap visualization. Both views show asset type allocation and individual asset allocation. Supports filtering by asset types and tickers with immediate chart updates. Users can toggle between pie chart and treemap views. This is a detail page navigable from Portfolio Overview.

## Layout

### Visual Structure
- Page header with title: "Portfolio Allocation"
- Breadcrumbs navigation: Home > Portfolio > Allocation
- Filter section with two multi-select controls:
  - Asset type filter: Multi-select checkboxes or autocomplete (Stock, ETF, Crypto, etc.)
  - Ticker filter: Multi-select autocomplete with search capability
- View toggle section:
  - Toggle button group to switch between "Pie Chart" and "Treemap" views
- Visualization (conditional based on selected view):
  - Pie Chart view: 2-tier nested pie chart
    - Inner ring: Asset types (Stock, ETF, Crypto, etc.) with percentages
    - Outer ring: Individual assets (tickers) grouped by asset type with percentages
  - Treemap view: Hierarchical treemap
    - Parent nodes: Asset types (Stock, ETF, Crypto, etc.)
    - Leaf nodes: Individual assets (tickers) within each asset type
    - Cell size proportional to market value
- Legend (shared for both views):
  - Asset type labels with colors and percentages
- Loading indicator during data fetch
- Error message display area (conditionally visible)
- Empty state when no assets match filters

### Component Hierarchy (MUI Components)
```
PortfolioAllocation
├── MUI Container
│   ├── Breadcrumbs component
│   │   └── Items: [{ label: 'Home', path: '/portfolio' }, { label: 'Portfolio', path: '/portfolio' }, { label: 'Allocation' }]
│   ├── MUI Box (header section)
│   │   └── MUI Typography (variant="h4", title: "Portfolio Allocation")
│   ├── AllocationFilters component
│   │   ├── MUI Box (filter section)
│   │   │   ├── MUI Typography (variant="body2", label: "Asset Types")
│   │   │   ├── MUI Autocomplete (multi-select for asset types)
│   │   │   │   └── MUI Checkbox (for each option)
│   │   │   ├── MUI Typography (variant="body2", label: "Tickers")
│   │   │   └── MUI Autocomplete (multi-select for tickers with search)
│   │   │       └── MUI Checkbox (for each option)
│   ├── MUI Box (view toggle section)
│   │   ├── MUI Typography (variant="body2", label: "View")
│   │   └── MUI ToggleButtonGroup (view mode selection)
│   │       ├── MUI ToggleButton (value: "pie", label: "Pie Chart")
│   │       └── MUI ToggleButton (value: "treemap", label: "Treemap")
│   ├── MUI CircularProgress (loading, conditionally rendered, centered)
│   ├── ErrorMessage component (error, conditionally rendered)
│   │   ├── Error text
│   │   └── MUI Button (retry action)
│   └── MUI Paper (chart container)
│       ├── MUI Typography (variant="h6", chart title: "Portfolio Allocation")
│       ├── Conditional rendering based on viewMode:
│       │   ├── If viewMode === "pie": AllocationPieChart component
│       │   │   └── Recharts ResponsiveContainer
│       │   │       ├── Recharts PieChart (inner ring - asset types)
│       │   │       │   ├── Recharts Pie (dataKey: "value", innerRadius: 0, outerRadius: "60%")
│       │   │       │   ├── Recharts Cell (color per asset type)
│       │   │       │   ├── Recharts Label (asset type name)
│       │   │       │   └── Recharts Tooltip (custom tooltip for asset types)
│       │   │       └── Recharts PieChart (outer ring - individual assets)
│       │   │           ├── Recharts Pie (dataKey: "value", innerRadius: "65%", outerRadius: "100%")
│       │   │           ├── Recharts Cell (color per asset, grouped by type)
│       │   │           ├── Recharts Label (ticker symbol)
│       │   │           └── Recharts Tooltip (custom tooltip with full asset details)
│       │   └── If viewMode === "treemap": AllocationTreemap component
│       │       └── Recharts ResponsiveContainer
│       │           └── Recharts Treemap
│       │               ├── Recharts Cell (color per asset type, nested structure)
│       │               ├── Recharts Custom Content (ticker labels and percentages)
│       │               └── Recharts Tooltip (custom tooltip with full asset details)
│       └── Legend (shared for both views)
│           └── Asset type labels with colors and percentages
```

## Props
- None (page-level component)

## State

### Internal State
- `assets: AllocationPosition[]` - Array of filtered portfolio positions from API
- `loading: boolean` - Loading state during data fetch
- `error: string | null` - Error message to display
- `selectedAssetTypes: string[]` - Selected asset types for filtering (default: empty array = show all)
- `selectedTickers: string[]` - Selected tickers for filtering (default: empty array = show all)
- `allAvailableAssetTypes: string[]` - All unique asset types fetched once on mount (static, for filter options)
- `allAvailableTickers: string[]` - All tickers fetched once on mount (static, for filter options)
- `viewMode: 'pie' | 'treemap'` - Selected visualization view (default: 'pie')

## Interactions

### User Actions

1. **Page Load/Mount**
   - Checks authentication status via `useAuth()`
   - If not authenticated, redirects to `/login`
   - If authenticated:
     - Logs page load at INFO level: `"Portfolio allocation page loaded"`
     - Logs component mount at DEBUG level
     - Makes two API calls via `usePortfolioAllocation()` hook:
       - First call: No filters to fetch all available options (asset types and tickers) - stored in `allAvailableAssetTypes` and `allAvailableTickers` (static, fetched once)
       - Second call: No filters initially to display all assets in chart
     - Sets loading state to true
     - Extracts unique asset types and tickers from unfiltered response and stores them as static filter options
     - These static options remain unchanged when filters are applied, allowing users to select any combination

2. **Asset Type Filter Change**
   - User selects/deselects asset types in multi-select
   - Updates `selectedAssetTypes` state
   - Immediately triggers API call with new filter parameters
   - Logs filter change at INFO level: `"Asset type filter changed: {selectedAssetTypes}"`
   - Shows loading state during API call
   - Updates chart with filtered data
   - Recalculates allocation percentages based on filtered subset

3. **Ticker Filter Change**
   - User selects/deselects tickers in multi-select autocomplete
   - Updates `selectedTickers` state
   - Immediately triggers API call with new filter parameters
   - Logs filter change at INFO level: `"Ticker filter changed: {selectedTickers}"`
   - Shows loading state during API call
   - Updates chart with filtered data
   - Recalculates allocation percentages based on filtered subset

4. **Clear Filters**
   - User can clear all filters (empty arrays)
   - Resets to show all assets
   - Triggers API call with no filter parameters

5. **View Mode Toggle**
   - User clicks toggle button to switch between "Pie Chart" and "Treemap" views
   - Updates `viewMode` state
   - Immediately switches visualization without API call (uses same filtered data)
   - Logs view change at INFO level: `"View mode changed to {viewMode}"`
   - Both views display the same filtered data

6. **Retry on Error**
   - User clicks retry button in error message
   - Clears error state
   - Retries `getPortfolioAllocation()` API call with current filter parameters
   - Logs retry attempt at INFO level: `"Retrying portfolio allocation fetch"`

7. **Pie Chart Hover** (when viewMode === "pie")
   - User hovers over inner ring segment (asset type)
   - Shows tooltip with asset type name and total value/percentage
   - User hovers over outer ring segment (individual asset)
   - Shows detailed tooltip with all asset information

8. **Treemap Hover** (when viewMode === "treemap")
   - User hovers over parent node (asset type)
   - Shows tooltip with asset type name and total value/percentage
   - User hovers over leaf node (individual asset)
   - Shows detailed tooltip with all asset information

## API Calls

### Endpoint
- **Method**: GET
- **Path**: `/portfolio/allocation`
- **Authentication**: Required (JWT token in Authorization header)
- **Query Parameters**:
  - `asset_types` (optional, string, comma-separated): Asset types to filter by (e.g., "Stock,ETF")
  - `tickers` (optional, string, comma-separated): Ticker symbols to filter by (e.g., "AAPL,MSFT")
- **Response (200)**: 
  ```typescript
  {
    assets: AllocationPosition[]
  }
  ```
  Where `AllocationPosition` is:
  ```typescript
  {
    ticker: string;
    asset_type: string;
    quantity: number;
    average_price: number;
    cost_basis: number;
    cost_basis_method: string;
    current_price: number | null;
    market_value: number | null;
    unrealized_gain_loss: number | null;
    allocation_percentage: number | null; // Recalculated for filtered subset
    realized_gain_loss: number | null;
    metadata: { [key: string]: any } | null; // Contains sector, industry, etc.
  }
  ```
- **Response (400)**: Bad Request (invalid parameter format)
- **Response (401)**: Unauthorized (token expired/invalid)
- **Response (422)**: Validation Error (invalid query parameters)
- **Response (500)**: Server error (portfolio or services unavailable)

### Service Function
- `portfolioService.getPortfolioAllocation(params?: { asset_types?: string | null, tickers?: string | null }): Promise<PortfolioAllocationResponse>`
- Returns `PortfolioAllocationResponse` containing `assets` array
- Includes JWT token from AuthContext in Authorization header
- Passes query parameters as comma-separated strings to API endpoint

### Data Fetching
- Fetches data on component mount with no filters (shows all assets)
- Makes two separate API calls:
  - **Unfiltered call (once on mount)**: Fetches all assets to populate static filter options (`allAvailableAssetTypes` and `allAvailableTickers`)
  - **Filtered call**: Fetches assets based on current filter selections for chart display
- Re-fetches filtered data when:
  - Asset type filter changes
  - Ticker filter changes
  - Authentication state changes (if user re-authenticates)
- Filter options are fetched once and remain static - they do not change when filters are applied
- Uses `usePortfolioAllocation()` hook to manage fetching logic with filter parameters
- Hook converts filter arrays to comma-separated strings for API
- Empty filter arrays are converted to `null` (show all)
- Users can select any combination of asset types and tickers independently (e.g., "Crypto" type + "VOO" ticker)

### Error Handling
- **400 Bad Request**: 
  - Display error message: "Invalid request. Please check your filter settings."
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
  - Display error message: "Unable to load allocation data. Please try again."
  - Log error at ERROR level: `"Portfolio allocation fetch failed: {error}"`
  - Show retry button
- **Network Error**: 
  - Display error message: "Network error. Please check your connection."
  - Log error at ERROR level: `"Network error fetching portfolio allocation: {error}"`
  - Show retry button

## Validations

### Data Validations
- Validate API response structure
- Validate each asset has required fields (ticker, asset_type, quantity, etc.)
- Validate allocation_percentage sums to ~100% for filtered subset
- Validate market_value is non-negative number or null
- Validate metadata structure (if present)

### Display Validations
- Format numeric values appropriately (currency, percentages)
- Handle missing/null data with placeholder text ("N/A")
- Handle empty assets array with empty state message
- Validate filter selections don't result in empty data (show warning if needed)

## Treemap Configuration

### Hierarchical Structure
- Level 1: Asset Types (parent nodes)
  - `name`: Asset type name (e.g., "Stock", "ETF", "Crypto")
  - `value`: Sum of market_value for all assets of this type
  - `children`: Array of individual asset nodes
  - Color: Consistent color per asset type (same as pie chart)
- Level 2: Individual Assets (leaf nodes)
  - `name`: Ticker symbol (e.g., "AAPL", "MSFT")
  - `value`: market_value for this asset
  - `asset`: Full AllocationPosition object for tooltip access
  - Color: Same as parent asset type (for visual grouping)

### Data Transformation
- Group assets by `asset_type` to create parent nodes
- Sum `market_value` for each asset type
- Create child nodes for each asset within its type
- Calculate percentages: `(asset_value / total_filtered_value) * 100`
- Sort asset types by total value (descending)
- Sort assets within each type by value (descending)

### Cell Rendering
- Display ticker symbol prominently
- Show allocation percentage
- Use sufficient font size for readability
- Ensure text contrast against background color

### Color Mapping
- Use same color scheme as pie chart (`ASSET_TYPE_COLORS`)
- Parent nodes (asset types): Base color
- Leaf nodes (individual assets): Same color as parent (for grouping)
- Ensure sufficient contrast for accessibility
- Use MUI theme colors where possible

## Pie Chart Configuration

### Inner Ring (Asset Types)
- Data key: `value` (sum of market_value for each asset type)
- Inner radius: `0` (full circle from center)
- Outer radius: `"60%"` (60% of chart radius)
- Label: Asset type name (e.g., "Stock", "ETF")
- Color: Consistent color per asset type (use theme colors)
- Tooltip: Shows asset type name, total value, and percentage

### Outer Ring (Individual Assets)
- Data key: `value` (market_value for each asset)
- Inner radius: `"65%"` (starts just outside inner ring)
- Outer radius: `"100%"` (extends to chart edge)
- Label: Ticker symbol (e.g., "AAPL", "MSFT")
- Color: Variations/shades of asset type color (for visual grouping)
- Tooltip: Shows comprehensive asset details (see Tooltip section)

### Data Transformation
- Group assets by `asset_type` for inner ring calculation
- Sum `market_value` for each asset type
- Calculate percentages: `(type_value / total_filtered_value) * 100`
- For outer ring, maintain asset order grouped by type
- Calculate percentages: `(asset_value / total_filtered_value) * 100`

### Color Mapping
- Inner ring: Use distinct colors per asset type (e.g., Stock=blue, ETF=green, Crypto=orange)
- Outer ring: Use color variations (lighter/darker shades) of asset type color
- Ensure sufficient contrast for accessibility
- Use MUI theme colors when possible

## Tooltip Configuration

### Inner Ring Tooltip (Asset Type)
- Asset Type Name (bold)
- Total Market Value (formatted currency)
- Allocation Percentage (formatted percentage)
- Number of Assets (count of assets in this type)

### Outer Ring Tooltip (Individual Asset)
Displays in this order:
1. **Ticker** (bold, large font, e.g., "AAPL")
2. **Asset Type • Sector** (if sector available in metadata, e.g., "Stock • Technology")
3. **Market Value** (formatted currency, e.g., "$15,234.56")
4. **Allocation %** (formatted percentage, e.g., "12.5%")
5. **Cost Basis** (formatted currency, e.g., "$12,000.00")
6. **Unrealized P/L** (formatted currency with color coding: green for positive, red for negative, e.g., "+$3,234.56")
7. **Current Price** (formatted currency per share, e.g., "$150.25")
8. **Quantity** (formatted number with units, e.g., "101.5 shares")
9. **Average Price** (formatted currency per share, e.g., "$118.23")
10. **Industry** (if available in metadata, e.g., "Software")

### Tooltip Formatting
- Use MUI Paper component for tooltip container
- Use Typography components for text with appropriate variants
- Format currency using `formatCurrency()` utility
- Format percentages using `formatPercentage()` utility
- Format quantities using `formatQuantity()` utility
- Show "N/A" for null/undefined values
- Color-code unrealized P/L (green for gains, red for losses)

## Error Handling

### Error States
1. **Loading State**: Shows CircularProgress component, disables interactions
2. **Error State**: Shows ErrorMessage component with error text and retry button
3. **Empty State**: Shows message when assets array is empty: "No assets match the selected filters. Try adjusting your filters."

### Error Recovery
- Retry button in ErrorMessage component
- Automatic retry on authentication renewal (if token refresh implemented)
- Graceful degradation: Show available data even if some fields are null

## Events

### Internal Events
- `onAssetTypesChange(types: string[])`: Updates selectedAssetTypes state and triggers API call
- `onTickersChange(tickers: string[])`: Updates selectedTickers state and triggers API call
- `onViewModeChange(mode: 'pie' | 'treemap')`: Updates viewMode state and switches visualization
- `onRetry()`: Retries API call with current filter parameters

### External Events
- Navigation event: Redirects to `/login` if authentication fails
- Navigation event: Can be navigated to from Portfolio Overview via Allocation button
- AuthContext subscription: Re-fetches data if authentication state changes

## Data Formatting

### Display Format
- **Currency values** (market_value, cost_basis, current_price, average_price, unrealized_gain_loss): Format as USD currency with 2 decimal places (e.g., "$1,234.56")
- **Percentages** (allocation_percentage): Format with 2 decimal places and % sign (e.g., "12.50%")
- **Quantities**: Format with appropriate precision (e.g., "101.5 shares")
- **Null values**: Display as "N/A"

### Styling
- Chart uses theme colors consistent with application design
- Filter controls use MUI Autocomplete with multi-select styling
- Chart container uses MUI Paper for elevation and styling
- Tooltips use MUI Paper with elevation for visual separation

## Accessibility

### ARIA Labels
- Chart container: `aria-label="Portfolio allocation {viewMode} chart"` (dynamic based on viewMode)
- Pie chart inner ring: `aria-label="Asset type allocation"`
- Pie chart outer ring: `aria-label="Individual asset allocation"`
- Treemap: `aria-label="Portfolio allocation treemap"`
- View toggle: `aria-label="Select visualization view"`
- Asset type filter: `aria-label="Filter by asset types"`
- Ticker filter: `aria-label="Filter by ticker symbols"`
- Loading spinner: `aria-label="Loading allocation data"`, `aria-live="polite"`
- Error message: `role="alert"`, `aria-live="assertive"`

### Keyboard Navigation
- Tab order: Asset type filter → Ticker filter → View toggle → Chart (if interactive) → Retry button (if visible)
- View toggle supports keyboard navigation (Arrow keys to switch, Enter to select)
- Autocomplete components support keyboard navigation (Arrow keys, Enter to select, Escape to close)
- Chart segments accessible via keyboard (if supported by recharts)
- Tooltip accessible via keyboard focus

### Screen Reader Support
- Filter changes announced: "Asset type filter changed to {types}", "Ticker filter changed to {tickers}"
- View mode changes announced: "View mode changed to {viewMode}"
- Loading state announced: "Loading allocation data"
- Error messages announced immediately
- Chart data described: "Portfolio allocation showing {count} assets across {count} asset types in {viewMode} view"
- Tooltip content read when segment is focused

## Performance Considerations
- API calls triggered on filter changes (no debouncing needed for user-initiated actions)
- Loading states prevent multiple simultaneous API calls
- Chart re-renders only when data changes
- Filter options fetched once on mount and cached in state - they remain static and do not require re-fetching
- Static filter options prevent unnecessary API calls and ensure all options remain available for selection
- Log component re-renders at DEBUG level to track performance
- Consider memoization for chart data transformation (future enhancement)

## Styling Notes (MUI)
- Page uses MUI `Container` for consistent page width and margins
- Header uses MUI `Typography` with variant="h4"
- Filters use MUI `Autocomplete` with `multiple` prop and `Checkbox` renderOption
- View toggle uses MUI `ToggleButtonGroup` with `ToggleButton` components
- Chart container uses MUI `Paper` for elevation and styling
- Loading state: MUI `CircularProgress` centered using MUI `Box` with flexbox centering
- Error messages use ErrorMessage component (MUI Alert wrapper)
- Tooltips use MUI `Paper` with elevation for visual separation
- Uses MUI spacing and theme system for consistent styling throughout
- Recharts components styled to match MUI theme colors
- Both pie chart and treemap use consistent color scheme and styling
