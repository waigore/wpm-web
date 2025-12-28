import React from 'react';
import { Alert, AlertProps, Button } from '@mui/material';

export interface ErrorMessageProps {
  message: string;
  severity?: AlertProps['severity'];
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  severity = 'error',
  onRetry,
}) => {
  return (
    <Alert
      severity={severity}
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        )
      }
    >
      {message}
    </Alert>
  );
};

