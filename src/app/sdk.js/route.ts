import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://embpay.vercel.app';
  
  const js = `
(function(window) {
  'use strict';

  var BASE_URL = '${baseUrl}';
  
  /**
   * EmbPay SDK - Modern JavaScript module for embedding checkout
   * @version 2.0.0
   */
  function EmbPay(config) {
    if (!config || !config.merchantId) {
      throw new Error('EmbPay: merchantId is required');
    }
    
    this.merchantId = config.merchantId;
    this.config = config;
    this.events = {};
    this.popup = null;
    
    // Setup message listener
    this._setupMessageListener();
  }
  
  /**
   * Open checkout popup
   */
  EmbPay.prototype.checkout = function(productId, options) {
    var self = this;
    options = options || {};
    
    if (!productId) {
      throw new Error('EmbPay: productId is required');
    }
    
    var checkoutUrl = BASE_URL + '/checkout/' + productId;
    var params = new URLSearchParams();
    
    if (options.customerEmail) params.append('email', options.customerEmail);
    if (options.customerName) params.append('name', options.customerName);
    if (options.theme) params.append('theme', options.theme);
    
    var fullUrl = checkoutUrl + (params.toString() ? '?' + params.toString() : '');
    
    // Store callbacks
    this._checkoutCallbacks = {
      onSuccess: options.onSuccess,
      onCancel: options.onCancel,
      productId: productId
    };
    
    // Emit checkout:open event
    this._emit('checkout:open', { productId: productId });
    
    // Open popup
    var w = 500, h = 700;
    var left = (screen.width - w) / 2;
    var top = (screen.height - h) / 2;
    
    this.popup = window.open(
      fullUrl,
      'embpay_checkout_' + productId,
      'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',scrollbars=yes,resizable=yes'
    );
    
    if (!this.popup) {
      console.warn('EmbPay: Popup blocked, falling back to redirect');
      window.location.href = fullUrl;
      return;
    }
    
    // Monitor popup close
    var checkClosed = setInterval(function() {
      if (self.popup && self.popup.closed) {
        clearInterval(checkClosed);
        self._emit('checkout:close', { productId: productId });
        
        // Call onCancel if popup was closed without success
        if (self._checkoutCallbacks && self._checkoutCallbacks.onCancel && !self._purchaseCompleted) {
          self._checkoutCallbacks.onCancel();
        }
        self._purchaseCompleted = false;
      }
    }, 500);
  };
  
  /**
   * Verify license key
   */
  EmbPay.prototype.verifyLicense = function(licenseKey, options) {
    options = options || {};
    
    if (!licenseKey) {
      return Promise.reject(new Error('License key is required'));
    }
    
    var params = new URLSearchParams({
      key: licenseKey,
      merchantId: this.merchantId
    });
    
    if (options.machineId) params.append('machineId', options.machineId);
    if (options.productId) params.append('productId', options.productId);
    
    return fetch(BASE_URL + '/api/verify-license?' + params.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) {
          throw new Error(err.error || 'License verification failed');
        });
      }
      return response.json();
    })
    .then(function(data) {
      return {
        valid: data.valid || false,
        productId: data.productId,
        email: data.email,
        expiresAt: data.expiresAt,
        activations: data.activations,
        maxActivations: data.maxActivations
      };
    });
  };
  
  /**
   * Create buy button programmatically
   */
  EmbPay.prototype.createButton = function(productId, container, options) {
    var self = this;
    options = options || {};
    
    if (!productId) {
      throw new Error('EmbPay: productId is required');
    }
    
    if (!container) {
      throw new Error('EmbPay: container element is required');
    }
    
    var buttonText = options.text || 'Buy Now';
    var buttonColor = options.color || '#6366f1';
    var mode = options.mode || 'popup';
    
    var btn = document.createElement('button');
    btn.textContent = buttonText;
    btn.className = 'embpay-button';
    btn.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'gap:8px',
      'padding:14px 28px',
      'background:' + buttonColor,
      'color:#fff',
      'border:none',
      'border-radius:10px',
      'font-size:16px',
      'font-weight:600',
      'font-family:system-ui,-apple-system,sans-serif',
      'cursor:pointer',
      'transition:all 0.2s',
      'box-shadow:0 4px 14px rgba(0,0,0,0.15)'
    ].join(';');
    
    // Hover effect
    btn.onmouseenter = function() {
      btn.style.transform = 'translateY(-1px)';
      btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
    };
    btn.onmouseleave = function() {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)';
    };
    
    // Add lock icon
    var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '16');
    icon.setAttribute('height', '16');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    icon.innerHTML = '<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>';
    btn.insertBefore(icon, btn.firstChild);
    
    // Click handler
    btn.onclick = function(e) {
      e.preventDefault();
      
      if (mode === 'popup') {
        self.checkout(productId, options);
      } else if (mode === 'redirect') {
        var checkoutUrl = BASE_URL + '/checkout/' + productId;
        window.location.href = checkoutUrl;
      } else if (mode === 'embed') {
        // Replace button with iframe
        var iframe = document.createElement('iframe');
        iframe.src = BASE_URL + '/embed/' + productId;
        iframe.style.cssText = 'width:100%;max-width:480px;min-height:500px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('allow', 'payment');
        container.innerHTML = '';
        container.appendChild(iframe);
      }
    };
    
    container.appendChild(btn);
    return btn;
  };
  
  /**
   * Event listener
   */
  EmbPay.prototype.on = function(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  };
  
  /**
   * Remove event listener
   */
  EmbPay.prototype.off = function(eventName, callback) {
    if (!this.events[eventName]) return;
    
    if (callback) {
      this.events[eventName] = this.events[eventName].filter(function(cb) {
        return cb !== callback;
      });
    } else {
      this.events[eventName] = [];
    }
  };
  
  /**
   * Emit event
   */
  EmbPay.prototype._emit = function(eventName, data) {
    if (!this.events[eventName]) return;
    
    this.events[eventName].forEach(function(callback) {
      try {
        callback(data);
      } catch (e) {
        console.error('EmbPay event error:', e);
      }
    });
  };
  
  /**
   * Setup message listener for checkout success
   */
  EmbPay.prototype._setupMessageListener = function() {
    var self = this;
    
    window.addEventListener('message', function(event) {
      // Validate origin
      if (event.origin !== BASE_URL) return;
      
      var data = event.data;
      
      if (data && data.type === 'embpay:success') {
        self._purchaseCompleted = true;
        
        var orderData = {
          orderId: data.orderId,
          productId: data.productId,
          email: data.email,
          licenseKey: data.licenseKey
        };
        
        // Emit purchase event
        self._emit('purchase', orderData);
        
        // Call onSuccess callback
        if (self._checkoutCallbacks && self._checkoutCallbacks.onSuccess) {
          self._checkoutCallbacks.onSuccess(orderData);
        }
        
        // Close popup if open
        if (self.popup && !self.popup.closed) {
          self.popup.close();
        }
      }
      
      if (data && data.type === 'embpay:cancel') {
        self._emit('checkout:close', { productId: data.productId });
        
        if (self._checkoutCallbacks && self._checkoutCallbacks.onCancel) {
          self._checkoutCallbacks.onCancel();
        }
      }
    });
  };
  
  /**
   * Legacy script tag support (auto-init)
   */
  EmbPay.autoInit = function() {
    var scripts = document.querySelectorAll('script[data-product]');
    
    scripts.forEach(function(script) {
      var productId = script.getAttribute('data-product');
      var merchantId = script.getAttribute('data-merchant') || 'legacy';
      var buttonText = script.getAttribute('data-text') || 'Buy Now';
      var buttonColor = script.getAttribute('data-color') || '#6366f1';
      var mode = script.getAttribute('data-mode') || 'popup';
      
      if (!productId) {
        console.warn('EmbPay: Missing data-product attribute');
        return;
      }
      
      var embpay = new EmbPay({ merchantId: merchantId });
      
      if (mode === 'embed') {
        var iframe = document.createElement('iframe');
        iframe.src = BASE_URL + '/embed/' + productId;
        iframe.style.cssText = 'width:100%;max-width:480px;min-height:500px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('allow', 'payment');
        script.parentNode.insertBefore(iframe, script.nextSibling);
      } else {
        var container = document.createElement('div');
        script.parentNode.insertBefore(container, script.nextSibling);
        
        embpay.createButton(productId, container, {
          text: buttonText,
          color: buttonColor,
          mode: mode
        });
      }
    });
  };
  
  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', EmbPay.autoInit);
  } else {
    EmbPay.autoInit();
  }
  
  // Export to window
  window.EmbPay = EmbPay;
  
})(window);
`.trim();

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
