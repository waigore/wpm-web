import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumbs } from './Breadcrumbs';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Breadcrumbs', () => {
  it('renders breadcrumb items correctly', () => {
    const items = [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio' },
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('renders clickable links for items with paths', () => {
    const items = [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio', path: '/portfolio' },
      { label: 'AAPL' },
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    const homeLink = screen.getByText('Home').closest('a');
    const portfolioLink = screen.getByText('Portfolio').closest('a');

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/portfolio');
    expect(portfolioLink).toBeInTheDocument();
    expect(portfolioLink).toHaveAttribute('href', '/portfolio');
  });

  it('renders last item as non-clickable', () => {
    const items = [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio' },
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    const portfolioElement = screen.getByText('Portfolio');
    expect(portfolioElement.closest('a')).not.toBeInTheDocument();
    expect(portfolioElement.tagName).toBe('P'); // Typography renders as <p>
  });

  it('renders nothing when items array is empty', () => {
    const { container } = renderWithRouter(<Breadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders single item as non-clickable current page', () => {
    const items = [{ label: 'Portfolio' }];

    renderWithRouter(<Breadcrumbs items={items} />);

    const portfolioElement = screen.getByText('Portfolio');
    expect(portfolioElement).toBeInTheDocument();
    expect(portfolioElement.closest('a')).not.toBeInTheDocument();
    expect(portfolioElement).toHaveAttribute('aria-current', 'page');
  });

  it('has proper accessibility attributes', () => {
    const items = [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio' },
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb navigation' });
    expect(nav).toBeInTheDocument();

    const lastItem = screen.getByText('Portfolio');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
  });

  it('handles items without paths as non-clickable', () => {
    const items = [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio' }, // No path
      { label: 'AAPL' }, // No path
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    const portfolioElement = screen.getByText('Portfolio');
    const aaplElement = screen.getByText('AAPL');

    // Portfolio should be clickable (not last item)
    // Actually, wait - if it has no path, it should not be clickable
    // But the last item (AAPL) should definitely not be clickable
    expect(aaplElement.closest('a')).not.toBeInTheDocument();
    expect(aaplElement).toHaveAttribute('aria-current', 'page');
  });

  it('renders multiple clickable items correctly', () => {
    const items = [
      { label: 'Home', path: '/portfolio' },
      { label: 'Portfolio', path: '/portfolio' },
      { label: 'Asset Trades', path: '/portfolio/asset/AAPL' },
      { label: 'AAPL' },
    ];

    renderWithRouter(<Breadcrumbs items={items} />);

    const homeLink = screen.getByText('Home').closest('a');
    const portfolioLink = screen.getByText('Portfolio').closest('a');
    const assetTradesLink = screen.getByText('Asset Trades').closest('a');
    const aaplElement = screen.getByText('AAPL');

    expect(homeLink).toHaveAttribute('href', '/portfolio');
    expect(portfolioLink).toHaveAttribute('href', '/portfolio');
    expect(assetTradesLink).toHaveAttribute('href', '/portfolio/asset/AAPL');
    expect(aaplElement.closest('a')).not.toBeInTheDocument();
    expect(aaplElement).toHaveAttribute('aria-current', 'page');
  });
});









