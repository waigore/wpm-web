import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box } from '@mui/material';
import logger from '../../utils/logger';
import { SESSION_EXPIRED_FLAG } from '../../api/services/errorHandler';

const COUNTDOWN_SECONDS = 5;

export const SessionExpired: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear session_expired flag from localStorage
    localStorage.removeItem(SESSION_EXPIRED_FLAG);
    
    // Log session expiration
    logger.info('Session expired, redirecting to login', { context: 'SessionExpired' });

    // Start countdown timer
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clear interval when countdown reaches 0
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Handle redirect when countdown reaches 0 (separate effect to avoid render warnings)
  useEffect(() => {
    if (countdown === 0) {
      logger.info('Redirecting to login page', { context: 'SessionExpired' });
      navigate('/login', { replace: true });
    }
  }, [countdown, navigate]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }} aria-label="Session expired notification">
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Session Expired
          </Typography>
          <Typography variant="body1" align="center" sx={{ mt: 2, mb: 4 }}>
            Your session has expired. Redirecting to login...
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography
              variant="h4"
              component="div"
              color="primary"
              aria-live="polite"
              aria-label={`Redirecting in ${countdown} seconds`}
            >
              {countdown}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
