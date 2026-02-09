# Supabase Migration Guide - EmbPay

## Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Sign in
3. Create new project:
   - Name: embpay
   - Database password: (generate strong one)
   - Region: US East (N. Virginia) - closest to your users

## Step 2: Get Connection Strings

After project creation:

1. Go to Project Settings → Database
2. Copy:
   - `DATABASE_URL` (Connection pooling - for app)
   - `DIRECT_URL` (Direct connection - for migrations)

Format:
```
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

## Step 3: Update .env

Add to `.env`:
```
# Database (Supabase)
DATABASE_URL="your_connection_pooler_url"
DIRECT_URL="your_direct_url"

# Supabase Auth (we'll add later)
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

## Step 4: Install Dependencies

```bash
cd ~/clawd/projects/embpay
npm install @supabase/supabase-js @supabase/ssr
npm uninstall next-auth  # Remove NextAuth
```

## Step 5: Run Migration

```bash
npx prisma migrate dev --name init_supabase
```

## Step 6: Set Up Auth

### Option A: Supabase Auth (Recommended)
Enable Auth in Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable Email provider
3. Enable Google OAuth (optional)
4. Configure Site URL: https://embpay.com

### Option B: Keep NextAuth with Supabase DB
Update `src/lib/auth.ts` to use Supabase adapter:
```bash
npm install @auth/prisma-adapter @auth/supabase-adapter
```

## Step 7: Update App Code

Replace NextAuth with Supabase Auth in:
- `src/app/api/auth/[...nextauth]/route.ts` → `/auth/callback/route.ts`
- `src/lib/auth.ts` → `src/lib/supabase.ts`
- All API routes to use Supabase RLS

## Security - Enable RLS

After migration, enable Row Level Security:

```sql
-- Users can only see own data
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only manage own products"
ON products FOR ALL
USING (user_id = auth.uid());

-- Same for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own orders"
ON orders FOR ALL
USING (user_id = auth.uid());
```

## Testing

1. Register new user
2. Create product
3. Verify in Supabase dashboard
4. Check RLS working (user A can't see user B data)

## Done! 🎉

Your app now has:
- ✅ PostgreSQL database
- ✅ Built-in auth
- ✅ Row Level Security
- ✅ Real-time subscriptions (optional)
