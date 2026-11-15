"use client";

import React, { useState, useEffect } from "react";
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
  DAYS_ORDER,
  logout,
} from "@/lib/store";
import { User, SchoolClass, Student, AttendanceStatus, Homework, ExamMark, ChatMessage, TimetableSlot, DayOfWeek } from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";
import { getAbsentAlertWhatsAppUrl, dispatchWhatsAppWebhook } from "@/lib/whatsapp";

export default function TeacherDashboard() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<"attendance" | "homework" | "timetable" | "exams" | "messages">("attendance");

  // User and Class context
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [classesList, setClassesList] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classStudents, setClassStudents] = useState<Student[]>([]);

  // Timetable State
  const [teacherSchedule, setTeacherSchedule] = useState<TimetableSlot[]>([]);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<DayOfWeek | "ALL">("ALL");

  // Connectivity & Offline mode
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  // Tab 1: Attendance State
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceSavedNotice, setAttendanceSavedNotice] = useState<string | null>(null);

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

    // Load teacher's timetable schedule
    setTeacherSchedule(getTeacherTimetable(user.school_id, user.id));

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

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Calculate quick attendance counts
  const presentCount = Object.values(attendanceMap).filter((s) => s === "PRESENT").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "ABSENT").length;
  const leaveCount = Object.values(attendanceMap).filter((s) => s === "LEAVE").length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-12">
      {/* Top Mobile-First App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 text-sm sm:text-base hidden xs:inline">Attendlix</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 mx-0.5 flex-shrink-0" />
            <div className="flex items-center gap-1.5 text-xs min-w-0">
              <span className="font-semibold text-slate-800 truncate max-w-[90px] sm:max-w-none">
                {currentUser?.name || "Teacher Portal"}
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-200 flex-shrink-0">
                Teacher
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <LanguageToggle />

            {/* Offline / Online Network Indicator */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              title="Click to toggle simulated offline mode"
              className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 border transition-all ${
                isOnline
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span className="text-[10px] sm:text-[11px]">Offline</span>
                </>
              )}
            </button>

            {/* Offline Sync Button if items queued */}
            {offlineQueueCount > 0 && (
              <button
                onClick={handleAutoSync}
                className="px-2 sm:px-2.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-semibold flex items-center gap-1 shadow-2xs hover:bg-slate-800 transition-all flex-shrink-0"
                title="Sync offline attendance records to cloud"
              >
                <RefreshCw className="w-3 h-3 text-emerald-400" />
                <span>Sync ({offlineQueueCount})</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Class Selector Bar */}
        <div className="bg-slate-50/80 border-t border-slate-100 px-3 sm:px-6 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[11px] font-bold uppercase text-slate-500 whitespace-nowrap">Class:</span>
              {classesList.map((cls) => {
                const active = selectedClassId === cls.id;
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center ${
                      active
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cls.name} ({cls.section})
                  </button>
                );
              })}
            </div>

            <Link
              href="/dashboard/principal"
              className="text-[11px] font-semibold text-slate-500 hover:text-emerald-700 underline whitespace-nowrap hidden sm:inline flex-shrink-0"
            >
              Principal View →
            </Link>
          </div>
        </div>

        {/* Core Teacher Tabs (Mobile Bottom/Top Navigation) */}
        <div className="max-w-4xl mx-auto px-2 sm:px-6 flex items-center overflow-x-auto scrollbar-none sm:justify-around border-t border-slate-200 bg-white">
          {[
            { id: "attendance", label: t.tabAttendance || "Attendance", icon: CalendarCheck },
            { id: "homework", label: t.tabHomework || "Homework", icon: BookOpen },
            { id: "timetable", label: t.mySchedule || "My Schedule", icon: Clock },
            { id: "exams", label: t.tabExams || "Exam Marks", icon: Award },
            { id: "messages", label: t.tabChat || "Messages", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[72px] sm:min-w-0 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-xs font-semibold transition-all border-b-2 flex-shrink-0 min-h-[44px] ${
                  active
                    ? "border-emerald-600 text-emerald-700 bg-emerald-50/40"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 space-y-4">
        {/* Global Sync Notification */}
        {syncStatusMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{syncStatusMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: 1-TAP DAILY ATTENDANCE (WITH OFFLINE FIRST QUEUE) */}
        {/* ========================================================================= */}
        {activeTab === "attendance" && (
          <div className="space-y-4">
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
                className="w-full py-3.5 min-h-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
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
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
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
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
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
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          active
                            ? "bg-slate-900 text-white shadow-2xs"
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
      </main>
    </div>
  );
}
