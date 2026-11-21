"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Building2,
  ShieldCheck,
  Check,
  Globe,
  Zap,
} from "lucide-react";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useLanguage, LanguageToggle } from "@/context/LanguageContext";

export default function ContactPage() {
  const { lang, isRtl } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: "",
    schoolName: "",
    phone: "",
    city: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.schoolName || !formData.phone) return;

    setIsSubmitted(true);
    const messageBody = encodeURIComponent(
      `Assalam-o-Alaikum Attendlix Team!\n\n` +
      `My Name: ${formData.fullName}\n` +
      `School Name: ${formData.schoolName}\n` +
      `City: ${formData.city || "Not specified"}\n` +
      `Contact: ${formData.phone}\n` +
      `${formData.message ? `Requirements / Notes: ${formData.message}` : ""}`
    );
    window.open(`https://wa.me/923001234567?text=${messageBody}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans relative overflow-x-hidden pt-16 sm:pt-20">
      {/* Shared Floating Glass Navbar */}
      <FloatingNavbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH BACKGROUND IMAGE */}
      {/* ========================================================================= */}
      <section className="relative -mt-16 sm:-mt-20 pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden border-b border-slate-200/80">
        {/* Background Image + Dark Emerald / Royal Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/contact-school.jpg"
            alt="School Leadership and Administration"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-emerald-950/80 to-indigo-950/85" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-slate-950/70" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-[11px] font-semibold tracking-wider uppercase shadow-xs mx-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === "en" ? "DIRECT CAMPUS SUPPORT • PAKISTAN" : "براہِ راست اسکول سپورٹ • پاکستان"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-[1.15] text-white"
          >
            {lang === "en" ? (
              <>
                Get in touch with the{" "}
                <span className="text-emerald-400">
                  Attendlix team.
                </span>
              </>
            ) : (
              <>
                اٹینڈلکس کی ٹیم سے{" "}
                <span className="text-emerald-400">
                  براہِ راست رابطہ کریں۔
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-200/90 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            {lang === "en"
              ? "We are here to support school owners, principals, and administrative staff across Pakistan. Reach out for a personalized 10-minute demo, onboarding guidance, or technical inquiries."
              : "ہم پاکستان بھر کے اسکول پرنسپلز اور ایڈمنسٹریٹرز کی مکمل معاونت کے لیے حاضر ہیں۔ 10 منٹ کا ڈیمو حاصل کرنے یا سسٹم کی رجسٹریشن کے لیے ہم سے رابطہ کریں۔"}
          </motion.p>

          {/* Quick Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-200/90 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{lang === "en" ? "Rapid 15-Min WhatsApp Reply" : "فوری واٹس ایپ جواب"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{lang === "en" ? "Free Campus Onboarding" : "مفت اسکول آن بورڈنگ"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{lang === "en" ? "100% Dedicated Support" : "مکمل کسٹمر کیئر"}</span>
            </span>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTACT CHANNELS & INTERACTIVE INQUIRY FORM */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Direct Communication Channels */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-900 text-[11px] font-semibold tracking-wider uppercase">
                <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>{lang === "en" ? "Reach Us Directly" : "براہِ راست رابطے کے ذرائع"}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {lang === "en"
                  ? "Speak directly with our school specialists."
                  : "ہماری ایجوکیشن ٹیم سے براہ راست بات کریں۔"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {lang === "en"
                  ? "Skip the waiting queue. Chat with our onboarding engineers over WhatsApp or send us an email."
                  : "بغیر کسی انتظار کے واٹس ایپ پر فوری رہنمائی حاصل کریں یا ای میل ارسال کریں۔"}
              </p>
            </div>

            {/* Channel Card 1: WhatsApp Helpline */}
            <motion.a
              href="https://wa.me/923001234567?text=Assalam-o-Alaikum%20Attendlix%20Team!%20I%20would%20like%20to%20inquire%20about%20school%20onboarding."
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex items-start gap-4 group block"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {lang === "en" ? "Direct WhatsApp Helpline" : "واٹس ایپ ہیلپ لائن"}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Online Now
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-emerald-700">
                  +92 300 1234567
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  {lang === "en"
                    ? "Instant replies for demo scheduling and class setup."
                    : "ڈیمو شیڈول اور کلاسز سیٹ اپ کے لیے فوری جواب۔"}
                </p>
              </div>
            </motion.a>

            {/* Channel Card 2: Email Support */}
            <motion.a
              href="mailto:support@attendlix.com"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex items-start gap-4 group block"
            >
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200/70 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    {lang === "en" ? "Official Support Email" : "آفیشل ای میل سپورٹ"}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                    Same-Day
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-mono font-bold text-indigo-900">
                  support@attendlix.com
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  {lang === "en"
                    ? "For official proposals, vendor verification, and billing inquiries."
                    : "آفیشل پروپوزل اور بلنگ سے متعلق سوالات کے لیے۔"}
                </p>
              </div>
            </motion.a>

            {/* Channel Card 3: Dedicated Support Hours */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === "en" ? "Operational Hours" : "دفتری اوقات"}
                </h3>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  {lang === "en"
                    ? "Monday – Saturday: 08:00 AM to 06:00 PM"
                    : "سوموار تا ہفتہ: صبح 8 بجے سے شام 6 بجے تک"}
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  {lang === "en"
                    ? "Urgent school server and cloud sync monitor active 24/7."
                    : "کلاؤڈ سنک اور سرور مانیٹرنگ 24 گھنٹے فعال رہتی ہے۔"}
                </p>
              </div>
            </div>

            {/* Channel Card 4: Location & Headquarters */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {lang === "en" ? "Headquarters & Campus Presence" : "مرکزی دفتر"}
                </h3>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  Lahore & Islamabad, Pakistan
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  {lang === "en"
                    ? "On-site principal workshops and teacher training available upon request."
                    : "پرنسپل ورکشاپ اور اساتذہ کی ٹریننگ کی سہولت بھی دستیاب ہے۔"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-9 shadow-xs text-left space-y-6">
              <div className="space-y-1.5 border-b border-slate-100 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {lang === "en" ? "Send an Inquiry / Request Demo" : "معلومات یا ڈیمو کی درخواست کریں"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-normal">
                  {lang === "en"
                    ? "Fill out this brief form and our team will get back to you promptly."
                    : "یہ مختصر فارم پُر کریں، ہماری ٹیم فوری طور پر آپ سے رابطہ کرے گی۔"}
                </p>
              </div>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center space-y-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {lang === "en" ? "Inquiry Dispatched to WhatsApp!" : "آپ کا پیغام واٹس ایپ پر ارسال ہو چکا ہے!"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-normal">
                    {lang === "en"
                      ? "Your details have been forwarded to our onboarding team. A representative will connect with you in a few minutes."
                      : "آپ کی تفصیلات ہماری ٹیم کو موصول ہو چکی ہیں۔ ہمارا نمائندہ جلد آپ سے رابطہ کرے گا۔"}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                    >
                      {lang === "en" ? "Submit another inquiry" : "دوسرا پیغام بھیجیں"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {lang === "en" ? "Principal / Contact Name *" : "پرنسپل یا رابطے کا نام *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder={lang === "en" ? "e.g. Prof. Tariq Mahmood" : "مثلاً پروفیسر طارق محمود"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {lang === "en" ? "School / Campus Name *" : "اسکول کا نام *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        placeholder={lang === "en" ? "e.g. Al-Huda Model School" : "مثلاً الہدیٰ ماڈل اسکول"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {lang === "en" ? "Phone / WhatsApp Number *" : "موبائل یا واٹس ایپ نمبر *"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0300 1234567"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {lang === "en" ? "City / Campus Location" : "شہر"}
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder={lang === "en" ? "e.g. Lahore / Gujranwala" : "مثلاً لاہور / گوجرانوالہ"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      {lang === "en" ? "Inquiry Notes / Questions" : "کوئی خاص سوال یا ضرورت"}
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={
                        lang === "en"
                          ? "Tell us how many students you have, your current attendance method, or when you'd like a live demo..."
                          : "طلباء کی تعداد، موجودہ طریقہ کار یا ڈیمو کا وقت درج کریں..."
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 shadow-2xs transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{lang === "en" ? "Send Inquiry via WhatsApp" : "واٹس ایپ پر پیغام ارسال کریں"}</span>
                  </button>

                  <div className="pt-1 text-center text-[11px] text-slate-500 font-medium">
                    🔒 {lang === "en" ? "Your information is confidential and never shared with 3rd parties." : "آپ کا ڈیٹا مکمل طور پر محفوظ اور نجی رکھا جاتا ہے۔"}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ROYAL CTA BANNER WITH SCHOOL BACKGROUND IMAGE */}
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

          <div className="relative z-10 max-w-2xl mx-auto space-y-3 text-white">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {lang === "en" ? (
                <>
                  Ready to modernize your{" "}
                  <span className="text-emerald-400">school campus?</span>
                </>
              ) : (
                <>
                  اپنے اسکول کو آج ہی{" "}
                  <span className="text-emerald-400">ڈیجیٹل بنائیں</span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed font-normal">
              {lang === "en"
                ? "Join progressive schools across Pakistan replacing paper registers, confusing Excel sheets, and missed fee recoveries with Attendlix."
                : "پاکستان بھر کے جدید اسکولوں کا حصہ بنیں اور کاغذی رجسٹروں اور فیس کی پریشانی سے نجات پائیں۔"}
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
      {/* 4. CLEAN MINIMALIST FOOTER */}
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
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              {lang === "en" ? "About Us" : "ہمارے بارے میں"}
            </Link>
            <Link href="/contact" className="text-emerald-600 font-bold transition-colors">
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
