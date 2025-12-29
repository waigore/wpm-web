import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../hooks/useAuth';
import logger from '../../utils/logger';

export const AppBar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (_event: React.MouseEvent<HTMLElement>) => {
    logger.debug('Hamburger menu clicked', { context: 'AppBar' });
    // Menu structure in place but empty for now
  };

  const handleLogoutClick = (_event: React.MouseEvent<HTMLElement>) => {
    logger.info('User logged out', { context: 'AppBar' });
    logout();
    navigate('/login');
  };

  return (
    <MuiAppBar position="static" color="primary" role="banner">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="Open navigation menu"
          onClick={handleMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          WPM
        </Typography>
        <Button
          color="inherit"
          onClick={handleLogoutClick}
          aria-label="Logout"
        >
          Logout
        </Button>
      </Toolbar>
    </MuiAppBar>
  );
};

