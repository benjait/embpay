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
  Lock,
  Globe,
  LayoutTemplate,
  Key,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const COMMISSION_RATE = 0; // 0% EmbPay fee

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
  const [activeTab, setActiveTab] = useState("general");

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
      window.location.href = "/api/stripe/connect";
    } catch (error) {
      console.error("Connect error:", error);
      setConnecting(false);
      setError("Failed to initiate Stripe connection");
    }
  };

  const handleDisconnectStripe = async () => {
    if (!confirm("Disconnect Stripe? You won't be able to receive payments.")) {
      return;
    }
    try {
      const res = await fetch("/api/stripe/disconnect", { method: "POST" });
      if (res.ok) {
        updateField("stripeConnected", false);
        updateField("stripeAccountId", "");
        window.location.reload();
      }
    } catch (error) {
      console.error("Disconnect error:", error);
      setError("Failed to disconnect Stripe");
    }
  };

  const accentColors = [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#f43f5e", // Rose
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#06b6d4", // Cyan
    "#3b82f6", // Blue
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Account Settings
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your profile, payments, and checkout appearance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-emerald-400 flex items-center gap-1.5 animate-in fade-in duration-300">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        {/* ── General Tab ──────────────────────────────────────────────── */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription className="text-slate-400">
                    Update your personal details and business identity
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Full Name</label>
                  <Input
                    value={settings.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="John Doe"
                    className="bg-slate-950/50 border-white/10 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address</label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="john@example.com"
                    className="bg-slate-950/50 border-white/10 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Business Name</label>
                  <Input
                    value={settings.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    placeholder="Acme Inc."
                    className="bg-slate-950/50 border-white/10 focus:border-indigo-500"
                  />
                  <p className="text-xs text-slate-500">This will appear on invoices and emails.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
             <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Regional Settings</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage your currency and language preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div>
                  <p className="text-sm font-medium text-white">Default Currency</p>
                  <p className="text-xs text-slate-400">USD - United States Dollar</p>
                </div>
                <Badge variant="outline" className="text-slate-400 border-slate-700">Auto-detected</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Payments Tab ─────────────────────────────────────────────── */}
        <TabsContent value="payments" className="space-y-6">
          <Card className={`border-white/10 backdrop-blur-sm ${settings.stripeConnected ? 'bg-slate-900/50' : 'bg-slate-900/50 border-l-4 border-l-amber-500'}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${settings.stripeConnected ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                  {settings.stripeConnected ? (
                    <Shield className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-white">Stripe Connection</CardTitle>
                  <CardDescription className="text-slate-400">
                    {settings.stripeConnected 
                      ? "Your account is connected and ready to process payments"
                      : "Connect Stripe to start accepting payments"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {settings.stripeConnected ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Active & Connected
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-1">
                        ID: {settings.stripeAccountId}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDisconnectStripe} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                      Disconnect
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <a
                      href="https://dashboard.stripe.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors group"
                    >
                      Go to Stripe Dashboard
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <p className="text-sm text-amber-200/80">
                      You need to connect a Stripe account to sell products. Payments go directly to your bank account.
                    </p>
                  </div>
                  <Button
                    onClick={handleConnectStripe}
                    disabled={connecting}
                    className="w-full sm:w-auto bg-[#635BFF] hover:bg-[#5851df] text-white"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Connect with Stripe
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Platform Fees</CardTitle>
                  <CardDescription className="text-slate-400">
                    Transparent pricing with no hidden costs
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 p-6 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div>
                  <span className="text-4xl font-bold text-white tracking-tight">{COMMISSION_RATE}%</span>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div>
                  <p className="text-sm font-medium text-white">EmbPay Commission</p>
                  <p className="text-xs text-slate-400 mt-1">
                    We charge 0% per transaction. You only pay standard Stripe processing fees.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Branding Tab ─────────────────────────────────────────────── */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-white">Checkout Appearance</CardTitle>
                  <CardDescription className="text-slate-400">
                    Customize the look and feel of your checkout pages
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-300">Logo URL</label>
                <div className="flex gap-4">
                  <Input
                    value={settings.logoUrl}
                    onChange={(e) => updateField("logoUrl", e.target.value)}
                    placeholder="https://your-site.com/logo.png"
                    className="bg-slate-950/50 border-white/10 focus:border-indigo-500"
                  />
                </div>
                <p className="text-xs text-slate-500">Recommended: 200×60px transparent PNG</p>
                
                {settings.logoUrl && (
                  <div className="mt-4 p-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
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
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-300">Accent Color</label>
                <div className="flex flex-wrap gap-3">
                  {accentColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateField("accentColor", color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                        settings.accentColor === color
                          ? "border-white scale-110 shadow-lg ring-2 ring-white/20"
                          : "border-transparent hover:border-white/30 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                      type="button"
                    />
                  ))}
                  <div className="relative ml-2">
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) => updateField("accentColor", e.target.value)}
                      className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent opacity-0 absolute inset-0 z-10"
                    />
                    <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-400">
                      <LayoutTemplate className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 rounded-xl bg-slate-950 border border-white/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Live Preview</h3>
                    <button
                      className="px-8 py-3 rounded-lg text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: settings.accentColor,
                        boxShadow: `0 4px 20px -2px ${settings.accentColor}66`,
                      }}
                    >
                      Pay $49.00
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
