import { defineConfig } from 'vitest/config';

/**
 * Local vitest config for @coforma/types.
 *
 * Without this file vitest walks up and picks the repo-root vitest.config.ts,
 * which does `import { defineConfig } from 'vitest/config'` from a directory
 * where vitest is not installed (it lives in the individual packages), so the
 * run dies with ERR_MODULE_NOT_FOUND before collecting anything. @coforma/web
 * carries the same workaround for the same reason.
 *
 * passWithNoTests: this package has no tests yet. An empty suite should report
 * "no tests", not fail the pipeline — and once a *.test.ts lands here it is
 * picked up automatically rather than needing the script wired back up.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    passWithNoTests: true,
  },
});
