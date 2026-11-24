"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Building2,
  Users,
  CreditCard,
  Shield,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
  LogOut,
  ExternalLink,
  Phone,
  MessageSquare,
  Check,
  Globe,
  Landmark,
  Wallet,
  Settings,
  ChevronRight,
} from "lucide-react";
import {
  getCurrentUser,
  getAllSchools,
  getPlatformStats,
  updateSchoolStatus,
  extendSchoolTrial,
  onboardManualSchool,
  updateSchoolPaymentDetails,
  logout,
} from "@/lib/store";
import { User, School } from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";
import DashboardShell, { DashboardNavItem } from "@/components/DashboardShell";
import UserSettingsTab from "@/components/UserSettingsTab";
import { SparklineGreenWave, SparklineBluePulse, MiniBarChart, SparklineAmberWave } from "@/components/MiniCharts";
import { normalizePakistaniPhone } from "@/lib/whatsapp";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  const [activeTab, setActiveTab] = useState<"schools" | "stats" | "settings">("schools");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schoolsList, setSchoolsList] = useState<School[]>([]);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "TRIAL" | "SUSPENDED">("ALL");

  // Modal State
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    name: "",
    city: "Lahore",
    phone: "",
    email: "",
    plan: "STANDARD" as "TRIAL" | "STANDARD" | "PREMIUM",
  });

  // Payment Details Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentSchool, setSelectedPaymentSchool] = useState<School | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    bank_name: "",
    bank_account_title: "",
    bank_account_number: "",
    easypaisa_title: "",
    easypaisa_number: "",
    jazzcash_title: "",
    jazzcash_number: "",
  });

  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const refreshAll = () => {
    const user = getCurrentUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      router.push("/login");
      return;
    }
    setCurrentUser(user);

    const schools = getAllSchools();
    setSchoolsList(schools);
    setPlatformStats(getPlatformStats());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleStatusChange = (schoolId: string, newStatus: "ACTIVE" | "TRIAL" | "SUSPENDED") => {
    updateSchoolStatus(schoolId, newStatus);
    setActionNotice(`✓ School tenant status updated to ${newStatus}.`);
    refreshAll();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleExtendTrial = (schoolId: string) => {
    extendSchoolTrial(schoolId, 14);
    setActionNotice("✓ Trial extended by +14 days for school.");
    refreshAll();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onboardManualSchool(onboardForm);
    setShowOnboardModal(false);
    setOnboardForm({
      name: "",
      city: "Lahore",
      phone: "",
      email: "",
      plan: "STANDARD",
    });
    setActionNotice("✓ New School Tenant successfully onboarded to platform!");
    refreshAll();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const openPaymentModal = (sch: School) => {
    setSelectedPaymentSchool(sch);
    setPaymentForm({
      bank_name: sch.bank_name || "",
      bank_account_title: sch.bank_account_title || "",
      bank_account_number: sch.bank_account_number || "",
      easypaisa_title: sch.easypaisa_title || "",
      easypaisa_number: sch.easypaisa_number || "",
      jazzcash_title: sch.jazzcash_title || "",
      jazzcash_number: sch.jazzcash_number || "",
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentSchool) return;
    updateSchoolPaymentDetails(selectedPaymentSchool.id, paymentForm);
    setShowPaymentModal(false);
    setActionNotice(`✓ Payment accounts updated for ${selectedPaymentSchool.name}`);
    refreshAll();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Filtered schools
  const filteredSchools = schoolsList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const adminNavItems: DashboardNavItem[] = [
    { id: "schools", label: t.tenantSchools || "Schools & Tenants", icon: Building2, badge: schoolsList.length },
    { id: "stats", label: t.platformOverview || "Platform Stats & MRR", icon: TrendingUp },
    { id: "settings", label: t.tabSettings || "Settings", icon: Settings },
  ];

  return (
    <DashboardShell
      currentUser={currentUser}
      schoolName="Attendlix Global"
      schoolCity="Core Cloud"
      tenantId="TENANT-GLOBAL"
      navItems={adminNavItems}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as any)}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Banner */}
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Settings Tab vs Main Platform View */}
        {activeTab === "settings" ? (
          <UserSettingsTab
            currentUser={currentUser}
            onUserUpdate={(updated) => setCurrentUser(updated)}
          />
        ) : (
          <>
            {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.platformOverview}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage multi-tenant school onboarding, subscriptions, MRR, and platform health across Pakistan.
            </p>
          </div>

          <button
            onClick={() => setShowOnboardModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>{t.onboardSchool}</span>
          </button>
        </div>

        {/* 4 Platform Stats Cards with Mini Sparklines & Depth - Clickable shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Schools -> switches to schools tab with ALL filter */}
          <div
            onClick={() => {
              setActiveTab("schools");
              setStatusFilter("ALL");
            }}
            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between space-y-3 cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all group"
            title="Click to view all registered school tenants"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t.totalSchools}</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{platformStats?.totalSchools || 0}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-0.5">Isolated database tenants</div>
            </div>
            <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
              <SparklineGreenWave />
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                <span>Tenants</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Active Subscriptions -> switches to schools tab with ACTIVE filter */}
          <div
            onClick={() => {
              setActiveTab("schools");
              setStatusFilter("ACTIVE");
            }}
            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between space-y-3 cursor-pointer hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md transition-all group"
            title="Click to filter active paid subscriptions"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t.activeSubscriptions}</span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-blue-600 tracking-tight">{platformStats?.activeSubscriptions || 0}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                {platformStats?.totalSchools
                  ? Math.round((platformStats.activeSubscriptions / platformStats.totalSchools) * 100)
                  : 0}
                % conversion rate
              </div>
            </div>
            <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
              <SparklineBluePulse />
              <span className="text-[11px] font-bold text-blue-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                <span>Active Only</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 3: Total Students Platform -> switches to schools tab */}
          <div
            onClick={() => {
              setActiveTab("schools");
              setStatusFilter("ALL");
            }}
            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between space-y-3 cursor-pointer hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md transition-all group"
            title="Click to inspect campus student rosters"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t.totalStudentsPlatform}</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{platformStats?.totalStudentsPlatform || 0}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-0.5">Enrolled across all campuses</div>
            </div>
            <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
              <MiniBarChart />
              <span className="text-[11px] font-bold text-amber-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                <span>Campuses</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 4: Platform MRR -> switches to stats tab */}
          <div
            onClick={() => setActiveTab("stats")}
            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col justify-between space-y-3 cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all group"
            title="Click to view Platform Stats & MRR Analytics"
          >
            <div>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t.platformMRR}</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                PKR {(platformStats?.platformMRR || 0).toLocaleString()}
              </div>
              <div className="text-[11px] font-medium text-slate-400 mt-0.5">Recurring SaaS billing in PKR</div>
            </div>
            <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
              <SparklineAmberWave />
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                <span>MRR Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by school name, city, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5 w-full sm:w-auto">
            {(["ALL", "ACTIVE", "TRIAL", "SUSPENDED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  statusFilter === status
                    ? "bg-slate-900 text-white shadow-2xs font-bold"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Schools / Tenants Management: Mobile Cards on < 768px, Table on >= 768px */}
        
        {/* 1. Mobile Cards View (< 768px) */}
        <div className="space-y-3 block md:hidden">
          {filteredSchools.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              No school tenants match the search filter.
            </div>
          ) : (
            filteredSchools.map((sch) => {
              const isActive = sch.status === "ACTIVE";
              const isTrial = sch.status === "TRIAL";
              const isSuspended = sch.status === "SUSPENDED";

              return (
                <div
                  key={sch.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{sch.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>{sch.city}</span>
                        <span>•</span>
                        <span className="font-mono">{sch.phone}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {sch.id}</div>
                    </div>

                    <div>
                      {isActive && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          ACTIVE
                        </span>
                      )}
                      {isTrial && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                          TRIAL ({sch.trial_days_left || 14}d)
                        </span>
                      )}
                      {isSuspended && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                          SUSPENDED
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-xl bg-slate-50 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Enrolled</span>
                      <div className="font-extrabold text-slate-900">{sch.student_count || 148} Students</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Plan & MRR</span>
                      <div className="font-extrabold text-emerald-700">
                        PKR {(sch.mrr_pkr || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Accounts Preview */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-emerald-600" />
                        <span>Receiving Accounts</span>
                      </span>
                      <span className="text-emerald-700 font-semibold">{sch.bank_name ? "Configured ✓" : "Pending"}</span>
                    </div>
                    <div className="text-slate-700 font-medium truncate text-[11px]">
                      🏦 {sch.bank_name || "Bank not set"} • <span className="font-mono">{sch.bank_account_number || "IBAN not set"}</span>
                    </div>
                    <div className="text-slate-500 text-[10px] flex items-center gap-2 font-mono">
                      <span>EP: {sch.easypaisa_number || "—"}</span>
                      <span>•</span>
                      <span>JC: {sch.jazzcash_number || "—"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => openPaymentModal(sch)}
                      className="w-full py-2 px-3 min-h-[40px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.editPaymentDetails || "Edit Payment Details"}</span>
                    </button>

                    {!isActive && (
                      <button
                        onClick={() => handleStatusChange(sch.id, "ACTIVE")}
                        className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t.activate}</span>
                      </button>
                    )}

                    {isTrial && (
                      <button
                        onClick={() => handleExtendTrial(sch.id)}
                        className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-4 h-4" />
                        <span>+14 Days</span>
                      </button>
                    )}

                    {!isSuspended && (
                      <button
                        onClick={() => handleStatusChange(sch.id, "SUSPENDED")}
                        className="flex-1 py-2.5 px-3 min-h-[44px] rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Pause className="w-4 h-4" />
                        <span>{t.suspend}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. Desktop Table View (>= 768px) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-3 px-4 sm:px-6">School Tenant</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-center">Students</th>
                <th className="py-3 px-4">Plan & MRR</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Tenant Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchools.map((sch) => {
                const isActive = sch.status === "ACTIVE";
                const isTrial = sch.status === "TRIAL";
                const isSuspended = sch.status === "SUSPENDED";

                return (
                  <tr key={sch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-slate-900">{sch.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {sch.id}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <CreditCard className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="truncate max-w-[160px]">{sch.bank_name || "Bank unset"}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">{sch.easypaisa_number || sch.jazzcash_number || "No wallet"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{sch.city}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{sch.phone}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                      {sch.student_count || 148}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 text-xs">{sch.plan || "STANDARD"}</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        PKR {(sch.mrr_pkr || 0).toLocaleString()} / mo
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                          ACTIVE
                        </span>
                      )}
                      {isTrial && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                          TRIAL ({sch.trial_days_left || 14}d)
                        </span>
                      )}
                      {isSuspended && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                          SUSPENDED
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openPaymentModal(sch)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[11px] shadow-2xs transition-all flex items-center gap-1"
                          title="Configure Bank, JazzCash & Easypaisa Accounts"
                        >
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          <span>{t.editPaymentDetails || "Payment Accounts"}</span>
                        </button>

                        {!isActive && (
                          <button
                            onClick={() => handleStatusChange(sch.id, "ACTIVE")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all"
                            title="Activate School Subscription"
                          >
                            {t.activate}
                          </button>
                        )}

                        {isTrial && (
                          <button
                            onClick={() => handleExtendTrial(sch.id)}
                            className="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold text-[11px] transition-all"
                            title="Add 14 days to free trial"
                          >
                            +14 Days
                          </button>
                        )}

                        {!isSuspended && (
                          <button
                            onClick={() => handleStatusChange(sch.id, "SUSPENDED")}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 font-semibold text-[11px] transition-all"
                            title="Suspend Tenant Access"
                          >
                            {t.suspend}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ONBOARD NEW SCHOOL MANUALLY */}
      {/* ========================================================================= */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Onboard New School Tenant</h3>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">School / Campus Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore Grammar School"
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <select
                    value={onboardForm.city}
                    onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Multan">Multan</option>
                    <option value="Quetta">Quetta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan *</label>
                  <select
                    value={onboardForm.plan}
                    onChange={(e) => setOnboardForm({ ...onboardForm, plan: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="TRIAL">14-Day Free Trial</option>
                    <option value="STANDARD">Campus Standard (PKR 35,000)</option>
                    <option value="PREMIUM">Campus Enterprise (PKR 55,000)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={onboardForm.phone}
                  onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="contact@school.edu.pk"
                  value={onboardForm.email}
                  onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-2xs"
                >
                  Onboard Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: EDIT SCHOOL PAYMENT ACCOUNTS */}
      {/* ========================================================================= */}
      {showPaymentModal && selectedPaymentSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>{t.editPaymentDetails || "Edit Payment Accounts"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure receiving accounts for <strong>{selectedPaymentSchool.name}</strong> ({selectedPaymentSchool.id})
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
              💡 <strong>Student & Parent Propagation:</strong> These credentials will immediately be visible to parents inside their &quot;Pay Fee&quot; modal on the Student Dashboard for this specific school.
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs">
              {/* 1. Official Bank Account */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  <span>{t.bankDetails || "Bank Account Details"}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.bankName || "Bank Name"}</label>
                  <input
                    type="text"
                    placeholder="e.g. Meezan Bank, HBL, Bank Alfalah"
                    value={paymentForm.bank_name}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bank_name: e.target.value })}
                    className="w-full px-3 py-2 min-h-[40px] text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.accountTitle || "Account Title"}</label>
                    <input
                      type="text"
                      placeholder="e.g. Beacon Grammar System"
                      value={paymentForm.bank_account_title}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank_account_title: e.target.value })}
                      className="w-full px-3 py-2 min-h-[40px] text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.accountNumber || "Account Number / IBAN"}</label>
                    <input
                      type="text"
                      placeholder="e.g. PK64MEZN0001020304050607"
                      value={paymentForm.bank_account_number}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bank_account_number: e.target.value })}
                      className="w-full px-3 py-2 min-h-[40px] text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Easypaisa Account */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                <div className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>{t.easypaisaDetails || "Easypaisa Account"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.accountTitle || "Account Title"}</label>
                    <input
                      type="text"
                      placeholder="e.g. Beacon Grammar School"
                      value={paymentForm.easypaisa_title}
                      onChange={(e) => setPaymentForm({ ...paymentForm, easypaisa_title: e.target.value })}
                      className="w-full px-3 py-2 min-h-[40px] text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.easypaisaNumber || "Easypaisa Mobile Number"}</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0300-4567890"
                      value={paymentForm.easypaisa_number}
                      onChange={(e) => setPaymentForm({ ...paymentForm, easypaisa_number: e.target.value })}
                      className="w-full px-3 py-2 min-h-[40px] text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 3. JazzCash Account */}
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3">
                <div className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-rose-600" />
                  <span>{t.jazzcashDetails || "JazzCash Account"}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.accountTitle || "Account Title"}</label>
                    <input
                      type="text"
                      placeholder="e.g. Beacon Grammar School"
                      value={paymentForm.jazzcash_title}
                      onChange={(e) => setPaymentForm({ ...paymentForm, jazzcash_title: e.target.value })}
                      className="w-full px-3 py-2 min-h-[40px] text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t.jazzcashNumber || "JazzCash Mobile Number"}</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0300-4567890"
                      value={paymentForm.jazzcash_number}
                      onChange={(e) => setPaymentForm({ ...paymentForm, jazzcash_number: e.target.value })}
                      className="w-full px-3 py-2 min-h-[40px] text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs transition-all"
                >
                  {t.save || "Save Payment Accounts"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
