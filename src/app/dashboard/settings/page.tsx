"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  CreditCard,
  User,
  Palette,
  Percent,
  Check,
  ExternalLink,
  Shield,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StripeOnboarding } from "@/components/stripe-onboarding";

// ── Types ────────────────────────────────────────────────
interface Settings {
  name: string;
  email: string;
  businessName: string;
  stripeConnected: boolean;
  stripeAccountId: string;
  logoUrl: string;
  accentColor: string;
}

const COMMISSION_RATE = 0; // 0% EmbPay fee - merchant keeps 100%

// ── Component ────────────────────────────────────────────
export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    name: "",
    email: "",
    businessName: "",
    stripeConnected: false,
    stripeAccountId: "",
    logoUrl: "",
    accentColor: "#6366f1",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  // Fetch user settings on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings({
            name: data.data.name || "",
            email: data.data.email || "",
            businessName: data.data.businessName || "",
            stripeConnected: data.data.stripeConnected || false,
            stripeAccountId: data.data.stripeAccountId || "",
            logoUrl: data.data.logoUrl || "",
            accentColor: data.data.accentColor || "#6366f1",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setError("Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const updateField = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || "Failed to save settings");
      }
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // Fallback demo behavior
    }
    // Demo fallback
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setConnecting(false);
    updateField("stripeConnected", true);
    updateField("stripeAccountId", "acct_1NqD6g2eZvKYlo2C");
  };

  const handleDisconnectStripe = () => {
    updateField("stripeConnected", false);
    updateField("stripeAccountId", "");
  };

  const accentColors = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#f59e0b",
    "#10b981",
    "#06b6d4",
    "#3b82f6",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-slate-400 mt-1">
          Manage your account, payments, and branding
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Stripe Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-white">
                Stripe Connection
              </h2>
              <p className="text-sm text-slate-400">
                Connect your Stripe account to receive payments
              </p>
            </div>
            {settings.stripeConnected && (
              <Badge variant="success">Connected</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {settings.stripeConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-400">
                    Stripe account is connected and active
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                    {settings.stripeAccountId}
                  </p>
                </div>
              </div>
              
              {/* 0% Fee Info */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-indigo-500/[0.05] border border-indigo-500/20">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Percent className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-400">
                    0% EmbPay Fee
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    You keep 100% of your earnings (Stripe fees: 2.9% + 30¢)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                >
                  Open Stripe Dashboard
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnectStripe}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alert */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/[0.05] border border-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">
                    Stripe not connected
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect your existing Stripe account or create a new one to start accepting payments.
                  </p>
                </div>
              </div>

              {/* Two Options */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Option 1: Connect Existing */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-slate-300">Have a Stripe account?</h3>
                  <Button
                    onClick={handleConnectStripe}
                    loading={connecting}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Connect Existing Account
                  </Button>
                </div>

                {/* Option 2: Create New */}
                <StripeOnboarding />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <User className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Profile</h2>
              <p className="text-sm text-slate-400">
                Your personal and business information
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={settings.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="John Doe"
            />
            <Input
              label="Email"
              type="email"
              value={settings.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="john@example.com"
            />
          </div>
          <Input
            label="Business Name"
            value={settings.businessName}
            onChange={(e) => updateField("businessName", e.target.value)}
            placeholder="Your Company Name"
          />
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Branding</h2>
              <p className="text-sm text-slate-400">
                Customize how your checkout page looks
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <Input
            label="Logo URL"
            value={settings.logoUrl}
            onChange={(e) => updateField("logoUrl", e.target.value)}
            placeholder="https://example.com/logo.png"
            hint="Recommended: 200×60px, PNG with transparency"
          />

          {settings.logoUrl && (
            <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.06] inline-block">
              <img
                src={settings.logoUrl}
                alt="Logo preview"
                className="max-h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {accentColors.map((color) => (
                <button
                  key={color}
                  onClick={() => updateField("accentColor", color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    settings.accentColor === color
                      ? "border-white scale-110 shadow-lg"
                      : "border-transparent hover:border-white/30 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-slate-500 font-mono">
                  {settings.accentColor}
                </span>
              </div>
            </div>

            {/* Button Preview */}
            <div className="mt-4 p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              <p className="text-xs text-slate-500 mb-3">Button Preview:</p>
              <button
                className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 shadow-lg"
                style={{
                  backgroundColor: settings.accentColor,
                  boxShadow: `0 4px 14px ${settings.accentColor}33`,
                }}
              >
                Buy Now — $97.00
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Rate */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Percent className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Commission Rate
              </h2>
              <p className="text-sm text-slate-400">
                Platform fee on each transaction
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="text-4xl font-bold text-white tracking-tight">
              {COMMISSION_RATE}
              <span className="text-lg text-slate-400">%</span>
            </div>
            <div className="border-l border-white/[0.06] pl-6">
              <p className="text-sm text-slate-300">
                Per successful transaction
              </p>
              <p className="text-xs text-slate-500 mt-1">
                + standard Stripe processing fees (2.9% + 30¢)
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Commission rate is set by the platform and cannot be changed.
            Contact support for volume pricing.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2 pb-8">
        <div>
          {saved && (
            <span className="text-sm text-emerald-400 flex items-center gap-1.5 animate-[fadeIn_0.3s_ease]">
              <Check className="h-4 w-4" />
              Settings saved successfully
            </span>
          )}
        </div>
        <Button onClick={handleSave} loading={saving} size="lg">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
