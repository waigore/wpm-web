# Clean Coding Principles

## Purpose

This document defines the clean coding principles that all code in the wpm-web (Wealth Portfolio Manager Web) project must adhere to. These principles are enforced through code review and should be referenced in all module specifications.

## Principles

### 1. Build Abstractions and Implement Delegation + Encapsulation

**Principle:** Always build abstractions and implement delegation and encapsulation whenever possible. High-level components should never need to know implementation details of lower-level components.

**Examples:**
- Page components should delegate data fetching and state management to custom hooks rather than containing business logic. The `PortfolioOverview` page component should handle UI concerns, while `usePortfolio` hook contains the data fetching logic.
- Service layer functions abstract away API client details. The `portfolioService` module transforms API client types to application models, so hooks don't need to know about API client internals.
- Configuration and context should be accessed through React Context or props rather than global state. Use `AuthProvider` context or prop injection rather than importing global state instances.
- Components should encapsulate their internal state and expose only necessary interfaces. For example, authentication logic is encapsulated in the `AuthProvider` context and accessed through the `useAuth` hook.
- Use dependency injection patterns (React Context, props) to decouple components and make dependencies explicit.
- Custom hooks should encapsulate complex state logic and side effects, exposing a clean interface to components.

**Enforcement:**
- When reviewing code, verify that page components delegate data fetching to hooks rather than containing API calls.
- Check that service layer functions abstract away API client implementation details.
- Ensure that internal implementation details (like JWT token structure) are not exposed beyond module boundaries.
- Verify that dependencies are injected via props or Context rather than accessed as globals.
- Custom hooks should be used for reusable stateful logic rather than duplicating logic in components.

### 2. Avoid Nested Conditionals - Use Conditional Guards

**Principle:** Nested conditionals are a code smell and should be avoided. Prefer conditional guards (early returns/continues) to flatten control logic. If control logic is still too complicated (e.g., 3 or more nested layers), abstract it away into a function or custom hook.

**Rule:** Never have more than 2 levels of nested if statements.

**Examples:**

**Bad:**
```typescript
const MyComponent: React.FC<Props> = ({ data }) => {
  if (data) {
    if (data.items) {
      if (data.items.length > 0) {
        return <div>{/* render items */}</div>;
      } else {
        return <div>No items</div>;
      }
    } else {
      return <div>No items property</div>;
    }
  } else {
    return <div>No data</div>;
  }
};
```

**Better (with guards):**
```typescript
const MyComponent: React.FC<Props> = ({ data }) => {
  if (!data) {
    return <div>No data</div>;
  }

  if (!data.items) {
    return <div>No items property</div>;
  }

  if (data.items.length === 0) {
    return <div>No items</div>;
  }

  return <div>{/* render items */}</div>;
};
```

**Better (with early returns in functions):**
```typescript
function extractErrorMessage(err: unknown): string {
  if (!err) {
    return 'An error occurred';
  }

  if (typeof err === 'object' && 'response' in err) {
    const httpError = err as { response?: { status?: number } };
    if (httpError.response?.status === 401) {
      return 'Authentication failed';
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'An error occurred';
}
```

**When to Abstract:**
- If after applying guard clauses, you still have 3+ levels of nesting, extract the logic into a separate function or custom hook.
- Complex conditional logic that represents a distinct decision point should be encapsulated in a function with a descriptive name.
- Conditional rendering logic that's repeated across components should be extracted to a utility function or component.

**Enforcement:**
- Code reviews must flag any code with more than 2 levels of nested conditionals.
- Prefer guard clauses (`if (!condition) return`) over nested if-else blocks.
- Extract complex conditional logic into well-named helper functions or custom hooks.

### 3. Avoid Inline Imports

**Principle:** Avoid inline imports (imports inside functions or components) as they build hidden dependencies and contribute to undesired coupling. All imports should be at the module level.

**Rationale:**
- Inline imports make dependencies less visible and harder to track.
- They can create circular import issues.
- They make it difficult to understand module dependencies at a glance.
- They can lead to performance issues if imports happen in hot paths (though modern bundlers mitigate this).

**Examples:**

**Bad:**
```typescript
const MyComponent: React.FC = () => {
  const handleClick = () => {
    const { useAuth } = require('../../hooks/useAuth');
    const { login } = useAuth();
    login();
  };

  return <button onClick={handleClick}>Login</button>;
};
```

**Better:**
```typescript
import { useAuth } from '../../hooks/useAuth';

const MyComponent: React.FC = () => {
  const { login } = useAuth();

  const handleClick = () => {
    login();
  };

  return <button onClick={handleClick}>Login</button>;
};
```

**Exceptions:**
- Dynamic imports using `import()` are acceptable and encouraged for code splitting (e.g., lazy loading components with `React.lazy()`).
- Only acceptable when importing inside a function is necessary to break a circular import, and this should be documented with a comment explaining why.

**Enforcement:**
- All imports must be at the top of the file (after file-level comments/docstrings and before any other code).
- Code reviews must flag any inline imports (except dynamic imports for code splitting) and require justification if they cannot be moved to module level.
- Dynamic imports for code splitting are encouraged and should be used with `React.lazy()` for route-based code splitting.

### 4. Avoid Dynamic Property Access

**Principle:** Avoid using dynamic property access patterns (like `hasOwnProperty`, `in` operator for type checking, or bracket notation with variables) unless absolutely necessary. TypeScript's type system and optional chaining should be used instead.

**Rationale:**
- Dynamic property access bypasses static type checking and makes code harder to reason about.
- It creates implicit contracts that are not enforced by the type system.
- Code using dynamic property access is more prone to runtime errors that could be caught earlier with proper type checking.
- TypeScript's optional chaining (`?.`) and nullish coalescing (`??`) provide safer alternatives.
- Makes refactoring more dangerous as property existence checks can silently fail or pass incorrectly.

**Examples:**

**Bad:**
```typescript
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'items' in data) {
    const obj = data as { items?: unknown[] };
    if ('length' in obj.items) {
      return obj.items.length;
    }
  }
  return 0;
}
```

**Better (using type guards):**
```typescript
interface DataWithItems {
  items?: unknown[];
}

function isDataWithItems(data: unknown): data is DataWithItems {
  return typeof data === 'object' && data !== null && 'items' in data;
}

function processData(data: unknown): number {
  if (!isDataWithItems(data)) {
    return 0;
  }

  return data.items?.length ?? 0;
}
```

**Better (using optional chaining and type narrowing):**
```typescript
function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const httpError = err as { response?: { status?: number } };
    if (httpError.response?.status === 401) {
      return 'Authentication failed';
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'An error occurred';
}
```

**When Dynamic Property Access is Acceptable:**
- Only when dealing with truly dynamic objects where property existence cannot be determined statically (e.g., parsing external API responses without full type definitions, working with third-party libraries that don't provide type definitions).
- When the alternative would require significant architectural changes that are not feasible in the short term (should be documented and marked for refactoring).
- When implementing type guards for runtime type checking.

**Enforcement:**
- Code reviews must flag all uses of `hasOwnProperty`, `in` operator for type checking (except in type guards), and dynamic bracket notation, and require justification.
- Prefer TypeScript interfaces, type guards, and optional chaining to define expected interfaces.
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe property access.
- Document any legitimate uses of dynamic property access with comments explaining why it's necessary.

### 5. Maximize Component Reuse

**Principle:** Maximize component reuse whenever possible to enhance composability and maintainability. Extract common UI patterns, logic, and structures into reusable components, hooks, and utilities.

**Rationale:**
- Reusable components reduce code duplication and maintenance burden.
- Shared components ensure consistent UI/UX across the application.
- Abstracted logic in hooks and utilities makes the codebase more testable.
- Component reuse improves development velocity for new features.

**Examples:**

**Bad (duplicated pagination logic):**
```typescript
// In PortfolioOverview.tsx
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
  <Typography variant="body2">
    Showing {startItem}-{endItem} of {totalItems} positions
  </Typography>
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <FormControl size="small">
      <InputLabel>Page Size</InputLabel>
      <Select value={pageSize} onChange={handlePageSizeChange}>
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={20}>20</MenuItem>
      </Select>
    </FormControl>
    <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
  </Box>
</Box>

// Same code duplicated in AssetTrades.tsx
```

**Better (extracted reusable component):**
```typescript
// In PaginationControls.tsx
interface PaginationControlsProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
  itemLabel?: string; // e.g., "positions", "trades"
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  totalItems,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  loading,
  itemLabel = 'items',
}) => {
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
      <Typography variant="body2">
        Showing {startItem}-{endItem} of {totalItems} {itemLabel}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small">
          <InputLabel>Page Size</InputLabel>
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(e.target.value as number)}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
        <Pagination count={totalPages} page={currentPage} onChange={onPageChange} disabled={loading} />
      </Box>
    </Box>
  );
};

// Used in both PortfolioOverview and AssetTrades
<PaginationControls
  totalItems={totalItems}
  currentPage={currentPage}
  pageSize={pageSize}
  totalPages={totalPages}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  loading={loading}
  itemLabel="positions"
/>
```

**Bad (duplicated utility logic):**
```typescript
// In TableRow.tsx
const getGainLossColor = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'inherit';
  if (value > 0) return 'success.main';
  if (value < 0) return 'error.main';
  return 'inherit';
};

// Same logic duplicated in TradeTableRow.tsx as getProfitLossColor
```

**Better (extracted to shared utility):**
```typescript
// In utils/colorHelpers.ts
export function getGainLossColor(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'inherit';
  if (value > 0) return 'success.main';
  if (value < 0) return 'error.main';
  return 'inherit';
}

// Used in both TableRow and TradeTableRow
import { getGainLossColor } from '../../utils/colorHelpers';
```

**Guidelines for When to Extract:**
- Extract when the same code pattern appears in 2+ places.
- Extract when a component or function exceeds a single responsibility (e.g., a component that handles both data fetching and rendering).
- Extract when logic can be meaningfully tested in isolation.
- Extract when the abstraction improves readability and maintainability.
- Don't extract prematurely - if code is only used once and likely to stay that way, inline is acceptable.

**Enforcement:**
- Code reviews should flag duplicated code patterns and suggest extraction.
- Verify that common UI patterns (loading states, error states, pagination, tables) are extracted to reusable components.
- Check that shared business logic is extracted to custom hooks or utilities.
- Ensure extracted components/hooks have clear, descriptive names and well-defined interfaces.

## React-Specific Patterns

This section provides guidance on applying these principles within the React framework used by this project.

### Component Responsibilities

**Principle:** Components should be thin - they handle presentation and user interactions, while business logic and data fetching are delegated to custom hooks and services.

**Examples:**

**Bad:**
```typescript
const PortfolioOverview: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    DefaultService.getPortfolioAllGet()
      .then((response) => {
        setPositions(response.positions.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Complex business logic in component
  const totalValue = positions.reduce((sum, pos) => {
    return sum + (pos.market_value || 0);
  }, 0);

  return <div>{/* render */}</div>;
};
```

**Better:**
```typescript
const PortfolioOverview: React.FC = () => {
  const { positions, loading, totalMarketValue } = usePortfolio({
    page: currentPage,
    size: pageSize,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  return <div>{/* render using hook-provided data */}</div>;
};
```

### Hook Abstractions

**Principle:** Use custom hooks to encapsulate complex state logic, side effects, and data fetching. Hooks should abstract away implementation details and provide a clean interface.

**Examples:**

**Bad:**
```typescript
const MyComponent: React.FC = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  // Component cluttered with data fetching logic
};
```

**Better:**
```typescript
// In useData.ts
export function useData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, error, loading };
}

// In component
const MyComponent: React.FC = () => {
  const { data, error, loading } = useData();
  // Component focuses on rendering
};
```

### Context Usage (Dependency Injection)

**Principle:** Use React Context for dependency injection rather than global state or prop drilling. Context providers should encapsulate state and behavior, exposing them through custom hooks.

**Examples:**

**Bad:**
```typescript
// Global state
let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
}

// Used throughout app
const token = authToken; // Direct global access
```

**Better:**
```typescript
// In AuthProvider.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  // ... auth logic

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// In useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Used in components
const { token } = useAuth(); // Injected via context
```

### Error Handling

**Principle:** Use guard clauses and early returns in components and hooks. Handle errors explicitly with error states and Error Boundaries for unhandled errors.

**Examples:**

**Bad:**
```typescript
const MyComponent: React.FC<{ data?: Data }> = ({ data }) => {
  if (data) {
    if (data.items) {
      if (data.items.length > 0) {
        return <div>{/* render */}</div>;
      } else {
        return <div>No items</div>;
      }
    } else {
      return <div>Error: missing items</div>;
    }
  } else {
    return <div>Error: no data</div>;
  }
};
```

**Better:**
```typescript
const MyComponent: React.FC<{ data?: Data }> = ({ data }) => {
  if (!data) {
    return <ErrorMessage message="No data available" />;
  }

  if (!data.items) {
    return <ErrorMessage message="Invalid data structure" />;
  }

  if (data.items.length === 0) {
    return <EmptyState message="No items found" />;
  }

  return <div>{/* render items */}</div>;
};
```

**Better (in hooks with error state):**
```typescript
function usePortfolio(params?: PortfolioParams) {
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    try {
      const response = await getAllPositions(params);
      // handle success
    } catch (err) {
      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);
    }
  };

  return { positions, error, loading };
}
```

### Type Safety with TypeScript

**Principle:** Use TypeScript interfaces and types for all component props, hook return values, and function parameters. Define types in appropriate locations (component files, shared type files) rather than inline.

**Examples:**

**Bad:**
```typescript
const MyComponent: React.FC<{ data: any; onSave: (x: any) => void }> = ({ data, onSave }) => {
  // No type safety
};
```

**Better:**
```typescript
interface MyComponentProps {
  data: PortfolioData;
  onSave: (data: PortfolioData) => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ data, onSave }) => {
  // Full type safety
};
```

**Better (shared types):**
```typescript
// In types/portfolio.ts
export interface PortfolioData {
  positions: Position[];
  totalValue: number;
}

// In component
import type { PortfolioData } from '../../types/portfolio';

const MyComponent: React.FC<{ data: PortfolioData }> = ({ data }) => {
  // Uses shared type definition
};
```

## Integration with Specifications

All module specifications should reference this document and explicitly state how the module adheres to these principles:

- **Abstraction/Delegation:** Describe the interfaces and abstractions the module provides (e.g., custom hooks, service layer abstractions, component interfaces).
- **Control Flow:** Note any complex conditional logic and how it's been flattened or abstracted (e.g., guard clauses in components, early returns in functions).
- **Dependencies:** List all module-level imports and explain the module's dependencies. For components, describe props and context dependencies.
- **Type Safety:** Document any use of dynamic property access and justify why it's necessary, or describe the explicit TypeScript interfaces/types used instead.
- **Component Reuse:** Describe reusable components, hooks, or utilities provided by the module, or how the module uses shared components.
- **React Patterns:** For component modules, describe how components delegate to hooks, use context, and handle errors.

## Code Review Checklist

When reviewing code, verify:

- [ ] No more than 2 levels of nested conditionals
- [ ] Guard clauses are used to flatten control flow
- [ ] Complex logic is abstracted into functions or custom hooks
- [ ] All imports are at module level (no inline imports, except dynamic imports for code splitting)
- [ ] High-level components delegate to abstractions (hooks, services) rather than implementing details
- [ ] Dependencies are explicit and visible (props, context, imports)
- [ ] Dynamic property access (`hasOwnProperty`, `in` operator) is avoided unless absolutely necessary (with documented justification)
- [ ] Interfaces are defined using TypeScript interfaces/types rather than dynamic checks
- [ ] React Context is used for dependency injection rather than global state
- [ ] Components are thin and delegate business logic to hooks
- [ ] Custom hooks encapsulate stateful logic and side effects
- [ ] Error states are handled explicitly with guard clauses or error boundaries
- [ ] TypeScript types/interfaces are used for all props, function parameters, and return values
- [ ] Common UI patterns are extracted to reusable components
- [ ] Shared logic is extracted to custom hooks or utilities
- [ ] Code duplication is minimized through component/hook reuse

## Identified Improvement Opportunities

This section documents specific areas in the current codebase that could be improved to better adhere to these principles. These are opportunities for future refactoring work.

### Component Reuse Opportunities

#### 1. Pagination Controls Component

**Location:** `src/pages/PortfolioOverview/PortfolioOverview.tsx` (lines 287-313) and `src/pages/AssetTrades/AssetTrades.tsx` (lines 256-282)

**Issue:** The pagination UI (page info, page size selector, and pagination component) is duplicated between `PortfolioOverview` and `AssetTrades` pages with nearly identical code.

**Recommendation:** Extract to a reusable `PaginationControls` component in `src/components/PaginationControls/PaginationControls.tsx` with props:
- `totalItems: number`
- `currentPage: number`
- `pageSize: number`
- `totalPages: number`
- `onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void`
- `onPageSizeChange: (size: number) => void`
- `loading?: boolean`
- `itemLabel?: string` (e.g., "positions", "trades" for the label text)

**Principle Violated:** Principle 5 (Maximize Component Reuse)

#### 2. Color Utility Functions

**Location:** 
- `src/components/TableRow/TableRow.tsx` (line 24: `getGainLossColor`)
- `src/components/TradeTableRow/TradeTableRow.tsx` (line 11: `getProfitLossColor`, line 18: `getActionColor`)

**Issue:** Similar color utility functions are duplicated across components. `getGainLossColor` and `getProfitLossColor` have identical logic.

**Recommendation:** Extract color utilities to `src/utils/colorHelpers.ts`:
- `getGainLossColor(value: number | null | undefined): string` - for gain/loss values
- `getActionColor(action: string): string` - for buy/sell actions (if generalized)

**Principle Violated:** Principle 5 (Maximize Component Reuse)

#### 3. Table Page Layout Structure

**Location:** `src/pages/PortfolioOverview/PortfolioOverview.tsx` and `src/pages/AssetTrades/AssetTrades.tsx`

**Issue:** Both pages follow a similar structure: loading state check, error state check, table rendering, and pagination controls. The pattern is duplicated.

**Recommendation:** Consider creating a `TablePage` or `DataTablePage` wrapper component that handles the common loading/error/table/pagination pattern. However, this should be evaluated carefully - if the pages diverge significantly in the future, the abstraction may not be worth it.

**Principle Violated:** Principle 5 (Maximize Component Reuse) - tentative, needs evaluation

### Nested Conditional Improvements

#### 4. Error Handling Chain in Hooks

**Location:** 
- `src/hooks/usePortfolio.ts` (lines 56-71)
- `src/hooks/useAssetTrades.ts` (lines 51-68)

**Issue:** Error handling uses a chain of if-else statements that could be flattened with guard clauses and extracted to a utility function.

**Recommendation:** 
1. Extract error message extraction to `src/utils/errorHelpers.ts`:
   ```typescript
   export function extractErrorMessage(err: unknown): string {
     if (!err) {
       return 'An error occurred';
     }

     if (typeof err === 'object' && 'response' in err) {
       const httpError = err as { response?: { status?: number } };
       const status = httpError.response?.status;
       
       if (status === 401) return 'Authentication failed. Please login again.';
       if (status === 400) return 'Invalid request. Please check your parameters.';
       if (status === 404) return 'Resource not found.';
       if (status === 422) return 'Validation error. Please check your parameters.';
       if (status === 500) return 'Server error. Please try again.';
     }

     if (err instanceof Error) {
       if (err.message?.includes('Network Error') || 'code' in err && (err as { code?: string }).code === 'ERR_NETWORK') {
         return 'Network error. Please check your connection.';
       }
       return err.message;
     }

     return 'An error occurred';
   }
   ```
2. Use this utility in both hooks to replace the if-else chains.

**Principle Violated:** Principle 2 (Avoid Nested Conditionals)

### Abstraction Improvements

#### 5. Sorting State Management

**Location:** 
- `src/pages/PortfolioOverview/PortfolioOverview.tsx` (lines 34-35, 71-78, 113-118)
- `src/pages/AssetTrades/AssetTrades.tsx` (lines 34-35, 68-75, 111-116)

**Issue:** Sorting state management (sortBy, sortOrder, handleSort, getSortDirection) is duplicated between the two pages.

**Recommendation:** Extract to a custom hook `src/hooks/useTableSort.ts`:
```typescript
export function useTableSort<T extends string>(initialSort: T) {
  const [sortBy, setSortBy] = useState<T>(initialSort);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: T) => {
    const newSortOrder: 'asc' | 'desc' = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(column);
    setSortOrder(newSortOrder);
  };

  const getSortDirection = (column: T): 'asc' | 'desc' | false => {
    if (sortBy === column) {
      return sortOrder;
    }
    return false;
  };

  return { sortBy, sortOrder, handleSort, getSortDirection };
}
```

**Principle Violated:** Principle 1 (Build Abstractions), Principle 5 (Maximize Component Reuse)

#### 6. Redundant Authentication Checks

**Location:** 
- `src/pages/PortfolioOverview/PortfolioOverview.tsx` (lines 40-45, 109-111)
- `src/pages/AssetTrades/AssetTrades.tsx` (lines 40-45, 107-109)

**Issue:** Both pages check authentication and redirect, but they are already wrapped in `ProtectedRoute` (in `src/routes.tsx`) which handles authentication and redirection. The page-level checks are redundant.

**Recommendation:** Remove the authentication checks and redirect logic from the page components since `ProtectedRoute` already handles this. The `ProtectedLayout` component (used in routes) also checks authentication. Consider whether both `ProtectedRoute` and `ProtectedLayout` need authentication checks, or if this is redundant layering.

**Principle Violated:** Principle 1 (Build Abstractions) - unnecessary duplication of authentication logic

### Type Safety Improvements

#### 7. Error Type Handling

**Location:** 
- `src/hooks/usePortfolio.ts` (line 56: `catch (err: any)`)
- `src/hooks/useAssetTrades.ts` (line 51: `catch (err: any)`)
- `src/pages/Login/Login.tsx` (line 47: `catch (err: any)`)

**Issue:** Using `any` type for error handling bypasses TypeScript's type safety.

**Recommendation:** Use `unknown` type and implement proper type guards (as shown in the error handling improvement above). This aligns with Principle 4 (Avoid Dynamic Property Access).

**Principle Violated:** Principle 4 (Avoid Dynamic Property Access) - using `any` bypasses type safety

## References

- See `SPEC/spec.md` for module-level requirements and architecture details
- These principles apply to all code in the wpm-web (Wealth Portfolio Manager Web) project
