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
} from "lucide-react";
import {
  getCurrentUser,
  getAllSchools,
  getPlatformStats,
  updateSchoolStatus,
  extendSchoolTrial,
  onboardManualSchool,
  logout,
} from "@/lib/store";
import { User, School } from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";
import { normalizePakistaniPhone } from "@/lib/whatsapp";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 text-lg">
                Attendlix<span className="text-emerald-600">.</span> Admin
              </span>
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Platform Super Admin</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />

            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">Tenant: GLOBAL</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
              title={t.signOut}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner */}
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

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
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{t.onboardSchool}</span>
          </button>
        </div>

        {/* 4 Platform Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Schools */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.totalSchools}</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{platformStats?.totalSchools || 0}</div>
            <div className="text-[11px] text-slate-500">Isolated database tenants</div>
          </div>

          {/* Card 2: Active Subscriptions */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.activeSubscriptions}</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-blue-600">{platformStats?.activeSubscriptions || 0}</div>
            <div className="text-[11px] text-slate-500">
              {platformStats?.totalSchools
                ? Math.round((platformStats.activeSubscriptions / platformStats.totalSchools) * 100)
                : 0}
              % conversion rate
            </div>
          </div>

          {/* Card 3: Total Students Platform */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.totalStudentsPlatform}</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{platformStats?.totalStudentsPlatform || 0}</div>
            <div className="text-[11px] text-slate-500">Enrolled across all campuses</div>
          </div>

          {/* Card 4: Platform MRR */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">{t.platformMRR}</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">
              PKR {(platformStats?.platformMRR || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500">Recurring SaaS billing in PKR</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by school name, city, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {(["ALL", "ACTIVE", "TRIAL", "SUSPENDED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === status
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Schools / Tenants Management Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
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
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ONBOARD NEW SCHOOL MANUALLY */}
      {/* ========================================================================= */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Onboard New School Tenant</h3>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
                  <select
                    value={onboardForm.city}
                    onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
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
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="contact@school.edu.pk"
                  value={onboardForm.email}
                  onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-2xs"
                >
                  Onboard Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
