"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations } from "@/lib/translations";
import { Globe } from "lucide-react";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: typeof translations.en;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  t: translations.en,
  isRtl: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("attendlix_lang") as Language;
      if (saved === "ur" || saved === "en") {
        setLangState(saved);
        updateHtmlAttributes(saved);
      }
    }
  }, []);

  const updateHtmlAttributes = (currentLang: Language) => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.setAttribute("lang", currentLang);
      root.setAttribute("dir", currentLang === "ur" ? "rtl" : "ltr");
      if (currentLang === "ur") {
        root.classList.add("font-urdu");
      } else {
        root.classList.remove("font-urdu");
      }
    }
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("attendlix_lang", newLang);
    }
    updateHtmlAttributes(newLang);
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "ur" : "en");
  };

  const isRtl = lang === "ur";
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isRtl }}>
      <div dir={isRtl ? "rtl" : "ltr"} className={isRtl ? "font-urdu" : "font-sans"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

// Reusable Top Navbar Language Toggle Button
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 hover:border-slate-400 bg-white shadow-2xs transition-all text-slate-700 hover:text-slate-950 ${className}`}
      title={lang === "en" ? "اردو میں دیکھیں" : "Switch to English"}
    >
      <Globe className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
      <span>{lang === "en" ? "اردو" : "English"}</span>
    </button>
  );
}
