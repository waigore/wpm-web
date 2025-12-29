import type { Meta, StoryObj } from '@storybook/react';
import { AppBar } from './AppBar';
import { AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof AppBar> = {
  title: 'Components/AppBar',
  component: AppBar,
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
type Story = StoryObj<typeof AppBar>;

export const Default: Story = {
  render: () => <AppBar />,
};

export const WithContent: Story = {
  render: () => (
    <div>
      <AppBar />
      <div style={{ padding: '20px' }}>
        <p>This is example content below the AppBar to demonstrate its appearance in context.</p>
      </div>
    </div>
  ),
};

