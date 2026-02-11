# Email Notifications Setup

## Overview
EmbPay now supports automated email notifications for:
- ✅ Order confirmations (when payment succeeds)
- ✅ Refund notifications (when refund is processed)

## Provider: Resend

**Why Resend?**
- Free tier: 3,000 emails/month
- Simple API
- Great deliverability
- No credit card required for free tier

## Setup Instructions

### Step 1: Create Resend Account

1. Go to: https://resend.com/signup
2. Sign up with your email
3. Verify your email address

### Step 2: Get API Key

1. Go to: https://resend.com/api-keys
2. Click **"Create API Key"**
3. Name: `EmbPay Production`
4. Copy the API key (starts with `re_...`)

### Step 3: Add Domain (Optional but Recommended)

**Without domain:** Emails sent from `onboarding@resend.dev`  
**With domain:** Emails sent from `noreply@yourdomain.com`

To add domain:
1. Go to: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter your domain (e.g., `embpay.com`)
4. Add DNS records to your domain provider:
   - SPF record
   - DKIM record
5. Wait for verification (usually 5-10 minutes)

### Step 4: Configure Environment Variables

Add to Vercel (or `.env.local` for local dev):

```bash
# Resend API Key (required)
RESEND_API_KEY=re_...

# Email "From" address (optional, defaults to onboarding@resend.dev)
EMAIL_FROM=EmbPay <noreply@yourdomain.com>
```

**In Vercel:**
1. Go to: https://vercel.com/benjait/embpay/settings/environment-variables
2. Add `RESEND_API_KEY`
3. Add `EMAIL_FROM` (if using custom domain)
4. Redeploy

### Step 5: Test Emails

**Automatically triggered by:**
- Webhook: `payment_intent.succeeded` → Order confirmation
- Webhook: `charge.refunded` → Refund notification

**Manual test:**
```typescript
// In webhook or API route
import { sendOrderConfirmation } from '@/lib/email';

await sendOrderConfirmation({
  orderId: 'test_123',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  productName: 'Premium Course',
  amount: 97.00,
  date: new Date().toISOString(),
  downloadUrl: 'https://example.com/download/123',
});
```

## Email Templates

### Order Confirmation
- **Subject:** `Order Confirmation - {Product Name}`
- **Includes:**
  - Order details (ID, date, product, amount)
  - Download button (if product has downloadUrl)
  - Professional gradient header
  - Mobile-responsive design

### Refund Notification
- **Subject:** `Refund Processed - {Product Name}`
- **Includes:**
  - Refund amount
  - Order ID
  - Processing timeline (5-10 business days)
  - Green gradient header

## Email Logs

All email attempts are logged. Check:
1. Resend Dashboard: https://resend.com/logs
2. Vercel Function Logs (search for `[Email]`)

## Free Tier Limits

**Resend Free Tier:**
- 3,000 emails/month
- 100 emails/day
- All features included

**If you hit limits:**
- Upgrade to Pro: $20/month for 50,000 emails
- Or implement queue system to batch emails

## Current Status

- ✅ Email library created (`src/lib/email.ts`)
- ✅ Templates: Order confirmation + Refund notification
- ✅ Integrated with Stripe webhooks
- ✅ Resend package installed
- ⚠️ Need API key from Resend Dashboard
- ⚠️ Need to configure EMAIL_FROM (optional)

## Next Steps

1. **Get Resend API key** (5 min)
2. **Add to Vercel env vars** (2 min)
3. **Test with real order** (verify email delivery)
4. **Optional: Add custom domain** (better branding)
5. **Monitor email logs** (check deliverability)

## Advanced Features (Future)

- [ ] Invoice PDF generation
- [ ] Weekly sales report emails
- [ ] Abandoned cart emails
- [ ] Welcome email series
- [ ] Customer feedback requests
- [ ] Merchant notification emails (new order alerts)
