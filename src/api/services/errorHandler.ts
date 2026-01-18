import { TOKEN_KEY, USER_KEY } from './authService';

export const SESSION_EXPIRED_FLAG = 'session_expired';
export const SESSION_EXPIRED_EVENT = 'session-expired';

/**
 * Handle 401 authentication errors by clearing tokens and setting session_expired flag
 * This is used because the OpenAPI client doesn't use the apiClient interceptor
 */
export function handle401Error(error: unknown): void {
  let status: number | undefined;
  
  // OpenAPI client errors have status directly on the error object
  if (error && typeof error === 'object' && 'status' in error) {
    const openApiError = error as { status?: number };
    status = openApiError.status;
  }
  // Axios errors have status in error.response.status
  else if (error && typeof error === 'object' && 'response' in error) {
    const httpError = error as { response?: { status?: number } };
    status = httpError.response?.status;
  }
  
  if (status === 401) {
    // Check if user was previously authenticated (had a token)
    const hadToken = !!localStorage.getItem(TOKEN_KEY);
    
    // Clear token on 401
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    // Set session_expired flag only if user was previously authenticated
    if (hadToken) {
      localStorage.setItem(SESSION_EXPIRED_FLAG, 'true');
      // Dispatch custom event to notify components immediately
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
  }
}
