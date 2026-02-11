#!/bin/bash
PROJECT_ID="embpay"
NEW_DATABASE_URL="postgresql://postgres.mtifgheijvznrrweznmo:Benjait%40100@aws-1-eu-central-1.pooler.supabase.co:6432/postgres"

echo "Updating Vercel environment variable..."
vercel env rm DATABASE_URL production --yes 2>/dev/null || true
echo "$NEW_DATABASE_URL" | vercel env add DATABASE_URL production
echo "✅ DATABASE_URL updated to use Session Pooler (port 6432)"
