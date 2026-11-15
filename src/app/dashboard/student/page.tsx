"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  getCurrentUser,
  getSchool,
  getStudents,
  getClasses,
  getAnnouncements,
  getHomeworkList,
  getExamMarks,
  getStudentFeeRecords,
  payStudentFee,
  getStudentMessages,
  sendTeacherMessage,
  isQuietHoursActive,
  logout,
} from "@/lib/store";
import { User, Student, Announcement, Homework, ExamMark, FeeRecord, ChatMessage, PaymentMethod } from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";

export default function StudentDashboard() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "attendance_hw" | "exams" | "fees" | "chat">("overview");

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

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState<{ record: FeeRecord; method: PaymentMethod; txnId: string } | null>(null);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  const quietHours = isQuietHoursActive();

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
      setAnnouncements(getAnnouncements(user.school_id));
      setHomeworkList(getHomeworkList(user.school_id, student.class_id));
      setExamMarksList(getExamMarks(user.school_id, student.class_id, "Monthly Test (October)", "Mathematics"));
      setFeeRecords(getStudentFeeRecords(user.school_id, student.id));
      setChatMessages(getStudentMessages(user.school_id, student.id));
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 text-base">Attendlix</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 mx-1" />
            <span className="text-xs font-semibold text-slate-700">Student & Parent Portal</span>
          </div>

          <div className="flex items-center gap-2.5">
            <LanguageToggle />

            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block">{currentStudent?.name}</span>
              <span className="text-[10px] text-slate-500 font-mono">ID: {currentStudent?.student_id}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="max-w-4xl mx-auto px-2 flex items-center justify-around border-t border-slate-200 bg-white">
          {[
            { id: "overview", label: "Overview", icon: School },
            { id: "attendance_hw", label: "Diary & Work", icon: BookOpen },
            { id: "exams", label: "Exam Marks", icon: Award },
            { id: "fees", label: "Fee Status", icon: CreditCard },
            { id: "chat", label: "Teacher Chat", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-xs font-semibold transition-all border-b-2 ${
                  active
                    ? "border-emerald-600 text-emerald-700 bg-emerald-50/40"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
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
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-extrabold text-base border border-emerald-200">
                {currentStudent?.name.charAt(0) || "S"}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">{currentStudent?.name}</h1>
                <p className="text-xs text-slate-500">
                  {currentStudent?.class_name} - Section {currentStudent?.section} • Roll #{currentStudent?.roll_no}
                </p>
                <div className="text-[11px] text-slate-400">{schoolData?.name} ({schoolData?.city})</div>
              </div>
            </div>

            {/* Attendance Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-right">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Attendance
                </span>
                <span className="text-lg font-extrabold">96% Present</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & ANNOUNCEMENTS */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Today's Attendance</span>
                <div className="text-xl font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Present</span>
                </div>
                <div className="text-[11px] text-slate-400">Marked at 08:15 AM</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">November Fee</span>
                <div className="text-xl font-bold text-slate-900">
                  {feeRecords.some((f) => f.month === "November" && f.status === "PAID") ? (
                    <span className="text-emerald-600">Paid ✓</span>
                  ) : (
                    <span className="text-amber-600">PKR 4,500 (Due)</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">Via JazzCash / Easypaisa</div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Pending Homework</span>
                <div className="text-xl font-bold text-slate-900">{homeworkList.length} Tasks</div>
                <div className="text-[11px] text-slate-400">Check Diary tab</div>
              </div>
            </div>

            {/* School Announcements */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <School className="w-4 h-4 text-emerald-600" />
                <span>Official School Announcements</span>
              </h3>

              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{ann.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ann.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    <div className="text-[10px] text-emerald-700 font-medium pt-1">
                      📢 Broadcasted via WhatsApp & Portal
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ATTENDANCE & HOMEWORK DIARY */}
        {/* ========================================================================= */}
        {activeTab === "attendance_hw" && (
          <div className="space-y-6">
            {/* Daily Homework */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Daily Homework Diary</span>
              </h3>

              <div className="space-y-3">
                {homeworkList.map((hw) => (
                  <div key={hw.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {hw.subject}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{hw.title}</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Due: {hw.due_date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{hw.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance History Preview */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>Recent Attendance Record</span>
              </h3>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs divide-y divide-slate-100 text-xs">
                {[
                  { date: "Today, 15 Nov", status: "PRESENT" },
                  { date: "Yesterday, 14 Nov", status: "PRESENT" },
                  { date: "Thursday, 13 Nov", status: "PRESENT" },
                  { date: "Wednesday, 12 Nov", status: "LEAVE" },
                  { date: "Tuesday, 11 Nov", status: "PRESENT" },
                ].map((item, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <span className="font-medium text-slate-700">{item.date}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        item.status === "PRESENT"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EXAM MARKS */}
        {/* ========================================================================= */}
        {activeTab === "exams" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Test & Examination Results</span>
                </h3>
                <p className="text-xs text-slate-500">Official marks posted by your class teachers.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
              {[
                { exam: "Monthly Test (October)", subject: "Mathematics", total: 50, obtained: 46 },
                { exam: "Monthly Test (October)", subject: "English", total: 50, obtained: 42 },
                { exam: "Monthly Test (October)", subject: "Urdu", total: 50, obtained: 45 },
                { exam: "Monthly Test (October)", subject: "General Science", total: 50, obtained: 48 },
              ].map((res, idx) => {
                const pct = Math.round((res.obtained / res.total) * 100);
                return (
                  <div key={idx} className="p-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div>
                      <div className="font-bold text-slate-900">{res.subject}</div>
                      <div className="text-[11px] text-slate-400">{res.exam}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-extrabold text-slate-900">
                          {res.obtained} <span className="text-slate-400 text-xs">/ {res.total}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {pct}% ({pct >= 80 ? "A+" : "A"})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
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
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: PAY VIA JAZZCASH / EASYPAISA */}
      {/* ========================================================================= */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Pay School Fee</h3>
              <button
                onClick={() => setPaymentModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompletePayment} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentModal({ ...paymentModal, method: "JAZZCASH" })}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      paymentModal.method === "JAZZCASH"
                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    JazzCash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentModal({ ...paymentModal, method: "EASYPAISA" })}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      paymentModal.method === "EASYPAISA"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    Easypaisa
                  </button>
                </div>
              </div>

              {/* School Payment Instructions */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-[11px] text-slate-600">
                <span className="font-bold text-slate-800 block">
                  Send PKR {paymentModal.record.amount} to School Account:
                </span>
                <div>Account / Till Number: <strong className="text-slate-900">0300-4567890</strong></div>
                <div>Title: <strong className="text-slate-900">{schoolData?.name || "School"}</strong></div>
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentModal(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xs"
                >
                  Verify & Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
