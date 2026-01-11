import type { Meta, StoryObj } from '@storybook/react';
import { ProtectedLayout } from './ProtectedLayout';
import { AuthProvider } from '../../context/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { Container, Typography, Paper } from '@mui/material';

const meta: Meta<typeof ProtectedLayout> = {
  title: 'Components/ProtectedLayout',
  component: ProtectedLayout,
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
type Story = StoryObj<typeof ProtectedLayout>;

export const Default: Story = {
  render: () => (
    <ProtectedLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Protected Content
          </Typography>
          <Typography>
            This is example content that would appear in a protected route, such as the Portfolio Overview page.
          </Typography>
        </Paper>
      </Container>
    </ProtectedLayout>
  ),
};

export const WithPortfolioContent: Story = {
  render: () => (
    <ProtectedLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Portfolio Overview
        </Typography>
        <Paper sx={{ p: 3 }}>
          <Typography>
            This demonstrates how the ProtectedLayout wraps protected page content with the AppBar at the top.
          </Typography>
        </Paper>
      </Container>
    </ProtectedLayout>
  ),
};













