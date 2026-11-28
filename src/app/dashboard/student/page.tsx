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
  Shield,
  Users,
  Star,
  Megaphone,
  Search,
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
  getStudentReports,
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
  StudentReport,
  StudentReportCategory,
  StudentReportRating,
} from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import DashboardShell from "@/components/DashboardShell";
import UserSettingsTab from "@/components/UserSettingsTab";
import { SparklineGreenWave, SparklineAmberWave, MiniBarChart, SparklineBluePulse } from "@/components/MiniCharts";

export default function StudentDashboard() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();
  const { notify } = useNotifications();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "announcements" | "reports" | "attendance" | "attendance_hw" | "timetable" | "exams" | "fees" | "chat" | "settings">("overview");

  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);

  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementSearch, setAnnouncementSearch] = useState("");
  const [announcementFilter, setAnnouncementFilter] = useState<"ALL" | "URGENT" | "IMPORTANT" | "NORMAL">("ALL");
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [homeworkDateFilter, setHomeworkDateFilter] = useState<string>("ALL");
  const [customCalendarDate, setCustomCalendarDate] = useState<string>("");
  const [completedHwIds, setCompletedHwIds] = useState<string[]>([]);
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

  // Leave Note Modal State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDate, setLeaveDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [leaveReason, setLeaveReason] = useState<"Sick / Medical" | "Family Emergency" | "Urgent Work" | "Other">("Sick / Medical");
  const [leaveNote, setLeaveNote] = useState("");
  const [leaveSuccessToast, setLeaveSuccessToast] = useState<string | null>(null);

  // Chat Context Badge State ("Ask Teacher" shortcut)
  const [chatContextBadge, setChatContextBadge] = useState<{ title: string; category: "HOMEWORK" | "REMARK" } | null>(null);

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

  // ---------------------------------------------------------------------------
  // HOMEWORK DIARY DATE FILTERING & HELPERS
  // ---------------------------------------------------------------------------
  const todayDateStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const yesterdayDateStr = useMemo(() => new Date(Date.now() - 86400000).toISOString().split("T")[0], []);

  const formatHomeworkDate = (dateStr?: string) => {
    if (!dateStr) return isRtl ? "آج" : "Today";
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

  const distinctHomeworkDates = useMemo(() => {
    const dates = new Set<string>();
    homeworkList.forEach((hw) => {
      const d = hw.assigned_date || hw.created_at?.split("T")[0];
      if (d) dates.add(d);
    });
    return Array.from(dates).sort((a, b) => b.localeCompare(a));
  }, [homeworkList]);

  const todayHomeworkCount = useMemo(() => {
    return homeworkList.filter(
      (hw) => (hw.assigned_date || hw.created_at?.split("T")[0]) === todayDateStr
    ).length;
  }, [homeworkList, todayDateStr]);

  const yesterdayHomeworkCount = useMemo(() => {
    return homeworkList.filter(
      (hw) => (hw.assigned_date || hw.created_at?.split("T")[0]) === yesterdayDateStr
    ).length;
  }, [homeworkList, yesterdayDateStr]);

  const filteredHomeworkList = useMemo(() => {
    return homeworkList.filter((hw) => {
      const hwDate = hw.assigned_date || hw.created_at?.split("T")[0] || "";
      if (homeworkDateFilter === "ALL") return true;
      if (homeworkDateFilter === "TODAY") return hwDate === todayDateStr;
      if (homeworkDateFilter === "YESTERDAY") return hwDate === yesterdayDateStr;
      if (homeworkDateFilter === "CUSTOM" && customCalendarDate) {
        return hwDate === customCalendarDate;
      }
      return hwDate === homeworkDateFilter;
    });
  }, [homeworkList, homeworkDateFilter, customCalendarDate, todayDateStr, yesterdayDateStr]);

  const todayAttendance = useMemo(() => {
    const todayRec = attendanceRecords.find((r) => r.date === todayDateStr);
    if (todayRec) return todayRec;
    return attendanceRecords.length > 0 && attendanceRecords[0].date === todayDateStr
      ? attendanceRecords[0]
      : {
          status: "PRESENT" as AttendanceStatus,
          remarks: "On time (08:05 AM)",
        };
  }, [attendanceRecords, todayDateStr]);

  const unpaidFeeRecords = useMemo(() => {
    return feeRecords.filter((f) => f.status === "UNPAID");
  }, [feeRecords]);

  const totalFeeDue = useMemo(() => {
    return unpaidFeeRecords.reduce((acc, f) => acc + (f.amount || 0), 0);
  }, [unpaidFeeRecords]);

  const totalViewedHomework = filteredHomeworkList.length;
  const doneViewedHomework = filteredHomeworkList.filter((hw) => completedHwIds.includes(hw.id)).length;
  const progressPercent = totalViewedHomework > 0 ? Math.round((doneViewedHomework / totalViewedHomework) * 100) : 0;

  const todayDoneCount = homeworkList
    .filter((hw) => (hw.assigned_date || hw.created_at?.split("T")[0]) === todayDateStr)
    .filter((hw) => completedHwIds.includes(hw.id)).length;

  const toggleHomeworkDone = (hwId: string, hwTitle: string) => {
    setCompletedHwIds((prev) => {
      const isAlreadyDone = prev.includes(hwId);
      const updated = isAlreadyDone ? prev.filter((id) => id !== hwId) : [...prev, hwId];
      try {
        const studentId = currentStudent?.id || currentUser?.id || "std";
        const schoolId = currentUser?.school_id || "sch";
        localStorage.setItem(`attendlix_student_hw_done_${schoolId}_${studentId}`, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save completed homework status:", e);
      }

      notify({
        title: isAlreadyDone ? "Task Marked as Pending" : "Task Completed! 🎉",
        title_ur: isAlreadyDone ? "ٹاسک زیر التواء کر دیا گیا" : "ٹاسک مکمل ہو گیا! 🎉",
        message: `${hwTitle} is marked as ${isAlreadyDone ? "pending" : "done"}.`,
        message_ur: isAlreadyDone ? "ہوم ورک زیر التواء ہے" : "ہوم ورک کامیابی سے مکمل ہو گیا",
        type: isAlreadyDone ? "INFO" : "SUCCESS",
        category: "HOMEWORK",
        target_role: "STUDENT_PARENT",
      });

      return updated;
    });
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
      setStudentReports(getStudentReports(user.school_id, student.id));

      try {
        const savedHwDone = localStorage.getItem(`attendlix_student_hw_done_${user.school_id}_${student.id}`);
        if (savedHwDone) {
          setCompletedHwIds(JSON.parse(savedHwDone));
        }
      } catch (e) {
        console.error("Failed to parse saved completed homework:", e);
      }
    }
  };

  useEffect(() => {
    refreshData();
    const handleReportUpdate = () => {
      refreshData();
    };
    window.addEventListener("attendlix:report-added", handleReportUpdate);
    return () => {
      window.removeEventListener("attendlix:report-added", handleReportUpdate);
    };
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
    notify({
      title: "Fee Payment Recorded",
      title_ur: "فیس ادائیگی تصدیق",
      message: `PKR ${paymentModal.record.amount} confirmed as PAID for ${paymentModal.record.month} via ${paymentModal.method}.`,
      message_ur: `${paymentModal.record.month} کی فیس کامیابی سے ادا ہو گئی۔`,
      type: "SUCCESS",
      category: "FEE",
      target_role: "STUDENT_PARENT",
    });
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
    notify({
      title: "Message Sent to Teacher",
      title_ur: "استاد کو پیغام بھیج دیا گیا",
      message: `Your message has been sent to the class teacher thread.`,
      message_ur: `آپ کا میسج کلاس ٹیچر کو بھیج دیا گیا۔`,
      type: "INFO",
      category: "CHAT",
      target_role: "STUDENT_PARENT",
    });
    setNewMessageText("");
    setChatContextBadge(null);
    setChatMessages(getStudentMessages(currentUser.school_id, currentStudent.id));
  };

  const handleAskTeacherAboutHomework = (hw: Homework) => {
    const defaultText = isRtl
      ? `محترم استاد، مجھے ${hw.subject} کے ہوم ورک "${hw.title}" کے بارے میں سوال ہے: `
      : `Respected Teacher, I have a question regarding the ${hw.subject} homework "${hw.title}": `;
    setNewMessageText(defaultText);
    setChatContextBadge({
      title: `${hw.subject}: ${hw.title}`,
      category: "HOMEWORK",
    });
    setActiveTab("chat");
  };

  const handleAskTeacherAboutRemark = (rep: StudentReport) => {
    const categoryName = {
      ACADEMIC: "Academic Progress",
      PARTICIPATION: "Class Participation",
      BEHAVIOUR: "Discipline & Conduct",
      GENERAL: "General Note",
    }[rep.category] || "Teacher Remark";

    const defaultText = isRtl
      ? `محترم استاد، آپ کے مشاہدے (${categoryName}) کے بارے میں سوال ہے: `
      : `Respected ${rep.teacher_name || "Teacher"}, regarding your remark on ${categoryName} ("${rep.remarks.slice(0, 45)}${rep.remarks.length > 45 ? "..." : ""}"): `;
    setNewMessageText(defaultText);
    setChatContextBadge({
      title: `${categoryName}: "${rep.remarks.slice(0, 30)}..."`,
      category: "REMARK",
    });
    setActiveTab("chat");
  };

  const handleSendLeaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentStudent) return;

    const formattedLeaveMessage = `📋 [LEAVE / ABSENCE NOTE]\n📅 Date: ${leaveDate}\n📌 Reason: ${leaveReason}${leaveNote.trim() ? `\n📝 Details: "${leaveNote.trim()}"` : ""}\n👤 Student: ${currentStudent.name} (Roll #${currentStudent.roll_no})\n✉️ Submitted by: ${currentUser.name} (Parent)`;

    sendTeacherMessage(
      currentUser.school_id,
      currentStudent.id,
      currentStudent.name,
      formattedLeaveMessage,
      "PARENT"
    );

    setChatMessages(getStudentMessages(currentUser.school_id, currentStudent.id));

    notify({
      title: "Leave Note Sent to Teacher",
      title_ur: "رخصت کا نوٹ استاد کو ارسال کر دیا گیا",
      message: `Leave note for ${leaveDate} (${leaveReason}) has been recorded and sent to class teacher.`,
      message_ur: `${leaveDate} کے لیے رخصت کا نوٹ کلاس ٹیچر کو بھیج دیا گیا۔`,
      type: "SUCCESS",
      category: "ATTENDANCE",
      target_role: "STUDENT_PARENT",
    });

    notify({
      title: "New Leave / Absence Note Received",
      title_ur: "رخصت کا نیا نوٹ موصول ہوا",
      message: `${currentStudent.name} (Roll #${currentStudent.roll_no}) reported absent/leave for ${leaveDate}: ${leaveReason}.`,
      message_ur: `${currentStudent.name} نے ${leaveDate} کے لیے رخصت کی اطلاع دی ہے۔`,
      type: "INFO",
      category: "ATTENDANCE",
      target_role: "TEACHER",
    });

    setLeaveSuccessToast(`✓ Leave note for ${leaveDate} sent to class teacher!`);
    setTimeout(() => setLeaveSuccessToast(null), 6000);
    setShowLeaveModal(false);
    setLeaveNote("");
  };

  // Filtered school announcements for dedicated tab
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesPriority = announcementFilter === "ALL" || ann.priority === announcementFilter;
      const q = announcementSearch.toLowerCase().trim();
      const matchesQuery = !q || ann.title.toLowerCase().includes(q) || ann.content.toLowerCase().includes(q);
      return matchesPriority && matchesQuery;
    });
  }, [announcements, announcementFilter, announcementSearch]);

  const studentNavItems = [
    { id: "overview", label: t.tabOverview || "Overview & Profile", icon: School },
    { id: "announcements", label: isRtl ? "سرکاری اعلانات" : "Announcements", icon: Megaphone, badge: announcements.length > 0 ? announcements.length : undefined },
    { id: "reports", label: isRtl ? "اساتذہ کی رپورٹس" : "Teacher Remarks", icon: FileText, badge: studentReports.length > 0 ? studentReports.length : undefined },
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

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & ANNOUNCEMENTS */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Student Profile Card (Rendered ONLY on Overview) */}
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
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-right transition-colors cursor-pointer"
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
            {/* Today's Snapshot Quick Action Strip */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                    <span>{isRtl ? "آج کا خلاصہ" : "Today's Snapshot"}</span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      • {new Date().toLocaleDateString(isRtl ? "ur-PK" : "en-PK", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {isRtl ? "فوری رسائی (1-Tap)" : "1-Tap Quick Actions"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Card 1: Today's Attendance -> switches to attendance */}
                <div
                  onClick={() => setActiveTab("attendance")}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group active:scale-[0.99] space-y-2 relative overflow-hidden"
                  title={isRtl ? "مکمل حاضری ریکارڈ کھولنے کے لیے کلک کریں" : "Click to view full attendance record"}
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {isRtl ? "آج کی حاضری" : "Today's Attendance"}
                    </span>
                    <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 transition-colors">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {todayAttendance.status === "PRESENT" ? (
                        <span className="text-emerald-700">{isRtl ? "حاضر — 08:05 AM" : "Present — 08:05 AM"}</span>
                      ) : todayAttendance.status === "LATE" ? (
                        <span className="text-amber-600">{isRtl ? "تاخیر — 08:24 AM" : "Late — 08:24 AM"}</span>
                      ) : todayAttendance.status === "ABSENT" ? (
                        <span className="text-rose-600">{isRtl ? "غیر حاضر" : "Absent"}</span>
                      ) : todayAttendance.status === "LEAVE" ? (
                        <span className="text-blue-600">{isRtl ? "رخصت پر" : "On Leave"}</span>
                      ) : (
                        <span className="text-slate-500">{isRtl ? "زیر جائزہ" : "Not Marked Yet"}</span>
                      )}
                    </div>
                    <SparklineGreenWave className="w-16 h-6 flex-shrink-0" />
                  </div>

                  <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="truncate">
                      {todayAttendance.status === "PRESENT"
                        ? isRtl ? "وقت پر آمد" : "On-Time Arrival"
                        : todayAttendance.status === "LATE"
                        ? isRtl ? "تاخیر سے آمد" : "Late Check-in"
                        : todayAttendance.status === "ABSENT"
                        ? isRtl ? "غیر حاضری الرٹ" : "No Attendance"
                        : isRtl ? "گیٹ حاضری لاگ" : "Gate Entry Log"}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0">
                      <span>{isRtl ? "ریکارڈ دیکھیں" : "View Record"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Card 2: Today's Homework -> switches to attendance_hw filtered to TODAY */}
                <div
                  onClick={() => {
                    setHomeworkDateFilter("TODAY");
                    setCustomCalendarDate("");
                    setActiveTab("attendance_hw");
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group active:scale-[0.99] space-y-2 relative overflow-hidden"
                  title={isRtl ? "آج کا ہوم ورک دیکھنے کے لیے کلک کریں" : "Click to view today's homework"}
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {isRtl ? "آج کا ہوم ورک" : "Today's Homework"}
                    </span>
                    <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {todayHomeworkCount > 0 ? (
                        <span>
                          {todayHomeworkCount} {todayHomeworkCount === 1 ? (isRtl ? "ٹاسک آج" : "Task Today") : (isRtl ? "ٹاسکس آج" : "Tasks Today")}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-lg sm:text-xl font-bold">
                          {isRtl ? "کوئی ٹاسک نہیں" : "No Tasks Today"}
                        </span>
                      )}
                    </div>
                    <MiniBarChart className="w-14 h-6 flex-shrink-0" />
                  </div>

                  <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="truncate">
                      {todayHomeworkCount > 0 && todayDoneCount > 0
                        ? `${todayDoneCount}/${todayHomeworkCount} ${isRtl ? "مکمل شدہ" : "Completed"}`
                        : isRtl ? "آج کی ڈائری" : "Teacher Assigned"}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0">
                      <span>{isRtl ? "ڈائری کھولیں" : "Open Diary"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Card 3: Fee Status -> switches to fees */}
                <div
                  onClick={() => setActiveTab("fees")}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group active:scale-[0.99] space-y-2 relative overflow-hidden"
                  title={isRtl ? "اسکول فیس کی تفصیلات کے لیے کلک کریں" : "Click to view and pay school fees"}
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {isRtl ? "فیس کی صورتحال" : "Fee Status"}
                    </span>
                    <div className="p-1.5 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-100 transition-colors">
                      <CreditCard className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {totalFeeDue === 0 ? (
                        <span className="text-emerald-700">Paid ✓</span>
                      ) : (
                        <span className="text-amber-600">PKR {totalFeeDue.toLocaleString()} Due</span>
                      )}
                    </div>
                    <SparklineAmberWave className="w-16 h-6 flex-shrink-0" />
                  </div>

                  <div className="text-xs text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="truncate">
                      {totalFeeDue === 0
                        ? isRtl ? "تمام واجبات کلیئر ہیں" : "All Dues Cleared"
                        : "Via JazzCash / Easypaisa"}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all flex-shrink-0">
                      <span>{isRtl ? "فیس تفصیل" : "Fee Details"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Remarks & Student Reports */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>{isRtl ? "اساتذہ کی آراء اور رپورٹس" : "Teacher Remarks & Progress Reports"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("reports")}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>{isRtl ? "تمام رپورٹس دیکھیں" : "View All Reports"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {studentReports.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500 shadow-2xs">
                  {isRtl
                    ? "اساتذہ کی طرف سے ابھی کوئی مشاہدہ درج نہیں ہوا۔"
                    : "No teacher remarks recorded yet for this session."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {studentReports.slice(0, 2).map((rep) => {
                    const catMap = {
                      ACADEMIC: { label: "Academic Progress", labelUr: "تعلیمی کارکردگی", color: "bg-blue-50 text-blue-700 border-blue-200" },
                      PARTICIPATION: { label: "Class Participation", labelUr: "کلاس میں شرکت", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                      BEHAVIOUR: { label: "Discipline & Conduct", labelUr: "نظم و ضبط و اخلاق", color: "bg-purple-50 text-purple-700 border-purple-200" },
                      GENERAL: { label: "General Note", labelUr: "عمومی نوٹ", color: "bg-slate-50 text-slate-700 border-slate-200" },
                    }[rep.category] || { label: "General Note", labelUr: "عمومی نوٹ", color: "bg-slate-50 text-slate-700 border-slate-200" };

                    const ratingMap = {
                      EXCELLENT: { label: "⭐ Excellent", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
                      GOOD: { label: "👍 Good", color: "bg-blue-100 text-blue-800 border-blue-300" },
                      NEEDS_ATTENTION: { label: "⚠️ Needs Attention", color: "bg-amber-100 text-amber-800 border-amber-300" },
                      NEEDS_PRACTICE: { label: "🎯 Needs Practice", color: "bg-purple-100 text-purple-800 border-purple-300" },
                    }[rep.rating || "GOOD"] || { label: "Note", color: "bg-slate-100 text-slate-800 border-slate-300" };

                    return (
                      <div
                        key={rep.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMap.color}`}>
                              {isRtl ? catMap.labelUr : catMap.label}
                            </span>
                            {rep.rating && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ratingMap.color}`}>
                                {ratingMap.label}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 font-sans leading-relaxed italic">
                            "{rep.remarks}"
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                          <span className="font-semibold text-slate-800">
                            {rep.teacher_name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAskTeacherAboutRemark(rep)}
                            className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-900 transition-colors cursor-pointer"
                            title={isRtl ? "استاد سے پوچھیں" : "Ask Teacher"}
                          >
                            <MessageSquare className="w-3 h-3 text-indigo-600" />
                            <span>{isRtl ? "استاد سے پوچھیں" : "Ask Teacher"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* School Announcements - Compact Highlight Strip on Overview */}
            {announcements.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      {isRtl ? "اسکول اعلانات" : "Official Announcements"}
                    </span>
                    <p className="text-xs text-slate-600">
                      {isRtl ? "فی الوقت کوئی نیا اعلان موجود نہیں ہے۔" : "No active school circulars or announcements at this time."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("announcements")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition-all flex-shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>{isRtl ? "تمام اعلانات دیکھیں ←" : "View All Announcements →"}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white border border-emerald-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                        {isRtl ? "تازہ ترین اسکول اعلان" : "Latest Announcement"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                          announcements[0].priority === "URGENT"
                            ? "bg-rose-100 text-rose-800 border-rose-300"
                            : announcements[0].priority === "IMPORTANT"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}
                      >
                        {announcements[0].priority === "URGENT"
                          ? `🚨 ${t.priorityUrgent || "URGENT"}`
                          : announcements[0].priority === "IMPORTANT"
                          ? `⚡ ${t.priorityImportant || "IMPORTANT"}`
                          : `📢 ${t.priorityNormal || "NORMAL"}`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(announcements[0].created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate mt-0.5 max-w-xl">
                      {announcements[0].title} — <span className="font-normal text-slate-600">{announcements[0].content}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("announcements")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-2xs transition-all flex-shrink-0 self-start sm:self-auto cursor-pointer"
                >
                  <span>{isRtl ? "تمام اعلانات دیکھیں ←" : "View All Announcements →"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1A: OFFICIAL SCHOOL ANNOUNCEMENTS & CIRCULARS */}
        {/* ========================================================================= */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-emerald-600" />
                  <span>{isRtl ? "سرکاری اسکول اعلانات اور نوٹسز" : "School Announcements & Circulars"}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {isRtl
                    ? "اسکول انتظامیہ کی طرف سے طلباء اور والدین کے لیے جاری کردہ سرکاری نوٹسز اور تعطیلات کی تفصیلات۔"
                    : "Official circulars, holiday notices, and important school alerts broadcasted to students and parents."}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{announcements.length} {isRtl ? "کل اعلانات" : "Total Notices"}</span>
                </span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={announcementSearch}
                    onChange={(e) => setAnnouncementSearch(e.target.value)}
                    placeholder={isRtl ? "عنوان یا مواد سے تلاش کریں..." : "Search circulars by title or keyword..."}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                  {announcementSearch && (
                    <button
                      type="button"
                      onClick={() => setAnnouncementSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Priority Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0 scrollbar-none">
                  {(["ALL", "URGENT", "IMPORTANT", "NORMAL"] as const).map((p) => {
                    const active = announcementFilter === p;
                    const count = p === "ALL" ? announcements.length : announcements.filter((a) => a.priority === p).length;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAnnouncementFilter(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                          active
                            ? "bg-[#0B3B2E] text-white shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <span>
                          {p === "ALL"
                            ? isRtl ? "تمام" : "All"
                            : p === "URGENT"
                            ? `🚨 ${t.priorityUrgent || "Urgent"}`
                            : p === "IMPORTANT"
                            ? `⚡ ${t.priorityImportant || "Important"}`
                            : `📢 ${t.priorityNormal || "Normal"}`}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Announcements List Feed */}
            {filteredAnnouncements.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Megaphone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  {isRtl ? "کوئی اعلان نہیں ملا" : "No Announcements Found"}
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {isRtl
                    ? "آپ کے منتخب کردہ فلٹر یا تلاش کے مطابق کوئی اعلان موجود نہیں۔"
                    : "No notices match your active priority filter or search keyword."}
                </p>
                {(announcementSearch || announcementFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnnouncementSearch("");
                      setAnnouncementFilter("ALL");
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline mt-2"
                  >
                    {isRtl ? "فلٹرز صاف کریں" : "Clear filters"}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-4 sm:p-5 rounded-2xl bg-white border shadow-2xs space-y-3 transition-all hover:shadow-xs ${
                      ann.priority === "URGENT"
                        ? "border-rose-300 ring-1 ring-rose-200 bg-rose-50/15"
                        : ann.priority === "IMPORTANT"
                        ? "border-amber-300 ring-1 ring-amber-100 bg-amber-50/15"
                        : "border-slate-200/90"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {ann.title}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
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

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {isRtl ? "طلباء اور والدین" : "Students & Parents"}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(ann.created_at).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                      {ann.content}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Broadcasted via WhatsApp & Attendlix Portal</span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                        Ref #{ann.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1B: TEACHER REMARKS & PROGRESS REPORTS */}
        {/* ========================================================================= */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>{isRtl ? "اساتذہ کی رپورٹس اور تفصیلی ریمارکس" : "Teacher Remarks & Student Reports"}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {isRtl
                    ? "اساتذہ کی طرف سے طالب علم کی کارکردگی اور اخلاق کے بارے میں درج کردہ نوٹس۔"
                    : "Feedback, study habit observations, and behavioral feedback recorded by class teachers."}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                {studentReports.length} {isRtl ? "رپورٹس موجود ہیں" : "Reports Recorded"}
              </span>
            </div>

            {studentReports.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-2xs">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-bold text-xs text-slate-700">
                  {isRtl ? "کوئی رپورٹ موجود نہیں" : "No Teacher Remarks Recorded Yet"}
                </div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isRtl
                    ? "جب اساتذہ طالب علم کے بارے میں ریمارکس درج کریں گے تو وہ یہاں نظر آئیں گے۔"
                    : "Teacher observations on class participation, test readiness, and homework habits will appear here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentReports.map((rep) => {
                  const catMap = {
                    ACADEMIC: { label: "Academic Progress", labelUr: "تعلیمی کارکردگی", color: "bg-blue-50 text-blue-700 border-blue-200" },
                    PARTICIPATION: { label: "Class Participation", labelUr: "کلاس میں شرکت", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    BEHAVIOUR: { label: "Discipline & Conduct", labelUr: "نظم و ضبط و اخلاق", color: "bg-purple-50 text-purple-700 border-purple-200" },
                    GENERAL: { label: "General Note", labelUr: "عمومی نوٹ", color: "bg-slate-50 text-slate-700 border-slate-200" },
                  }[rep.category] || { label: "General Note", labelUr: "عمومی نوٹ", color: "bg-slate-50 text-slate-700 border-slate-200" };

                  const ratingMap = {
                    EXCELLENT: { label: "⭐ Excellent", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
                    GOOD: { label: "👍 Good", color: "bg-blue-100 text-blue-800 border-blue-300" },
                    NEEDS_ATTENTION: { label: "⚠️ Needs Attention", color: "bg-amber-100 text-amber-800 border-amber-300" },
                    NEEDS_PRACTICE: { label: "🎯 Needs Practice", color: "bg-purple-100 text-purple-800 border-purple-300" },
                  }[rep.rating || "GOOD"] || { label: "Note", color: "bg-slate-100 text-slate-800 border-slate-300" };

                  return (
                    <div
                      key={rep.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catMap.color}`}>
                            {isRtl ? catMap.labelUr : catMap.label}
                          </span>
                          {rep.rating && (
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${ratingMap.color}`}>
                              {ratingMap.label}
                            </span>
                          )}
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 text-slate-800 text-xs sm:text-sm font-sans leading-relaxed">
                          "{rep.remarks}"
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <span>Teacher:</span>
                            <span className="text-emerald-800 font-bold">{rep.teacher_name}</span>
                          </span>
                          <span className="text-slate-400 font-medium text-[11px]">
                            • {new Date(rep.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAskTeacherAboutRemark(rep)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 transition-all shadow-2xs active:scale-95 cursor-pointer"
                          title={isRtl ? "استاد سے اس رپورٹ کے بارے میں پوچھیں" : "Ask teacher about this remark"}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{isRtl ? "استاد سے پوچھیں" : "Ask Teacher"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2A: COMPLETE DATE-WISE ATTENDANCE LOG */}
        {/* ========================================================================= */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            {/* Header with Title, Leave Action & Quick Switch */}
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

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0B3B2E] hover:bg-[#082C22] text-white shadow-2xs transition-all active:scale-95 cursor-pointer"
                  title={isRtl ? "اساتذہ کو رخصت کی اطلاع بھیجیں" : "Inform teacher of leave or absence"}
                >
                  <Send className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isRtl ? "اساتذہ کو مطلع کریں / رخصت نوٹ" : "Inform Teacher / Leave Note"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("attendance_hw")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isRtl ? "ہوم ورک ڈائری دیکھیں" : "View Homework Diary"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Leave Success Alert */}
            {leaveSuccessToast && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{leaveSuccessToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className="text-[11px] font-bold text-emerald-900 underline hover:text-emerald-700 ml-2 shrink-0 cursor-pointer"
                >
                  {isRtl ? "چیٹ تھریڈ دیکھیں →" : "View in Chat →"}
                </button>
              </div>
            )}

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
                    ? "اساتذہ کی طرف سے تفویض کردہ ہوم ورک اور تدریسی اسائنمنٹس"
                    : "Subject assignments, instructions, and learning tasks assigned by teachers."}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                {/* Lightweight Progress Summary Pill */}
                {totalViewedHomework > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{isRtl ? "پیش رفت:" : "Progress:"}</span>
                    <span className="font-extrabold text-emerald-950">
                      {doneViewedHomework} / {totalViewedHomework} {isRtl ? "مکمل" : "Done"}
                    </span>
                    <div className="w-12 sm:w-16 h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                      {progressPercent}%
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("attendance")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isRtl ? "مکمل حاضری ریکارڈ دیکھیں" : "View Attendance Log"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Date Filter & Calendar Picker Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Quick Filters */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRtl ? "فلٹر:" : "Filter:"}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setHomeworkDateFilter("ALL");
                      setCustomCalendarDate("");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      homeworkDateFilter === "ALL" && !customCalendarDate
                        ? "bg-emerald-800 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{isRtl ? "تمام تاریخیں" : "All Dates"}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        homeworkDateFilter === "ALL" && !customCalendarDate
                          ? "bg-emerald-900/60 text-white"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {homeworkList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHomeworkDateFilter("TODAY");
                      setCustomCalendarDate("");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      homeworkDateFilter === "TODAY" && !customCalendarDate
                        ? "bg-emerald-800 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{isRtl ? "آج" : "Today"}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        homeworkDateFilter === "TODAY" && !customCalendarDate
                          ? "bg-emerald-900/60 text-white"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {todayHomeworkCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHomeworkDateFilter("YESTERDAY");
                      setCustomCalendarDate("");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      homeworkDateFilter === "YESTERDAY" && !customCalendarDate
                        ? "bg-emerald-800 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>{isRtl ? "گزشتہ کل" : "Yesterday"}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        homeworkDateFilter === "YESTERDAY" && !customCalendarDate
                          ? "bg-emerald-900/60 text-white"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {yesterdayHomeworkCount}
                    </span>
                  </button>
                </div>

                {/* Dropdown & Native Calendar Picker */}
                <div className="flex items-center flex-wrap sm:flex-nowrap gap-2">
                  <div className="relative min-w-[170px]">
                    <select
                      value={
                        homeworkDateFilter === "ALL" ||
                        homeworkDateFilter === "TODAY" ||
                        homeworkDateFilter === "YESTERDAY" ||
                        homeworkDateFilter === "CUSTOM"
                          ? homeworkDateFilter
                          : homeworkDateFilter
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setHomeworkDateFilter(val);
                        setCustomCalendarDate("");
                      }}
                      className="w-full pl-3 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
                    >
                      <option value="ALL">{isRtl ? "تمام تاریخیں (All Dates)" : "📅 All Dates"}</option>
                      <option value="TODAY">{isRtl ? `آج (${todayDateStr})` : `📅 Today (${todayDateStr})`}</option>
                      <option value="YESTERDAY">{isRtl ? `گزشتہ کل (${yesterdayDateStr})` : `📅 Yesterday (${yesterdayDateStr})`}</option>
                      {distinctHomeworkDates
                        .filter((d) => d !== todayDateStr && d !== yesterdayDateStr)
                        .map((d) => (
                          <option key={d} value={d}>
                            📅 {formatHomeworkDate(d)}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Native Calendar Picker Input */}
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <input
                      type="date"
                      value={customCalendarDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomCalendarDate(val);
                        if (val) {
                          setHomeworkDateFilter("CUSTOM");
                        }
                      }}
                      className="text-xs bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
                      title={isRtl ? "کیلنڈر سے تاریخ منتخب کریں" : "Pick specific date from calendar"}
                    />
                    {customCalendarDate && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomCalendarDate("");
                          setHomeworkDateFilter("ALL");
                        }}
                        className="text-slate-400 hover:text-slate-600 text-[11px] font-bold px-1"
                        title="Clear date filter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Filter Status */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>
                    {homeworkDateFilter === "ALL" && !customCalendarDate
                      ? isRtl
                        ? "تمام تفویض کردہ ہوم ورک ڈائری دکھائی جا رہی ہے"
                        : "Showing all assigned homework tasks across all dates"
                      : homeworkDateFilter === "TODAY"
                      ? isRtl
                        ? `آج کا تفویض کردہ ہوم ورک (${formatHomeworkDate(todayDateStr)})`
                        : `Showing homework assigned Today (${formatHomeworkDate(todayDateStr)})`
                      : homeworkDateFilter === "YESTERDAY"
                      ? isRtl
                        ? `گزشتہ کل کا تفویض کردہ ہوم ورک (${formatHomeworkDate(yesterdayDateStr)})`
                        : `Showing homework assigned Yesterday (${formatHomeworkDate(yesterdayDateStr)})`
                      : isRtl
                      ? `منتخب کردہ تاریخ کا ہوم ورک (${formatHomeworkDate(customCalendarDate || homeworkDateFilter)})`
                      : `Showing homework assigned on ${formatHomeworkDate(customCalendarDate || homeworkDateFilter)}`}
                  </span>
                </span>
                <span className="font-bold text-slate-700">
                  {filteredHomeworkList.length}{" "}
                  {filteredHomeworkList.length === 1
                    ? isRtl
                      ? "اسائنمنٹ"
                      : "assignment"
                    : isRtl
                    ? "اسائنمنٹس"
                    : "assignments"}
                </span>
              </div>
            </div>

            {/* Daily Homework Cards */}
            <div className="space-y-3">
              {filteredHomeworkList.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white border border-slate-200/80 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isRtl ? "اس تاریخ پر کوئی ہوم ورک نہیں دیا گیا" : "No Homework Assigned on This Date"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {isRtl
                        ? "منتخب کردہ تاریخ کے لیے آپ کی کلاس میں کوئی ہوم ورک ریکارڈ نہیں ملا۔"
                        : `No homework tasks were assigned on ${formatHomeworkDate(
                            customCalendarDate ||
                              (homeworkDateFilter === "TODAY"
                                ? todayDateStr
                                : homeworkDateFilter === "YESTERDAY"
                                ? yesterdayDateStr
                                : homeworkDateFilter)
                          )} for your class.`}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setHomeworkDateFilter("TODAY");
                        setCustomCalendarDate("");
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      {isRtl ? "آج کا ہوم ورک دیکھیں" : "Check Today's Homework"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHomeworkDateFilter("ALL");
                        setCustomCalendarDate("");
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      {isRtl ? "تمام ہوم ورک دیکھیں" : "Show All Homework"}
                    </button>
                  </div>
                </div>
              ) : (
                filteredHomeworkList.map((hw) => {
                  const isDone = completedHwIds.includes(hw.id);
                  const assignedDateFormatted = formatHomeworkDate(
                    hw.assigned_date || hw.created_at?.split("T")[0]
                  );
                  return (
                    <div
                      key={hw.id}
                      className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all space-y-3 ${
                        isDone
                          ? "border-emerald-300/80 bg-emerald-50/20 shadow-2xs"
                          : "border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          {/* Done / Pending Checkbox & Toggle Button */}
                          <button
                            type="button"
                            onClick={() => toggleHomeworkDone(hw.id, hw.title)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[36px] ${
                              isDone
                                ? "bg-emerald-700 text-white shadow-2xs hover:bg-emerald-800"
                                : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200"
                            }`}
                            title={isDone ? (isRtl ? "زیر التواء پر تبدیل کریں" : "Mark as Pending") : (isRtl ? "مکمل نشان لگائیں" : "Mark as Done")}
                          >
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all ${
                                isDone
                                  ? "bg-white text-emerald-700 border-white"
                                  : "border-slate-400 bg-white"
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>
                              {isDone
                                ? isRtl
                                  ? "مکمل شدہ ✓"
                                  : "Done ✓"
                                : isRtl
                                ? "مکمل نشان لگائیں"
                                : "Mark as Done"}
                            </span>
                          </button>

                          <span className="px-2.5 py-0.5 rounded-lg font-bold text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {hw.subject}
                          </span>

                          <h4
                            className={`font-bold text-sm sm:text-base transition-colors ${
                              isDone ? "text-emerald-950 line-through opacity-75" : "text-slate-900"
                            }`}
                          >
                            {hw.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                          {isDone && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{isRtl ? "مکمل ہو گیا" : "Completed"}</span>
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {isRtl ? "تفویض کردہ تاریخ: " : "Assigned: "}
                              {assignedDateFormatted}
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleAskTeacherAboutHomework(hw)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 transition-all shadow-2xs active:scale-95 cursor-pointer"
                            title={isRtl ? "استاد سے اس ہوم ورک کے بارے میں پوچھیں" : "Ask teacher about this homework"}
                          >
                            <MessageSquare className="w-3 h-3 text-indigo-600" />
                            <span>{isRtl ? "استاد سے پوچھیں" : "Ask Teacher"}</span>
                          </button>
                        </div>
                      </div>

                      <p
                        className={`text-xs leading-relaxed font-sans p-3 rounded-xl border transition-colors ${
                          isDone
                            ? "bg-white/80 border-emerald-100 text-slate-500"
                            : "bg-slate-50/60 border-slate-100 text-slate-600"
                        }`}
                      >
                        {hw.description}
                      </p>
                    </div>
                  );
                })
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
                  const isLeaveNote = msg.content.includes("[LEAVE / ABSENCE NOTE]");
                  return (
                    <div key={msg.id} className={`flex flex-col ${isParent ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 ${
                          isLeaveNote
                            ? "bg-amber-50 border border-amber-200 text-amber-950 rounded-br-none shadow-2xs"
                            : isParent
                            ? "bg-[#0B3B2E] text-white rounded-br-none"
                            : "bg-slate-100 text-slate-900 rounded-bl-none"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] font-bold opacity-80 mb-1">
                          <span>{isParent ? (isRtl ? "آپ (والدین)" : "You (Parent)") : (isRtl ? "کلاس ٹیچر" : "Class Teacher")}</span>
                          {isLeaveNote && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-extrabold text-[9px] uppercase tracking-wide">
                              {isRtl ? "رخصت کا نوٹ" : "Leave Note"}
                            </span>
                          )}
                        </div>
                        <p className="leading-relaxed whitespace-pre-line font-sans">{msg.content}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Input Form with Context Badge */}
              <form onSubmit={handleSendMessageToTeacher} className="p-3 border-t border-slate-100 space-y-2 bg-white">
                {chatContextBadge && (
                  <div className="p-2.5 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-900 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white shrink-0">
                        {chatContextBadge.category === "HOMEWORK" ? (isRtl ? "ہوم ورک سوال" : "Homework Query") : (isRtl ? "رپورٹ سوال" : "Remark Query")}
                      </span>
                      <span className="truncate text-slate-800">
                        {chatContextBadge.title}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setChatContextBadge(null);
                        setNewMessageText("");
                      }}
                      className="text-indigo-400 hover:text-indigo-700 text-xs font-bold px-1 cursor-pointer"
                      title="Clear context"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder={isRtl ? "کلاس ٹیچر کو پیغام لکھیں..." : "Type message to class teacher..."}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                  <button
                    type="submit"
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all flex items-center justify-center flex-shrink-0 cursor-pointer"
                    title={isRtl ? "ارسال کریں" : "Send message"}
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
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

      {/* Leave / Absence Note Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {isRtl ? "استاد کو رخصت کی اطلاع بھیجیں" : "Inform Teacher / Send Leave Note"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {currentStudent?.name} • Roll #{currentStudent?.roll_no}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-sm font-semibold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendLeaveNote} className="space-y-4 text-xs">
              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>{isRtl ? "رخصت کی تاریخ *" : "Absence / Leave Date *"}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLeaveDate(new Date().toISOString().split("T")[0])}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        leaveDate === new Date().toISOString().split("T")[0]
                          ? "bg-emerald-800 text-white border-emerald-800"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isRtl ? "آج" : "Today"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeaveDate(new Date(Date.now() + 86400000).toISOString().split("T")[0])}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        leaveDate === new Date(Date.now() + 86400000).toISOString().split("T")[0]
                          ? "bg-emerald-800 text-white border-emerald-800"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isRtl ? "کل" : "Tomorrow"}
                    </button>
                  </div>
                </label>
                <input
                  type="date"
                  required
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium cursor-pointer"
                />
              </div>

              {/* Reason Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isRtl ? "رخصت کی وجہ *" : "Reason for Leave *"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "Sick / Medical", labelEn: "Sick / Medical", labelUr: "طبی عذر / بیماری", icon: "🩺" },
                    { id: "Family Emergency", labelEn: "Family Emergency", labelUr: "خاندانی مجبوری", icon: "🚨" },
                    { id: "Urgent Work", labelEn: "Urgent Work", labelUr: "ضروری گھریلو کام", icon: "📌" },
                    { id: "Other", labelEn: "Other Reason", labelUr: "دیگر عذر", icon: "📝" },
                  ].map((r) => {
                    const isSelected = leaveReason === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setLeaveReason(r.id as any)}
                        className={`p-2.5 rounded-xl text-left flex items-center gap-2 border font-semibold text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-2xs"
                            : "bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-sm">{r.icon}</span>
                        <span className="truncate">{isRtl ? r.labelUr : r.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note / Details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? "مختصر وضاحت (اختیاری)" : "Brief Details / Doctor Note (Optional)"}
                </label>
                <textarea
                  rows={3}
                  value={leaveNote}
                  onChange={(e) => setLeaveNote(e.target.value)}
                  placeholder={
                    isRtl
                      ? "مثال کے طور پر: تیز بخار ہے، ڈاکٹر نے ایک دن آرام کا مشورہ دیا ہے..."
                      : "e.g., Doctor advised 1-day rest due to flu. Will attend school tomorrow..."
                  }
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                />
              </div>

              {/* Info Callout */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <span className="text-emerald-600 font-bold text-xs mt-0.5">ℹ</span>
                <span>
                  {isRtl
                    ? "یہ نوٹ براہ راست کلاس ٹیچر کے چیٹ تھریڈ میں بھیج دیا جائے گا اور استاد کو الرٹ موصول ہوگا۔"
                    : "This will post directly into the class Teacher Chat thread and notify the teacher instantly."}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isRtl ? "منسوخ کریں" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isRtl ? "نوٹ ارسال کریں" : "Send Leave Note"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
