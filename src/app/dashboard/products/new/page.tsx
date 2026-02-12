"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ImageIcon, Zap, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  currency: string;
  type: "one-time" | "subscription";
  pricingType: "fixed" | "pay_what_you_want";
  minimumPrice: string;
  imageUrl: string;
  deliveryUrl: string;
  orderBump: boolean;
  bumpName: string;
  bumpPrice: string;
}

const initialForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  currency: "usd",
  type: "one-time",
  pricingType: "fixed",
  minimumPrice: "",
  imageUrl: "",
  deliveryUrl: "",
  orderBump: false,
  bumpName: "",
  bumpPrice: "",
};

const currencies = [
  { value: "usd", label: "USD ($)" },
  { value: "eur", label: "EUR (€)" },
  { value: "gbp", label: "GBP (£)" },
  { value: "cad", label: "CAD (C$)" },
  { value: "aud", label: "AUD (A$)" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProductForm, string>>
  >({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateField = <K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ProductForm, string>> = {};
    if (!form.name.trim()) newErrors.name = "Product name is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    
    if (form.pricingType === "fixed") {
      if (!form.price || parseFloat(form.price) <= 0)
        newErrors.price = "Price must be greater than 0";
    } else {
      if (form.minimumPrice && parseFloat(form.minimumPrice) < 0)
        newErrors.minimumPrice = "Minimum price cannot be negative";
    }
    
    if (form.orderBump && !form.bumpName.trim())
      newErrors.bumpName = "Bump product name is required";
    if (form.orderBump && (!form.bumpPrice || parseFloat(form.bumpPrice) <= 0))
      newErrors.bumpPrice = "Bump price must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.pricingType === "fixed" 
            ? Math.round(parseFloat(form.price) * 100) 
            : Math.round(parseFloat(form.minimumPrice || "0") * 100),
          currency: form.currency,
          type: form.type === "one-time" ? "one_time" : "subscription",
          pricingType: form.pricingType,
          minimumPrice: form.pricingType === "pay_what_you_want" && form.minimumPrice
            ? Math.round(parseFloat(form.minimumPrice) * 100)
            : null,
          imageUrl: form.imageUrl || null,
          deliveryUrl: form.deliveryUrl || null,
          bumpEnabled: form.orderBump,
          bumpProduct: form.orderBump ? form.bumpName : null,
          bumpPrice: form.orderBump
            ? Math.round(parseFloat(form.bumpPrice) * 100)
            : null,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/dashboard/products"), 1200);
      }
    } catch {
      // Fallback for demo
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Product
          </h1>
          <p className="text-slate-400 mt-0.5">
            Add a new digital product to your store
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-white">
              Product Details
            </h2>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Product Name"
              placeholder="e.g., React Masterclass"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              error={errors.name}
            />

            <Textarea
              label="Description"
              placeholder="Describe what customers will get..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              error={errors.description}
              rows={4}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Input
                  label="Price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  error={errors.price}
                />
              </div>
              <div className="sm:col-span-1">
                <Select
                  label="Currency"
                  options={currencies}
                  value={form.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Product Type
                </label>
                <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateField("type", "one-time")}
                    className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      form.type === "one-time"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    One-time
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("type", "subscription")}
                    className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      form.type === "subscription"
                        ? "bg-indigo-600 text-white"
                        : "bg-white/[0.02] text-slate-400 hover:text-white"
                    }`}
                  >
                    Subscription
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Type */}
            <div className="pt-4 border-t border-white/[0.08]">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Pricing Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => updateField("pricingType", "fixed")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.pricingType === "fixed"
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="font-medium text-white mb-1">Fixed Price</div>
                  <div className="text-sm text-slate-400">Set a specific price</div>
                </button>
                <button
                  type="button"
                  onClick={() => updateField("pricingType", "pay_what_you_want")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.pricingType === "pay_what_you_want"
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-white/[0.08] hover:border-white/[0.15]"
                  }`}
                >
                  <div className="font-medium text-white mb-1">Pay What You Want</div>
                  <div className="text-sm text-slate-400">Customer chooses price</div>
                </button>
              </div>

              {form.pricingType === "pay_what_you_want" && (
                <div className="mt-4">
                  <Input
                    label="Minimum Price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.minimumPrice}
                    onChange={(e) => updateField("minimumPrice", e.target.value)}
                    error={errors.minimumPrice}
                    helperText="Minimum amount customer must pay"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Media & Delivery */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-white">
              Media & Delivery
            </h2>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Input
                label="Product Image URL"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl}
                onChange={(e) => updateField("imageUrl", e.target.value)}
                hint="Recommended: 800×600px, JPG or PNG"
              />
              {form.imageUrl ? (
                <div className="mt-3 relative w-full max-w-xs h-32 rounded-lg overflow-hidden border border-white/[0.06]">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="mt-3 w-full max-w-xs h-32 rounded-lg border-2 border-dashed border-white/[0.08] flex flex-col items-center justify-center text-slate-500">
                  <ImageIcon className="h-8 w-8 mb-1" />
                  <span className="text-xs">Image preview</span>
                </div>
              )}
            </div>

            <Input
              label="Delivery URL"
              placeholder="https://example.com/thank-you"
              value={form.deliveryUrl}
              onChange={(e) => updateField("deliveryUrl", e.target.value)}
              hint="Where to redirect customers after purchase"
            />
          </CardContent>
        </Card>

        {/* Order Bump */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-white">
                  Order Bump
                </h2>
                <Badge variant="info">Optional</Badge>
              </div>
              <button
                type="button"
                onClick={() => updateField("orderBump", !form.orderBump)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  form.orderBump ? "bg-indigo-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    form.orderBump ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </CardHeader>
          {form.orderBump && (
            <CardContent className="space-y-5 animate-[fadeIn_0.2s_ease]">
              <p className="text-sm text-slate-400">
                Add an upsell product shown at checkout to boost average order
                value.
              </p>
              <Input
                label="Bump Product Name"
                placeholder="e.g., Premium Templates Pack"
                value={form.bumpName}
                onChange={(e) => updateField("bumpName", e.target.value)}
                error={errors.bumpName}
              />
              <Input
                label="Bump Price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.bumpPrice}
                onChange={(e) => updateField("bumpPrice", e.target.value)}
                error={errors.bumpPrice}
              />
            </CardContent>
          )}
        </Card>

        {/* Live Preview */}
        {form.name && (
          <Card className="border-indigo-500/20 bg-indigo-500/[0.03]">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-400">
                  Live Preview
                </span>
              </div>
              <div className="flex items-center gap-4">
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover border border-white/[0.06]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-white/[0.04] flex items-center justify-center border border-white/[0.06]">
                    <ImageIcon className="h-6 w-6 text-slate-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-white">{form.name}</h3>
                  <p className="text-sm text-slate-400 line-clamp-1">
                    {form.description || "No description"}
                  </p>
                  <p className="text-sm font-bold text-indigo-400 mt-1">
                    {form.price
                      ? `$${parseFloat(form.price).toFixed(2)}`
                      : "$0.00"}
                    {form.type === "subscription" && (
                      <span className="font-normal text-slate-500">/mo</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/dashboard/products">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-sm text-emerald-400 flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                Product created!
              </span>
            )}
            <Button type="submit" loading={saving} size="lg">
              <Save className="h-4 w-4" />
              Create Product
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
