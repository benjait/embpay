import { Book, Code, Webhook, Package, ExternalLink, FileJson, Terminal, Zap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import CodeBlock from "@/components/ui/code-block";

export const metadata = {
  title: "API Documentation | EmbPay",
  description: "EmbPay API documentation and integration guides for developers.",
};

export default function DocsPage() {
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
              <Book className="w-8 h-8 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">API Documentation</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Integrate EmbPay into your applications with our simple REST API. 
              Build custom checkout flows, manage products programmatically, and handle webhooks.
            </p>
          </div>

          {/* Quick Start */}
          <section className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Quick Start</h2>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">
              Get up and running with EmbPay API in minutes. All API requests require authentication 
              using your API key, which you can find in your <Link href="/dashboard/settings" className="text-indigo-400 hover:text-indigo-300">dashboard settings</Link>.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <div className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50">
                <span className="text-slate-500 text-sm">Base URL: </span>
                <code className="text-indigo-400">https://api.embpay.io/v1</code>
              </div>
              <div className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50">
                <span className="text-slate-500 text-sm">Format: </span>
                <code className="text-emerald-400">JSON</code>
              </div>
              <div className="px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50">
                <span className="text-slate-500 text-sm">Authentication: </span>
                <code className="text-purple-400">Bearer Token</code>
              </div>
            </div>
          </section>

          {/* Code Examples */}
          <div className="space-y-8">
            {/* Create Product */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Create a Product</h2>
                  <p className="text-slate-400 text-sm">POST /products</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Request</h3>
                  <CodeBlock code={`curl -X POST https://api.embpay.io/v1/products \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Premium Ebook",
    "description": "A comprehensive guide to digital marketing",
    "price": 4900,
    "currency": "usd",
    "type": "digital",
    "files": ["ebook.pdf"]
  }'`} />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Response</h3>
                  <CodeBlock code={`{
  "id": "prod_abc123xyz",
  "name": "Premium Ebook",
  "description": "A comprehensive guide to digital marketing",
  "price": 4900,
  "currency": "usd",
  "type": "digital",
  "status": "active",
  "created_at": "2026-02-08T14:30:00Z",
  "checkout_url": "https://embpay.io/checkout/prod_abc123xyz",
  "embed_code": "<script src='https://embpay.io/embed/prod_abc123xyz.js'></script>"
}`} />
                </div>
              </div>
            </section>

            {/* Embed Checkout */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Embed Checkout</h2>
                  <p className="text-slate-400 text-sm">Simple copy-paste integration</p>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed mb-6">
                The easiest way to add payments to any website. Copy this code and paste it where you 
                want the buy button to appear:
              </p>

              <CodeBlock code={`<!-- EmbPay Checkout Button -->
<script 
  src="https://embpay.io/embed/PROD_ID.js" 
  data-button-text="Buy Now"
  data-button-class="custom-class"
></script>`} />

              <div className="mt-6 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                <h4 className="font-medium text-white mb-3">Embed Options</h4>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <code className="text-indigo-400">data-button-text</code>
                    <span className="text-slate-500">Button label</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-indigo-400">data-button-class</code>
                    <span className="text-slate-500">CSS class names</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-indigo-400">data-success-url</code>
                    <span className="text-slate-500">Redirect after purchase</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="text-indigo-400">data-theme</code>
                    <span className="text-slate-500">light | dark | auto</span>
                  </div>
                </div>
              </div>
            </section>

            {/* JavaScript SDK */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">JavaScript SDK</h2>
                  <p className="text-slate-400 text-sm">For advanced integrations</p>
                </div>
              </div>

              <CodeBlock code={`<!-- Include the EmbPay SDK -->
<script src="https://embpay.io/sdk/v1.js"></script>

<script>
  // Initialize the SDK
  const embpay = new EmbPay('YOUR_API_KEY');

  // Open checkout modal
  embpay.checkout({
    productId: 'prod_abc123xyz',
    onSuccess: (result) => {
      console.log('Payment successful!', result);
      // Redirect or show success message
    },
    onCancel: () => {
      console.log('Checkout cancelled');
    },
    onError: (error) => {
      console.error('Payment error:', error);
    }
  });
</script>`} />
            </section>

            {/* Webhooks */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Webhooks</h2>
                  <p className="text-slate-400 text-sm">Listen for events in real-time</p>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed mb-6">
                Webhooks allow you to receive real-time notifications when events occur in your account. 
                Configure webhook endpoints in your <Link href="/dashboard/settings" className="text-indigo-400 hover:text-indigo-300">dashboard settings</Link>.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Example Webhook Payload</h3>
                  <CodeBlock code={`{
  "id": "evt_abc123xyz",
  "type": "order.completed",
  "created": 1699455600,
  "data": {
    "order": {
      "id": "ord_def456uvw",
      "product_id": "prod_abc123xyz",
      "product_name": "Premium Ebook",
      "amount": 4900,
      "currency": "usd",
      "customer_email": "customer@example.com",
      "customer_name": "John Doe",
      "status": "completed",
      "created_at": "2026-02-08T14:30:00Z"
    }
  }
}`} />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-3">Webhook Events</h4>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <code className="text-emerald-400">order.completed</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <code className="text-amber-400">order.refunded</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <code className="text-blue-400">product.created</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <code className="text-purple-400">product.updated</code>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-2">Webhook Verification</h4>
                  <p className="text-slate-400 text-sm mb-3">
                    Verify webhook signatures to ensure requests are from EmbPay:
                  </p>
                  <CodeBlock code={`const signature = req.headers['x-embpay-signature'];
const payload = JSON.stringify(req.body);

const expected = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (signature !== expected) {
  throw new Error('Invalid webhook signature');
}`} />
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-pink-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">API Endpoints</h2>
              </div>

              <div className="space-y-4">
                {[
                  { method: 'GET', path: '/products', desc: 'List all products' },
                  { method: 'POST', path: '/products', desc: 'Create a new product' },
                  { method: 'GET', path: '/products/:id', desc: 'Get a specific product' },
                  { method: 'PUT', path: '/products/:id', desc: 'Update a product' },
                  { method: 'DELETE', path: '/products/:id', desc: 'Delete a product' },
                  { method: 'GET', path: '/orders', desc: 'List all orders' },
                  { method: 'GET', path: '/orders/:id', desc: 'Get a specific order' },
                  { method: 'POST', path: '/orders/:id/refund', desc: 'Refund an order' },
                ].map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-700/50"
                  >
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                      endpoint.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' :
                      endpoint.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-indigo-400 font-mono">{endpoint.path}</code>
                    <span className="text-slate-500 text-sm ml-auto">{endpoint.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Help Section */}
            <section className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Need More Help?</h2>
                  <p className="text-slate-400">Our team is ready to assist with your integration.</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/help"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-secondary text-slate-300 font-medium transition-all"
                  >
                    Help Center
                    <ExternalLink className="w-4 h-4" />
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
