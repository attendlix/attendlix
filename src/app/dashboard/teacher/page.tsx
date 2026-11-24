"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  CalendarCheck,
  BookOpen,
  FileCheck2,
  MessageSquare,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Plus,
  Share2,
  ChevronDown,
  ChevronRight,
  LogOut,
  Users,
  Check,
  HelpCircle,
  Award,
  LogIn,
  UserCheck,
  Settings,
  Eye,
  Calendar,
  Filter,
} from "lucide-react";
import {
  getCurrentUser,
  getSchool,
  getClasses,
  getStudents,
  getDailyAttendance,
  saveClassAttendance,
  getOfflineAttendanceQueue,
  syncOfflineAttendanceQueue,
  getHomeworkList,
  addHomework,
  getExamMarks,
  saveExamMarksBatch,
  getStudentMessages,
  sendTeacherMessage,
  isQuietHoursActive,
  getTeacherTimetable,
  getStaffTodayRecord,
  getStaffAttendanceHistory,
  calculateStaffDuration,
  teacherCheckIn,
  teacherCheckOut,
  getAnnouncementsForAudience,
  DAYS_ORDER,
  logout,
} from "@/lib/store";
import { User, SchoolClass, Student, AttendanceStatus, Homework, ExamMark, ChatMessage, TimetableSlot, DayOfWeek, StaffAttendanceRecord, StaffAttendanceStatus, Announcement } from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";
import DashboardShell from "@/components/DashboardShell";
import UserSettingsTab from "@/components/UserSettingsTab";
import StudentProfileModal from "@/components/StudentProfileModal";
import { SparklineGreenWave, SparklineBluePulse, MiniBarChart, SparklineAmberWave } from "@/components/MiniCharts";
import { getAbsentAlertWhatsAppUrl, dispatchWhatsAppWebhook } from "@/lib/whatsapp";

export default function TeacherDashboard() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<"attendance" | "my_attendance" | "homework" | "timetable" | "exams" | "messages" | "settings">("attendance");

  // User and Class context
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [classesList, setClassesList] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Timetable State
  const [teacherSchedule, setTeacherSchedule] = useState<TimetableSlot[]>([]);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<DayOfWeek | "ALL">("ALL");

  // Connectivity & Offline mode
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Tab 1: Attendance State (Students Roll-Call)
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceSavedNotice, setAttendanceSavedNotice] = useState<string | null>(null);

  // Teacher's Own Staff Attendance History State
  const [teacherStaffHistory, setTeacherStaffHistory] = useState<StaffAttendanceRecord[]>([]);
  const [teacherAttMonthFilter, setTeacherAttMonthFilter] = useState<string>("ALL");
  const [teacherAttStatusFilter, setTeacherAttStatusFilter] = useState<"ALL" | "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE">("ALL");

  // Tab 2: Homework State
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [showHwForm, setShowHwForm] = useState(false);
  const [hwFormData, setHwFormData] = useState({
    subject: "Mathematics",
    title: "",
    description: "",
    due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  });
  const [hwSuccessNotice, setHwSuccessNotice] = useState<string | null>(null);

  // Tab 3: Exams & Marks State
  const [examName, setExamName] = useState("Monthly Test (October)");
  const [examSubject, setExamSubject] = useState("Mathematics");
  const [examTotalMarks, setExamTotalMarks] = useState<number>(50);
  const [marksInputMap, setMarksInputMap] = useState<Record<string, number>>({});
  const [marksSavedNotice, setMarksSavedNotice] = useState<string | null>(null);

  // Tab 4: Messages State
  const [selectedStudentForChat, setSelectedStudentForChat] = useState<Student | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [quietHoursInfo, setQuietHoursInfo] = useState({ isActive: false, hoursText: "8:00 PM – 7:00 AM" });

  // Staff Check-In / Check-Out State
  const [todayStaffRecord, setTodayStaffRecord] = useState<StaffAttendanceRecord | null>(null);
  const [checkInNotice, setCheckInNotice] = useState<string | null>(null);

  // Initialize and load context
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    const sch = getSchool(user.school_id);
    setSchoolData(sch);

    // Load school circulars for staff & teachers
    setAnnouncements(getAnnouncementsForAudience(user.school_id, "TEACHER"));

    // Load teacher's timetable schedule
    setTeacherSchedule(getTeacherTimetable(user.school_id, user.id));

    // Load staff daily check-in / check-out record and history
    const staffRec = getStaffTodayRecord(user.school_id, user.id);
    setTodayStaffRecord(staffRec);
    setTeacherStaffHistory(getStaffAttendanceHistory(user.school_id, user.id));

    const classes = getClasses(user.school_id);
    setClassesList(classes);
    if (classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }

    // Check online status
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        handleAutoSync();
      };
      const handleOffline = () => setIsOnline(false);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      setQuietHoursInfo(isQuietHoursActive());
      updateQueueCount();

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Update students when selected class changes
  useEffect(() => {
    if (!selectedClassId || !currentUser) return;
    const allStudents = getStudents(currentUser.school_id);
    const filtered = allStudents.filter((s) => s.class_id === selectedClassId);
    setClassStudents(filtered);

    // Initialize Attendance map with existing or default all to PRESENT
    const existing = getDailyAttendance(currentUser.school_id, selectedClassId, selectedDate);
    const map: Record<string, AttendanceStatus> = {};
    filtered.forEach((st) => {
      map[st.id] = existing[st.id] || "PRESENT"; // Default all to Present
    });
    setAttendanceMap(map);

    // Load Homework
    const hw = getHomeworkList(currentUser.school_id, selectedClassId);
    setHomeworkList(hw);

    // Load Exam marks
    const existingMarks = getExamMarks(currentUser.school_id, selectedClassId, examName, examSubject);
    const marksMap: Record<string, number> = {};
    filtered.forEach((st) => {
      const found = existingMarks.find((m) => m.student_id === st.id);
      marksMap[st.id] = found ? found.obtained_marks : 40; // Default sensible score
    });
    setMarksInputMap(marksMap);

    // Set default chat student
    if (filtered.length > 0) {
      setSelectedStudentForChat(filtered[0]);
    }
  }, [selectedClassId, selectedDate, currentUser]);

  // Load chat messages when selected chat student changes
  useEffect(() => {
    if (!currentUser || !selectedStudentForChat) return;
    const msgs = getStudentMessages(currentUser.school_id, selectedStudentForChat.id);
    setChatMessages(msgs);
  }, [selectedStudentForChat, currentUser]);

  const updateQueueCount = () => {
    const queue = getOfflineAttendanceQueue();
    setOfflineQueueCount(queue.length);
  };

  const handleAutoSync = () => {
    const result = syncOfflineAttendanceQueue();
    updateQueueCount();
    if (result.syncedBatches > 0) {
      setSyncStatusMessage(`✓ Synced ${result.totalRecords} attendance records to cloud!`);
      setTimeout(() => setSyncStatusMessage(null), 5000);
    }
  };

  // Toggle Attendance status for a student: PRESENT -> ABSENT -> LEAVE
  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Save Attendance
  const handleSaveAttendance = () => {
    if (!currentUser || !selectedClassId) return;

    const records = classStudents.map((st) => ({
      student_id: st.id,
      student_name: st.name,
      roll_no: st.roll_no,
      status: attendanceMap[st.id] || "PRESENT",
    }));

    const result = saveClassAttendance(currentUser.school_id, selectedClassId, selectedDate, records, !isOnline);
    updateQueueCount();

    if (result.isOffline) {
      setAttendanceSavedNotice(
        `⚡ Saved Offline! ${result.savedCount} records queued locally. Will auto-sync when network returns.`
      );
    } else {
      setAttendanceSavedNotice(
        `✓ Attendance Saved! ${result.savedCount - result.absentCount} Present, ${result.absentCount} Absent. Automated WhatsApp alert triggered for absent parents.`
      );
    }
    setTimeout(() => setAttendanceSavedNotice(null), 6000);
  };

  // Create Homework
  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedClassId) return;

    addHomework(currentUser.school_id, selectedClassId, {
      ...hwFormData,
      teacher_id: currentUser.id,
    });

    const updated = getHomeworkList(currentUser.school_id, selectedClassId);
    setHomeworkList(updated);
    setShowHwForm(false);
    setHwFormData({
      subject: "Mathematics",
      title: "",
      description: "",
      due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    });
    setHwSuccessNotice("✓ Homework posted successfully! Parents notified via portal.");
    setTimeout(() => setHwSuccessNotice(null), 5000);
  };

  // Save Exam Marks
  const handleSaveMarks = () => {
    if (!currentUser || !selectedClassId) return;

    const list = classStudents.map((st) => ({
      student_id: st.id,
      student_name: st.name,
      roll_no: st.roll_no,
      obtained_marks: Number(marksInputMap[st.id] || 0),
    }));

    saveExamMarksBatch(currentUser.school_id, selectedClassId, examName, examSubject, examTotalMarks, list);
    setMarksSavedNotice(`✓ Marks saved for all ${classStudents.length} students in ${examName}!`);
    setTimeout(() => setMarksSavedNotice(null), 5000);
  };

  // Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedStudentForChat || !newMessageText.trim()) return;

    sendTeacherMessage(currentUser.school_id, selectedStudentForChat.id, selectedStudentForChat.name, newMessageText, "TEACHER");
    setNewMessageText("");
    const updated = getStudentMessages(currentUser.school_id, selectedStudentForChat.id);
    setChatMessages(updated);
  };

  // Staff Check-In & Check-Out Handlers
  const handleTeacherCheckIn = () => {
    if (!currentUser) return;
    const res = teacherCheckIn(currentUser.school_id, currentUser.id);
    if (res.success) {
      setTodayStaffRecord(res.record);
      setTeacherStaffHistory(getStaffAttendanceHistory(currentUser.school_id, currentUser.id));
      setCheckInNotice(`✓ ${t.selfCheckInSuccess || "Checked in successfully!"} (${res.record.check_in_time})`);
      setTimeout(() => setCheckInNotice(null), 5000);
    }
  };

  const handleTeacherCheckOut = () => {
    if (!currentUser) return;
    const res = teacherCheckOut(currentUser.school_id, currentUser.id);
    if (res.success) {
      setTodayStaffRecord(res.record);
      setTeacherStaffHistory(getStaffAttendanceHistory(currentUser.school_id, currentUser.id));
      setCheckInNotice(`✓ ${t.selfCheckOutSuccess || "Checked out successfully!"} (${res.record.check_out_time})`);
      setTimeout(() => setCheckInNotice(null), 5000);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // ---------------------------------------------------------------------------
  // TEACHER ATTENDANCE HISTORY HELPERS & CALCULATIONS
  // ---------------------------------------------------------------------------
  const formatTeacherAttDate = (dateStr: string) => {
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

  const availableTeacherMonths = useMemo(() => {
    const set = new Set<string>();
    teacherStaffHistory.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.slice(0, 7));
      }
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [teacherStaffHistory]);

  const formatTeacherMonthName = (yearMonth: string) => {
    if (yearMonth === "ALL") return isRtl ? "تمام مہینے (All Months)" : "All Recorded Months";
    try {
      const [y, m] = yearMonth.split("-").map(Number);
      const d = new Date(y, m - 1, 1);
      return d.toLocaleDateString(isRtl ? "ur-PK" : "en-PK", { month: "long", year: "numeric" });
    } catch {
      return yearMonth;
    }
  };

  const filteredTeacherStaffHistory = useMemo(() => {
    return teacherStaffHistory.filter((r) => {
      if (teacherAttMonthFilter !== "ALL" && !r.date.startsWith(teacherAttMonthFilter)) {
        return false;
      }
      if (teacherAttStatusFilter !== "ALL" && r.status !== teacherAttStatusFilter) {
        return false;
      }
      return true;
    });
  }, [teacherStaffHistory, teacherAttMonthFilter, teacherAttStatusFilter]);

  const recordsInMonthForTeacher = useMemo(() => {
    return teacherStaffHistory.filter((r) =>
      teacherAttMonthFilter === "ALL" ? true : r.date.startsWith(teacherAttMonthFilter)
    );
  }, [teacherStaffHistory, teacherAttMonthFilter]);

  const presentCountInMonth = recordsInMonthForTeacher.filter((r) => r.status === "PRESENT").length;
  const lateCountInMonth = recordsInMonthForTeacher.filter((r) => r.status === "LATE").length;
  const absentCountInMonth = recordsInMonthForTeacher.filter((r) => r.status === "ABSENT").length;
  const leaveCountInMonth = recordsInMonthForTeacher.filter((r) => r.status === "ON_LEAVE").length;

  const totalTeacherDays = teacherStaffHistory.length;
  const totalTeacherPresent = teacherStaffHistory.filter((r) => r.status === "PRESENT").length;
  const totalTeacherLate = teacherStaffHistory.filter((r) => r.status === "LATE").length;
  const totalTeacherAbsent = teacherStaffHistory.filter((r) => r.status === "ABSENT").length;
  const totalTeacherLeave = teacherStaffHistory.filter((r) => r.status === "ON_LEAVE").length;
  const teacherAttPercent =
    totalTeacherDays > 0
      ? Math.round(((totalTeacherPresent + totalTeacherLate) / totalTeacherDays) * 100)
      : 96;

  const renderTeacherStatusBadge = (status: StaffAttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{isRtl ? "حاضر" : "PRESENT"}</span>
          </span>
        );
      case "LATE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{isRtl ? "تاخیر" : "LATE"}</span>
          </span>
        );
      case "ABSENT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{isRtl ? "غیر حاضر" : "ABSENT"}</span>
          </span>
        );
      case "ON_LEAVE":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>{isRtl ? "رخصت" : "ON LEAVE"}</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Calculate quick attendance counts for Class Roll-Call
  const presentCount = Object.values(attendanceMap).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "ABSENT").length;
  const leaveCount = Object.values(attendanceMap).filter((s) => s === "LEAVE").length;

  const teacherNavItems = [
    { id: "attendance", label: isRtl ? "کلاس حاضری رول کال" : "Class Attendance", icon: CalendarCheck },
    { id: "my_attendance", label: isRtl ? "میری ذاتی حاضری و لاگ" : "My Attendance Log", icon: UserCheck },
    { id: "homework", label: t.tabHomework || "Homework Diary", icon: BookOpen },
    { id: "timetable", label: t.mySchedule || "My Schedule", icon: Clock },
    { id: "exams", label: t.tabExams || "Exam Marks", icon: Award },
    { id: "messages", label: t.tabChat || "Parent Messages", icon: MessageSquare },
    { id: "settings", label: t.tabSettings || "Settings", icon: Settings },
  ];

  const headerExtra = (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {/* Offline / Online Network Indicator */}
      <button
        type="button"
        onClick={() => setIsOnline(!isOnline)}
        title="Click to toggle simulated offline mode"
        className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all min-h-[36px] ${
          isOnline
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="hidden xs:inline">Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
            <span>Offline</span>
          </>
        )}
      </button>

      {/* Offline Sync Button if items queued */}
      {offlineQueueCount > 0 && (
        <button
          type="button"
          onClick={handleAutoSync}
          className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-slate-800 transition-all flex-shrink-0 min-h-[36px]"
          title="Sync offline attendance records to cloud"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sync ({offlineQueueCount})</span>
        </button>
      )}
    </div>
  );

  return (
    <DashboardShell
      currentUser={currentUser}
      schoolName={schoolData?.name || "Beacon Grammar School"}
      schoolCity={schoolData?.city || "Lahore"}
      tenantId={currentUser?.school_id}
      navItems={teacherNavItems}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as any)}
      onLogout={handleLogout}
      headerExtra={headerExtra}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Active Class Selector Card - Render only on class-based tabs */}
        {["attendance", "homework", "exams", "messages"].includes(activeTab) && (
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1 w-full sm:w-auto">
              <span className="text-[11px] font-bold uppercase text-slate-500 whitespace-nowrap flex-shrink-0 mr-1">
                Active Class:
              </span>
              {classesList.map((cls) => {
                const active = selectedClassId === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center flex-shrink-0 ${
                      active
                        ? "bg-[#0B3B2E] text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cls.name} ({cls.section})
                  </button>
                );
              })}
            </div>

            <Link
              href="/dashboard/principal"
              className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 underline whitespace-nowrap self-end sm:self-center flex-shrink-0"
            >
              Principal View →
            </Link>
          </div>
        )}

        {/* Global Sync Notification */}
        {syncStatusMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{syncStatusMessage}</span>
          </div>
        )}

        {/* Staff & School Official Circulars - Render ONLY on primary landing tab (Class Attendance) */}
        {activeTab === "attendance" && announcements.length > 0 && (
          <div className="space-y-2.5">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xs space-y-1.5 transition-all ${
                  ann.priority === "URGENT"
                    ? "bg-rose-50/80 border-rose-300 ring-1 ring-rose-200"
                    : ann.priority === "IMPORTANT"
                    ? "bg-amber-50/70 border-amber-300"
                    : "bg-white border-slate-200/90"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{ann.title}</span>
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      {ann.audience === "STAFF" || (ann.audience as any) === "TEACHERS"
                        ? "Staff & Teachers Only"
                        : "All School"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ann.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">{ann.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Check-in Notice Alert - Render on attendance views */}
        {checkInNotice && (activeTab === "attendance" || activeTab === "my_attendance") && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{checkInNotice}</span>
            </div>
            <button onClick={() => setCheckInNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">✕</button>
          </div>
        )}

        {/* Dedicated Teacher Daily Check-In / Check-Out Self-Service Card - Render on attendance views */}
        {(activeTab === "attendance" || activeTab === "my_attendance") && (
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${
                todayStaffRecord?.check_out_time
                  ? "bg-emerald-100 text-emerald-700"
                  : todayStaffRecord?.check_in_time
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-700"
              }`}>
                <UserCheck className="w-5 h-5" />
              </div>

              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{t.staffAttendanceTitle || "Daily Staff Attendance"}</span>
                  {todayStaffRecord?.status === "PRESENT" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {t.present || "Present"}
                    </span>
                  )}
                  {todayStaffRecord?.status === "LATE" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      {t.late || "Late"}
                    </span>
                  )}
                  {todayStaffRecord?.status === "ON_LEAVE" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                      {t.onLeave || "On Leave"}
                    </span>
                  )}
                  {!todayStaffRecord?.check_in_time && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {t.notCheckedInYet || "Not Checked In"}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                  {todayStaffRecord?.check_in_time ? (
                    <span>
                      <strong className="text-slate-800">{t.checkIn || "Check-In"}:</strong> {todayStaffRecord.check_in_time}
                      {todayStaffRecord.check_out_time && (
                        <> • <strong className="text-slate-800">{t.checkOut || "Check-Out"}:</strong> {todayStaffRecord.check_out_time}</>
                      )}
                    </span>
                  ) : (
                    <span>{t.schoolHoursNotice || "Morning check-in opens at 7:30 AM (Late after 8:15 AM)"}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("my_attendance")}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 min-h-[44px] shadow-2xs ${
                  activeTab === "my_attendance"
                    ? "bg-[#0B3B2E] text-white border-[#0B3B2E]"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{isRtl ? "مکمل ہسٹری لاگ" : "View History"}</span>
              </button>

              {!todayStaffRecord?.check_in_time ? (
                <button
                  type="button"
                  onClick={handleTeacherCheckIn}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.checkInNow || "Check-In Now"}</span>
                </button>
              ) : !todayStaffRecord?.check_out_time ? (
                <button
                  type="button"
                  onClick={handleTeacherCheckOut}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs hover:shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4 text-emerald-400" />
                  <span>{t.checkOutNow || "Check-Out Now"}</span>
                </button>
              ) : (
                <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-200 min-h-[44px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Shift Completed</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: 1-TAP DAILY ATTENDANCE (WITH OFFLINE FIRST QUEUE) */}
        {/* ========================================================================= */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
            {/* Elevated Stats Row for Active Class with Mini Sparklines */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Class Enrolled</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-slate-900">{classStudents.length}</div>
                  <SparklineGreenWave className="w-20 h-7" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">All students registered</div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Present Today</span>
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-emerald-700">{presentCount}</div>
                  <SparklineBluePulse className="w-20 h-7" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {classStudents.length ? Math.round((presentCount / classStudents.length) * 100) : 0}% Attendance Rate
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Absences & Leaves</span>
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-extrabold text-rose-600">{absentCount + leaveCount}</div>
                  <MiniBarChart className="w-16 h-7" />
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {absentCount} Absent • {leaveCount} Leave
                </div>
              </div>
            </div>
            {/* Summary & Date Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <CalendarCheck className="w-5 h-5 text-emerald-600" />
                    <span>Daily Attendance Roll-Call</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Defaulted to Present. Just tap <strong className="text-rose-600">A</strong> for absent students.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Counter Pills */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs text-emerald-700 font-semibold">Present</div>
                  <div className="text-xl font-extrabold text-emerald-800">{presentCount}</div>
                </div>
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-xs text-rose-700 font-semibold">Absent</div>
                  <div className="text-xl font-extrabold text-rose-800">{absentCount}</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-xs text-amber-700 font-semibold">Leave</div>
                  <div className="text-xl font-extrabold text-amber-800">{leaveCount}</div>
                </div>
              </div>
            </div>

            {/* Notification Banner when saved */}
            {attendanceSavedNotice && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  isOnline
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-amber-50 border-amber-300 text-amber-900"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{attendanceSavedNotice}</span>
              </div>
            )}

            {/* Offline Guidance Alert */}
            {!isOnline && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>Offline Mode:</strong> Zero internet required. You can mark attendance seamlessly.
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase bg-amber-200 px-2 py-0.5 rounded">
                  Local Queue
                </span>
              </div>
            )}

            {/* Student Attendance List (Large Tap Targets for 2GB RAM phones) */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
              {classStudents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No students admitted to this class yet. Switch to Principal view to admit students.
                </div>
              ) : (
                classStudents.map((st) => {
                  const status = attendanceMap[st.id] || "PRESENT";
                  return (
                    <div
                      key={st.id}
                      className="p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Student info */}
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 flex-shrink-0">
                          {st.roll_no}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">{st.name}</div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">ID: {st.student_id}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForProfile(st)}
                          className="px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[11px] font-semibold flex items-center gap-1 transition-all flex-shrink-0 shadow-2xs"
                          title="View Student Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Profile</span>
                        </button>
                      </div>

                      {/* 1-Tap Toggle Group (P, A, L) with Large Hit Targets (Min 44px) */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setStudentStatus(st.id, "PRESENT")}
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-sm font-extrabold flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
                            status === "PRESENT"
                              ? "bg-emerald-600 text-white shadow-sm scale-105"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                          title="Present"
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentStatus(st.id, "ABSENT")}
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-sm font-extrabold flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
                            status === "ABSENT"
                              ? "bg-rose-600 text-white shadow-sm scale-105"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                          title="Absent (Triggers WhatsApp)"
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentStatus(st.id, "LEAVE")}
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl text-sm font-extrabold flex items-center justify-center transition-all min-h-[44px] min-w-[44px] ${
                            status === "LEAVE"
                              ? "bg-amber-500 text-white shadow-sm scale-105"
                              : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                          }`}
                          title="Leave"
                        >
                          L
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Save Button */}
            <div className="sticky bottom-3 z-30 pt-2">
              <button
                type="button"
                onClick={handleSaveAttendance}
                className="w-full py-3.5 min-h-[48px] rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  Save Attendance ({presentCount} Present, {absentCount} Absent)
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1B: TEACHER'S OWN ATTENDANCE & CHECK-IN/OUT LOG */}
        {/* ========================================================================= */}
        {activeTab === "my_attendance" && (
          <div className="space-y-6">
            {/* Header with Title and Switch to Class Roll-Call */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>{isRtl ? "میری ذاتی حاضری اور گیٹ لاگ" : "My Attendance & Gate Check-In Log"}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl
                    ? "روزانہ اسکول آمد و روانگی کے اوقات، دورانیہ اور ماہانہ حاضری ریکارڈ"
                    : "Complete date-by-date check-in/out timestamps, duty duration, and punctuality records."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("attendance")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs self-start sm:self-auto"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isRtl ? "کلاس حاضری رول کال پر جائیں" : "Open Class Roll-Call"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4 Compact Metric Cards (Matching Dashboard UI) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Attendance % */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "حاضری کی شرح" : "Attendance Rate"}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {teacherAttPercent}%
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {teacherAttPercent >= 90 ? "Excellent" : "Standard"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {totalTeacherDays} {isRtl ? "کل کام کے دن" : "working days"}
                  </span>
                  <SparklineGreenWave />
                </div>
              </div>

              {/* Card 2: Total Days Present */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "کل حاضر دن" : "Total Present"}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {totalTeacherPresent}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">days</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {isRtl ? "وقت پر اسکول آمد" : "On-time arrival"}
                  </span>
                  <SparklineBluePulse />
                </div>
              </div>

              {/* Card 3: Late Arrivals */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "تاخیر سے آمد" : "Late Arrivals"}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {totalTeacherLate}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">days</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-amber-600 font-medium">
                    {isRtl ? "گیٹ پر 8:15 کے بعد" : "After 08:15 AM"}
                  </span>
                  <SparklineAmberWave />
                </div>
              </div>

              {/* Card 4: Absent Days */}
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isRtl ? "غیر حاضر دن" : "Absent Days"}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {totalTeacherAbsent}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {totalTeacherLeave > 0 ? `+ ${totalTeacherLeave} Leave` : "days"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-rose-600 font-medium">
                    {totalTeacherAbsent === 0 ? "Zero unexcused absence" : "Emergency absence"}
                  </span>
                  <MiniBarChart />
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
                    value={teacherAttMonthFilter}
                    onChange={(e) => setTeacherAttMonthFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0B3B2E]/20 transition-all cursor-pointer"
                  >
                    <option value="ALL">{formatTeacherMonthName("ALL")}</option>
                    {availableTeacherMonths.map((ym) => (
                      <option key={ym} value={ym}>
                        {formatTeacherMonthName(ym)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: "ALL", label: isRtl ? "تمام" : "All", count: recordsInMonthForTeacher.length, activeClass: "bg-[#0B3B2E] text-white border-[#0B3B2E]" },
                  { id: "PRESENT", label: isRtl ? "حاضر" : "Present", count: presentCountInMonth, activeClass: "bg-emerald-600 text-white border-emerald-600" },
                  { id: "LATE", label: isRtl ? "تاخیر" : "Late", count: lateCountInMonth, activeClass: "bg-amber-600 text-white border-amber-600" },
                  { id: "ABSENT", label: isRtl ? "غیر حاضر" : "Absent", count: absentCountInMonth, activeClass: "bg-rose-600 text-white border-rose-600" },
                  { id: "ON_LEAVE", label: isRtl ? "رخصت" : "On Leave", count: leaveCountInMonth, activeClass: "bg-purple-600 text-white border-purple-600" },
                ].map((pill) => {
                  const isActive = teacherAttStatusFilter === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setTeacherAttStatusFilter(pill.id as any)}
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
                    {teacherAttMonthFilter === "ALL"
                      ? isRtl
                        ? "تمام ریکارڈ شدہ حاضری لاگ"
                        : "All Recorded Work Days"
                      : `${formatTeacherMonthName(teacherAttMonthFilter)} Log`}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    ({filteredTeacherStaffHistory.length} {filteredTeacherStaffHistory.length === 1 ? "entry" : "entries"})
                  </span>
                </div>

                {(teacherAttStatusFilter !== "ALL" || teacherAttMonthFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherAttStatusFilter("ALL");
                      setTeacherAttMonthFilter("ALL");
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    {isRtl ? "فلٹرز ختم کریں" : "Reset Filters"}
                  </button>
                )}
              </div>

              {filteredTeacherStaffHistory.length === 0 ? (
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
                      setTeacherAttStatusFilter("ALL");
                      setTeacherAttMonthFilter("ALL");
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
                          <th className="py-3.5 px-4">Check-In Time</th>
                          <th className="py-3.5 px-4">Check-Out Time</th>
                          <th className="py-3.5 px-4">Duration</th>
                          <th className="py-3.5 px-4 text-right">Gate Notes / Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {filteredTeacherStaffHistory.map((rec) => {
                          const durationStr = calculateStaffDuration(rec.check_in_time, rec.check_out_time);
                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span>{formatTeacherAttDate(rec.date)}</span>
                              </td>
                              <td className="py-3.5 px-4">{renderTeacherStatusBadge(rec.status)}</td>
                              <td className="py-3.5 px-4 font-mono">
                                {rec.check_in_time ? (
                                  <span className={rec.status === "LATE" ? "text-amber-700 font-bold" : "text-slate-800 font-semibold"}>
                                    {rec.check_in_time}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-mono">
                                {rec.check_out_time ? (
                                  <span className="text-slate-800 font-semibold">{rec.check_out_time}</span>
                                ) : rec.check_in_time ? (
                                  <span className="text-emerald-700 font-semibold italic text-[11px]">In Progress</span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                                  durationStr === "In Progress"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : durationStr === "—"
                                    ? "text-slate-400"
                                    : "bg-slate-100 text-slate-700"
                                }`}>
                                  {durationStr}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right text-slate-500">
                                {rec.notes ? (
                                  <span className="italic text-slate-600">“{rec.notes}”</span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="block md:hidden divide-y divide-slate-100">
                    {filteredTeacherStaffHistory.map((rec) => {
                      const durationStr = calculateStaffDuration(rec.check_in_time, rec.check_out_time);
                      return (
                        <div key={rec.id} className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatTeacherAttDate(rec.date)}</span>
                            </span>
                            {renderTeacherStatusBadge(rec.status)}
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Check-In</span>
                              <span className={`font-mono font-medium ${rec.status === "LATE" ? "text-amber-700 font-bold" : "text-slate-800"}`}>
                                {rec.check_in_time || "—"}
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Check-Out</span>
                              <span className="font-mono font-medium text-slate-800">
                                {rec.check_out_time || (rec.check_in_time ? "In Progress" : "—")}
                              </span>
                            </div>
                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">Duration</span>
                              <span className="font-mono font-bold text-slate-700 truncate block">
                                {durationStr}
                              </span>
                            </div>
                          </div>

                          {rec.notes && (
                            <div className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                              Note: “{rec.notes}”
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: HOMEWORK POSTING */}
        {/* ========================================================================= */}
        {activeTab === "homework" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Class Homework Diary</span>
                </h2>
                <p className="text-xs text-slate-500">Post daily assignments visible to students and parents.</p>
              </div>

              <button
                onClick={() => setShowHwForm(!showHwForm)}
                className="px-3.5 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showHwForm ? "Cancel" : "Post Homework"}</span>
              </button>
            </div>

            {hwSuccessNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{hwSuccessNotice}</span>
              </div>
            )}

            {/* Add Homework Form */}
            {showHwForm && (
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">Create New Assignment</h3>
                <form onSubmit={handleAddHomework} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                      <select
                        value={hwFormData.subject}
                        onChange={(e) => setHwFormData({ ...hwFormData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Mathematics">Mathematics</option>
                        <option value="English">English</option>
                        <option value="Urdu">Urdu (اردو)</option>
                        <option value="Science">Science / General Science</option>
                        <option value="Islamiyat">Islamiyat</option>
                        <option value="Pak Studies">Pakistan Studies</option>
                        <option value="Computer">Computer Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
                      <input
                        type="date"
                        required
                        value={hwFormData.due_date}
                        onChange={(e) => setHwFormData({ ...hwFormData, due_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chapter 3 Exercises 3.1 & 3.2"
                      value={hwFormData.title}
                      onChange={(e) => setHwFormData({ ...hwFormData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Instructions / Description *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe what students need to solve or memorize..."
                      value={hwFormData.description}
                      onChange={(e) => setHwFormData({ ...hwFormData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowHwForm(false)}
                      className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 min-h-[44px] text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs"
                    >
                      Publish Homework
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Recent Homework */}
            <div className="space-y-3">
              {homeworkList.map((hw) => (
                <div key={hw.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                        {hw.subject}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm truncate">{hw.title}</h4>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex-shrink-0">
                      Due: {hw.due_date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EXAMS & MARKS ENTRY */}
        {/* ========================================================================= */}
        {activeTab === "exams" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Exam & Test Marks Entry</span>
                  </h2>
                  <p className="text-xs text-slate-500">Quickly record marks for all students in one click.</p>
                </div>

                <button
                  onClick={handleSaveMarks}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Marks</span>
                </button>
              </div>

              {/* Filters / Config */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Exam Type</label>
                  <select
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Monthly Test (October)">Monthly Test (October)</option>
                    <option value="Mid-Term Examination">Mid-Term Examination</option>
                    <option value="Final Examination">Final Examination</option>
                    <option value="Class Quiz">Class Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Subject</label>
                  <select
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                    <option value="Science">Science</option>
                    <option value="Islamiyat">Islamiyat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={examTotalMarks}
                    onChange={(e) => setExamTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {marksSavedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{marksSavedNotice}</span>
              </div>
            )}

            {/* Students Marks Input Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
              {classStudents.map((st) => {
                const val = marksInputMap[st.id] ?? 40;
                const pct = examTotalMarks > 0 ? Math.round((val / examTotalMarks) * 100) : 0;
                return (
                  <div key={st.id} className="p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 flex-shrink-0">
                        {st.roll_no}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">{st.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">ID: {st.student_id}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForProfile(st)}
                        className="px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[11px] font-semibold flex items-center gap-1 transition-all flex-shrink-0 shadow-2xs"
                        title="View Student Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Profile</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max={examTotalMarks}
                          value={val}
                          onChange={(e) =>
                            setMarksInputMap({ ...marksInputMap, [st.id]: Number(e.target.value) })
                          }
                          className="w-16 px-2.5 py-2 min-h-[40px] rounded-xl border border-slate-300 text-sm font-bold text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="text-xs text-slate-400">/ {examTotalMarks}</span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pct >= 80
                            ? "bg-emerald-50 text-emerald-700"
                            : pct >= 50
                            ? "bg-blue-50 text-blue-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PARENT-TEACHER MESSAGES (WITH QUIET HOURS) */}
        {/* ========================================================================= */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            {/* Quiet Hours Banner */}
            <div
              className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                quietHoursInfo.isActive
                  ? "bg-purple-50 border-purple-200 text-purple-900"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>
                  <strong>Quiet Hours Active ({quietHoursInfo.hoursText}):</strong> Parents are informed that
                  after-hours replies will be delivered at 8:00 AM next morning.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-800 text-[10px] font-bold uppercase whitespace-nowrap self-start sm:self-auto">
                Protected Hours
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-3 min-h-[440px]">
              {/* Mobile Student Selector Dropdown (< 768px) */}
              <div className="p-3 border-b border-slate-100 bg-slate-50 md:hidden space-y-1">
                <label className="block text-[11px] font-bold uppercase text-slate-500">
                  Select Student Conversation:
                </label>
                <select
                  value={selectedStudentForChat?.id || ""}
                  onChange={(e) => {
                    const st = classStudents.find((s) => s.id === e.target.value);
                    if (st) setSelectedStudentForChat(st);
                  }}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {classStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} (Roll #{st.roll_no} • {st.parent_whatsapp})
                    </option>
                  ))}
                </select>
              </div>

              {/* Desktop Student Thread Selector (>= 768px) */}
              <div className="hidden md:block border-r border-slate-100 p-3 space-y-2 bg-slate-50/50">
                <div className="text-[11px] font-bold uppercase text-slate-400 px-2">Student Conversations</div>
                <div className="space-y-1">
                  {classStudents.map((st) => {
                    const active = selectedStudentForChat?.id === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() => setSelectedStudentForChat(st)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between ${
                          active
                            ? "bg-white border border-slate-200 font-bold text-slate-900 shadow-2xs"
                            : "hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="truncate">{st.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal truncate">Parent: {st.parent_whatsapp}</div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Thread View */}
              <div className="md:col-span-2 flex flex-col justify-between p-3 sm:p-4 bg-white min-h-[360px]">
                {/* Active Header */}
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {selectedStudentForChat ? selectedStudentForChat.name : "Select Student"} (Parent Thread)
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">
                      WhatsApp: {selectedStudentForChat?.parent_whatsapp} • 1-on-1 thread
                    </p>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[300px]">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-8">
                      No previous messages in this student thread. Type below to send a message to the parent.
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isTeacher = msg.sender_role === "TEACHER";
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isTeacher ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                              isTeacher
                                ? "bg-slate-900 text-white rounded-br-none"
                                : "bg-slate-100 text-slate-900 rounded-bl-none"
                            }`}
                          >
                            <div className="text-[10px] font-bold opacity-60 mb-1">
                              {isTeacher ? "You (Teacher)" : "Parent"}
                            </div>
                            <p className="leading-relaxed">{msg.content}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Type message to parent..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all flex items-center justify-center flex-shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: MY TIMETABLE & SCHEDULE */}
        {/* ========================================================================= */}
        {activeTab === "timetable" && (
          <div className="space-y-4">
            {/* Today's Schedule Highlight Banner */}
            {(() => {
              const jsDay = new Date().getDay();
              const dayCodeMap: Record<number, DayOfWeek | "SUN"> = {
                0: "SUN",
                1: "MON",
                2: "TUE",
                3: "WED",
                4: "THU",
                5: "FRI",
                6: "SAT",
              };
              const todayCode = dayCodeMap[jsDay];
              const dayLabels: Record<string, { en: string; ur: string }> = {
                MON: { en: "Monday", ur: "پیر" },
                TUE: { en: "Tuesday", ur: "منگل" },
                WED: { en: "Wednesday", ur: "بدھ" },
                THU: { en: "Thursday", ur: "جمعرات" },
                FRI: { en: "Friday", ur: "جمعہ" },
                SAT: { en: "Saturday", ur: "ہفتہ" },
                SUN: { en: "Sunday", ur: "اتوار" },
              };

              const todaysSlots =
                todayCode !== "SUN"
                  ? teacherSchedule.filter((s) => s.day_of_week === todayCode)
                  : [];

              return (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-100 block">
                          {t.todaysSchedule || "Today's Schedule"}
                        </span>
                        <h2 className="font-extrabold text-sm sm:text-base">
                          {isRtl ? dayLabels[todayCode]?.ur : dayLabels[todayCode]?.en}
                          {todayCode !== "SUN" && ` (${todaysSlots.length} Classes)`}
                        </h2>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-white font-semibold text-[11px] backdrop-blur-xs">
                      {todayCode === "SUN" ? "Weekend" : `${todaysSlots.length} Scheduled`}
                    </span>
                  </div>

                  {todayCode === "SUN" ? (
                    <div className="p-3 rounded-xl bg-white/10 text-xs text-emerald-50">
                      🌿 Sunday Weekend — School is closed today. Review your upcoming week below.
                    </div>
                  ) : todaysSlots.length === 0 ? (
                    <div className="p-3 rounded-xl bg-white/10 text-xs text-emerald-50">
                      No classes scheduled for you today.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                      {todaysSlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 space-y-1 hover:bg-white/25 transition-all"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-100 font-bold">
                            <span>
                              {slot.start_time} - {slot.end_time}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 uppercase">
                              {slot.class_name} ({slot.section})
                            </span>
                          </div>
                          <div className="font-extrabold text-white text-sm">{slot.subject}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Weekly Schedule Filter & List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {t.mySchedule || "Full Weekly Timetable"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing all periods assigned to {currentUser?.name} across classes.
                  </p>
                </div>

                {/* Day Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-1.5">
                  {(["ALL", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const).map((d) => {
                    const active = selectedScheduleDay === d;
                    const labels: Record<string, string> = {
                      ALL: "All",
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
                        onClick={() => setSelectedScheduleDay(d)}
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

              {/* Weekly Period Cards */}
              {(() => {
                const dayLabels: Record<DayOfWeek, { en: string; ur: string }> = {
                  MON: { en: "Monday", ur: "پیر" },
                  TUE: { en: "Tuesday", ur: "منگل" },
                  WED: { en: "Wednesday", ur: "بدھ" },
                  THU: { en: "Thursday", ur: "جمعرات" },
                  FRI: { en: "Friday", ur: "جمعہ" },
                  SAT: { en: "Saturday", ur: "ہفتہ" },
                };

                const filtered = teacherSchedule.filter((slot) => {
                  if (selectedScheduleDay === "ALL") return true;
                  return slot.day_of_week === selectedScheduleDay;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400 space-y-2">
                      <Clock className="w-8 h-8 mx-auto opacity-30" />
                      <p className="text-xs font-medium">
                        {t.noClassesToday || "No classes scheduled for this period."}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-800 text-[10px] font-bold">
                            {isRtl ? dayLabels[slot.day_of_week]?.ur : dayLabels[slot.day_of_week]?.en}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>

                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{slot.subject}</div>
                          <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                            <BookOpen className="w-3 h-3 text-slate-400" />
                            <span>
                              {slot.class_name} (Section {slot.section})
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: PERSONAL SETTINGS & ACCOUNT SECURITY */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <UserSettingsTab
            currentUser={currentUser}
            onUserUpdate={(updated) => setCurrentUser(updated)}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* REUSABLE STUDENT PROFILE MODAL */}
      {/* ========================================================================= */}
      <StudentProfileModal
        student={selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        schoolName={schoolData?.name || "Beacon Grammar School"}
        showFeeInfo={false}
      />
    </DashboardShell>
  );
}
