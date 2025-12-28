import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { useState } from 'react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number'],
    },
    error: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    label: 'Password',
    placeholder: 'Enter password',
    showPasswordToggle: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Username',
    error: true,
    helperText: 'Username is required',
    defaultValue: '',
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('John Doe');
    return (
      <Input
        label="Username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    );
  },
};

