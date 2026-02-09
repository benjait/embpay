"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Shield,
  ShieldCheck,
  CreditCard,
  Clock,
  Check,
  Zap,
  Star,
  ArrowRight,
  Package,
  Download,
  RefreshCw,
  X,
  Loader2,
  ImageIcon,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  type: string;
  interval: string | null;
  deliveryUrl: string | null;
  bumpEnabled: boolean;
  bumpProduct: string | null;
  bumpPrice: number | null;
  user: {
    businessName: string | null;
    name: string | null;
    stripeConnected: boolean;
  };
}

export default function PublicProductPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.data);
        } else {
          setError(data.error || "Product not found");
        }
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId]);

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-gray-400 text-sm font-medium">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Product Unavailable</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{error || "This product could not be found."}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const merchantName = product.user.businessName || product.user.name || "Creator";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">{merchantName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>Secure</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left — Product Info */}
          <div className="product-fade-in">
            {/* Product Image / Placeholder */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 border border-gray-100 shadow-sm">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full aspect-[16/10] object-cover"
                />
              ) : (
                <div className="w-full aspect-[16/10] flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <ImageIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-sm text-indigo-400/80 font-medium">Digital Product</p>
                </div>
              )}

              {/* Product type badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 shadow-sm border border-white/50">
                  {product.type === "subscription" ? (
                    <>
                      <RefreshCw className="w-3 h-3 text-indigo-500" />
                      Subscription
                    </>
                  ) : (
                    <>
                      <Package className="w-3 h-3 text-indigo-500" />
                      One-time purchase
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="mt-8 product-fade-in-delay-1">
              <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                {merchantName}
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              {product.description && (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* What's Included */}
              <div className="mt-8 space-y-3 product-fade-in-delay-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  What&apos;s Included
                </h3>
                {[
                  "Full product access",
                  "Instant digital delivery",
                  "Lifetime updates",
                  "Email support",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Purchase Card */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden product-fade-in-delay-1">
              {/* Price Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-8 text-white">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  {product.type === "subscription" && (
                    <span className="text-indigo-200 text-base font-medium">
                      / {product.interval || "month"}
                    </span>
                  )}
                </div>
                <p className="text-indigo-200 text-sm">
                  {product.type === "subscription"
                    ? "Cancel anytime — no commitment"
                    : "One-time payment — lifetime access"}
                </p>
              </div>

              <div className="p-6 sm:p-8">
                {/* Order Bump */}
                {product.bumpEnabled && product.bumpPrice && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/60 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg">
                      Bonus
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          🔥 {product.bumpProduct || "Exclusive Bonus"}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Add for just {formatPrice(product.bumpPrice, product.currency)} — available at checkout
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buy Now CTA */}
                <Link
                  href={`/checkout/${product.id}`}
                  className="group w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 no-underline"
                >
                  <Lock className="w-4 h-4" />
                  Buy Now
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                {/* Guarantees under CTA */}
                <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Secure checkout</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Instant delivery</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-gray-100" />

                {/* Trust badges */}
                <div className="space-y-4">
                  {[
                    {
                      icon: ShieldCheck,
                      title: "Secure Payment",
                      desc: "256-bit SSL encryption for all transactions",
                    },
                    {
                      icon: RefreshCw,
                      title: "30-Day Money Back",
                      desc: "Full refund if you're not satisfied",
                    },
                    {
                      icon: CreditCard,
                      title: "Trusted by Stripe",
                      desc: "Cards, Apple Pay, Google Pay accepted",
                    },
                    {
                      icon: Clock,
                      title: "Instant Access",
                      desc: "Get immediate access after purchase",
                    },
                  ].map((badge) => (
                    <div key={badge.title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                        <badge.icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{badge.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Powered by */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                <Zap className="w-3 h-3 text-indigo-400" />
                Powered by EmbPay
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span>Powered by EmbPay</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Secure payments by Stripe</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              PCI Compliant
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
