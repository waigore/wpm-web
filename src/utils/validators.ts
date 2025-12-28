/**
 * Validation error message
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate username
 * @param username - Username to validate
 * @returns Error message if invalid, null if valid
 */
export function validateUsername(username: string): string | null {
  if (!username || username.trim().length === 0) {
    return 'Username is required';
  }
  if (username.length < 1) {
    return 'Username must be at least 1 character';
  }
  return null;
}

/**
 * Validate password
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password || password.length === 0) {
    return 'Password is required';
  }
  if (password.length < 1) {
    return 'Password must be at least 1 character';
  }
  return null;
}

/**
 * Validate login form
 * @param username - Username to validate
 * @param password - Password to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateLoginForm(username: string, password: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const usernameError = validateUsername(username);
  if (usernameError) {
    errors.push({ field: 'username', message: usernameError });
  }
  
  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }
  
  return errors;
}

