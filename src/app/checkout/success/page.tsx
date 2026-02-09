"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Mail,
  Download,
  Shield,
  ArrowLeft,
  Zap,
  ExternalLink,
  Package,
} from "lucide-react";

interface OrderData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string;
  customerName: string | null;
  product: {
    id: string;
    name: string;
    deliveryType: string;
    deliveryUrl: string | null;
    deliveryInstructions: string | null;
    imageUrl: string | null;
  };
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setTimeout(() => setShowCheckmark(true), 200);
      return;
    }

    // Fetch actual order data
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.data);
        }
      })
      .catch(() => {
        // Silently fail — we still show a generic success message
      })
      .finally(() => {
        setLoading(false);
        setTimeout(() => setShowCheckmark(true), 200);
      });
  }, [orderId]);

  // Notify parent if in iframe
  useEffect(() => {
    try {
      window.parent.postMessage(
        { type: "embpay:success", orderId },
        "*"
      );
    } catch {
      // Not in iframe
    }
  }, [orderId]);

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {loading ? (
          <div className="text-center py-16">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
              <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-500 font-medium text-sm">Confirming your payment...</p>
            <p className="text-gray-400 text-xs mt-1">This may take a moment</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Success Header */}
            <div className="relative px-8 pt-10 pb-8 text-center overflow-hidden">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-emerald-400/10 rounded-full blur-3xl" />

              {/* Animated Checkmark */}
              <div className="relative mx-auto mb-6">
                <div
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-700 ${
                    showCheckmark
                      ? "bg-emerald-500 scale-100 shadow-lg shadow-emerald-500/30"
                      : "bg-emerald-200 scale-75"
                  }`}
                >
                  <Check
                    className={`w-10 h-10 text-white transition-all duration-500 delay-200 ${
                      showCheckmark ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    }`}
                    strokeWidth={3}
                  />
                </div>
                {/* Pulse Ring */}
                {showCheckmark && (
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "2s", animationIterationCount: "2" }} />
                )}
              </div>

              <h1
                className={`relative text-2xl font-bold text-gray-900 mb-1.5 transition-all duration-500 delay-300 ${
                  showCheckmark ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Payment Successful!
              </h1>
              <p
                className={`relative text-gray-500 text-sm transition-all duration-500 delay-400 ${
                  showCheckmark ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                Thank you for your purchase
              </p>
            </div>

            <div className="px-8 pb-8">
              {/* Order Details */}
              {order ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    {order.product.imageUrl ? (
                      <img
                        src={order.product.imageUrl}
                        alt={order.product.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{order.product.name}</p>
                      <p className="text-emerald-600 font-bold text-lg">
                        {formatPrice(order.amount, order.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="bg-gray-50 rounded-2xl border border-gray-100 divide-y divide-gray-100">
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-gray-500">Order ID</span>
                      <span className="text-sm font-mono text-gray-700">{order.id.slice(0, 12)}...</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-gray-500">Email</span>
                      <span className="text-sm text-gray-700">{order.customerEmail}</span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Completed
                      </span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {order.product.deliveryInstructions && (
                    <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100">
                      <p className="text-sm font-semibold text-indigo-800 mb-1">
                        {order.product.deliveryType === "download"
                          ? "Download Instructions"
                          : order.product.deliveryType === "email"
                          ? "Delivery Details"
                          : "Next Steps"}
                      </p>
                      <p className="text-sm text-indigo-700/80 whitespace-pre-line">
                        {order.product.deliveryInstructions}
                      </p>
                    </div>
                  )}

                  {/* Delivery Action Button */}
                  {order.product.deliveryUrl && order.product.deliveryType === "download" && (
                    <a
                      href={order.product.deliveryUrl}
                      className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-semibold rounded-xl transition no-underline text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Your Files
                    </a>
                  )}

                  {order.product.deliveryUrl && order.product.deliveryType === "redirect" && (
                    <a
                      href={order.product.deliveryUrl}
                      className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold rounded-xl transition no-underline text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Access Your Purchase
                    </a>
                  )}

                  {order.product.deliveryUrl && (!order.product.deliveryType || order.product.deliveryType === "none") && (
                    <a
                      href={order.product.deliveryUrl}
                      className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-semibold rounded-xl transition no-underline text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Access Your Purchase
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                    <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-700 font-medium text-sm">Your order is being processed</p>
                    {orderId && (
                      <p className="text-gray-400 text-xs font-mono mt-1">
                        Order: {orderId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Email Notice */}
              <div className="mt-5 flex items-start gap-3.5 p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">Check your email</p>
                  <p className="text-xs text-blue-600/80 mt-0.5 leading-relaxed">
                    A receipt and any access details have been sent to your email address.
                  </p>
                </div>
              </div>

              {/* Status Steps */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: "Payment Secured", done: true },
                  { icon: Mail, label: order?.product.deliveryType === "email" ? "Sent to Email" : "Receipt Sent", done: true },
                  { icon: Download, label: order?.product.deliveryType === "download" ? "Ready to Download" : order?.product.deliveryType === "email" ? "Check Inbox" : "Ready to Access", done: true },
                ].map((step) => (
                  <div
                    key={step.label}
                    className="p-3 bg-emerald-50/50 rounded-xl text-center border border-emerald-100/50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-1.5">
                      <step.icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium">{step.label}</p>
                  </div>
                ))}
              </div>

              {/* Back Button */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition no-underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Store
                </a>
                {order?.product.deliveryUrl && order.product.deliveryType !== "email" && (
                  <a
                    href={order.product.deliveryUrl}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition no-underline"
                  >
                    {order.product.deliveryType === "download" ? "Download" : "Access Purchase"}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Zap className="w-3 h-3 text-indigo-500" />
                <span>Powered by EmbPay — Secure payments by Stripe</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-[3px] border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
