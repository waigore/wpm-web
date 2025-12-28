import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.stories.tsx',
        '**/*.test.{ts,tsx}',
        '**/*.config.*',
        'src/api/client/**',
        'src/main.tsx',
        'src/routes.tsx',
        'src/App.tsx',
        'src/vite-env.d.ts',
        'src/styles/**',
        'src/theme/**',
        'src/mocks/**',
        'src/utils/logger.ts',
        'src/api/config.ts',
        'src/context/AuthContext.tsx', // Just type definitions
      ],
      include: [
        'src/pages/**/*.{ts,tsx}',
        'src/hooks/**/*.{ts,tsx}',
        'src/components/**/*.{ts,tsx}',
        'src/api/services/**/*.{ts,tsx}',
        'src/context/AuthProvider.tsx',
        'src/utils/formatters.ts',
        'src/utils/validators.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

