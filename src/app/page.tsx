"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  MessageSquare,
  WifiOff,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Users,
  Clock,
  Send,
  Building2,
  CalendarCheck,
  Award,
  Zap,
  Check,
  Layers,
  Globe,
  Activity,
  UserCheck,
  AlertCircle,
  FileText,
  Lock,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useLanguage, LanguageToggle } from "@/context/LanguageContext";

export default function LandingPage() {
  const { lang, t, isRtl } = useLanguage();

  // Interactive Demo Student Attendance Simulator in Hero Mockup
  const [demoStudents, setDemoStudents] = useState([
    { id: 1, name: "Hamza Naveed", roll: "01", status: "PRESENT" as "PRESENT" | "ABSENT" | "LEAVE" },
    { id: 2, name: "Ayesha Noor", roll: "02", status: "PRESENT" as "PRESENT" | "ABSENT" | "LEAVE" },
    { id: 3, name: "Bilal Zubair", roll: "03", status: "ABSENT" as "PRESENT" | "ABSENT" | "LEAVE" },
  ]);
  const [demoWhatsAppSent, setDemoWhatsAppSent] = useState<string | null>("Alert triggered for Bilal Zubair");

  // Interactive Role Selector State
  const [selectedRole, setSelectedRole] = useState<"principal" | "teacher" | "parent" | "superadmin">("principal");

  // Expandable FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    schoolName: "",
    city: "",
    phone: "",
    message: "",
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.schoolName || !contactForm.phone) return;
    setContactSubmitted(true);
    const text = encodeURIComponent(
      `Assalam-o-Alaikum Attendlix Team! I would like to inquire about onboarding for ${contactForm.schoolName}${contactForm.city ? ` in ${contactForm.city}` : ""}.\nContact: ${contactForm.phone}\n${contactForm.message ? `Notes: ${contactForm.message}` : ""}`
    );
    window.open(`https://wa.me/923001234567?text=${text}`, "_blank");
  };

  const toggleStudentStatus = (id: number, newStatus: "PRESENT" | "ABSENT" | "LEAVE") => {
    setDemoStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    const st = demoStudents.find((s) => s.id === id);
    if (newStatus === "ABSENT") {
      setDemoWhatsAppSent(`🚨 Auto-triggered WhatsApp absent alert for ${st?.name || "Student"}`);
    } else {
      setDemoWhatsAppSent(`✓ Updated ${st?.name || "Student"} to ${newStatus}`);
    }
    setTimeout(() => setDemoWhatsAppSent(null), 4000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const faqItems = [
    {
      q: lang === "en"
        ? "Does Attendlix work without fast internet or during electricity load-shedding?"
        : "کیا اٹینڈلکس انٹرنیٹ کے بغیر یا لوڈ شیڈنگ کے دوران کام کرتا ہے؟",
      a: lang === "en"
        ? "Yes, absolutely. Attendlix is built with an offline-first architecture. Teachers can record attendance and marks without any internet connection on budget Android devices. All records are securely stored in the local encrypted queue and automatically synchronize with the cloud once connectivity resumes."
        : "جی بالکل۔ اٹینڈلکس مکمل طور پر آف لائن موڈ پر کام کرتا ہے۔ اساتذہ بغیر انٹرنیٹ کے کم قیمت اینڈرائیڈ فونز پر بھی حاضری اور ڈائری ریکارڈ کر سکتے ہیں۔ جیسے ہی انٹرنیٹ بحال ہوتا ہے، تمام ڈیٹا خودکار طور پر کلاؤڈ سے سنک ہو جاتا ہے۔",
    },
    {
      q: lang === "en"
        ? "Do parents need to download or install a mobile application from Play Store?"
        : "کیا والدین کو پلے اسٹور سے کوئی ایپ ڈاؤن لوڈ کرنی ہوگی؟",
      a: lang === "en"
        ? "No app installation is required for parents. Over 95% of parents in Pakistan already use WhatsApp. Attendlix broadcasts absent alerts, daily homework, and fee receipts straight to their WhatsApp numbers. Parents can also open the responsive portal link in any mobile browser."
        : "والدین کو کسی قسم کی موبائل ایپ انسٹال کرنے کی ضرورت نہیں۔ پاکستان میں تقریباً تمام والدین واٹس ایپ استعمال کرتے ہیں۔ اٹینڈلکس غیر حاضری کی اطلاع، ہوم ورک اور فیس کی تفصیلات براہِ راست والدین کے واٹس ایپ پر ارسال کرتا ہے۔",
    },
    {
      q: lang === "en"
        ? "Can we customize fees for siblings, orphan concessions, and staff children?"
        : "کیا ہم بہن بھائیوں یا اسکالرشپ والے بچوں کے لیے فیس میں رعایت کر سکتے ہیں؟",
      a: lang === "en"
        ? "Yes. The Principal and Accountant have flexible 1-click fee adjustment controls (+/- PKR). You can set custom concession amounts with transparent audit notes, ensuring accurate voucher generation and audit records."
        : "جی ہاں۔ پرنسپل اور اکاؤنٹنٹ کو ہر طالب علم کی فیس میں آسانی سے کمی یا اضافہ (+/-) کرنے کا مکمل اختیار حاصل ہے۔ آپ اسکالرشپ یا بہن بھائیوں کی رعایت کا اندراج نوٹ کے ساتھ کر سکتے ہیں۔",
    },
    {
      q: lang === "en"
        ? "Is our school's student and financial data completely private and secure?"
        : "کیا ہمارے اسکول کا ڈیٹا محفوظ اور دوسرے اسکولوں سے الگ ہے؟",
      a: lang === "en"
        ? "Every school campus operates within a strictly isolated multi-tenant architecture with Supabase Row-Level Security (RLS). No other institution or external party can access your student records, fees, or staff data."
        : "ہر اسکول کا ڈیٹا مکمل طور پر الگ اور محفوظ ڈیٹا بیس (Multi-tenant) میں محفوظ کیا جاتا ہے۔ کوئی بھی دوسرا ادارہ آپ کے طلباء یا فیسوں کا ریکارڈ نہیں دیکھ سکتا۔",
    },
    {
      q: lang === "en"
        ? "How quickly can our school campus get started?"
        : "ہمارا اسکول کتنی جلدی شروع کر سکتا ہے؟",
      a: lang === "en"
        ? "Onboarding takes less than 2 minutes. Click 'Register Your School', enter your campus name, city, and phone number, and your full dashboard with pre-configured classes, subjects, and staff accounts is immediately ready to use."
        : "آن بورڈنگ میں صرف 2 منٹ لگتے ہیں۔ 'اسکول رجسٹر کریں' پر کلک کریں، اپنے کیمپس کا نام اور شہر درج کریں، اور آپ کا مکمل پورٹل فوری طور پر تیار ہو جائے گا۔",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans relative overflow-x-hidden pt-16 sm:pt-20">
      {/* Floating Glassmorphic Navbar */}
      <FloatingNavbar />

      {/* Ambient Futuristic Background Mesh & Glow Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/15 rounded-full blur-[140px] opacity-70" />
        <div className="absolute top-96 -left-32 w-[500px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[800px] -right-32 w-[550px] h-[450px] bg-emerald-600/10 rounded-full blur-[130px] opacity-60" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[350px] bg-teal-500/10 rounded-full blur-[150px] opacity-40" />

        {/* Crisp Tech Grid Lines Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-8 pb-16 sm:pt-14 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Animated Glowing Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase shadow-sm shadow-emerald-500/10 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Built for Modern Pakistani Schools • EN & اردو</span>
            <Sparkles className="w-3 h-3 text-emerald-400" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-[1.15] text-white max-w-3xl mx-auto"
          >
            {lang === "en" ? (
              <>
                The Intelligent Operating System for{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Pakistan's Schools.
                </span>
              </>
            ) : (
              <>
                پاکستانی اسکولوں کے لیے{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  جدید ترین اسمارٹ نظام۔
                </span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed font-normal"
          >
            {lang === "en"
              ? "Automate 1-tap offline attendance, instant WhatsApp broadcasts without parent apps, flexible fee adjustments, and clash-free timetables — all in one hyper-fast cloud platform."
              : "آف لائن حاضری، واٹس ایپ پر فوری الرٹس، فیس کا خودکار حساب اور ٹائم ٹیبل کا مکمل انتظام۔ والدین کو کسی موبائل ایپ کی ضرورت نہیں۔"}
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto pt-1"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{lang === "en" ? "Register Your School" : "اپنا اسکول رجسٹر کریں"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === "en" ? "Live Portal Login" : "پورٹل لاگ ان کریں"}</span>
            </Link>
          </motion.div>

          {/* Micro-Features Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-5 pt-3 text-xs text-slate-400"
          >
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>100% Offline-Ready</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Direct WhatsApp Fallback</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Multi-Tenant Private Isolation</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Instant Setup (2 Minutes)</span>
            </span>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE 3D-TILT GLASS DASHBOARD MOCKUP */}
        {/* ========================================================================= */}
        <motion.div
          id="interactive-demo"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 sm:mt-20 max-w-5xl mx-auto"
        >
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-3xl p-1 bg-gradient-to-b from-emerald-500/40 via-slate-800/60 to-slate-900/80 shadow-2xl shadow-emerald-950/50"
          >
            <div className="rounded-[22px] bg-[#0B101E]/95 backdrop-blur-2xl border border-slate-800/90 p-4 sm:p-7 space-y-5 text-left">
              {/* Window Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/90 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <span className="font-bold text-white">Beacon Grammar School</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">Lahore Campus</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Real-Time Cloud Connected</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Grade 8-A
                  </span>
                </div>
              </div>

              {/* Mockup Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Today's Attendance</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-white">96.4%</div>
                  <span className="text-[10px] text-emerald-400 font-medium">142 of 148 Students Present</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">WhatsApp Engine</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">100% Active</div>
                  <span className="text-[10px] text-slate-400 font-medium">Zero Parent App Installs Required</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Fee Reconciliation</span>
                  <div className="text-xl sm:text-2xl font-extrabold text-teal-300">JazzCash / Bank</div>
                  <span className="text-[10px] text-teal-400 font-medium">1-Click Verification & Receipts</span>
                </div>
              </div>

              {/* Interactive Attendance Simulator */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Interactive Teacher Attendance Simulator (Click P / A / L to test):</span>
                  </div>

                  {demoWhatsAppSent && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{demoWhatsAppSent}</span>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  {demoStudents.map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                          {st.roll}
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm">{st.name}</div>
                          <div className="text-[10px] text-slate-400">Class 8-A • Roll #{st.roll}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(st.id, "PRESENT")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                            st.status === "PRESENT"
                              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                              : "bg-slate-800/80 text-slate-400 hover:text-white"
                          }`}
                        >
                          P (حاضر)
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(st.id, "ABSENT")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                            st.status === "ABSENT"
                              ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                              : "bg-slate-800/80 text-slate-400 hover:text-white"
                          }`}
                        >
                          A (غیر حاضر)
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleStudentStatus(st.id, "LEAVE")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                            st.status === "LEAVE"
                              ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                              : "bg-slate-800/80 text-slate-400 hover:text-white"
                          }`}
                        >
                          L (رخصت)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Notice in Mockup */}
              <div className="pt-2 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Automatic WhatsApp Fallback Ready</span>
                </span>
                <span className="text-emerald-400 font-semibold">
                  Sample Alert Prefix: 🚨 *URGENT NOTICE:*
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* BENTO-GRID FEATURE SHOWCASE */}
      {/* ========================================================================= */}
      <section id="features" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Built for Real-World School Operation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Everything your campus needs, in one futuristic stack.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Tailored specifically for Pakistan's private and semi-private school ecosystem with zero technical friction.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Bento Card 1: 1-Tap Offline Attendance (Span 2 cols on desktop) */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />

            <div className="space-y-3.5 relative z-10 max-w-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <WifiOff className="w-5 h-5" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                1-Tap Offline Attendance on 2GB RAM Phones
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                Load-shedding, unstable Wi-Fi, and slow cellular data won't stop your school. Teachers can record
                attendance on any low-end smartphone with zero lag. Records queue locally and auto-sync to the cloud once
                reconnected.
              </p>

              <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-medium">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-emerald-300 border border-slate-700/80">
                  ⚡ Works completely offline
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80">
                  📱 Optimized for low-end Android
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80">
                  🔄 Auto background queue sync
                </span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: Instant WhatsApp Engine */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl"
          >
            <div className="space-y-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-400">
                <MessageSquare className="w-5 h-5" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Instant WhatsApp Engine
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                Parents don't need to install any app. Automated absent notices, fee reminders, and urgent holiday alerts
                dispatch straight to their existing WhatsApp numbers in one click.
              </p>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-green-400">
                🚨 *URGENT NOTICE:* Tomorrow is official holiday due to rain...
              </div>
            </div>
          </motion.div>

          {/* Bento Card 3: Smart Fee & Custom Sibling Concessions */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl"
          >
            <div className="space-y-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <CreditCard className="w-5 h-5" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Smart Fees & Custom Concessions
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                Flexible (+/-) per-student adjustments for siblings, scholarships, and staff children. Collect fees via
                JazzCash, Easypaisa, or Bank transfers with instant Transaction ID verification.
              </p>

              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80">JazzCash</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80">Easypaisa</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80">Meezan / HBL</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 4: Clash-Free Weekly Timetables & Staff Check-In */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl"
          >
            <div className="space-y-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Clock className="w-5 h-5" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Clash-Free Timetable Builder
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                Intelligent schedule generator prevents assigning the same teacher to two classes at the same time slot.
                Includes daily staff check-in / check-out with automatic late-arrival cutoff tracking.
              </p>

              <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero teacher double-booking</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 5: Bilingual Urdu & English (RTL Ready) */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all shadow-xl"
          >
            <div className="space-y-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <Globe className="w-5 h-5" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Bilingual English & اردو (RTL)
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                One-click toggle between English and Urdu across every screen. Clean Urdu typography and proper Right-To-Left
                orientation without breaking layouts or text overlap.
              </p>

              <div className="text-xs font-semibold text-purple-300">
                حاضر • غیر حاضر • رخصت • فیس واؤچر
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4 UNIFIED ROLE PORTALS SHOWCASE */}
      {/* ========================================================================= */}
      <section id="portals" className="relative z-10 py-16 sm:py-24 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Four Specialized Portals. One Integrated Brain.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each stakeholder gets a purpose-built workspace tailored to their daily responsibilities.
            </p>
          </div>

          {/* Portal Selector Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-3 mb-6 sm:mb-8">
            {[
              { id: "principal", label: "Principal & Admin", icon: Building2 },
              { id: "teacher", label: "Teacher Workspace", icon: UserCheck },
              { id: "parent", label: "Parent & Student", icon: Users },
              { id: "superadmin", label: "Multi-Campus Admin", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRole(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 min-h-[38px] ${
                    active
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold"
                      : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Role Content Card */}
          <div className="max-w-4xl mx-auto rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-8 backdrop-blur-xl shadow-xl">
            {selectedRole === "principal" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Principal & Campus Governance</h3>
                    <p className="text-[11px] text-slate-400">Command center for campus administration</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Real-time visibility over all classes, teacher attendance, student admissions, fee reconciliation, and
                  automated WhatsApp circular broadcasts with urgency priority routing.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px] font-medium">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Fee Recovery Overviews
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Staff Check-In Tracking
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Weekly Timetable Builder
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Official Announcements
                  </div>
                </div>
              </div>
            )}

            {selectedRole === "teacher" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Teacher Daily Classroom Companion</h3>
                    <p className="text-[11px] text-slate-400">Fast, streamlined tools for classroom educators</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Mark full classroom attendance in under 10 seconds, assign daily homework diaries, log monthly exam marks,
                  and access personal teaching timetables with zero technical friction.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px] font-medium">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ 1-Tap Offline Attendance
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Homework Diary Updates
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Exam Marks Entry Batch
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Parent Chat with Quiet Hours
                  </div>
                </div>
              </div>
            )}

            {selectedRole === "parent" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Parent & Student Transparency Portal</h3>
                    <p className="text-[11px] text-slate-400">Direct academic visibility for families</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Parents stay informed via instant WhatsApp notifications or can log into the portal to review daily homework,
                  view term exam report cards, verify monthly fee records, and inspect weekly class schedules.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px] font-medium">
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Instant WhatsApp Alerts
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Monthly Fee Payment Portal
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Exam Grade Analytics
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300">
                    ✓ Direct Teacher Messaging
                  </div>
                </div>
              </div>
            )}

            {selectedRole === "superadmin" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Multi-Campus & Tenant Control</h3>
                    <p className="text-[11px] text-slate-400">Enterprise control across school branches</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Manage multiple campuses or entire school networks from a single pane of glass. Onboard new campuses,
                  monitor branch performance, manage subscriptions, and oversee platform health.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-semibold">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                    ✓ Multi-Branch Governance
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                    ✓ Campus Subscription Control
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                    ✓ Payment Account Scoping
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                    ✓ Database Tenant Security
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE FAQ SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="relative z-10 py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase">
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {lang === "en" ? "Got Questions? We Have Answers." : "عام پوچھے جانے والے سوالات"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            {lang === "en"
              ? "Everything Pakistani school leaders need to know before getting started."
              : "پاکستانی اسکول مالکان اور پرنسپلز کے عام سوالات کے جوابات۔"}
          </p>
        </div>

        <div className="space-y-2.5">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl bg-slate-900/40 border border-slate-800/80 overflow-hidden backdrop-blur-xl transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-white hover:text-emerald-400 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 mt-1 font-normal">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CONTACT US SECTION */}
      {/* ========================================================================= */}
      <section id="contact" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {lang === "en" ? "CONTACT ATTENDLIX TEAM" : "اٹینڈلکس ٹیم سے رابطہ کریں"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {lang === "en" ? (
              <>
                Let's discuss how Attendlix transforms{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  your school campus.
                </span>
              </>
            ) : (
              <>
                اپنے اسکول کو ڈیجیٹل بنانے کے لیے{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  ہم سے فوری رابطہ کریں۔
                </span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            {lang === "en"
              ? "Get answers within 15 minutes. We provide free assisted onboarding, teacher training, and dedicated WhatsApp support for Pakistani schools."
              : "سکول کے اوقات میں 15 منٹ کے اندر جواب حاصل کریں۔ ہم مفت آن بورڈنگ اور اساتذہ کی تربیت فراہم کرتے ہیں۔"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Fast Hotline & School Support Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-xl space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{lang === "en" ? "Live Helpline & WhatsApp" : "لائیو واٹس ایپ ہیلپ لائن"}</span>
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1 tracking-tight">
                  {lang === "en" ? "Direct Campus Representative" : "براہ راست کیمپس نمائندہ"}
                </h3>
              </div>

              {/* Direct WhatsApp Callout */}
              <a
                href="https://wa.me/923001234567?text=Assalam-o-Alaikum%20Attendlix%20Team!%20I%20would%20like%20to%20know%20more%20about%20onboarding%20our%20school."
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-between gap-3 group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      WhatsApp Support Line
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                      +92 300 1234567
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Response Time & Operating Hours */}
              <div className="space-y-2.5 text-xs text-slate-300 pt-0.5">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      {lang === "en" ? "Operating Hours: " : "اوقاتِ کار: "}
                    </span>
                    <span className="text-slate-400">Mon – Sat, 8:00 AM – 6:00 PM PKT</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Email: </span>
                    <span className="font-mono text-slate-400">support@attendlix.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      {lang === "en" ? "Nationwide Support: " : "ملک بھر میں سپورٹ: "}
                    </span>
                    <span className="text-slate-400">Lahore, Karachi, Islamabad, Rawalpindi & nationwide</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-3.5 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Free Campus Data Migration (Excel to Cloud)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Staff Training via WhatsApp Video Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Zero Disruption to Daily School Classes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-5 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl shadow-xl relative">
              <form onSubmit={handleContactSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* School / Campus Name */}
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Building2 className="w-3 h-3 text-emerald-400" />
                      <span>{lang === "en" ? "School / Campus Name *" : "اسکول یا کیمپس کا نام *"}</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === "en" ? "e.g. Beacon Grammar School" : "مثال: بیکن گرامر اسکول"}
                      value={contactForm.schoolName}
                      onChange={(e) => setContactForm({ ...contactForm, schoolName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{lang === "en" ? "City / District" : "شہر / ضلع"}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={lang === "en" ? "e.g. Lahore, Rawalpindi" : "مثال: لاہور، راولپنڈی"}
                      value={contactForm.city}
                      onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 transition-all"
                    />
                  </div>
                </div>

                {/* WhatsApp Mobile Number */}
                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{lang === "en" ? "Principal / Admin WhatsApp Number *" : "پرنسپل / ایڈمن کا واٹس ایپ نمبر *"}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0300-1234567"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 transition-all font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    {lang === "en"
                      ? "We will connect directly via WhatsApp to answer questions or arrange a demo."
                      : "ہم فوری رابطہ کے لیے واٹس ایپ کا استعمال کرتے ہیں۔"}
                  </p>
                </div>

                {/* Message / Requirements */}
                <div className="space-y-1 text-left">
                  <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-emerald-400" />
                    <span>{lang === "en" ? "Message / Questions (Optional)" : "پیغام یا ضروریات (اختیاری)"}</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder={
                      lang === "en"
                        ? "Student strength, current pain points, or when you'd like to onboard..."
                        : "اپنے اسکول کے طلباء کی تعداد یا خاص ضروریات کے بارے میں بتائیں..."
                    }
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {lang === "en"
                      ? "Send Message & Chat on WhatsApp"
                      : "پیغام بھیجیں اور واٹس ایپ پر بات کریں"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Instant Feedback Alert */}
                <AnimatePresence>
                  {contactSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 mt-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>
                        {lang === "en"
                          ? "Thank you! We have opened WhatsApp with your details. Our campus representative will assist you right away."
                          : "شکریہ! آپ کی تفصیلات موصول ہو گئیں۔ ہماری ٹیم فوری طور پر واٹس ایپ پر رابطہ کرے گی۔"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MINIMALIST FUTURISTIC CTA BANNER */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl overflow-hidden p-6 sm:p-12 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/25 text-center space-y-4 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {lang === "en" ? (
                <>
                  Ready to modernize your{" "}
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    school campus?
                  </span>
                </>
              ) : (
                <>
                  اپنے اسکول کو آج ہی{" "}
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                    ڈیجیٹل بنائیں
                  </span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-normal">
              Join progressive schools across Pakistan replacing paper registers, confusing Excel sheets, and missed fee
              recoveries with Attendlix.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{lang === "en" ? "Register Your School" : "اسکول رجسٹر کریں"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2"
              >
                <span>{lang === "en" ? "Live Portal Login" : "پورٹل لاگ ان"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CLEAN MINIMALIST FOOTER */}
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

          <div className="flex flex-wrap items-center gap-5 text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              {lang === "en" ? "Home" : "ہوم"}
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              {lang === "en" ? "About Us" : "ہمارے بارے میں"}
            </Link>
            <button onClick={() => scrollToSection("features")} className="hover:text-white transition-colors">
              {lang === "en" ? "Features" : "خصوصیات"}
            </button>
            <button onClick={() => scrollToSection("faq")} className="hover:text-white transition-colors">
              {lang === "en" ? "FAQ" : "عام سوالات"}
            </button>
            <button onClick={() => scrollToSection("contact")} className="hover:text-white transition-colors">
              {lang === "en" ? "Contact" : "رابطہ"}
            </button>
            <Link href="/login" className="hover:text-white transition-colors">
              {lang === "en" ? "Portal" : "لاگ ان"}
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
