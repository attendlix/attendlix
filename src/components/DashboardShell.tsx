"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Shield,
  Wifi,
  WifiOff,
} from "lucide-react";
import { User, UserRole } from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface DashboardShellProps {
  currentUser: User | null;
  schoolName?: string;
  schoolCity?: string;
  tenantId?: string;
  navItems: DashboardNavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onLogout: () => void;
  headerTitle?: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardShell({
  currentUser,
  schoolName = "Beacon Grammar School",
  schoolCity = "Pakistan",
  tenantId,
  navItems,
  activeTab,
  onTabChange,
  onLogout,
  headerTitle,
  headerExtra,
  children,
}: DashboardShellProps) {
  const { t, isRtl } = useLanguage();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeNavItem = navItems.find((n) => n.id === activeTab);
  const currentTitle = headerTitle || activeNavItem?.label || t.dashboard || "Dashboard";

  // Role display helper
  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return { label: t.roleSuperAdmin || "Super Admin", color: "bg-purple-100 text-purple-800 border-purple-200" };
      case "PRINCIPAL":
        return { label: t.rolePrincipal || "Principal", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case "TEACHER":
        return { label: t.roleTeacher || "Teacher", color: "bg-blue-100 text-blue-800 border-blue-200" };
      case "ACCOUNTANT":
        return { label: t.roleAccountant || "Accountant", color: "bg-amber-100 text-amber-800 border-amber-200" };
      case "STUDENT_PARENT":
        return { label: t.roleParent || "Student / Parent", color: "bg-indigo-100 text-indigo-800 border-indigo-200" };
      default:
        return { label: "User", color: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col md:flex-row font-sans selection:bg-emerald-100 selection:text-emerald-900 w-full overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. DESKTOP FIXED LEFT SIDEBAR (w-64) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/90 flex-col justify-between flex-shrink-0 sticky top-0 h-screen z-30 shadow-2xs">
        {/* Top of Sidebar: Brand & School Tenant Info */}
        <div className="p-4 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold tracking-tight text-slate-900 text-base block leading-tight">
                Attendlix<span className="text-emerald-600">.</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                School ERP
              </span>
            </div>
          </Link>

          {/* School Details Card */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="font-bold text-slate-800 text-xs truncate" title={schoolName}>
              {schoolName}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>{schoolCity}</span>
              {tenantId && (
                <span className="font-mono text-emerald-700 font-semibold truncate max-w-[90px]" title={tenantId}>
                  {tenantId.length > 12 ? tenantId.substring(0, 10) + "..." : tenantId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Middle of Sidebar: Vertical Navigation Links */}
        <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1 block">
            Navigation
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group min-h-[42px] ${
                    isActive
                      ? "bg-slate-900 text-white shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? "bg-slate-800 text-emerald-400" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom of Sidebar: User Profile & Sign Out */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {(currentUser?.name || "U").substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-bold text-slate-800 text-xs truncate block" title={currentUser?.name}>
                  {currentUser?.name || "User"}
                </span>
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${roleInfo.color}`}
                >
                  {roleInfo.label}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex-shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
              title={t.signOut || "Sign Out"}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE TOP HEADER (< 768px) */}
      {/* ========================================================================= */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="px-3 py-2.5 flex items-center justify-between gap-2 min-h-[56px]">
          {/* Left: Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-slate-900 text-base">Attendlix</span>
          </Link>

          {/* Right: Extra header items (Wi-Fi, etc.) & Language Toggle */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {headerExtra}
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE SLIDE-OVER DRAWER MENU (< 768px) */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl z-50 flex flex-col justify-between p-4 space-y-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Attendlix</span>
                    <span className="text-[10px] text-slate-500 truncate block max-w-[140px]">
                      {schoolName}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile in Drawer */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-slate-200 shadow-2xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {(currentUser?.name || "U").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="font-bold text-slate-900 text-xs truncate">{currentUser?.name}</div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${roleInfo.color}`}
                    >
                      {roleInfo.label}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[90px]">{schoolCity}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Links in Drawer */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                  Navigation
                </span>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onTabChange(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all min-h-[44px] ${
                          isActive
                            ? "bg-slate-900 text-white shadow-2xs font-bold"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 ${
                              isActive ? "text-emerald-400" : "text-slate-400"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive ? "bg-slate-800 text-emerald-400" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.signOut || "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA (flex-1) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAFC]">
        {/* Desktop Top Header (Language Toggle & Wi-Fi only, NO horizontal tab pills) */}
        <header className="hidden md:flex sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-8 py-3 min-h-[60px] items-center justify-between gap-4 shadow-2xs">
          {/* Breadcrumb / Section Title */}
          <div className="flex items-center gap-2 text-xs min-w-0">
            <span className="font-semibold text-slate-400">{schoolName}</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 truncate">{currentTitle}</span>
          </div>

          {/* Right Controls: Header Extra (Wi-Fi status, etc.) + Language Toggle */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {headerExtra}
            <LanguageToggle />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full p-3 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
