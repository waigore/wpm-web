# Breadcrumbs Component Specification

## Component Name
Breadcrumbs - Navigation breadcrumb component

## Purpose
Display hierarchical navigation breadcrumbs above page headers to help users understand their current location in the application and navigate to parent pages.

## Layout

### Visual Structure
- Breadcrumb navigation displayed above page header
- Shows navigation path with separators (typically ">")
- Clickable links for parent pages
- Non-clickable current page indicator
- Positioned above page title/header

### Component Hierarchy (MUI Components)
```
Breadcrumbs
├── MUI Box (container, optional for spacing)
│   └── MUI Breadcrumbs
│       ├── MUI Link (for clickable items)
│       │   └── Breadcrumb label text
│       └── MUI Typography (for non-clickable current page)
│           └── Breadcrumb label text
```

## Props

### Required Props
- `items: BreadcrumbItem[]` - Array of breadcrumb items

### BreadcrumbItem Interface
```typescript
interface BreadcrumbItem {
  label: string;      // Display text for the breadcrumb
  path?: string;      // Optional path - if undefined, item is not clickable (current page)
}
```

## State
- None (presentation component, no internal state)

## Interactions

### User Actions

1. **Breadcrumb Link Click**
   - User clicks on a clickable breadcrumb item (one with a `path` property)
   - Navigates to the specified path using React Router `Link` component
   - Uses declarative navigation (not imperative `useNavigate()`)

2. **Keyboard Navigation**
   - Tab key navigates to clickable breadcrumb links
   - Enter/Space activates the link
   - Current page (last item) is not focusable

## Edge Cases

1. **Empty Items Array**
   - If `items.length === 0`, component returns `null` (renders nothing)
   - Guard clause handles this case

2. **Single Item**
   - If `items.length === 1`, renders as non-clickable current page
   - No navigation links shown

3. **All Items Have Paths**
   - Last item should not have a `path` property (current page indicator)
   - If last item has a path, it will still be rendered as clickable (component doesn't enforce this)

## API Calls
- None (presentation component only)

## Validations
- Component accepts `BreadcrumbItem[]` with TypeScript type checking
- No runtime validation needed (TypeScript handles type safety)

## Error Handling
- No error states (presentation component)
- Edge cases handled with guard clauses (empty array, single item)

## Events
- Navigation events handled by React Router `Link` components
- No custom events emitted

## Data Formatting
- Labels displayed as-is (no formatting required)
- Paths used directly for navigation

## Accessibility

### ARIA Labels
- Breadcrumbs wrapped in `nav` element with `aria-label="Breadcrumb navigation"`
- Last item (current page) has `aria-current="page"` attribute
- Links have proper `aria-label` or use visible text

### Keyboard Navigation
- Tab order: Navigate through clickable breadcrumb links
- Enter/Space activates links
- Current page item is not focusable (not a link)

### Screen Reader Support
- Navigation structure announced: "Breadcrumb navigation"
- Current page announced: "Current page: {label}"
- Link destinations announced: "{label}, link"

## Styling Notes (MUI)
- Uses MUI `Breadcrumbs` component with default separator ("/")
- Uses MUI `Link` component from `react-router-dom` for navigation
- Uses MUI `Typography` for non-clickable current page
- Spacing: `mb: 2` margin below breadcrumbs (applied by parent container)
- Follows MUI theme for colors and typography
- Responsive: Breadcrumbs wrap on small screens if needed

## Usage Examples

### Portfolio Overview Page
```typescript
<Breadcrumbs items={[
  { label: 'Home', path: '/portfolio' },
  { label: 'Portfolio' }
]} />
```

### Asset Trades Page
```typescript
<Breadcrumbs items={[
  { label: 'Home', path: '/portfolio' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: ticker }
]} />
```

## Implementation Notes

### Clean Coding Principles
- **Abstraction/Delegation**: Component is thin, focused on presentation. Navigation handled by React Router `Link` components.
- **Guard Clauses**: Early returns for edge cases (empty items, single item).
- **Module-Level Imports**: All imports at top of file.
- **Type Safety**: Explicit TypeScript interfaces, no `any` types.
- **Component Reuse**: Reusable component following `PaginationControls` pattern.

### Dependencies
- `@mui/material` - Breadcrumbs, Typography, Link (via react-router-dom)
- `react-router-dom` - Link component for navigation
- React - Component framework



