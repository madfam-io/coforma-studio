#!/usr/bin/env node

/**
 * Guard for `db:migrate:test`: migrating a DISPOSABLE test database.
 *
 * Why this exists instead of reusing `db:deploy`:
 *
 * `db:deploy` is the human-facing "deploy migrations to a real database" path
 * and is gated behind LOCAL_PRODUCTION_OPS=yes, deliberately. CI's test job
 * migrates an ephemeral Postgres service container that is created and thrown
 * away inside a single run — the one case where that gate is pure friction.
 * Setting LOCAL_PRODUCTION_OPS=yes in CI would "work", but it would also teach
 * everyone that the production guard is noise to be switched off, which is
 * exactly the habit the guard exists to prevent.
 *
 * So this path gets its own narrower guard: it refuses to run against anything
 * that is not visibly a test database. It is not a way around the production
 * gate — it cannot reach a production database at all.
 */

const url = process.env.DATABASE_URL;

if (!url) {
  console.error(
    '[guard] DATABASE_URL is not set. db:migrate:test targets a disposable test database.'
  );
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(url);
} catch {
  console.error('[guard] DATABASE_URL is not a valid URL.');
  process.exit(1);
}

// Database name is the path, minus the leading slash.
const databaseName = parsed.pathname.replace(/^\//, '');

if (!/test/i.test(databaseName)) {
  console.error(
    `[guard] Refusing to migrate database "${databaseName}": db:migrate:test only ` +
      'runs against a database whose name marks it as a test database (contains "test").\n' +
      '[guard] To deploy migrations to a real database, use db:deploy, which is ' +
      'gated behind LOCAL_PRODUCTION_OPS=yes.'
  );
  process.exit(1);
}
