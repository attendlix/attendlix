"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Copy,
  RefreshCw,
  Check,
  Key,
  MessageSquare,
} from "lucide-react";
import { registerSchool, generatePrincipalId, generateStrongPassword } from "@/lib/store";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";
import { normalizePakistaniPhone } from "@/lib/whatsapp";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    schoolName: "",
    principalName: "",
    city: "Lahore",
    phone: "",
    email: "",
    password: "",
  });

  const [principalId, setPrincipalId] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    schoolName: string;
    schoolId: string;
    principalName: string;
    principalId: string;
    password: string;
    phone: string;
  } | null>(null);

  // Initialize auto-generated credentials on mount
  useEffect(() => {
    setPrincipalId(generatePrincipalId("", "Lahore"));
    setFormData((prev) => ({
      ...prev,
      password: generateStrongPassword(),
    }));
  }, []);

  const handleSchoolNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, schoolName: name }));
    setPrincipalId(generatePrincipalId(name, formData.city));
  };

  const handleCityChange = (city: string) => {
    setFormData((prev) => ({ ...prev, city }));
    setPrincipalId(generatePrincipalId(formData.schoolName, city));
  };

  const regenerateId = () => {
    setPrincipalId(generatePrincipalId(formData.schoolName, formData.city));
  };

  const regeneratePassword = () => {
    setFormData((prev) => ({
      ...prev,
      password: generateStrongPassword(),
    }));
  };

  const copyToClipboard = (text: string, field: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const copyAllCredentials = () => {
    if (!summaryData) return;
    const summary = `Attendlix School Management Portal — Principal Login Credentials
---------------------------------------------------------------
School Name: ${summaryData.schoolName} (ID: ${summaryData.schoolId})
Principal: ${summaryData.principalName}
Login Identifier: ${summaryData.principalId}
Temporary Password: ${summaryData.password}
Login URL: https://attendlix.vercel.app/login`;
    copyToClipboard(summary, "all");
  };

  const getWhatsAppShareUrl = () => {
    if (!summaryData) return "#";
    const phone = normalizePakistaniPhone(summaryData.phone || "");
    const message = `Assalam-o-Alaikum! 🌟
Your Attendlix School Management Portal has been provisioned:

🏫 School: ${summaryData.schoolName}
👤 Principal Login ID: ${summaryData.principalId}
🔑 Temporary Password: ${summaryData.password}
🌐 Login URL: https://attendlix.vercel.app/login

You can log in and begin managing classes, admissions, attendance, and fee collection right away.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerSchool({
        ...formData,
        principalId: principalId.trim(),
      });
      if (res.success && res.school && res.user) {
        setSummaryData({
          schoolName: res.school.name,
          schoolId: res.school.id,
          principalName: res.user.name,
          principalId: res.user.identifier,
          password: formData.password,
          phone: res.school.phone,
        });
        setShowSummaryModal(true);
      } else {
        setError(res.error || "Failed to register school.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between pb-3">
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
          Register Your School Tenant
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Dedicated, isolated database environment for your school in Pakistan.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-1 sm:px-0">
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 shadow-sm rounded-2xl border border-slate-200/80">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* School Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  School / Academy Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beacon Grammar High School"
                  value={formData.schoolName}
                  onChange={(e) => handleSchoolNameChange(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 min-h-[44px]"
                />
              </div>

              {/* Principal Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Principal / Owner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Asim Farooq"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 min-h-[44px]"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 bg-white min-h-[44px]"
                >
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Multan">Multan</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Other">Other City</option>
                </select>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp / Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 min-h-[44px] font-mono"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="principal@school.edu.pk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 min-h-[44px]"
                />
              </div>

              {/* Auto-Generated Principal Login ID & Password Box */}
              <div className="sm:col-span-2 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Auto-Generated Principal Login Credentials</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full font-semibold">
                    Instant Access
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Principal Login ID */}
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Principal Login ID
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={principalId}
                        onChange={(e) => setPrincipalId(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-emerald-300 bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={regenerateId}
                        title="Regenerate Login ID"
                        className="px-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Principal Password */}
                  <div>
                    <label className="block text-[11px] font-semibold text-emerald-900 mb-1">
                      Set Principal Password
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-emerald-300 bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={regeneratePassword}
                        title="Regenerate Strong Password"
                        className="px-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-emerald-800">
                  Tip: A full credentials summary with 1-click Copy and WhatsApp sharing will be displayed upon registration.
                </p>
              </div>
            </div>

            {/* Feature pill highlights */}
            <div className="pt-1 pb-1 space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automatically sets up your isolated school tenant (Row-Level Security)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Grants complete Principal & Super Admin access</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                <span>Creating School Tenant...</span>
              ) : (
                <>
                  <span>Create School Tenant & Generate Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to login */}
          <div className="mt-6 pt-6 border-t border-slate-200/80 text-center text-xs text-slate-600">
            Already registered your school?{" "}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 underline">
              Login to Unified Portal
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* POST-REGISTRATION PRINCIPAL CREDENTIALS SUMMARY MODAL */}
      {/* ========================================================================= */}
      {showSummaryModal && summaryData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Registration Complete!</h3>
                  <p className="text-xs text-slate-500">Your school tenant and credentials have been created</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Tenant Provisioned: {summaryData.schoolName}</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Please copy or save your login credentials below before proceeding to your dashboard.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 font-mono text-xs">
              {/* School Tenant */}
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 font-sans">
                <span className="text-slate-500 text-xs">School Tenant</span>
                <span className="font-bold text-slate-800 text-xs">
                  {summaryData.schoolName}{" "}
                  <span className="text-slate-400 font-mono text-[10px]">({summaryData.schoolId})</span>
                </span>
              </div>

              {/* Principal Name */}
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60 font-sans">
                <span className="text-slate-500 text-xs">Principal Name</span>
                <span className="font-bold text-slate-800 text-xs">{summaryData.principalName}</span>
              </div>

              {/* Principal Login ID */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">Principal Login ID</div>
                  <div className="font-bold text-sm text-emerald-700">{summaryData.principalId}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(summaryData.principalId, "id")}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-sans text-xs flex items-center gap-1 shadow-2xs transition-colors"
                >
                  {copiedField === "id" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedField === "id" ? "Copied" : "Copy ID"}</span>
                </button>
              </div>

              {/* Temporary Password */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">Password</div>
                  <div className="font-bold text-sm text-slate-900 tracking-wide">{summaryData.password}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(summaryData.password, "pass")}
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
                <span>{copiedField === "all" ? "Credentials Block Copied!" : "Copy Full Summary"}</span>
              </button>

              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs min-h-[44px] transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Save to WhatsApp</span>
              </a>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push("/dashboard/principal")}
                className="w-full py-3 rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>Proceed to Principal Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
