import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://embpay.vercel.app';
  
  const js = `
/**
 * EmbPay Embed (Legacy)
 * Backward compatible wrapper for the new SDK
 * For new integrations, use sdk.js instead
 */
(function() {
  'use strict';

  var BASE_URL = '${baseUrl}';
  
  // Load the new SDK if not already loaded
  if (!window.EmbPay) {
    var script = document.createElement('script');
    script.src = BASE_URL + '/sdk.js';
    script.async = true;
    document.head.appendChild(script);
    
    // Wait for SDK to load, then auto-init
    script.onload = function() {
      if (window.EmbPay && window.EmbPay.autoInit) {
        window.EmbPay.autoInit();
      }
    };
  } else {
    // SDK already loaded, auto-init
    if (window.EmbPay.autoInit) {
      window.EmbPay.autoInit();
    }
  }
  
  // Legacy event listener for backward compatibility
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'embpay:success') {
      // Dispatch legacy custom event
      var customEvent = new CustomEvent('embpay:purchase', {
        detail: { 
          orderId: event.data.orderId,
          productId: event.data.productId,
          email: event.data.email,
          licenseKey: event.data.licenseKey
        }
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
