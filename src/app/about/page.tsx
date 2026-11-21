"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  WifiOff,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Users,
  Clock,
  Building2,
  CalendarCheck,
  Award,
  Zap,
  Check,
  Layers,
  Globe,
  UserCheck,
  FileText,
  Activity,
  HeartHandshake,
  TrendingUp,
  XCircle,
  FileCheck2,
} from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useLanguage, LanguageToggle } from "@/context/LanguageContext";

export default function AboutPage() {
  const { lang, isRtl } = useLanguage();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans relative overflow-x-hidden pt-16 sm:pt-20">
      {/* Shared Floating Glass Navbar */}
      <FloatingNavbar />

      {/* Ambient Royal Light Background Mesh & Subtle Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-100/40 rounded-full blur-[140px] opacity-70" />
        <div className="absolute top-96 -left-32 w-[500px] h-[400px] bg-indigo-100/40 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-[800px] -right-32 w-[550px] h-[450px] bg-slate-200/50 rounded-full blur-[130px] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f050_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f050_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH INTERACTIVE ECOSYSTEM NODE DIAGRAM */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-8 pb-14 sm:pt-14 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Mission & Story */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-[11px] font-semibold tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{lang === "en" ? "ABOUT ATTENDLIX" : "اٹینڈلکس کا تعارف"}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-[1.15] text-slate-900"
            >
              {lang === "en" ? (
                <>
                  Our mission:{" "}
                  <span className="text-emerald-700">
                    every Pakistani school paperless,
                  </span>{" "}
                  efficient, and connected.
                </>
              ) : (
                <>
                  ہمارا مقصد:{" "}
                  <span className="text-emerald-700">
                    پاکستان کے ہر اسکول کو پیپر لیس،
                  </span>{" "}
                  منظم اور باہم مربوط بنانا۔
                </>
              )}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal"
            >
              {lang === "en"
                ? "Pakistani schools still lose hours every morning to manual attendance registers, handwritten fee vouchers, and paper circulars lost in student backpacks. Attendlix replaces that friction with a unified, offline-ready cloud architecture designed around the local realities of load-shedding, budget Android phones, and WhatsApp."
                : "پاکستانی اسکول ہر روز حاضری کے پرانے رجسٹروں، ہاتھ سے لکھے گئے فیس واؤچرز اور نوٹس بکس پر گھنٹوں ضائع کرتے ہیں۔ اٹینڈلکس لوڈ شیڈنگ، سستے اینڈرائیڈ فونز اور واٹس ایپ کی مقامی ضروریات کو مدنظر رکھتے ہوئے اس سارے نظام کو کلاؤڈ پر منتقل کرتا ہے۔"}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <Link
                href="/register"
                className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{lang === "en" ? "Register Your Campus" : "کیمپس رجسٹر کریں"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/login"
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <span>{lang === "en" ? "Explore Live Portal" : "پورٹل لاگ ان"}</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Floating Interactive Ecosystem Node Diagram */}
          <div className="lg:col-span-6">
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-2xl p-1 bg-gradient-to-b from-slate-200/80 via-indigo-100/50 to-slate-200/80 shadow-xl shadow-slate-900/5"
            >
              <div className="rounded-[18px] bg-white border border-slate-200 p-5 sm:p-7 space-y-5 shadow-xs">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-800">
                      Attendlix Unified Campus Brain
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/70">
                    Real-Time Mesh
                  </span>
                </div>

                {/* Interactive Node Graph Visual */}
                <div className="relative py-3 sm:py-4 flex flex-col items-center justify-center min-h-[240px]">
                  {/* Central Node: School Hub */}
                  <div className="relative z-20 w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-700 p-0.5 shadow-md shadow-emerald-700/20 animate-pulse">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-center p-2 text-white">
                      <GraduationCap className="w-5 h-5 text-emerald-400 mb-0.5" />
                      <span className="text-[10px] font-bold text-white leading-tight">School Hub</span>
                      <span className="text-[8px] font-mono text-emerald-300">Cloud Sync</span>
                    </div>
                  </div>

                  {/* Radiating Role Nodes */}
                  <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-5 z-10">
                    {/* Node 1: Principal */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-0.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-indigo-900">
                        <Building2 className="w-3 h-3 text-indigo-700" />
                        <span className="text-xs font-bold text-slate-900">Principal</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Governance & Fees</span>
                    </div>

                    {/* Node 2: Teacher */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-0.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">Teachers</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">1-Tap Attendance</span>
                    </div>

                    {/* Node 3: Parents & Students */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-0.5 shadow-2xs col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-indigo-900">
                        <MessageSquare className="w-3 h-3 text-indigo-700" />
                        <span className="text-xs font-bold text-slate-900">Parents</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Instant WhatsApp</span>
                    </div>
                  </div>
                </div>

                {/* 3 Animated Stat Counters at Bottom */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <div className="text-lg sm:text-xl font-extrabold text-emerald-700">0</div>
                    <div className="text-[10px] text-slate-600 font-medium">Paper Registers</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <div className="text-lg sm:text-xl font-extrabold text-indigo-900">&lt; 30s</div>
                    <div className="text-[10px] text-slate-600 font-medium">Daily Attendance</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <div className="text-lg sm:text-xl font-extrabold text-emerald-700">100%</div>
                    <div className="text-[10px] text-slate-600 font-medium">Live Cloud Sync</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THREE-STEP WORKFLOW STRIP */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-10 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3.5 shadow-2xs">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-900 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-indigo-200/70">
                1
              </span>
              <div className="space-y-1 text-left">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {lang === "en" ? "Register your school" : "اسکول رجسٹر کریں"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {lang === "en"
                    ? "Enter your campus name, city, and phone number. Your tenant workspace is provisioned instantly."
                    : "اپنے اسکول کا نام، شہر اور موبائل نمبر درج کریں۔ آپ کا کیمپس فوری طور پر کلاؤڈ پر تیار ہو جاتا ہے۔"}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3.5 shadow-2xs">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-emerald-200/70">
                2
              </span>
              <div className="space-y-1 text-left">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {lang === "en" ? "Onboard staff & students" : "اسٹاف اور طلباء شامل کریں"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {lang === "en"
                    ? "Classes and subjects auto-generate. Issue one-click WhatsApp credentials to teachers and parents."
                    : "کلاسز اور مضامین خودکار ترتیب پاتے ہیں۔ اساتذہ اور والدین کو فوری لاگ ان رسائی مل جاتی ہے۔"}
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-3.5 shadow-2xs">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-900 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-indigo-200/70">
                3
              </span>
              <div className="space-y-1 text-left">
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {lang === "en" ? "Run every day paperless" : "مکمل پیپر لیس تعلیمی سال"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {lang === "en"
                    ? "Mark attendance offline, trigger automatic WhatsApp circulars, and reconcile fee dues effortlessly."
                    : "آف لائن حاضری لگائیں، واٹس ایپ پر نوٹس بھیجیں اور فیس وصولی بغیر کسی الجھن کے مانیٹر کریں۔"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ROLE-BY-ROLE TRANSFORMATION BENTO GRID */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-[11px] font-semibold tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === "en" ? "Campus Digital Transformation" : "ڈیجیٹل انقلاب"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {lang === "en"
              ? "Designed for every role in your school."
              : "اسکول کے ہر فرد کے لیے خاص طور پر ڈیزائن کردہ۔"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {lang === "en"
              ? "See how Attendlix transforms daily operations for Principals, Teachers, and Parents."
              : "جانیے اٹینڈلکس کس طرح پرنسپل، اساتذہ اور والدین کی روزمرہ ذمہ داریوں کو آسان بناتا ہے۔"}
          </p>
        </div>

        <div className="space-y-10 sm:space-y-12">
          {/* ========================================================================= */}
          {/* ROW 1: PRINCIPALS & ADMINISTRATORS */}
          {/* ========================================================================= */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-900">
              <Building2 className="w-3.5 h-3.5 text-indigo-700" />
              <span>{lang === "en" ? "For School Principals & Campus Leaders" : "پرنسپل اور ایڈمنسٹریشن کے لیے"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Featured Card */}
              <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 text-left space-y-3.5 relative overflow-hidden group shadow-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold">
                  <XCircle className="w-3 h-3" />
                  <span>
                    {lang === "en"
                      ? "Replaces: Heavy paper staff registers & lost physical notice boards"
                      : "متبادل: پرانے رجسٹر اور کاغذی نوٹس بورڈ کی جگہ"}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {lang === "en"
                    ? "Full visibility, without the paperwork."
                    : "کاغذی کارروائی کے بغیر مکمل کیمپس نگرانی۔"}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
                  {lang === "en"
                    ? "Principals no longer need to walk door-to-door or flip through dusty ledger pages. From morning assembly attendance stats to real-time fee recovery ratios, campus governance is at your fingertips."
                    : "پرنسپل کو اب کلاسز کے چکر لگانے یا موٹے رجسٹر کھولنے کی ضرورت نہیں۔ صبح کی حاضری سے لے کر فیس وصولی تک تمام اعدادوشمار آپ کے موبائل اسکرین پر موجود ہوتے ہیں۔"}
                </p>

                <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 font-medium">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    ✓ Real-time attendance rate
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    ✓ Automated WhatsApp fallback
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    ✓ Dynamic campus profile & timings
                  </div>
                </div>
              </div>

              {/* Side Stacked Cards */}
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 text-left space-y-1.5 shadow-2xs">
                  <div className="text-indigo-900 text-xs font-bold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
                    <span>{lang === "en" ? "Teacher Check-In Tracking" : "اساتذہ کی صبح حاضری"}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {lang === "en"
                      ? "Set official morning cutoffs (e.g. 08:15 AM). Check-ins are automatically flagged as PRESENT or LATE."
                      : "اسکول آمد کا وقت مقرر کریں۔ تاخیر سے آنے والے عملے کا اندراج خودکار طور پر لیٹ ریکارڈ ہوتا ہے۔"}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 text-left space-y-1.5 shadow-2xs">
                  <div className="text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === "en" ? "School-Wide Fee Analytics" : "فیس وصولی ریکارڈ"}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {lang === "en"
                      ? "Track total collected, outstanding monthly dues, and 1-click status updates for cash or mobile transfers."
                      : "ماہانہ وصول شدہ اور واجب الادا فیس کا ریکارڈ دیکھیں اور نقد یا ایزی پیسہ اندراج 1-کلک پر کریں۔"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* ROW 2: TEACHERS & EDUCATORS */}
          {/* ========================================================================= */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === "en" ? "For Classroom Teachers & Faculty" : "کلاس روم اساتذہ کے لیے"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Featured Card */}
              <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 text-left space-y-3.5 relative overflow-hidden group shadow-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold">
                  <XCircle className="w-3 h-3" />
                  <span>
                    {lang === "en"
                      ? "Replaces: Manual roll-call registers & handwriting diaries 40+ times"
                      : "متبادل: 40 بچوں کی ڈائری ہاتھ سے لکھنے اور رول کال رجسٹر کی جگہ"}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {lang === "en" ? "Less admin, more teaching." : "کم کاغذی کام، تدریس پر زیادہ توجہ۔"}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
                  {lang === "en"
                    ? "Teaching staff can mark 40 students present in under 15 seconds. Works completely offline when school Wi-Fi is down or during load-shedding, auto-syncing when internet resumes."
                    : "اساتذہ صرف 15 سیکنڈ میں پوری کلاس کی حاضری لگا سکتے ہیں۔ انٹرنیٹ بند ہونے کی صورت میں بھی مکمل آف لائن کام کرتا ہے اور نیٹ بحال ہوتے ہی سنک ہو جاتا ہے۔"}
                </p>

                <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 font-medium">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    ✓ 1-Tap Offline Attendance
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    ✓ Digital Homework Diary
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    ✓ Instant Exam Marks Entry Batch
                  </div>
                </div>
              </div>

              {/* Side Stacked Cards */}
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 text-left space-y-1.5 shadow-2xs">
                  <div className="text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === "en" ? "My Teaching Schedule" : "ہفتہ وار ٹائم ٹیبل"}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {lang === "en"
                      ? "Teachers see their assigned periods from Monday to Saturday with zero clash or period confusion."
                      : "اساتذہ سوموار سے ہفتہ تک اپنے تمام پیریڈز بغیر کسی تصادم یا غلط فہمی کے دیکھ سکتے ہیں۔"}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 text-left space-y-1.5 shadow-2xs">
                  <div className="text-indigo-900 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                    <span>{lang === "en" ? "Protected Quiet Hours" : "رات کے اوقات میں خاموشی"}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {lang === "en"
                      ? "Parent chats are silenced during evening quiet hours (08:00 PM – 07:00 AM) to safeguard teacher rest."
                      : "اساتذہ کے سکون کے لیے رات 8 بجے سے صبح 7 بجے تک والدین کے پیغامات کا خاموش موڈ فعال رہتا ہے۔"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* ROW 3: STUDENTS & PARENTS */}
          {/* ========================================================================= */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-900">
              <Users className="w-3.5 h-3.5 text-indigo-700" />
              <span>{lang === "en" ? "For Parents & Students" : "والدین اور طلباء کے لیے"}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Featured Card */}
              <div className="md:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 text-left space-y-3.5 relative overflow-hidden group shadow-xs">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold">
                  <XCircle className="w-3 h-3" />
                  <span>
                    {lang === "en"
                      ? "Replaces: Lost paper diary notices, crumpled fee slips, and missed alerts"
                      : "متبادل: گم شدہ ڈائری پرچے، مڑے ہوئے فیس چالان اور مس ہونے والی اطلاعات"}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {lang === "en"
                    ? "Everything a parent needs, in one place."
                    : "والدین کی تمام ضروریات، ایک ہی جگہ پر۔"}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
                  {lang === "en"
                    ? "Parents receive immediate WhatsApp absent alerts without installing any app. When they open their portal, they find their child's daily diary, exam marks, and direct JazzCash & Easypaisa payment info."
                    : "والدین کو کسی ایپ کے بغیر براہ راست واٹس ایپ پر غیر حاضری کا میسج ملتا ہے۔ پورٹل پر روزانہ کی ڈائری، امتحانی نمبر اور ایزی پیسہ فیس ادائیگی دستیاب ہوتی ہے۔"}
                </p>

                <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 font-medium">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    ✓ WhatsApp Absent Alerts
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    ✓ JazzCash / Easypaisa Fee Hub
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    ✓ Exam Report Cards & Marks
                  </div>
                </div>
              </div>

              {/* Side Stacked Cards */}
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 text-left space-y-1.5 shadow-2xs">
                  <div className="text-indigo-900 text-xs font-bold flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-indigo-700" />
                    <span>{lang === "en" ? "Report Cards & Grading" : "رزلٹ کارڈ اور گریڈنگ"}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {lang === "en"
                      ? "Filter marks by Monthly Tests, Mid-Terms, and Final Exams with percentage and letter grades."
                      : "ماہانہ ٹیسٹ، مڈ ٹرم اور فائنل امتحانات کے نتائج فیصد اور گریڈ کے ساتھ واضح دیکھیں۔"}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 text-left space-y-1.5 shadow-2xs">
                  <div className="text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === "en" ? "Zero App Required" : "کسی ایپ کی ضرورت نہیں"}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {lang === "en"
                      ? "Direct integration with standard WhatsApp numbers used by 95%+ of Pakistani households."
                      : "تمام پیغامات اور اطلاعات براہِ راست اسی واٹس ایپ پر موصول ہوتی ہیں جو گھروں میں پہلے سے موجود ہے۔"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ROYAL CTA BANNER */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl overflow-hidden p-6 sm:p-12 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white border border-indigo-900/50 text-center space-y-4 shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {lang === "en" ? (
                <>
                  Join the paperless education{" "}
                  <span className="text-emerald-400">revolution in Pakistan.</span>
                </>
              ) : (
                <>
                  پاکستان میں پیپر لیس تعلیمی{" "}
                  <span className="text-emerald-400">انقلاب کا حصہ بنیں۔</span>
                </>
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-normal">
              {lang === "en"
                ? "Setup takes less than 2 minutes. Empower your teachers, delight parents, and streamline campus governance."
                : "آن بورڈنگ میں صرف 2 منٹ لگتے ہیں۔ اساتذہ کو بااختیار بنائیں، والدین کو باخبر رکھیں اور اسکول کا نظام آسان بنائیں۔"}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{lang === "en" ? "Register Your Campus Free" : "مفت اسکول رجسٹر کریں"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{lang === "en" ? "Sign In to Portal" : "پورٹل لاگ ان"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CLEAN FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-2xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight">
              Attendlix<span className="text-emerald-600">.</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500">
              {lang === "en" ? "Pakistan's School Cloud Architecture" : "پاکستانی اسکولوں کا جدید کلاؤڈ سسٹم"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              {lang === "en" ? "Home" : "ہوم"}
            </Link>
            <Link href="/about" className="text-emerald-600 font-bold transition-colors">
              {lang === "en" ? "About Us" : "ہمارے بارے میں"}
            </Link>
            <Link href="/#contact" className="hover:text-slate-900 transition-colors">
              {lang === "en" ? "Contact Us" : "رابطہ"}
            </Link>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              {lang === "en" ? "Portal" : "لاگ ان"}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <span className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} Attendlix. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
