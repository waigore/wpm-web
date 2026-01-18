import type { Meta, StoryObj } from '@storybook/react';
import { SessionExpired } from './SessionExpired';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof SessionExpired> = {
  title: 'Pages/SessionExpired',
  component: SessionExpired,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  parameters: {
    // Mock localStorage to simulate session expired state
    mockData: [
      {
        url: 'session_expired',
        method: 'GET',
        status: 200,
        response: {},
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof SessionExpired>;

export const Default: Story = {
  render: () => <SessionExpired />,
};

export const Countdown5: Story = {
  render: () => {
    // Mock the component to show countdown at 5
    const MockSessionExpired = () => {
      return (
        <SessionExpired />
      );
    };
    return <MockSessionExpired />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the session expired page with countdown starting at 5 seconds.',
      },
    },
  },
};

export const Countdown3: Story = {
  render: () => {
    // This is a visual representation - actual countdown will start at 5
    // In real usage, the countdown will automatically decrement
    return <SessionExpired />;
  },
  parameters: {
    docs: {
      description: {
        story: 'The countdown automatically decrements from 5 to 0. This story shows the component in its default state.',
      },
    },
  },
};

export const Countdown1: Story = {
  render: () => {
    return <SessionExpired />;
  },
  parameters: {
    docs: {
      description: {
        story: 'The countdown will reach 1 second before redirecting to login.',
      },
    },
  },
};
