import { DefaultService } from '../client/services/DefaultService';
import type { LoginRequest, LoginResponse } from '../client';
import { OpenAPI } from '../client/core/OpenAPI';

export const TOKEN_KEY = 'auth_token';
export const USER_KEY = 'auth_user';

/**
 * Login with username and password
 * @param username - Username
 * @param password - Password
 * @returns LoginResponse with access token
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  const request: LoginRequest = {
    username,
    password,
  };

  const response = await DefaultService.loginLoginPost(request);
  
  // Store token in localStorage and OpenAPI config
  if (response.access_token) {
    localStorage.setItem(TOKEN_KEY, response.access_token);
    localStorage.setItem(USER_KEY, username);
    OpenAPI.TOKEN = response.access_token;
  }

  return response;
}

/**
 * Logout - clear stored token
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  OpenAPI.TOKEN = undefined;
}

/**
 * Get stored authentication token
 * @returns Token string or null if not found
 */
export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    OpenAPI.TOKEN = token;
  }
  return token;
}

/**
 * Get stored username
 * @returns Username string or null if not found
 */
export function getUsername(): string | null {
  return localStorage.getItem(USER_KEY);
}

