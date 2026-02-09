"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  bumpEnabled: boolean;
  bumpPrice: number | null;
  user: {
    businessName: string | null;
    name: string | null;
    stripeConnected: boolean;
  };
}

export default function EmbedCheckoutPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [includeBump, setIncludeBump] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);

  // Stripe Elements state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [creatingIntent, setCreatingIntent] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProduct(data.data);
        else setError(data.error || "Product not found");
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
    let total = product.price;
    if (includeBump && product.bumpEnabled && product.bumpPrice) {
      total += product.bumpPrice;
    }
    return total;
  };

  const getTotal = () => Math.max(0, getSubtotal() - couponDiscount);

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
        setCouponError(data.error || "Invalid coupon");
      }
    } catch {
      setCouponError("Failed to validate");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleContinueToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !customerEmail) return;

    setCreatingIntent(true);
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
    } finally {
      setCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    // Notify parent window
    try {
      window.parent.postMessage(
        { type: "embpay:success", orderId },
        "*"
      );
    } catch {
      // Not in iframe
    }
  };

  const handlePaymentError = (err: string) => {
    setError(err);
  };

  // Inline styles for iframe isolation
  const styles = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: 440,
      margin: "0 auto",
      padding: "20px 16px",
      background: "#fff",
      color: "#111827",
      minHeight: "100vh",
      boxSizing: "border-box" as const,
    },
    productCard: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: 16,
      background: "#f9fafb",
      borderRadius: 16,
      border: "1px solid #f3f4f6",
      marginBottom: 20,
    },
    productImg: {
      width: 56,
      height: 56,
      borderRadius: 12,
      objectFit: "cover" as const,
      background: "#e5e7eb",
      flexShrink: 0,
    },
    productName: {
      fontSize: 15,
      fontWeight: 700,
      color: "#111827",
      margin: 0,
      lineHeight: 1.3,
    },
    productPrice: {
      fontSize: 22,
      fontWeight: 800,
      color: "#4f46e5",
      margin: "4px 0 0 0",
    },
    priceUnit: {
      fontSize: 12,
      fontWeight: 400,
      color: "#9ca3af",
    },
    label: {
      display: "block",
      fontSize: 13,
      fontWeight: 500,
      color: "#374151",
      marginBottom: 6,
    },
    required: {
      color: "#ef4444",
    },
    input: {
      width: "100%",
      padding: "11px 14px",
      border: "1.5px solid #e5e7eb",
      borderRadius: 12,
      fontSize: 14,
      outline: "none",
      background: "#fafafa",
      color: "#111827",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxSizing: "border-box" as const,
    },
    inputFocusStyles: `
      input:focus { border-color: #818cf8 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; background: #fff !important; }
      input::placeholder { color: #9ca3af; }
    `,
    fieldGroup: {
      marginBottom: 14,
    },
    bumpBox: {
      margin: "18px 0",
      padding: 14,
      border: "2px dashed #fbbf24",
      background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
      borderRadius: 14,
      cursor: "pointer",
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
    },
    bumpCheckbox: {
      width: 20,
      height: 20,
      marginTop: 2,
      accentColor: "#4f46e5",
      cursor: "pointer",
      flexShrink: 0,
    },
    bumpTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: "#111827",
      margin: 0,
    },
    bumpDesc: {
      fontSize: 13,
      color: "#6b7280",
      margin: "4px 0 0",
      lineHeight: 1.5,
    },
    summaryRow: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 13,
      color: "#6b7280",
      marginBottom: 8,
    },
    summaryTotal: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 18,
      fontWeight: 800,
      color: "#111827",
      paddingTop: 12,
      borderTop: "1.5px solid #f3f4f6",
      marginTop: 4,
    },
    payBtn: {
      width: "100%",
      padding: "15px 20px",
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      color: "#fff",
      border: "none",
      borderRadius: 14,
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      marginTop: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      transition: "opacity 0.2s, transform 0.1s",
      boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
    },
    payBtnDisabled: {
      opacity: 0.55,
      cursor: "not-allowed",
    },
    errorMsg: {
      padding: "12px 14px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: 12,
      color: "#dc2626",
      fontSize: 13,
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    footer: {
      textAlign: "center" as const,
      marginTop: 18,
      paddingTop: 14,
      borderTop: "1px solid #f3f4f6",
    },
    footerText: {
      fontSize: 11,
      color: "#9ca3af",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    couponToggle: {
      fontSize: 12,
      color: "#6366f1",
      cursor: "pointer",
      background: "none",
      border: "none",
      fontWeight: 500,
      padding: 0,
      margin: "0 0 14px 0",
      display: "flex",
      alignItems: "center",
      gap: 4,
    },
    couponRow: {
      display: "flex",
      gap: 8,
      marginBottom: 14,
    },
    couponApplyBtn: {
      padding: "10px 18px",
      background: "#111827",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      whiteSpace: "nowrap" as const,
      flexShrink: 0,
    },
    couponApplied: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 14px",
      background: "#ecfdf5",
      border: "1px solid #a7f3d0",
      borderRadius: 12,
      fontSize: 13,
      color: "#059669",
      fontWeight: 500,
      marginBottom: 14,
    },
    trustRow: {
      display: "flex",
      justifyContent: "center",
      gap: 16,
      marginTop: 12,
      fontSize: 11,
      color: "#9ca3af",
    },
    trustItem: {
      display: "flex",
      alignItems: "center",
      gap: 4,
    },
    spinner: {
      width: 18,
      height: 18,
      border: "2px solid rgba(255,255,255,0.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "embpay-spin 0.7s linear infinite",
    },
    spinnerSm: {
      width: 14,
      height: 14,
      border: "2px solid #d1d5db",
      borderTopColor: "#4f46e5",
      borderRadius: "50%",
      animation: "embpay-spin 0.7s linear infinite",
      display: "inline-block",
    },
    backBtn: {
      fontSize: 13,
      color: "#6b7280",
      cursor: "pointer",
      background: "none",
      border: "none",
      padding: "4px 0",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 4,
    },
    successContainer: {
      textAlign: "center" as const,
      padding: "40px 20px",
    },
    successIcon: {
      width: 64,
      height: 64,
      borderRadius: "50%",
      background: "#10b981",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px",
      boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
    },
  };

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes embpay-spin { to { transform: rotate(360deg); } }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #fff; }
        `}</style>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, fontFamily: styles.container.fontFamily }}>
          <div style={{ textAlign: "center" }}>
            <div style={styles.spinnerSm} />
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 12 }}>Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  if (error && !product) {
    return (
      <>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #fff; }`}</style>
        <div style={{ padding: 24, fontFamily: styles.container.fontFamily }}>
          <div style={styles.errorMsg}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      </>
    );
  }

  if (!product) return null;

  // Success state
  if (paymentSuccess) {
    return (
      <>
        <style>{`
          @keyframes embpay-spin { to { transform: rotate(360deg); } }
          @keyframes embpay-pop { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #fff; margin: 0; }
        `}</style>
        <div style={styles.container}>
          <div style={styles.successContainer as React.CSSProperties}>
            <div style={styles.successIcon as React.CSSProperties}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", marginBottom: 8 }}>
              Payment Successful!
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
              Thank you for your purchase. A receipt has been sent to{" "}
              <strong style={{ color: "#374151" }}>{customerEmail}</strong>.
            </p>

            <div style={{ ...styles.productCard, justifyContent: "center" }}>
              {product.imageUrl && (
                <img src={product.imageUrl} alt={product.name} style={styles.productImg} />
              )}
              <div style={{ textAlign: "left" as const }}>
                <p style={styles.productName}>{product.name}</p>
                <p style={{ ...styles.productPrice, fontSize: 18 }}>
                  {formatPrice(paymentAmount, product.currency)}
                </p>
              </div>
            </div>

            {orderId && (
              <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace", marginTop: 12 }}>
                Order: {orderId}
              </p>
            )}
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              <span style={{ color: "#6366f1" }}>⚡</span>
              Powered by EmbPay
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes embpay-spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; margin: 0; }
        ${styles.inputFocusStyles}
        .embpay-pay:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .embpay-pay:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={styles.container}>
        {/* Product Header */}
        <div style={styles.productCard}>
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} style={styles.productImg} />
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={styles.productName}>{product.name}</p>
            <p style={styles.productPrice}>
              {formatPrice(product.price, product.currency)}
              {product.type === "subscription" && (
                <span style={styles.priceUnit}> /mo</span>
              )}
            </p>
          </div>
        </div>

        {!showPayment ? (
          <form onSubmit={handleContinueToPayment}>
            {error && (
              <div style={styles.errorMsg}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your name"
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Email <span style={styles.required}>*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="you@email.com"
                required
                style={styles.input}
              />
            </div>

            {/* Coupon */}
            {!couponApplied && !showCoupon && (
              <button
                type="button"
                onClick={() => setShowCoupon(true)}
                style={styles.couponToggle}
              >
                🏷️ Have a coupon code?
              </button>
            )}

            {showCoupon && !couponApplied && (
              <div style={styles.couponRow}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  placeholder="SAVE20"
                  style={{ ...styles.input, marginBottom: 0 }}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || applyingCoupon}
                  style={{
                    ...styles.couponApplyBtn,
                    opacity: (!couponCode.trim() || applyingCoupon) ? 0.4 : 1,
                  }}
                >
                  {applyingCoupon ? <span style={styles.spinnerSm} /> : "Apply"}
                </button>
              </div>
            )}

            {couponError && (
              <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 14, marginTop: -8 }}>{couponError}</p>
            )}

            {couponApplied && (
              <div style={styles.couponApplied}>
                <span>✓</span>
                <span style={{ flex: 1 }}>{couponCode} applied</span>
                <button
                  type="button"
                  onClick={() => {
                    setCouponApplied(false);
                    setCouponDiscount(0);
                    setCouponCode("");
                    setShowCoupon(false);
                  }}
                  style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 16, padding: 0 }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Bump */}
            {product.bumpEnabled && product.bumpPrice && (
              <label style={styles.bumpBox}>
                <input
                  type="checkbox"
                  checked={includeBump}
                  onChange={(e) => setIncludeBump(e.target.checked)}
                  style={styles.bumpCheckbox}
                />
                <div>
                  <p style={styles.bumpTitle}>
                    🔥 Add bonus for{" "}
                    <span style={{ color: "#4f46e5" }}>
                      {formatPrice(product.bumpPrice, product.currency)}
                    </span>
                  </p>
                  <p style={styles.bumpDesc}>
                    Exclusive add-on — only available now!
                  </p>
                </div>
              </label>
            )}

            {/* Summary */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1.5px solid #f3f4f6" }}>
              <div style={styles.summaryRow}>
                <span>{product.name}</span>
                <span style={{ color: "#374151", fontWeight: 500 }}>
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
              {includeBump && product.bumpPrice && (
                <div style={styles.summaryRow}>
                  <span>Bonus Add-on</span>
                  <span style={{ color: "#374151", fontWeight: 500 }}>
                    {formatPrice(product.bumpPrice, product.currency)}
                  </span>
                </div>
              )}
              {couponApplied && couponDiscount > 0 && (
                <div style={{ ...styles.summaryRow, color: "#059669" }}>
                  <span>Discount</span>
                  <span>-{formatPrice(couponDiscount, product.currency)}</span>
                </div>
              )}
              <div style={styles.summaryTotal}>
                <span>Total</span>
                <span>{formatPrice(getTotal(), product.currency)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={creatingIntent}
              className="embpay-pay"
              style={{
                ...styles.payBtn,
                ...(creatingIntent ? styles.payBtnDisabled : {}),
              }}
            >
              {creatingIntent ? (
                <>
                  <div style={styles.spinner} />
                  Processing...
                </>
              ) : (
                <>🔒 Continue to Payment</>
              )}
            </button>
          </form>
        ) : clientSecret ? (
          <div>
            <button
              type="button"
              onClick={() => setShowPayment(false)}
              style={styles.backBtn}
            >
              ← Back to details
            </button>

            {error && (
              <div style={styles.errorMsg}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                Payment Details
              </p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>
                Complete your purchase securely
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

        {/* Trust badges */}
        {!showPayment && (
          <div style={styles.trustRow}>
            <span style={styles.trustItem}>🔒 SSL Secure</span>
            <span style={styles.trustItem}>⚡ Instant Access</span>
            <span style={styles.trustItem}>💳 Stripe</span>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            <span style={{ color: "#6366f1" }}>⚡</span>
            Powered by EmbPay
          </p>
        </div>
      </div>
    </>
  );
}
