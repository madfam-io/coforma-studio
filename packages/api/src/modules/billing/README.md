# QUARANTINED — do not wire into AppModule

This module imports `@madfam/billing`, `@madfam/billing/nestjs` and
`@janua/client`. **None of these packages exist**: no repo in the org declares
`@madfam/billing` as its package name, and npm.madfam.io returns 404 for
`@janua/client`. The module was committed against an SDK that was never
published, which broke `tsc` for the whole package (7 of the baseline's 57
errors) and with it every CI run in this repo.

Quarantine (2026-08-06): removed from `AppModule`, excluded from
`tsconfig.json`. Restoring it means either publishing the imagined SDK or
porting to a real one — `@dhanam/billing-sdk` is the published billing SDK the
ecosystem actually uses (see forj). Tracked in the repo issue
"Billing module: port to a real SDK or retire".
