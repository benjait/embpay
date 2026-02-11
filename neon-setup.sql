-- Neon PostgreSQL Setup for EmbPay
-- Run this in Neon SQL Editor

-- Create tables with snake_case columns
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    business_name TEXT,
    stripe_account_id TEXT UNIQUE,
    stripe_connected BOOLEAN DEFAULT false,
    commission_rate FLOAT DEFAULT 0.03,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Product" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    currency TEXT DEFAULT 'usd',
    image_url TEXT,
    type TEXT DEFAULT 'one_time',
    interval TEXT,
    delivery_type TEXT DEFAULT 'none',
    delivery_url TEXT,
    delivery_instructions TEXT,
    active BOOLEAN DEFAULT true,
    bump_enabled BOOLEAN DEFAULT false,
    bump_product TEXT,
    bump_price FLOAT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Order" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    amount FLOAT NOT NULL,
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending',
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    stripe_payment_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_session_id TEXT UNIQUE,
    included_bump BOOLEAN DEFAULT false,
    platform_fee FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    product_id TEXT NOT NULL REFERENCES "Product"(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Coupon" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT UNIQUE NOT NULL,
    discount FLOAT NOT NULL,
    max_uses INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Plan" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    stripe_price_id TEXT,
    price FLOAT NOT NULL,
    interval TEXT DEFAULT 'month',
    features TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Subscription" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_email TEXT NOT NULL,
    stripe_subscription_id TEXT,
    status TEXT DEFAULT 'active',
    current_period_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    plan_id TEXT NOT NULL REFERENCES "Plan"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "WebhookLog" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    processed BOOLEAN DEFAULT false,
    error TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_user_id ON "Product"(user_id);
CREATE INDEX IF NOT EXISTS idx_order_user_id ON "Order"(user_id);
CREATE INDEX IF NOT EXISTS idx_order_product_id ON "Order"(product_id);
CREATE INDEX IF NOT EXISTS idx_coupon_user_id ON "Coupon"(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_user_id ON "Plan"(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plan_id ON "Subscription"(plan_id);

-- Enable Row Level Security (optional, can be added later)
-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'EmbPay tables created successfully!' as status;
