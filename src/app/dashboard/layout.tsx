"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Code2,
  Ticket,
  Repeat,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Zap,
  Loader2,
  BarChart3,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Plans", href: "/dashboard/plans", icon: Repeat },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { label: "Embed Codes", href: "/dashboard/embed", icon: Code2 },
  { label: "Coupons", href: "/dashboard/coupons", icon: Ticket },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

interface UserInfo {
  name: string | null;
  email: string;
  businessName: string | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Auth check — use Supabase session instead of old JWT cookies
  useEffect(() => {
    // Check for Supabase session cookies
    const hasSupabaseSession = document.cookie.includes("sb-") || 
                                document.cookie.includes("supabase");
    
    // Try to fetch user info first (works with Supabase SSR)
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          // Not authenticated — redirect to login
          router.replace("/auth/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success && data.data) {
          setUserInfo({
            name: data.data.name,
            email: data.data.email,
            businessName: data.data.businessName,
          });
          setAuthChecked(true);
        } else {
          router.replace("/auth/login");
        }
      })
      .catch(() => {
        // Network error or auth failure
        router.replace("/auth/login");
      });
  }, [router]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = () => setUserMenuOpen(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [userMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      // Call logout API (will clear Supabase session)
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    // Redirect to login
    router.push("/auth/login");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">
              EmbPay
            </span>
            <span className="block text-[10px] text-slate-500 uppercase tracking-widest">
              Merchant
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "text-white bg-indigo-600/15"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {/* Active indicator bar */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              )}
              <Icon
                className={`h-[18px] w-[18px] transition-colors ${
                  active
                    ? "text-indigo-400"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setUserMenuOpen(!userMenuOpen);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/[0.06]">
              {(userInfo?.name || userInfo?.email || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-white truncate">{userInfo?.name || userInfo?.businessName || "User"}</p>
              <p className="text-xs text-slate-500 truncate">{userInfo?.email || ""}</p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
                userMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-white/[0.06] bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 py-1 animate-[scaleIn_0.15s_ease]">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                onClick={() => {
                  setUserMenuOpen(false);
                  setSidebarOpen(false);
                }}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-500/[0.06] transition-colors"
                onClick={() => {
                  setUserMenuOpen(false);
                  setSidebarOpen(false);
                }}
              >
                <Zap className="h-4 w-4" />
                Admin Panel
              </Link>
              <div className="mx-3 my-1 h-px bg-white/[0.06]" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/[0.04] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-[fadeIn_0.2s_ease]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-[260px] lg:flex-col border-r border-white/[0.06] bg-slate-950/80 backdrop-blur-xl z-50">
        <SidebarContent />
      </aside>

      {/* Sidebar - mobile */}
      <aside
        className={`fixed inset-y-0 left-0 w-[280px] bg-slate-950/95 backdrop-blur-xl border-r border-white/[0.06] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="lg:pl-[260px]">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-4 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">EmbPay</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 animate-[fadeIn_0.3s_ease]">
          {children}
        </main>
      </div>
    </div>
  );
}
