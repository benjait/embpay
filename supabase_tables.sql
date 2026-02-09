-- Create Product table
CREATE TABLE IF NOT EXISTS "Product" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  currency TEXT DEFAULT 'usd',
  imageUrl TEXT,
  type TEXT DEFAULT 'one_time',
  interval TEXT,
  deliveryType TEXT DEFAULT 'none',
  deliveryUrl TEXT,
  deliveryInstructions TEXT,
  active BOOLEAN DEFAULT true,
  bumpEnabled BOOLEAN DEFAULT false,
  bumpProduct TEXT,
  bumpPrice FLOAT,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),
  userId TEXT NOT NULL,
  CONSTRAINT fk_product_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Order table
CREATE TABLE IF NOT EXISTS "Order" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  amount FLOAT NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  customerEmail TEXT NOT NULL,
  customerName TEXT,
  stripePaymentId TEXT UNIQUE,
  stripePaymentIntentId TEXT UNIQUE,
  stripeSessionId TEXT UNIQUE,
  includedBump BOOLEAN DEFAULT false,
  platformFee FLOAT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),
  productId TEXT NOT NULL,
  userId TEXT NOT NULL,
  CONSTRAINT fk_order_product FOREIGN KEY (productId) REFERENCES "Product"(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Coupon table
CREATE TABLE IF NOT EXISTS "Coupon" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount FLOAT NOT NULL,
  maxUses INTEGER DEFAULT 0,
  usedCount INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expiresAt TIMESTAMP,
  userId TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_coupon_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Plan table
CREATE TABLE IF NOT EXISTS "Plan" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  stripePriceId TEXT,
  price FLOAT NOT NULL,
  interval TEXT DEFAULT 'month',
  features TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_plan_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  customerEmail TEXT NOT NULL,
  planId TEXT NOT NULL,
  stripeSubscriptionId TEXT,
  status TEXT DEFAULT 'active',
  currentPeriodEnd TIMESTAMP,
  createdAt TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_subscription_plan FOREIGN KEY (planId) REFERENCES "Plan"(id) ON DELETE CASCADE
);

-- Create WebhookLog table
CREATE TABLE IF NOT EXISTS "WebhookLog" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  eventId TEXT UNIQUE NOT NULL,
  eventType TEXT NOT NULL,
  payload TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  createdAt TIMESTAMP DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_user ON "Product"(userId);
CREATE INDEX IF NOT EXISTS idx_order_user ON "Order"(userId);
CREATE INDEX IF NOT EXISTS idx_order_product ON "Order"(productId);
CREATE INDEX IF NOT EXISTS idx_coupon_user ON "Coupon"(userId);
CREATE INDEX IF NOT EXISTS idx_plan_user ON "Plan"(userId);
CREATE INDEX IF NOT EXISTS idx_subscription_plan ON "Subscription"(planId);
