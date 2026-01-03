import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';

export interface BreadcrumbItem {
  label: string;
  path?: string; // If undefined, item is not clickable (current page)
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  // Guard clause: empty items array
  if (items.length === 0) {
    return null;
  }

  // Guard clause: single item (render as non-clickable current page)
  if (items.length === 1) {
    return (
      <MuiBreadcrumbs aria-label="Breadcrumb navigation">
        <Typography color="text.primary" aria-current="page">
          {items[0].label}
        </Typography>
      </MuiBreadcrumbs>
    );
  }

  return (
    <MuiBreadcrumbs aria-label="Breadcrumb navigation">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast || !item.path) {
            // Last item or item without path: render as non-clickable
            return (
              <Typography key={index} color="text.primary" aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </Typography>
            );
          }

          // Clickable breadcrumb item
          return (
            <Link key={index} to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
              {item.label}
            </Link>
          );
        })}
    </MuiBreadcrumbs>
  );
};

