# WPM Web Application Specification

## Purpose

The WPM Web Application is a React-based single-page application that provides a user interface for the Wealth Portfolio Manager (WPM) Backend API. The application enables users to authenticate and view their portfolio positions in a sortable, tabular format. The application is built with TypeScript for type safety, uses Vite as the build tool, Material UI (MUI) for layout and component design, and integrates with the backend API through generated type-safe client code. The application supports both live API integration and a mock mode for development and testing purposes.

## Package Layout

```
wpm-web/
├── public/                      # Static assets (index.html, favicon, etc.)
├── src/
│   ├── api/                     # API client and service layer
│   │   ├── client/              # Generated OpenAPI client (from openapi-typescript-codegen)
│   │   ├── services/            # Service wrappers for API operations
│   │   │   ├── authService.ts   # Authentication service (login, token management)
│   │   │   └── portfolioService.ts  # Portfolio data fetching service
│   │   ├── types/               # Generated TypeScript types from OpenAPI spec
│   │   └── config.ts            # API configuration (base URL, auth setup)
│   ├── theme/                   # MUI theme configuration
│   │   └── theme.ts             # MUI theme customization (colors, typography, etc.)
│   ├── components/              # Reusable UI components (built on MUI)
│   │   ├── Button/              # Button component
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   │   ├── Input/               # Text input component
│   │   │   ├── Input.tsx
│   │   │   ├── Input.test.tsx
│   │   │   └── Input.stories.tsx
│   │   ├── Table/               # Sortable table component
│   │   │   ├── Table.tsx
│   │   │   ├── Table.test.tsx
│   │   │   └── Table.stories.tsx
│   │   ├── TableHeader/         # Table header with sorting
│   │   │   ├── TableHeader.tsx
│   │   │   ├── TableHeader.test.tsx
│   │   │   └── TableHeader.stories.tsx
│   │   ├── TableRow/            # Table row component
│   │   │   ├── TableRow.tsx
│   │   │   ├── TableRow.test.tsx
│   │   │   └── TableRow.stories.tsx
│   │   ├── LoadingSpinner/      # Loading indicator component
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── LoadingSpinner.test.tsx
│   │   │   └── LoadingSpinner.stories.tsx
│   │   └── ErrorMessage/        # Error display component
│   │       ├── ErrorMessage.tsx
│   │       ├── ErrorMessage.test.tsx
│   │       └── ErrorMessage.stories.tsx
│   ├── pages/                   # Page-level components
│   │   ├── Login/               # Login page
│   │   │   ├── Login.tsx
│   │   │   ├── Login.test.tsx
│   │   │   └── Login.stories.tsx
│   │   └── PortfolioOverview/   # Portfolio overview page
│   │       ├── PortfolioOverview.tsx
│   │       ├── PortfolioOverview.test.tsx
│   │       └── PortfolioOverview.stories.tsx
│   ├── context/                 # React context providers
│   │   ├── AuthContext.tsx      # Authentication context (user state, token)
│   │   └── AuthProvider.tsx     # Auth context provider component
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   └── usePortfolio.ts      # Portfolio data fetching hook
│   ├── utils/                   # Utility functions
│   │   ├── formatters.ts        # Data formatting utilities (currency, numbers)
│   │   ├── validators.ts        # Form validation utilities
│   │   └── logger.ts            # Logger configuration and helpers
│   ├── mocks/                   # Mock data and MSW handlers
│   │   ├── handlers.ts          # MSW request handlers for API endpoints
│   │   ├── data/                # Static mock data
│   │   │   ├── users.json       # Mock user credentials
│   │   │   └── portfolio.json   # Mock portfolio positions
│   │   └── server.ts            # MSW server setup and configuration
│   ├── App.tsx                  # Main app component with routing and MUI ThemeProvider
│   ├── main.tsx                 # Application entry point
│   ├── routes.tsx               # Route definitions
│   └── styles/                  # Global styles and CSS (minimal, MUI handles most styling)
│       └── global.css           # Global CSS overrides and custom styles
├── tests/                       # Integration and E2E test setup
│   └── setup.ts                 # Test configuration (MSW, testing library setup)
├── stories/                     # Storybook stories (auto-generated from components)
├── .storybook/                  # Storybook configuration
│   ├── main.ts                  # Storybook main config
│   └── preview.ts               # Storybook preview config
├── SPEC/                        # Specifications and OpenAPI
│   ├── openapi.json             # OpenAPI specification
│   ├── spec.md                  # This specification document
│   └── ui/                      # UI component specifications
│       ├── login.md             # Login page specification
│       └── portfolio-overview.md  # Portfolio overview page specification
├── vite.config.ts               # Vite build configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # npm dependencies and scripts
├── .env.example                 # Example environment variables
├── .env.local                   # Local environment variables (gitignored)
├── README.md                    # Project documentation
└── .gitignore                   # Git ignore rules
```

## Workflow

The development workflow follows a specification-driven approach:

1. **Specification Phase**: Create or update UI specifications in `SPEC/ui/` directory. Each specification (`login.md`, `portfolio-overview.md`) defines:
   - Layout structure and visual design
   - Component hierarchy and naming
   - User interactions and behaviors
   - API calls and data flow
   - Validation rules and error handling
   - Events and state management

2. **Mockup Phase**: Create Storybook stories for each component and page based on the specifications. Stories demonstrate:
   - Component visual appearance in different states (default, loading, error, etc.)
   - Interactive behaviors without API dependencies
   - Component composition and layout

3. **Implementation Phase**:
   - Generate TypeScript types and API client from OpenAPI spec using `openapi-typescript-codegen`
   - Implement components according to specifications, starting with base components and building up to pages
   - Integrate API services using generated client
   - Implement routing and authentication flow
   - Add error handling and loading states

4. **Testing Phase**:
   - Write unit tests for all components (target: 90% coverage)
   - Configure MSW for API mocking in tests
   - Test user interactions, form validations, and API integrations
   - Run tests as part of CI/CD pipeline

5. **Mock Mode Development**: Enable mock mode via environment variable to develop and test the frontend independently of the backend using MSW handlers.

## Module Requirements

### API Module (`src/api/`)

**Responsibilities:**
- Generate and maintain type-safe API client from OpenAPI specification
- Provide service abstractions for authentication and portfolio operations
- Manage authentication tokens (JWT) and API request configuration
- Handle API errors and transform responses

**Key Files:**
- `client/`: Generated OpenAPI client (auto-generated, not manually edited)
- `services/authService.ts`: Provides `login(username, password)` function returning `LoginResponse`. Stores JWT token in localStorage or memory. Exports `logout()` and `getToken()` functions.
- `services/portfolioService.ts`: Provides `getAllPositions(params?)` function that fetches paginated and sorted portfolio data. Accepts optional parameters: `{ page?: number, size?: number, sort_by?: string, sort_order?: 'asc' | 'desc' }`. Includes JWT token in Authorization header. Returns `Page_Position_` (paginated response with `items`, `total`, `page`, `size`, `pages`).
- `config.ts`: Configures API base URL from environment variables. Supports mock mode flag. Sets up default headers and interceptors.

**Artefacts:**
- TypeScript types for `LoginRequest`, `LoginResponse`, `Page_Position_`, `Position`, `HTTPValidationError`
- API client functions: `login_login_post()`, `get_all_positions_endpoint_portfolio_all_get(params?)`

### Components Module (`src/components/`)

**Responsibilities:**
- Provide reusable, testable UI components built on Material UI (MUI) foundation
- Wrap and customize MUI components to match application requirements
- Follow accessibility best practices (MUI components provide built-in accessibility)
- Support Storybook integration for visual testing

**Component Design Philosophy:**
- All components are built using Material UI as the base component library
- Custom components wrap MUI components (Button, TextField, Table, etc.) with application-specific styling and behavior
- MUI's ThemeProvider is used for consistent theming across the application
- MUI components are customized via props, sx prop, or theme overrides

**Key Components:**

1. **Button** (`components/Button/`): Wraps MUI `Button` component with application-specific variants and styling. Supports primary, secondary variants, sizes, disabled state, and loading state. Emits `onClick` event.

2. **Input** (`components/Input/`): Wraps MUI `TextField` component with label, placeholder, error state, and validation feedback. Supports password type via MUI InputAdornment. Emits `onChange` and `onBlur` events.

3. **Table** (`components/Table/`): Wraps MUI `Table` component family (`Table`, `TableContainer`, `TableHead`, `TableBody`, `TableRow`, `TableCell`). Provides consistent table layout and styling. Accepts `children` (header and rows).

4. **TableHeader** (`components/TableHeader/`): Wraps MUI `TableCell` with sorting functionality. Uses MUI `TableSortLabel` component for sort indicators (ascending/descending/none). Emits `onSort` event with column key and sort direction.

5. **TableRow** (`components/TableRow/`): Wraps MUI `TableRow` and `TableCell` components. Displays position data with proper MUI table cell styling. Accepts `Position` object and renders cells.

6. **LoadingSpinner** (`components/LoadingSpinner/`): Wraps MUI `CircularProgress` component. Visual loading indicator with configurable size using MUI sizing props.

7. **ErrorMessage** (`components/ErrorMessage/`): Uses MUI `Alert` or `Snackbar` component to display error messages with optional retry action. Accepts error message string and optional `onRetry` callback. Leverages MUI's alert severity system.

**Artefacts:**
- Component files (`.tsx`)
- Unit test files (`.test.tsx`)
- Storybook story files (`.stories.tsx`)

### Pages Module (`src/pages/`)

**Responsibilities:**
- Implement page-level UI screens
- Orchestrate component composition
- Handle page-specific state and API interactions
- Manage navigation and route protection

**Key Pages:**

1. **Login** (`pages/Login/`): Authentication page built with MUI components. Uses MUI `Container`, `Paper`, `TextField`, and `Button` components. Validates inputs (non-empty, min length). On submit, calls `authService.login()`. On success, stores token and navigates to portfolio overview. On error, displays error message using MUI `Alert`. Logs authentication attempts at INFO level.

2. **PortfolioOverview** (`pages/PortfolioOverview/`): Displays portfolio positions in sortable table using MUI `Table` components with server-side sorting and pagination. Uses MUI `Container`, `Typography`, `Paper`, `Table` component family, `Pagination`, and `Select` components. On mount, fetches data via `portfolioService.getAllPositions()` with default parameters (page=1, size=50, sort_by="ticker", sort_order="asc"). Implements server-side sorting by column (ticker, asset_type, quantity, cost_basis, market_value, unrealized_gain_loss) using MUI `TableSortLabel`. Implements server-side pagination with MUI `Pagination` component and page size selector. Shows loading state during fetch using MUI `CircularProgress`. Handles API errors with error message component (MUI `Alert`). Requires authentication (redirects to login if not authenticated). Logs portfolio fetch events at INFO level, component renders at DEBUG level.

**Artefacts:**
- Page component files (`.tsx`)
- Unit test files (`.test.tsx`)
- Storybook story files (`.stories.tsx`)

### Context Module (`src/context/`)

**Responsibilities:**
- Manage global application state (authentication)
- Provide authentication state to components
- Persist authentication state across page reloads

**Key Files:**
- `AuthContext.tsx`: Defines `AuthContext` with `{ user: string | null, token: string | null, login: (token: string, username: string) => void, logout: () => void }`
- `AuthProvider.tsx`: Provides context implementation. Initializes state from localStorage. Provides `login()` and `logout()` functions.

### Hooks Module (`src/hooks/`)

**Responsibilities:**
- Provide reusable logic for common operations
- Encapsulate API calls and state management

**Key Hooks:**
- `useAuth.ts`: Returns `{ user, token, login, logout, isAuthenticated }` from `AuthContext`
- `usePortfolio.ts`: Manages portfolio data fetching with pagination and sorting. Accepts parameters: `{ page, size, sort_by, sort_order }`. Returns `{ positions, totalItems, totalPages, currentPage, pageSize, loading, error, refetch }`. Handles loading and error states. Refetches on authentication change or parameter change.

### Utils Module (`src/utils/`)

**Responsibilities:**
- Provide pure utility functions
- Format data for display
- Validate user input

**Key Files:**
- `formatters.ts`: Functions for formatting currency (`formatCurrency(value: number): string`), numbers, percentages
- `validators.ts`: Functions for validating usernames, passwords (min length, required)
- `logger.ts`: Console-based logger with severity levels (INFO, DEBUG, WARN, ERROR). Exports logger instance for browser compatibility.

### Mocks Module (`src/mocks/`)

**Responsibilities:**
- Provide MSW handlers for API endpoints
- Define mock data for development and testing
- Enable mock mode operation

**Key Files:**
- `handlers.ts`: MSW request handlers for `/login` POST and `/portfolio/all` GET endpoints. Returns mock responses based on request data.
- `data/users.json`: Mock user credentials for testing
- `data/portfolio.json`: Mock portfolio positions data
- `server.ts`: Configures and exports MSW server instance. Conditionally starts based on environment variable.

### App Module (`src/`)

**Responsibilities:**
- Bootstrap the React application
- Configure routing and navigation
- Set up global providers (Auth, MSW)

**Key Files:**
- `App.tsx`: Main app component with React Router and MUI ThemeProvider. Wraps application with MUI `ThemeProvider` and `CssBaseline`. Defines routes: `/login` → Login page, `/portfolio` → PortfolioOverview (protected). Implements route guards for authentication.
- `main.tsx`: Application entry point. Renders App component. Conditionally starts MSW in mock mode.
- `routes.tsx`: Centralized route configuration and route guard logic.
- `theme/theme.ts`: MUI theme configuration with custom colors, typography, spacing, and component overrides. Exports theme object for use in ThemeProvider.

## UI Screens/Components

All UI screens and components must have detailed specifications in `SPEC/ui/` directory. Each specification follows this structure:

- **Component Name**: Name and purpose
- **Layout**: Visual structure and component hierarchy
- **Props/State**: Required props, optional props, internal state
- **Interactions**: User actions (clicks, inputs, etc.)
- **API Calls**: Endpoints called, request/response handling
- **Validations**: Input validation rules and error messages
- **Error Handling**: Error states and user feedback
- **Events**: Events emitted by component
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Login Page Specification

See `SPEC/ui/login.md` for detailed specification.

### Portfolio Overview Page Specification

See `SPEC/ui/portfolio-overview.md` for detailed specification.

## External Dependencies

### Core Framework
- `react` (^18.2.0): React library
- `react-dom` (^18.2.0): React DOM rendering
- `react-router-dom` (^6.20.0): Client-side routing

### UI Component Library
- `@mui/material` (^5.14.0): Material UI core component library
- `@mui/icons-material` (^5.14.0): Material UI icons
- `@emotion/react` (^11.11.0): Emotion library (required peer dependency for MUI)
- `@emotion/styled` (^11.11.0): Emotion styled components (required peer dependency for MUI)

### Build Tools
- `vite` (^5.0.0): Build tool and dev server
- `typescript` (^5.3.0): TypeScript compiler
- `@vitejs/plugin-react` (^4.2.0): Vite plugin for React

### API & Type Generation
- `openapi-typescript-codegen` (^0.25.0): Generate TypeScript client from OpenAPI spec
- `axios` (^1.6.0): HTTP client for API requests

### Testing
- `@testing-library/react` (^14.1.0): React component testing utilities
- `@testing-library/jest-dom` (^6.1.0): Jest DOM matchers
- `@testing-library/user-event` (^14.5.0): User interaction simulation
- `jest` (^29.7.0): Test runner
- `@types/jest` (^29.5.0): Jest TypeScript types
- `ts-jest` (^29.1.0): TypeScript preprocessor for Jest
- `msw` (^2.0.0): Mock Service Worker for API mocking
- `vitest` (^1.0.0): Alternative test runner (optional, can use Jest with Vite)

### Storybook
- `@storybook/react` (^7.6.0): Storybook for React
- `@storybook/react-vite` (^7.6.0): Storybook Vite integration
- `@storybook/addon-essentials` (^7.6.0): Essential Storybook addons
- `@storybook/addon-docs` (^7.6.0): Storybook documentation addon (for MUI component docs integration)

### Logging
- Console-based logging (browser-compatible, no external dependencies)

### Development
- `@types/react` (^18.2.0): React TypeScript types
- `@types/react-dom` (^18.2.0): React DOM TypeScript types
- `eslint`: Code linting (optional but recommended)
- `prettier`: Code formatting (optional but recommended)

## Testing

### Coverage Requirements
- **Target Coverage**: 90% code coverage for all UI screens and components
- **Coverage Tools**: Jest with coverage reporting (`--coverage` flag)
- **Coverage Metrics**: Statements, branches, functions, lines

### Test Types

1. **Unit Tests**: Test individual components in isolation
   - Component rendering
   - Props handling
   - Event handlers
   - Conditional rendering
   - Error states

2. **Integration Tests**: Test component interactions
   - Form submission flows
   - API service integration (with MSW)
   - Context provider integration
   - Routing and navigation

3. **MSW Mock Testing**: All API calls tested with MSW handlers
   - Mock successful responses
   - Mock error responses (400, 401, 500)
   - Mock network errors
   - Test error handling and retry logic

### Test Structure
- Tests co-located with components: `Component.test.tsx` in same directory
- Test setup in `tests/setup.ts`: Configure MSW, testing library, jest-dom matchers
- Mock data in `src/mocks/data/` for consistent test data

### Running Tests
- `npm test`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report
- `npm run test:ci`: Run tests once (for CI/CD)

## Logging and Observability

### Logging Framework
- **Library**: Console-based logger (browser-compatible)
- **Output**: Browser console (console.debug, console.info, console.warn, console.error)

### Log Severity Levels

1. **ERROR**: Application errors, API failures, unhandled exceptions
   - Failed API requests
   - Authentication failures
   - Unhandled errors in components

2. **WARN**: Warning conditions, recoverable errors
   - API rate limiting
   - Deprecated API usage
   - Validation warnings

3. **INFO**: Informational messages about application flow
   - Navigation events (page changes, route transitions)
   - API requests and successful responses (method, endpoint, status)
   - User authentication events (login, logout)
   - Significant state changes

4. **DEBUG**: Detailed diagnostic information
   - Component (re)renders with props/state
   - Hook executions
   - Internal state transitions
   - Performance timing information

### Log Format
- Structured logging with timestamps, severity, context (component/page), and message
- Format: `[TIMESTAMP] [LEVEL] [CONTEXT] MESSAGE`
- Include relevant metadata (user ID, request IDs, component props when at DEBUG level)

### Logging Points

**INFO Level:**
- User login/logout
- Navigation to/from pages
- API requests: `POST /login`, `GET /portfolio/all`
- API responses: Status codes, response times
- Route protection triggers (redirects)

**DEBUG Level:**
- Component mount/unmount
- Component re-renders (with changed props/state)
- Hook executions (useAuth, usePortfolio)
- State updates
- Event handler invocations

**ERROR/WARN Level:**
- API errors (network, 4xx, 5xx)
- Validation errors
- Authentication token expiration
- Unexpected errors in error boundaries

### Implementation
- Logger configured in `src/utils/logger.ts`
- Uses native browser console methods (console.debug, console.info, console.warn, console.error)
- Browser-compatible implementation (no Node.js dependencies)
- Export logger instance for use across application
- Log context should include component/page name for traceability
- Debug logs only appear in development mode

