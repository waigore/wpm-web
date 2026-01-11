import { Navigate } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import { PortfolioOverview } from './pages/PortfolioOverview/PortfolioOverview';
import { AssetTrades } from './pages/AssetTrades/AssetTrades';
import { AssetLots } from './pages/AssetLots/AssetLots';
import { PortfolioPerformance } from './pages/PortfolioPerformance';
import { ProtectedLayout } from './components/ProtectedLayout/ProtectedLayout';
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

