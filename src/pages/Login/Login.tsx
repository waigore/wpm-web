import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Alert } from '@mui/material';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { login } from '../../api/services/authService';
import { validateLoginForm } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import logger from '../../utils/logger';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    // Client-side validation
    const validationErrors = validateLoginForm(username, password);
    if (validationErrors.length > 0) {
      const firstError = validationErrors[0];
      setError(firstError.message);
      logger.debug('Login form validation failed', { context: 'Login', field: firstError.field });
      return;
    }

    setLoading(true);
    logger.info(`Login attempt for user: ${username}`, { context: 'Login' });

    try {
      const response = await login(username, password);
      
      if (response.access_token) {
        loginContext(response.access_token, username);
        logger.info(`Login successful for user: ${username}`, { context: 'Login' });
        navigate('/portfolio');
      } else {
        throw new Error('No access token received');
      }
    } catch (err: any) {
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err?.response?.status === 401) {
        errorMessage = 'Invalid username or password';
      } else if (err?.response?.status === 422) {
        errorMessage = 'Validation error. Please check your input.';
      } else if (err?.message?.includes('Network Error') || err?.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please try again.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      logger.error(`Login failed: ${errorMessage}`, { context: 'Login', error: err });
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (error) setError(null);
    logger.debug('Username changed', { context: 'Login' });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(null);
    logger.debug('Password changed', { context: 'Login' });
  };

  const usernameError = submitted && !username.trim();
  const passwordError = submitted && !password;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login
          </Typography>
          <Box component="form" onSubmit={handleSubmit} aria-label="Login form" sx={{ mt: 3 }}>
            <Input
              label="Username"
              value={username}
              onChange={handleUsernameChange}
              error={usernameError}
              helperText={usernameError ? 'Username is required' : ''}
              fullWidth
              margin="normal"
              aria-label="Username"
              aria-required="true"
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={passwordError}
              helperText={passwordError ? 'Password is required' : ''}
              fullWidth
              margin="normal"
              aria-label="Password"
              aria-required="true"
              autoComplete="current-password"
              showPasswordToggle
            />
            {error && (
              <Alert severity="error" role="alert" aria-live="polite" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
              sx={{ mt: 3, mb: 2 }}
              aria-label="Submit login form"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

