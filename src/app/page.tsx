"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MessageSquare,
  WifiOff,
  CreditCard,
  Shield,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Users,
  GraduationCap,
  CalendarCheck,
  Receipt,
  BellRing,
  Globe,
  Clock,
  Send,
  Building2,
  Check,
  School,
  FileSpreadsheet,
} from "lucide-react";
import { useLanguage, LanguageToggle } from "@/context/LanguageContext";

export default function LandingPage() {
  const { lang, setLang } = useLanguage();
  const [activeRole, setActiveRole] = useState<"principal" | "teacher" | "accountant" | "parent">("principal");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    city: "",
    contactName: "",
    whatsapp: "",
    studentCount: "100-300",
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Top Notification Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs sm:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          {lang === "en"
            ? "🇵🇰 Built specifically for Pakistani Schools — 100% Free Trial available"
            : "🇵🇰 خاص طور پر پاکستانی اسکولوں کے لیے تیار کردہ — مفت ٹرائل دستیاب ہے"}
        </span>
      </div>

      {/* Modern Minimal Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAFAFA]/90 border-b border-slate-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection("hero")}>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Attendlix<span className="text-emerald-600">.</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button onClick={() => scrollToSection("pillars")} className="hover:text-slate-950 transition-colors">
              {lang === "en" ? "Features" : "خصوصیات"}
            </button>
            <button onClick={() => scrollToSection("roles")} className="hover:text-slate-950 transition-colors">
              {lang === "en" ? "Who It's For" : "کردار"}
            </button>
            <button onClick={() => scrollToSection("localization")} className="hover:text-slate-950 transition-colors">
              {lang === "en" ? "Urdu Support" : "اردو سپورٹ"}
            </button>
            <button onClick={() => scrollToSection("pricing")} className="hover:text-slate-950 transition-colors">
              {lang === "en" ? "Pricing" : "قیمتیں"}
            </button>
          </nav>

          {/* Right Action: Language Toggle + Login + CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher Badge */}
            <LanguageToggle />

            {/* Login Link */}
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              {lang === "en" ? "Sign In" : "لاگ ان"}
            </Link>

            {/* Register CTA Button */}
            <Link
              href="/register"
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.01]"
            >
              {lang === "en" ? "Register School" : "اسکول رجسٹر کریں"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-16 sm:pt-24 pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-grid-subtle [mask-image:radial-gradient(ellipse_at_top,transparent_20%,black)] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold tracking-wide shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {lang === "en"
                ? "Smart School Management Built for Pakistan"
                : "پاکستان کے تمام تعلیمی اداروں کے لیے اسمارٹ انتظام"}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            {lang === "en" ? (
              <>
                Run Your School Effortlessly. <br className="hidden sm:inline" />
                <span className="text-emerald-600">Even Without Internet.</span>
              </>
            ) : (
              <span className="font-['Noto_Nastaliq_Urdu'] leading-relaxed">
                انٹرنیٹ کے بغیر بھی اپنے اسکول کا انتظام آسانی سے سنبھالیں۔
              </span>
            )}
          </h1>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {lang === "en"
              ? "Manage daily attendance, fee vouchers, and parent communications in one lightweight platform—powered by automatic WhatsApp alerts, offline local sync, and JazzCash/Easypaisa payments."
              : "حاضری، فیس واؤچرز اور والدین سے رابطہ اب ایک ہی جگہ۔ واٹس ایپ الرٹس، آف لائن سپورٹ اور ایزی پیسہ/جاز کیش فیس وصولی کے ساتھ۔"}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>{lang === "en" ? "Register School Free" : "مفت اسکول رجسٹر کریں"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <span>{lang === "en" ? "Sign In to Portal" : "پورٹل لاگ ان"}</span>
            </Link>
          </div>

          {/* Micro Trust Proofs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Works on 2GB RAM Phones</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Parents Need No App (WhatsApp Fallback)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Multi-Tenant & Isolated DB</span>
            </div>
          </div>
        </div>

        {/* Dashboard UI Mockup Preview */}
        <div className="max-w-5xl mx-auto mt-12 sm:mt-16">
          <div className="relative rounded-2xl p-2 sm:p-3 bg-slate-900/5 ring-1 ring-slate-900/10 shadow-2xl backdrop-blur-sm">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner">
              {/* Fake Window Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-emerald-600" />
                    Beacon Grammar Academy — Attendlix Portal
                  </span>
                </div>
                {/* Offline Sync Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Offline Sync Active (Zero Data Loss)
                  </span>
                </div>
              </div>

              {/* Mockup Dashboard Content Grid */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/50">
                {/* Card 1: Attendance */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                        <CalendarCheck className="w-4 h-4" />
                      </div>
                      <span>Daily Attendance</span>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Grade 8-B
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">38 / 40</div>
                      <div className="text-xs text-slate-500">Students Present (95%)</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                        2 Absent
                      </span>
                    </div>
                  </div>
                  {/* WhatsApp trigger preview */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp alert auto-sent to 2 parents</span>
                  </div>
                </div>

                {/* Card 2: WhatsApp Fee Automation */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                      <div className="p-2 rounded-lg bg-green-50 text-green-600">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span>WhatsApp Reminders</span>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-green-100 text-green-800">
                      Automated
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="text-xs text-slate-500 font-medium">Challan #4092 Sent</div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                      <span className="font-semibold text-emerald-600">Attendlix Bot:</span> "Mohtaram Parent, Ali ki
                      November fee Rs. 4,500 due hai. Pay via JazzCash / Easypaisa."
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Delivered 09:30 AM</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Read
                    </span>
                  </div>
                </div>

                {/* Card 3: JazzCash & Easypaisa Fee Collection */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span>Fee Collection</span>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      JazzCash / Easypaisa
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">PKR 184,500</div>
                    <div className="text-xs text-slate-500">Collected this month</div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">Easypaisa Online Voucher</span>
                      <span className="text-emerald-600 font-semibold">PKR 4,500 (Instant)</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 font-medium">JazzCash QuickPay</span>
                      <span className="text-emerald-600 font-semibold">PKR 3,800 (Instant)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Value Pillars Section */}
      <section id="pillars" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section Heading */}
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              {lang === "en" ? "Pakistan-First Engineering" : "پاکستانی ضروریات کے مطابق"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {lang === "en"
                ? "Engineered for Real Ground Realities"
                : "زمینی حقائق اور اسکولوں کے مسائل کا پائیدار حل"}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {lang === "en"
                ? "Generic foreign software fails in Pakistan. Attendlix is built specifically for local connectivity, parent behavior, and payment habits."
                : "عام سافٹ ویئر سست رفتار انٹرنیٹ اور روایتی طریقوں میں کام نہیں کرتے۔ اٹینڈلکس خاص طور پر آپ کے لیے ہے۔"}
            </p>
          </div>

          {/* 3 Pillar Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-slate-200/80 hover:border-emerald-300 transition-all shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {lang === "en" ? "WhatsApp-First Fallback" : "براہِ راست واٹس ایپ الرٹس"}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {lang === "en"
                    ? "90%+ of parents in Pakistan will not install or maintain a heavy mobile app. Attendlix sends automated attendance alerts, fee challans, and circulars directly to parent WhatsApp numbers."
                    : "والدین کو بھاری ایپ انسٹال کرنے کی ضرورت نہیں۔ حاضری کی اطلاع اور فیس یاد دہانی براہِ راست واٹس ایپ پر پہنچائی جاتی ہے۔"}
                </p>
              </div>
              <ul className="space-y-2 text-xs font-medium text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant Absentee Alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fee Voucher PDF directly via WhatsApp</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Principal One-Way Broadcast Announcements</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-slate-200/80 hover:border-emerald-300 transition-all shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <WifiOff className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {lang === "en" ? "Works Offline & 2GB RAM" : "بغیر انٹرنیٹ اور عام فون پر"}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {lang === "en"
                    ? "Load-shedding or no 4G signal? Teachers can mark class attendance fully offline. When connectivity is restored, records queue locally and synchronize without duplicates or data loss."
                    : "انٹرنیٹ بند بھی ہو تو اساتذہ بغیر رکاوٹ حاضری لگا سکتے ہیں۔ انٹرنیٹ آتے ہی تمام ڈیٹا خود بخود کلاؤڈ پر محفوظ ہو جاتا ہے۔"}
                </p>
              </div>
              <ul className="space-y-2 text-xs font-medium text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Optimized for low-cost Android phones</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ultra-small bundle size (&lt; 15MB)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero lag during morning attendance rush</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-slate-200/80 hover:border-emerald-300 transition-all shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {lang === "en" ? "JazzCash & Easypaisa Ready" : "جاز کیش اور ایزی پیسہ وصولی"}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {lang === "en"
                    ? "Eliminate long bank queues and lost paper slips. Generate standardized 1-click printable/digital fee vouchers with automated reconciliation for school accountants."
                    : "بینکوں کے چکر اور کاغذی رسیدوں کے ضیاع سے نجات۔ فوری آن لائن واؤچر اور اکاؤنٹنٹ کے لیے شفاف خودکار حساب کتاب۔"}
                </p>
              </div>
              <ul className="space-y-2 text-xs font-medium text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Printable 3-copy fee voucher generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant payment status reconciliation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Defaulter tracking & automatic gentle nudges</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Simplicity Section */}
      <section id="roles" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Role-Based Access Control (RBAC)
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Every Person in Your School
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Clean interfaces tailored to specific responsibilities. No complicated menus or data confusion.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { id: "principal", label: "Principals & Owners", icon: Building2 },
            { id: "teacher", label: "Teachers & Staff", icon: Users },
            { id: "accountant", label: "Accountants", icon: Receipt },
            { id: "parent", label: "Parents", icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeRole === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveRole(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Role Tab Dynamic Display */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-10 shadow-xs max-w-4xl mx-auto transition-all">
          {activeRole === "principal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  Complete Governance
                </span>
                <h3 className="text-2xl font-bold text-slate-900">Full Oversight from Your Phone</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Monitor live student attendance, fee recovery rates, and staff activity without walking between classrooms. Send official school announcements with a single tap.
                </p>
                <div className="space-y-2 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>One-way official circulars (no parent reply spam)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-time fee collection dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Staff attendance & class assignment matrix</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Principal Summary</div>
                <div className="text-sm font-semibold text-slate-900">All Campuses Overview</div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500">Total Enrolled</div>
                    <div className="text-xl font-bold text-slate-900">842 Students</div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <div className="text-xs text-slate-500">Attendance Today</div>
                    <div className="text-xl font-bold text-emerald-600">96.4%</div>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium">
                  📢 Circular: "Winter timings effective Monday" broadcasted to 680 parents.
                </div>
              </div>
            </div>
          )}

          {activeRole === "teacher" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  Zero Complex Software
                </span>
                <h3 className="text-2xl font-bold text-slate-900">Mark Attendance in Under 30 Seconds</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Teachers shouldn't waste 15 minutes of lesson time filling paper registers. Attendlix offers 1-tap roll calls, daily diary posting, and marks entry.
                </p>
                <div className="space-y-2 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Works fully offline if school WiFi disconnects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Fast homework diary entry with image attachments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mid-term and final exam marks recording</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Class 7-Green</span>
                  <span className="text-emerald-600">Ready to Save</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-900">01. Abdullah Khan</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Present</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-900">02. Ayesha Noor</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Present</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-900">03. Bilal Ahmed</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">Absent (Notify)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeRole === "accountant" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
                  Dedicated Accounting Sandbox
                </span>
                <h3 className="text-2xl font-bold text-slate-900">Strictly Isolated Fee Management</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Accountants have specialized access to generate fee slips, track defaulters, and verify payments without touching student academic records or principal administrative settings.
                </p>
                <div className="space-y-2 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bulk printable challan generator (Bank + School + Parent copy)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-time JazzCash & Easypaisa reconciliation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Late fee auto-calculation and fee concession rules</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Ledger</div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Challan #5920</div>
                    <div className="text-[11px] text-slate-500">Hamza Tariq (Grade 10)</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded">
                    Paid via Easypaisa
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Challan #5921</div>
                    <div className="text-[11px] text-slate-500">Fatima Zahra (Grade 6)</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded">
                    Unpaid (Reminder Sent)
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeRole === "parent" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  Zero Friction For Parents
                </span>
                <h3 className="text-2xl font-bold text-slate-900">Peace of Mind via Regular WhatsApp</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Parents stay informed without complicated logins. When they need to ask a question, quiet-hour rules protect teachers from late-night messages.
                </p>
                <div className="space-y-2 text-xs font-medium text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Morning arrival notification right on WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Teacher messaging with enforced quiet hours (after 6 PM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Homework and test marks tracking without paper diaries</span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Quiet Hours Active (6:00 PM – 8:00 AM)</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-900">Parent to Teacher Message:</div>
                  <p className="text-[11px]">"Teacher sahiba, Zain will be absent tomorrow due to flu."</p>
                  <div className="text-[10px] text-slate-400 text-right">Queued for morning delivery 08:00 AM</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bilingual Urdu Ready Banner */}
      <section id="localization" className="py-16 bg-slate-900 text-white px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Full Bilingual Support</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Available in English & Urdu (اردو)
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Every screen, report, voucher, and notification is crafted with first-class Urdu typography (RTL) so every teacher, security guard, accountant, and parent feels instantly at home.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-slate-800 border border-slate-700 w-full max-w-md space-y-3 font-['Noto_Nastaliq_Urdu'] text-right">
            <div className="text-xs text-emerald-400 font-sans text-left">Urdu Interface Preview:</div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-sm">
              <div className="text-white font-bold">طالب علم کی حاضری محفوظ ہو گئی ہے۔</div>
              <div className="text-xs text-slate-400 mt-1">والدین کو واٹس ایپ پیغام ارسال کر دیا گیا۔</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 text-sm">
              <div className="text-white font-bold">ماہانہ فیس چالان: 4,500 روپے</div>
              <div className="text-xs text-emerald-400 mt-1">ایزی پیسہ اور جاز کیش کے ذریعے ادائیگی ممکن ہے۔</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Free Tier Notice */}
      <section id="pricing" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Fair & Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Pakistani Budgets
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            No expensive upfront hardware or foreign currency credit cards. 100% free onboarding.
          </p>
        </div>

        <div className="max-w-lg mx-auto bg-white rounded-2xl border-2 border-emerald-600 p-8 shadow-lg space-y-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wide">
            School Launch Special
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-slate-900">All-Inclusive Campus Plan</h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-sm font-semibold text-slate-500">PKR</span>
              <span className="text-4xl font-extrabold text-slate-900">15</span>
              <span className="text-xs text-slate-500">/ student / month</span>
            </div>
            <p className="text-xs text-slate-500">Billed monthly or quarterly in Pakistani Rupees.</p>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-slate-700 border-t border-slate-100 pt-4">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Full Attendance & Offline Sync</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Automatic WhatsApp Fallback Notifications</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>JazzCash & Easypaisa Fee Reconciliation</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Multi-user RBAC (Principals, Teachers, Accountants, Parents)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Urdu & English language support</span>
            </li>
          </ul>

          <button
            onClick={() => scrollToSection("demo")}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all"
          >
            Start 14-Day Free School Trial
          </button>
        </div>
      </section>

      {/* Demo Booking / School Registration Form */}
      <section id="demo" className="py-20 bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6">
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Get Started in Minutes
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Ready to digitize your school?
            </h2>
            <p className="text-slate-600 text-sm">
              Fill in your school details below. Our team will configure your school tenant and set up a free personalized walkthrough via WhatsApp.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            {formSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Shukriya! Demo Request Received</h3>
                <p className="text-sm text-slate-600 max-w-sm mx-auto">
                  We have received the details for <span className="font-semibold text-slate-900">{formData.schoolName || "your school"}</span>. Our representative will contact you on WhatsApp ({formData.whatsapp}) shortly!
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="text-xs text-emerald-600 font-semibold underline hover:text-emerald-700"
                >
                  Submit another school
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The City School / Allied Campus"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lahore, Karachi, Rawalpindi"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Estimated Students
                    </label>
                    <select
                      value={formData.studentCount}
                      onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 bg-white"
                    >
                      <option value="50-100">50 - 100 Students</option>
                      <option value="100-300">100 - 300 Students</option>
                      <option value="300-800">300 - 800 Students</option>
                      <option value="800+">800+ Students</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Name / Role *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Asif (Principal)"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0300-1234567"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Request Free Demo & Setup Walkthrough</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center">
                  No credit card required. We respect your privacy and will never spam.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">
              Attendlix<span className="text-emerald-600">.</span>
            </span>
            <span className="text-slate-400">| School ERP for Pakistan</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-600">
            <a href="#hero" className="hover:text-slate-900">Back to Top</a>
            <a href="#pillars" className="hover:text-slate-900">Features</a>
            <a href="#roles" className="hover:text-slate-900">Roles</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <a href="#demo" className="hover:text-slate-900">Contact Support</a>
          </div>

          <div>
            © {new Date().getFullYear()} Attendlix. All rights reserved. Built with ❤️ in Pakistan.
          </div>
        </div>
      </footer>
    </div>
  );
}
