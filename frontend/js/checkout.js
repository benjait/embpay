/**
 * EmbPay Checkout Page JavaScript
 * Fixed: Stripe Redirect flow (not Elements)
 */

// Configuration - populated from backend
const API_BASE_URL = window.EMBPAY_API_BASE_URL || 'https://api.embpay.com';

// State
let sessionId = null;
let sessionData = null;
let stripeCheckoutUrl = null;

/**
 * Initialize checkout page
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Get session ID from URL
    const pathParts = window.location.pathname.split('/');
    sessionId = pathParts[pathParts.length - 1];
    
    if (!sessionId || sessionId === 'checkout.html' || sessionId === 'checkout') {
        showError('Invalid checkout session');
        return;
    }
    
    try {
        // Load session data
        await loadSession();
        
        // Show checkout form
        showCheckout();
        
    } catch (error) {
        console.error('Checkout init error:', error);
        showError(error.message || 'Failed to load checkout');
    }
});

/**
 * Load checkout session from API
 */
async function loadSession() {
    const response = await fetch(`${API_BASE_URL}/v1/checkout/session/${sessionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Session not found');
    }
    
    sessionData = await response.json();
    
    // Check if session is still valid
    if (sessionData.status !== 'pending') {
        throw new Error(`Session is ${sessionData.status}`);
    }
    
    // Update UI with product info
    updateProductInfo();
}

/**
 * Update product information on page
 */
function updateProductInfo() {
    document.getElementById('product-name').textContent = sessionData.product_name;
    document.getElementById('product-price').textContent = formatPrice(
        sessionData.price, 
        sessionData.currency
    );
    
    // Update image if available
    const imageContainer = document.getElementById('product-image');
    if (sessionData.metadata && sessionData.metadata.product_image) {
        imageContainer.innerHTML = `<img src="${sessionData.metadata.product_image}" alt="${sessionData.product_name}">`;
    } else {
        imageContainer.innerHTML = '📦';
    }
}

/**
 * Redirect to Stripe Checkout
 */
async function redirectToStripe() {
    const email = document.getElementById('email').value;
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Show loading
    setLoading(true);
    
    try {
        // Update session with customer email
        await updateSessionEmail(email);
        
        // Get Stripe Checkout URL
        const response = await fetch(`${API_BASE_URL}/v1/checkout/session/${sessionId}/stripe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create Stripe session');
        }
        
        const data = await response.json();
        
        // Redirect to Stripe Checkout
        window.location.href = data.stripe_url;
        
    } catch (error) {
        console.error('Redirect error:', error);
        alert('Error: ' + error.message);
        setLoading(false);
    }
}

/**
 * Update session with customer email
 */
async function updateSessionEmail(email) {
    await fetch(`${API_BASE_URL}/v1/checkout/session/${sessionId}/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });
}

/**
 * Show checkout form
 */
function showCheckout() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('checkout-form').classList.remove('hidden');
}

/**
 * Show success state (called from success/cancel pages)
 */
function showSuccess(orderId) {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('checkout-form').classList.add('hidden');
    document.getElementById('success-state').classList.remove('hidden');
    
    // Update order details
    document.getElementById('order-details').innerHTML = `
        <strong>Order ID:</strong> ${orderId}<br>
        <strong>Amount:</strong> ${formatPrice(sessionData?.price || 0, sessionData?.currency || 'usd')}<br>
    `;
    
    // Notify parent window
    notifyParent('payment_success', {
        order_id: orderId,
        session_id: sessionId
    });
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        closeWindow();
    }, 3000);
}

/**
 * Show cancel state
 */
function showCancel() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('checkout-form').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
    document.getElementById('error-message').textContent = 'Payment was cancelled. You can try again.';
    
    // Notify parent window
    notifyParent('payment_cancel', {
        session_id: sessionId
    });
}

/**
 * Show error state
 */
function showError(message) {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('checkout-form').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

/**
 * Set loading state
 */
function setLoading(isLoading) {
    const button = document.getElementById('pay-button');
    const buttonText = document.getElementById('button-text');
    const spinner = document.getElementById('button-spinner');
    
    button.disabled = isLoading;
    
    if (isLoading) {
        buttonText.classList.add('hidden');
        spinner.classList.remove('hidden');
    } else {
        buttonText.classList.remove('hidden');
        spinner.classList.add('hidden');
    }
}

/**
 * Format price
 */
function formatPrice(amount, currency) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase()
    }).format(amount);
}

/**
 * Notify parent window (opener)
 */
function notifyParent(type, data) {
    if (window.opener) {
        // Get allowed origin from config or use wildcard
        window.opener.postMessage({
            type: type,
            data: data,
            origin: 'embpay'
        }, '*');
    }
}

/**
 * Close popup window
 */
function closeWindow() {
    if (window.opener) {
        window.close();
    } else {
        // If not popup, redirect to merchant site
        const merchantReturnUrl = sessionData?.metadata?.merchant_return_url || '/';
        window.location.href = merchantReturnUrl;
    }
}

// Check for success/cancel params in URL (Stripe redirect back)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true') {
    // Check session status to get order_id
    checkSessionStatus().then(orderId => {
        if (orderId) {
            showSuccess(orderId);
        } else {
            // Order still processing, poll for it
            pollForOrder();
        }
    });
} else if (urlParams.get('cancel') === 'true') {
    showCancel();
}

/**
 * Check session status to get order_id
 */
async function checkSessionStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/v1/checkout/session/${sessionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        
        if (data.status === 'completed') {
            // Get order from DB (via API)
            const orderResponse = await fetch(`${API_BASE_URL}/v1/checkout/session/${sessionId}/order`);
            if (orderResponse.ok) {
                const orderData = await orderResponse.json();
                return orderData.order_id;
            }
        }
        
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * Poll for order completion
 */
function pollForOrder() {
    let attempts = 0;
    const maxAttempts = 10;
    
    const interval = setInterval(async () => {
        attempts++;
        const orderId = await checkSessionStatus();
        
        if (orderId) {
            clearInterval(interval);
            showSuccess(orderId);
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            showError('Payment processing timeout. Please check your email for confirmation.');
        }
    }, 2000);
}