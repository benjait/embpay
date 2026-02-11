# Stripe Webhook Setup Guide

## Problem
Orders stay "pending" after payment because Stripe webhooks aren't configured.

## Solution

### Step 1: Create Webhook Endpoint in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Enter endpoint URL:
   ```
   https://embpay.vercel.app/api/stripe/webhook
   ```
4. Select events to listen for:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired`

5. Click **"Add endpoint"**

### Step 2: Get Webhook Signing Secret

After creating the endpoint, you'll see:
- Signing secret: `whsec_...`

Copy this value.

### Step 3: Add to Vercel Environment Variables

1. Go to: https://vercel.com/benjait/embpay/settings/environment-variables
2. Add new variable:
   - **Name:** `STRIPE_WEBHOOK_SECRET`
   - **Value:** `whsec_...` (paste the signing secret)
   - **Environment:** Production, Preview, Development

3. Click **"Save"**
4. **Redeploy** the application for changes to take effect

### Step 4: Test Webhook

Use Stripe CLI to test locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test event
stripe trigger payment_intent.succeeded
```

Or test in Dashboard:
1. Go to webhook endpoint settings
2. Click **"Send test webhook"**
3. Select `payment_intent.succeeded`
4. Check logs in Vercel

### Step 5: Verify

1. Create a test order on embpay.vercel.app
2. Complete payment
3. Check that order status changes from "pending" → "completed"
4. Check webhook logs in Stripe Dashboard

## Current Status

- ✅ Webhook route implemented: `/api/stripe/webhook`
- ✅ Event handlers: payment_intent, charge.refunded, checkout.session
- ✅ Webhook logging to database (WebhookLog table)
- ⚠️ Missing: `STRIPE_WEBHOOK_SECRET` environment variable
- ⚠️ Missing: Endpoint registration in Stripe Dashboard

## Security

The webhook route:
- ✅ Verifies Stripe signature
- ✅ Rejects requests without valid signature
- ✅ Logs all events to database
- ✅ Handles idempotency (prevents duplicate processing)

## Troubleshooting

**"Webhook not configured" error:**
- Add `STRIPE_WEBHOOK_SECRET` to Vercel env vars

**"Invalid signature" error:**
- Check that signing secret matches Stripe Dashboard
- Ensure webhook URL is correct

**Orders still pending:**
- Check webhook logs in Stripe Dashboard
- Check Vercel function logs
- Verify `payment_intent.succeeded` event is enabled
