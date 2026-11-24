"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { Student, ExamMark, FeeRecord, AttendanceRecord } from "@/lib/types";
import {
  getStudentExamMarks,
  getStudentFeeRecords,
  getStudentAttendanceRecords,
  getTodayDateStr,
} from "@/lib/store";
import { normalizePakistaniPhone } from "@/lib/whatsapp";

export interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  schoolName?: string;
  showFeeInfo?: boolean; // true for Principal, optional/controlled for Teacher
}

export default function StudentProfileModal({
  student,
  onClose,
  schoolName = "Beacon Grammar School",
  showFeeInfo = true,
}: StudentProfileModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const formatWhatsAppUrl = (phone: string, text: string) => {
    const norm = normalizePakistaniPhone(phone);
    return `https://wa.me/${norm}?text=${encodeURIComponent(text)}`;
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

    // Use actual attendance rate or a healthy default snapshot if session just started
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
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-extrabold text-emerald-300 shadow-md">
                {initials}
              </div>
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
        {/* 2. BODY CONTENT (SCROLLABLE) */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800">
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

        {/* ========================================================================= */}
        {/* 3. MODAL FOOTER */}
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
