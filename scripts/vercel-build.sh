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
  npx tsx prisma/seed.ts
fi
npx next build
