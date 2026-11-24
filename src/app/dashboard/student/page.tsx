"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Award,
  CreditCard,
  MessageSquare,
  LogOut,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Check,
  Smartphone,
  School,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Copy,
  Landmark,
  Wallet,
  Sparkles,
  TrendingUp,
  BarChart3,
  Target,
  FileText,
  AlertCircle,
  Settings,
  Filter,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  getCurrentUser,
  getSchool,
  getStudents,
  getClasses,
  getAnnouncements,
  getAnnouncementsForAudience,
  getHomeworkList,
  getExamMarks,
  getStudentExamMarks,
  getStudentFeeRecords,
  payStudentFee,
  getStudentMessages,
  sendTeacherMessage,
  isQuietHoursActive,
  getClassTimetable,
  getStudentAttendanceRecords,
  DAYS_ORDER,
  logout,
} from "@/lib/store";
import {
  User,
  Student,
  Announcement,
  Homework,
  ExamMark,
  FeeRecord,
  ChatMessage,
  PaymentMethod,
  TimetableSlot,
  DayOfWeek,
  AttendanceRecord,
  AttendanceStatus,
} from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";
import DashboardShell from "@/components/DashboardShell";
import UserSettingsTab from "@/components/UserSettingsTab";
import { SparklineGreenWave, SparklineAmberWave, MiniBarChart, SparklineBluePulse } from "@/components/MiniCharts";

export default function StudentDashboard() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "attendance_hw" | "timetable" | "exams" | "fees" | "chat" | "settings">("overview");

  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [examMarksList, setExamMarksList] = useState<ExamMark[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");

  // Attendance State & Filters
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceMonthFilter, setAttendanceMonthFilter] = useState<string>("ALL");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<"ALL" | "PRESENT" | "ABSENT" | "LATE" | "LEAVE">("ALL");

  // Timetable State
  const [classTimetable, setClassTimetable] = useState<TimetableSlot[]>([]);
  const [selectedDayFilter, setSelectedDayFilter] = useState<DayOfWeek | "ALL">("ALL");

  // Exam Results Filter State
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>("ALL");

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{ record: FeeRecord; method: PaymentMethod; txnId: string } | null>(null);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const quietHours = isQuietHoursActive();

  // ---------------------------------------------------------------------------
  // ATTENDANCE HELPERS & MEMOIZED CALCULATIONS
  // ---------------------------------------------------------------------------
  const formatAttendanceDate = (dateStr: string) => {
    try {
      const parts = dateStr.split("-").map(Number);
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString(isRtl ? "ur-PK" : "en-PK", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    attendanceRecords.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.slice(0, 7));
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [attendanceRecords]);

  const formatMonthName = (yearMonth: string) => {
    if (yearMonth === "ALL") return isRtl ? "تمام مہینے (All Months)" : "All Recorded Months";
    try {
      const [y, m] = yearMonth.split("-").map(Number);
      const d = new Date(y, m - 1, 1);
      return d.toLocaleDateString(isRtl ? "ur-PK" : "en-PK", { month: "long", year: "numeric" });
    } catch {
      return yearMonth;
    }
  };

  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((r) => {
      if (attendanceMonthFilter !== "ALL" && !r.date.startsWith(attendanceMonthFilter)) {
        return false;
      }
      if (attendanceStatusFilter !== "ALL" && r.status !== attendanceStatusFilter) {
        return false;
      }
      return true;
    });
  }, [attendanceRecords, attendanceMonthFilter, attendanceStatusFilter]);

  const recordsInMonth = useMemo(() => {
    return attendanceRecords.filter((r) =>
      attendanceMonthFilter === "ALL" ? true : r.date.startsWith(attendanceMonthFilter)
    );
  }, [attendanceRecords, attendanceMonthFilter]);

  const countPresentInMonth = recordsInMonth.filter((r) => r.status === "PRESENT").length;
  const countAbsentInMonth = recordsInMonth.filter((r) => r.status === "ABSENT").length;
  const countLateInMonth = recordsInMonth.filter((r) => r.status === "LATE").length;
  const countLeaveInMonth = recordsInMonth.filter((r) => r.status === "LEAVE").length;

  const totalRecordedDays = attendanceRecords.length;
  const totalPresentDays = attendanceRecords.filter((r) => r.status === "PRESENT").length;
  const totalAbsentDays = attendanceRecords.filter((r) => r.status === "ABSENT").length;
  const totalLateDays = attendanceRecords.filter((r) => r.status === "LATE").length;
  const totalLeaveDays = attendanceRecords.filter((r) => r.status === "LEAVE").length;
  const overallAttendancePercent =
    totalRecordedDays > 0
      ? Math.round(((totalPresentDays + totalLateDays) / totalRecordedDays) * 100)
      : 96;

  const getArrivalTiming = (record: AttendanceRecord) => {
    if (record.status === "PRESENT") return "08:05 AM (On time)";
    if (record.status === "LATE") return "08:24 AM (Late)";
    if (record.status === "LEAVE") return isRtl ? "منظور شدہ رخصت" : "Approved Leave";
    if (record.status === "ABSENT") return isRtl ? "غیر حاضر (گیٹ بند)" : "No check-in";
    return "—";
  };

  const renderStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isRtl ? "حاضر" : "PRESENT"}</span>
          </span>
        );
      case "ABSENT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{isRtl ? "غیر حاضر" : "ABSENT"}</span>
          </span>
        );
      case "LATE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{isRtl ? "تاخیر" : "LATE"}</span>
          </span>
        );
      case "LEAVE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{isRtl ? "رخصت" : "LEAVE"}</span>
          </span>
        );
      default:
        return null;
    }
  };

  const refreshData = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    const sch = getSchool(user.school_id);
    setSchoolData(sch);

    // Find student associated with user (matching identifier or school default)
    const allStudents = getStudents(user.school_id);
    const student =
      allStudents.find((s) => s.student_id === user.identifier || s.id === user.id) ||
      allStudents[0] ||
      null;
    setCurrentStudent(student);

    if (student) {
      setAnnouncements(getAnnouncementsForAudience(user.school_id, "STUDENT_PARENT"));
      setHomeworkList(getHomeworkList(user.school_id, student.class_id));
      setClassTimetable(getClassTimetable(user.school_id, student.class_id));
      setExamMarksList(getStudentExamMarks(user.school_id, student.id));
      setFeeRecords(getStudentFeeRecords(user.school_id, student.id));
      setChatMessages(getStudentMessages(user.school_id, student.id));
      setAttendanceRecords(getStudentAttendanceRecords(user.school_id, student.id));
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal || !currentUser || !currentStudent) return;

    payStudentFee(
      currentUser.school_id,
      currentStudent.id,
      paymentModal.record.month,
      paymentModal.record.year,
      paymentModal.method,
      paymentModal.txnId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`
    );

    setPaymentSuccessToast(
      `✓ Payment confirmed! Fee for ${paymentModal.record.month} marked as PAID via ${paymentModal.method}.`
    );
    setPaymentModal(null);
    refreshData();
    setTimeout(() => setPaymentSuccessToast(null), 5000);
  };

  const handleSendMessageToTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentStudent || !newMessageText.trim()) return;

    sendTeacherMessage(
      currentUser.school_id,
      currentStudent.id,
      currentStudent.name,
      newMessageText,
      "PARENT"
    );
    setNewMessageText("");
    setChatMessages(getStudentMessages(currentUser.school_id, currentStudent.id));
  };

  const studentNavItems = [
    { id: "overview", label: t.tabOverview || "Overview & Profile", icon: School },
    { id: "attendance", label: isRtl ? "حاضری کا ریکارڈ" : "Attendance Record", icon: CalendarCheck },
    { id: "attendance_hw", label: isRtl ? "ہوم ورک ڈائری" : "Homework Diary", icon: BookOpen },
    { id: "timetable", label: t.tabTimetable || "Timetable", icon: Clock },
    { id: "exams", label: t.tabExams || "Exam Marks", icon: Award },
    { id: "fees", label: t.tabFees || "Fee Status", icon: CreditCard },
    { id: "chat", label: t.tabChat || "Teacher Chat", icon: MessageSquare },
    { id: "settings", label: t.tabSettings || "Settings", icon: Settings },
  ];

  return (
    <DashboardShell
      currentUser={currentUser}
      schoolName={schoolData?.name || "Beacon Grammar School"}
      schoolCity={schoolData?.city || "Lahore"}
      tenantId={currentStudent?.student_id}
      navItems={studentNavItems}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as any)}
      onLogout={handleLogout}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Payment Toast */}
        {paymentSuccessToast && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{paymentSuccessToast}</span>
          </div>
        )}

        {/* Student Profile Card (Always visible at top) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {(currentStudent?.avatar_url || currentUser?.avatar_url) ? (
                <img
                  src={currentStudent?.avatar_url || currentUser?.avatar_url}
                  alt={currentStudent?.name || "Student"}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-2xs flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-base border border-emerald-200 flex-shrink-0">
                  {currentStudent?.name?.charAt(0) || currentUser?.name?.charAt(0) || "S"}
                </div>
              )}
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">{currentStudent?.name || currentUser?.name}</h1>
                <p className="text-xs text-slate-500">
                  {currentStudent?.class_name} - Section {currentStudent?.section} • Roll #{currentStudent?.roll_no}
                </p>
                <div className="text-[11px] text-slate-400">{schoolData?.name} ({schoolData?.city})</div>
              </div>
            </div>

            {/* Attendance Badge - Clickable to Attendance Tab */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("attendance")}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-right transition-colors"
                title="View Full Attendance History"
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {isRtl ? "حاضری کی شرح" : "Attendance Rate"}
                </span>
                <span className="text-lg font-extrabold">
                  {overallAttendancePercent}% {isRtl ? "حاضر" : "Present"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & ANNOUNCEMENTS */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Elevated Quick Status Cards with Inline Mini Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Today's Attendance -> switches to attendance */}
              <div
                onClick={() => setActiveTab("attendance")}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2 relative overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all group"
                title="Click to view full date-wise attendance log"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "آج کی حاضری" : "Today's Attendance"}
                  </span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-emerald-700">
                    {isRtl ? "حاضر" : "Present"}
                  </div>
                  <SparklineGreenWave className="w-20 h-7" />
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-0.5">
                  <span>{isRtl ? `آمد: 08:05 AM` : `Marked at 08:05 AM`}</span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>{isRtl ? "ریکارڈ دیکھیں" : "View Record"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Card 2: November Fee -> switches to fees */}
              <div
                onClick={() => setActiveTab("fees")}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2 relative overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all group"
                title="Click to view and pay school fees"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "نومبر فیس" : "November Fee"}
                  </span>
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-slate-900">
                    {feeRecords.some((f) => f.month === "November" && f.status === "PAID") ? (
                      <span className="text-emerald-700">Paid ✓</span>
                    ) : (
                      <span className="text-amber-600">PKR 4,500</span>
                    )}
                  </div>
                  <SparklineAmberWave className="w-20 h-7" />
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-0.5">
                  <span>Via JazzCash / Easypaisa</span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>{isRtl ? "فیس تفصیل" : "Fee Status"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Card 3: Pending Homework -> switches to attendance_hw */}
              <div
                onClick={() => setActiveTab("attendance_hw")}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2 relative overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all group"
                title="Click to view daily homework diary"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "زیر التواء ہوم ورک" : "Pending Homework"}
                  </span>
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-slate-900">{homeworkList.length} Tasks</div>
                  <MiniBarChart className="w-16 h-7" />
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-0.5">
                  <span>{isRtl ? "ٹیچر ڈائری سے مطابقت" : "Teacher Diary"}</span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>{isRtl ? "ڈائری دیکھیں" : "View Diary"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* School Announcements */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-600" />
                <span>{t.tabAnnouncements || "Official School Announcements"}</span>
              </h3>

              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No active school circulars or announcements at this time.
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-2xl bg-white border shadow-2xs space-y-2 transition-all ${
                        ann.priority === "URGENT"
                          ? "border-rose-300 ring-1 ring-rose-200 bg-rose-50/20"
                          : "border-slate-200/80"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{ann.title}</span>

                          {/* Priority Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                              ann.priority === "URGENT"
                                ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                                : ann.priority === "IMPORTANT"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {ann.priority === "URGENT" && (
                              <AlertCircle className="w-3 h-3 text-rose-600 flex-shrink-0" />
                            )}
                            {ann.priority === "URGENT"
                              ? `🚨 ${t.priorityUrgent || "URGENT"}`
                              : ann.priority === "IMPORTANT"
                              ? `⚡ ${t.priorityImportant || "IMPORTANT"}`
                              : `📢 ${t.priorityNormal || "NORMAL"}`}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {new Date(ann.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{ann.content}</p>

                      <div className="text-[10px] text-emerald-700 font-medium pt-1 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Broadcasted via WhatsApp & Portal</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2A: COMPLETE DATE-WISE ATTENDANCE LOG */}
        {/* ========================================================================= */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            {/* Header with Title & Quick Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-600" />
                  <span>{isRtl ? "حاضری کا مکمل ریکارڈ اور گیٹ لاگ" : "Attendance Record & Gate Log"}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl
                    ? "مکمل تاریخ وار اسکول حاضری، وقت کی پابندی اور چھٹیوں کی تفاصیل"
                    : "Complete date-by-date check-in history, arrival timings, and leave records."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("attendance_hw")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs self-start sm:self-auto"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isRtl ? "ہوم ورک ڈائری دیکھیں" : "View Homework Diary"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top 4 Attendance Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Overall % */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "مجموعی حاضری" : "Attendance Rate"}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {overallAttendancePercent}%
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {overallAttendancePercent >= 90 ? "Excellent" : "Standard"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {totalRecordedDays} {isRtl ? "ریکارڈ شدہ دن" : "total days"}
                  </span>
                  <SparklineGreenWave />
                </div>
              </div>

              {/* Card 2: Present Days */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "کل حاضر دن" : "Present Days"}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {totalPresentDays}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">days</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {isRtl ? "آن ٹائم آمد" : "On-time arrival"}
                  </span>
                  <SparklineBluePulse />
                </div>
              </div>

              {/* Card 3: Absent Days */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "کل غیر حاضر" : "Absent Days"}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {totalAbsentDays}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">days</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-rose-600 font-medium">
                    {totalAbsentDays === 0 ? "Perfect attendance!" : "Unexcused"}
                  </span>
                  <MiniBarChart />
                </div>
              </div>

              {/* Card 4: Late & Leaves */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "تاخیر و رخصت" : "Late & Leaves"}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {totalLateDays + totalLeaveDays}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    {totalLateDays} Late • {totalLeaveDays} Leave
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {isRtl ? "گیٹ پر تاخیر یا منظور شدہ" : "Gate delays / Leaves"}
                  </span>
                  <SparklineAmberWave />
                </div>
              </div>
            </div>

            {/* Filter Controls: Month Selector & Status Pills */}
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Month Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isRtl ? "مہینہ منتخب کریں:" : "Month:"}</span>
                </label>
                <div className="relative">
                  <select
                    value={attendanceMonthFilter}
                    onChange={(e) => setAttendanceMonthFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B2E]/20 transition-all cursor-pointer"
                  >
                    <option value="ALL">{formatMonthName("ALL")}</option>
                    {availableMonths.map((ym) => (
                      <option key={ym} value={ym}>
                        {formatMonthName(ym)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "ALL", label: isRtl ? "تمام" : "All", count: recordsInMonth.length, activeClass: "bg-[#0B3B2E] text-white border-[#0B3B2E]" },
                  { id: "PRESENT", label: isRtl ? "حاضر" : "Present", count: countPresentInMonth, activeClass: "bg-emerald-600 text-white border-emerald-600" },
                  { id: "ABSENT", label: isRtl ? "غیر حاضر" : "Absent", count: countAbsentInMonth, activeClass: "bg-rose-600 text-white border-rose-600" },
                  { id: "LATE", label: isRtl ? "تاخیر" : "Late", count: countLateInMonth, activeClass: "bg-amber-600 text-white border-amber-600" },
                  { id: "LEAVE", label: isRtl ? "رخصت" : "Leave", count: countLeaveInMonth, activeClass: "bg-blue-600 text-white border-blue-600" },
                ].map((pill) => {
                  const isActive = attendanceStatusFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setAttendanceStatusFilter(pill.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isActive
                          ? pill.activeClass + " shadow-2xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? "bg-white/25 text-white" : "bg-slate-200/80 text-slate-600"
                        }`}
                      >
                        {pill.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attendance Records List / Table */}
            <div className="rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {attendanceMonthFilter === "ALL"
                      ? isRtl
                        ? "تمام ریکارڈ شدہ حاضری"
                        : "All Recorded School Days"
                      : `${formatMonthName(attendanceMonthFilter)} Log`}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    ({filteredAttendance.length} {filteredAttendance.length === 1 ? "entry" : "entries"})
                  </span>
                </div>

                {(attendanceStatusFilter !== "ALL" || attendanceMonthFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setAttendanceStatusFilter("ALL");
                      setAttendanceMonthFilter("ALL");
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    {isRtl ? "فلٹرز ختم کریں" : "Reset Filters"}
                  </button>
                )}
              </div>

              {filteredAttendance.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Filter className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {isRtl ? "کوئی ریکارڈ نہیں ملا" : "No Attendance Records Found"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {isRtl
                        ? "اس فلٹر کے لیے کوئی حاضری اندراج دستیاب نہیں ہے۔ دیگر فلٹرز یا مہینہ منتخب کریں۔"
                        : "There are no attendance records matching your chosen month and status filter."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttendanceStatusFilter("ALL");
                      setAttendanceMonthFilter("ALL");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <span>{isRtl ? "تمام ریکارڈز دکھائیں" : "Show All Records"}</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="py-3.5 px-4">Date & Day</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Timing / Gate Check</th>
                          <th className="py-3.5 px-4">Remarks / Reason</th>
                          <th className="py-3.5 px-4 text-right">Recorded By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {filteredAttendance.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span>{formatAttendanceDate(rec.date)}</span>
                            </td>
                            <td className="py-3.5 px-4">{renderStatusBadge(rec.status)}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              <span
                                className={
                                  rec.status === "LATE"
                                    ? "text-amber-700 font-bold"
                                    : rec.status === "ABSENT"
                                    ? "text-rose-500 font-normal"
                                    : "text-slate-700"
                                }
                              >
                                {getArrivalTiming(rec)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {rec.remarks ? (
                                <span className="italic text-slate-700">“{rec.remarks}”</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-500">
                              {rec.marked_by || "Ms. Sadia Tariq (Class Teacher)"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="block md:hidden divide-y divide-slate-100">
                    {filteredAttendance.map((rec) => (
                      <div key={rec.id} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatAttendanceDate(rec.date)}</span>
                          </span>
                          {renderStatusBadge(rec.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Arrival / Gate</span>
                            <span
                              className={`font-mono font-medium ${
                                rec.status === "LATE"
                                  ? "text-amber-700 font-bold"
                                  : rec.status === "ABSENT"
                                  ? "text-rose-500"
                                  : "text-slate-700"
                              }`}
                            >
                              {getArrivalTiming(rec)}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Recorded By</span>
                            <span className="text-slate-700 truncate block">
                              {rec.marked_by ? rec.marked_by.split(" ")[0] + "..." : "Class Teacher"}
                            </span>
                          </div>
                        </div>
                        {rec.remarks && (
                          <div className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                            Remarks: “{rec.remarks}”
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2B: HOMEWORK DIARY */}
        {/* ========================================================================= */}
        {activeTab === "attendance_hw" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>{isRtl ? "روزانہ ہوم ورک ڈائری" : "Daily Homework Diary"}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl
                    ? "اساتذہ کی طرف سے روزانہ تفویض کردہ ہوم ورک اور اسائنمنٹس"
                    : "Subject assignments, due dates, and learning tasks given by teachers."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("attendance")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs self-start sm:self-auto"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isRtl ? "مکمل حاضری ریکارڈ دیکھیں" : "View Attendance Log"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Daily Homework Cards */}
            <div className="space-y-3">
              {homeworkList.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-slate-100 text-center text-xs text-slate-500">
                  No pending homework tasks assigned today.
                </div>
              ) : (
                homeworkList.map((hw) => (
                  <div key={hw.id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {hw.subject}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{hw.title}</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                        Due: {hw.due_date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EXAM MARKS & TEST RESULTS */}
        {/* ========================================================================= */}
        {activeTab === "exams" && (() => {
          const getExamCategory = (exam: ExamMark) => {
            if (exam.exam_type === "MID_TERM" || exam.exam_name.toLowerCase().includes("mid")) return "MID_TERM";
            if (exam.exam_type === "FINAL_TERM" || exam.exam_name.toLowerCase().includes("final")) return "FINAL_TERM";
            if (exam.exam_type === "MONTHLY_TEST" || exam.exam_name.toLowerCase().includes("monthly")) return "MONTHLY_TEST";
            return "OTHER";
          };

          const filteredExams = examMarksList.filter((ex) => {
            if (selectedExamFilter === "ALL") return true;
            return getExamCategory(ex) === selectedExamFilter;
          });

          const totalPossibleMarks = filteredExams.reduce((sum, item) => sum + (Number(item.total_marks) || 0), 0);
          const totalObtainedMarks = filteredExams.reduce((sum, item) => sum + (Number(item.obtained_marks) || 0), 0);
          const overallPercentage = totalPossibleMarks > 0 ? Math.round((totalObtainedMarks / totalPossibleMarks) * 1000) / 10 : 0;

          const getGradeDetails = (pct: number) => {
            if (pct >= 80) {
              return {
                grade: "A+",
                label: "Outstanding",
                badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                barColor: "bg-emerald-500",
                statusText: "Passed with Distinction",
              };
            }
            if (pct >= 70) {
              return {
                grade: "A",
                label: "Excellent",
                badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
                barColor: "bg-blue-500",
                statusText: "Passed with High Merit",
              };
            }
            if (pct >= 60) {
              return {
                grade: "B",
                label: "Very Good",
                badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
                barColor: "bg-amber-500",
                statusText: "Passed Satisfactorily",
              };
            }
            if (pct >= 50) {
              return {
                grade: "C",
                label: "Satisfactory",
                badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
                barColor: "bg-orange-500",
                statusText: "Passed",
              };
            }
            if (pct >= 40) {
              return {
                grade: "D",
                label: "Passing",
                badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
                barColor: "bg-purple-500",
                statusText: "Passed at Border",
              };
            }
            return {
              grade: "F",
              label: "Needs Improvement",
              badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
              barColor: "bg-rose-500",
              statusText: "Academic Support Required",
            };
          };

          const overallGrade = getGradeDetails(overallPercentage);

          return (
            <div className="space-y-4 sm:space-y-6">
              {/* Header + Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <span>{t.examResults || "Test & Examination Results"}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official verified marks and academic remarks recorded by class teachers.
                  </p>
                </div>

                {/* Exam Type Selector (Horizontal scroll pills) */}
                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-1 w-full sm:w-auto">
                  {[
                    { id: "ALL", label: t.allExams || "All Exams" },
                    { id: "MID_TERM", label: t.midTerm || "Mid-Term" },
                    { id: "MONTHLY_TEST", label: t.monthlyTests || "Monthly Tests" },
                    { id: "FINAL_TERM", label: t.finalTerm || "Final Term" },
                  ].map((tab) => {
                    const count = examMarksList.filter(
                      (e) => tab.id === "ALL" || getExamCategory(e) === tab.id
                    ).length;
                    const isActive = selectedExamFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedExamFilter(tab.id)}
                        className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                          isActive
                            ? "bg-slate-900 text-white shadow-2xs font-bold"
                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aggregate Performance Summary Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {t.performanceSummary || "Performance Overview"}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>{currentStudent?.name || "Student"}</span>
                        <span className="text-xs text-slate-400 font-normal">
                          • Roll #{currentStudent?.roll_no || "01"} • {currentStudent?.class_name || "Grade 8"} ({currentStudent?.section || "A"})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{overallGrade.statusText}</span>
                    </span>
                  </div>
                </div>

                {/* 3 Metric Pillars: Total Score, Overall %, Grade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {/* Metric 1: Total Marks */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      {t.totalMarks || "Total Marks"}
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">
                      {totalObtainedMarks}{" "}
                      <span className="text-xs sm:text-sm font-normal text-slate-400">
                        / {totalPossibleMarks}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Aggregated across {filteredExams.length} tested subjects
                    </div>
                  </div>

                  {/* Metric 2: Overall Percentage */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      {t.overallPercentage || "Overall Percentage"}
                    </span>
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                      {overallPercentage}%
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-1.5">
                      <div
                        className={`h-full ${overallGrade.barColor} transition-all duration-500`}
                        style={{ width: `${Math.min(100, overallPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Metric 3: Overall Grade */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">
                      {t.overallGrade || "Overall Grade"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-white">
                        Grade {overallGrade.grade}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-slate-200">
                        {overallGrade.label}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Official grading scale (80%+ is Grade A+)
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Results Grid */}
              {filteredExams.length === 0 ? (
                <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-700">No exam marks found for this filter</div>
                  <p className="text-xs text-slate-500">Try selecting another exam category or All Exams.</p>
                  <button
                    type="button"
                    onClick={() => setSelectedExamFilter("ALL")}
                    className="px-4 py-2 min-h-[40px] rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-2xs"
                  >
                    Show All Exams
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {filteredExams.map((res) => {
                    const pct = Math.round(
                      (Number(res.obtained_marks) / Number(res.total_marks)) * 100
                    );
                    const gradeDetails = getGradeDetails(pct);

                    return (
                      <div
                        key={res.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          {/* Subject Title & Term Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-extrabold text-slate-900 text-base">{res.subject}</div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                <span>{res.exam_name}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${gradeDetails.badgeBg}`}
                              >
                                {pct}% • Grade {gradeDetails.grade}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                {gradeDetails.label}
                              </span>
                            </div>
                          </div>

                          {/* Marks & Visual Progress Bar */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">Score Obtained:</span>
                              <div className="font-bold text-slate-900 text-sm">
                                {res.obtained_marks}{" "}
                                <span className="text-slate-400 text-xs font-normal">
                                  / {res.total_marks}
                                </span>
                              </div>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full ${gradeDetails.barColor} rounded-full transition-all duration-500`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Teacher Remarks Box */}
                        {res.remarks ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2 mt-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="space-y-0.5 flex-1">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                                {t.teacherRemarks || "Teacher Remarks"}:
                              </span>
                              <p className="leading-relaxed text-slate-800 text-[11px] sm:text-xs italic">
                                &ldquo;{res.remarks}&rdquo;
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-slate-50/60 border border-slate-100 text-[11px] text-slate-400 italic">
                            No teacher remarks recorded for this test.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* TAB 4: FEE STATUS & LOCAL PAYMENTS (JAZZCASH & EASYPAISA) */}
        {/* ========================================================================= */}
        {activeTab === "fees" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Monthly Fee History & Direct Payment</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pay fee online using JazzCash / Easypaisa without visiting school counter.
              </p>
            </div>

            <div className="space-y-3">
              {feeRecords.map((fee) => {
                const isPaid = fee.status === "PAID";
                return (
                  <div
                    key={fee.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base">{fee.month} {fee.year}</span>
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            PAID ✓
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                            UNPAID
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500">
                        Amount: <strong className="text-slate-900">PKR {(fee.amount || 4500).toLocaleString()}</strong>
                        {isPaid && fee.payment_method && (
                          <span className="ml-2">
                            • Method: {fee.payment_method} {fee.transaction_id ? `(${fee.transaction_id})` : ""}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      {!isPaid ? (
                        <button
                          onClick={() => setPaymentModal({ record: fee, method: "JAZZCASH", txnId: "" })}
                          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Pay via JazzCash / Easypaisa</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Payment Settled</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PARENT-TEACHER CHAT (WITH QUIET HOURS) */}
        {/* ========================================================================= */}
        {activeTab === "chat" && (
          <div className="space-y-4">
            {/* Quiet Hours Notice */}
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                quietHours.isActive
                  ? "bg-purple-50 border-purple-200 text-purple-900"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>
                  <strong>Quiet Hours Active ({quietHours.hoursText}):</strong> Messages sent now will be
                  queued and delivered to the teacher at 8:00 AM next morning.
                </span>
              </div>
            </div>

            {/* Chat Box */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between min-h-[400px]">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Class Teacher Thread</h4>
                  <p className="text-[11px] text-slate-400">Direct 1-on-1 messaging for academic queries</p>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[300px]">
                {chatMessages.map((msg) => {
                  const isParent = msg.sender_role === "PARENT";
                  return (
                    <div key={msg.id} className={`flex flex-col ${isParent ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                          isParent
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-slate-100 text-slate-900 rounded-bl-none"
                        }`}
                      >
                        <div className="text-[10px] font-bold opacity-70 mb-1">
                          {isParent ? "You (Parent)" : "Class Teacher"}
                        </div>
                        <p className="leading-relaxed">{msg.content}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessageToTeacher} className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  required
                  placeholder="Type message to class teacher..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all flex items-center justify-center flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CLASS TIMETABLE & SCHEDULE */}
        {/* ========================================================================= */}
        {activeTab === "timetable" && (
          <div className="space-y-4">
            {/* Header Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span>{t.weeklyTimetable || "Weekly Class Timetable"}</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    {currentStudent?.class_name} - Section {currentStudent?.section} • Monday to Saturday
                  </p>
                </div>

                {/* Day Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5">
                  {(["ALL", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const).map((d) => {
                    const active = selectedDayFilter === d;
                    const labels: Record<string, string> = {
                      ALL: t.all || "All",
                      MON: isRtl ? "پیر" : "Mon",
                      TUE: isRtl ? "منگل" : "Tue",
                      WED: isRtl ? "بدھ" : "Wed",
                      THU: isRtl ? "جمعرات" : "Thu",
                      FRI: isRtl ? "جمعہ" : "Fri",
                      SAT: isRtl ? "ہفتہ" : "Sat",
                    };
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDayFilter(d)}
                        className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                          active
                            ? "bg-slate-900 text-white shadow-2xs font-bold"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {labels[d]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Timetable List grouped by day */}
            {(() => {
              const dayLabels: Record<DayOfWeek, { en: string; ur: string }> = {
                MON: { en: "Monday", ur: "پیر" },
                TUE: { en: "Tuesday", ur: "منگل" },
                WED: { en: "Wednesday", ur: "بدھ" },
                THU: { en: "Thursday", ur: "جمعرات" },
                FRI: { en: "Friday", ur: "جمعہ" },
                SAT: { en: "Saturday", ur: "ہفتہ" },
              };

              const daysToDisplay =
                selectedDayFilter === "ALL"
                  ? (["MON", "TUE", "WED", "THU", "FRI", "SAT"] as DayOfWeek[])
                  : [selectedDayFilter];

              const hasAnySlots = classTimetable.some((s) => daysToDisplay.includes(s.day_of_week));

              if (!hasAnySlots) {
                return (
                  <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400 space-y-2">
                    <Clock className="w-8 h-8 mx-auto opacity-30" />
                    <p className="text-xs font-medium">
                      {t.noClassesForClass || "No periods scheduled for this class yet."}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {daysToDisplay.map((day) => {
                    const slotsForDay = classTimetable.filter((s) => s.day_of_week === day);
                    if (selectedDayFilter === "ALL" && slotsForDay.length === 0) return null;

                    return (
                      <div
                        key={day}
                        className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
                      >
                        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">
                            {isRtl ? dayLabels[day].ur : dayLabels[day].en}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {slotsForDay.length} {slotsForDay.length === 1 ? "Period" : "Periods"}
                          </span>
                        </div>

                        <div className="p-3 sm:p-4 divide-y divide-slate-100">
                          {slotsForDay.length === 0 ? (
                            <div className="text-xs text-slate-400 py-2">
                              {t.noClassesToday || "No classes scheduled."}
                            </div>
                          ) : (
                            slotsForDay.map((slot) => (
                              <div
                                key={slot.id}
                                className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-bold text-slate-900 text-sm">{slot.subject}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <span>Teacher: {slot.teacher_name || "Assigned Teacher"}</span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-bold whitespace-nowrap">
                                    {slot.start_time} - {slot.end_time}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: PERSONAL SETTINGS & ACCOUNT SECURITY */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <UserSettingsTab
            currentUser={currentUser}
            onUserUpdate={(updated) => {
              setCurrentUser(updated);
              if (updated.avatar_url) {
                setCurrentStudent((prev) => (prev ? { ...prev, avatar_url: updated.avatar_url } : prev));
              }
            }}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PAY VIA JAZZCASH / EASYPAISA */}
      {/* ========================================================================= */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Pay School Fee</h3>
              <button
                onClick={() => setPaymentModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompletePayment} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Month</span>
                  <span className="font-bold text-slate-900">{paymentModal.record.month} {paymentModal.record.year}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-700 font-bold">Total Amount Due</span>
                  <span className="text-emerald-700 font-extrabold text-sm">
                    PKR {(paymentModal.record.amount || 4500).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Payment Option *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentModal({ ...paymentModal, method: "JAZZCASH" })}
                    className={`p-2.5 min-h-[44px] rounded-xl border text-center font-bold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                      paymentModal.method === "JAZZCASH"
                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>JazzCash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentModal({ ...paymentModal, method: "EASYPAISA" })}
                    className={`p-2.5 min-h-[44px] rounded-xl border text-center font-bold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                      paymentModal.method === "EASYPAISA"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Easypaisa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentModal({ ...paymentModal, method: "BANK_TRANSFER" })}
                    className={`p-2.5 min-h-[44px] rounded-xl border text-center font-bold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                      paymentModal.method === "BANK_TRANSFER"
                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Landmark className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Dynamic School Payment Instructions Scoped to School & Selected Method */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400">
                  <span>Transfer Fee To Official Account</span>
                  <span className="text-emerald-700 font-semibold">Verified School Desk</span>
                </div>

                {paymentModal.method === "JAZZCASH" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Service:</span>
                      <strong className="text-slate-900 font-bold">JazzCash Mobile Wallet</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Account Title:</span>
                      <strong className="text-slate-900">{schoolData?.jazzcash_title || schoolData?.name || "School Official"}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Mobile / Till Number:</span>
                        <strong className="text-slate-900 font-mono text-sm tracking-wider">
                          {schoolData?.jazzcash_number || schoolData?.phone || "0300-4567890"}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(schoolData?.jazzcash_number || schoolData?.phone || "03004567890", "jazzcash")}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] shadow-2xs flex items-center gap-1 transition-all"
                      >
                        {copiedText === "jazzcash" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {paymentModal.method === "EASYPAISA" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Service:</span>
                      <strong className="text-slate-900 font-bold">Easypaisa Mobile Wallet</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Account Title:</span>
                      <strong className="text-slate-900">{schoolData?.easypaisa_title || schoolData?.name || "School Official"}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Mobile / Till Number:</span>
                        <strong className="text-slate-900 font-mono text-sm tracking-wider">
                          {schoolData?.easypaisa_number || schoolData?.phone || "0300-4567890"}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(schoolData?.easypaisa_number || schoolData?.phone || "03004567890", "easypaisa")}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] shadow-2xs flex items-center gap-1 transition-all"
                      >
                        {copiedText === "easypaisa" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {paymentModal.method === "BANK_TRANSFER" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Bank Name:</span>
                      <strong className="text-slate-900 font-bold">{schoolData?.bank_name || "Meezan Bank Limited"}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Account Title:</span>
                      <strong className="text-slate-900">{schoolData?.bank_account_title || schoolData?.name || "School System"}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Account / IBAN:</span>
                        <strong className="text-slate-900 font-mono text-xs tracking-wider break-all">
                          {schoolData?.bank_account_number || "PK64MEZN0001020304050607"}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(schoolData?.bank_account_number || "PK64MEZN0001020304050607", "bank")}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] shadow-2xs flex items-center gap-1 transition-all ml-2 flex-shrink-0"
                      >
                        {copiedText === "bank" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter Transaction ID (TID) from SMS *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JC-992011 or 089421"
                  value={paymentModal.txnId}
                  onChange={(e) => setPaymentModal({ ...paymentModal, txnId: e.target.value })}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModal(null)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white font-bold shadow-sm"
                >
                  Verify & Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
