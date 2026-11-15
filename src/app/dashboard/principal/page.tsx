"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Building2,
  Users,
  BookOpen,
  CreditCard,
  Plus,
  Send,
  MessageSquare,
  Copy,
  Check,
  Share2,
  ExternalLink,
  LogOut,
  Bell,
  Search,
  Filter,
  CheckCircle2,
  UserPlus,
  School,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
  Receipt,
  Phone,
  CheckCircle,
  Clock,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  Trash2,
  Edit3,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import {
  getCurrentUser,
  getSchool,
  getOverviewStats,
  getClasses,
  addClass,
  getStaff,
  addStaff,
  getStudents,
  addStudent,
  getAnnouncements,
  addAnnouncement,
  getFeeRecords,
  updateFeeStatus,
  getFeeSummary,
  getClassTimetable,
  checkTeacherClash,
  saveTimetableSlot,
  deleteTimetableSlot,
  DAYS_ORDER,
  logout,
} from "@/lib/store";
import { User, SchoolClass, Student, Announcement, FeeRecord, FeeStatus, PaymentMethod, TimetableSlot, DayOfWeek } from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";
import {
  getFeeReminderWhatsAppUrl,
  getAnnouncementWhatsAppUrl,
  getCredentialsNoticeWhatsAppUrl,
} from "@/lib/whatsapp";

export default function PrincipalDashboard() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "staff" | "students" | "fees" | "announcements" | "timetable">("overview");

  // User and Core Data state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [classesList, setClassesList] = useState<SchoolClass[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([]);

  // Timetable State
  const [selectedTimetableClass, setSelectedTimetableClass] = useState<string>("");
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [showPeriodModal, setShowPeriodModal] = useState<boolean>(false);
  const [editingPeriod, setEditingPeriod] = useState<TimetableSlot | null>(null);
  const [principalTimetableDay, setPrincipalTimetableDay] = useState<DayOfWeek>("MON");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [periodFormData, setPeriodFormData] = useState<{
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    subject: string;
    teacher_id: string;
  }>({
    day_of_week: "MON",
    start_time: "08:00",
    end_time: "08:45",
    subject: "Mathematics",
    teacher_id: "",
  });
  const [clashWarning, setClashWarning] = useState<string | null>(null);

  // Fee Tab State
  const [feeMonth, setFeeMonth] = useState<string>("November");
  const [feeYear, setFeeYear] = useState<number>(2026);
  const [feeClassFilter, setFeeClassFilter] = useState<string>("ALL");
  const [feeStatusFilter, setFeeStatusFilter] = useState<"ALL" | "PAID" | "UNPAID">("ALL");
  const [feeRecordsList, setFeeRecordsList] = useState<FeeRecord[]>([]);
  const [feeSummary, setFeeSummary] = useState<any>(null);

  // Modals & Action States
  const [markPaidModal, setMarkPaidModal] = useState<{ record: FeeRecord; method: PaymentMethod; txnId: string } | null>(null);
  const [feeActionNotice, setFeeActionNotice] = useState<string | null>(null);

  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSection, setNewClassSection] = useState("A");
  const [newClassTeacher, setNewClassTeacher] = useState("");

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    phone: "",
    role: "TEACHER" as "TEACHER" | "ACCOUNTANT",
    email: "",
  });
  const [createdStaffCreds, setCreatedStaffCreds] = useState<{ staff: User; rawPassword: string } | null>(null);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    roll_no: "",
    class_id: "",
    parent_whatsapp: "",
  });
  const [createdStudentCreds, setCreatedStudentCreds] = useState<{ student: Student; rawPassword: string } | null>(null);

  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    audience: "ALL" as "ALL" | "PARENTS" | "TEACHERS" | "ACCOUNTANTS" | "CLASS",
    class_name: "",
  });
  const [announcementSentNotice, setAnnouncementSentNotice] = useState<string | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load and refresh all data
  const refreshAll = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    const sch = getSchool(user.school_id);
    setSchoolData(sch);

    // If logged in user is ACCOUNTANT, strictly default to "fees" tab
    if (user.role === "ACCOUNTANT") {
      setActiveTab("fees");
    }

    const currentStats = getOverviewStats(user.school_id);
    setStats(currentStats);

    const cls = getClasses(user.school_id);
    setClassesList(cls);
    if (cls.length > 0 && !studentFormData.class_id) {
      setStudentFormData((prev) => ({ ...prev, class_id: cls[0].id }));
    }

    setStaffList(getStaff(user.school_id));
    setStudentsList(getStudents(user.school_id));
    setAnnouncementsList(getAnnouncements(user.school_id));

    // Timetable initialization
    const initialClassId = selectedTimetableClass || (cls.length > 0 ? cls[0].id : "");
    if (initialClassId) {
      if (!selectedTimetableClass) setSelectedTimetableClass(initialClassId);
      setTimetableSlots(getClassTimetable(user.school_id, initialClassId));
    }

    // Fee records
    refreshFees(user.school_id, feeMonth, feeYear, feeClassFilter, feeStatusFilter);
  };

  const refreshTimetable = (classId?: string) => {
    if (!currentUser) return;
    const targetClassId = classId || selectedTimetableClass || (classesList.length > 0 ? classesList[0].id : "");
    if (!targetClassId) return;
    setTimetableSlots(getClassTimetable(currentUser.school_id, targetClassId));
  };

  const checkLiveClash = (
    teacherId: string,
    day: DayOfWeek,
    start: string,
    end: string,
    excludeId?: string
  ) => {
    if (!currentUser || !teacherId || !day || !start || !end) {
      setClashWarning(null);
      return;
    }
    const clash = checkTeacherClash(currentUser.school_id, teacherId, day, start, end, excludeId);
    if (clash.hasClash) {
      setClashWarning(clash.message || "Teacher clash detected!");
    } else {
      setClashWarning(null);
    }
  };

  const openCreatePeriod = (day?: DayOfWeek) => {
    const teachers = staffList.filter((s) => s.role === "TEACHER");
    const defaultTeacherId = teachers.length > 0 ? teachers[0].id : "";
    const targetDay = day || "MON";
    setEditingPeriod(null);
    setPeriodFormData({
      day_of_week: targetDay,
      start_time: "08:00",
      end_time: "08:45",
      subject: "Mathematics",
      teacher_id: defaultTeacherId,
    });
    setClashWarning(null);
    setShowPeriodModal(true);
    if (defaultTeacherId) {
      checkLiveClash(defaultTeacherId, targetDay, "08:00", "08:45");
    }
  };

  const openEditPeriod = (slot: TimetableSlot) => {
    setEditingPeriod(slot);
    setPeriodFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      subject: slot.subject,
      teacher_id: slot.teacher_id,
    });
    setClashWarning(null);
    setShowPeriodModal(true);
  };

  const handleSavePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedTimetableClass) return;

    if (!periodFormData.teacher_id) {
      const teachers = staffList.filter((s) => s.role === "TEACHER");
      if (teachers.length > 0) {
        periodFormData.teacher_id = teachers[0].id;
      }
    }

    const res = saveTimetableSlot(currentUser.school_id, {
      id: editingPeriod?.id,
      class_id: selectedTimetableClass,
      teacher_id: periodFormData.teacher_id,
      day_of_week: periodFormData.day_of_week,
      start_time: periodFormData.start_time,
      end_time: periodFormData.end_time,
      subject: periodFormData.subject,
    });

    if (!res.success) {
      setClashWarning(res.error || "Teacher conflict detected for this time slot.");
      return;
    }

    setShowPeriodModal(false);
    setEditingPeriod(null);
    setClashWarning(null);
    setFeeActionNotice("✓ Period scheduled successfully in weekly timetable.");
    setTimeout(() => setFeeActionNotice(null), 4000);
    refreshTimetable(selectedTimetableClass);
  };

  const handleDeletePeriod = (slotId: string) => {
    deleteTimetableSlot(slotId);
    setFeeActionNotice("✓ Period removed from timetable.");
    setTimeout(() => setFeeActionNotice(null), 3000);
    refreshTimetable(selectedTimetableClass);
  };

  const refreshFees = (
    school_id: string,
    month: string,
    year: number,
    classFilter: string,
    statusFilter: "ALL" | "PAID" | "UNPAID"
  ) => {
    const records = getFeeRecords(school_id, {
      month,
      year,
      class_id: classFilter !== "ALL" ? classFilter : undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    });
    setFeeRecordsList(records);
    const summary = getFeeSummary(school_id, month, year);
    setFeeSummary(summary);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Handle Fee Filter changes
  useEffect(() => {
    if (currentUser) {
      refreshFees(currentUser.school_id, feeMonth, feeYear, feeClassFilter, feeStatusFilter);
    }
  }, [feeMonth, feeYear, feeClassFilter, feeStatusFilter]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const formatWhatsAppUrl = (phone: string, message: string) => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("03")) {
      clean = "92" + clean.substring(1);
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  };

  // 1-Click Fee Actions
  const handleConfirmPayment = () => {
    if (!markPaidModal) return;
    updateFeeStatus(markPaidModal.record.id, "PAID", markPaidModal.method, markPaidModal.txnId);
    setFeeActionNotice(`✓ Fee marked as PAID via ${markPaidModal.method} for ${markPaidModal.record.student_name}!`);
    setMarkPaidModal(null);
    if (currentUser) {
      refreshFees(currentUser.school_id, feeMonth, feeYear, feeClassFilter, feeStatusFilter);
    }
    setTimeout(() => setFeeActionNotice(null), 5000);
  };

  const handleRevertFeeToUnpaid = (recordId: string) => {
    updateFeeStatus(recordId, "UNPAID");
    setFeeActionNotice("Fee status reverted to UNPAID.");
    if (currentUser) {
      refreshFees(currentUser.school_id, feeMonth, feeYear, feeClassFilter, feeStatusFilter);
    }
    setTimeout(() => setFeeActionNotice(null), 4000);
  };

  // Form Handlers
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    addClass(currentUser.school_id, newClassName, newClassSection, newClassTeacher);
    setNewClassName("");
    setNewClassSection("A");
    setNewClassTeacher("");
    setShowClassModal(false);
    refreshAll();
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const creds = addStaff(currentUser.school_id, staffFormData);
    setCreatedStaffCreds(creds);
    setStaffFormData({ name: "", phone: "", role: "TEACHER", email: "" });
    refreshAll();
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const creds = addStudent(currentUser.school_id, studentFormData);
    setCreatedStudentCreds(creds);
    setStudentFormData((prev) => ({ ...prev, name: "", roll_no: "", parent_whatsapp: "" }));
    refreshAll();
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !announcementForm.title || !announcementForm.content) return;
    const newAnn = addAnnouncement(currentUser.school_id, announcementForm);
    setAnnouncementSentNotice(
      `✓ Announcement broadcasted! Triggered automatic WhatsApp fallback to ${newAnn.recipients_count} recipients.`
    );
    setAnnouncementForm({
      title: "",
      content: "",
      audience: "ALL",
      class_name: "",
    });
    refreshAll();
    setTimeout(() => setAnnouncementSentNotice(null), 6000);
  };

  const isAccountant = currentUser?.role === "ACCOUNTANT";

  // Tab definitions based on role
  const availableTabs = isAccountant
    ? [{ id: "fees", label: "Fee Management & Payments", icon: CreditCard }]
    : [
        { id: "overview", label: t.tabOverview || "Overview", icon: TrendingUp },
        { id: "classes", label: t.tabClasses || "Classes & Sections", icon: BookOpen },
        { id: "timetable", label: t.tabTimetable || "Timetable", icon: Clock },
        { id: "staff", label: t.tabStaff || "Staff (Teachers & Accounts)", icon: Users },
        { id: "students", label: t.tabStudents || "Student Admissions", icon: UserPlus },
        { id: "fees", label: t.tabFees || "Fee Management", icon: CreditCard },
        { id: "announcements", label: t.tabAnnouncements || "Announcements & WhatsApp", icon: MessageSquare },
      ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-12 overflow-x-hidden w-full">
      {/* Top Principal Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Hamburger Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center flex-shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 text-base sm:text-lg">Attendlix</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block flex-shrink-0" />

            <div className="hidden sm:flex items-center gap-2 text-xs truncate">
              <span className="font-semibold text-slate-800 truncate">{schoolData?.name || "School"}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200 flex-shrink-0">
                {schoolData?.city || "Pakistan"}
              </span>
              <span className="hidden lg:inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex-shrink-0">
                Tenant: {currentUser?.school_id.substring(0, 10)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageToggle />

            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[140px]">{currentUser?.name}</span>
              <span
                className={`text-[10px] font-bold tracking-wide uppercase ${
                  isAccountant ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {isAccountant ? "Accountant" : "Principal"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar (Smooth Horizontal Scroll on Mobile) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-100">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all min-h-[38px] ${
                  active
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* MOBILE SLIDE-OVER DRAWER MENU */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative max-w-[280px] w-full bg-white shadow-2xl z-50 flex flex-col justify-between p-4 space-y-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">Attendlix</span>
                    <span className="text-[10px] text-slate-500 truncate block max-w-[160px]">
                      {schoolData?.name || "School Portal"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Banner in Drawer */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-900 text-xs">{currentUser?.name}</div>
                <div className="text-[10px] font-semibold text-emerald-700 uppercase">
                  {isAccountant ? "Accountant / Fee Officer" : "Principal / Owner"}
                </div>
                <div className="text-[10px] text-slate-400 truncate">Campus: {schoolData?.city || "Pakistan"}</div>
              </div>

              {/* Navigation Links in Drawer */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">
                  Navigation
                </span>
                {availableTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition-all min-h-[44px] ${
                        active
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Global Action Banner */}
        {feeActionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{feeActionNotice}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW (PRINCIPAL ONLY) */}
        {/* ========================================================================= */}
        {activeTab === "overview" && !isAccountant && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Assalam-o-Alaikum, {currentUser?.name.split(" ")[0]}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Welcome to your school administration control panel for {schoolData?.name}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStudentModal(true)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Admit Student</span>
                </button>
                <button
                  onClick={() => setActiveTab("fees")}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fee Register</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Students</span>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{stats?.totalStudents || 0}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span className="text-emerald-600 font-semibold">{stats?.attendanceTodayPercent}%</span>
                  <span>attendance average</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Teachers & Staff</span>
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{stats?.totalStaff || 0}</div>
                <div className="text-[11px] text-slate-500">
                  {stats?.totalTeachers || 0} Teachers • {stats?.totalAccountants || 0} Accountants
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">Classes & Sections</span>
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900">{classesList.length || 0}</div>
                <div className="text-[11px] text-slate-500">All grades active</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-semibold uppercase tracking-wider">November Fee Collection</span>
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600">
                  PKR {(feeSummary?.totalCollectedPKR || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">
                  {feeSummary?.paidCount || 0} Paid • {feeSummary?.unpaidCount || 0} Unpaid (PKR{" "}
                  {(feeSummary?.totalPendingPKR || 0).toLocaleString()} pending)
                </div>
              </div>
            </div>

            {/* Quick Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Classroom Distribution</h3>
                  <button
                    onClick={() => setActiveTab("classes")}
                    className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Manage Classes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {classesList.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {c.name} - Section {c.section}
                        </div>
                        <div className="text-xs text-slate-500">Teacher: {c.class_teacher_name || "Unassigned"}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700">
                        {c.student_count || 0} Students
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Quick Access */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Fee Recovery Pulse</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">JazzCash & Easypaisa Active</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Accountants and Principals manage monthly dues and send 1-click WhatsApp payment reminders with ease.
                  </p>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{feeSummary?.paidCount || 0} Payments Reconciled</span>
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      PKR {(feeSummary?.totalPendingPKR || 0).toLocaleString()} awaiting parent clearance.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("fees")}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open Fee Management Tab</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FEES & PAYMENTS MANAGEMENT (FOR BOTH PRINCIPALS & ACCOUNTANTS) */}
        {/* ========================================================================= */}
        {activeTab === "fees" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                  <span>Monthly Fee Management & Recovery</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Track monthly student dues, mark instant payments, and send WhatsApp reminder alerts in 1 click.
                </p>
              </div>
            </div>

            {/* Fee Summary Cards (4 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Students</span>
                <div className="text-3xl font-extrabold text-slate-900">{feeSummary?.totalStudents || 0}</div>
                <div className="text-[11px] text-slate-400">Enrolled in school</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-emerald-700 uppercase">Paid This Month</span>
                <div className="text-3xl font-extrabold text-emerald-600">{feeSummary?.paidCount || 0}</div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  {feeSummary?.totalStudents
                    ? Math.round((feeSummary.paidCount / feeSummary.totalStudents) * 100)
                    : 0}
                  % recovery rate
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-rose-700 uppercase">Unpaid / Defaulters</span>
                <div className="text-3xl font-extrabold text-rose-600">{feeSummary?.unpaidCount || 0}</div>
                <div className="text-[11px] text-rose-700 font-medium">WhatsApp reminders ready</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Total Collected</span>
                <div className="text-2xl font-extrabold text-slate-900">
                  PKR {(feeSummary?.totalCollectedPKR || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-500">
                  PKR {(feeSummary?.totalPendingPKR || 0).toLocaleString()} pending
                </div>
              </div>
            </div>

            {/* Filters Bar: Class + Month + Status */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                {/* Month Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Month</label>
                  <select
                    value={feeMonth}
                    onChange={(e) => setFeeMonth(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                  >
                    <option value="November">November 2026</option>
                    <option value="October">October 2026</option>
                    <option value="December">December 2026</option>
                    <option value="September">September 2026</option>
                  </select>
                </div>

                {/* Class Filter */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Class / Section</label>
                  <select
                    value={feeClassFilter}
                    onChange={(e) => setFeeClassFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                  >
                    <option value="ALL">All Classes</option>
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.section})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Filter Buttons */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status Filter</label>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  {(["ALL", "PAID", "UNPAID"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFeeStatusFilter(st)}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                        feeStatusFilter === st
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Fee Records (Mobile Cards on < 768px, Table on >= 768px) */}
            
            {/* 1. Mobile Cards View (< 768px) */}
            <div className="space-y-3 block md:hidden">
              {feeRecordsList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                  No fee records found for the selected filters.
                </div>
              ) : (
                feeRecordsList.map((rec) => {
                  const isPaid = rec.status === "PAID";
                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{rec.student_name}</div>
                          <div className="text-xs text-slate-500">
                            Roll #{rec.roll_no} • {rec.class_name} ({rec.section})
                          </div>
                        </div>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>PAID</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>UNPAID</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-slate-500 font-medium">Monthly Fee:</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          PKR {(rec.amount || 4500).toLocaleString()}
                        </span>
                      </div>

                      {isPaid && rec.payment_method && (
                        <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <span>Method:</span>
                          <span className="font-bold text-slate-800">
                            {rec.payment_method} {rec.transaction_id && `(TID: ${rec.transaction_id})`}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        {!isPaid ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setMarkPaidModal({ record: rec, method: "CASH", txnId: "" })}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Mark Paid</span>
                            </button>

                            {rec.parent_whatsapp && (
                              <a
                                href={getFeeReminderWhatsAppUrl({
                                  studentName: rec.student_name || "Student",
                                  parentPhone: rec.parent_whatsapp || "",
                                  schoolName: schoolData?.name || "School",
                                  month: rec.month,
                                  amount: rec.amount,
                                  paymentPhone: schoolData?.phone,
                                })}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-2.5 px-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 min-h-[44px]"
                              >
                                <MessageSquare className="w-4 h-4 text-green-600" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </>
                        ) : (
                          <div className="w-full flex items-center justify-between">
                            <span className="text-xs text-emerald-700 font-semibold">
                              ✓ Paid on {rec.paid_at ? new Date(rec.paid_at).toLocaleDateString() : "This Month"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRevertFeeToUnpaid(rec.id)}
                              className="text-xs text-slate-400 hover:text-rose-600 underline py-1 px-2"
                            >
                              Revert
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 2. Desktop Table View (>= 768px) */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Roll No & Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Fee Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feeRecordsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                        No fee records found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    feeRecordsList.map((rec) => {
                      const isPaid = rec.status === "PAID";
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="font-bold text-slate-900">{rec.student_name}</div>
                            <div className="text-[11px] text-slate-400">Roll #{rec.roll_no}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold">
                              {rec.class_name} - {rec.section}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            PKR {(rec.amount || 4500).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                                <Check className="w-3 h-3" />
                                <span>PAID</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>UNPAID</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600">
                            {isPaid ? (
                              <div>
                                <span className="font-semibold text-slate-800">{rec.payment_method || "CASH"}</span>
                                {rec.transaction_id && (
                                  <span className="block text-[10px] font-mono text-slate-400">
                                    TID: {rec.transaction_id}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isPaid ? (
                                <>
                                  {/* 1-Click Mark as Paid */}
                                  <button
                                    onClick={() =>
                                      setMarkPaidModal({ record: rec, method: "CASH", txnId: "" })
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all min-h-[36px]"
                                  >
                                    Mark Paid
                                  </button>

                                  {/* Send WhatsApp Reminder */}
                                  {rec.parent_whatsapp && (
                                    <a
                                      href={getFeeReminderWhatsAppUrl({
                                        studentName: rec.student_name || "Student",
                                        parentPhone: rec.parent_whatsapp || "",
                                        schoolName: schoolData?.name || "School",
                                        month: rec.month,
                                        amount: rec.amount,
                                        paymentPhone: schoolData?.phone,
                                      })}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs transition-all min-h-[36px]"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">WhatsApp Nudge</span>
                                    </a>
                                  )}
                                </>
                              ) : (
                                <button
                                  onClick={() => handleRevertFeeToUnpaid(rec.id)}
                                  className="text-xs text-slate-400 hover:text-rose-600 underline"
                                >
                                  Revert
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CLASSES & SECTIONS MANAGEMENT (PRINCIPAL ONLY) */}
        {/* ========================================================================= */}
        {activeTab === "classes" && !isAccountant && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Classes & Sections</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Configure grades, sections, and assign class teachers for attendance and exams.
                </p>
              </div>
              <button
                onClick={() => setShowClassModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Class / Section</span>
              </button>
            </div>

            {/* Classes (Mobile Cards on < 768px, Table on >= 768px) */}

            {/* 1. Mobile Cards (< 768px) */}
            <div className="space-y-3 block md:hidden">
              {classesList.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center">
                        {cls.name.charAt(0)}
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm">{cls.name}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                      Section {cls.section}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span>In-Charge Teacher:</span>
                    <span className="font-semibold text-slate-800">{cls.class_teacher_name || "Unassigned"}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Enrolled Students:</span>
                    <span className="font-extrabold text-slate-900">{cls.student_count || 0}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStudentFormData((prev) => ({ ...prev, class_id: cls.id }));
                      setShowStudentModal(true);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>+ Admit Student to this Class</span>
                  </button>
                </div>
              ))}
            </div>

            {/* 2. Desktop Table (>= 768px) */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Class Name</th>
                    <th className="py-3 px-4">Section</th>
                    <th className="py-3 px-4">In-Charge Teacher</th>
                    <th className="py-3 px-4 text-center">Enrolled Students</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classesList.map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-semibold text-xs">
                          {cls.name.charAt(0)}
                        </div>
                        <span>{cls.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold text-xs">
                          Section {cls.section}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{cls.class_teacher_name || "Unassigned"}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-900">{cls.student_count || 0}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setStudentFormData((prev) => ({ ...prev, class_id: cls.id }));
                            setShowStudentModal(true);
                          }}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                        >
                          + Admit to Class
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: STAFF MANAGEMENT (PRINCIPAL ONLY) */}
        {/* ========================================================================= */}
        {activeTab === "staff" && !isAccountant && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Staff Management</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Add teachers and accountants. The system auto-generates temporary IDs and login passwords.
                </p>
              </div>
              <button
                onClick={() => {
                  setCreatedStaffCreds(null);
                  setShowStaffModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Teacher or Accountant</span>
              </button>
            </div>

            {createdStaffCreds && (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-950 text-sm">
                      Staff Member Successfully Registered!
                    </span>
                  </div>
                  <button
                    onClick={() => setCreatedStaffCreds(null)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Staff Name</span>
                    <span className="font-bold text-slate-900">{createdStaffCreds.staff.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Role</span>
                    <span className="font-bold text-emerald-700">{createdStaffCreds.staff.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Login Identifier</span>
                    <span className="font-mono font-bold text-slate-900">{createdStaffCreds.staff.identifier}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Temporary Password</span>
                    <span className="font-mono font-bold text-emerald-600">{createdStaffCreds.rawPassword}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={formatWhatsAppUrl(
                      createdStaffCreds.staff.phone || "",
                      `Assalam-o-Alaikum ${createdStaffCreds.staff.name},\nAapka Attendlix portal account ban chuka hai.\n\nLogin URL: https://attendlix.vercel.app/login\nIdentifier: ${createdStaffCreds.staff.identifier}\nPassword: ${createdStaffCreds.rawPassword}\n\nShukriya.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-xs flex items-center gap-2 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Credentials via WhatsApp</span>
                  </a>

                  <button
                    onClick={() =>
                      copyToClipboard(
                        `Attendlix Login:\nURL: https://attendlix.vercel.app/login\nID: ${createdStaffCreds.staff.identifier}\nPassword: ${createdStaffCreds.rawPassword}`,
                        "staff-copy"
                      )
                    }
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
                  >
                    {copiedKey === "staff-copy" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Staff (Mobile Cards on < 768px, Table on >= 768px) */}

            {/* 1. Mobile Cards (< 768px) */}
            <div className="space-y-3 block md:hidden">
              {staffList.map((st) => (
                <div
                  key={st.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">{st.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {st.identifier}</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        st.role === "TEACHER"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {st.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span>Contact / WhatsApp:</span>
                    <span className="font-semibold text-slate-800">{st.phone || "—"}</span>
                  </div>

                  {st.phone && (
                    <a
                      href={formatWhatsAppUrl(st.phone, `Assalam-o-Alaikum ${st.name}, from ${schoolData?.name}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* 2. Desktop Table (>= 768px) */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Login Identifier</th>
                    <th className="py-3 px-4">WhatsApp / Phone</th>
                    <th className="py-3 px-4 text-right">Quick Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">{st.name}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            st.role === "TEACHER"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {st.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{st.identifier}</td>
                      <td className="py-3.5 px-4 text-slate-600">{st.phone || "—"}</td>
                      <td className="py-3.5 px-4 text-right">
                        {st.phone && (
                          <a
                            href={formatWhatsAppUrl(st.phone, `Assalam-o-Alaikum ${st.name}, from ${schoolData?.name}.`)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-semibold"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: STUDENT ADMISSIONS (PRINCIPAL ONLY) */}
        {/* ========================================================================= */}
        {activeTab === "students" && !isAccountant && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Admissions</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Register new students, assign classes, and link parents via WhatsApp for instant attendance & fee notices.
                </p>
              </div>
              <button
                onClick={() => {
                  setCreatedStudentCreds(null);
                  setShowStudentModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Admit New Student</span>
              </button>
            </div>

            {createdStudentCreds && (
              <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-950 text-sm">
                      Student Admitted! Parent WhatsApp Linked.
                    </span>
                  </div>
                  <button
                    onClick={() => setCreatedStudentCreds(null)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Dismiss
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                    <span className="font-bold text-slate-900">
                      {createdStudentCreds.student.name} (Roll #{createdStudentCreds.student.roll_no})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section</span>
                    <span className="font-bold text-slate-800">
                      {createdStudentCreds.student.class_name} - {createdStudentCreds.student.section}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Login ID</span>
                    <span className="font-mono font-bold text-slate-900">
                      {createdStudentCreds.student.student_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Password</span>
                    <span className="font-mono font-bold text-emerald-600">{createdStudentCreds.rawPassword}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={formatWhatsAppUrl(
                      createdStudentCreds.student.parent_whatsapp,
                      `Mohtaram Parent,\n${createdStudentCreds.student.name} ki admission ${schoolData?.name} mein confirm ho chuki hai.\n\nStudent Portal:\nURL: https://attendlix.vercel.app/login\nStudent ID: ${createdStudentCreds.student.student_id}\nPassword: ${createdStudentCreds.rawPassword}\n\nHazri aur fees ke updates is WhatsApp par mosool honge.`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold text-xs flex items-center gap-2 shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Welcome Notice on WhatsApp</span>
                  </a>

                  <button
                    onClick={() =>
                      copyToClipboard(
                        `Attendlix Student Credentials:\nStudent: ${createdStudentCreds.student.name}\nID: ${createdStudentCreds.student.student_id}\nPassword: ${createdStudentCreds.rawPassword}`,
                        "student-copy"
                      )
                    }
                    className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
                  >
                    {copiedKey === "student-copy" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Students List (Mobile Cards on < 768px, Table on >= 768px) */}

            {/* 1. Mobile Cards (< 768px) */}
            <div className="space-y-3 block md:hidden">
              {studentsList.map((std) => (
                <div
                  key={std.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center">
                        {std.roll_no}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">{std.name}</div>
                        <div className="text-xs text-slate-500 font-mono">ID: {std.student_id}</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
                      {std.class_name} ({std.section})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <span>Parent WhatsApp:</span>
                    <span className="font-semibold text-slate-800">{std.parent_whatsapp}</span>
                  </div>

                  {std.parent_whatsapp && (
                    <a
                      href={formatWhatsAppUrl(
                        std.parent_whatsapp,
                        `Mohtaram Parent of ${std.name}, update from ${schoolData?.name}:`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[44px] transition-all"
                    >
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span>Message Parent on WhatsApp</span>
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* 2. Desktop Table (>= 768px) */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-2xs">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Parent WhatsApp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentsList.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-500">{std.roll_no}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{std.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-xs">
                          {std.class_name} - {std.section}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{std.student_id}</td>
                      <td className="py-3.5 px-4 text-slate-600">{std.parent_whatsapp}</td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={formatWhatsAppUrl(
                            std.parent_whatsapp,
                            `Mohtaram Parent of ${std.name}, update from ${schoolData?.name}:`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-semibold"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ANNOUNCEMENTS & WHATSAPP BROADCAST (PRINCIPAL ONLY) */}
        {/* ========================================================================= */}
        {activeTab === "announcements" && !isAccountant && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                School Announcements & WhatsApp Fallback
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Official circulars published here are broadcasted to parent WhatsApp numbers without requiring any mobile app.
              </p>
            </div>

            {announcementSentNotice && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{announcementSentNotice}</span>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Create New Announcement</span>
              </h3>

              <form onSubmit={handleSendAnnouncement} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Winter Vacation Notification / Exam Schedule"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                    <select
                      value={announcementForm.audience}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, audience: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    >
                      <option value="ALL">All School (Parents + Staff)</option>
                      <option value="PARENTS">Parents Only (WhatsApp)</option>
                      <option value="TEACHERS">Teachers & Staff Only</option>
                      <option value="ACCOUNTANTS">Accountants Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type official notification message here (English or Urdu)..."
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Auto-triggers WhatsApp template dispatch for parents</span>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Publish & Broadcast</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Previous Announcements</h3>
              <div className="space-y-3">
                {announcementsList.map((ann) => (
                  <div key={ann.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{ann.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          {ann.audience}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ann.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-[11px] text-emerald-700">
                      <span className="flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Delivered to {ann.recipients_count || 148} WhatsApp recipients</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: WEEKLY TIMETABLE BUILDER (PRINCIPAL ONLY) */}
        {/* ========================================================================= */}
        {activeTab === "timetable" && !isAccountant && (
          <div className="space-y-6">
            {/* Top Bar with Class Selector & Assign Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>{t.weeklyTimetable || "Weekly Timetable & Schedule"}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isRtl
                    ? "تمام کلاسز کا ہفتہ وار ٹائم ٹیبل بنائیں اور اساتذہ کے تصادم سے بچیں۔"
                    : "Plan class periods from Monday to Saturday with real-time teacher clash prevention."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-500">{t.selectClass || "Class"}:</span>
                  <select
                    value={selectedTimetableClass}
                    onChange={(e) => {
                      setSelectedTimetableClass(e.target.value);
                      refreshTimetable(e.target.value);
                    }}
                    className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.section})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => openCreatePeriod()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.assignPeriod || "Assign Period"}</span>
                </button>
              </div>
            </div>

            {/* Smart Clash Engine Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Smart Clash Engine Active:</strong> Teacher double-booking is automatically blocked across all classes for identical time slots.
                </span>
              </div>
              <span className="hidden md:inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                Monday – Saturday (6 Days)
              </span>
            </div>

            {/* Responsive Timetable: Mobile Day Selector (< 1280px) & Desktop Grid (>= 1280px) */}
            
            {/* 1. Mobile Day Selector View (< 1280px) */}
            <div className="space-y-4 block xl:hidden">
              {/* Day Selector Pills */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {(["MON", "TUE", "WED", "THU", "FRI", "SAT"] as DayOfWeek[]).map((d) => {
                    const active = principalTimetableDay === d;
                    const labels: Record<DayOfWeek, { en: string; ur: string }> = {
                      MON: { en: "Monday", ur: "پیر" },
                      TUE: { en: "Tuesday", ur: "منگل" },
                      WED: { en: "Wednesday", ur: "بدھ" },
                      THU: { en: "Thursday", ur: "جمعرات" },
                      FRI: { en: "Friday", ur: "جمعہ" },
                      SAT: { en: "Saturday", ur: "ہفتہ" },
                    };
                    const count = timetableSlots.filter((s) => s.day_of_week === d).length;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setPrincipalTimetableDay(d)}
                        className={`flex-1 min-w-[70px] sm:min-w-[90px] py-2 px-2.5 rounded-xl text-center transition-all min-h-[44px] flex flex-col items-center justify-center ${
                          active
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">
                          {isRtl ? labels[d].ur : labels[d].en}
                        </span>
                        <span
                          className={`text-[10px] mt-0.5 ${
                            active ? "text-emerald-400 font-bold" : "text-slate-400"
                          }`}
                        >
                          {count} {count === 1 ? "Period" : "Periods"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Periods List */}
              {(() => {
                const dayLabels: Record<DayOfWeek, { en: string; ur: string }> = {
                  MON: { en: "Monday", ur: "پیر" },
                  TUE: { en: "Tuesday", ur: "منگل" },
                  WED: { en: "Wednesday", ur: "بدھ" },
                  THU: { en: "Thursday", ur: "جمعرات" },
                  FRI: { en: "Friday", ur: "جمعہ" },
                  SAT: { en: "Saturday", ur: "ہفتہ" },
                };
                const activeSlots = timetableSlots.filter((s) => s.day_of_week === principalTimetableDay);

                return (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block">
                          {isRtl ? dayLabels[principalTimetableDay].ur : dayLabels[principalTimetableDay].en} Schedule
                        </span>
                        <span className="text-xs text-slate-500">
                          {classesList.find((c) => c.id === selectedTimetableClass)?.name} (
                          {classesList.find((c) => c.id === selectedTimetableClass)?.section}) • {activeSlots.length} periods
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openCreatePeriod(principalTimetableDay)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 min-h-[36px]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Period</span>
                      </button>
                    </div>

                    <div className="p-3 sm:p-4 space-y-3">
                      {activeSlots.length === 0 ? (
                        <div className="py-10 text-center text-slate-400 space-y-2">
                          <Clock className="w-8 h-8 mx-auto opacity-30" />
                          <p className="text-xs font-medium">
                            No periods scheduled for {isRtl ? dayLabels[principalTimetableDay].ur : dayLabels[principalTimetableDay].en}.
                          </p>
                          <button
                            type="button"
                            onClick={() => openCreatePeriod(principalTimetableDay)}
                            className="mt-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 min-h-[40px]"
                          >
                            + Assign Period Now
                          </button>
                        </div>
                      ) : (
                        activeSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                                {slot.start_time} - {slot.end_time}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditPeriod(slot)}
                                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
                                  title="Edit Period"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePeriod(slot.id)}
                                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                                  title="Delete Period"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="font-extrabold text-slate-900 text-sm">{slot.subject}</div>

                            <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>Teacher: {slot.teacher_name || "Assigned Teacher"}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 2. Desktop Grid (>= 1280px) */}
            <div className="hidden xl:grid grid-cols-6 gap-3.5">
              {(["MON", "TUE", "WED", "THU", "FRI", "SAT"] as DayOfWeek[]).map((day) => {
                const dayLabels = {
                  MON: { en: "Monday", ur: "پیر" },
                  TUE: { en: "Tuesday", ur: "منگل" },
                  WED: { en: "Wednesday", ur: "بدھ" },
                  THU: { en: "Thursday", ur: "جمعرات" },
                  FRI: { en: "Friday", ur: "جمعہ" },
                  SAT: { en: "Saturday", ur: "ہفتہ" },
                };
                const daySlots = timetableSlots.filter((s) => s.day_of_week === day);

                return (
                  <div
                    key={day}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col min-h-[340px]"
                  >
                    {/* Day Header */}
                    <div className="p-3 border-b border-slate-100 bg-slate-50/60 rounded-t-2xl flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-slate-900 text-xs block">
                          {isRtl ? dayLabels[day].ur : dayLabels[day].en}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {daySlots.length} {daySlots.length === 1 ? "Period" : "Periods"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openCreatePeriod(day)}
                        className="w-6 h-6 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center transition-colors text-xs font-bold"
                        title={`Add period for ${dayLabels[day].en}`}
                      >
                        +
                      </button>
                    </div>

                    {/* Periods List */}
                    <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[480px]">
                      {daySlots.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400">
                          <Clock className="w-5 h-5 mb-1.5 opacity-40" />
                          <span className="text-[11px] leading-tight font-medium">
                            {t.noClassesForClass || "No periods scheduled"}
                          </span>
                          <button
                            type="button"
                            onClick={() => openCreatePeriod(day)}
                            className="mt-2 text-[10px] text-emerald-600 font-bold hover:underline"
                          >
                            + Add Period
                          </button>
                        </div>
                      ) : (
                        daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-emerald-300 transition-all group space-y-1.5 relative shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100/70 text-emerald-800 font-mono text-[10px] font-bold">
                                {slot.start_time} - {slot.end_time}
                              </span>
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => openEditPeriod(slot)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                                  title="Edit Period"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePeriod(slot.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Delete Period"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="font-bold text-slate-900 text-xs truncate" title={slot.subject}>
                              {slot.subject}
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                              <Users className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{slot.teacher_name || "Assigned Teacher"}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: 1-CLICK MARK AS PAID */}
      {/* ========================================================================= */}
      {markPaidModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Record Fee Payment</h3>
              <button
                onClick={() => setMarkPaidModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 text-sm">{markPaidModal.record.student_name}</div>
                <div className="text-slate-500">
                  {markPaidModal.record.class_name} ({markPaidModal.record.section}) • Roll #{markPaidModal.record.roll_no}
                </div>
                <div className="text-emerald-700 font-extrabold text-sm pt-1">
                  Amount: PKR {(markPaidModal.record.amount || 4500).toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "JAZZCASH", "EASYPAISA"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setMarkPaidModal({ ...markPaidModal, method })}
                      className={`p-2.5 min-h-[44px] rounded-xl border text-center font-bold text-xs transition-all flex items-center justify-center ${
                        markPaidModal.method === method
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {markPaidModal.method !== "CASH" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction ID / Reference (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JC-893021 or EP-4421"
                    value={markPaidModal.txnId}
                    onChange={(e) => setMarkPaidModal({ ...markPaidModal, txnId: e.target.value })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMarkPaidModal(null)}
                className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CLASS */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Class / Section</h3>
              <button
                onClick={() => setShowClassModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Grade Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grade 9 (Computer Science)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A, B, Green"
                  value={newClassSection}
                  onChange={(e) => setNewClassSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Teacher</label>
                <input
                  type="text"
                  placeholder="e.g. Sir Kamran"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Teacher / Accountant</h3>
              <button
                onClick={() => setShowStaffModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                handleAddStaff(e);
                setShowStaffModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sir Bilal"
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                <select
                  value={staffFormData.role}
                  onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="TEACHER">Teacher (Attendance & Homework)</option>
                  <option value="ACCOUNTANT">Accountant (Strict Fee Management)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={staffFormData.phone}
                  onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
                >
                  Generate Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIT STUDENT */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Admit Student & Link Parent</h3>
              <button
                onClick={() => setShowStudentModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                handleAddStudent(e);
                setShowStudentModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Ahmed"
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15"
                    value={studentFormData.roll_no}
                    onChange={(e) => setStudentFormData({ ...studentFormData, roll_no: e.target.value })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Class *</label>
                  <select
                    value={studentFormData.class_id}
                    onChange={(e) => setStudentFormData({ ...studentFormData, class_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.section})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parent WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={studentFormData.parent_whatsapp}
                  onChange={(e) => setStudentFormData({ ...studentFormData, parent_whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
                >
                  Admit & Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN / EDIT TIMETABLE PERIOD */}
      {showPeriodModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingPeriod ? "Edit Timetable Period" : "Assign New Period"}
                </h3>
                <p className="text-xs text-slate-500">
                  {classesList.find((c) => c.id === selectedTimetableClass)?.name} (
                  {classesList.find((c) => c.id === selectedTimetableClass)?.section})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPeriodModal(false);
                  setEditingPeriod(null);
                  setClashWarning(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Live Clash Alert Box */}
            {clashWarning && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs space-y-1 animate-pulse">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{t.teacherClashDetected || "Teacher Clash Detected!"}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{clashWarning}</p>
              </div>
            )}

            <form onSubmit={handleSavePeriod} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.dayOfWeek || "Day of Week"} *
                </label>
                <select
                  value={periodFormData.day_of_week}
                  onChange={(e) => {
                    const newDay = e.target.value as DayOfWeek;
                    setPeriodFormData((prev) => ({ ...prev, day_of_week: newDay }));
                    checkLiveClash(periodFormData.teacher_id, newDay, periodFormData.start_time, periodFormData.end_time, editingPeriod?.id);
                  }}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="MON">Monday (پیر)</option>
                  <option value="TUE">Tuesday (منگل)</option>
                  <option value="WED">Wednesday (بدھ)</option>
                  <option value="THU">Thursday (جمعرات)</option>
                  <option value="FRI">Friday (جمعہ)</option>
                  <option value="SAT">Saturday (ہفتہ)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.subject || "Subject"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics, English, General Science, Urdu"
                  value={periodFormData.subject}
                  onChange={(e) => setPeriodFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.startTime || "Start Time"} *
                  </label>
                  <input
                    type="time"
                    required
                    value={periodFormData.start_time}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setPeriodFormData((prev) => ({ ...prev, start_time: newStart }));
                      checkLiveClash(periodFormData.teacher_id, periodFormData.day_of_week, newStart, periodFormData.end_time, editingPeriod?.id);
                    }}
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.endTime || "End Time"} *
                  </label>
                  <input
                    type="time"
                    required
                    value={periodFormData.end_time}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      setPeriodFormData((prev) => ({ ...prev, end_time: newEnd }));
                      checkLiveClash(periodFormData.teacher_id, periodFormData.day_of_week, periodFormData.start_time, newEnd, editingPeriod?.id);
                    }}
                    className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t.assignTeacher || "Assign Teacher"} *
                </label>
                <select
                  value={periodFormData.teacher_id}
                  onChange={(e) => {
                    const newTeacher = e.target.value;
                    setPeriodFormData((prev) => ({ ...prev, teacher_id: newTeacher }));
                    checkLiveClash(newTeacher, periodFormData.day_of_week, periodFormData.start_time, periodFormData.end_time, editingPeriod?.id);
                  }}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {staffList
                    .filter((s) => s.role === "TEACHER")
                    .map((tch) => (
                      <option key={tch.id} value={tch.id}>
                        {tch.name} ({tch.identifier})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowPeriodModal(false);
                    setEditingPeriod(null);
                    setClashWarning(null);
                  }}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!clashWarning}
                  className={`px-5 py-2.5 min-h-[44px] rounded-xl text-white text-xs font-bold transition-all ${
                    clashWarning
                      ? "bg-slate-300 cursor-not-allowed opacity-60"
                      : "bg-emerald-600 hover:bg-emerald-700 shadow-2xs"
                  }`}
                >
                  {editingPeriod ? "Update Period" : "Save Period"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
