import { Navigate } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { PortfolioOverview } from './pages/PortfolioOverview/PortfolioOverview';
import { useAuth } from './hooks/useAuth';
import React from 'react';

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
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
    path: '/portfolio',
    element: (
      <ProtectedRoute>
        <PortfolioOverview />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: <Navigate to="/portfolio" replace />,
  },
];

