import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...props
}) => {
  const muiVariant = variant === 'primary' ? 'contained' : 'outlined';
  const isDisabled = disabled || loading;

  return (
    <MuiButton
      variant={muiVariant}
      color={variant === 'primary' ? 'primary' : 'secondary'}
      disabled={isDisabled}
      {...props}
    >
      {loading && <CircularProgress size={16} sx={{ mr: 1 }} />}
      {children}
    </MuiButton>
  );
};

