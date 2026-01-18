import React, { useState, useEffect } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { getToken, getUsername, logout as authLogout, TOKEN_KEY, USER_KEY } from '../api/services/authService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state directly from localStorage to avoid async updates in useEffect
  const [user, setUser] = useState<string | null>(() => getUsername());
  const [token, setToken] = useState<string | null>(() => getToken());

  // Sync with localStorage changes (e.g., when token is cleared by 401 interceptor)
  // Use storage events instead of polling for better performance
  // Only sync on external changes, not on internal state updates
  useEffect(() => {
    const checkAuthState = () => {
      const storedToken = getToken();
      const storedUser = getUsername();
      
      // Use functional updates to access current state without dependencies
      setToken((currentToken) => {
        // If token was cleared from localStorage, update state
        if (!storedToken && currentToken) {
          setUser(() => null);
          return null;
        } else if (storedToken && storedToken !== currentToken) {
          // Token was updated externally
          setUser(() => storedUser);
          return storedToken;
        }
        return currentToken;
      });
      
      // Also check if user changed independently
      setUser((currentUser) => {
        if (storedUser && storedUser !== currentUser) {
          return storedUser;
        }
        return currentUser;
      });
    };

    // Listen for storage events (works across tabs and when localStorage is modified externally)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY || e.key === USER_KEY) {
        checkAuthState();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom session expired event (fired when 401 occurs)
    const handleSessionExpired = () => {
      checkAuthState();
    };
    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('session-expired', handleSessionExpired);
    };
    // Remove token and user from dependencies - we use functional updates instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (newToken: string, username: string) => {
    setToken(newToken);
    setUser(username);
  };

  const logout = () => {
    authLogout();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

