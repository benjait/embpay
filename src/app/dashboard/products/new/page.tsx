"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ImageIcon, Zap, Check, Globe, Mail, Package, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Tabs for different sections
const TABS = [
  { id: "basic", label: "Basic", icon: Package },
  { id: "pricing", label: "Pricing", icon: Tag },
  { id: "advanced", label: "Advanced", icon: Zap },
];

interface ProductForm {
  // Basic
  name: string;
  description: string;
  imageUrl: string;
  deliveryUrl: string;
  deliveryInstructions: string;
  
  // Pricing
  price: string;
  currency: string;
  type: "one-time" | "subscription";
  pricingType: "fixed" | "pay_what_you_want";
  minimumPrice: string;
  
  // Trial (for subscriptions)
  trialEnabled: boolean;
  trialDays: string;
  trialPrice: string;
  
  // Quantity limits
  quantityLimitEnabled: boolean;
  quantityLimit: string;
  
  // Geo restrictions
  geoRestrictionEnabled: boolean;
  allowedCountries: string;
  
  // Custom email
  customEmailEnabled: boolean;
  customEmailSubject: string;
  customEmailBody: string;
  
  // Bump
  orderBump: boolean;
  bumpName: string;
  bumpPrice: string;
}

const initialForm: ProductForm = {
  name: "",
  description: "",
  imageUrl: "",
  deliveryUrl: "",
  deliveryInstructions: "",
  price: "",
  currency: "usd",
  type: "one-time",
  pricingType: "fixed",
  minimumPrice: "",
  trialEnabled: false,
  trialDays: "7",
  trialPrice: "0",
  quantityLimitEnabled: false,
  quantityLimit: "",
  geoRestrictionEnabled: false,
  allowedCountries: "",
  customEmailEnabled: false,
  customEmailSubject: "",
  customEmailBody: "",
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

const trialOptions = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("basic");
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
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
    if (!form.description.trim()) newErrors.description = "Description is required";
    
    if (form.pricingType === "fixed") {
      if (!form.price || parseFloat(form.price) <= 0)
        newErrors.price = "Price must be greater than 0";
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
    if (!validate()) {
      // Switch to tab with error
      if (errors.name || errors.description) setActiveTab("basic");
      else if (errors.price) setActiveTab("pricing");
      return;
    }

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
          imageUrl: form.imageUrl || null,
          deliveryUrl: form.deliveryUrl || null,
          deliveryInstructions: form.deliveryInstructions || null,
          // Pricing
          pricingType: form.pricingType,
          minimumPrice: form.pricingType === "pay_what_you_want" && form.minimumPrice
            ? Math.round(parseFloat(form.minimumPrice) * 100)
            : null,
          // Trial
          trialEnabled: form.trialEnabled,
          trialDays: form.trialEnabled ? parseInt(form.trialDays) : null,
          trialPrice: form.trialEnabled && form.trialPrice
            ? Math.round(parseFloat(form.trialPrice) * 100)
            : null,
          // Quantity
          quantityLimitEnabled: form.quantityLimitEnabled,
          quantityLimit: form.quantityLimitEnabled && form.quantityLimit
            ? parseInt(form.quantityLimit)
            : null,
          // Geo
          geoRestrictionEnabled: form.geoRestrictionEnabled,
          allowedCountries: form.geoRestrictionEnabled && form.allowedCountries
            ? form.allowedCountries.split(",").map(c => c.trim())
            : null,
          // Email
          customEmailEnabled: form.customEmailEnabled,
          customEmailSubject: form.customEmailEnabled ? form.customEmailSubject : null,
          customEmailBody: form.customEmailEnabled ? form.customEmailBody : null,
          // Bump
          bumpEnabled: form.orderBump,
          bumpProduct: form.orderBump ? form.bumpName : null,
          bumpPrice: form.orderBump && form.bumpPrice
            ? Math.round(parseFloat(form.bumpPrice) * 100)
            : null,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/dashboard/products"), 1200);
      }
    } catch {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/products"
          className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Product</h1>
          <p className="text-slate-400 mt-0.5">Add a new digital product to your store</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.08] pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB: Basic */}
        {activeTab === "basic" && (
          <Card>
            <CardHeader>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-400" />
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

              <Textarea
                label="Delivery Instructions"
                placeholder="Instructions for accessing the product after purchase..."
                value={form.deliveryInstructions}
                onChange={(e) => updateField("deliveryInstructions", e.target.value)}
                rows={3}
                hint="Or provide a delivery URL below"
              />

              <Input
                label="Delivery URL (Optional)"
                placeholder="https://example.com/download"
                value={form.deliveryUrl}
                onChange={(e) => updateField("deliveryUrl", e.target.value)}
                hint="Direct download link or access page"
              />
            </CardContent>
          </Card>
        )}

        {/* TAB: Pricing */}
        {activeTab === "pricing" && (
          <div className="space-y-6">
            {/* Main Pricing */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Tag className="h-4 w-4 text-indigo-400" />
                  Pricing Setup
                </h2>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Product Type
                  </label>
                  <div className="flex rounded-lg border border-white/[0.08] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateField("type", "one-time")}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${
                        form.type === "one-time"
                          ? "bg-indigo-600 text-white"
                          : "bg-white/[0.02] text-slate-400 hover:text-white"
                      }`}
                    >
                      One-time Purchase
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField("type", "subscription")}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${
                        form.type === "subscription"
                          ? "bg-indigo-600 text-white"
                          : "bg-white/[0.02] text-slate-400 hover:text-white"
                      }`}
                    >
                      Subscription
                    </button>
                  </div>
                </div>

                {/* Pricing Type */}
                <div className="pt-4 border-t border-white/[0.08]">
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Pricing Model
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
                      <div className="text-sm text-slate-400">You set the price</div>
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
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <Input
                        label="Minimum Price (Optional)"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={form.minimumPrice}
                        onChange={(e) => updateField("minimumPrice", e.target.value)}
                        hint="Leave empty to allow any amount including free"
                      />
                    </div>
                  )}
                </div>

                {/* Price & Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
                  <div className="sm:col-span-1">
                    <Input
                      label={form.pricingType === "pay_what_you_want" ? "Suggested Price" : "Price"}
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
                </div>
              </CardContent>
            </Card>

            {/* Trial Period - Only for subscriptions */}
            {form.type === "subscription" && (
              <Card>
                <CardHeader>
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    Trial Period
                    <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.trialEnabled}
                      onChange={(e) => updateField("trialEnabled", e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-slate-800 text-indigo-500"
                    />
                    <span className="text-white">Enable free/paid trial</span>
                  </label>

                  {form.trialEnabled && (
                    <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          label="Trial Duration"
                          options={trialOptions}
                          value={form.trialDays}
                          onChange={(e) => updateField("trialDays", e.target.value)}
                        />
                        <Input
                          label="Trial Price (Optional)"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00 = Free"
                          value={form.trialPrice}
                          onChange={(e) => updateField("trialPrice", e.target.value)}
                          hint="Leave at 0 for free trial"
                        />
                      </div>
                      <p className="text-sm text-slate-400">
                        Example: $1 for 7 days, then regular subscription price
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quantity Limits */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-400" />
                  Quantity Limits
                  <Badge variant="outline" className="ml-2 text-xs">Scarcity</Badge>
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.quantityLimitEnabled}
                    onChange={(e) => updateField("quantityLimitEnabled", e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-slate-800 text-indigo-500"
                  />
                  <span className="text-white">Limit number of sales</span>
                </label>

                {form.quantityLimitEnabled && (
                  <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                    <Input
                      label="Maximum Sales"
                      type="number"
                      min="1"
                      placeholder="100"
                      value={form.quantityLimit}
                      onChange={(e) => updateField("quantityLimit", e.target.value)}
                      hint="Product will show as "Sold Out" after this limit"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Bump */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  Order Bump (Upsell)
                  <Badge variant="outline" className="ml-2 text-xs">Boost Revenue</Badge>
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-400">
                  Offer an additional product at checkout. Customer can add it with one click.
                </p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.orderBump}
                    onChange={(e) => updateField("orderBump", e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-slate-800 text-indigo-500"
                  />
                  <span className="text-white">Enable order bump</span>
                </label>

                {form.orderBump && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-4">
                    <Input
                      label="Bump Product Name"
                      placeholder="e.g., Exclusive Bonus Guide"
                      value={form.bumpName}
                      onChange={(e) => updateField("bumpName", e.target.value)}
                      error={errors.bumpName}
                    />
                    <Input
                      label="Bump Price"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="9.99"
                      value={form.bumpPrice}
                      onChange={(e) => updateField("bumpPrice", e.target.value)}
                      error={errors.bumpPrice}
                      hint="Special price for the bump (lower than regular)"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB: Advanced */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            {/* Geographic Restrictions */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-400" />
                  Geographic Restrictions
                  <Badge variant="outline" className="ml-2 text-xs">Optional</Badge>
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.geoRestrictionEnabled}
                    onChange={(e) => updateField("geoRestrictionEnabled", e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-slate-800 text-indigo-500"
                  />
                  <span className="text-white">Restrict to specific countries</span>
                </label>

                {form.geoRestrictionEnabled && (
                  <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                    <Textarea
                      label="Allowed Countries"
                      placeholder="US, CA, GB, DE, FR"
                      value={form.allowedCountries}
                      onChange={(e) => updateField("allowedCountries", e.target.value)}
                      rows={2}
                      hint="Enter country codes separated by commas (ISO 3166-1 alpha-2)"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Leave empty to allow all countries. Customers from other countries will see "Not available in your region"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Purchase Email */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Mail className="h-4 w-4 text-indigo-400" />
                  Custom Purchase Email
                  <Badge variant="outline" className="ml-2 text-xs">Branding</Badge>
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-400">
                  Send a custom email to customers after purchase. Use this to provide instructions, links, or a personal touch.
                </p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.customEmailEnabled}
                    onChange={(e) => updateField("customEmailEnabled", e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-slate-800 text-indigo-500"
                  />
                  <span className="text-white">Enable custom email</span>
                </label>

                {form.customEmailEnabled && (
                  <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-4">
                    <Input
                      label="Email Subject"
                      placeholder="Here's your purchase!"
                      value={form.customEmailSubject}
                      onChange={(e) => updateField("customEmailSubject", e.target.value)}
                    />
                    <Textarea
                      label="Email Body (HTML supported)"
                      placeholder="<p>Hi there!</p><p>Thank you for your purchase. Here's your download link:</p><p><a href='...'>Download Now</a></p>"
                      value={form.customEmailBody}
                      onChange={(e) => updateField("customEmailBody", e.target.value)}
                      rows={6}
                      hint="You can use HTML for formatting. Keep it simple for best results."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/dashboard/products"
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Created!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
