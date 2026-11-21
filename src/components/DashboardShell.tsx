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
  Bell,
  Search,
  User as UserIcon,
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
  schoolCity = "Lahore",
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
  const currentTitle = headerTitle || activeNavItem?.label || t.dashboard || "Overview";

  // Role display helper matching the reference image badge
  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return { label: "SUPER ADMIN", color: "bg-purple-400/20 text-purple-300 border-purple-400/30" };
      case "PRINCIPAL":
        return { label: "PRINCIPAL / OWNER", color: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30" };
      case "TEACHER":
        return { label: "FACULTY / TEACHER", color: "bg-blue-400/20 text-blue-300 border-blue-400/30" };
      case "ACCOUNTANT":
        return { label: "ACCOUNTS / BURSAR", color: "bg-amber-400/20 text-amber-300 border-amber-400/30" };
      case "STUDENT_PARENT":
        return { label: "STUDENT / PARENT", color: "bg-indigo-400/20 text-indigo-300 border-indigo-400/30" };
      default:
        return { label: "USER", color: "bg-slate-400/20 text-slate-300 border-slate-400/30" };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col md:flex-row font-sans selection:bg-emerald-100 selection:text-emerald-900 w-full overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. DESKTOP FIXED DEEP FOREST-EMERALD SIDEBAR (w-64) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex w-64 bg-[#0B3B2E] border-r border-[#082C22] text-white flex-col justify-between flex-shrink-0 sticky top-0 h-screen z-30 shadow-xl">
        {/* Top of Sidebar: Brand & School Tenant Selector Card */}
        <div className="p-4 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold tracking-tight text-white text-base block leading-tight">
                Attendlix<span className="text-emerald-400">.</span>
              </span>
              <span className="text-[9px] font-bold text-emerald-200/70 uppercase tracking-widest block">
                School ERP
              </span>
            </div>
          </Link>

          {/* School Details Card */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white space-y-1 transition-all">
            <div className="flex items-center justify-between">
              <div className="font-bold text-white text-xs truncate" title={schoolName}>
                {schoolName}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-200/70" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-emerald-200/70">
              <span>{schoolCity}</span>
              {tenantId && (
                <span className="font-mono text-emerald-300 font-semibold truncate max-w-[90px]" title={tenantId}>
                  {tenantId.length > 12 ? tenantId.substring(0, 10) + "..." : tenantId}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Middle of Sidebar: Vertical Navigation Links */}
        <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/50 px-3 pb-1 block">
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
                      ? "bg-white/15 backdrop-blur-sm border border-white/15 text-white font-bold shadow-xs"
                      : "text-emerald-100/75 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? "text-white" : "text-emerald-300/70 group-hover:text-white"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-emerald-950/60 text-emerald-300 border border-emerald-700/40"
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

        {/* Bottom of Sidebar: User Profile Card & Sign Out */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2.5 min-w-0">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-emerald-400/40 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-emerald-500/40">
                  {(currentUser?.name || "U").substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-bold text-white text-xs truncate block" title={currentUser?.name}>
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
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 min-h-[32px] min-w-[32px] flex items-center justify-center"
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
      <div className="md:hidden sticky top-0 z-40 bg-[#0B3B2E] text-white border-b border-[#082C22]">
        <div className="px-3 py-2.5 flex items-center justify-between gap-2 min-h-[56px]">
          {/* Left: Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-white hover:bg-white/10 border border-white/15 min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300 shadow-2xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-white text-base">Attendlix</span>
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
          <div className="relative w-72 max-w-[85vw] bg-[#0B3B2E] text-white h-full shadow-2xl z-50 flex flex-col justify-between p-4 space-y-4 overflow-y-auto border-r border-[#082C22]">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300 shadow-2xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">Attendlix</span>
                    <span className="text-[10px] text-emerald-200/70 truncate block max-w-[140px]">
                      {schoolName}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile in Drawer */}
              <div className="p-3 rounded-xl bg-white/10 border border-white/10 flex items-center gap-2.5">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-emerald-400/40 shadow-2xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-emerald-500/40">
                    {(currentUser?.name || "U").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="font-bold text-white text-xs truncate">{currentUser?.name}</div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${roleInfo.color}`}
                    >
                      {roleInfo.label}
                    </span>
                    <span className="text-[10px] text-emerald-200/70 truncate max-w-[90px]">{schoolCity}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Links in Drawer */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200/50 px-2 block mb-1">
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
                            ? "bg-white/15 backdrop-blur-sm border border-white/15 text-white font-bold shadow-xs"
                            : "text-emerald-100/75 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 ${
                              isActive ? "text-white" : "text-emerald-300/70"
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-emerald-950/60 text-emerald-300 border border-emerald-700/40"
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
            <div className="border-t border-white/10 pt-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-400/30 text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.signOut || "Sign Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA WITH TOP UTILITY BAR (flex-1) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAFC]">
        {/* Desktop Top Utility Bar (Breadcrumb, Search, Notification Bell, Profile, Language) */}
        <header className="hidden md:flex sticky top-0 z-20 bg-white border-b border-slate-100 px-6 lg:px-8 py-3 min-h-[58px] items-center justify-between gap-4 shadow-2xs">
          {/* Left: School Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs min-w-0">
            <span className="font-medium text-slate-400">{schoolName}</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 truncate">{currentTitle}</span>
          </div>

          {/* Right: Notification Bell + Search Pill + Profile Shortcut + Extra + Language Toggle */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80 bg-white shadow-2xs relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>

            {/* Clean Pill Search Bar */}
            <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 text-xs text-slate-400 shadow-2xs hover:border-slate-300 transition-colors">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent border-none text-xs text-slate-700 focus:outline-none w-20 lg:w-32 placeholder:text-slate-400"
              />
            </div>

            {/* Profile Shortcut Icon */}
            <button
              type="button"
              onClick={() => onTabChange("settings")}
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-slate-200/80 bg-white shadow-2xs transition-colors"
              title="Profile Settings"
            >
              <UserIcon className="w-4 h-4" />
            </button>

            {headerExtra}

            {/* Language Toggle Pill */}
            <LanguageToggle />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
