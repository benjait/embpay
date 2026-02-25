"""
Token Generation Utility for WordPress Plugin
"""
import hmac
import hashlib
import json
import base64
import time


def generate_checkout_token(
    merchant_id: str,
    api_secret: str,
    product_id: str,
    product_name: str,
    price: float,
    currency: str = "usd",
    product_image: str = "",
    merchant_ref: str = ""
) -> str:
    """
    Generate signed token for checkout session
    
    Args:
        merchant_id: EmbPay merchant ID
        api_secret: Merchant API secret (from EmbPay dashboard)
        product_id: Product ID (e.g., "wp_123")
        product_name: Product name
        price: Price in dollars
        currency: Currency code (default: usd)
        product_image: Product image URL (optional)
        merchant_ref: Internal reference (optional)
    
    Returns:
        Signed token string
    """
    
    # Create payload
    payload = {
        "merchant_id": merchant_id,
        "product_id": product_id,
        "product_name": product_name[:100],  # Limit length
        "price": float(price),
        "currency": currency.lower(),
        "product_image": product_image[:500],  # Limit length
        "merchant_ref": merchant_ref[:100],
        "timestamp": int(time.time())
    }
    
    # Create signature
    payload_json = json.dumps(payload, sort_keys=True, separators=(',', ':'))
    signature = hmac.new(
        api_secret.encode('utf-8'),
        payload_json.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    # Add signature to payload
    payload["signature"] = signature
    
    # Encode to base64 (URL-safe)
    token_json = json.dumps(payload, separators=(',', ':'))
    token_bytes = token_json.encode('utf-8')
    token_b64 = base64.urlsafe_b64encode(token_bytes).decode('utf-8').rstrip('=')
    
    return token_b64


def verify_token(token: str, api_secret: str) -> dict:
    """
    Verify and decode token
    
    Args:
        token: Signed token
        api_secret: Merchant API secret
    
    Returns:
        Decoded token data
    
    Raises:
        ValueError: If token is invalid
    """
    try:
        # Add padding if needed
        padding = 4 - (len(token) % 4)
        if padding != 4:
            token += '=' * padding
        
        # Decode base64
        decoded_bytes = base64.urlsafe_b64decode(token)
        data = json.loads(decoded_bytes)
        
        # Extract signature
        signature = data.pop('signature', None)
        if not signature:
            raise ValueError("Missing signature")
        
        # Verify signature
        payload_json = json.dumps(data, sort_keys=True, separators=(',', ':'))
        expected_sig = hmac.new(
            api_secret.encode('utf-8'),
            payload_json.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_sig):
            raise ValueError("Invalid signature")
        
        # Check expiration (5 minutes)
        if time.time() - data.get('timestamp', 0) > 300:
            raise ValueError("Token expired")
        
        return data
        
    except Exception as e:
        raise ValueError(f"Token verification failed: {str(e)}")


# Example usage
if __name__ == "__main__":
    # Test token generation
    token = generate_checkout_token(
        merchant_id="merch_abc123",
        api_secret="sk_test_secret_key_here",
        product_id="wp_456",
        product_name="T-Shirt Premium",
        price=29.99,
        currency="usd",
        product_image="https://drop.com/image.jpg"
    )
    
    print(f"Token: {token}")
    print(f"Length: {len(token)} chars")
    
    # Verify
    decoded = verify_token(token, "sk_test_secret_key_here")
    print(f"Decoded: {decoded}")
