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
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans relative overflow-x-hidden pt-20 sm:pt-24">
      {/* Shared Floating Glass Navbar */}
      <FloatingNavbar />

      {/* Ambient Futuristic Background Mesh & Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-emerald-500/15 rounded-full blur-[150px] opacity-70" />
        <div className="absolute top-96 -left-40 w-[550px] h-[400px] bg-teal-500/10 rounded-full blur-[130px] opacity-50" />
        <div className="absolute top-[800px] -right-32 w-[600px] h-[450px] bg-cyan-600/10 rounded-full blur-[140px] opacity-60" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>ABOUT ATTENDLIX</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-[1.15] text-white"
            >
              Our mission:{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                every Pakistani school paperless,
              </span>{" "}
              efficient, and connected.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal"
            >
              Pakistani schools still lose hours every morning to manual attendance registers, handwritten fee vouchers,
              and paper circulars lost in student backpacks. Attendlix replaces that friction with a unified, offline-ready
              cloud architecture designed around the local realities of load-shedding, budget Android phones, and WhatsApp.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
            >
              <Link
                href="/register"
                className="px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Register Your Campus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/login"
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Live Portal</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Floating Interactive Ecosystem Node Diagram */}
          <div className="lg:col-span-6">
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative rounded-2xl p-1 bg-gradient-to-b from-emerald-500/25 via-slate-800/60 to-slate-900 shadow-2xl shadow-emerald-950/40"
            >
              <div className="rounded-[18px] bg-[#0A101E]/95 backdrop-blur-2xl border border-slate-800/90 p-5 sm:p-7 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800/90 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Attendlix Unified Campus Brain
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Real-Time Mesh
                  </span>
                </div>

                {/* Interactive Node Graph Visual */}
                <div className="relative py-3 sm:py-4 flex flex-col items-center justify-center min-h-[240px]">
                  {/* Central Node: School Hub */}
                  <div className="relative z-20 w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/30 animate-pulse">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-center p-2">
                      <GraduationCap className="w-5 h-5 text-emerald-400 mb-0.5" />
                      <span className="text-[10px] font-bold text-white leading-tight">School Hub</span>
                      <span className="text-[8px] font-mono text-emerald-300">Cloud Sync</span>
                    </div>
                  </div>

                  {/* Radiating Role Nodes */}
                  <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-5 z-10">
                    {/* Node 1: Principal */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-left space-y-0.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <Building2 className="w-3 h-3" />
                        <span className="text-xs font-bold text-white">Principal</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Governance & Fees</span>
                    </div>

                    {/* Node 2: Teacher */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-blue-500/30 text-left space-y-0.5 shadow-sm">
                      <div className="flex items-center gap-1.5 text-blue-400">
                        <UserCheck className="w-3 h-3" />
                        <span className="text-xs font-bold text-white">Teachers</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">1-Tap Attendance</span>
                    </div>

                    {/* Node 3: Parents & Students */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-left space-y-0.5 shadow-sm col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-purple-400">
                        <MessageSquare className="w-3 h-3" />
                        <span className="text-xs font-bold text-white">Parents</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Instant WhatsApp</span>
                    </div>
                  </div>
                </div>

                {/* 3 Animated Stat Counters at Bottom */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/90 text-center">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-lg sm:text-xl font-extrabold text-emerald-400">0</div>
                    <div className="text-[10px] text-slate-400 font-medium">Paper Registers</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-lg sm:text-xl font-extrabold text-teal-300">&lt; 30s</div>
                    <div className="text-[10px] text-slate-400 font-medium">Daily Attendance</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="text-lg sm:text-xl font-extrabold text-cyan-400">100%</div>
                    <div className="text-[10px] text-slate-400 font-medium">Live Cloud Sync</div>
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
      <section className="relative z-10 py-10 bg-slate-950/70 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-emerald-500/25">
                1
              </span>
              <div className="space-y-1 text-left">
                <h3 className="font-bold text-white text-xs sm:text-sm">Register your school</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Enter your campus name, city, and phone number. Your tenant workspace is provisioned instantly.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-teal-500/25">
                2
              </span>
              <div className="space-y-1 text-left">
                <h3 className="font-bold text-white text-xs sm:text-sm">Onboard staff & students</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Classes and subjects auto-generate. Issue one-click WhatsApp credentials to teachers and parents.
                </p>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-start gap-3.5">
              <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-cyan-500/25">
                3
              </span>
              <div className="space-y-1 text-left">
                <h3 className="font-bold text-white text-xs sm:text-sm">Run every day paperless</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Mark attendance offline, trigger automatic WhatsApp circulars, and reconcile fee dues effortlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ROLE-BY-ROLE TRANSFORMATION BENTO GRID (HEAVY SCROLL ANIMATIONS) */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>Campus Digital Transformation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Designed for every role in your school.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            See how Attendlix transforms daily operations for Principals, Teachers, and Parents.
          </p>
        </div>

        <div className="space-y-10 sm:space-y-12">
          {/* ========================================================================= */}
          {/* ROW 1: PRINCIPALS & ADMINISTRATORS */}
          {/* ========================================================================= */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 35 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              <Building2 className="w-3.5 h-3.5" />
              <span>For School Principals & Campus Leaders</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Featured Card */}
              <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900/90 border border-emerald-500/25 p-6 sm:p-8 text-left space-y-3.5 relative overflow-hidden group shadow-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-semibold">
                  <XCircle className="w-3 h-3" />
                  <span>Replaces: Heavy paper staff registers & lost physical notice boards</span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Full visibility, without the paperwork.
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
                  Principals no longer need to walk door-to-door or flip through dusty ledger pages. From the morning
                  assembly attendance stats to real-time fee recovery ratios, campus governance is at your fingertips.
                </p>

                <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 font-medium">
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                    ✓ Real-time attendance rate
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                    ✓ Automated WhatsApp fallback
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                    ✓ Dynamic campus profile & timings
                  </div>
                </div>
              </div>

              {/* Side Stacked Cards */}
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 sm:p-5 text-left space-y-1.5">
                  <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Teacher Check-In Tracking</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Set official morning cutoffs (e.g. 08:15 AM). Check-ins are automatically flagged as PRESENT or LATE.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 sm:p-5 text-left space-y-1.5">
                  <div className="text-teal-400 text-xs font-bold flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>School-Wide Fee Analytics</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Track total collected, outstanding monthly dues, and 1-click status updates for cash or mobile transfers.
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
            initial={{ opacity: 0, y: 35 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-teal-400">
              <UserCheck className="w-3.5 h-3.5" />
              <span>For Classroom Teachers & Faculty</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Featured Card */}
              <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-teal-950/70 via-slate-900 to-slate-900/90 border border-teal-500/25 p-6 sm:p-8 text-left space-y-3.5 relative overflow-hidden group shadow-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-semibold">
                  <XCircle className="w-3 h-3" />
                  <span>Replaces: Manual roll-call registers & handwriting diaries 40+ times</span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Less admin, more teaching.
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
                  Teaching staff can mark 40 students present in under 15 seconds. Works completely offline when school
                  Wi-Fi is down or during load-shedding, auto-syncing when internet resumes.
                </p>

                <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 font-medium">
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                    ✓ 1-Tap Offline Attendance
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                    ✓ Digital Homework Diary
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                    ✓ Instant Exam Marks Entry Batch
                  </div>
                </div>
              </div>

              {/* Side Stacked Cards */}
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 sm:p-5 text-left space-y-1.5">
                  <div className="text-teal-400 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>My Teaching Schedule</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Teachers see their assigned periods from Monday to Saturday with zero clash or period confusion.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 sm:p-5 text-left space-y-1.5">
                  <div className="text-purple-400 text-xs font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Protected Quiet Hours</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Parent chats are silenced during evening quiet hours (08:00 PM – 07:00 AM) to safeguard teacher rest.
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
            initial={{ opacity: 0, y: 35 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              <Users className="w-3.5 h-3.5" />
              <span>For Parents & Students</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {/* Featured Card */}
              <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-900/90 border border-cyan-500/25 p-6 sm:p-8 text-left space-y-3.5 relative overflow-hidden group shadow-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-semibold">
                  <XCircle className="w-3 h-3" />
                  <span>Replaces: Lost paper diary notices, crumpled fee slips, and missed alerts</span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Everything a parent needs, in one place.
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
                  Parents receive immediate WhatsApp absent alerts without installing any app. When they open their portal,
                  they find their child's daily diary, exam marks, and direct JazzCash & Easypaisa payment info.
                </p>

                <div className="pt-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-300 font-medium">
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                    ✓ WhatsApp Absent Alerts
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                    ✓ JazzCash / Easypaisa Fee Hub
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                    ✓ Exam Report Cards & Marks
                  </div>
                </div>
              </div>

              {/* Side Stacked Cards */}
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 sm:p-5 text-left space-y-1.5">
                  <div className="text-cyan-400 text-xs font-bold flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Report Cards & Grading</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Filter marks by Monthly Tests, Mid-Terms, and Final Exams with percentage and letter grades.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 sm:p-5 text-left space-y-1.5">
                  <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Zero App Required</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    Direct integration with standard WhatsApp numbers used by 95%+ of Pakistani households.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. MINIMALIST FUTURISTIC CTA BANNER */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl overflow-hidden p-6 sm:p-12 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/25 text-center space-y-4 shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Join the paperless education revolution in Pakistan.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-normal">
              Setup takes less than 2 minutes. Empower your teachers, delight parents, and streamline campus governance.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Register Your Campus Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <span>Sign In to Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CLEAN FOOTER */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#030712] py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-600/20">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-white text-base tracking-tight">
              Attendlix<span className="text-emerald-400">.</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-[11px] text-slate-400">
              Pakistan's School Cloud Architecture
            </span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-semibold">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-emerald-400 transition-colors">
              About Us
            </Link>
            <Link href="/#contact" className="hover:text-white transition-colors">
              Contact Us
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Portal
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <span className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} Attendlix. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
