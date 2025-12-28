import React from 'react';
import { TextField, TextFieldProps, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export interface InputProps extends Omit<TextFieldProps, 'variant'> {
  type?: 'text' | 'password' | 'email' | 'number';
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  showPasswordToggle = false,
  error,
  helperText,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPasswordToggle
    ? (showPassword ? 'text' : 'password')
    : type;

  const passwordToggle = type === 'password' && showPasswordToggle ? (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={handleClickShowPassword}
        edge="end"
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ) : undefined;

  return (
    <TextField
      type={inputType}
      variant="outlined"
      fullWidth
      error={error}
      helperText={helperText}
      InputProps={{
        endAdornment: passwordToggle,
      }}
      {...props}
    />
  );
};

