#!/bin/bash
# ============================================================
# Supabase Setup Script for EmbPay
# Run this after creating your Supabase project
# ============================================================

echo "🚀 EmbPay Supabase Setup Script"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your Supabase credentials before running this script again."
    echo ""
    echo "To get your credentials:"
    echo "1. Go to https://supabase.com and sign in"
    echo "2. Create a project named 'embpay'"
    echo "3. Go to Project Settings → API for the URL and keys"
    echo "4. Go to Project Settings → Database for the connection strings"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Check if required vars are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "https://your-project-ref.supabase.co" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not set in .env"
    echo "Please update .env with your actual Supabase credentials"
    exit 1
fi

if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"[password]"* ]]; then
    echo "❌ DATABASE_URL not properly set in .env"
    echo "Please update .env with your actual database connection string"
    exit 1
fi

echo "✅ Environment variables loaded"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install @supabase/supabase-js @supabase/ssr
echo "✅ Dependencies installed"
echo ""

# Run Prisma migration
echo "🔄 Running Prisma migration..."
npx prisma migrate dev --name init_supabase
echo "✅ Migration complete"
echo ""

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run the RLS policies in supabase_rls_policies.sql in your Supabase SQL Editor"
echo "2. Configure your site URL in Supabase:"
echo "   - Go to Authentication → URL Configuration"
echo "   - Set Site URL to: $PLATFORM_URL"
echo "   - Add $PLATFORM_URL/auth/callback to Redirect URLs"
echo "3. Start your development server: npm run dev"
echo ""
echo "📚 Supabase project URL: $NEXT_PUBLIC_SUPABASE_URL"
