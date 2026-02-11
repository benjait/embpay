# Stripe Connect OAuth Setup - Connect Existing Accounts

**Date:** 2026-02-11 15:29 UTC
**Issue:** Users can't connect their existing Stripe accounts (only forced to create new ones)
**Solution:** Implement OAuth flow for Standard Connect

---

## Problem

The current implementation uses `stripe.accounts.create()` which **always creates a new account**.

Users with existing Stripe accounts (e.g., from ThriveCart, Gumroad, etc.) should be able to **connect their existing account** instead.

---

## Solution: OAuth Flow

Stripe Standard Connect supports **OAuth authorization** which gives users 2 options:
1. ✅ **Sign in with existing Stripe account**
2. ✅ **Create new account**

---

## Implementation Changes

### 1. Updated `src/lib/stripe.ts`
Added `getConnectOAuthUrl()` function:
```typescript
export function getConnectOAuthUrl(userId: string, email: string): string {
  const clientId = process.env.STRIPE_CONNECT_CLIENT_ID || "";
  
  const params = new URLSearchParams({
    client_id: clientId,
    state: JSON.stringify({ userId, email }),
    scope: "read_write",
    redirect_uri: `${PLATFORM_URL}/api/stripe/callback`,
    "stripe_user[email]": email,
    "stripe_user[business_type]": "individual",
  });

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
}
```

### 2. Updated `src/app/api/stripe/connect/route.ts`
Changed from:
```typescript
const { accountId, onboardingUrl } = await createConnectAccount(user.id, user.email);
```

To:
```typescript
const oauthUrl = getConnectOAuthUrl(user.id, user.email);
return NextResponse.redirect(oauthUrl);
```

### 3. Updated `src/app/api/stripe/callback/route.ts`
Added OAuth callback handling:
```typescript
// Check if this is OAuth callback (has 'code' parameter)
const oauthCode = searchParams.get("code");
const stateParam = searchParams.get("state");

if (oauthCode && stateParam) {
  const state = JSON.parse(stateParam);
  const { userId, email } = state;
  
  // Exchange authorization code for access token
  const response = await stripe.oauth.token({
    grant_type: "authorization_code",
    code: oauthCode,
  });
  
  const accountId = response.stripe_user_id;
  
  // Save connected account
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeAccountId: accountId,
      stripeConnected: true,
    },
  });
  
  return NextResponse.redirect(
    `${PLATFORM_URL}/dashboard/settings?success=stripe_connected`
  );
}
```

---

## Required Stripe Configuration

### 1. Get Client ID

Go to Stripe Dashboard:
```
https://dashboard.stripe.com/settings/applications
```

1. Click **"New application"** (if not already created)
2. Application name: **EmbPay**
3. Copy **Client ID**: `ca_...`

### 2. Configure OAuth Settings

**Redirect URIs:**
```
https://embpay.vercel.app/api/stripe/callback
http://localhost:3000/api/stripe/callback (for testing)
```

**Permissions:**
- ✅ read_write

---

## Vercel Environment Variables

Add to Vercel:

```
STRIPE_CONNECT_CLIENT_ID=ca_XXXXXXXXXXXXXXXXXX
```

(Already configured):
```
STRIPE_SECRET_KEY=sk_test_51Szed5...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Szed5...
PLATFORM_URL=https://embpay.vercel.app
```

---

## User Experience

### Before (Forced New Account):
```
User → "Connect Stripe"
  → Stripe onboarding form
  → Must create NEW account
  → Can't use existing ThriveCart/Gumroad account ❌
```

### After (OAuth - User Choice):
```
User → "Connect Stripe"
  → OAuth screen with 2 options:
    ✅ "Sign in to connect existing account"
    ✅ "Create a new account"
  → User chooses
  → Authorized → Connected! ✅
```

---

## Benefits

1. **Flexibility:** Users can connect existing accounts
2. **Less friction:** Users with Stripe accounts don't need to create new ones
3. **Standard OAuth:** Industry standard practice
4. **Better UX:** Users see familiar Stripe login screen

---

## Testing

### Test Flow:
1. Go to Settings → "Connect Stripe"
2. Should see OAuth screen with:
   - "Sign in with existing Stripe account"
   - "Create new account"
3. Choose either option
4. Complete authorization
5. Redirect back → Settings shows "✓ Connected"

---

## Next Steps

1. ✅ Code updated
2. ⏳ Get `STRIPE_CONNECT_CLIENT_ID` from Stripe Dashboard
3. ⏳ Add to Vercel env vars
4. ⏳ Configure redirect URIs in Stripe
5. ⏳ Redeploy
6. ⏳ Test OAuth flow

---

## References

- [Stripe Connect OAuth](https://stripe.com/docs/connect/oauth-reference)
- [Standard Connect](https://stripe.com/docs/connect/standard-accounts)
