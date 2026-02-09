# EmbPay — Architecture

## Overview
EmbPay is a SaaS payment platform (like ThriveCart/SamCart) that lets merchants:
1. Connect their Stripe account via Stripe Connect
2. Create digital products with prices
3. Get embeddable checkout links/iframes
4. Accept payments that go directly to their Stripe
5. Platform takes a commission (application_fee)

## Tech Stack
- **Next.js 16** (App Router, TypeScript)
- **Prisma** + **SQLite** (for MVP, easy to switch to PostgreSQL)
- **Stripe Connect** (Standard accounts)
- **NextAuth.js** (email/password auth)
- **Tailwind CSS** + **Lucide icons**

## Database Schema (Prisma)
See `prisma/schema.prisma`

## Directory Structure
```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── auth/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Register page
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout (sidebar)
│   │   ├── page.tsx                # Dashboard home (stats)
│   │   ├── products/
│   │   │   ├── page.tsx            # Products list
│   │   │   ├── new/page.tsx        # Create product
│   │   │   └── [id]/page.tsx       # Edit product
│   │   ├── orders/page.tsx         # Orders list
│   │   ├── settings/page.tsx       # Stripe connect + account
│   │   └── embed/page.tsx          # Get embed codes
│   ├── checkout/
│   │   └── [productId]/page.tsx    # Public checkout page
│   ├── embed/
│   │   └── [productId]/page.tsx    # Embeddable iframe checkout
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── stripe/
│       │   ├── connect/route.ts    # Stripe Connect OAuth
│       │   ├── callback/route.ts   # Stripe Connect callback
│       │   ├── checkout/route.ts   # Create checkout session
│       │   └── webhook/route.ts    # Stripe webhooks
│       ├── products/route.ts       # CRUD products
│       └── orders/route.ts         # Orders API
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   ├── landing/                    # Landing page components
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   ├── pricing.tsx
│   │   └── footer.tsx
│   ├── dashboard/                  # Dashboard components
│   │   ├── sidebar.tsx
│   │   ├── stats-cards.tsx
│   │   └── product-card.tsx
│   └── checkout/                   # Checkout components
│       ├── checkout-form.tsx
│       └── order-bump.tsx
└── lib/
    ├── prisma.ts                   # Prisma client
    ├── stripe.ts                   # Stripe config
    ├── auth.ts                     # Auth config
    └── utils.ts                    # Utility functions
```

## Stripe Connect Flow
1. Merchant clicks "Connect Stripe" in settings
2. Redirect to Stripe OAuth: `https://connect.stripe.com/oauth/authorize`
3. Stripe redirects back with `code`
4. Exchange code for `stripe_user_id` → save to DB
5. When customer pays, use `Stripe.checkout.sessions.create` with:
   - `payment_intent_data.application_fee_amount` (our commission)
   - `stripe_account` (merchant's connected account)

## Embeddable Checkout
- `/checkout/[productId]` — Full page checkout
- `/embed/[productId]` — Minimal iframe-friendly checkout
- Merchants get:
  - Direct link: `https://embpay.com/checkout/xxx`
  - iframe: `<iframe src="https://embpay.com/embed/xxx" />`
  - Buy button JS snippet

## Commission Model
- Platform takes 3% of each transaction as `application_fee`
- Configurable per merchant tier
