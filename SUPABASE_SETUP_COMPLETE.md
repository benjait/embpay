# EmbPay Supabase Integration - Setup Complete ✅

This document summarizes the Supabase integration that has been set up for EmbPay.

## 📁 Files Created/Updated

### New Files
1. **`src/lib/supabase-server.ts`** - Server-side Supabase client (App Router compatible)
2. **`src/lib/supabase-client.ts`** - Browser/client-side Supabase client
3. **`src/lib/auth-supabase.ts`** - New Supabase Auth helpers
4. **`src/app/auth/callback/route.ts`** - OAuth callback handler
5. **`src/app/api/auth/logout/route.ts`** - Logout API endpoint
6. **`supabase_rls_policies.sql`** - Row Level Security policies
7. **`.env.example`** - Environment variables template
8. **`setup-supabase.sh`** - Automated setup script

### Updated Files
1. **`src/lib/supabase.ts`** - Updated with backward compatibility
2. **`src/lib/auth.ts`** - Migrated to use Supabase Auth (backward compatible)
3. **`src/middleware.ts`** - Updated to use @supabase/ssr
4. **`src/app/api/auth/login/route.ts`** - Now uses Supabase Auth
5. **`src/app/api/auth/register/route.ts`** - Now uses Supabase Auth
6. **`src/app/api/auth/me/route.ts`** - Updated for Supabase Auth
7. **`prisma/schema.prisma`** - Updated for PostgreSQL + Supabase Auth

## 🔧 What Was Done

### 1. Package Installation
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Auth System Migration
- Replaced custom JWT/bcrypt auth with **Supabase Auth**
- All existing API routes remain compatible via `getAuthUser()` in `src/lib/auth.ts`
- Auth state now managed by Supabase (sessions, cookies, etc.)

### 3. Database Schema Updates
- Schema updated to work with PostgreSQL
- User table now maps to Supabase Auth users by ID
- Added `onDelete: Cascade` for proper cleanup

### 4. Security (RLS)
Created comprehensive Row Level Security policies in `supabase_rls_policies.sql`:
- Users can only access their own data
- Public can view active products (for checkout)
- Public can validate coupons
- Service role for webhooks

## 🚀 Next Steps - Manual Setup Required

### Step 1: Create Supabase Account & Project

1. Go to **https://supabase.com**
2. Sign up / Sign in with your email
3. Create a new project:
   - **Name:** `embpay`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., US East)
   - Wait for project to be created (~2 minutes)

### Step 2: Get Credentials

From your Supabase Dashboard:

**Project Settings → API:**
```
Project URL: https://[project-ref].supabase.co
Anon Key:    eyJhbGciOiJIUzI1NiIs...
Service Role Key: eyJhbGciOiJIUzI1NiIs...
```

**Project Settings → Database → Connection String:**
```
DATABASE_URL (Pooler): postgresql://postgres:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true
DIRECT_URL (Direct):   postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Step 3: Configure .env

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
nano .env  # Edit with your credentials
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL="postgresql://postgres:[password]@aws-0-[region].pooler.supabase.com:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### Step 4: Run Setup Script

```bash
cd ~/clawd/projects/embpay
./setup-supabase.sh
```

This will:
- Install dependencies
- Run Prisma migrations
- Generate Prisma client

Or manually:
```bash
npx prisma migrate dev --name init_supabase
npx prisma generate
```

### Step 5: Configure Supabase Auth

In Supabase Dashboard:

1. **Authentication → URL Configuration:**
   - Site URL: `https://embpay.course.cheap` (or your domain)
   - Add to Redirect URLs:
     - `https://embpay.course.cheap/auth/callback`
     - `http://localhost:3000/auth/callback` (for dev)

2. **Authentication → Providers:**
   - Email provider is enabled by default
   - Configure Email templates (optional)
   - Enable Google OAuth if desired (optional)

### Step 6: Apply RLS Policies

1. Go to **SQL Editor** in Supabase Dashboard
2. Open `supabase_rls_policies.sql`
3. Run the SQL to create all policies

### Step 7: Test the Setup

```bash
npm run dev
```

Test the following:
1. Register a new user at `/register`
2. Login at `/login`
3. Access dashboard at `/dashboard`
4. Create a product
5. Verify data in Supabase Dashboard

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] `.env` file updated with real credentials
- [ ] Prisma migration completed successfully
- [ ] Supabase Auth configured with correct redirect URLs
- [ ] RLS policies applied in SQL Editor
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard is protected (requires auth)
- [ ] Products can be created
- [ ] User data is isolated (RLS working)

## 🔐 Security Notes

1. **Service Role Key** - Keep this secret! Never expose to client-side code.
2. **RLS Policies** - Ensure all policies are applied before going live.
3. **Site URL** - Must match your actual domain for auth callbacks.
4. **Database Password** - Save it securely, you may need it again.

## 🐛 Troubleshooting

### Migration fails
```bash
# Reset and retry
npx prisma migrate reset
npx prisma migrate dev --name init_supabase
```

### Auth not working
- Check `.env` credentials are correct
- Verify redirect URLs in Supabase Auth settings
- Check browser console for errors

### RLS blocking access
- Run the RLS SQL in Supabase SQL Editor
- Check policies are created in Database → Policies

## 📊 Supabase Project Details

| Setting | Value |
|---------|-------|
| Project Name | embpay |
| Database | PostgreSQL 15 |
| Auth Provider | Supabase Auth |
| RLS | Enabled |

---

**Ready to go live?** Make sure to:
1. Update Site URL to production domain
2. Add production domain to Redirect URLs
3. Verify all environment variables are set correctly
4. Run migrations on production database
