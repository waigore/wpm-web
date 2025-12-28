# WPM Web Application

A React-based single-page application for the Wealth Portfolio Manager (WPM) Backend API. This application provides a user interface for authentication and viewing portfolio positions in a sortable, tabular format.

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material UI (MUI)** - Component library
- **React Router** - Client-side routing
- **MSW (Mock Service Worker)** - API mocking for development and testing
- **Console-based Logging** - Browser-compatible structured logging
- **Vitest** - Testing framework
- **Storybook** - Component development and documentation

## Prerequisites

- Node.js 18+ and npm
- Backend API running (optional if using mock mode)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate API client from OpenAPI spec:**
   ```bash
   npm run generate:api
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` (if needed)
   - Set `VITE_API_BASE_URL` to your backend API URL (default: `http://localhost:8000`)
   - Set `VITE_USE_MOCK=true` to enable mock mode for development without backend

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview production build:**
   ```bash
   npm run preview
   ```

## Development Workflow

This project follows a specification-driven development workflow:

1. **Specification Phase** - UI specifications in `SPEC/ui/`
2. **Mockup Phase** - Storybook stories for components
3. **Implementation Phase** - Component and page implementation
4. **Testing Phase** - Unit tests with 90% coverage target

### Running Storybook

```bash
npm run storybook
```

Stories are available for all components and pages, demonstrating different states and interactions.

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage

# Run tests once (for CI/CD)
npm run test:ci
```

## Project Structure

```
wpm-web/
├── public/                 # Static assets
├── src/
│   ├── api/               # API client and services
│   │   ├── client/        # Generated OpenAPI client
│   │   ├── services/      # Service wrappers
│   │   └── config.ts      # API configuration
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-level components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── mocks/             # MSW handlers and mock data
│   ├── theme/             # MUI theme configuration
│   └── styles/            # Global styles
├── SPEC/                  # Specifications and OpenAPI
├── tests/                 # Test setup
└── .storybook/            # Storybook configuration
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:8000`)
- `VITE_USE_MOCK` - Enable mock mode (set to `true` to use MSW instead of real API)

## API Client Generation

The API client is generated from the OpenAPI specification located at `SPEC/openapi.json`. To regenerate:

```bash
npm run generate:api
```

**Note:** The generated client files in `src/api/client/` and `src/api/types/` are auto-generated and should not be manually edited.

## Features

- **Authentication** - JWT-based login with token management
- **Portfolio Overview** - View portfolio positions in a sortable table
- **Server-Side Sorting** - Sort by any column (ticker, asset type, quantity, prices, values, gains/losses)
- **Server-Side Pagination** - Navigate through pages with configurable page size
- **Mock Mode** - Develop and test without backend using MSW
- **Responsive Design** - Mobile-friendly UI using Material UI
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Error Handling** - Comprehensive error states with retry functionality
- **Logging** - Structured console-based logging (INFO, DEBUG, WARN, ERROR levels)

## Testing

- **Unit Tests** - Component tests using Vitest and React Testing Library
- **MSW Integration** - API mocking in tests
- **Coverage Target** - 90% code coverage
- **Test Structure** - Tests co-located with components (`*.test.tsx`)

## Logging

The application uses a console-based logger for structured logging (browser-compatible):

- **ERROR** - Application errors, API failures (console.error)
- **WARN** - Warning conditions, recoverable errors (console.warn)
- **INFO** - User actions, API requests, navigation events (console.info)
- **DEBUG** - Component renders, state changes, detailed diagnostics (console.debug, only in development)

Logs include timestamps, severity levels, context (component/page), and messages. The logger uses native browser console methods and only displays debug logs in development mode.

## License

See LICENSE file for details.

