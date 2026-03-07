import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.expo'],
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'shared/domain'),
      '@contracts': path.resolve(__dirname, 'shared/contracts'),
      '@constants': path.resolve(__dirname, 'shared/constants'),
      '@db': path.resolve(__dirname, 'shared/db'),
      '@studiogo/shared': path.resolve(__dirname, 'shared'),
    },
  },
});
