# Vercel Environment Variables Update

## Critical Fix for Prisma Prepared Statement Error

The error `ERROR: prepared statement "s0" already exists` is caused by Supabase's Transaction Pooler not supporting prepared statements in pgBouncer transaction mode.

## Solution

Update the `DATABASE_URL` in Vercel environment variables:

### Current (broken):
```
postgresql://postgres.mtifgheijvznrrweznmo:Benjait%40100@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

### New (fixed):
```
postgresql://postgres.mtifgheijvznrrweznmo:Benjait%40100@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Also add:
```
DIRECT_URL=postgresql://postgres.mtifgheijvznrrweznmo:Benjait%40100@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
```

## How to Update on Vercel

1. Go to: https://vercel.com/[your-account]/embpay/settings/environment-variables
2. Edit `DATABASE_URL` → add `?pgbouncer=true&connection_limit=1` to the end
3. Add new variable `DIRECT_URL` with the direct connection URL (port 5432)
4. Click "Save"
5. Redeploy the project

## What this fixes:

- ✅ `/api/health` will work
- ✅ All database queries will work without prepared statement errors
- ✅ Prisma migrations will use DIRECT_URL (port 5432)
- ✅ App queries will use DATABASE_URL with pgBouncer compatibility (port 6543)

## Reference

https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pooling#pgbouncer
