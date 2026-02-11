# EmbPay Deployment Fix - Dashboard Stats 500 Error

## Problem
The `/api/dashboard/stats` endpoint was returning 500 "Database error occurred" while registration worked fine.

## Root Cause
**Schema Mismatch Between Prisma and Actual Database Tables**

The actual Supabase database (created via `supabase_tables.sql`) uses:
- **Table names:** PascalCase (`"User"`, `"Product"`, `"Order"`, etc.)
- **Column names:** camelCase (`userId`, `createdAt`, `customerEmail`, etc.)

But the Prisma schema was configured with:
- **Table names:** snake_case plural (`"users"`, `"products"`, `"orders"`)
- **Column names:** snake_case with `@map()` annotations (`user_id`, `created_at`, `customer_email`)

### Why Registration Worked
The registration endpoint (`/api/auth/register`) only uses **Supabase Auth API** directly - it doesn't query the database tables via Prisma.

### Why Stats Failed
The stats endpoint heavily uses Prisma queries:
```typescript
prisma.product.count({ where: { userId: user.id } })
prisma.order.findMany({ where: { userId: user.id } })
```

Prisma was looking for tables named `"products"` and `"orders"` (lowercase snake_case) but the actual tables are `"Product"` and `"Order"` (PascalCase), causing "Database error occurred".

## The Fix

### Updated `prisma/schema.prisma`

**Changed FROM:**
```prisma
model User {
  businessName String? @map("business_name")
  @@map("users")  // ❌ Wrong - table doesn't exist
}

model Product {
  imageUrl String? @map("image_url")
  @@map("products")  // ❌ Wrong - table doesn't exist
}
```

**Changed TO:**
```prisma
model User {
  businessName String?  // ✅ Matches database camelCase
  @@map("User")  // ✅ Matches actual table name
}

model Product {
  imageUrl String?  // ✅ Matches database camelCase
  @@map("Product")  // ✅ Matches actual table name
}
```

### All Tables Updated
- `@@map("User")` ← was `@@map("users")`
- `@@map("Product")` ← was `@@map("products")`
- `@@map("Order")` ← was `@@map("orders")`
- `@@map("Coupon")` ← was `@@map("coupons")`
- `@@map("Plan")` ← was `@@map("plans")`
- `@@map("Subscription")` ← was `@@map("subscriptions")`
- `@@map("WebhookLog")` ← was `@@map("webhook_logs")`

### All Columns Updated
Removed all `@map()` annotations for columns since the database uses camelCase natively:
- `businessName` ← was `businessName @map("business_name")`
- `createdAt` ← was `createdAt @map("created_at")`
- `userId` ← was `userId @map("user_id")`
- etc.

## Deployment Steps

1. ✅ **Fixed Prisma schema** (committed: `472b8d6`)
2. ✅ **Pushed to GitHub** (`main` branch)
3. ⏳ **Redeploy on Vercel** (user will do this)

### Vercel Will Automatically:
1. Pull latest code from GitHub
2. Run `npm install` → triggers `postinstall` script
3. Run `npx prisma generate` → generates correct Prisma Client
4. Build Next.js app with updated schema
5. Deploy to production

## Verification

After Vercel redeploys, test:

```bash
# Should now return stats instead of 500 error
curl https://embpay.vercel.app/api/dashboard/stats \
  -H "Cookie: <your-session-cookie>"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "totalRevenue": 0,
    "totalOrders": 0,
    "totalProducts": 0,
    "conversionRate": 0,
    "revenueChange": 0,
    "ordersChange": 0,
    "recentOrders": [],
    "chartData": [...]
  }
}
```

## Files Changed
- `prisma/schema.prisma` - Fixed table and column mappings

## Commit
- Hash: `472b8d6`
- Message: "Fix: Match Prisma schema to actual Supabase table structure"
- Branch: `main`

## Database Connection
Ensure Vercel environment variables are set:
```env
DATABASE_URL="postgresql://postgres:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
```

Using Supabase Transaction Pooler (port 6543) for optimal performance with serverless functions.

---

**Status:** ✅ Fix pushed to GitHub, ready for Vercel redeployment
