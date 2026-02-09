# EmbPay Deployment Guide

## Supabase Configuration (Ready ✅)

Database is configured and ready:
- **URL:** https://mtifgheijvznrrweznmo.supabase.co
- **Status:** Connected
- **Migration:** Ready to run on your hosting

## Deployment Steps

### 1. Upload to GitHub

```bash
cd ~/clawd/projects/embpay
git init
git add .
git commit -m "Initial commit - EmbPay with Supabase"
git remote add origin https://github.com/YOUR_USERNAME/embpay.git
git push -u origin main
```

### 2. Run Migration on Your Hosting

After uploading to your hosting, run:

```bash
npm install
npx prisma generate
npx prisma db push
```

This will create all tables in Supabase.

### 3. Environment Variables

Set these in your hosting platform:

```env
DATABASE_URL="postgresql://postgres:Benjait@100@db.mtifgheijvznrrweznmo.supabase.co:5432/postgres?sslmode=require"
NEXT_PUBLIC_SUPABASE_URL="https://mtifgheijvznrrweznmo.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10aWZnaGVpanZ6bnJyd2V6bm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjYzMDcsImV4cCI6MjA4NjI0MjMwN30.6tLL5ByLU6ymL3jFXdrPRIXOaq3wIgPzMsmfMypCsBc"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10aWZnaGVpanZ6bnJyd2V6bm1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY2NjMwNywiZXhwIjoyMDg2MjQyMzA3fQ.RYbxUyekJ-Jyr8RuaKY3nvN6o7U5DH8PWPo3g-6OEbk"
NEXTAUTH_SECRET="/QHe4Bfv+XIEZVxomVk0IQoGWt9HSFNo2my0IC5Qnh46BfafAWk+MDgfUmuvb1BL"
NEXTAUTH_URL="https://your-domain.com"
STRIPE_SECRET_KEY="sk_test_BQokikJOvBiI2HlWgH4olfQ2"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_TYooMQauvdEDq54NiTphI7jx"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
PLATFORM_URL="https://your-domain.com"
COMMISSION_RATE="0.03"
```

### 4. Build & Deploy

```bash
npm run build
npm start
```

### 5. Test

- Register new user
- Login
- Create product
- Test checkout

## Hosting Recommendations

1. **Vercel** (easiest, free)
2. **Railway** (good for fullstack)
3. **Render** (free tier available)
4. **Firebase** (GCP-based)

## Current Status

- ✅ Code ready
- ✅ Supabase configured
- ✅ Schema updated for PostgreSQL
- ✅ Supabase client created
- ⏳ Waiting for deployment

## Next Steps

1. Upload to GitHub
2. Connect to hosting
3. Run migration
4. Test!
