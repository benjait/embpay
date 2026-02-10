"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Link as LinkIcon,
  Code2,
  MousePointerClick,
  FileCode2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Palette,
  Layout,
  Loader2,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";

// ── Types ────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  type: string;
  active: boolean;
}

// ── Component ────────────────────────────────────────────
export default function EmbedPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Customization options
  const [buttonColor, setButtonColor] = useState("#6366f1");
  const [buttonText, setButtonText] = useState("Buy Now");
  const [embedMode, setEmbedMode] = useState<"popup" | "redirect" | "embed">(
    "popup"
  );
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { credentials: "include" });
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setProducts(data.data);
        setSelectedProduct(data.data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://embpay.com";
  };

  const baseUrl = getBaseUrl();

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const selectedProductData = products.find((p) => p.id === selectedProduct);
  const priceLabel = selectedProductData
    ? formatPrice(selectedProductData.price)
    : "$0.00";

  function generateCodes(productId: string) {
    return {
      directLink: `${baseUrl}/checkout/${productId}`,
      iframe: `<iframe
  src="${baseUrl}/embed/${productId}"
  style="width:100%;max-width:480px;height:620px;border:none;border-radius:12px;"
  allowtransparency="true">
</iframe>`,
      button: `<a
  href="${baseUrl}/checkout/${productId}"
  style="display:inline-block;padding:14px 36px;background:${buttonColor};color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;font-family:system-ui,sans-serif;transition:background 0.2s;"
  onmouseover="this.style.opacity='0.9'"
  onmouseout="this.style.opacity='1'">
  ${buttonText}
</a>`,
      script: `<div id="embpay-widget"></div>
<script
  src="${baseUrl}/embed.js"
  data-product="${productId}"
  data-mode="${embedMode}"
  data-color="${buttonColor}"
  data-text="${buttonText}"
  data-theme="${theme}">
</script>`,
    };
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const colorPresets = [
    { value: "#6366f1", label: "Indigo" },
    { value: "#8b5cf6", label: "Purple" },
    { value: "#059669", label: "Emerald" },
    { value: "#2563eb", label: "Blue" },
    { value: "#dc2626", label: "Red" },
    { value: "#ea580c", label: "Orange" },
    { value: "#0d9488", label: "Teal" },
    { value: "#4f46e5", label: "Violet" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 bg-white/[0.06] rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-white/[0.04] rounded-lg animate-pulse mt-2" />
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Embed Codes
          </h1>
          <p className="text-slate-400 mt-1">
            Add EmbPay checkout to your website in seconds
          </p>
        </div>
        <Card>
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
              <Package className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No products yet
            </h3>
            <p className="text-slate-400 mb-6 max-w-sm mx-auto">
              Create a product first, then come back to get your embed codes.
            </p>
            <a href="/dashboard/products/new">
              <Button>Create a Product</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const codes = generateCodes(selectedProduct);

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} — ${formatPrice(p.price)}${p.type === "subscription" ? "/mo" : ""}`,
  }));

  const embedOptions = [
    {
      id: "directLink",
      icon: LinkIcon,
      title: "Direct Link",
      description: "Share a direct checkout link with customers",
      badge: "URL",
      code: codes.directLink,
      preview: (
        <div className="p-4 rounded-lg bg-slate-950/50 border border-white/[0.04]">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 text-sm break-all"
          >
            {codes.directLink}
          </a>
        </div>
      ),
    },
    {
      id: "iframe",
      icon: Code2,
      title: "Embed (iframe)",
      description: "Embed the checkout form directly on your page",
      badge: "HTML",
      code: codes.iframe,
      preview: (
        <div className="p-4 rounded-lg bg-slate-950/50 border border-white/[0.04]">
          <div className="w-full max-w-[280px] mx-auto bg-slate-900/80 rounded-xl border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="h-3 w-24 bg-white/[0.08] rounded" />
            </div>
            <div className="p-4 space-y-3">
              <div className="h-2.5 w-full bg-white/[0.06] rounded" />
              <div className="h-2.5 w-3/4 bg-white/[0.06] rounded" />
              <div
                className="h-8 w-full rounded-lg mt-4 flex items-center justify-center"
                style={{ backgroundColor: buttonColor }}
              >
                <span className="text-xs text-white font-medium">
                  Pay {priceLabel}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center mt-3">
            iframe preview
          </p>
        </div>
      ),
    },
    {
      id: "button",
      icon: MousePointerClick,
      title: "Buy Now Button",
      description: "A styled button that links to checkout",
      badge: "HTML",
      code: codes.button,
      preview: (
        <div className="p-6 rounded-lg bg-slate-950/50 border border-white/[0.04] flex justify-center">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-block px-9 py-3.5 text-white rounded-lg font-semibold text-base hover:opacity-90 transition-opacity no-underline shadow-lg"
            style={{
              backgroundColor: buttonColor,
              boxShadow: `0 4px 14px ${buttonColor}33`,
            }}
          >
            {buttonText}
          </a>
        </div>
      ),
    },
    {
      id: "script",
      icon: FileCode2,
      title: "JavaScript Widget",
      description: "Auto-rendering widget with theme support",
      badge: "JS",
      code: codes.script,
      preview: (
        <div className="p-4 rounded-lg bg-slate-950/50 border border-white/[0.04]">
          <div className="w-full max-w-[280px] mx-auto bg-slate-900/80 rounded-xl border border-white/[0.06] overflow-hidden shadow-lg">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${buttonColor}20` }}
                >
                  <Sparkles
                    className="h-4 w-4"
                    style={{ color: buttonColor }}
                  />
                </div>
                <div>
                  <div className="h-3 w-28 bg-white/[0.08] rounded" />
                  <div className="h-2 w-16 bg-white/[0.06] rounded mt-1.5" />
                </div>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="space-y-2">
                <div className="h-2 w-full bg-white/[0.06] rounded" />
                <div className="h-2 w-2/3 bg-white/[0.06] rounded" />
              </div>
              <div
                className="h-9 w-full rounded-lg flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: buttonColor,
                  boxShadow: `0 2px 8px ${buttonColor}33`,
                }}
              >
                <span className="text-xs text-white font-medium">
                  {buttonText} — {priceLabel}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 text-center">
                Powered by EmbPay
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-600 text-center mt-3">
            Widget preview
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Embed Codes
        </h1>
        <p className="text-slate-400 mt-1">
          Add EmbPay checkout to your website in seconds
        </p>
      </div>

      {/* Product Selector & Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selector */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Select Product
                </h2>
                <p className="text-sm text-slate-400">
                  Choose which product to generate codes for
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Product"
              options={productOptions}
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            />
            <Button
              variant="outline"
              size="md"
              onClick={() =>
                window.open(`/checkout/${selectedProduct}`, "_blank")
              }
            >
              <ExternalLink className="h-4 w-4" />
              Preview Checkout
            </Button>
          </CardContent>
        </Card>

        {/* Customization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Customize
                </h2>
                <p className="text-sm text-slate-400">
                  Adjust appearance and behavior
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Button Text */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">
                Button Text
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Buy Now"
                className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all"
              />
            </div>

            {/* Button Color */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Button Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorPresets.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setButtonColor(color.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                      buttonColor === color.value
                        ? "border-white scale-110 shadow-lg"
                        : "border-transparent hover:border-white/30 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-slate-500 font-mono ml-1">
                  {buttonColor}
                </span>
              </div>
            </div>

            {/* Widget Mode & Theme */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Widget Mode
                </label>
                <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
                  {(["popup", "redirect", "embed"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setEmbedMode(m)}
                      className={`flex-1 px-2 py-2 text-xs font-medium capitalize transition-all duration-200 ${
                        embedMode === m
                          ? "bg-indigo-600 text-white"
                          : "bg-white/[0.02] text-slate-400 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Theme
                </label>
                <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
                  {(["dark", "light"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`flex-1 px-3 py-2 text-xs font-medium capitalize transition-all duration-200 ${
                        theme === t
                          ? "bg-indigo-600 text-white"
                          : "bg-white/[0.02] text-slate-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live button preview */}
            <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <p className="text-xs text-slate-500 mb-3">Live Preview:</p>
              <div className="flex justify-center">
                <button
                  className="px-7 py-3 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 shadow-lg"
                  style={{
                    backgroundColor: buttonColor,
                    boxShadow: `0 4px 14px ${buttonColor}33`,
                  }}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview iframe */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Layout className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Live Checkout Preview
              </h2>
              <p className="text-sm text-slate-400">
                See how your checkout page looks
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-white/[0.06] overflow-hidden bg-slate-950">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white/[0.05] rounded-md px-3 py-1 text-xs text-slate-500 font-mono truncate">
                  {baseUrl}/embed/{selectedProduct}
                </div>
              </div>
            </div>
            <iframe
              src={`/embed/${selectedProduct}`}
              className="w-full border-0"
              style={{ height: "520px" }}
              title="Checkout Preview"
            />
          </div>
        </CardContent>
      </Card>

      {/* Embed Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {embedOptions.map((option) => {
          const Icon = option.icon;
          const isCopied = copiedField === option.id;

          return (
            <Card
              key={option.id}
              className="overflow-hidden hover:border-white/[0.1] transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {option.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="info">{option.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Code Block */}
                <div className="relative group/code">
                  <pre className="p-4 rounded-lg bg-slate-950/70 border border-white/[0.04] text-xs text-slate-300 overflow-x-auto font-mono leading-relaxed">
                    {option.code}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(option.code, option.id)}
                    className={`absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                      isCopied
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.1] border border-white/[0.06]"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Preview */}
                {option.preview}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
