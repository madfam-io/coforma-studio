import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.spec.ts', 'test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        'test/',
        'prisma/',
      ],
    },
    // Every test file in this package shares ONE Postgres database, and
    // test/setup.ts truncates all tables in afterEach. Run files in parallel
    // and one worker's cleanup deletes rows another worker is still using,
    // which surfaces as spurious P2003 foreign-key failures. Serial execution
    // is what makes this suite deterministic.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
