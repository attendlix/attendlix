"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ArrowRight, Menu, X, Sparkles, MessageSquare } from "lucide-react";
import { useLanguage, LanguageToggle } from "@/context/LanguageContext";

export default function FloatingNavbar() {
  const pathname = usePathname();
  const { lang, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: lang === "en" ? "Home" : "ہوم", href: "/" },
    { name: lang === "en" ? "About Us" : "ہمارے بارے میں", href: "/about" },
    { name: lang === "en" ? "Contact Us" : "رابطہ کریں", href: "/#contact" },
  ];

  const handleContactClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("contact");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        setMobileMenuOpen(false);
      }
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/about") return pathname === "/about";
    return false;
  };

  return (
    <header className="fixed top-3 sm:top-4 inset-x-0 mx-auto max-w-6xl z-50 w-[94%] sm:w-full transition-all duration-300">
      <div
        className={`rounded-full backdrop-blur-2xl px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border shadow-2xl transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/85 border-emerald-500/20 shadow-emerald-950/20"
            : "bg-slate-900/75 border-white/10 shadow-black/40"
        }`}
      >
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            Attendlix<span className="text-emerald-400">.</span>
          </span>
        </Link>

        {/* Center: Exactly 3 Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/40 p-1 rounded-full border border-white/5">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={link.href === "/#contact" ? handleContactClick : undefined}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  active ? "text-emerald-300" : "text-slate-300 hover:text-white"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-emerald-500/15 border border-emerald-500/30 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Language Toggle + Sign In + CTA (Desktop) */}
        <div className="hidden md:flex items-center gap-2.5">
          <LanguageToggle />

          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/60 transition-all min-h-[36px] flex items-center justify-center"
          >
            {lang === "en" ? "Sign In" : "لاگ ان"}
          </Link>

          <Link
            href="/register"
            className="px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.03] active:scale-[0.98] min-h-[36px] flex items-center justify-center gap-1.5"
          >
            <span>{lang === "en" ? "Register School" : "اسکول رجسٹر کریں"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700/80 min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Floating Dropdown Menu Card */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 shadow-2xl p-4 space-y-3"
          >
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      if (link.href === "/#contact") handleContactClick(e);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      active
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <span>{link.name}</span>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800"
              >
                {lang === "en" ? "Sign In to Portal" : "پورٹل لاگ ان کریں"}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20"
              >
                {lang === "en" ? "Register Your School" : "اسکول رجسٹر کریں"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
