"""
EmbPay Webhook Handlers
Part 3 of EmbPay Build
"""

import json
import hmac
import hashlib
from fastapi import APIRouter, HTTPException, Request, Header
from fastapi.responses import JSONResponse

from ..database import db
from ..config import settings
import stripe

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# Stripe setup
stripe.api_key = settings.STRIPE_SECRET_KEY


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature")
):
    """
    Handle Stripe webhooks
    Events: payment_intent.succeeded, payment_intent.payment_failed
    """
    
    # Get raw body
    payload = await request.body()
    
    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload,
            stripe_signature,
            settings.STRIPE_WEBHOOK_SECRET
        )
        
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle events
    if event['type'] == 'checkout.session.completed':
        await handle_checkout_completed(event['data']['object'])
    elif event['type'] == 'payment_intent.succeeded':
        await handle_payment_success(event['data']['object'])
    elif event['type'] == 'payment_intent.payment_failed':
        await handle_payment_failed(event['data']['object'])
    
    return JSONResponse({"status": "ok"})


async def handle_checkout_completed(stripe_session: dict):
    """Handle Stripe Checkout Session completed"""
    
    # Get session from metadata
    session_id = stripe_session.get('metadata', {}).get('embpay_session')
    merchant_id = stripe_session.get('metadata', {}).get('embpay_merchant')
    
    if not session_id:
        print("No EmbPay session in Stripe session")
        return
    
    # Check if already processed
    existing_order = await db.orders.find_one({"session_id": session_id})
    if existing_order:
        print(f"Order already exists for session {session_id}")
        return
    
    # Get session data
    session = await db.checkout_sessions.find_one({"session_id": session_id})
    if not session:
        print(f"Session {session_id} not found")
        return
    
    # Update session status
    await db.checkout_sessions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "status": "completed",
                "stripe_session_id": stripe_session['id'],
                "stripe_payment_intent_id": stripe_session.get('payment_intent'),
                "customer_email": stripe_session.get('customer_email'),
                "completed_at": stripe_session.get('created')
            }
        }
    )
    
    # Create order
    order_id = f"ord_{session_id.split('_')[1]}"
    amount = session['price']
    platform_fee = amount * settings.PLATFORM_FEE_PERCENT / 100
    
    order = {
        "order_id": order_id,
        "session_id": session_id,
        "merchant_id": merchant_id,
        "product_id": session['product_id'],
        "product_name": session['product_name'],
        "amount": amount,
        "currency": session['currency'],
        "platform_fee": platform_fee,
        "net_amount": amount - platform_fee,
        "stripe_fee": (amount * 0.029) + 0.30,
        "customer_email": stripe_session.get('customer_email'),
        "stripe_session_id": stripe_session['id'],
        "status": "completed",
        "created_at": stripe_session.get('created')
    }
    
    await db.orders.insert_one(order)
    
    # Send webhook to merchant
    await notify_merchant(merchant_id, {
        "event": "payment.success",
        "order_id": order_id,
        "session_id": session_id,
        "product_id": session['product_id'],
        "product_name": session['product_name'],
        "amount": amount,
        "currency": session['currency'],
        "customer_email": stripe_session.get('customer_email'),
        "timestamp": stripe_session.get('created')
    })


async def handle_payment_success(payment_intent: dict):
    """Handle successful payment"""
    
    # Get session from metadata
    session_id = payment_intent.get('metadata', {}).get('embpay_session')
    merchant_id = payment_intent.get('metadata', {}).get('embpay_merchant')
    
    if not session_id:
        print("No EmbPay session in payment intent")
        return
    
    # Check if already processed by checkout.session.completed
    existing_order = await db.orders.find_one({"session_id": session_id})
    if existing_order:
        return
    
    # Update session status
    await db.checkout_sessions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "status": "completed",
                "stripe_payment_intent_id": payment_intent['id'],
                "customer_email": payment_intent.get('receipt_email'),
                "completed_at": payment_intent['created']
            }
        }
    )
    
    # Get session data
    session = await db.checkout_sessions.find_one({"session_id": session_id})
    if not session:
        return
    
    # Create order
    order_id = f"ord_{session_id.split('_')[1]}"
    amount = session['price']
    platform_fee = amount * settings.PLATFORM_FEE_PERCENT / 100
    
    order = {
        "order_id": order_id,
        "session_id": session_id,
        "merchant_id": merchant_id,
        "product_id": session['product_id'],
        "product_name": session['product_name'],
        "amount": amount,
        "currency": session['currency'],
        "platform_fee": platform_fee,
        "net_amount": amount - platform_fee,
        "stripe_fee": (amount * 0.029) + 0.30,  # Approximate Stripe fee
        "customer_email": payment_intent.get('receipt_email'),
        "stripe_charge_id": payment_intent.get('charges', {}).get('data', [{}])[0].get('id'),
        "status": "completed"
    }
    
    await db.orders.insert_one(order)
    
    # Send webhook to merchant
    await notify_merchant(merchant_id, {
        "event": "payment.success",
        "order_id": order_id,
        "session_id": session_id,
        "product_id": session['product_id'],
        "product_name": session['product_name'],
        "amount": amount,
        "currency": session['currency'],
        "customer_email": payment_intent.get('receipt_email'),
        "timestamp": payment_intent['created']
    })


async def handle_payment_failed(payment_intent: dict):
    """Handle failed payment"""
    
    session_id = payment_intent.get('metadata', {}).get('embpay_session')
    
    if not session_id:
        return
    
    # Update session status
    await db.checkout_sessions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "status": "failed",
                "error": payment_intent.get('last_payment_error', {}).get('message')
            }
        }
    )


async def notify_merchant(merchant_id: str, data: dict):
    """Send webhook notification to merchant"""
    
    # Get merchant webhook URL
    merchant = await db.merchants.find_one({"merchant_id": merchant_id})
    if not merchant or not merchant.get('webhook_url'):
        return
    
    webhook_url = merchant['webhook_url']
    
    # Sign payload
    payload = json.dumps(data, separators=(',', ':'))
    signature = hmac.new(
        merchant['api_secret'].encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Send webhook (in production, use aiohttp or similar)
    import aiohttp
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                webhook_url,
                json=data,
                headers={
                    'X-EmbPay-Signature': signature,
                    'Content-Type': 'application/json'
                },
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status != 200:
                    print(f"Webhook failed: {response.status}")
                    # TODO: Retry logic
                    
    except Exception as e:
        print(f"Webhook error: {e}")
        # TODO: Queue for retry


@router.post("/test")
async def test_webhook(request: Request):
    """Test endpoint for merchants"""
    data = await request.json()
    print(f"Test webhook received: {data}")
    return {"status": "received", "data": data}
