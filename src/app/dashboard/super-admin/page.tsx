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
  SlidersHorizontal,
  Copy,
  RefreshCw,
  Key,
  ShieldCheck,
} from "lucide-react";
import {
  getCurrentUser,
  getAllSchools,
  getPlatformStats,
  updateSchoolStatus,
  extendSchoolTrial,
  onboardManualSchool,
  updateSchoolPaymentDetails,
  updateSchoolBilling,
  generatePrincipalId,
  generateStrongPassword,
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
    principalName: "",
    city: "Lahore",
    phone: "",
    email: "",
    plan: "STANDARD" as "TRIAL" | "STANDARD" | "PREMIUM" | string,
    mrr_pkr: 35000,
    billing_note: "",
    principalId: "",
    principalPassword: "",
  });

  // Billing Modal State
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [selectedBillingSchool, setSelectedBillingSchool] = useState<School | null>(null);
  const [billingForm, setBillingForm] = useState({
    mrr_pkr: 35000,
    plan: "STANDARD",
    status: "ACTIVE" as "ACTIVE" | "TRIAL" | "SUSPENDED",
    billing_note: "",
  });

  // Principal Credentials Summary Modal State
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    schoolName: string;
    schoolId: string;
    principalName: string;
    principalId: string;
    password: string;
    phone: string;
    mrr_pkr: number;
    plan: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    const isSuperAdmin =
      user &&
      ((user.role as string)?.toUpperCase() === "SUPER_ADMIN" ||
        user.identifier?.toLowerCase() === "superadmin@attendlix.com" ||
        user.email?.toLowerCase() === "superadmin@attendlix.com");

    if (!user || !isSuperAdmin) {
      router.push("/login");
      return;
    }
    user.role = "SUPER_ADMIN";
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

  const openOnboardModal = () => {
    const initSchool = "";
    const initCity = "Lahore";
    setOnboardForm({
      name: initSchool,
      principalName: "",
      city: initCity,
      phone: "",
      email: "",
      plan: "STANDARD",
      mrr_pkr: 35000,
      billing_note: "",
      principalId: generatePrincipalId(initSchool, initCity),
      principalPassword: generateStrongPassword(),
    });
    setShowOnboardModal(true);
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onboardManualSchool(onboardForm);
    setShowOnboardModal(false);
    setOnboardForm({
      name: "",
      principalName: "",
      city: "Lahore",
      phone: "",
      email: "",
      plan: "STANDARD",
      mrr_pkr: 35000,
      billing_note: "",
      principalId: "",
      principalPassword: "",
    });
    setCreatedCredentials({
      schoolName: res.school.name,
      schoolId: res.school.id,
      principalName: res.principal.name,
      principalId: res.principal.identifier,
      password: res.tempPassword,
      phone: res.school.phone,
      mrr_pkr: res.school.mrr_pkr || 35000,
      plan: res.school.plan || "STANDARD",
    });
    setShowCredentialsModal(true);
    setActionNotice(`✓ Tenant "${res.school.name}" onboarded & Principal credentials generated!`);
    refreshAll();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const openBillingModal = (sch: School) => {
    setSelectedBillingSchool(sch);
    setBillingForm({
      mrr_pkr: sch.mrr_pkr !== undefined ? sch.mrr_pkr : (sch.plan === "PREMIUM" ? 55000 : 35000),
      plan: sch.plan || "STANDARD",
      status: sch.status || "ACTIVE",
      billing_note: sch.billing_note || "",
    });
    setShowBillingModal(true);
  };

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillingSchool) return;
    updateSchoolBilling(selectedBillingSchool.id, billingForm);
    setShowBillingModal(false);
    setActionNotice(`✓ Plan & billing customized for ${selectedBillingSchool.name}. MRR updated!`);
    refreshAll();
    setTimeout(() => setActionNotice(null), 4000);
  };

  const copyToClipboard = (text: string, field: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const copyAllCredentials = () => {
    if (!createdCredentials) return;
    const summary = `Attendlix School Management Portal — Principal Login Credentials
---------------------------------------------------------------
School Name: ${createdCredentials.schoolName}
Tenant ID: ${createdCredentials.schoolId}
Principal Name: ${createdCredentials.principalName}
Login Identifier: ${createdCredentials.principalId}
Temporary Password: ${createdCredentials.password}
Portal URL: https://attendlix.vercel.app/login

(Save these credentials or send them directly to the principal on WhatsApp)`;
    copyToClipboard(summary, "all");
  };

  const getWhatsAppShareUrl = () => {
    if (!createdCredentials) return "#";
    const phone = normalizePakistaniPhone(createdCredentials.phone || "");
    const message = `Assalam-o-Alaikum! 🌟
Your Attendlix School Management Portal has been provisioned:

🏫 School: ${createdCredentials.schoolName}
👤 Principal Login ID: ${createdCredentials.principalId}
🔑 Temporary Password: ${createdCredentials.password}
🌐 Login URL: https://attendlix.vercel.app/login

You can log in and begin managing classes, admissions, attendance, and fee collection right away.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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
            onClick={openOnboardModal}
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
                      <div className="font-extrabold text-emerald-700 flex items-center gap-1">
                        <span>PKR {(sch.mrr_pkr !== undefined ? sch.mrr_pkr : 35000).toLocaleString()}</span>
                        <span className="text-[10px] font-normal text-slate-500">/mo</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold truncate">
                        {sch.plan || "STANDARD"} {sch.billing_note && `• ${sch.billing_note}`}
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
                      onClick={() => openBillingModal(sch)}
                      className="flex-1 py-2 px-3 min-h-[40px] rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.editPlanBilling || "Edit Plan & Billing"}</span>
                    </button>

                    <button
                      onClick={() => openPaymentModal(sch)}
                      className="flex-1 py-2 px-3 min-h-[40px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
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
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span>{sch.plan || "STANDARD"}</span>
                        {sch.billing_note && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-medium border border-slate-200 truncate max-w-[120px]">
                            {sch.billing_note}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        PKR {(sch.mrr_pkr !== undefined ? sch.mrr_pkr : 35000).toLocaleString()} / mo
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
                          onClick={() => openBillingModal(sch)}
                          className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] shadow-2xs transition-all flex items-center gap-1"
                          title="Edit Custom MRR, Plan Tier, and Status"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-emerald-600" />
                          <span>{t.editPlanBilling || "Edit Plan & Billing"}</span>
                        </button>

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
          <div className="w-full max-w-lg max-h-[88vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Onboard New School Tenant</h3>
                <p className="text-xs text-slate-500">Provisions isolated tenant & generates Principal credentials</p>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">School / Campus Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Beaconhouse Senior Campus"
                    value={onboardForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setOnboardForm((prev) => ({
                        ...prev,
                        name,
                        principalId: generatePrincipalId(name, prev.city),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Principal / Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Asim Farooq"
                    value={onboardForm.principalName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, principalName: e.target.value })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <select
                    value={onboardForm.city}
                    onChange={(e) => {
                      const city = e.target.value;
                      setOnboardForm((prev) => ({
                        ...prev,
                        city,
                        principalId: generatePrincipalId(prev.name, city),
                      }));
                    }}
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
                    <option value="Sialkot">Sialkot</option>
                    <option value="Gujranwala">Gujranwala</option>
                  </select>
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
                    placeholder="principal@school.edu.pk"
                    value={onboardForm.email}
                    onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Plan & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan *</label>
                  <select
                    value={onboardForm.plan}
                    onChange={(e) => {
                      const plan = e.target.value;
                      const mrr = plan === "PREMIUM" ? 55000 : plan === "STANDARD" ? 35000 : 0;
                      setOnboardForm({ ...onboardForm, plan, mrr_pkr: mrr });
                    }}
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="STANDARD">Campus Standard (PKR 35,000)</option>
                    <option value="PREMIUM">Campus Enterprise (PKR 55,000)</option>
                    <option value="TRIAL">14-Day Free Trial (PKR 0)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Monthly MRR (PKR) *</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={onboardForm.mrr_pkr}
                    onChange={(e) => setOnboardForm({ ...onboardForm, mrr_pkr: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    placeholder="35000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Billing / Contract Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Founding School Partner, 25% Off Annual Agreement"
                    value={onboardForm.billing_note}
                    onChange={(e) => setOnboardForm({ ...onboardForm, billing_note: e.target.value })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Auto-Generated Principal Credentials Box */}
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Auto-Generated Principal Credentials</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-semibold">
                    Instant Provisioning
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Generated Principal Login ID */}
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">Principal Login ID</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={onboardForm.principalId}
                        onChange={(e) => setOnboardForm({ ...onboardForm, principalId: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-emerald-300 bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOnboardForm({
                            ...onboardForm,
                            principalId: generatePrincipalId(onboardForm.name, onboardForm.city),
                          })
                        }
                        title="Regenerate Login ID"
                        className="px-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Generated Temporary Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">Temporary Password</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={onboardForm.principalPassword}
                        onChange={(e) => setOnboardForm({ ...onboardForm, principalPassword: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-emerald-300 bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOnboardForm({
                            ...onboardForm,
                            principalPassword: generateStrongPassword(),
                          })
                        }
                        title="Regenerate Strong Password"
                        className="px-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-800">
                  Credentials summary with 1-click Copy and WhatsApp sharing will be displayed immediately after submission.
                </p>
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
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white font-bold shadow-2xs flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Onboard Tenant & Issue Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PLAN & BILLING */}
      {/* ========================================================================= */}
      {showBillingModal && selectedBillingSchool && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                  <span>{t.editPlanBilling || "Edit Plan & Billing"}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize subscription rate and status for <strong>{selectedBillingSchool.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowBillingModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBillingSubmit} className="space-y-4 text-xs">
              {/* Monthly Charge / MRR (PKR) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {t.monthlyChargeMRR || "Monthly Charge / MRR (PKR)"} *
                  </label>
                  <span className="text-[11px] text-emerald-600 font-bold font-mono">
                    PKR {Number(billingForm.mrr_pkr || 0).toLocaleString()} / month
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={billingForm.mrr_pkr}
                  onChange={(e) => setBillingForm({ ...billingForm, mrr_pkr: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="e.g. 35000"
                />
                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[15000, 25000, 35000, 50000, 75000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBillingForm({ ...billingForm, mrr_pkr: amt })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        billingForm.mrr_pkr === amt
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      PKR {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan / Tier Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plan Tier / Package *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "STANDARD", label: "Standard", desc: "PKR 35k base" },
                    { id: "PREMIUM", label: "Premium", desc: "PKR 55k enterprise" },
                    { id: "TRIAL", label: "Trial", desc: "Free trial" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setBillingForm({ ...billingForm, plan: p.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        billingForm.plan === p.id
                          ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-900">{p.label}</div>
                      <div className="text-[10px] text-slate-500">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan / Billing Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.planNote || "Plan / Billing Note"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Founding Discount, Custom Partner, 30% Off Early Adopter"
                  value={billingForm.billing_note}
                  onChange={(e) => setBillingForm({ ...billingForm, billing_note: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Custom label shown in the tenant table to highlight special discounts or agreements.
                </p>
              </div>

              {/* Subscription Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t.subscriptionStatus || "Subscription Status"} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBillingForm({ ...billingForm, status: "ACTIVE" })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      billingForm.status === "ACTIVE"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    ✓ ACTIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingForm({ ...billingForm, status: "TRIAL" })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      billingForm.status === "TRIAL"
                        ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    ⏳ TRIAL
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingForm({ ...billingForm, status: "SUSPENDED" })}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                      billingForm.status === "SUSPENDED"
                        ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    ⏸ SUSPENDED
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBillingModal(false)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.saveBilling || "Save Plan & Billing"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GENERATED PRINCIPAL CREDENTIALS SUMMARY */}
      {/* ========================================================================= */}
      {showCredentialsModal && createdCredentials && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{t.principalCredentials || "Principal Credentials Summary"}</h3>
                  <p className="text-xs text-slate-500">School tenant & principal login provisioned cleanly</p>
                </div>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Tenant Active: {createdCredentials.schoolName}</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Save or send these login details to the principal immediately. They can log in directly at the unified portal.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 font-mono text-xs">
              {/* School Name & ID */}
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 font-sans">
                <span className="text-slate-500 text-xs">School Tenant</span>
                <span className="font-bold text-slate-800 text-xs">
                  {createdCredentials.schoolName}{" "}
                  <span className="text-slate-400 font-mono text-[10px]">({createdCredentials.schoolId})</span>
                </span>
              </div>

              {/* Principal Name */}
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 font-sans">
                <span className="text-slate-500 text-xs">Principal Name</span>
                <span className="font-bold text-slate-800 text-xs">{createdCredentials.principalName}</span>
              </div>

              {/* Principal Login ID */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">Principal Login ID</div>
                  <div className="font-bold text-sm text-emerald-700">{createdCredentials.principalId}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdCredentials.principalId, "id")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-sans text-xs flex items-center gap-1 shadow-2xs transition-colors"
                >
                  {copiedField === "id" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedField === "id" ? "Copied" : "Copy ID"}</span>
                </button>
              </div>

              {/* Temporary Password */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">Temporary Password</div>
                  <div className="font-bold text-sm text-slate-900 tracking-wide">{createdCredentials.password}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdCredentials.password, "pass")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-sans text-xs flex items-center gap-1 shadow-2xs transition-colors"
                >
                  {copiedField === "pass" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedField === "pass" ? "Copied" : "Copy Password"}</span>
                </button>
              </div>

              {/* Login Portal URL */}
              <div className="flex items-center justify-between py-1.5 font-sans">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Login Portal URL</div>
                  <div className="text-xs text-blue-600 font-semibold truncate max-w-[190px] sm:max-w-[280px]">
                    https://attendlix.vercel.app/login
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard("https://attendlix.vercel.app/login", "link")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs flex items-center gap-1 shadow-2xs transition-colors"
                >
                  {copiedField === "link" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedField === "link" ? "Copied" : "Copy Link"}</span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={copyAllCredentials}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-colors"
              >
                {copiedField === "all" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedField === "all" ? "Credentials Block Copied!" : t.copyAllCredentials || "Copy All Credentials"}</span>
              </button>

              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px] transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs min-h-[44px]"
              >
                Done & Return to Tenants
              </button>
            </div>
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
