"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Users, CalendarCheck, BookOpen, LogOut, CheckCircle2, WifiOff } from "lucide-react";
import { getCurrentUser, logout } from "@/lib/store";

export default function TeacherDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) router.push("/login");
    else setCurrentUser(u);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Attendlix Teacher Portal</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">{currentUser?.name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full p-6 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" />
            <span>Teacher Role Verified</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {currentUser?.name}</h1>
          <p className="text-sm text-slate-600">
            Attendance marking, homework posting, and offline local sync engine for teachers.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Offline Mode Ready:</strong> Attendance marked during school load-shedding is cached locally on device and automatically synced once online.
            </span>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard/principal"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              ← Go to Principal Administration View
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
