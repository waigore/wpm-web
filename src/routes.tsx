import { Navigate } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { PortfolioOverview } from './pages/PortfolioOverview/PortfolioOverview';
import { AssetTrades } from './pages/AssetTrades/AssetTrades';
import { AssetLots } from './pages/AssetLots/AssetLots';
import { PortfolioPerformance } from './pages/PortfolioPerformance';
import { SessionExpired } from './pages/SessionExpired';
import { ProtectedLayout } from './components/ProtectedLayout/ProtectedLayout';
import { useAuth } from './hooks/useAuth';
import React, { useState, useEffect } from 'react';
import { SESSION_EXPIRED_FLAG, SESSION_EXPIRED_EVENT } from './api/services/errorHandler';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(
    () => localStorage.getItem(SESSION_EXPIRED_FLAG) === 'true'
  );
  
  // Listen for session expired events (much more efficient than polling)
  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionExpired(true);
    };

    // Listen for custom event
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);

    // Also listen for storage events (works across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SESSION_EXPIRED_FLAG) {
        setSessionExpired(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  if (sessionExpired) {
    // Redirect to session expired page
    return <Navigate to="/session-expired" replace />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Public Route component (redirects to portfolio if already authenticated)
function PublicRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/portfolio" replace />;
}

export const routes = [
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/session-expired',
    element: (
      <PublicRoute>
        <SessionExpired />
      </PublicRoute>
    ),
  },
  {
    path: '/portfolio',
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <PortfolioOverview />
        </ProtectedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/portfolio/asset/:ticker',
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <AssetTrades />
        </ProtectedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/portfolio/lots/:ticker',
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <AssetLots />
        </ProtectedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/portfolio/performance',
    element: (
      <ProtectedRoute>
        <ProtectedLayout>
          <PortfolioPerformance />
        </ProtectedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/portfolio" replace />,
  },
];

