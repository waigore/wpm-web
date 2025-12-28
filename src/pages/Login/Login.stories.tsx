import type { Meta, StoryObj } from '@storybook/react';
import { Login } from './Login';
import { AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof Login> = {
  title: 'Pages/Login',
  component: Login,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <AuthProvider>
          <Story />
        </AuthProvider>
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Login>;

export const Default: Story = {};

export const WithValidationError: Story = {
  render: () => <Login />,
};

