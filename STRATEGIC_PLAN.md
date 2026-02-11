# EmbPay Strategic Plan — The Full Architecture
**Date:** February 11, 2026  
**Author:** Lead Architect  
**Objective:** Transform EmbPay from a checkout tool into a complete digital commerce platform

---

## 🎯 Competitive Analysis

### What Exists Today

| Platform | Pricing | Key Strengths | Key Weaknesses |
|----------|---------|---------------|----------------|
| **ThriveCart** | $495-$690 one-time | Lifetime deal, funnels, affiliates | Old UI, slow updates, closed ecosystem |
| **SamCart** | $79-$319/month | Upsells, A/B testing, modern UI | Expensive ($2,388/yr!), Stripe+PayPal only |
| **Gumroad** | 10% per sale | Simple, creator-friendly | High fees, limited customization |
| **LemonSqueezy** | 5%+50¢ per sale | License keys, SaaS billing | High fees, merchant of record model |
| **Paddle** | 5%+50¢ per sale | Tax handling, global | Expensive, enterprise-focused |
| **WooCommerce** | Free + plugins | WordPress native, huge ecosystem | Complex, plugin hell, self-hosted |

### EmbPay's Unfair Advantages
1. **0% platform fee** — merchants keep 100% (only Stripe's 2.9%+30¢)
2. **Stripe Connect** — merchants use their own Stripe account
3. **Modern stack** — Next.js 15, serverless, fast
4. **Embeddable anywhere** — not locked to one platform
5. **Open pricing model** — no tier gates on features

### Where EmbPay Will Win
- **Price-conscious sellers** sick of paying $200+/month
- **WordPress users** who want something simpler than WooCommerce
- **Software developers** who need license key management
- **Course creators** who want embedded checkout on any site
- **Solopreneurs** who want ThriveCart features without $690 upfront

---

## 🏗️ Architecture: 3 Pillars

```
┌─────────────────────────────────────────────────────┐
│                    EMBPAY PLATFORM                    │
├─────────┬──────────────────┬────────────────────────┤
│ PILLAR 1│    PILLAR 2      │      PILLAR 3          │
│  Admin  │  Subscriptions   │   Embeddable Commerce  │
│  Panel  │  & License Keys  │   (WP Plugin + SDK)    │
├─────────┼──────────────────┼────────────────────────┤
│         │                  │                        │
│ ♛ Super │ 💳 Recurring     │ 🔌 WordPress Plugin    │
│   Admin │    Billing       │                        │
│         │                  │ 📦 JS SDK              │
│ 👥 User │ 🔑 License Key   │                        │
│  Mgmt   │    Generation    │ 🌐 REST API            │
│         │                  │                        │
│ 📊 Full │ 🔄 Dunning &     │ 📱 React Component     │
│  Metrics│    Retries       │                        │
│         │                  │ 🏪 Shopify App         │
│ 🔧 Sys  │ ✅ Activation    │    (Future)            │
│  Config │    Tracking      │                        │
│         │                  │                        │
└─────────┴──────────────────┴────────────────────────┘
          │                  │
          ▼                  ▼
    ┌──────────┐      ┌──────────┐
    │ Supabase │      │  Stripe  │
    │   DB     │      │ Connect  │
    └──────────┘      └──────────┘
```

---

## 📋 PILLAR 1: Admin Panel

### Purpose
Platform owner (Simo) sees EVERYTHING. Every user, every transaction, every product. Full control.

### Architecture Decision
**Separate route group: `/admin/*`** with super-admin auth check.  
NOT a separate app — same Next.js app, same deploy, separate auth layer.

### Database Changes
```prisma
// Add to User model
model User {
  // ... existing fields
  role            String   @default("merchant")  // "merchant" | "admin" | "superadmin"
}

// New: Platform metrics table
model PlatformMetric {
  id        String   @id @default(cuid())
  date      DateTime @unique
  totalGMV  Float    @default(0)     // Gross merchandise value
  totalFees Float    @default(0)     // Platform fees collected
  newUsers  Int      @default(0)
  newOrders Int      @default(0)
  activeUsers Int    @default(0)
}
```

### Admin Pages

| Page | What it does |
|------|-------------|
| `/admin` | Platform dashboard — GMV, users, orders, revenue chart |
| `/admin/users` | All users — search, filter, view details, suspend |
| `/admin/users/[id]` | User detail — their products, orders, Stripe status |
| `/admin/transactions` | ALL transactions across ALL merchants |
| `/admin/products` | ALL products — browse, flag, disable |
| `/admin/webhooks` | Webhook logs — debug failed deliveries |
| `/admin/settings` | Platform config — commission rates, features |
| `/admin/licenses` | All license keys — search, revoke, audit |

### Key Features
1. **Real-time dashboard** — GMV today/week/month/all-time
2. **User management** — activate, suspend, delete, impersonate
3. **Transaction search** — by email, amount, date, status
4. **Audit log** — every admin action logged
5. **Feature flags** — enable/disable features per user
6. **Email broadcast** — send announcements to all merchants

### Security
- Role-based access: `superadmin` > `admin` > `merchant`
- All admin routes check `user.role === 'superadmin'`
- Audit trail for every admin action
- IP whitelist option (optional)

---

## 📋 PILLAR 2: Subscriptions & License Keys

### The Big Question: Monthly vs One-Time?

**Answer: BOTH.** Let merchants choose per product.

```
Product Types:
├── one_time          → Single payment, instant delivery
├── subscription      → Monthly/yearly recurring (Stripe Billing)
├── one_time_license  → Single payment + license key
└── subscription_license → Recurring + license key (like JetBrains)
```

### Why License Keys?
- Software sellers NEED them (WordPress plugins, desktop apps, SaaS tools)
- LemonSqueezy charges 5% for this — we charge 0%
- Huge market: every WordPress plugin dev, every indie hacker

### License Key Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Customer   │────▶│   EmbPay API     │────▶│   Merchant   │
│   Software   │     │   /api/licenses/ │     │   Dashboard  │
│              │◀────│   verify         │     │              │
│   ✅ Valid   │     │   activate       │     │   Manage     │
│   ❌ Invalid │     │   deactivate     │     │   Keys       │
└──────────────┘     └──────────────────┘     └──────────────┘
```

### Database Schema

```prisma
model LicenseKey {
  id              String    @id @default(cuid())
  key             String    @unique  // EMBP-XXXX-XXXX-XXXX-XXXX
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  orderId         String
  order           Order     @relation(fields: [orderId], references: [id])
  userId          String    // Merchant who sold this
  
  // License configuration
  maxActivations  Int       @default(1)   // How many devices
  currentActivations Int    @default(0)
  
  // Status
  status          String    @default("active")  // active | expired | revoked | suspended
  expiresAt       DateTime?  // null = lifetime
  
  // Customer
  customerEmail   String
  customerName    String?
  
  // Metadata
  createdAt       DateTime  @default(now())
  lastVerifiedAt  DateTime?
  
  activations     LicenseActivation[]
  
  @@index([key])
  @@index([customerEmail])
  @@map("LicenseKey")
}

model LicenseActivation {
  id            String    @id @default(cuid())
  licenseId     String
  license       LicenseKey @relation(fields: [licenseId], references: [id])
  
  machineId     String    // Unique device identifier
  machineName   String?   // "John's MacBook Pro"
  ipAddress     String?
  activatedAt   DateTime  @default(now())
  lastSeenAt    DateTime  @default(now())
  isActive      Boolean   @default(true)
  
  @@unique([licenseId, machineId])
  @@map("LicenseActivation")
}
```

### License API Endpoints

```
POST   /api/licenses/verify     → Check if key is valid
POST   /api/licenses/activate   → Activate on device
POST   /api/licenses/deactivate → Remove from device
GET    /api/licenses/[key]      → Get license details (merchant only)
POST   /api/licenses/generate   → Generate key for order (internal)
```

### License Key Format
```
EMBP-A4K9-MN2C-9XH7-QP5W
```
- Prefix: `EMBP` (configurable per merchant)
- 4 groups of 4 alphanumeric chars
- Base32 encoding (no confusing chars: 0/O, 1/I/L)
- Checksum in last group for fast validation

### Verification Flow
```
Customer App → POST /api/licenses/verify
{
  "key": "EMBP-A4K9-MN2C-9XH7-QP5W",
  "machine_id": "hw_abc123",
  "product_id": "prod_xyz"
}

Response (valid):
{
  "valid": true,
  "license": {
    "status": "active",
    "expires_at": "2027-02-11",
    "activations": 1,
    "max_activations": 3,
    "product": "My WordPress Plugin",
    "customer": "john@example.com"
  }
}

Response (invalid):
{
  "valid": false,
  "error": "license_expired",
  "message": "This license expired on 2026-01-15"
}
```

### Subscription + Dunning (Failed Payments)

Stripe handles most of this, but we need:

1. **Webhook handlers for:**
   - `invoice.payment_succeeded` → Update subscription status
   - `invoice.payment_failed` → Start dunning flow
   - `customer.subscription.deleted` → Deactivate license
   - `customer.subscription.updated` → Update period

2. **Dunning flow (failed payments):**
   ```
   Day 0: Payment fails → Send email "Update payment method"
   Day 3: Retry #1 → Send reminder email
   Day 5: Retry #2 → Send warning email
   Day 7: Retry #3 → Final warning
   Day 14: Cancel subscription → Revoke license
   ```

3. **Grace period:** 7 days after expiry, license still works (with warning)

---

## 📋 PILLAR 3: WordPress Plugin & Embeddable Commerce

### Why WordPress First?
- **43% of ALL websites** run WordPress
- WooCommerce is powerful but COMPLEX
- Course creators (Simo's audience) use WordPress
- Plugin marketplace = free distribution

### WordPress Plugin Architecture

```
embpay-wp/
├── embpay.php                 # Main plugin file
├── includes/
│   ├── class-embpay-api.php   # API communication
│   ├── class-embpay-admin.php # WP Admin settings
│   ├── class-embpay-blocks.php # Gutenberg blocks
│   └── class-embpay-shortcodes.php
├── blocks/
│   ├── checkout-button/       # [embpay_button] block
│   ├── product-card/          # [embpay_product] block
│   └── pricing-table/         # [embpay_pricing] block
├── assets/
│   ├── css/embpay-frontend.css
│   ├── js/embpay-frontend.js
│   └── js/embpay-admin.js
└── readme.txt                 # WordPress.org listing
```

### Plugin Features

| Feature | Implementation |
|---------|---------------|
| **Checkout Button** | Shortcode `[embpay_button id="xxx"]` or Gutenberg block |
| **Product Card** | Full product display with image, price, buy button |
| **Pricing Table** | Compare multiple plans side-by-side |
| **Popup Checkout** | Lightbox checkout without leaving page |
| **Inline Embed** | Full checkout form embedded in page |
| **License Verification** | Verify license keys in WP admin |
| **Auto-Updates** | Plugin auto-updates from EmbPay server |

### Usage Examples

```php
// Shortcode: Simple button
[embpay_button product="clx12345" text="Buy Now" color="#6366f1"]

// Shortcode: Product card
[embpay_product id="clx12345"]

// Shortcode: Pricing table
[embpay_pricing products="clx11111,clx22222,clx33333"]

// PHP function
<?php embpay_checkout_button('clx12345', ['text' => 'Get Access']); ?>
```

### Gutenberg Block

```jsx
// Users drag-drop in WordPress editor
<EmbPayButton 
  productId="clx12345"
  text="Buy Now — $97"
  color="#6366f1"
  mode="popup"  // popup | redirect | embed
/>
```

### Beyond WordPress: Universal JS SDK

```html
<!-- Method 1: Script tag (already exists, enhance it) -->
<script 
  src="https://embpay.vercel.app/embed.js"
  data-product="clx12345"
  data-mode="popup"
  data-text="Buy Now">
</script>

<!-- Method 2: NPM package -->
<script type="module">
import { EmbPay } from 'https://embpay.vercel.app/sdk.js';

const embpay = new EmbPay({ merchantId: 'usr_xxx' });

// Open checkout popup
embpay.checkout('clx12345', {
  onSuccess: (order) => console.log('Paid!', order),
  onCancel: () => console.log('Cancelled'),
});

// Verify license
const result = await embpay.verifyLicense('EMBP-XXXX-XXXX-XXXX');
</script>

<!-- Method 3: React component -->
import { EmbPayButton } from '@embpay/react';

<EmbPayButton 
  productId="clx12345" 
  onSuccess={(order) => alert('Thanks!')} 
/>
```

### Platform Support Roadmap

| Platform | Method | Priority |
|----------|--------|----------|
| **WordPress** | Native plugin | 🔴 Phase 1 |
| **Any Website** | JS embed script | 🔴 Phase 1 (exists!) |
| **React/Next.js** | NPM package | 🟠 Phase 2 |
| **Shopify** | App / embed | 🟡 Phase 3 |
| **Wix** | Custom element | 🟡 Phase 3 |
| **Webflow** | Embed code | 🟢 Phase 1 (works with JS) |
| **Squarespace** | Code injection | 🟢 Phase 1 (works with JS) |
| **Ghost** | Code injection | 🟢 Phase 1 (works with JS) |

---

## 🗺️ Implementation Roadmap

### Phase 1: Foundation (Week 1-2) — BUILD FIRST
**Goal:** Admin panel + License system core

| Day | Task | Est. Hours |
|-----|------|-----------|
| 1 | Admin auth middleware + route protection | 3h |
| 2 | Admin dashboard page (GMV, users, orders metrics) | 4h |
| 3 | Admin users list + detail pages | 4h |
| 4 | Admin transactions + webhooks pages | 3h |
| 5 | License key schema + generation logic | 3h |
| 6 | License API: verify, activate, deactivate | 4h |
| 7 | License dashboard UI for merchants | 4h |
| 8 | Auto-generate license on purchase (webhook) | 2h |
| 9 | Subscription creation + Stripe Billing integration | 4h |
| 10 | Dunning emails + subscription lifecycle | 3h |

**Deliverable:** Working admin panel + license key system

### Phase 2: WordPress Plugin (Week 3)
**Goal:** Installable WP plugin

| Day | Task | Est. Hours |
|-----|------|-----------|
| 11 | WP plugin structure + admin settings page | 4h |
| 12 | Shortcodes: button, product card | 3h |
| 13 | Gutenberg blocks: checkout button | 4h |
| 14 | Popup checkout integration | 2h |
| 15 | License verification in WP admin | 2h |
| 16 | Testing + WordPress.org submission prep | 3h |

**Deliverable:** WordPress plugin ready for distribution

### Phase 3: Polish & Launch (Week 4)
**Goal:** Production-ready platform

| Day | Task | Est. Hours |
|-----|------|-----------|
| 17 | Enhanced JS SDK with events + callbacks | 3h |
| 18 | Landing page for EmbPay (marketing site) | 4h |
| 19 | Documentation site | 3h |
| 20 | Security audit + performance optimization | 3h |
| 21 | Beta testing + bug fixes | 4h |

**Deliverable:** Launch-ready platform

---

## 💰 Business Model Recommendation

### Pricing Strategy

**Option A: Freemium + Commission (Recommended)**
```
Free Plan:  $0/month — 0% commission — up to 10 products, 100 orders/month
Pro Plan:   $29/month — 0% commission — unlimited everything + license keys
Scale Plan: $79/month — 0% commission — API access + white-label + priority support
```

**Option B: ThriveCart Model (Lifetime)**
```
Lifetime:   $297 one-time — everything included forever
Pro:        $497 one-time — + license keys + API + priority support
```

**Option C: Hybrid (Best of Both)**
```
Monthly:    $19/month (cancel anytime)
Annual:     $149/year (save 35%)
Lifetime:   $397 one-time (limited offer)
```

### Revenue Projection (Conservative)
```
Month 1-3:  Free users only, build trust
Month 4-6:  Launch paid plans, target 50 paying users
Month 7-12: Growth → 200 paying users

At $29/month × 200 users = $5,800/month
At $397 lifetime × 50 one-time = $19,850 (first year)
```

---

## 🔐 Security Architecture

### Authentication Layers
```
Layer 1: Supabase Auth (email/password, OAuth)
Layer 2: Role-based access control (merchant/admin/superadmin)
Layer 3: API keys for SDK/plugin access
Layer 4: License key verification (for end-users)
```

### API Key System (for merchants)
```
// Merchant gets API key from dashboard
const API_KEY = 'embp_live_sk_xxxxx';

// Used in WP plugin settings
// Used in custom integrations
// Rate limited: 100 req/min
```

### Data Isolation
- Merchants can ONLY see their own data
- Admin can see ALL data (read + manage)
- Superadmin can modify platform settings
- API keys scoped to merchant context

---

## 📊 Database Schema Summary (New Tables)

```
Existing:                    New:
┌──────────────┐            ┌──────────────────┐
│ User         │            │ LicenseKey       │
│ Product      │            │ LicenseActivation│
│ Order        │            │ PlatformMetric   │
│ Coupon       │            │ AuditLog         │
│ Plan         │            │ ApiKey           │
│ Subscription │            │ FeatureFlag      │
│ WebhookLog   │            └──────────────────┘
└──────────────┘
```

---

## 🎯 Success Metrics

### Phase 1 KPIs
- [ ] Admin panel: can view ALL users, orders, revenue
- [ ] License keys: auto-generated on purchase
- [ ] License API: < 50ms response time
- [ ] 100% test coverage on license verification

### Phase 2 KPIs
- [ ] WP plugin: installs and activates without errors
- [ ] Shortcode renders checkout button correctly
- [ ] Popup checkout works cross-browser
- [ ] Plugin passes WordPress.org review guidelines

### Phase 3 KPIs
- [ ] < 200ms page load for checkout
- [ ] 99.9% uptime for license API
- [ ] 10+ beta users testing platform
- [ ] Documentation covers all features

---

## 🏆 Why EmbPay Will Win

1. **0% platform fee** while competitors charge 5-10%
2. **License keys included** (LemonSqueezy's main feature, but we're free)
3. **WordPress native** (not just an embed — a real plugin)
4. **Modern UI/UX** (ThriveCart looks like 2015)
5. **Stripe Connect** (merchants own their money)
6. **Embeddable everywhere** (not locked to one platform)
7. **Admin panel** for full platform visibility
8. **One platform** for one-time, subscriptions, AND licenses

---

## 📝 Decision Required

**Simo needs to decide:**

1. **Pricing model:** Freemium monthly, lifetime, or hybrid?
2. **Target market:** WordPress plugin devs? Course creators? Both?
3. **Brand:** Keep "EmbPay" or rebrand to "Payforma"?
4. **Domain:** Use `embpay.com` or new domain for Payforma?
5. **Launch timeline:** 2 weeks (MVP) or 4 weeks (polished)?

---

*This document is the blueprint. Every feature described is buildable with the current stack. No new infrastructure needed — just code.*

**Ready to build? Phase 1, Day 1 starts on your signal.** 🚀
