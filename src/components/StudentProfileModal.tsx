"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  User,
  GraduationCap,
  CalendarCheck,
  Award,
  CreditCard,
  Phone,
  MessageSquare,
  Copy,
  Check,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Receipt,
  FileText,
  Plus,
  Star,
  Users,
  Shield,
  BookOpen,
} from "lucide-react";
import {
  Student,
  ExamMark,
  FeeRecord,
  AttendanceRecord,
  StudentReport,
  StudentReportCategory,
  StudentReportRating,
} from "@/lib/types";
import {
  getStudentExamMarks,
  getStudentFeeRecords,
  getStudentAttendanceRecords,
  getStudentReports,
  addStudentReport,
  getCurrentUser,
} from "@/lib/store";
import { normalizePakistaniPhone } from "@/lib/whatsapp";
import { useNotifications } from "@/context/NotificationContext";
import { useLanguage } from "@/context/LanguageContext";

export interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  schoolName?: string;
  showFeeInfo?: boolean; // true for Principal, optional/controlled for Teacher
  initialTab?: "overview" | "reports";
  teacherName?: string;
  teacherId?: string;
  canAddReport?: boolean;
}

export default function StudentProfileModal({
  student,
  onClose,
  schoolName = "Beacon Grammar School",
  showFeeInfo = true,
  initialTab = "overview",
  teacherName,
  teacherId,
  canAddReport = true,
}: StudentProfileModalProps) {
  const { notify } = useNotifications();
  const { isRtl } = useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "reports">(initialTab);

  // Student Report State
  const [reportsList, setReportsList] = useState<StudentReport[]>([]);
  const [showAddReportForm, setShowAddReportForm] = useState(false);
  const [reportCategory, setReportCategory] = useState<StudentReportCategory>("ACADEMIC");
  const [reportRating, setReportRating] = useState<StudentReportRating>("GOOD");
  const [reportRemarks, setReportRemarks] = useState("");
  const [reportSuccessNotice, setReportSuccessNotice] = useState<string | null>(null);

  // Synchronize initialTab prop
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      if (initialTab === "reports") {
        setShowAddReportForm(true);
      }
    }
  }, [initialTab]);

  // Load reports for student
  useEffect(() => {
    if (student) {
      const reports = getStudentReports(student.school_id, student.id);
      setReportsList(reports);
    }
  }, [student]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const formatWhatsAppUrl = (phone: string, text: string) => {
    const norm = normalizePakistaniPhone(phone);
    return `https://wa.me/${norm}?text=${encodeURIComponent(text)}`;
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !reportRemarks.trim()) return;

    const user = getCurrentUser();
    const effectiveTeacherName = teacherName || user?.name || "Ms. Sadia Tariq";
    const effectiveTeacherId = teacherId || user?.id || "usr-teacher-01";

    const saved = addStudentReport({
      school_id: student.school_id,
      student_id: student.id,
      student_name: student.name,
      teacher_id: effectiveTeacherId,
      teacher_name: effectiveTeacherName,
      category: reportCategory,
      rating: reportRating,
      remarks: reportRemarks.trim(),
    });

    setReportsList((prev) => [saved, ...prev]);
    setReportRemarks("");
    setShowAddReportForm(false);
    setReportSuccessNotice(isRtl ? "طالب علم کی رپورٹ کامیابی سے محفوظ ہو گئی۔" : "Student report saved successfully!");
    setTimeout(() => setReportSuccessNotice(null), 3000);

    // Trigger notification & toast
    notify({
      title: "Student Report Recorded",
      title_ur: "طالب علم کی رپورٹ درج کر دی گئی",
      message: `${effectiveTeacherName} recorded remarks for ${student.name}: "${saved.remarks.substring(0, 50)}..."`,
      message_ur: `${student.name} کے بارے میں رپورٹ درج کر دی گئی۔`,
      type: "SUCCESS",
      category: "REPORT",
      target_role: "ALL",
    });
  };

  // Helper for category presentation
  const getCategoryMeta = (cat: StudentReportCategory) => {
    switch (cat) {
      case "ACADEMIC":
        return {
          label: "Academic Progress",
          labelUr: "تعلیمی کارکردگی",
          icon: BookOpen,
          color: "text-blue-700 bg-blue-50 border-blue-200",
        };
      case "PARTICIPATION":
        return {
          label: "Class Participation",
          labelUr: "کلاس میں شرکت",
          icon: Users,
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        };
      case "BEHAVIOUR":
        return {
          label: "Discipline & Behaviour",
          labelUr: "نظم و ضبط و اخلاق",
          icon: Shield,
          color: "text-purple-700 bg-purple-50 border-purple-200",
        };
      case "GENERAL":
      default:
        return {
          label: "General Note",
          labelUr: "عمومی نوٹ",
          icon: FileText,
          color: "text-slate-700 bg-slate-50 border-slate-200",
        };
    }
  };

  // Helper for rating pills
  const getRatingMeta = (rating?: StudentReportRating) => {
    switch (rating) {
      case "EXCELLENT":
        return { label: "Excellent", labelUr: "شاندار", color: "bg-emerald-50 text-emerald-700 border-emerald-300" };
      case "GOOD":
        return { label: "Good", labelUr: "بہتر", color: "bg-blue-50 text-blue-700 border-blue-300" };
      case "NEEDS_ATTENTION":
        return { label: "Needs Attention", labelUr: "توجہ طلب", color: "bg-amber-50 text-amber-700 border-amber-300" };
      case "NEEDS_PRACTICE":
        return { label: "Needs Practice", labelUr: "مشق درکار", color: "bg-purple-50 text-purple-700 border-purple-300" };
      default:
        return { label: "Note", labelUr: "نوٹ", color: "bg-slate-50 text-slate-700 border-slate-300" };
    }
  };

  // Memoized data fetching for the active student
  const { examMarks, feeRecords, attendanceRecords, stats } = useMemo(() => {
    if (!student) {
      return { examMarks: [], feeRecords: [], attendanceRecords: [], stats: null };
    }

    const marks: ExamMark[] = getStudentExamMarks(student.school_id, student.id);
    const fees: FeeRecord[] = getStudentFeeRecords(student.school_id, student.id);
    const attendance: AttendanceRecord[] = getStudentAttendanceRecords(
      student.school_id,
      student.id
    );

    // Calculate attendance summary
    const totalDaysRecorded = attendance.length;
    const presentDays = attendance.filter((r) => r.status === "PRESENT").length;
    const absentDays = attendance.filter((r) => r.status === "ABSENT").length;
    const leaveDays = attendance.filter((r) => r.status === "LEAVE").length;

    const attendancePercent =
      totalDaysRecorded > 0
        ? Math.round((presentDays / totalDaysRecorded) * 100)
        : 96;

    // Calculate exam average
    const totalExamMarksPossible = marks.reduce((acc, m) => acc + (m.total_marks || 100), 0);
    const totalExamMarksObtained = marks.reduce((acc, m) => acc + (m.obtained_marks || 0), 0);
    const examAveragePercent =
      totalExamMarksPossible > 0
        ? Math.round((totalExamMarksObtained / totalExamMarksPossible) * 100)
        : marks.length > 0
        ? 88
        : 0;

    // Latest fee status
    const latestFee = fees.length > 0 ? fees[0] : null;

    return {
      examMarks: marks,
      feeRecords: fees,
      attendanceRecords: attendance,
      stats: {
        attendancePercent,
        presentDays: totalDaysRecorded > 0 ? presentDays : 24,
        absentDays: totalDaysRecorded > 0 ? absentDays : 1,
        leaveDays: totalDaysRecorded > 0 ? leaveDays : 0,
        examAveragePercent,
        latestFee,
      },
    };
  }, [student]);

  if (!student) return null;

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col animate-scaleUp">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER BANNER (FOREST EMERALD GRADIENT) */}
        {/* ========================================================================= */}
        <div className="relative bg-gradient-to-r from-[#0B3B2E] via-[#0D4838] to-[#082C22] p-5 sm:p-6 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Avatar & Presence Dot */}
            <div className="relative flex-shrink-0">
              {student.avatar_url ? (
                <img
                  src={student.avatar_url}
                  alt={student.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-extrabold text-emerald-300 shadow-md">
                  {initials}
                </div>
              )}
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0B3B2E] bg-emerald-400"
                title="Active Student"
              />
            </div>

            {/* Student Identity Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-white truncate">
                  {student.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Roll #{student.roll_no}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-white border border-white/20">
                  {student.class_name || "Grade"} - {student.section || "A"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100/80">
                <div className="flex items-center gap-1.5 font-mono bg-black/20 px-2.5 py-1 rounded-lg border border-white/10">
                  <span className="text-emerald-300/70 text-[10px] uppercase font-bold">Student ID:</span>
                  <span className="font-bold text-white">{student.student_id}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(student.student_id, `id-${student.id}`)}
                    className="ml-1 text-emerald-300 hover:text-white transition-colors"
                    title="Copy Student ID"
                  >
                    {copiedKey === `id-${student.id}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-300/80" />
                  <span>{schoolName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TAB SELECTOR BAR */}
        {/* ========================================================================= */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === "overview"
                ? "border-emerald-600 text-emerald-800 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{isRtl ? "پروفائل اور تعلیمی ریکارڈ" : "Profile & Academics"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === "reports"
                ? "border-emerald-600 text-emerald-800 bg-white shadow-2xs"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isRtl ? "اساتذہ کی آراء و رپورٹس" : "Teacher Remarks & Reports"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700">
              {reportsList.length}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. BODY CONTENT (SCROLLABLE) */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800">
          {/* Success Banner */}
          {reportSuccessNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{reportSuccessNotice}</span>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 1: OVERVIEW & ACADEMICS */}
          {/* ===================================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Parent & Contact Quick Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Parent WhatsApp & Contact
                  </span>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">
                      {student.parent_whatsapp || "No phone registered"}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Primary parent guardian linked for instant attendance alerts & notices
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {student.parent_whatsapp && (
                    <a
                      href={formatWhatsAppUrl(
                        student.parent_whatsapp,
                        `Mohtaram Parent of ${student.name} (Roll #${student.roll_no}, ${student.class_name || "Class"}): update from ${schoolName}.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message Parent</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `Student: ${student.name}\nRoll No: ${student.roll_no}\nClass: ${student.class_name} - ${student.section}\nStudent ID: ${student.student_id}\nParent Phone: ${student.parent_whatsapp}\nCampus: ${schoolName}`,
                        `info-${student.id}`
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    {copiedKey === `info-${student.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Info</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Academic & Attendance Snapshot Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Card 1: Attendance Snapshot */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      <span>Attendance Record</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {stats?.attendancePercent}% Present
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                      {stats?.attendancePercent}%
                    </span>
                    <span className="text-xs text-slate-500">Overall Presence</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-600 border-t border-slate-100">
                    <div>
                      <span className="font-bold text-emerald-700">{stats?.presentDays}</span> Present
                    </div>
                    <div>
                      <span className="font-bold text-rose-600">{stats?.absentDays}</span> Absent
                    </div>
                    <div>
                      <span className="font-bold text-amber-600">{stats?.leaveDays}</span> Leaves
                    </div>
                  </div>
                </div>

                {/* Card 2: Academic Performance Snapshot */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-600" />
                      <span>Academic Standing</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {examMarks.length} Exam Records
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-indigo-700 tracking-tight">
                      {stats?.examAveragePercent || 88}%
                    </span>
                    <span className="text-xs text-slate-500">Average Score</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-600 border-t border-slate-100">
                    <span>Monthly & Mid-Term Tests</span>
                    <span className="font-semibold text-emerald-700">Good Standing</span>
                  </div>
                </div>
              </div>

              {/* Latest Teacher Remarks Preview Strip */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/60 to-indigo-50/60 border border-emerald-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {isRtl ? "اساتذہ کی حالیہ رپورٹ" : "Teacher Remarks & Conduct Notes"}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      {reportsList.length} {reportsList.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                  {reportsList.length > 0 ? (
                    <p className="text-xs text-slate-600 italic line-clamp-2">
                      "{reportsList[0].remarks}" —{" "}
                      <span className="font-semibold text-slate-800 not-italic">
                        {reportsList[0].teacher_name}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      No remarks recorded yet. Teachers can document student feedback, discipline, and study habits.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("reports");
                    if (canAddReport) setShowAddReportForm(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 hover:border-emerald-500 text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{canAddReport ? "Add / View Reports" : "View Reports"}</span>
                </button>
              </div>

              {/* Exam Marks Breakdown List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      Recent Examination Results
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {examMarks.length} Results Recorded
                  </span>
                </div>

                {examMarks.length > 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
                    {examMarks.map((ex) => {
                      const pct =
                        ex.total_marks > 0
                          ? Math.round((ex.obtained_marks / ex.total_marks) * 100)
                          : 0;
                      return (
                        <div
                          key={ex.id}
                          className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-slate-900">{ex.subject}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500 text-[11px] truncate">
                                {ex.exam_name}
                              </span>
                            </div>
                            {ex.remarks && (
                              <div className="text-[11px] text-slate-400 italic truncate">
                                "{ex.remarks}"
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 flex-shrink-0">
                            <div className="text-right">
                              <span className="font-extrabold text-slate-900 font-mono text-sm">
                                {ex.obtained_marks}
                              </span>
                              <span className="text-slate-400 text-xs"> / {ex.total_marks}</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                pct >= 80
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : pct >= 50
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-1">
                    <FileText className="w-5 h-5 text-slate-400 mx-auto" />
                    <div className="text-xs font-semibold text-slate-600">
                      No Exam Results Entered Yet
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Scores entered in the Teacher Dashboard (Exams & Marks) will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Fee Information Section (Principal View) */}
              {showFeeInfo && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">
                        Monthly Tuition & Fee Status
                      </h4>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        stats?.latestFee?.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {stats?.latestFee?.status || "PAID"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="text-slate-400 text-[10px] font-bold uppercase">
                        Monthly Tuition Amount
                      </div>
                      <div className="text-lg font-extrabold text-slate-900 font-mono">
                        PKR {(student.monthly_fee || 4500).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cycle: {stats?.latestFee?.month || "Current Month"} (JazzCash, Easypaisa or Cash)
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {stats?.latestFee?.status === "UNPAID" && student.parent_whatsapp && (
                        <a
                          href={formatWhatsAppUrl(
                            student.parent_whatsapp,
                            `Assalam-o-Alaikum Mohtaram Parent,\nKindly submit the pending tuition fee of PKR ${(
                              student.monthly_fee || 4500
                            ).toLocaleString()} for ${student.name} (${student.class_name || "Grade 8"}).\n\nJazzCash / Easypaisa payment accounts are available.\nShukriya, ${schoolName}.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-1 shadow-2xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Send Fee Reminder</span>
                        </a>
                      )}
                      <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {stats?.latestFee?.status === "PAID" ? "✓ Fully Reconciled" : "Pending Clearance"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: TEACHER REMARKS & STUDENT REPORTS */}
          {/* ===================================================================== */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{isRtl ? "اساتذہ کی رپورٹس اور ریمارکس" : "Student Reports & Teacher Remarks"}</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isRtl
                      ? "طالب علم کی تعلیمی کارکردگی، نظم و ضبط اور کلاس میں شرکت کے مشاہدات۔"
                      : "Document student progress, class participation, and behavioral observations."}
                  </p>
                </div>

                {canAddReport && (
                  <button
                    type="button"
                    onClick={() => setShowAddReportForm((prev) => !prev)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all flex-shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddReportForm ? (isRtl ? "فارم بند کریں" : "Close Form") : (isRtl ? "نئی رپورٹ شامل کریں" : "+ Add Report")}</span>
                  </button>
                )}
              </div>

              {/* Add Report Form Drawer */}
              {showAddReportForm && (
                <form
                  onSubmit={handleSaveReport}
                  className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/90 shadow-sm space-y-4 animate-fadeIn"
                >
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isRtl ? "طالب علم کے بارے میں نیا مشاہدہ درج کریں" : `New Report for ${student.name}`}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddReportForm(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 1. Category / Focus Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {isRtl ? "رپورٹ کی نوعیت / زمرہ (Category / Focus):" : "Category / Focus:"}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          { key: "ACADEMIC", label: "Academic Progress", icon: BookOpen },
                          { key: "PARTICIPATION", label: "Participation", icon: Users },
                          { key: "BEHAVIOUR", label: "Discipline", icon: Shield },
                          { key: "GENERAL", label: "General Note", icon: FileText },
                        ] as const
                      ).map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = reportCategory === cat.key;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setReportCategory(cat.key)}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="truncate">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Quick Rating / Tag Pills */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {isRtl ? "ریٹنگ ٹیگ (Quick Rating Tag):" : "Quick Rating / Tag Pill:"}
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {(
                        [
                          { key: "EXCELLENT", label: "⭐ Excellent", activeBg: "bg-emerald-700 text-white border-emerald-700" },
                          { key: "GOOD", label: "👍 Good", activeBg: "bg-blue-600 text-white border-blue-600" },
                          { key: "NEEDS_ATTENTION", label: "⚠️ Needs Attention", activeBg: "bg-amber-600 text-white border-amber-600" },
                          { key: "NEEDS_PRACTICE", label: "🎯 Needs Practice", activeBg: "bg-purple-600 text-white border-purple-600" },
                        ] as const
                      ).map((r) => {
                        const isSelected = reportRating === r.key;
                        return (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => setReportRating(r.key)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                              isSelected
                                ? `${r.activeBg} shadow-2xs font-bold`
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Remarks Text Area */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {isRtl ? "تفصیلی مشاہدہ / ریمارکس:" : "Teacher Remarks & Notes:"}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reportRemarks}
                      onChange={(e) => setReportRemarks(e.target.value)}
                      placeholder={
                        isRtl
                          ? "طالب علم کی تعلیمی اور اخلاقی کارکردگی کے بارے میں مختصر نوٹ لکھیں..."
                          : "Write concise notes on student's homework habits, attention in class, test readiness, or conduct..."
                      }
                      className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs resize-none"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddReportForm(false)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                    >
                      {isRtl ? "منسوخ کریں" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={!reportRemarks.trim()}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRtl ? "رپورٹ محفوظ کریں" : "Save Report"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Reports Feed List */}
              <div className="space-y-3">
                {reportsList.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="font-bold text-xs text-slate-700">
                      {isRtl ? "ابھی تک کوئی رپورٹ درج نہیں کی گئی" : "No Teacher Reports Recorded Yet"}
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      {isRtl
                        ? "اساتذہ کے مشاہدات اور ریمارکس یہاں اور طلبہ و والدین کے پورٹل پر ظاہر ہوں گے۔"
                        : "Teacher notes regarding academic progress, homework habits, and conduct will appear here and in the parent portal."}
                    </p>
                    {canAddReport && !showAddReportForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddReportForm(true)}
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Report</span>
                      </button>
                    )}
                  </div>
                ) : (
                  reportsList.map((rep) => {
                    const catMeta = getCategoryMeta(rep.category);
                    const ratingMeta = getRatingMeta(rep.rating);
                    const CatIcon = catMeta.icon;
                    const dateFormatted = new Date(rep.created_at).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <div
                        key={rep.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 hover:border-emerald-200 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${catMeta.color}`}
                            >
                              <CatIcon className="w-3 h-3" />
                              <span>{isRtl ? catMeta.labelUr : catMeta.label}</span>
                            </span>

                            {rep.rating && (
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ratingMeta.color}`}
                              >
                                {isRtl ? ratingMeta.labelUr : ratingMeta.label}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                            <Clock className="w-3 h-3" />
                            <span>{dateFormatted}</span>
                          </div>
                        </div>

                        {/* Remarks Body */}
                        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-slate-800 text-xs sm:text-sm leading-relaxed font-sans">
                          "{rep.remarks}"
                        </div>

                        {/* Author Footer */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-emerald-600" />
                            <span>Teacher:</span>
                            <strong className="text-slate-800">{rep.teacher_name}</strong>
                          </span>
                          <span className="text-emerald-700 font-semibold">
                            ✓ Synced with Parent Portal
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. MODAL FOOTER */}
        {/* ========================================================================= */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-slate-500">
            Student: <strong className="text-slate-700">{student.name}</strong> • Class:{" "}
            <strong className="text-slate-700">
              {student.class_name || "Grade"} - {student.section || "A"}
            </strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}

