"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  DollarSign,
  Mail,
  CreditCard,
  ToggleLeft,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface PlatformSettings {
  platformFeePercent: number;
  minPlatformFee: number;
  maxPlatformFee: number;
  stripeFeePercent: number;
  stripeFixedFee: number;
  enableEmailNotifications: boolean;
  enableLicenseKeys: boolean;
  enableSubscriptions: boolean;
  enableCoupons: boolean;
  freePlanProductLimit: number;
  freePlanOrderLimit: number;
  proPlanPrice: number;
  scalePlanPrice: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    platformFeePercent: 2.5,
    minPlatformFee: 0.5,
    maxPlatformFee: 100,
    stripeFeePercent: 2.9,
    stripeFixedFee: 0.3,
    enableEmailNotifications: true,
    enableLicenseKeys: true,
    enableSubscriptions: false,
    enableCoupons: true,
    freePlanProductLimit: 10,
    freePlanOrderLimit: 100,
    proPlanPrice: 29,
    scalePlanPrice: 79,
    maintenanceMode: false,
    maintenanceMessage: "We're currently under maintenance. Please check back soon.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-amber-400" />
            Platform Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure platform-wide settings and features
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Platform Fees */}
      <div className="bg-slate-900 rounded-xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 mb-4">
          <DollarSign className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Platform Fees</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Platform Fee (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.platformFeePercent}
              onChange={(e) =>
                setSettings({ ...settings, platformFeePercent: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Min Platform Fee ($)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.minPlatformFee}
              onChange={(e) =>
                setSettings({ ...settings, minPlatformFee: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Max Platform Fee ($)
            </label>
            <input
              type="number"
              step="1"
              value={settings.maxPlatformFee}
              onChange={(e) =>
                setSettings({ ...settings, maxPlatformFee: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Stripe Fee (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.stripeFeePercent}
              onChange={(e) =>
                setSettings({ ...settings, stripeFeePercent: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Stripe Fixed Fee ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={settings.stripeFixedFee}
              onChange={(e) =>
                setSettings({ ...settings, stripeFixedFee: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Plan Limits */}
      <div className="bg-slate-900 rounded-xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 mb-4">
          <CreditCard className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Plan Pricing & Limits</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Free Plan - Max Products
            </label>
            <input
              type="number"
              value={settings.freePlanProductLimit}
              onChange={(e) =>
                setSettings({ ...settings, freePlanProductLimit: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Free Plan - Max Orders/Month
            </label>
            <input
              type="number"
              value={settings.freePlanOrderLimit}
              onChange={(e) =>
                setSettings({ ...settings, freePlanOrderLimit: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Pro Plan Price ($)
            </label>
            <input
              type="number"
              value={settings.proPlanPrice}
              onChange={(e) =>
                setSettings({ ...settings, proPlanPrice: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Scale Plan Price ($)
            </label>
            <input
              type="number"
              value={settings.scalePlanPrice}
              onChange={(e) =>
                setSettings({ ...settings, scalePlanPrice: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-slate-900 rounded-xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2 text-purple-400 mb-4">
          <ToggleLeft className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Feature Flags</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
            <span className="text-sm text-white">Email Notifications</span>
            <input
              type="checkbox"
              checked={settings.enableEmailNotifications}
              onChange={(e) =>
                setSettings({ ...settings, enableEmailNotifications: e.target.checked })
              }
              className="w-5 h-5 rounded border-white/20 bg-slate-700 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
            <span className="text-sm text-white">License Key System</span>
            <input
              type="checkbox"
              checked={settings.enableLicenseKeys}
              onChange={(e) =>
                setSettings({ ...settings, enableLicenseKeys: e.target.checked })
              }
              className="w-5 h-5 rounded border-white/20 bg-slate-700 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
            <span className="text-sm text-white">Subscriptions (Recurring)</span>
            <input
              type="checkbox"
              checked={settings.enableSubscriptions}
              onChange={(e) =>
                setSettings({ ...settings, enableSubscriptions: e.target.checked })
              }
              className="w-5 h-5 rounded border-white/20 bg-slate-700 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
            <span className="text-sm text-white">Coupons & Discounts</span>
            <input
              type="checkbox"
              checked={settings.enableCoupons}
              onChange={(e) =>
                setSettings({ ...settings, enableCoupons: e.target.checked })
              }
              className="w-5 h-5 rounded border-white/20 bg-slate-700 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
            />
          </label>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-slate-900 rounded-xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2 text-red-400 mb-4">
          <Mail className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Maintenance Mode</h2>
        </div>

        <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
          <span className="text-sm text-white">Enable Maintenance Mode</span>
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) =>
              setSettings({ ...settings, maintenanceMode: e.target.checked })
            }
            className="w-5 h-5 rounded border-white/20 bg-slate-700 text-red-500 focus:ring-2 focus:ring-red-500/50"
          />
        </label>

        {settings.maintenanceMode && (
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Maintenance Message
            </label>
            <textarea
              value={settings.maintenanceMessage}
              onChange={(e) =>
                setSettings({ ...settings, maintenanceMessage: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>
        )}
      </div>
    </div>
  );
}
