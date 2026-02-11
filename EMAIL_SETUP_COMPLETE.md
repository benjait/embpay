# Email Notification Setup Guide

Complete guide for setting up automated email notifications in EmbPay using Resend.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Resend account** (free tier: 3,000 emails/month, no credit card required)
- ✅ **Vercel project access** (to add environment variables)

---

## Step-by-Step Setup Guide

### 1. Create Resend Account

1. Navigate to [https://resend.com](https://resend.com)
2. Click **"Sign Up"** in the top-right corner
3. Enter your email and create a password
4. Check your inbox and verify your email address
5. Complete the onboarding process

![Resend Sign Up](screenshots/resend-signup.png)
*Screenshot placeholder: Resend homepage with sign-up form*

---

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **Dashboard → API Keys** in the left sidebar
3. Click **"Create API Key"**
4. Give it a descriptive name (e.g., "EmbPay Production")
5. Select permissions: **"Sending access"**
6. Click **"Create"**
7. **Copy the API key immediately** (starts with `re_`)
   - ⚠️ **Important:** You won't be able to see it again!

![Resend API Key Creation](screenshots/resend-api-key.png)
*Screenshot placeholder: Resend dashboard showing API key creation*

---

### 3. Add API Key to Vercel

1. Go to your [Vercel dashboard](https://vercel.com/dashboard)
2. Select the **EmbPay project**
3. Click **Settings** tab
4. Navigate to **Environment Variables** in the left sidebar
5. Click **"Add New"**
6. Enter the following:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_xxxxxxxxxxxxx` (paste your copied API key)
   - **Environment:** Select all (Production, Preview, Development)
7. Click **"Save"**
8. **Redeploy your application:**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Select **"Redeploy"**

![Vercel Environment Variables](screenshots/vercel-env-vars.png)
*Screenshot placeholder: Vercel environment variables configuration*

---

### 4. Verify Domain (Optional but Recommended)

Domain verification improves email deliverability and allows you to send from your own domain instead of `onboarding@resend.dev`.

#### 4.1 Add Domain to Resend

1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `embpay.com`)
4. Click **"Add"**

#### 4.2 Configure DNS Records

Resend will provide you with DNS records to add. You'll need to add these to your domain registrar or DNS provider:

- **TXT record** (for SPF)
- **MX records** (for bounce handling)
- **CNAME records** (for DKIM)

Example DNS records:
```
Type    Name                Value
TXT     @                   v=spf1 include:resend.net ~all
MX      @                   feedback-smtp.resend.net (priority: 10)
CNAME   resend._domainkey   resend._domainkey.resend.net
```

![DNS Configuration](screenshots/dns-records.png)
*Screenshot placeholder: DNS records provided by Resend*

#### 4.3 Wait for Verification

- DNS propagation can take 1-48 hours
- Check verification status in Resend dashboard
- You'll see a green checkmark when verified ✅

#### 4.4 Update Email Code (if using custom domain)

If you verified a custom domain, update the `from` email address in your code:

**File:** `src/lib/email.ts`

```typescript
// Change from:
from: 'EmbPay <onboarding@resend.dev>',

// To:
from: 'EmbPay <noreply@embpay.com>',
```

---

### 5. Test Email Functionality

#### 5.1 Make a Test Purchase

1. Visit your live site: [https://embpay.vercel.app](https://embpay.vercel.app)
2. Add a product to cart
3. Complete checkout with test card:
   - **Card:** `4242 4242 4242 4242`
   - **Expiry:** Any future date
   - **CVC:** Any 3 digits
   - **Email:** Use your real email address
4. Complete the purchase

#### 5.2 Verify Email Delivery

1. **Check your inbox** for the order confirmation email
2. **Check Resend dashboard:**
   - Go to **Emails** tab
   - View recent emails sent
   - Check delivery status, opens, clicks

![Resend Email Logs](screenshots/resend-logs.png)
*Screenshot placeholder: Resend dashboard showing email logs*

#### 5.3 Test Refund Email (Optional)

1. Go to Stripe Dashboard → Payments
2. Find your test payment
3. Click **"Refund"**
4. Check your email for refund notification

---

## Email Templates Included

EmbPay includes two automated email templates:

### 📧 Order Confirmation Email
- **Trigger:** Sent immediately when payment succeeds
- **Contains:**
  - Order number
  - Purchase details
  - Payment amount
  - Customer information
  - Download links (for digital products)
- **Template:** React Email component with responsive design

### 💰 Refund Notification Email
- **Trigger:** Sent when a refund is processed
- **Contains:**
  - Refund amount
  - Original order details
  - Refund reason (if provided)
  - Expected refund timeline

---

## Troubleshooting

### ❌ Emails Not Sending

**Problem:** Customers aren't receiving emails

**Solutions:**
1. **Check Vercel environment variable:**
   - Verify `RESEND_API_KEY` is set correctly
   - Ensure you redeployed after adding the variable
2. **Check Resend API key:**
   - Log in to Resend dashboard
   - Verify API key has "Sending access" permission
   - Try creating a new API key
3. **Check application logs:**
   - Vercel Dashboard → Functions → View logs
   - Look for errors related to email sending

### 📮 Emails Going to Spam

**Problem:** Emails are landing in spam folder

**Solutions:**
1. **Verify your domain** (see Step 4 above)
2. **Use a custom domain** instead of `onboarding@resend.dev`
3. **Avoid spam triggers:**
   - Don't use excessive caps or exclamation marks
   - Include a physical address in footer
   - Add an unsubscribe link (for marketing emails)

### ⚠️ Rate Limit Exceeded

**Problem:** Error: "Rate limit exceeded"

**Solutions:**
1. **Check your Resend plan:**
   - Free tier: 3,000 emails/month
   - Pro plan: 50,000 emails/month ($20/month)
2. **Upgrade your plan:**
   - Resend Dashboard → Billing
   - Choose appropriate plan
3. **Optimize sending:**
   - Don't send duplicate emails
   - Implement email batching for bulk operations

### 🔍 Email Sent but Not Received

**Problem:** Resend shows email as "delivered" but customer didn't receive it

**Solutions:**
1. **Check spam folder**
2. **Verify email address** is correct
3. **Check Resend logs** for bounce/complaint notifications
4. **Try a different email provider** (Gmail, Outlook, etc.)

---

## Code References

Understanding where email logic lives in the codebase:

### 📄 `src/lib/email.ts`
**Purpose:** Email service library with Resend integration

**Key functions:**
- `sendOrderConfirmation()` - Sends order confirmation emails
- `sendRefundNotification()` - Sends refund notification emails

**Configuration:**
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
```

### 📄 `src/app/api/stripe/webhook/route.ts`
**Purpose:** Stripe webhook handler that triggers email notifications

**Email triggers:**
- `checkout.session.completed` → Order confirmation
- `charge.refunded` → Refund notification

**Example:**
```typescript
case 'checkout.session.completed':
  await sendOrderConfirmation({
    to: customerEmail,
    orderNumber: session.id,
    amount: session.amount_total,
    // ...
  });
  break;
```

---

## Email Sending Limits

### Free Tier (Resend)
- **3,000 emails/month**
- **100 emails/day**
- **No credit card required**
- Perfect for small projects and testing

### Pro Tier (Resend)
- **50,000 emails/month** - $20/month
- **10,000 emails/day**
- Custom domains
- Priority support

### Enterprise (Resend)
- **Custom volume**
- Dedicated IP addresses
- SLA guarantees
- Contact Resend for pricing

---

## Security Best Practices

1. ✅ **Never commit API keys** to version control
2. ✅ **Use environment variables** for all sensitive data
3. ✅ **Rotate API keys** periodically (every 90 days recommended)
4. ✅ **Use separate keys** for development/staging/production
5. ✅ **Monitor usage** in Resend dashboard for unusual activity
6. ✅ **Enable domain verification** to prevent email spoofing

---

## Additional Resources

- 📚 [Resend Documentation](https://resend.com/docs)
- 📚 [React Email Components](https://react.email)
- 📚 [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- 📚 [Email Deliverability Best Practices](https://resend.com/docs/knowledge-base/deliverability)

---

## Support

**Questions or issues?**
- Check Resend documentation: https://resend.com/docs
- Resend community: https://resend.com/discord
- Email support: support@resend.com

---

**Last Updated:** February 2026  
**Version:** 1.0.0  
**Maintained by:** EmbPay Team
