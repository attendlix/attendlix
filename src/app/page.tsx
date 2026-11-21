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

  // Role tab state for Hero Preview Card
  const [heroRole, setHeroRole] = useState<"principal" | "teacher" | "parent">("principal");

  // Interactive Demo Student Attendance Simulator in Hero Mockup / Teacher Card
  const [demoStudents, setDemoStudents] = useState([
    { id: 1, name: "Hamza Naveed", roll: "01", status: "PRESENT" as "PRESENT" | "ABSENT" | "LEAVE" },
    { id: 2, name: "Ayesha Noor", roll: "02", status: "PRESENT" as "PRESENT" | "ABSENT" | "LEAVE" },
    { id: 3, name: "Bilal Zubair", roll: "03", status: "ABSENT" as "PRESENT" | "ABSENT" | "LEAVE" },
  ]);
  const [demoWhatsAppSent, setDemoWhatsAppSent] = useState<string | null>("Alert triggered for Bilal Zubair");

  // Interactive Role Selector State for Portals Section
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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.schoolName || !contactForm.phone) return;
    setContactSubmitted(true);
    const text = encodeURIComponent(
      `Assalam-o-Alaikum Attendlix Team! I would like to inquire about onboarding for ${contactForm.schoolName}${contactForm.city ? ` in ${contactForm.city}` : ""}.\nContact: ${contactForm.phone}\n${contactForm.message ? `Notes: ${contactForm.message}` : ""}`
    );
    window.open(`https://wa.me/923001234567?text=${text}`, "_blank");
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans relative overflow-x-hidden pt-16 sm:pt-20">
      {/* Reusable Floating Navbar */}
      <FloatingNavbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH BACKGROUND IMAGE & 2-COLUMN LIVE PREVIEW */}
      {/* ========================================================================= */}
      <section className="relative -mt-16 sm:-mt-20 pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden border-b border-slate-200/80">
        {/* School Photo Background + Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-school.jpg"
            alt="Modern School Classroom"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Smooth Dark Emerald / Royal-Slate Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-emerald-950/80 to-indigo-950/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-slate-950/70" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (Refined, Non-Chunky Typography) */}
            <div className="lg:col-span-7 space-y-5 text-left">
              {/* Clean uppercase badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase shadow-xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  {lang === "en"
                    ? "PAPERLESS • OFFLINE-READY • BILINGUAL (EN / اردو)"
                    : "پیپر لیس • آف لائن سسٹم • اردو اور انگلش"}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              </motion.div>

              {/* Elegant, balanced headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-[1.15] text-white"
              >
                {lang === "en" ? (
                  <>
                    Run your entire school smoothly,{" "}
                    <span className="text-emerald-400">
                      even on low-end phones.
                    </span>
                  </>
                ) : (
                  <>
                    اپنا پورا اسکول آسانی سے چلائیں،{" "}
                    <span className="text-emerald-400">
                      کم قیمت فونز پر بھی۔
                    </span>
                  </>
                )}
              </motion.h1>

              {/* Concise subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-xl font-normal"
              >
                {lang === "en"
                  ? "Attendlix seamlessly connects Principals, Teachers, and Parents in one unified cloud system. 1-tap offline attendance, instant automated WhatsApp alerts, and flexible fee recovery with zero paper registers."
                  : "اٹینڈلکس پرنسپل، اساتذہ اور والدین کو ایک مرکزی پلیٹ فارم سے جوڑتا ہے۔ 1-کلک آف لائن حاضری، واٹس ایپ اطلاعات، اور ایزی پیسہ فیس مانیٹرنگ—بغیر کسی کاغذی رجسٹر کے۔"}
              </motion.p>

              {/* Two Clean Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1"
              >
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>{lang === "en" ? "Register School" : "اسکول رجسٹر کریں"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/contact"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{lang === "en" ? "Contact Us" : "ہم سے رابطہ کریں"}</span>
                </Link>
              </motion.div>

              {/* Compact Feature Checklist Below */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs text-slate-200/90 font-medium"
              >
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    {lang === "en" ? "Teacher check-in & check-out" : "اساتذہ کی صبح آمد و رخصت"}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    {lang === "en" ? "1-tap attendance & WhatsApp" : "1-ٹیپ حاضری اور واٹس ایپ الرٹس"}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    {lang === "en" ? "Flexible fee & JazzCash tracking" : "جاز کیش / ایزی پیسہ فیس ٹریکنگ"}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Floating Interactive Role Preview Card */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative rounded-2xl p-0.5 bg-gradient-to-b from-white/30 via-white/15 to-white/5 shadow-2xl shadow-black/50"
              >
                <div className="rounded-[15px] bg-white/95 backdrop-blur-2xl border border-white/40 p-5 sm:p-6 text-slate-900 space-y-4 shadow-xs">
                  {/* Card Top Status Bar */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-mono font-bold text-slate-900">
                        Beacon Grammar • Lahore
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Live Cloud Synced
                    </span>
                  </div>

                  {/* Role Switcher Pills */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80">
                    {(["principal", "teacher", "parent"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setHeroRole(role)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all relative ${
                          heroRole === role
                            ? "text-white shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {heroRole === role && (
                          <motion.div
                            layoutId="heroRolePillHighlight"
                            className="absolute inset-0 rounded-lg bg-indigo-900"
                            transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center justify-center gap-1.5">
                          {role === "principal" && <Building2 className="w-3.5 h-3.5" />}
                          {role === "teacher" && <UserCheck className="w-3.5 h-3.5" />}
                          {role === "parent" && <Users className="w-3.5 h-3.5" />}
                          <span>
                            {role === "principal"
                              ? (lang === "en" ? "Principal" : "پرنسپل")
                              : role === "teacher"
                              ? (lang === "en" ? "Teacher" : "استاد")
                              : (lang === "en" ? "Parent" : "والدین")}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Live Preview Rows Animated with AnimatePresence */}
                  <AnimatePresence mode="wait">
                    {heroRole === "principal" && (
                      <motion.div
                        key="principal"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        {/* Row 1: Staff Check-In */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Today's Staff Check-In
                            </span>
                            <div className="text-xs font-bold text-slate-900">
                              18 of 20 Teachers Checked In
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Cutoff 08:15 AM
                          </span>
                        </div>

                        {/* Row 2: Attendance % */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Overall Attendance
                            </span>
                            <span className="text-xs font-extrabold text-emerald-700">95.4%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full w-[95.4%]" />
                          </div>
                          <div className="text-[10px] text-slate-500 flex justify-between font-medium">
                            <span>648 Present</span>
                            <span className="text-rose-600 font-semibold">32 Absent</span>
                          </div>
                        </div>

                        {/* Row 3: Fee & WhatsApp Status */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-0.5">
                            <span className="text-[10px] text-slate-500 font-bold block">Fee Collected</span>
                            <div className="text-xs font-bold text-indigo-900">PKR 142,500</div>
                            <span className="text-[9px] text-emerald-700 block">JazzCash / Cash</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-0.5">
                            <span className="text-[10px] text-slate-500 font-bold block">Broadcast</span>
                            <div className="text-xs font-bold text-emerald-700">720 Delivered</div>
                            <span className="text-[9px] text-slate-500 block">WhatsApp Sync</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {heroRole === "teacher" && (
                      <motion.div
                        key="teacher"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        {/* Interactive Attendance Simulator in Preview Card */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Class 8-B Attendance (Tap P / A / L):
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700">Offline-Ready</span>
                          </div>

                          <div className="space-y-1.5">
                            {demoStudents.map((st) => (
                              <div
                                key={st.id}
                                className="p-1.5 px-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-slate-100 text-[10px] font-mono font-bold flex items-center justify-center text-slate-600">
                                    {st.roll}
                                  </span>
                                  <span className="font-semibold text-slate-900 text-xs">{st.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => toggleStudentStatus(st.id, "PRESENT")}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                      st.status === "PRESENT"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                  >
                                    P
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleStudentStatus(st.id, "ABSENT")}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                      st.status === "ABSENT"
                                        ? "bg-rose-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                  >
                                    A
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleStudentStatus(st.id, "LEAVE")}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                                      st.status === "LEAVE"
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                  >
                                    L
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {demoWhatsAppSent && (
                            <div className="text-[10px] font-medium text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200/80 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{demoWhatsAppSent}</span>
                            </div>
                          )}
                        </div>

                        {/* Row 2: Teaching Schedule */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              My Teaching Schedule
                            </span>
                            <div className="text-xs font-bold text-slate-900">
                              Period 3: Mathematics • Class 8-B
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200">
                            09:45 AM
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {heroRole === "parent" && (
                      <motion.div
                        key="parent"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        {/* Row 1: Student Status */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Student Profile
                            </span>
                            <div className="text-xs font-bold text-slate-900">
                              Hamza Naveed • Class 8-B
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Present 07:55 AM</span>
                          </span>
                        </div>

                        {/* Row 2: Fee Slip & Online Payment */}
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Monthly Fee Status
                            </span>
                            <span className="text-xs font-bold text-emerald-700">Paid • Receipt #9041</span>
                          </div>
                          <div className="text-xs font-bold text-slate-900">
                            PKR 4,500 (Verified via JazzCash)
                          </div>
                        </div>

                        {/* Row 3: Report Card & Diary */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-0.5">
                            <span className="text-[10px] text-slate-500 font-bold block">Exam Marks</span>
                            <div className="text-xs font-bold text-indigo-900">92.4% (Grade A+)</div>
                            <span className="text-[9px] text-emerald-700 block">Mid-Term Exams</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-0.5">
                            <span className="text-[10px] text-slate-500 font-bold block">Daily Diary</span>
                            <div className="text-xs font-bold text-slate-800">Math Ex 4.2</div>
                            <span className="text-[9px] text-slate-500 block">Due Tomorrow</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Card Bottom Indicator */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Direct WhatsApp Fallback</span>
                    </span>
                    <span className="text-indigo-900 font-semibold">Zero App Installs</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BENTO-GRID FEATURE SHOWCASE */}
      {/* ========================================================================= */}
      <section id="features" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Built for Real-World School Operation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Everything your campus needs, in one unified stack.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Tailored specifically for Pakistan's private and semi-private school ecosystem with zero technical friction.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Bento Card 1: 1-Tap Offline Attendance */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all relative overflow-hidden group"
          >
            <div className="space-y-3.5 relative z-10 max-w-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700">
                <WifiOff className="w-5 h-5" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                1-Tap Offline Attendance on 2GB RAM Phones
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Load-shedding, unstable Wi-Fi, and slow cellular data won't stop your school. Teachers can record
                attendance on any budget Android smartphone with zero lag. Records queue locally and auto-sync to the cloud once
                reconnected.
              </p>

              <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-medium">
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200">
                  ⚡ Works completely offline
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200">
                  📱 Optimized for low-end Android
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200">
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
            className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all relative overflow-hidden group"
          >
            <div className="space-y-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700">
                <MessageSquare className="w-5 h-5" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Instant WhatsApp Engine
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Parents don't need to install any app. Automated absent notices, fee reminders, and urgent holiday alerts
                dispatch straight to their existing WhatsApp numbers in one click.
              </p>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-emerald-800">
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
            className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all relative overflow-hidden group"
          >
            <div className="space-y-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700">
                <CreditCard className="w-5 h-5" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Smart Fees & Custom Concessions
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Flexible (+/-) per-student adjustments for siblings, scholarships, and staff children. Collect fees via
                JazzCash, Easypaisa, or Bank transfers with instant Transaction ID verification.
              </p>

              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700">
                <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">JazzCash</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">Easypaisa</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200">Meezan / HBL</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 4: Clash-Free Weekly Timetables & Staff Check-In */}
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 30 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all relative overflow-hidden group"
          >
            <div className="space-y-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/70 flex items-center justify-center text-indigo-700">
                <Clock className="w-5 h-5" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Clash-Free Timetable Builder
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Intelligent schedule generator prevents assigning the same teacher to two classes at the same time slot.
                Includes daily staff check-in / check-out with automatic late-arrival cutoff tracking.
              </p>

              <div className="text-[11px] text-indigo-800 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700" />
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
            className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-slate-300 transition-all relative overflow-hidden group"
          >
            <div className="space-y-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <Globe className="w-5 h-5" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Bilingual English & اردو (RTL)
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                One-click toggle between English and Urdu across every screen. Clean Urdu typography and proper Right-To-Left
                orientation without breaking layouts or text overlap.
              </p>

              <div className="text-xs font-semibold text-slate-800">
                حاضر • غیر حاضر • رخصت • فیس واؤچر
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. 4 UNIFIED ROLE PORTALS SHOWCASE */}
      {/* ========================================================================= */}
      <section id="portals" className="relative z-10 py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Four Specialized Portals. One Integrated Brain.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Each stakeholder gets a purpose-built workspace tailored to their daily responsibilities.
            </p>
          </div>

          {/* Portal Selector Tabs */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-3 mb-6 sm:mb-8">
            {[
              { id: "principal", label: "Principal & Admin", icon: Building2 },
              { id: "teacher", label: "Teacher Workspace", icon: UserCheck },
              { id: "parent", label: "Parent & Student", icon: Users },
              { id: "superadmin", label: "Super Admin", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRole(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-900 text-white shadow-xs"
                      : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Portal Content Card */}
          <motion.div
            key={selectedRole}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl bg-slate-50/70 border border-slate-200/90 p-6 sm:p-8 max-w-4xl mx-auto"
          >
            {selectedRole === "principal" && (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Building2 className="w-4 h-4 text-indigo-700" />
                  <span>Principal Command Center</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  High-level oversight of campus attendance, fee recovery, and staff punctuality.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Principals get a live bird's-eye view of every classroom. Broadcast priority-tagged announcements to parents
                  via WhatsApp, manage morning teacher check-in rules with cutoff enforcement, and review fee vouchers.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-medium text-slate-700">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Staff Check-In Log</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Fee Reconciliation</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Urgent WhatsApp Notice</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ School Profile Config</div>
                </div>
              </div>
            )}

            {selectedRole === "teacher" && (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Teacher Attendance & Diary Workspace</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Mark 40 students in 15 seconds. Works completely offline.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Designed specifically for fast classroom transitions. Teachers can record attendance, log daily homework
                  diaries, enter exam marks in batch, and check their clash-free timetable from any phone.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-medium text-slate-700">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ 1-Tap Offline Log</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Digital Homework Diary</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Batch Marks Entry</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Weekly Schedule</div>
                </div>
              </div>
            )}

            {selectedRole === "parent" && (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <Users className="w-4 h-4 text-indigo-700" />
                  <span>Parent & Student Portal (Zero App Required)</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Instant WhatsApp alerts and clear mobile browser report cards.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Parents receive immediate WhatsApp notifications if their child is marked absent. Opening the secure web portal
                  reveals daily homework diaries, exam marks with grade breakdowns, and payment info.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-medium text-slate-700">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ WhatsApp Alerts</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Daily Diary Feed</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Exam Report Cards</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ JazzCash Fee Vouchers</div>
                </div>
              </div>
            )}

            {selectedRole === "superadmin" && (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  <span>Multi-Tenant Platform Governance</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Manage hundreds of independent school tenants with isolated databases.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Super Admins provision new campuses, verify school licenses, monitor real-time sync performance, and review
                  cross-platform health without ever breaching individual school privacy.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-medium text-slate-700">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Multi-Tenant Isolation</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ Instant Provisioning</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ RLS Security Policies</div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">✓ School Audit Logs</div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EXPANDABLE FAQ SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="relative z-10 py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-[11px] font-semibold tracking-wider uppercase">
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Common questions from Pakistani school administrators.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to know about setting up and running Attendlix.
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-900" : ""
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
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-normal">
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
      {/* 5. CONTACT US SECTION */}
      {/* ========================================================================= */}
      <section id="contact" className="relative z-10 py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold tracking-wider uppercase">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Get In Touch</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {lang === "en" ? (
                  <>
                    Have questions about{" "}
                    <span className="text-emerald-700">
                      onboarding your campus?
                    </span>
                  </>
                ) : (
                  <>
                    اپنے اسکول کو رجسٹر کرنے میں{" "}
                    <span className="text-emerald-700">
                      رہنمائی چاہیے؟
                    </span>
                  </>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {lang === "en"
                  ? "Our education specialists are available 6 days a week to help configure your classes, subjects, and staff accounts. Send us a message or chat directly via WhatsApp."
                  : "ہماری ٹیم اسکول کلاسز، مضامین اور عملے کے اکاؤنٹس بنانے میں آپ کی مکمل رہنمائی کے لیے ہمہ وقت تیار ہے۔ واٹس ایپ پر براہِ راست رابطہ کریں۔"}
              </p>

              <div className="space-y-3 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold block text-slate-900">Direct WhatsApp Helpline</span>
                    <span className="text-slate-500 font-mono">+92 300 1234567</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Mail className="w-4 h-4 text-indigo-700" />
                  <div>
                    <span className="font-bold block text-slate-900">Official Support Email</span>
                    <span className="text-slate-500 font-mono">support@attendlix.com</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  <div>
                    <span className="font-bold block text-slate-900">Headquarters</span>
                    <span className="text-slate-500">Lahore, Punjab, Pakistan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form Card */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-slate-50/70 border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                {contactSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Thank you! Message forwarded.</h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Your inquiry has been opened in WhatsApp. Our representative will assist you within a few minutes.
                    </p>
                    <button
                      type="button"
                      onClick={() => setContactSubmitted(false)}
                      className="text-xs font-semibold text-emerald-700 underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {lang === "en" ? "School / Campus Name *" : "اسکول کا نام *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.schoolName}
                          onChange={(e) => setContactForm({ ...contactForm, schoolName: e.target.value })}
                          placeholder={lang === "en" ? "e.g. Al-Huda Academy" : "مثلاً الہدیٰ اکیڈمی"}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          {lang === "en" ? "City" : "شہر"}
                        </label>
                        <input
                          type="text"
                          value={contactForm.city}
                          onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                          placeholder={lang === "en" ? "e.g. Lahore / Rawalpindi" : "مثلاً لاہور / راولپنڈی"}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {lang === "en" ? "WhatsApp / Phone Number *" : "موبائل یا واٹس ایپ نمبر *"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="0300 1234567"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {lang === "en" ? "Questions or Requirements" : "کوئی سوال یا خصوصی ضرورت"}
                      </label>
                      <textarea
                        rows={3}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder={
                          lang === "en"
                            ? "Tell us how many students you have or any special setup needs..."
                            : "طلباء کی تعداد یا کوئی خاص معلومات..."
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === "en" ? "Inquire via WhatsApp" : "واٹس ایپ پر رابطہ کریں"}</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. ROYAL CTA BANNER WITH SCHOOL BACKGROUND PHOTO */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl overflow-hidden p-6 sm:p-12 text-center space-y-4 shadow-xl border border-indigo-900/50">
          {/* Background Image + Dark Emerald & Royal-Indigo Gradient Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/cta-school.jpg"
              alt="Attendlix Modern Education"
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-emerald-950/80 to-indigo-950/85" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-slate-950/70" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {lang === "en" ? (
                <>
                  Ready to modernize your{" "}
                  <span className="text-emerald-400">
                    school campus?
                  </span>
                </>
              ) : (
                <>
                  اپنے اسکول کو آج ہی{" "}
                  <span className="text-emerald-400">
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
                className="w-full sm:w-auto px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>{lang === "en" ? "Register Your School" : "اسکول رجسٹر کریں"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/login"
                className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{lang === "en" ? "Live Portal Login" : "پورٹل لاگ ان"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CLEAN MINIMALIST FOOTER */}
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
              Pakistan's School Cloud Architecture
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              {lang === "en" ? "Home" : "ہوم"}
            </Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              {lang === "en" ? "About Us" : "ہمارے بارے میں"}
            </Link>
            <button type="button" onClick={() => scrollToSection("features")} className="hover:text-slate-900 transition-colors">
              {lang === "en" ? "Features" : "خصوصیات"}
            </button>
            <button type="button" onClick={() => scrollToSection("faq")} className="hover:text-slate-900 transition-colors">
              {lang === "en" ? "FAQ" : "عام سوالات"}
            </button>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">
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
