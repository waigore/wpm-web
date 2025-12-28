import type { Meta, StoryObj } from '@storybook/react';
import { PortfolioOverview } from './PortfolioOverview';
import { AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof PortfolioOverview> = {
  title: 'Pages/PortfolioOverview',
  component: PortfolioOverview,
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
type Story = StoryObj<typeof PortfolioOverview>;

export const Default: Story = {};

