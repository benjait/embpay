"""
Database Models for EmbPay
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class Merchant(BaseModel):
    """Merchant account"""
    merchant_id: str
    email: str
    business_name: str
    api_key: str
    api_secret: str
    stripe_account_id: Optional[str] = None
    stripe_connected: bool = False
    status: str = "active"  # active, suspended, pending
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    webhook_url: Optional[str] = None
    plan: str = "starter"  # starter, growth, shield, enterprise


class CheckoutSession(BaseModel):
    """Checkout session"""
    session_id: str
    merchant_id: str
    product_id: str
    product_name: str
    price: float
    currency: str = "usd"
    status: str = "pending"  # pending, completed, failed, expired, cancelled
    stripe_session_id: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    completed_at: Optional[datetime] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class Order(BaseModel):
    """Completed order"""
    order_id: str
    session_id: str
    merchant_id: str
    product_id: str
    product_name: str
    amount: float
    currency: str
    platform_fee: float
    net_amount: float  # amount - platform_fee
    stripe_fee: float
    status: str = "completed"
    customer_email: Optional[str] = None
    stripe_charge_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Product(BaseModel):
    """Product (optional sync)"""
    product_id: str
    merchant_id: str
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "usd"
    image_url: Optional[str] = None
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
