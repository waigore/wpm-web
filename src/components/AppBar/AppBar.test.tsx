import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppBar } from './AppBar';
import * as authService from '../../api/services/authService';
import logger from '../../utils/logger';

// Mock useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock logger
vi.mock('../../utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock authService
vi.mock('../../api/services/authService', () => ({
  logout: vi.fn(),
}));

import { useAuth } from '../../hooks/useAuth';

describe('AppBar', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: 'testuser',
      token: 'test-token',
      login: vi.fn(),
      logout: mockLogout,
      isAuthenticated: true,
    });
  });

  const renderAppBar = () => {
    return render(
      <BrowserRouter>
        <AppBar />
      </BrowserRouter>
    );
  };

  it('renders with all elements', () => {
    renderAppBar();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('WPM')).toBeInTheDocument();
    expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    expect(screen.getByLabelText('Logout')).toBeInTheDocument();
  });

  it('renders app name "WPM"', () => {
    renderAppBar();

    const appName = screen.getByText('WPM');
    expect(appName).toBeInTheDocument();
    expect(appName.tagName).toBe('DIV');
  });

  it('renders hamburger menu button', () => {
    renderAppBar();

    const menuButton = screen.getByLabelText('Open navigation menu');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton.tagName).toBe('BUTTON');
  });

  it('renders logout button', () => {
    renderAppBar();

    const logoutButton = screen.getByLabelText('Logout');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveTextContent('Logout');
  });

  it('calls logout when logout button is clicked', () => {
    renderAppBar();

    const logoutButton = screen.getByLabelText('Logout');
    logoutButton.click();

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('navigates to /login after logout', () => {
    renderAppBar();

    const logoutButton = screen.getByLabelText('Logout');
    logoutButton.click();

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('logs logout event at INFO level', () => {
    renderAppBar();

    const logoutButton = screen.getByLabelText('Logout');
    logoutButton.click();

    expect(logger.info).toHaveBeenCalledWith('User logged out', { context: 'AppBar' });
  });

  it('logs menu click at DEBUG level', () => {
    renderAppBar();

    const menuButton = screen.getByLabelText('Open navigation menu');
    menuButton.click();

    expect(logger.debug).toHaveBeenCalledWith('Hamburger menu clicked', { context: 'AppBar' });
  });

  it('has proper accessibility attributes', () => {
    renderAppBar();

    const appBar = screen.getByRole('banner');
    expect(appBar).toBeInTheDocument();

    const menuButton = screen.getByLabelText('Open navigation menu');
    expect(menuButton).toHaveAttribute('aria-label', 'Open navigation menu');

    const logoutButton = screen.getByLabelText('Logout');
    expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
  });
});







