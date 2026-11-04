#!/usr/bin/env sh
# Vercel build.
# The database schema and seed are managed in Supabase (see CLAUDE.md → Database).
# The app connects as the least-privilege role `bilkoll_app`, which cannot run DDL,
# so migrations only run here when explicitly enabled with a privileged DIRECT_URL.
set -e
export DATABASE_URL="${DATABASE_URL:-${POSTGRES_PRISMA_URL:-$POSTGRES_URL}}"
export DIRECT_URL="${DIRECT_URL:-${POSTGRES_URL_NON_POOLING:-$DATABASE_URL}}"
npx prisma generate
if [ "$RUN_DB_MIGRATIONS" = "1" ]; then
  npx prisma migrate deploy
fi
# The seed only upserts reference data (services, workshops) by slug – safe to
# run on every deploy with the least-privilege app role, keeps the DB in sync with the repo.
if [ "$RUN_DB_SEED" = "1" ] || [ "$RUN_DB_MIGRATIONS" = "1" ]; then
  npx tsx prisma/seed.ts
fi
npx next build
