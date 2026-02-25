"""
EmbPay Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    APP_NAME: str = "EmbPay"
    DEBUG: bool = False
    
    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    
    # Checkout
    CHECKOUT_BASE_URL: str = "https://checkout.embpay.com"
    API_BASE_URL: str = "https://api.embpay.com"
    
    # Database
    DATABASE_URL: str = "postgresql://..."
    
    # Security
    JWT_SECRET: str = ""
    TOKEN_EXPIRY_MINUTES: int = 5
    
    # Fees
    PLATFORM_FEE_PERCENT: float = 0.0  # 0% for now
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
