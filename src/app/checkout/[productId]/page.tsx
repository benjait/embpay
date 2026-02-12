"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Shield,
  CreditCard,
  Clock,
  ChevronRight,
  Tag,
  ShieldCheck,
  RefreshCw,
  Zap,
  Check,
  X,
} from "lucide-react";
import StripeProvider from "@/components/stripe-provider";
import PaymentForm from "@/components/payment-form";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  type: string;
  deliveryUrl: string | null;
  pricingType: string;
  minimumPrice: number | null;
  bumpEnabled: boolean;
  bumpProductId: string | null;
  bumpPrice: number | null;
  user: {
    businessName: string | null;
    name: string | null;
    stripeConnected: boolean;
  };
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = params.productId as string;

  // Query params
  const customPriceParam = searchParams.get("price");
  const bumpParam = searchParams.get("bump");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [includeBump, setIncludeBump] = useState(bumpParam === "true");

  // Stripe Elements state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

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

  const getSubtotal = () => {
    if (!product) return 0;
    // Use custom price from URL for Pay What You Want
    let total = customPriceParam 
      ? parseInt(customPriceParam) 
      : product.price;
    if (includeBump && product.bumpEnabled && product.bumpPrice) {
      total += product.bumpPrice;
    }
    return total;
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - couponDiscount);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !product) return;
    setApplyingCoupon(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, productId: product.id }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponApplied(true);
        setCouponDiscount(data.data?.discount || 0);
      } else {
        setCouponError(data.error || "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
  };

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!customerEmail) {
      setError("Email is required");
      return;
    }

    setError("");

    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerEmail,
          customerName,
          couponCode: couponApplied ? couponCode : undefined,
          includeBump,
          customPrice: customPriceParam ? parseInt(customPriceParam) : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data.clientSecret) {
        setClientSecret(data.data.clientSecret);
        setOrderId(data.data.orderId);
        setPaymentAmount(data.data.amount);
        setShowPayment(true);
      } else {
        setError(data.error || "Failed to initialize payment");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  const handlePaymentSuccess = () => {
    router.push(`/checkout/success?order_id=${orderId}`);
  };

  const handlePaymentError = (err: string) => {
    setError(err);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-[3px] border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Product Unavailable</h1>
          <p className="text-gray-500 text-sm leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const merchantName = product.user.businessName || product.user.name || "Merchant";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-600">Secure Checkout</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">256-bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-14">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column — Product Info (2/5) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24">
              {/* Product Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {product.imageUrl && (
                  <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-sm text-indigo-600 font-semibold mb-1.5 tracking-wide uppercase">
                    {merchantName}
                  </p>
                  <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {product.name}
                  </h1>
                  {product.description && (
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.type === "subscription" && (
                      <span className="text-gray-400 text-sm font-medium">/ month</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 space-y-3">
                {[
                  { icon: ShieldCheck, text: "SSL Secure Checkout", sub: "Your data is protected with 256-bit encryption" },
                  { icon: RefreshCw, text: "30-Day Money Back Guarantee", sub: "Not satisfied? Get a full refund, no questions" },
                  { icon: CreditCard, text: "Powered by Stripe", sub: "Trusted by millions of businesses worldwide" },
                ].map((badge) => (
                  <div
                    key={badge.text}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-gray-100"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <badge.icon className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{badge.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{badge.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — Checkout Form (3/5) */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {!showPayment ? (
              <form onSubmit={handleContinueToPayment}>
                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
                    Your Information
                  </h2>

                  {error && (
                    <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-500 text-xs font-bold">!</span>
                      </div>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-gray-50/50 hover:bg-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-gray-50/50 hover:bg-white text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">
                        Your receipt and access details will be sent here.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Bump */}
                {product.bumpEnabled && product.bumpPrice && (
                  <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300/60 p-5 sm:p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                      Limited Offer
                    </div>
                    <label className="flex items-start gap-4 cursor-pointer">
                      <div className="relative mt-1">
                        <input
                          type="checkbox"
                          checked={includeBump}
                          onChange={(e) => setIncludeBump(e.target.checked)}
                          className="w-5 h-5 rounded border-amber-400 text-indigo-600 focus:ring-indigo-500/30 cursor-pointer accent-indigo-600"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                          🔥 Yes! Add the bonus to my order
                        </p>
                        <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                          Upgrade your purchase with this exclusive add-on for just{" "}
                          <span className="font-bold text-indigo-600">
                            {formatPrice(product.bumpPrice, product.currency)}
                          </span>{" "}
                          — available only during checkout.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Coupon Section */}
                <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</span>
                    Coupon &amp; Summary
                  </h2>

                  {/* Coupon Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Tag className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                      Coupon Code
                    </label>
                    {couponApplied ? (
                      <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <Check className="w-4.5 h-4.5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700 flex-1">
                          {couponCode} applied — you save {formatPrice(couponDiscount, product.currency)}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase());
                            setCouponError("");
                          }}
                          placeholder="e.g. SAVE20"
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all bg-gray-50/50 hover:bg-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode.trim() || applyingCoupon}
                          className="px-5 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed border-0"
                        >
                          {applyingCoupon ? "..." : "Apply"}
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-xs text-red-500 mt-1.5">{couponError}</p>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-100 pt-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{product.name}</span>
                      <span className="text-gray-800 font-medium">{formatPrice(product.price, product.currency)}</span>
                    </div>
                    {includeBump && product.bumpPrice && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Bonus Add-on</span>
                        <span className="text-gray-800 font-medium">{formatPrice(product.bumpPrice, product.currency)}</span>
                      </div>
                    )}
                    {couponApplied && couponDiscount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-emerald-600">Coupon Discount</span>
                        <span className="text-emerald-600 font-medium">-{formatPrice(couponDiscount, product.currency)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                      <span className="text-base font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-extrabold text-gray-900">
                        {formatPrice(getTotal(), product.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <button
                    type="submit"
                    className="mt-6 w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-base transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 cursor-pointer border-0"
                  >
                    Continue to Payment
                    <ChevronRight className="w-4.5 h-4.5 -mr-1" />
                  </button>
                </div>
              </form>
            ) : clientSecret ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="mb-6">
                  <button
                    onClick={() => setShowPayment(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
                  >
                    ← Back to details
                  </button>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</span>
                    Payment Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete your purchase securely on EmbPay
                  </p>
                </div>

                <StripeProvider clientSecret={clientSecret}>
                  <PaymentForm
                    amount={paymentAmount}
                    currency={product.currency}
                    orderId={orderId || ""}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </StripeProvider>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-auto py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span>Powered by EmbPay</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Secure payments by Stripe</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Instant delivery
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
