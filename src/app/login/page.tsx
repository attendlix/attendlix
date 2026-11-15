"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  UserCheck,
  Building2,
  Users,
  Receipt,
  Smartphone,
  Shield,
} from "lucide-react";
import { loginUser } from "@/lib/store";
import { LanguageToggle } from "@/context/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginUser(identifier, password);
      if (res.success && res.user) {
        // Role based redirect
        switch (res.user.role) {
          case "SUPER_ADMIN":
            router.push("/dashboard/super-admin");
            break;
          case "PRINCIPAL":
            router.push("/dashboard/principal");
            break;
          case "TEACHER":
            router.push("/dashboard/teacher");
            break;
          case "ACCOUNTANT":
            router.push("/dashboard/principal");
            break;
          case "STUDENT_PARENT":
            router.push("/dashboard/student");
            break;
          default:
            router.push("/dashboard/principal");
        }
      } else {
        setError(res.error || "Invalid login credentials.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing
  const fillDemoAccount = (roleId: string, rolePass: string) => {
    setIdentifier(roleId);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* Top Header with Brand & Language Toggle */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between pb-3">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Attendlix<span className="text-emerald-600">.</span>
          </span>
        </Link>
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 pt-1">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Unified School Login
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          One portal for Principals, Teachers, Accountants, and Parents.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-1 sm:px-0">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 shadow-sm rounded-2xl border border-slate-200/80 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identifier (Email, Phone, or ID)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. principal@beacon.edu.pk or TCH-101"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 min-h-[44px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-400">Default: admin</span>
              </div>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 min-h-[44px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to School Portal</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts Selector */}
          <div className="pt-4 border-t border-slate-200/80 space-y-2">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount("superadmin@attendlix.com", "admin")}
                className="col-span-1 sm:col-span-2 p-2.5 rounded-xl border border-slate-900 bg-slate-900 text-white hover:bg-slate-800 text-left transition-all flex items-center justify-between min-h-[44px]"
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Super Admin (Me)</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">superadmin@attendlix.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount("principal@beacon.edu.pk", "admin")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all min-h-[44px]"
              >
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Principal</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">principal@beacon...</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount("TCH-101", "pass-teacher")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all min-h-[44px]"
              >
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Teacher</span>
                </div>
                <div className="text-[10px] text-slate-500">ID: TCH-101</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount("ACC-201", "pass-accounts")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all min-h-[44px]"
              >
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Receipt className="w-3.5 h-3.5 text-amber-600" />
                  <span>Accountant</span>
                </div>
                <div className="text-[10px] text-slate-500">ID: ACC-201</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount("STD-2026-001", "pass-parent")}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all min-h-[44px]"
              >
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                  <span>Parent</span>
                </div>
                <div className="text-[10px] text-slate-500">ID: STD-2026-001</div>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-600">
            School owner?{" "}
            <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
              Register New School Tenant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
