#!/usr/bin/env sh
# Vercel build: migrate + seed the database, then build Next.js.
# Accepts DATABASE_URL/DIRECT_URL or the variables created by Vercel's Supabase integration.
set -e
export DATABASE_URL="${DATABASE_URL:-${POSTGRES_PRISMA_URL:-$POSTGRES_URL}}"
export DIRECT_URL="${DIRECT_URL:-${POSTGRES_URL_NON_POOLING:-$DATABASE_URL}}"
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: no database configured. Set DATABASE_URL + DIRECT_URL, or add Supabase from the Vercel Marketplace." >&2
  exit 1
fi
npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed.ts
npx next build
