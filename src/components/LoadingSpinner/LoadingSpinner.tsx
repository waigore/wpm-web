import React from 'react';
import { CircularProgress, CircularProgressProps, Box } from '@mui/material';

export interface LoadingSpinnerProps extends CircularProgressProps {
  centered?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  centered = false,
  ...props
}) => {
  if (centered) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress {...props} />
      </Box>
    );
  }

  return <CircularProgress {...props} />;
};

