import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '../src/mocks/server';

// Suppress React act() warnings from MUI components and other third-party libraries
// These warnings are harmless and come from internal state management in MUI components
const originalError = console.error;
const originalWarn = console.warn;

// Create a filter function for act() warnings
const shouldSuppressWarning = (message: unknown): boolean => {
  if (typeof message !== 'string') return false;
  
  // Check if it's an act() warning - be very broad to catch all variations
  const messageLower = message.toLowerCase();
  const isActWarning = 
    messageLower.includes('not wrapped in act') ||
    (messageLower.includes('an update to') && messageLower.includes('inside a test')) ||
    messageLower.includes('wrapped in act');
  
  // Suppress ALL act() warnings - they're harmless from MUI and test components
  return isActWarning;
};

beforeAll(() => {
  // Suppress act() warnings from console.error (React logs warnings here)
  // Check all arguments, not just the first one
  console.error = (...args: unknown[]) => {
    const shouldSuppress = args.some(arg => shouldSuppressWarning(arg));
    if (shouldSuppress) {
      return;
    }
    originalError.call(console, ...args);
  };

  // Suppress act() warnings from console.warn
  console.warn = (...args: unknown[]) => {
    const shouldSuppress = args.some(arg => shouldSuppressWarning(arg));
    if (shouldSuppress) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  // Start MSW server
  server.listen({ onUnhandledRequest: 'error' });
});

// Restore original methods after all tests
afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  server.close();
});

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

