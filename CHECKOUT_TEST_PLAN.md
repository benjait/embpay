# EmbPay Checkout Test Plan

## Pre-requisites
- ✅ Dashboard working
- ✅ Authentication working
- ⚠️ Stripe keys (need real keys)

## Test Scenarios

### 1. Product Creation
- [ ] Login to dashboard
- [ ] Navigate to Products
- [ ] Create new product
  - Name: "Test Product"
  - Price: $10.00
  - Type: Digital
  - Active: Yes
- [ ] Verify product appears in list
- [ ] Copy product link

### 2. Checkout Flow (No Login Required)
- [ ] Open product link in incognito
- [ ] Fill customer info:
  - Name: "Test Customer"
  - Email: test@example.com
- [ ] Click "Continue to Payment"
- [ ] Enter test card: 4242 4242 4242 4242
- [ ] Expiry: 12/34, CVC: 123
- [ ] Submit payment
- [ ] Verify redirect to success page
- [ ] Check email for receipt

### 3. Order Management
- [ ] Login to dashboard
- [ ] Navigate to Orders
- [ ] Verify new order appears
- [ ] Check order details:
  - Status: completed
  - Amount: $10.00
  - Customer email matches

### 4. Coupon System
- [ ] Create coupon: "TEST10" - 10% off
- [ ] Open product checkout
- [ ] Apply coupon "TEST10"
- [ ] Verify discount applied
- [ ] Complete purchase
- [ ] Verify discounted amount in order

### 5. Order Bump
- [ ] Edit product, enable bump:
  - Bump product: "Extra Feature"
  - Bump price: $5.00
- [ ] Open checkout
- [ ] Check order bump checkbox
- [ ] Verify total = $15.00
- [ ] Complete purchase
- [ ] Verify bump included in order

### 6. Webhook Processing
- [ ] Complete a payment
- [ ] Check webhook logs
- [ ] Verify order status updated to "completed"
- [ ] Verify payment intent ID saved

### 7. Stripe Connect (Optional)
- [ ] Navigate to Settings
- [ ] Click "Connect Stripe"
- [ ] Complete Stripe onboarding
- [ ] Verify connected status
- [ ] Test payment with connected account
- [ ] Verify funds go to connected account

## Critical APIs to Test

### GET /api/products
```bash
curl https://embpay.vercel.app/api/products
```
Expected: List of products

### GET /api/products/[id]
```bash
curl https://embpay.vercel.app/api/products/PRODUCT_ID
```
Expected: Product details

### POST /api/stripe/payment-intent
```bash
curl -X POST https://embpay.vercel.app/api/stripe/payment-intent \
  -H "Content-Type: application/json" \
  -d '{"productId":"PRODUCT_ID","customerEmail":"test@test.com"}'
```
Expected: clientSecret for Stripe

### GET /api/orders
```bash
curl https://embpay.vercel.app/api/orders \
  -H "Cookie: sb-access-token=TOKEN"
```
Expected: List of orders (authenticated)

### POST /api/stripe/webhook
Stripe will call this automatically
Expected: Order status updates

## Error Scenarios to Test

- [ ] Invalid product ID
- [ ] Missing customer email
- [ ] Expired coupon
- [ ] Invalid payment card
- [ ] Network timeout
- [ ] Database error handling

## Performance Checks

- [ ] Checkout page loads < 2s
- [ ] Payment processing < 5s
- [ ] Dashboard loads < 2s
- [ ] Order list pagination works

## Security Checks

- [ ] Cannot access orders without login
- [ ] Cannot edit other users' products
- [ ] XSS protection on product name/description
- [ ] SQL injection protection
- [ ] Rate limiting on payment intents
