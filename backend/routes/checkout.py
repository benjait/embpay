"""
EmbPay Checkout API
Endpoint: POST /v1/checkout/session
Creates a checkout session from signed token
"""

import hmac
import hashlib
import json
import base64
import time
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import stripe

from ..models.merchant import Merchant
from ..models.checkout_session import CheckoutSession
from ..database import get_db
from ..config import settings

router = APIRouter(prefix="/v1/checkout", tags=["checkout"])

# Stripe setup
stripe.api_key = settings.STRIPE_SECRET_KEY


class CheckoutRequest(BaseModel):
    token: str


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str
    expires_at: str


def verify_token_signature(token: str, secret_key: str) -> dict:
    """
    Verify HMAC signature of token
    Returns decoded token data or raises exception
    """
    try:
        # Decode base64
        decoded = base64.urlsafe_b64decode(token + '=' * (4 - len(token) % 4))
        data = json.loads(decoded)
        
        # Extract signature
        signature = data.pop('signature', None)
        if not signature:
            raise ValueError("Missing signature")
        
        # Recalculate signature
        payload = json.dumps(data, sort_keys=True, separators=(',', ':'))
        expected_sig = hmac.new(
            secret_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("Invalid signature")
        
        return data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {str(e)}")


def check_token_expired(timestamp: int, max_age: int = 300) -> bool:
    """Check if token is expired (default 5 minutes)"""
    return time.time() - timestamp > max_age


@router.post("/session", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CheckoutRequest,
    db = Depends(get_db)
):
    """
    Create a checkout session from signed token
    
    Token must contain:
    - merchant_id: str
    - product_id: str
    - product_name: str
    - price: float
    - currency: str (default: 'usd')
    - timestamp: int
    - signature: str
    """
    
    # Step 1: Decode token without verification to get merchant_id
    try:
        decoded = base64.urlsafe_b64decode(
            request.token + '=' * (4 - len(request.token) % 4)
        )
        token_preview = json.loads(decoded)
        merchant_id = token_preview.get('merchant_id')
    except:
        raise HTTPException(status_code=400, detail="Invalid token format")
    
    # Step 2: Get merchant from DB
    merchant = await db.merchants.find_one({"merchant_id": merchant_id})
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    if not merchant.get('stripe_account_id'):
        raise HTTPException(status_code=400, detail="Merchant not connected to Stripe")
    
    # Step 3: Verify token signature with merchant secret
    try:
        token_data = verify_token_signature(
            request.token, 
            merchant['api_secret']
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Token verification failed: {str(e)}")
    
    # Step 4: Check token expiration
    if check_token_expired(token_data['timestamp']):
        raise HTTPException(status_code=400, detail="Token expired")
    
    # Step 5: Validate required fields
    required = ['product_id', 'product_name', 'price', 'currency']
    for field in required:
        if field not in token_data:
            raise HTTPException(status_code=400, detail=f"Missing field: {field}")
    
    # Step 6: Create checkout session in DB
    session_id = f"sess_{generate_id()}"
    expires_at = datetime.now(timezone.utc).isoformat()
    
    checkout_session = {
        "session_id": session_id,
        "merchant_id": merchant_id,
        "product_id": token_data['product_id'],
        "product_name": token_data['product_name'],
        "price": token_data['price'],
        "currency": token_data['currency'].lower(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": expires_at,
        "stripe_session_id": None,
        "customer_email": None,
        "metadata": {
            "source": "embpay_platform",
            "merchant_ref": token_data.get('merchant_ref', ''),
            "product_image": token_data.get('product_image', '')
        }
    }
    
    await db.checkout_sessions.insert_one(checkout_session)
    
    # Return checkout URL (Stripe session created later)
    checkout_url = f"{settings.CHECKOUT_BASE_URL}/{session_id}"
    
    return CheckoutResponse(
        checkout_url=checkout_url,
        session_id=session_id,
        expires_at=expires_at
    )


@router.get("/session/{session_id}")
async def get_checkout_session(session_id: str, db = Depends(get_db)):
    """Get checkout session details (for checkout page)"""
    
    session = await db.checkout_sessions.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Remove sensitive data
    session.pop('_id', None)
    session.pop('metadata', None)
    
    return session


class EmailRequest(BaseModel):
    email: str


@router.post("/session/{session_id}/email")
async def update_session_email(
    session_id: str,
    request: EmailRequest,
    db = Depends(get_db)
):
    """Update customer email for session"""
    
    result = await db.checkout_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"customer_email": request.email}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"status": "ok"}


class StripeSessionResponse(BaseModel):
    stripe_url: str


@router.post("/session/{session_id}/stripe", response_model=StripeSessionResponse)
async def create_stripe_session(
    session_id: str,
    request: EmailRequest,
    db = Depends(get_db)
):
    """Create Stripe Checkout Session and return URL"""
    
    # Get session from DB
    session = await db.checkout_sessions.find_one({"session_id": session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session['status'] != 'pending':
        raise HTTPException(status_code=400, detail=f"Session is {session['status']}")
    
    # Get merchant
    merchant = await db.merchants.find_one({"merchant_id": session['merchant_id']})
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    if not merchant.get('stripe_account_id'):
        raise HTTPException(status_code=400, detail="Merchant not connected to Stripe")
    
    # Update email
    await db.checkout_sessions.update_one(
        {"session_id": session_id},
        {"$set": {"customer_email": request.email}}
    )
    
    # Create Stripe Checkout Session
    try:
        stripe_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': session['currency'],
                    'product_data': {
                        'name': session['product_name'][:100],
                        'images': [session['metadata']['product_image']] if session.get('metadata', {}).get('product_image') else [],
                    },
                    'unit_amount': int(session['price'] * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f"{settings.CHECKOUT_BASE_URL}/{session_id}?success=true&order_id={{ORDER_ID}}",
            cancel_url=f"{settings.CHECKOUT_BASE_URL}/{session_id}?cancel=true",
            stripe_account=merchant['stripe_account_id'],
            client_reference_id=session_id,
            customer_email=request.email,
            metadata={
                'embpay_session': session_id,
                'embpay_merchant': session['merchant_id'],
                'source': 'embpay_platform'
            }
        )
        
        # Update session with Stripe ID
        await db.checkout_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"stripe_session_id": stripe_session.id}}
        )
        
        return StripeSessionResponse(stripe_url=stripe_session.url)
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {str(e)}")


@router.get("/session/{session_id}/order")
async def get_order_by_session(session_id: str, db = Depends(get_db)):
    """Get order by session ID (for success page)"""
    
    order = await db.orders.find_one({"session_id": session_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Remove sensitive data
    order.pop('_id', None)
    
    return order


def generate_id() -> str:
    """Generate unique ID"""
    import uuid
    return uuid.uuid4().hex[:16]
