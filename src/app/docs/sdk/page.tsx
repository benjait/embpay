"use client";

import { useState } from "react";
import { Code2, Copy, Check, Zap, Lock, Webhook, Package, Terminal, Globe } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

export default function SDKDocsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Code2 className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">JavaScript SDK</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A modern, lightweight SDK for embedding EmbPay checkout on any website. 
              Includes license verification, event handling, and customizable UI.
            </p>
          </div>

          {/* Installation */}
          <section className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Installation</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Script Tag (Recommended)</h3>
                <p className="text-slate-400 mb-4">Add this to your HTML before the closing <code className="text-indigo-400">&lt;/body&gt;</code> tag:</p>
                <CodeBlock code={`<script src="https://embpay.vercel.app/sdk.js"></script>
<script>
  const embpay = new EmbPay({ merchantId: 'usr_xxx' });
</script>`} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3">Legacy Embed (Auto-Init)</h3>
                <p className="text-slate-400 mb-4">For backward compatibility with older embed code:</p>
                <CodeBlock code={`<script 
  src="https://embpay.vercel.app/embed.js"
  data-product="prod_abc123"
  data-merchant="usr_xxx"
  data-text="Buy Now — $97"
  data-color="#6366f1"
  data-mode="popup"
></script>`} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-3">React Integration</h3>
                <p className="text-slate-400 mb-4">Use in React components with useEffect:</p>
                <CodeBlock code={`import { useEffect, useRef } from 'react';

function CheckoutButton({ productId }) {
  const embpayRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://embpay.vercel.app/sdk.js';
    script.async = true;
    script.onload = () => {
      embpayRef.current = new window.EmbPay({ 
        merchantId: 'usr_xxx' 
      });
      
      embpayRef.current.on('purchase', (data) => {
        console.log('Purchase:', data);
      });
    };
    document.body.appendChild(script);
    
    return () => {
      if (embpayRef.current) {
        embpayRef.current.off('purchase');
      }
    };
  }, []);

  const handleClick = () => {
    if (embpayRef.current) {
      embpayRef.current.checkout(productId, {
        onSuccess: (order) => {
          alert('Payment successful!');
        },
        theme: 'dark',
      });
    }
  };

  return (
    <button onClick={handleClick}>
      Buy Now
    </button>
  );
}`} />
              </div>
            </div>
          </section>

          {/* Checkout Method */}
          <section className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Checkout Method</h2>
            </div>

            <p className="text-slate-300 mb-6">Open a checkout popup for a specific product:</p>

            <CodeBlock code={`embpay.checkout('prod_abc123', {
  // Customer data (optional)
  customerEmail: 'customer@example.com',
  customerName: 'John Doe',
  
  // Theme (optional)
  theme: 'dark', // 'dark' | 'light'
  
  // Callbacks
  onSuccess: (order) => {
    console.log('Payment successful!', order);
    // order.orderId, order.productId, order.email, order.licenseKey
  },
  
  onCancel: () => {
    console.log('Checkout cancelled');
  }
});`} />

            <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
              <h4 className="font-medium text-white mb-3">Parameters</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <code className="text-indigo-400">productId</code>
                  <span className="text-slate-400">The product ID to checkout</span>
                </div>
                <div className="flex justify-between gap-4">
                  <code className="text-indigo-400">customerEmail</code>
                  <span className="text-slate-400">Prefill customer email</span>
                </div>
                <div className="flex justify-between gap-4">
                  <code className="text-indigo-400">customerName</code>
                  <span className="text-slate-400">Prefill customer name</span>
                </div>
                <div className="flex justify-between gap-4">
                  <code className="text-indigo-400">theme</code>
                  <span className="text-slate-400">'dark' or 'light'</span>
                </div>
                <div className="flex justify-between gap-4">
                  <code className="text-indigo-400">onSuccess</code>
                  <span className="text-slate-400">Callback when payment completes</span>
                </div>
                <div className="flex justify-between gap-4">
                  <code className="text-indigo-400">onCancel</code>
                  <span className="text-slate-400">Callback when checkout is cancelled</span>
                </div>
              </div>
            </div>
          </section>

          {/* License Verification */}
          <section className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">License Verification</h2>
            </div>

            <p className="text-slate-300 mb-6">
              Verify license keys for software products. Perfect for desktop apps, SaaS, and digital products:
            </p>

            <CodeBlock code={`const result = await embpay.verifyLicense('EMBP-XXXX-XXXX-XXXX-XXXX', {
  machineId: 'device_123',     // Optional: Device/machine ID
  productId: 'prod_abc123',    // Optional: Validate specific product
});

if (result.valid) {
  console.log('License is valid!');
  console.log('Product:', result.productId);
  console.log('Customer:', result.email);
  console.log('Expires:', result.expiresAt);
  console.log('Activations:', result.activations + '/' + result.maxActivations);
} else {
  console.error('Invalid license');
}`} />

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <h4 className="font-medium text-white mb-3">Response Object</h4>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex gap-4">
                    <span className="text-indigo-400 w-32">valid</span>
                    <span className="text-slate-500">boolean</span>
                    <span className="text-slate-400">License validity status</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-indigo-400 w-32">productId</span>
                    <span className="text-slate-500">string</span>
                    <span className="text-slate-400">Associated product ID</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-indigo-400 w-32">email</span>
                    <span className="text-slate-500">string</span>
                    <span className="text-slate-400">Customer email</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-indigo-400 w-32">expiresAt</span>
                    <span className="text-slate-500">string?</span>
                    <span className="text-slate-400">Expiration date (null = lifetime)</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-indigo-400 w-32">activations</span>
                    <span className="text-slate-500">number</span>
                    <span className="text-slate-400">Current activation count</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-indigo-400 w-32">maxActivations</span>
                    <span className="text-slate-500">number</span>
                    <span className="text-slate-400">Maximum allowed activations</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex gap-3">
                  <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-emerald-300 mb-1">Use Cases</h4>
                    <ul className="text-sm text-emerald-200/80 space-y-1">
                      <li>• Desktop software license validation</li>
                      <li>• SaaS subscription verification</li>
                      <li>• Plugin/extension activation</li>
                      <li>• API access control</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Create Button Method */}
          <section className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Create Button</h2>
            </div>

            <p className="text-slate-300 mb-6">Programmatically create a buy button and attach it to any DOM element:</p>

            <CodeBlock code={`const container = document.getElementById('checkout-container');

embpay.createButton('prod_abc123', container, {
  text: 'Buy Now — $97',
  color: '#6366f1',
  mode: 'popup', // 'popup' | 'redirect' | 'embed'
  
  // Optional: all checkout() options
  customerEmail: 'customer@example.com',
  theme: 'dark',
  onSuccess: (order) => { /* ... */ },
  onCancel: () => { /* ... */ }
});`} />

            <div className="mt-6 grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <h4 className="text-sm font-medium text-white mb-2">popup</h4>
                <p className="text-xs text-slate-400">Opens checkout in a centered popup window</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <h4 className="text-sm font-medium text-white mb-2">redirect</h4>
                <p className="text-xs text-slate-400">Redirects to checkout page</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <h4 className="text-sm font-medium text-white mb-2">embed</h4>
                <p className="text-xs text-slate-400">Replaces button with embedded iframe</p>
              </div>
            </div>
          </section>

          {/* Events */}
          <section className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <Webhook className="w-5 h-5 text-pink-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Event Listeners</h2>
            </div>

            <p className="text-slate-300 mb-6">Listen for global events across all checkout sessions:</p>

            <CodeBlock code={`// Listen for purchase events
embpay.on('purchase', (data) => {
  console.log('New purchase!', data);
  // { orderId, productId, email, licenseKey }
  
  // Example: Send to analytics
  gtag('event', 'purchase', {
    transaction_id: data.orderId,
    value: data.amount,
    currency: 'USD'
  });
});

// Listen for checkout open
embpay.on('checkout:open', (data) => {
  console.log('Checkout opened for product:', data.productId);
});

// Listen for checkout close
embpay.on('checkout:close', (data) => {
  console.log('Checkout closed');
});

// Remove event listener
embpay.off('purchase'); // Remove all listeners
embpay.off('purchase', specificCallback); // Remove specific listener`} />

            <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
              <h4 className="font-medium text-white mb-3">Available Events</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <code className="text-emerald-400">purchase</code>
                  <span className="text-slate-500 text-sm">—</span>
                  <span className="text-slate-400 text-sm">Fired when a purchase completes</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <code className="text-blue-400">checkout:open</code>
                  <span className="text-slate-500 text-sm">—</span>
                  <span className="text-slate-400 text-sm">Fired when checkout popup opens</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <code className="text-amber-400">checkout:close</code>
                  <span className="text-slate-500 text-sm">—</span>
                  <span className="text-slate-400 text-sm">Fired when checkout popup closes</span>
                </div>
              </div>
            </div>
          </section>

          {/* Complete Example */}
          <section className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Complete Example</h2>
            </div>

            <p className="text-slate-300 mb-6">A full integration example with all features:</p>

            <CodeBlock code={`<!DOCTYPE html>
<html>
<head>
  <title>My Product</title>
</head>
<body>
  <div id="checkout-button"></div>
  <div id="license-check"></div>

  <script src="https://embpay.vercel.app/sdk.js"></script>
  <script>
    // Initialize SDK
    const embpay = new EmbPay({ merchantId: 'usr_xxx' });

    // Listen for purchases globally
    embpay.on('purchase', (data) => {
      console.log('Purchase completed!', data);
      
      // Show license key
      document.getElementById('license-check').innerHTML = \`
        <div style="padding: 20px; background: #10b981; color: white; border-radius: 8px;">
          <h3>Thank you for your purchase!</h3>
          <p>License Key: <strong>\${data.licenseKey}</strong></p>
          <p>Order ID: \${data.orderId}</p>
        </div>
      \`;
      
      // Send to analytics
      if (window.gtag) {
        gtag('event', 'purchase', {
          transaction_id: data.orderId,
          value: 97.00,
          currency: 'USD'
        });
      }
    });

    // Create checkout button
    const container = document.getElementById('checkout-button');
    embpay.createButton('prod_abc123', container, {
      text: 'Buy Now — $97',
      color: '#6366f1',
      mode: 'popup',
      theme: 'dark',
      onSuccess: (order) => {
        // Additional success handling
        console.log('Payment successful!', order);
      },
      onCancel: () => {
        console.log('User cancelled checkout');
      }
    });

    // Optional: Verify existing license
    async function checkLicense(key) {
      try {
        const result = await embpay.verifyLicense(key, {
          machineId: 'device_' + Date.now(),
          productId: 'prod_abc123'
        });
        
        if (result.valid) {
          console.log('License valid!', result);
        } else {
          console.error('Invalid license');
        }
      } catch (error) {
        console.error('License verification failed:', error);
      }
    }
  </script>
</body>
</html>`} />
          </section>

          {/* Help */}
          <section className="glass-card rounded-2xl p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Need Help?</h2>
                <p className="text-slate-400">Check out our full API documentation or contact support.</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-secondary text-slate-300 font-medium transition-all"
                >
                  API Docs
                </Link>
                <a
                  href="mailto:boka@agentmail.to"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-primary text-white font-medium transition-all"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Code block component with copy functionality
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 overflow-x-auto text-sm leading-relaxed">
        <code className="text-slate-300 font-mono">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 
                   opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-700/80"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4 text-slate-400" />
        )}
      </button>
    </div>
  );
}
