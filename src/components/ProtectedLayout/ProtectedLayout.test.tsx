import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedLayout } from './ProtectedLayout';
import { AppBar } from '../AppBar/AppBar';

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock AppBar component
vi.mock('../AppBar/AppBar', () => ({
  AppBar: () => <div data-testid="app-bar">AppBar</div>,
}));

import { useAuth } from '../../hooks/useAuth';

describe('ProtectedLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProtectedLayout = (isAuthenticated: boolean) => {
    vi.mocked(useAuth).mockReturnValue({
      user: isAuthenticated ? 'testuser' : null,
      token: isAuthenticated ? 'test-token' : null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated,
    });

    return render(
      <BrowserRouter>
        <ProtectedLayout>
          <div data-testid="child-content">Child Content</div>
        </ProtectedLayout>
      </BrowserRouter>
    );
  };

  it('renders AppBar when user is authenticated', () => {
    renderProtectedLayout(true);

    expect(screen.getByTestId('app-bar')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    renderProtectedLayout(true);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('does not render AppBar when user is not authenticated', () => {
    renderProtectedLayout(false);

    expect(screen.queryByTestId('app-bar')).not.toBeInTheDocument();
  });

  it('does not render children when user is not authenticated', () => {
    renderProtectedLayout(false);

    expect(screen.queryByTestId('child-content')).not.toBeInTheDocument();
  });

  it('returns null when user is not authenticated', () => {
    const { container } = renderProtectedLayout(false);

    expect(container.firstChild).toBeNull();
  });
});







