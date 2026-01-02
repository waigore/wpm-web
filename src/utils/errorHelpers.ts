/**
 * Extract a user-friendly error message from an unknown error object.
 * Uses guard clauses to handle different error types safely.
 *
 * @param err - The error object (can be any type, typically from catch blocks)
 * @param defaultMessage - Optional default message to use if error cannot be parsed
 * @returns A user-friendly error message string
 */
export function extractErrorMessage(err: unknown, defaultMessage: string = 'An error occurred'): string {
  if (!err) {
    return defaultMessage;
  }

  // Handle HTTP errors with response status
  if (typeof err === 'object' && 'response' in err) {
    const httpError = err as { response?: { status?: number } };
    const status = httpError.response?.status;

    if (status === 401) {
      return 'Authentication failed. Please login again.';
    }
    if (status === 400) {
      return 'Invalid request. Please check your parameters.';
    }
    if (status === 404) {
      return 'Resource not found.';
    }
    if (status === 422) {
      return 'Validation error. Please check your parameters.';
    }
    if (status === 500) {
      return 'Server error. Please try again.';
    }
  }

  // Handle network errors (check for Network Error message or ERR_NETWORK code)
  if (typeof err === 'object') {
    const errorObj = err as { message?: string; code?: string };
    
    if (errorObj.message?.includes('Network Error') || errorObj.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }

    // Handle Error instances with message
    if (err instanceof Error && err.message) {
      return err.message;
    }

    // Handle objects with message property
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
  }

  // Handle Error instances (fallback)
  if (err instanceof Error) {
    return err.message;
  }

  return defaultMessage;
}

