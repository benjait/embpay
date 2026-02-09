-- ============================================================
-- Supabase Row Level Security (RLS) Policies for EmbPay
-- Run these in the Supabase SQL Editor after migration
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Products Table Policies
-- ============================================================

-- Users can only see their own products
CREATE POLICY "Users can only see own products"
ON products FOR SELECT
USING (user_id = auth.uid());

-- Users can only insert their own products
CREATE POLICY "Users can only insert own products"
ON products FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can only update their own products
CREATE POLICY "Users can only update own products"
ON products FOR UPDATE
USING (user_id = auth.uid());

-- Users can only delete their own products
CREATE POLICY "Users can only delete own products"
ON products FOR DELETE
USING (user_id = auth.uid());

-- Allow public read access to active products (for checkout pages)
CREATE POLICY "Public can view active products"
ON products FOR SELECT
USING (active = true);

-- ============================================================
-- Orders Table Policies
-- ============================================================

-- Users can only see orders for their products
CREATE POLICY "Users can only see orders for their products"
ON orders FOR SELECT
USING (user_id = auth.uid());

-- Users can only insert orders for their products
CREATE POLICY "Users can only insert orders for their products"
ON orders FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can only update orders for their products
CREATE POLICY "Users can only update orders for their products"
ON orders FOR UPDATE
USING (user_id = auth.uid());

-- ============================================================
-- Coupons Table Policies
-- ============================================================

-- Users can only see their own coupons
CREATE POLICY "Users can only see own coupons"
ON coupons FOR SELECT
USING (user_id = auth.uid());

-- Users can only insert their own coupons
CREATE POLICY "Users can only insert own coupons"
ON coupons FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can only update their own coupons
CREATE POLICY "Users can only update own coupons"
ON coupons FOR UPDATE
USING (user_id = auth.uid());

-- Users can only delete their own coupons
CREATE POLICY "Users can only delete own coupons"
ON coupons FOR DELETE
USING (user_id = auth.uid());

-- Allow public to validate coupons (for checkout)
CREATE POLICY "Public can validate active coupons"
ON coupons FOR SELECT
USING (active = true AND (expires_at IS NULL OR expires_at > now()));

-- ============================================================
-- Plans Table Policies
-- ============================================================

-- Users can only see their own plans
CREATE POLICY "Users can only see own plans"
ON plans FOR SELECT
USING (user_id = auth.uid());

-- Users can only insert their own plans
CREATE POLICY "Users can only insert own plans"
ON plans FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can only update their own plans
CREATE POLICY "Users can only update own plans"
ON plans FOR UPDATE
USING (user_id = auth.uid());

-- Users can only delete their own plans
CREATE POLICY "Users can only delete own plans"
ON plans FOR DELETE
USING (user_id = auth.uid());

-- ============================================================
-- Subscriptions Table Policies
-- ============================================================

-- Users can only see subscriptions for their plans
CREATE POLICY "Users can only see subscriptions for their plans"
ON subscriptions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM plans WHERE plans.id = subscriptions.plan_id AND plans.user_id = auth.uid()
));

-- Users can only insert subscriptions for their plans
CREATE POLICY "Users can only insert subscriptions for their plans"
ON subscriptions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM plans WHERE plans.id = subscriptions.plan_id AND plans.user_id = auth.uid()
));

-- Users can only update subscriptions for their plans
CREATE POLICY "Users can only update subscriptions for their plans"
ON subscriptions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM plans WHERE plans.id = subscriptions.plan_id AND plans.user_id = auth.uid()
));

-- ============================================================
-- Webhook Logs Table Policies
-- ============================================================

-- Only allow inserts (Stripe webhooks don't have a user context)
-- Read access restricted to service role
CREATE POLICY "Allow webhook inserts"
ON webhook_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only service role can view webhooks"
ON webhook_logs FOR SELECT
USING (false);

-- ============================================================
-- Service Role Bypass (for API routes)
-- ============================================================

-- Note: Service role key bypasses RLS by default
-- Use it in API routes when you need to access all data
