import type { Meta, StoryObj } from '@storybook/react';
import { ErrorMessage } from './ErrorMessage';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Components/ErrorMessage',
  component: ErrorMessage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const Default: Story = {
  args: {
    message: 'An error occurred. Please try again.',
  },
};

export const WithRetry: Story = {
  args: {
    message: 'Failed to load data. Please try again.',
    onRetry: () => {
      console.log('Retry clicked');
    },
  },
};

export const Warning: Story = {
  args: {
    message: 'This is a warning message.',
    severity: 'warning',
  },
};

export const Info: Story = {
  args: {
    message: 'This is an informational message.',
    severity: 'info',
  },
};

