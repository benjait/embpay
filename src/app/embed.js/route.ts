import { NextResponse } from "next/server";
import { PLATFORM_URL } from "@/lib/stripe";

export async function GET() {
  const js = `
(function() {
  'use strict';

  // Find the script tag that loaded this
  var scripts = document.querySelectorAll('script[data-product]');
  
  scripts.forEach(function(script) {
    var productId = script.getAttribute('data-product');
    var buttonText = script.getAttribute('data-text') || 'Buy Now';
    var buttonColor = script.getAttribute('data-color') || '#059669';
    var mode = script.getAttribute('data-mode') || 'popup'; // popup | redirect | embed
    var baseUrl = '${PLATFORM_URL}';
    
    if (!productId) {
      console.warn('EmbPay: Missing data-product attribute');
      return;
    }

    if (mode === 'embed') {
      // Create inline iframe
      var iframe = document.createElement('iframe');
      iframe.src = baseUrl + '/embed/' + productId;
      iframe.style.cssText = 'width:100%;max-width:480px;min-height:500px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('allow', 'payment');
      script.parentNode.insertBefore(iframe, script.nextSibling);
    } else {
      // Create button
      var btn = document.createElement('button');
      btn.textContent = buttonText;
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
        'box-shadow:0 4px 14px rgba(0,0,0,0.15)',
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

      btn.onclick = function(e) {
        e.preventDefault();
        var checkoutUrl = baseUrl + '/checkout/' + productId;

        if (mode === 'popup') {
          var w = 500, h = 700;
          var left = (screen.width - w) / 2;
          var top = (screen.height - h) / 2;
          var popup = window.open(
            checkoutUrl,
            'embpay_checkout',
            'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',scrollbars=yes'
          );
          if (!popup) {
            // Popup blocked, fall back to redirect
            window.location.href = checkoutUrl;
          }
        } else {
          window.location.href = checkoutUrl;
        }
      };

      script.parentNode.insertBefore(btn, script.nextSibling);
    }
  });

  // Listen for success messages from checkout iframe/popup
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'embpay:success') {
      // Dispatch custom event for integrators
      var customEvent = new CustomEvent('embpay:purchase', {
        detail: { orderId: event.data.orderId }
      });
      document.dispatchEvent(customEvent);
    }
  });
})();
`.trim();

  return new NextResponse(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
