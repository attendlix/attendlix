"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  CalendarCheck,
  UserCheck,
  UserX,
  Menu,
  X,
  Landmark,
  Wallet,
  Percent,
  MapPin,
  Sliders,
  Settings,
  AlertCircle,
  Save,
  ShieldCheck,
  Mail,
  FileText,
  Eye,
  Activity,
  ArrowUpRight,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  getCurrentUser,
  getSchool,
  updateSchoolProfile,
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
  adjustFeeRecordAmount,
  updateFeeRecordAmount,
  getFeeSummary,
  getClassTimetable,
  getTimetables,
  checkTeacherClash,
  saveTimetableSlot,
  deleteTimetableSlot,
  getStaffAttendance,
  getStaffAttendanceStats,
  saveStaffAttendanceRecord,
  getStaffTodayRecord,
  getStaffAttendanceHistory,
  getDailyAttendance,
  bulkPromoteStudents,
  getTodayDateStr,
  formatCurrentTime,
  DAYS_ORDER,
  logout,
} from "@/lib/store";
import {
  User,
  School,
  SchoolClass,
  Student,
  Announcement,
  AnnouncementAudience,
  AnnouncementPriority,
  FeeRecord,
  FeeStatus,
  PaymentMethod,
  TimetableSlot,
  DayOfWeek,
  StaffAttendanceRecord,
  StaffAttendanceStatus,
} from "@/lib/types";
import { LanguageToggle, useLanguage } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationContext";
import DashboardShell from "@/components/DashboardShell";
import UserSettingsTab from "@/components/UserSettingsTab";
import StudentProfileModal from "@/components/StudentProfileModal";
import { SparklineGreenWave, SparklineBluePulse, MiniBarChart, SparklineAmberWave } from "@/components/MiniCharts";
import {
  getFeeReminderWhatsAppUrl,
  getAnnouncementWhatsAppUrl,
  getCredentialsNoticeWhatsAppUrl,
} from "@/lib/whatsapp";

export default function PrincipalDashboard() {
  const router = useRouter();
  const { t, isRtl } = useLanguage();
  const { notify } = useNotifications();

  // Active Tab state
  const [activeTab, setActiveTab] = useState<
    "overview" | "classes" | "staff" | "students" | "fees" | "announcements" | "timetable" | "staff-attendance" | "profile" | "settings"
  >("overview");

  // Staff Attendance Module State
  const [staffAttendanceDate, setStaffAttendanceDate] = useState<string>(() => getTodayDateStr());
  const [staffAttendanceList, setStaffAttendanceList] = useState<StaffAttendanceRecord[]>([]);
  const [staffAttendanceStats, setStaffAttendanceStats] = useState<{
    totalStaff: number;
    present: number;
    late: number;
    absent: number;
    onLeave: number;
  }>({ totalStaff: 0, present: 0, late: 0, absent: 0, onLeave: 0 });
  const [staffStatusFilter, setStaffStatusFilter] = useState<"ALL" | "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE">("ALL");
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>("");
  const [staffRoleFilter, setStaffRoleFilter] = useState<"ALL" | "TEACHER" | "ACCOUNTANT">("ALL");
  const [editingStaffRecord, setEditingStaffRecord] = useState<StaffAttendanceRecord | null>(null);
  const [showStaffAttendanceModal, setShowStaffAttendanceModal] = useState<boolean>(false);
  const [staffAttendanceNotice, setStaffAttendanceNotice] = useState<string | null>(null);

  // User and Core Data state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [classesList, setClassesList] = useState<SchoolClass[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [selectedStaffForProfile, setSelectedStaffForProfile] = useState<User | null>(null);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
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
    monthly_fee: 4500,
  });
  const [createdStudentCreds, setCreatedStudentCreds] = useState<{ student: Student; rawPassword: string } | null>(null);

  // Daily School Pulse State
  const [showUnmarkedStaffDrawer, setShowUnmarkedStaffDrawer] = useState(false);

  // Bulk Student Promotion State
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteSourceClassId, setPromoteSourceClassId] = useState("");
  const [promoteTargetClassId, setPromoteTargetClassId] = useState("");
  const [selectedStudentIdsForPromotion, setSelectedStudentIdsForPromotion] = useState<string[]>([]);
  const [updateRollNumbers, setUpdateRollNumbers] = useState(false);
  const [newRollNumbersMap, setNewRollNumbersMap] = useState<Record<string, string>>({});
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotionNotice, setPromotionNotice] = useState<string | null>(null);

  // Fee Adjustment Modal State
  const [adjustFeeModal, setAdjustFeeModal] = useState<{
    record: FeeRecord;
    amount: number;
    reason?: string;
  } | null>(null);

  const [announcementForm, setAnnouncementForm] = useState<{
    title: string;
    content: string;
    audience: "ALL" | "PARENTS" | "STAFF";
    priority: "NORMAL" | "IMPORTANT" | "URGENT";
    class_name: string;
  }>({
    title: "",
    content: "",
    audience: "ALL",
    priority: "NORMAL",
    class_name: "",
  });
  const [announcementSentNotice, setAnnouncementSentNotice] = useState<string | null>(null);

  // School Profile & Settings State
  const [profileSubTab, setProfileSubTab] = useState<
    "school-info" | "timings" | "classes-subjects" | "fees-accounts" | "policies"
  >("school-info");
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "Beacon Grammar School",
    principal_name: "Dr. Muhammad Tariq",
    city: "Lahore",
    phone: "042-35889900",
    email: "principal@beacongrammar.edu.pk",
    address: "Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan",
    start_time: "08:00 AM",
    end_time: "02:00 PM",
    late_cutoff: "08:15 AM",
    bank_name: "Meezan Bank",
    bank_account_title: "Beacon Grammar School Fee A/C",
    bank_account_number: "PK36MEZN0001234567890123",
    easypaisa_title: "Beacon Grammar Official",
    easypaisa_number: "0300-1234567",
    jazzcash_title: "Beacon Grammar School",
    jazzcash_number: "0321-9876543",
    late_fee_amount: 200,
    quiet_hours_start: "08:00 PM",
    quiet_hours_end: "07:00 AM",
    rules_and_policies: "1. All students must wear proper school uniform with ID badge.\n2. Gates close strictly at 08:15 AM. Late entries must be approved by Principal office.\n3. Mobile phones and electronic gadgets are strictly prohibited for students.\n4. Sick leave exceeding 2 days requires a registered medical certificate.\n5. Fee dues must be settled by the 10th of every calendar month.",
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Load and refresh all data
  const refreshAll = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    // If logged in as Super Admin, redirect cleanly to Super Admin dashboard
    if (
      (user.role as string)?.toUpperCase() === "SUPER_ADMIN" ||
      user.identifier?.toLowerCase() === "superadmin@attendlix.com" ||
      user.email?.toLowerCase() === "superadmin@attendlix.com"
    ) {
      router.push("/dashboard/super-admin");
      return;
    }
    setCurrentUser(user);
    const sch = getSchool(user.school_id);
    setSchoolData(sch);
    if (sch) {
      setProfileForm({
        name: sch.name || "",
        principal_name: sch.principal_name || "",
        city: sch.city || "",
        phone: sch.phone || "",
        email: sch.email || "",
        address: sch.address || "",
        start_time: sch.start_time || "08:00 AM",
        end_time: sch.end_time || "02:00 PM",
        late_cutoff: sch.late_cutoff || "08:15 AM",
        bank_name: sch.bank_name || "",
        bank_account_title: sch.bank_account_title || "",
        bank_account_number: sch.bank_account_number || "",
        easypaisa_title: sch.easypaisa_title || "",
        easypaisa_number: sch.easypaisa_number || "",
        jazzcash_title: sch.jazzcash_title || "",
        jazzcash_number: sch.jazzcash_number || "",
        late_fee_amount: sch.late_fee_amount ?? 200,
        quiet_hours_start: sch.quiet_hours_start || "08:00 PM",
        quiet_hours_end: sch.quiet_hours_end || "07:00 AM",
        rules_and_policies: sch.rules_and_policies || "",
      });
    }

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

    // Staff Attendance
    const staffAtt = getStaffAttendance(user.school_id, staffAttendanceDate);
    setStaffAttendanceList(staffAtt);
    const sStats = getStaffAttendanceStats(user.school_id, staffAttendanceDate);
    setStaffAttendanceStats(sStats);
  };

  // Re-fetch staff attendance when date changes
  useEffect(() => {
    if (currentUser) {
      const staffAtt = getStaffAttendance(currentUser.school_id, staffAttendanceDate);
      setStaffAttendanceList(staffAtt);
      const sStats = getStaffAttendanceStats(currentUser.school_id, staffAttendanceDate);
      setStaffAttendanceStats(sStats);
    }
  }, [staffAttendanceDate, currentUser]);

  // Principal 1-Click Manual Override for Staff Attendance
  const handleQuickStaffStatus = (staffId: string, newStatus: StaffAttendanceStatus) => {
    if (!currentUser) return;
    const existing = staffAttendanceList.find((s) => s.user_id === staffId);
    let checkInTime = existing?.check_in_time;
    if (!checkInTime && (newStatus === "PRESENT" || newStatus === "LATE")) {
      checkInTime = formatCurrentTime(new Date());
    } else if (newStatus === "ABSENT" || newStatus === "ON_LEAVE") {
      checkInTime = null;
    }

    const updated = saveStaffAttendanceRecord(currentUser.school_id, {
      user_id: staffId,
      date: staffAttendanceDate,
      status: newStatus,
      check_in_time: checkInTime,
      notes: `Updated by Principal (${currentUser.name})`,
    });

    const staffAtt = getStaffAttendance(currentUser.school_id, staffAttendanceDate);
    setStaffAttendanceList(staffAtt);
    const sStats = getStaffAttendanceStats(currentUser.school_id, staffAttendanceDate);
    setStaffAttendanceStats(sStats);

    setStaffAttendanceNotice(`✓ Updated ${updated.user_name || "staff"} status to ${newStatus}`);
    setTimeout(() => setStaffAttendanceNotice(null), 4000);
  };

  const handleOpenEditStaffModal = (rec: StaffAttendanceRecord) => {
    setEditingStaffRecord({ ...rec });
    setShowStaffAttendanceModal(true);
  };

  const handleSaveStaffTimeModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editingStaffRecord) return;

    saveStaffAttendanceRecord(currentUser.school_id, {
      user_id: editingStaffRecord.user_id,
      date: editingStaffRecord.date,
      status: editingStaffRecord.status,
      check_in_time: editingStaffRecord.check_in_time || null,
      check_out_time: editingStaffRecord.check_out_time || null,
      notes: editingStaffRecord.notes,
    });

    notify({
      title: "Staff Attendance Recorded",
      title_ur: "اسٹاف حاضری اپ ڈیٹ",
      message: `Attendance updated for ${editingStaffRecord.user_name || "Staff Member"}: ${editingStaffRecord.status}.`,
      message_ur: `اسٹاف کی حاضری کامیابی سے درج کر دی گئی۔`,
      type: "SUCCESS",
      category: "ATTENDANCE",
      target_role: "PRINCIPAL",
    });

    setShowStaffAttendanceModal(false);
    setEditingStaffRecord(null);

    const staffAtt = getStaffAttendance(currentUser.school_id, staffAttendanceDate);
    setStaffAttendanceList(staffAtt);
    const sStats = getStaffAttendanceStats(currentUser.school_id, staffAttendanceDate);
    setStaffAttendanceStats(sStats);

    setStaffAttendanceNotice(`✓ Attendance updated for ${editingStaffRecord.user_name}`);
    setTimeout(() => setStaffAttendanceNotice(null), 4000);
  };

  // Daily School Pulse Analytics
  const unmarkedStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const rec = staffAttendanceList.find((r) => r.user_id === staff.id);
      return !rec || rec.status === "ABSENT";
    });
  }, [staffList, staffAttendanceList]);

  const lateStaff = useMemo(() => {
    return staffAttendanceList.filter((r) => r.status === "LATE");
  }, [staffAttendanceList]);

  const pendingRollCallClasses = useMemo(() => {
    if (!currentUser) return [];
    const today = getTodayDateStr();
    return classesList.filter((c) => {
      const attMap = getDailyAttendance(currentUser.school_id, c.id, today);
      return Object.keys(attMap).length === 0;
    });
  }, [currentUser, classesList]);

  const todayFeePulse = useMemo(() => {
    const today = getTodayDateStr();
    const collectedTodayRecords = feeRecordsList.filter(
      (r) => r.status === "PAID" && (r.paid_at?.startsWith(today) || r.created_at?.startsWith(today))
    );
    const todayCollectedPKR = collectedTodayRecords.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    const pendingBalancePKR = feeSummary?.totalPendingPKR || 0;
    return {
      todayCollectedPKR,
      todayCount: collectedTodayRecords.length,
      pendingBalancePKR,
    };
  }, [feeRecordsList, feeSummary]);

  // Bulk Student Promotion Handlers
  const handleOpenPromoteModal = () => {
    if (classesList.length >= 2) {
      const srcId = classesList[0].id;
      const tgtId = classesList[1].id;
      setPromoteSourceClassId(srcId);
      setPromoteTargetClassId(tgtId);
      const srcStudents = studentsList.filter((s) => s.class_id === srcId);
      setSelectedStudentIdsForPromotion(srcStudents.map((s) => s.id));
      const initialRolls: Record<string, string> = {};
      srcStudents.forEach((s) => {
        initialRolls[s.id] = s.roll_no;
      });
      setNewRollNumbersMap(initialRolls);
    } else if (classesList.length === 1) {
      setPromoteSourceClassId(classesList[0].id);
      setPromoteTargetClassId("");
      const srcStudents = studentsList.filter((s) => s.class_id === classesList[0].id);
      setSelectedStudentIdsForPromotion(srcStudents.map((s) => s.id));
    }
    setUpdateRollNumbers(false);
    setShowPromoteModal(true);
  };

  const handleSourceClassChange = (newSrcId: string) => {
    setPromoteSourceClassId(newSrcId);
    const srcStudents = studentsList.filter((s) => s.class_id === newSrcId);
    setSelectedStudentIdsForPromotion(srcStudents.map((s) => s.id));
    const initialRolls: Record<string, string> = {};
    srcStudents.forEach((s) => {
      initialRolls[s.id] = s.roll_no;
    });
    setNewRollNumbersMap(initialRolls);
    if (promoteTargetClassId === newSrcId) {
      const altTarget = classesList.find((c) => c.id !== newSrcId);
      if (altTarget) setPromoteTargetClassId(altTarget.id);
    }
  };

  const handleToggleSelectStudent = (studentId: string) => {
    setSelectedStudentIdsForPromotion((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = (allIds: string[]) => {
    setSelectedStudentIdsForPromotion(allIds);
  };

  const handleDeselectAllStudents = () => {
    setSelectedStudentIdsForPromotion([]);
  };

  const handleExecutePromotion = () => {
    if (!currentUser || !promoteSourceClassId || !promoteTargetClassId) return;
    if (promoteSourceClassId === promoteTargetClassId) {
      alert(isRtl ? "شروع کی کلاس اور اگلی کلاس ایک جیسی نہیں ہو سکتیں" : "Source and Target class cannot be the same.");
      return;
    }
    if (selectedStudentIdsForPromotion.length === 0) {
      alert(isRtl ? "براہ کرم پروموٹ کرنے کے لیے کم از کم ایک طالب علم منتخب کریں" : "Please select at least one student to promote.");
      return;
    }

    setIsPromoting(true);

    const res = bulkPromoteStudents(
      currentUser.school_id,
      selectedStudentIdsForPromotion,
      promoteTargetClassId,
      updateRollNumbers ? newRollNumbersMap : undefined
    );

    if (res.success) {
      const updatedStudents = getStudents(currentUser.school_id);
      const updatedClasses = getClasses(currentUser.school_id);
      setStudentsList(updatedStudents);
      setClassesList(updatedClasses);

      const sourceClass = classesList.find((c) => c.id === promoteSourceClassId);
      const targetClass = classesList.find((c) => c.id === promoteTargetClassId);

      const sourceName = sourceClass ? `${sourceClass.name} - Section ${sourceClass.section}` : "Source Class";
      const targetName = targetClass ? `${targetClass.name} - Section ${targetClass.section}` : res.targetClassName;

      notify({
        title: "Class Promoted Successfully",
        title_ur: "کلاس کی اگلی جماعت میں ترقی مکمل",
        message: `${res.promotedCount} students promoted from ${sourceName} to ${targetName}. Historical records preserved.`,
        message_ur: `${res.promotedCount} طلبہ کو کامیابی سے ${targetName} میں پروموٹ کر دیا گیا ہے۔ پچھلا ریکارڈ مکمل محفوظ ہے۔`,
        type: "SUCCESS",
        category: "ADMISSION",
        target_role: "PRINCIPAL",
      });

      setPromotionNotice(
        `✓ Successfully promoted ${res.promotedCount} students to ${targetName}! Historical attendance, marks, and fees are preserved.`
      );
      setTimeout(() => setPromotionNotice(null), 6000);

      setShowPromoteModal(false);
    }
    setIsPromoting(false);
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
    notify({
      title: "Timetable Slot Saved",
      title_ur: "ٹائم ٹیبل پیریڈ محفوظ",
      message: `${periodFormData.subject} for ${periodFormData.day_of_week} (${periodFormData.start_time} - ${periodFormData.end_time}) saved.`,
      message_ur: `ٹائم ٹیبل کا پیریڈ کامیابی سے محفوظ ہو گیا۔`,
      type: "SUCCESS",
      category: "TIMETABLE",
      target_role: "PRINCIPAL",
    });
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
    notify({
      title: "Fee Payment Recorded",
      title_ur: "فیس ادائیگی درج",
      message: `PKR ${markPaidModal.record.amount} marked as PAID for ${markPaidModal.record.student_name} via ${markPaidModal.method}.`,
      message_ur: `${markPaidModal.record.student_name} کی فیس وصولی ریکارڈ ہو گئی۔`,
      type: "SUCCESS",
      category: "FEE",
      target_role: "PRINCIPAL",
    });
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
    notify({
      title: "Class Created",
      title_ur: "نئی کلاس شامل کی گئی",
      message: `${newClassName} (${newClassSection}) added to school classes.`,
      message_ur: `${newClassName} کلاس کامیابی سے شامل کر دی گئی۔`,
      type: "SUCCESS",
      category: "SYSTEM",
      target_role: "PRINCIPAL",
    });
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
    notify({
      title: "Staff Member Added",
      title_ur: "نیا اسٹاف ممبر شامل کیا گیا",
      message: `${staffFormData.name} (${staffFormData.role}) onboarded with ID ${creds.staff.identifier}.`,
      message_ur: `${staffFormData.name} کا اکاؤنٹ بن گیا۔`,
      type: "SUCCESS",
      category: "STAFF",
      target_role: "PRINCIPAL",
    });
    setCreatedStaffCreds(creds);
    setStaffFormData({ name: "", phone: "", role: "TEACHER", email: "" });
    refreshAll();
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const creds = addStudent(currentUser.school_id, {
      ...studentFormData,
      monthly_fee: Number(studentFormData.monthly_fee) || 4500,
    });
    notify({
      title: "Student Admitted",
      title_ur: "نیا طالب علم داخل ہو گیا",
      message: `${studentFormData.name} enrolled in ${classesList.find((c) => c.id === studentFormData.class_id)?.name || "Class"} (Roll #${studentFormData.roll_no}, ID: ${creds.student.student_id}).`,
      message_ur: `${studentFormData.name} کا داخلہ کامیابی سے مکمل ہو گیا۔`,
      type: "SUCCESS",
      category: "ADMISSION",
      target_role: "PRINCIPAL",
    });
    setCreatedStudentCreds(creds);
    setStudentFormData((prev) => ({
      ...prev,
      name: "",
      roll_no: "",
      parent_whatsapp: "",
      monthly_fee: 4500,
    }));
    refreshAll();
  };

  const handleQuickAdjustFee = (recordId: string, delta: number) => {
    adjustFeeRecordAmount(recordId, delta);
    refreshAll();
  };

  const handleCustomFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustFeeModal) return;
    updateFeeRecordAmount(adjustFeeModal.record.id, adjustFeeModal.amount);
    setAdjustFeeModal(null);
    refreshAll();
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !announcementForm.title || !announcementForm.content) return;
    const newAnn = addAnnouncement(currentUser.school_id, announcementForm);
    notify({
      title: "Announcement Broadcast",
      title_ur: "نیا اعلان جاری کیا گیا",
      message: `"${newAnn.title}" broadcasted to ${newAnn.audience} with WhatsApp fallback.`,
      message_ur: `اعلان کامیابی سے تمام متعلقہ افراد تک پہنچا دیا گیا۔`,
      type: "INFO",
      category: "ANNOUNCEMENT",
      target_role: "PRINCIPAL",
    });
    setAnnouncementSentNotice(
      `✓ Announcement broadcasted (${newAnn.priority} priority)! Triggered automatic WhatsApp fallback to ${newAnn.recipients_count} recipients.`
    );
    setAnnouncementForm({
      title: "",
      content: "",
      audience: "ALL",
      priority: "NORMAL",
      class_name: "",
    });
    refreshAll();
    setTimeout(() => setAnnouncementSentNotice(null), 6000);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) return;
    const updated = updateSchoolProfile(currentUser.school_id, {
      ...profileForm,
      late_fee_amount: Number(profileForm.late_fee_amount) || 0,
    });
    if (updated) {
      setSchoolData(updated);
      notify({
        title: "School Profile Saved",
        title_ur: "اسکول پروفائل محفوظ",
        message: "School timings, contact info, and payment settings updated successfully.",
        message_ur: "اسکول کے اوقات اور معلومات کامیابی سے محفوظ ہو گئیں۔",
        type: "SUCCESS",
        category: "SYSTEM",
        target_role: "PRINCIPAL",
      });
      setProfileNotice(t.profileUpdatedSuccess || "✓ School profile & settings updated successfully!");
      setTimeout(() => setProfileNotice(null), 4000);
    }
  };

  const isAccountant = currentUser?.role === "ACCOUNTANT";

  // Tab definitions based on role
  const availableTabs = isAccountant
    ? [
        { id: "fees", label: "Fee Management & Payments", icon: CreditCard },
        { id: "settings", label: t.tabSettings || "Settings", icon: Settings },
      ]
    : [
        { id: "overview", label: t.tabOverview || "Overview", icon: TrendingUp },
        { id: "classes", label: t.tabClasses || "Classes & Sections", icon: BookOpen },
        { id: "timetable", label: t.tabTimetable || "Timetable", icon: Clock },
        { id: "staff", label: t.tabStaff || "Staff Management", icon: Users },
        { id: "staff-attendance", label: t.tabStaffAttendance || "Staff Attendance", icon: CalendarCheck },
        { id: "students", label: t.tabStudents || "Student Admissions", icon: UserPlus },
        { id: "fees", label: t.tabFees || "Fee Management", icon: CreditCard },
        { id: "announcements", label: t.tabAnnouncements || "Announcements & WhatsApp", icon: MessageSquare },
        { id: "profile", label: t.tabSchoolProfile || "School Profile", icon: Building2 },
        { id: "settings", label: t.tabSettings || "Settings", icon: Settings },
      ];

  return (
    <DashboardShell
      currentUser={currentUser}
      schoolName={schoolData?.name || "Beacon Grammar School"}
      schoolCity={schoolData?.city || "Lahore"}
      tenantId={currentUser?.school_id}
      navItems={availableTabs}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as any)}
      onLogout={handleLogout}
    >
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
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4 text-slate-600" />
                  <span>Admit Student</span>
                </button>
                <button
                  onClick={() => setActiveTab("fees")}
                  className="bg-[#0B3B2E] hover:bg-[#082C22] text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-2 transition-all"
                >
                  <CreditCard className="w-4 h-4 text-emerald-300" />
                  <span>Fee Register</span>
                </button>
              </div>
            </div>

            {/* Daily School Pulse Morning Command Strip (Overview Only) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_25px_rgb(0,0,0,0.03)] p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-[#0B3B2E] text-white flex items-center justify-center shadow-2xs flex-shrink-0">
                    <Activity className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {isRtl ? "روزانہ اسکول پلس — صبح کی کارروائی" : "Daily School Pulse"}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wide border border-emerald-200/70">
                        {isRtl ? "لائیو آپریشنز" : "Live Operations"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {isRtl
                        ? "اسکول کے یومیہ آپریشنز کا جائزہ: اسٹاف کی حاضری، کلاس حاضری اور فیس ریکوری"
                        : "Real-time morning operations check: staff check-in, class roll-calls, and fee collection."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">
                    {new Date().toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* 3 Actionable Command Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Unmarked / Late Staff Alert */}
                <div
                  className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between space-y-3 ${
                    unmarkedStaff.length > 0
                      ? "bg-amber-50/60 border-amber-200/80"
                      : lateStaff.length > 0
                      ? "bg-orange-50/60 border-orange-200/80"
                      : "bg-emerald-50/40 border-emerald-200/70"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {isRtl ? "اسٹاف چیک ان اسٹیٹس" : "Staff Check-In Status"}
                      </span>
                      {unmarkedStaff.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                          {unmarkedStaff.length} {isRtl ? "غیر حاضر/بغیر حاضری" : "Unmarked"}
                        </span>
                      ) : lateStaff.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-bold text-[10px]">
                          {lateStaff.length} {isRtl ? "تاخیر" : "Late"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {isRtl ? "سب حاضر" : "100% Present"}
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      {unmarkedStaff.length > 0 ? (
                        <span className="text-amber-800">
                          {unmarkedStaff.length} {isRtl ? "اسٹاف ممبرز غیر نشان زد ہیں" : "Staff Unmarked / Absent"}
                        </span>
                      ) : (
                        <span className="text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{isRtl ? "تمام اساتذہ وقت پر پہنچ چکے ہیں" : "All Staff On Duty"}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600">
                      {staffAttendanceStats.present + staffAttendanceStats.late} of {staffAttendanceStats.totalStaff} staff members checked in today.
                      {lateStaff.length > 0 && ` (${lateStaff.length} arrived late)`}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    {unmarkedStaff.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowUnmarkedStaffDrawer(!showUnmarkedStaffDrawer)}
                        className="text-[11px] font-bold text-amber-800 hover:text-amber-900 underline cursor-pointer"
                      >
                        {showUnmarkedStaffDrawer
                          ? (isRtl ? "فہرست چھپائیں" : "Hide List")
                          : (isRtl ? `فہرست دیکھیں (${unmarkedStaff.length})` : `View Unmarked (${unmarkedStaff.length})`)}
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-medium">✓ Clean roster</span>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveTab("staff-attendance")}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    >
                      <span>{isRtl ? "اسٹاف حاضری" : "Staff Log"}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* 2. Pending Class Roll-Calls */}
                <div
                  className={`rounded-xl border p-3.5 transition-all flex flex-col justify-between space-y-3 ${
                    pendingRollCallClasses.length > 0
                      ? "bg-rose-50/60 border-rose-200/80"
                      : "bg-emerald-50/40 border-emerald-200/70"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {isRtl ? "کلاس حاضری رجسٹر" : "Class Roll-Calls"}
                      </span>
                      {pendingRollCallClasses.length > 0 ? (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                          {pendingRollCallClasses.length} {isRtl ? "زیر التواء" : "Pending"}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          {isRtl ? "مکمل" : "All Submitted"}
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-extrabold text-slate-900">
                      {pendingRollCallClasses.length > 0 ? (
                        <span className="text-rose-800">
                          {pendingRollCallClasses.length} {isRtl ? "کلاسز کی حاضری ابھی باقی ہے" : "Classes Awaiting Roll-Call"}
                        </span>
                      ) : (
                        <span className="text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{isRtl ? "تمام کلاسز کی حاضری جمع ہو گئی" : "All Roll-Calls Recorded"}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 truncate">
                      {pendingRollCallClasses.length > 0
                        ? `${pendingRollCallClasses.map((c) => c.name).slice(0, 2).join(", ")}${pendingRollCallClasses.length > 2 ? ` +${pendingRollCallClasses.length - 2} more` : ""}`
                        : "Morning student attendance registered across all active sections."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {classesList.length - pendingRollCallClasses.length} / {classesList.length} classes done
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("classes")}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    >
                      <span>{isRtl ? "کلاسز دیکھیں" : "View Classes"}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* 3. Today's Fee Collection Snapshot */}
                <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/40 p-3.5 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {isRtl ? "آج کی فیس ریکوری" : "Today's Fee Snapshot"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px]">
                        {todayFeePulse.todayCount} {isRtl ? "کلیرڈ" : "Cleared Today"}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <div className="text-base sm:text-lg font-black text-slate-900">
                        PKR {todayFeePulse.todayCollectedPKR.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {isRtl ? "آج موصولہ" : "collected today"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      Pending balance: <strong className="text-slate-900 font-semibold">PKR {todayFeePulse.pendingBalancePKR.toLocaleString()}</strong> awaiting clearance.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-indigo-700 font-semibold">
                      JazzCash & Bank Active
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab("fees")}
                      className="px-2.5 py-1.5 rounded-lg bg-[#0B3B2E] hover:bg-[#082C22] text-white font-semibold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                    >
                      <span>{isRtl ? "فیس رجسٹر" : "Fee Register"}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Unmarked Staff List Drawer */}
              {showUnmarkedStaffDrawer && unmarkedStaff.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      {isRtl ? "غیر نشان زد یا غیر حاضر اسٹاف کی فہرست:" : "Unmarked / Absent Staff Members Today:"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowUnmarkedStaffDrawer(false)}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {unmarkedStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs truncate">{staff.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{staff.role} • {staff.phone}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleQuickStaffStatus(staff.id, "PRESENT");
                          }}
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold border border-emerald-200 flex-shrink-0 cursor-pointer"
                          title="Mark Present"
                        >
                          Mark Present
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Elevated Stats Cards with Inline Mini Sparklines & Bar Graphs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Students -> switches to Student Admissions */}
              <div
                onClick={() => setActiveTab("students")}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2 relative overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all group"
                title="Click to view Student Admissions roster"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Students</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-extrabold text-slate-900">{stats?.totalStudents || 0}</div>
                  <SparklineGreenWave />
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-between font-medium pt-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-600 font-semibold">{stats?.attendanceTodayPercent}%</span>
                    <span>attendance</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>Admissions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Card 2: Teachers & Staff -> switches to Staff Management */}
              <div
                onClick={() => setActiveTab("staff")}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2 cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all group relative overflow-hidden"
                title="Click to view Staff Management & profiles"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Teachers & Staff</span>
                  <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-extrabold text-slate-900">{stats?.totalStaff || 0}</div>
                  <SparklineBluePulse />
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-between font-medium pt-0.5">
                  <span>{staffAttendanceStats.present + staffAttendanceStats.late} present today</span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>Staff Roster</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Card 3: Classes & Sections -> switches to Classes & Sections */}
              <div
                onClick={() => setActiveTab("classes")}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2 relative overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all group"
                title="Click to manage classes, sections & subjects"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Classes & Sections</span>
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-extrabold text-slate-900">{classesList.length || 0}</div>
                  <MiniBarChart />
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-between font-medium pt-0.5">
                  <span>All grades active</span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>Manage</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Card 4: November Fee Collection -> switches to Fee Management */}
              <div
                onClick={() => setActiveTab("fees")}
                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-2 relative overflow-hidden cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md transition-all group"
                title="Click to open Fee Management & payment register"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">November Fee Collection</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                  PKR {(feeSummary?.totalCollectedPKR || 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-between font-medium pt-0.5">
                  <span className="truncate">
                    {feeSummary?.paidCount || 0} Paid • {feeSummary?.unpaidCount || 0} Unpaid
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5 flex-shrink-0 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                    <span>Fee Register</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Preview Grid (Classroom Distribution + Fee Recovery Pulse) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">Classroom Distribution</h3>
                  <button
                    onClick={() => setActiveTab("classes")}
                    className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Manage Classes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {classesList.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-between hover:border-slate-200 transition-all"
                    >
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {c.name} - Section {c.section}
                        </div>
                        <div className="text-xs text-slate-500">Teacher: {c.class_teacher_name || "Unassigned"}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                        {c.student_count || 0} Students
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Recovery Pulse Featured Highlight Card */}
              <div className="bg-[#ECFDF5]/80 border border-emerald-100 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px] uppercase tracking-wider">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Fee Recovery Pulse</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">JazzCash & Easypaisa Active</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    Accountants and Principals manage monthly dues and send 1-click WhatsApp payment reminders with ease.
                  </p>
                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1 shadow-2xs">
                    <div className="font-semibold flex items-center gap-1.5 text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{feeSummary?.paidCount || 0} Payments Reconciled</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      PKR {(feeSummary?.totalPendingPKR || 0).toLocaleString()} awaiting parent clearance.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("fees")}
                  className="w-full py-2.5 rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
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
            {/* Fee Action Banner */}
            {feeActionNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{feeActionNotice}</span>
                </div>
                <button onClick={() => setFeeActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer">✕</button>
              </div>
            )}

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

            {/* School Receiving Payment Accounts Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{t.paymentAccountsTitle || "School Receiving Payment Accounts"}</h3>
                    <p className="text-[11px] text-slate-400">Active bank and wallet accounts where students/parents transfer tuition fees.</p>
                  </div>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-700/80 text-emerald-400 border border-emerald-500/30">
                  Managed via Super Admin
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Bank */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px]">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>{schoolData?.bank_name || "Meezan Bank Limited"}</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate">
                    {schoolData?.bank_account_title || schoolData?.name || "School Account"}
                  </div>
                  <div className="font-mono text-[11px] text-slate-300">
                    {schoolData?.bank_account_number || "PK64MEZN0001020304050607"}
                  </div>
                </div>

                {/* Easypaisa */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Easypaisa Account</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate">
                    {schoolData?.easypaisa_title || schoolData?.name || "School Easypaisa"}
                  </div>
                  <div className="font-mono text-[11px] text-slate-300">
                    {schoolData?.easypaisa_number || schoolData?.phone || "0300-4567890"}
                  </div>
                </div>

                {/* JazzCash */}
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>JazzCash Account</span>
                  </div>
                  <div className="font-bold text-white text-xs truncate">
                    {schoolData?.jazzcash_title || schoolData?.name || "School JazzCash"}
                  </div>
                  <div className="font-mono text-[11px] text-slate-300">
                    {schoolData?.jazzcash_number || schoolData?.phone || "0300-4567890"}
                  </div>
                </div>
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
                <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none p-0.5 rounded-xl border border-slate-200 bg-slate-50">
                  {(["ALL", "PAID", "UNPAID"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setFeeStatusFilter(st)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[36px] ${
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

                      <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Monthly Fee:</span>
                          <span className="font-extrabold text-slate-900 text-sm">
                            PKR {(rec.amount || 0).toLocaleString()}
                          </span>
                        </div>

                        {!isPaid && (
                          <div className="flex items-center justify-between gap-1.5 pt-1 text-[11px]">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Fee Adjustment:</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustFee(rec.id, -500)}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold transition-all text-xs"
                                title="Subtract Rs. 500 (Discount/Concession)"
                              >
                                -500
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustFee(rec.id, 500)}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold transition-all text-xs"
                                title="Add Rs. 500"
                              >
                                +500
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdjustFeeModal({ record: rec, amount: rec.amount || 4500 })}
                                className="px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-semibold transition-all text-xs flex items-center gap-1"
                                title="Custom Fee / Scholarship"
                              >
                                <Edit3 className="w-3 h-3 text-slate-500" />
                                <span>Edit</span>
                              </button>
                            </div>
                          </div>
                        )}
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
                            <div className="flex items-center gap-2">
                              <span>PKR {(rec.amount || 0).toLocaleString()}</span>
                              {!isPaid && (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => handleQuickAdjustFee(rec.id, -500)}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-600 transition-colors"
                                    title="Quick - Rs. 500 Discount"
                                  >
                                    -500
                                  </button>
                                  <button
                                    onClick={() => handleQuickAdjustFee(rec.id, 500)}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                                    title="Quick + Rs. 500"
                                  >
                                    +500
                                  </button>
                                  <button
                                    onClick={() => setAdjustFeeModal({ record: rec, amount: rec.amount || 4500 })}
                                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title="Set Custom Fee Amount / Scholarship"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
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
                    <div className="flex items-center gap-2.5">
                      {st.avatar_url ? (
                        <img
                          src={st.avatar_url}
                          alt={st.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200 flex-shrink-0">
                          {st.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedStaffForProfile(st)}
                          className="font-extrabold text-slate-900 text-sm text-left cursor-pointer hover:text-emerald-700 hover:underline transition-colors block"
                          title="View Staff Profile"
                        >
                          {st.name}
                        </button>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {st.identifier}</div>
                      </div>
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

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedStaffForProfile(st)}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[40px] transition-all shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Show Profile</span>
                    </button>
                    {st.phone ? (
                      <a
                        href={formatWhatsAppUrl(st.phone, `Assalam-o-Alaikum ${st.name}, from ${schoolData?.name}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[40px] transition-all"
                      >
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <div className="flex items-center justify-center text-xs text-slate-400">No Phone</div>
                    )}
                  </div>
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
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          {st.avatar_url ? (
                            <img
                              src={st.avatar_url}
                              alt={st.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200 flex-shrink-0">
                              {st.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedStaffForProfile(st)}
                            className="font-bold text-slate-900 text-left cursor-pointer hover:text-emerald-700 hover:underline transition-colors"
                            title="View Staff Profile"
                          >
                            {st.name}
                          </button>
                        </div>
                      </td>
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedStaffForProfile(st)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-all shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Show Profile</span>
                          </button>
                          {st.phone && (
                            <a
                              href={formatWhatsAppUrl(st.phone, `Assalam-o-Alaikum ${st.name}, from ${schoolData?.name}.`)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-semibold text-xs transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenPromoteModal}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Bulk promote students from one class to next grade"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{isRtl ? "کلاس پروموٹ کریں" : "Promote Class"}</span>
                </button>
                <button
                  onClick={() => {
                    setCreatedStudentCreds(null);
                    setShowStudentModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Admit New Student</span>
                </button>
              </div>
            </div>

            {promotionNotice && (
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>{promotionNotice}</span>
                </div>
                <button
                  onClick={() => setPromotionNotice(null)}
                  className="text-indigo-700 hover:text-indigo-900 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

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
                      {std.avatar_url ? (
                        <img
                          src={std.avatar_url}
                          alt={std.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {std.roll_no}
                        </div>
                      )}
                      <div>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForProfile(std)}
                          className="font-extrabold text-slate-900 text-sm text-left cursor-pointer hover:text-emerald-700 hover:underline transition-colors block"
                          title="View Student Profile"
                        >
                          {std.name}
                        </button>
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

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForProfile(std)}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[40px] transition-all shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Show Profile</span>
                    </button>
                    {std.parent_whatsapp ? (
                      <a
                        href={formatWhatsAppUrl(
                          std.parent_whatsapp,
                          `Mohtaram Parent of ${std.name}, update from ${schoolData?.name}:`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 font-bold text-xs flex items-center justify-center gap-1.5 min-h-[40px] transition-all"
                      >
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <div className="flex items-center justify-center text-xs text-slate-400">No Phone</div>
                    )}
                  </div>
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
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          {std.avatar_url ? (
                            <img
                              src={std.avatar_url}
                              alt={std.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center border border-emerald-200 flex-shrink-0">
                              {std.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForProfile(std)}
                            className="font-bold text-slate-900 text-left cursor-pointer hover:text-emerald-700 hover:underline transition-colors"
                            title="View Student Profile"
                          >
                            {std.name}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-xs">
                          {std.class_name} - {std.section}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{std.student_id}</td>
                      <td className="py-3.5 px-4 text-slate-600">{std.parent_whatsapp}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForProfile(std)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition-all shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Show Profile</span>
                          </button>
                          {std.parent_whatsapp && (
                            <a
                              href={formatWhatsAppUrl(
                                std.parent_whatsapp,
                                `Mohtaram Parent of ${std.name}, update from ${schoolData?.name}:`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-semibold text-xs transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.announcementTitle || "Announcement Title"} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Winter Vacation Notification / Exam Schedule"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.targetAudience || "Target Audience"} *
                    </label>
                    <select
                      value={announcementForm.audience}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, audience: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                    >
                      <option value="ALL">{t.audienceAll || "ALL — All School (Parents + Staff)"}</option>
                      <option value="PARENTS">{t.audienceParents || "PARENTS — Parents & Students Only"}</option>
                      <option value="STAFF">{t.audienceStaff || "STAFF — Teachers & Staff Only"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t.urgencyPriority || "Urgency / Priority Level"} *
                    </label>
                    <select
                      value={announcementForm.priority}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 bg-white ${
                        announcementForm.priority === "URGENT"
                          ? "border-rose-400 text-rose-700 focus:ring-rose-500"
                          : announcementForm.priority === "IMPORTANT"
                          ? "border-amber-400 text-amber-700 focus:ring-amber-500"
                          : "border-slate-300 text-slate-700 focus:ring-emerald-500"
                      }`}
                    >
                      <option value="NORMAL">🟢 {t.priorityNormal || "NORMAL (General Notice)"}</option>
                      <option value="IMPORTANT">🟡 {t.priorityImportant || "IMPORTANT (Important Update)"}</option>
                      <option value="URGENT">🔴 {t.priorityUrgent || "URGENT (Alert / Emergency Holiday)"}</option>
                    </select>
                  </div>
                </div>

                {/* Quick Priority Select Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">Quick Priority:</span>
                  {(["NORMAL", "IMPORTANT", "URGENT"] as const).map((p) => {
                    const active = announcementForm.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAnnouncementForm({ ...announcementForm, priority: p })}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 min-h-[32px] ${
                          active
                            ? p === "URGENT"
                              ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                              : p === "IMPORTANT"
                              ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                              : "bg-slate-800 text-white border-slate-800 shadow-xs"
                            : p === "URGENT"
                            ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                            : p === "IMPORTANT"
                            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                            : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {p === "URGENT" && (
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        )}
                        {p === "URGENT"
                          ? `🚨 ${t.priorityUrgent || "URGENT"}`
                          : p === "IMPORTANT"
                          ? `⚡ ${t.priorityImportant || "IMPORTANT"}`
                          : `📢 ${t.priorityNormal || "NORMAL"}`}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type official notification message here (English or Urdu)..."
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Auto-triggers WhatsApp template dispatch (Prefixes 🚨 *URGENT NOTICE:* for urgent alerts)</span>
                  </div>

                  <button
                    type="submit"
                    className={`px-6 py-2.5 rounded-xl text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                      announcementForm.priority === "URGENT"
                        ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                        : "bg-slate-900 hover:bg-slate-800"
                    }`}
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
                {announcementsList.map((ann) => {
                  const whatsappUrl = getAnnouncementWhatsAppUrl({
                    schoolName: schoolData?.name || "Beacon Grammar School",
                    title: ann.title,
                    content: ann.content,
                    audience: ann.audience,
                    priority: ann.priority,
                  });

                  return (
                    <div
                      key={ann.id}
                      className={`p-5 rounded-2xl bg-white border shadow-2xs space-y-3 transition-all ${
                        ann.priority === "URGENT"
                          ? "border-rose-300 ring-1 ring-rose-100 bg-rose-50/20"
                          : "border-slate-200/80"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm sm:text-base">{ann.title}</span>

                          {/* Audience Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              ann.audience === "STAFF" || (ann.audience as any) === "TEACHERS"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : ann.audience === "PARENTS"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {ann.audience === "STAFF" || (ann.audience as any) === "TEACHERS"
                              ? "Teachers & Staff"
                              : ann.audience === "PARENTS"
                              ? "Parents Only"
                              : "All School"}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${
                              ann.priority === "URGENT"
                                ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                                : ann.priority === "IMPORTANT"
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {ann.priority === "URGENT" && <AlertCircle className="w-3 h-3 text-rose-600 flex-shrink-0" />}
                            {ann.priority || "NORMAL"}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400 flex-shrink-0">
                          {new Date(ann.created_at).toLocaleDateString("en-PK", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">{ann.content}</p>

                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 text-[11px] text-emerald-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="font-semibold">
                            Delivered to {ann.recipients_count || 148} WhatsApp contacts & portal feeds
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-800 border border-green-200 font-bold text-[11px] flex items-center gap-1.5 transition-colors min-h-[34px]"
                            title="Open WhatsApp broadcast template"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                            <span>WhatsApp Broadcast</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${ann.priority === "URGENT" ? "🚨 *URGENT NOTICE:*\n" : ""}${ann.title}\n\n${ann.content}`
                              );
                              setCopiedKey(ann.id);
                              setTimeout(() => setCopiedKey(null), 2500);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 min-h-[34px] transition-colors"
                          >
                            {copiedKey === ann.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied!</span>
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
                    </div>
                  );
                })}
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
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1 px-1">
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
                        className={`flex-shrink-0 min-w-[85px] sm:min-w-[100px] py-2 px-3.5 rounded-xl text-center transition-all min-h-[44px] flex flex-col items-center justify-center whitespace-nowrap ${
                          active
                            ? "bg-slate-900 text-white shadow-2xs font-bold"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight whitespace-nowrap">
                          {isRtl ? labels[d].ur : labels[d].en}
                        </span>
                        <span
                          className={`text-[10px] mt-0.5 whitespace-nowrap ${
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

        {/* ========================================================================= */}
        {/* TAB 8: TEACHER & STAFF DAILY ATTENDANCE (CHECK-IN / CHECK-OUT) */}
        {/* ========================================================================= */}
        {activeTab === "staff-attendance" && !isAccountant && (
          <div className="space-y-6">
            {/* Top Staff Attendance Action Notice */}
            {staffAttendanceNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{staffAttendanceNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStaffAttendanceNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header & Date Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <CalendarCheck className="w-6 h-6 text-emerald-600" />
                  <span>{t.staffAttendanceTitle || "Teacher & Staff Daily Attendance"}</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t.staffAttendanceSubtitle || "Real-time check-in, check-out tracking & principal override"}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-2xs">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="date"
                    value={staffAttendanceDate}
                    onChange={(e) => setStaffAttendanceDate(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none"
                  />
                </div>
                {staffAttendanceDate !== getTodayDateStr() && (
                  <button
                    type="button"
                    onClick={() => setStaffAttendanceDate(getTodayDateStr())}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors min-h-[38px]"
                  >
                    Today
                  </button>
                )}
              </div>
            </div>

            {/* 4 Daily Overview Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>{t.totalStaff || "Total Staff"}</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {staffAttendanceStats.totalStaff}
                </div>
                <div className="text-[11px] text-slate-500">Registered employees</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-2xs space-y-1 bg-gradient-to-b from-white to-emerald-50/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center justify-between">
                  <span>{t.presentToday || "Present Today"}</span>
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                  {staffAttendanceStats.present}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">On-time check-ins</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-1 bg-gradient-to-b from-white to-amber-50/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between">
                  <span>{t.lateArrivals || "Late Arrivals"}</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                  {staffAttendanceStats.late}
                </div>
                <div className="text-[11px] text-amber-600 font-semibold">After 8:15 AM</div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200/80 shadow-2xs space-y-1 bg-gradient-to-b from-white to-rose-50/20">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center justify-between">
                  <span>{t.absentToday || "Absent"}</span>
                  <UserX className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-700">
                  {staffAttendanceStats.absent}
                </div>
                <div className="text-[11px] text-slate-500">
                  {staffAttendanceStats.onLeave > 0
                    ? `${staffAttendanceStats.onLeave} on approved leave`
                    : "No check-in recorded"}
                </div>
              </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search staff by name, identifier, or phone..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  />
                  {staffSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setStaffSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={staffRoleFilter}
                    onChange={(e) => setStaffRoleFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="TEACHER">Teachers Only</option>
                    <option value="ACCOUNTANT">Accountants Only</option>
                  </select>
                </div>
              </div>

              {/* Status Filter Horizontal Scrollable Pills */}
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-bold uppercase text-slate-400 mr-1 flex-shrink-0">Status:</span>
                {[
                  { id: "ALL", label: `All (${staffAttendanceList.length})` },
                  { id: "PRESENT", label: `Present (${staffAttendanceStats.present})` },
                  { id: "LATE", label: `Late (${staffAttendanceStats.late})` },
                  { id: "ABSENT", label: `Absent (${staffAttendanceStats.absent})` },
                  { id: "ON_LEAVE", label: `On Leave (${staffAttendanceStats.onLeave})` },
                ].map((st) => {
                  const active = staffStatusFilter === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStaffStatusFilter(st.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 min-h-[36px] ${
                        active
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Staff Attendance List */}
            {staffAttendanceList.filter((rec) => {
              const matchesStatus = staffStatusFilter === "ALL" || rec.status === staffStatusFilter;
              const matchesRole = staffRoleFilter === "ALL" || rec.user_role === staffRoleFilter;
              const q = staffSearchQuery.toLowerCase().trim();
              const matchesSearch =
                !q ||
                (rec.user_name || "").toLowerCase().includes(q) ||
                (rec.user_identifier || "").toLowerCase().includes(q) ||
                (rec.user_phone || "").toLowerCase().includes(q);
              return matchesStatus && matchesRole && matchesSearch;
            }).length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                <Users className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold">No staff records found matching your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setStaffStatusFilter("ALL");
                    setStaffRoleFilter("ALL");
                    setStaffSearchQuery("");
                  }}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop View Table (>= 768px) */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4">Staff Member</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Check-In</th>
                        <th className="py-3.5 px-4">Check-Out</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Notes / Remarks</th>
                        <th className="py-3.5 px-4 text-right">Principal Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {staffAttendanceList
                        .filter((rec) => {
                          const matchesStatus = staffStatusFilter === "ALL" || rec.status === staffStatusFilter;
                          const matchesRole = staffRoleFilter === "ALL" || rec.user_role === staffRoleFilter;
                          const q = staffSearchQuery.toLowerCase().trim();
                          const matchesSearch =
                            !q ||
                            (rec.user_name || "").toLowerCase().includes(q) ||
                            (rec.user_identifier || "").toLowerCase().includes(q) ||
                            (rec.user_phone || "").toLowerCase().includes(q);
                          return matchesStatus && matchesRole && matchesSearch;
                        })
                        .map((rec) => {
                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                                    {(rec.user_name || "S").substring(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 truncate">{rec.user_name}</div>
                                    <div className="text-[11px] text-slate-400 font-mono">
                                      {rec.user_identifier || "ID-N/A"} • {rec.user_phone || "—"}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    rec.user_role === "TEACHER"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}
                                >
                                  {rec.user_role === "TEACHER" ? "Teacher" : "Accountant"}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                {rec.check_in_time ? (
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                    <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                    <span>{rec.check_in_time}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-mono">—</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {rec.check_out_time ? (
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                    <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                    <span>{rec.check_out_time}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-mono">—</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                    rec.status === "PRESENT"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : rec.status === "LATE"
                                      ? "bg-amber-50 text-amber-800 border-amber-200"
                                      : rec.status === "ON_LEAVE"
                                      ? "bg-purple-50 text-purple-700 border-purple-200"
                                      : "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      rec.status === "PRESENT"
                                        ? "bg-emerald-500"
                                        : rec.status === "LATE"
                                        ? "bg-amber-500"
                                        : rec.status === "ON_LEAVE"
                                        ? "bg-purple-500"
                                        : "bg-rose-500"
                                    }`}
                                  />
                                  {rec.status === "PRESENT"
                                    ? t.present || "Present"
                                    : rec.status === "LATE"
                                    ? t.late || "Late"
                                    : rec.status === "ON_LEAVE"
                                    ? t.onLeave || "On Leave"
                                    : t.absent || "Absent"}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="text-[11px] text-slate-500 truncate max-w-[180px] block" title={rec.notes}>
                                  {rec.notes || "—"}
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Quick 1-click status override pills */}
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStaffStatus(rec.user_id, "PRESENT")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all min-h-[30px] ${
                                      rec.status === "PRESENT"
                                        ? "bg-emerald-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200"
                                    }`}
                                    title="Mark Present"
                                  >
                                    P
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickStaffStatus(rec.user_id, "LATE")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all min-h-[30px] ${
                                      rec.status === "LATE"
                                        ? "bg-amber-500 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700 border border-slate-200"
                                    }`}
                                    title="Mark Late"
                                  >
                                    L
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickStaffStatus(rec.user_id, "ABSENT")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all min-h-[30px] ${
                                      rec.status === "ABSENT"
                                        ? "bg-rose-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200"
                                    }`}
                                    title="Mark Absent"
                                  >
                                    A
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleQuickStaffStatus(rec.user_id, "ON_LEAVE")}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all min-h-[30px] ${
                                      rec.status === "ON_LEAVE"
                                        ? "bg-purple-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700 border border-slate-200"
                                    }`}
                                    title="Mark On Leave"
                                  >
                                    Leave
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStaffModal(rec)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors ml-1 min-h-[30px] min-w-[30px] flex items-center justify-center"
                                    title="Edit Times & Notes"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Stacked Cards (< 768px) */}
                <div className="md:hidden space-y-3">
                  {staffAttendanceList
                    .filter((rec) => {
                      const matchesStatus = staffStatusFilter === "ALL" || rec.status === staffStatusFilter;
                      const matchesRole = staffRoleFilter === "ALL" || rec.user_role === staffRoleFilter;
                      const q = staffSearchQuery.toLowerCase().trim();
                      const matchesSearch =
                        !q ||
                        (rec.user_name || "").toLowerCase().includes(q) ||
                        (rec.user_identifier || "").toLowerCase().includes(q) ||
                        (rec.user_phone || "").toLowerCase().includes(q);
                      return matchesStatus && matchesRole && matchesSearch;
                    })
                    .map((rec) => {
                      return (
                        <div
                          key={rec.id}
                          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs flex-shrink-0">
                                {(rec.user_name || "S").substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-sm truncate">{rec.user_name}</h4>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {rec.user_identifier} • {rec.user_phone || "—"}
                                </div>
                              </div>
                            </div>

                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border flex-shrink-0 ${
                                rec.status === "PRESENT"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : rec.status === "LATE"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : rec.status === "ON_LEAVE"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {rec.status === "PRESENT"
                                ? t.present || "Present"
                                : rec.status === "LATE"
                                ? t.late || "Late"
                                : rec.status === "ON_LEAVE"
                                ? t.onLeave || "On Leave"
                                : t.absent || "Absent"}
                            </span>
                          </div>

                          {/* Times Info Grid */}
                          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Check-In</span>
                              <span className="font-bold text-slate-800">{rec.check_in_time || "Not Recorded"}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase">Check-Out</span>
                              <span className="font-bold text-slate-800">{rec.check_out_time || "Not Recorded"}</span>
                            </div>
                            {rec.notes && (
                              <div className="col-span-2 pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                                <strong className="text-slate-700">Note:</strong> {rec.notes}
                              </div>
                            )}
                          </div>

                          {/* Mobile Override Buttons Bar */}
                          <div className="pt-1 flex items-center justify-between gap-1.5 border-t border-slate-100 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Override:</span>
                            <div className="flex items-center gap-1 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleQuickStaffStatus(rec.user_id, "PRESENT")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                                  rec.status === "PRESENT"
                                    ? "bg-emerald-600 text-white shadow-2xs"
                                    : "bg-slate-100 text-slate-700 hover:bg-emerald-50 border border-slate-200"
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStaffStatus(rec.user_id, "LATE")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                                  rec.status === "LATE"
                                    ? "bg-amber-500 text-white shadow-2xs"
                                    : "bg-slate-100 text-slate-700 hover:bg-amber-50 border border-slate-200"
                                }`}
                              >
                                Late
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickStaffStatus(rec.user_id, "ABSENT")}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[36px] ${
                                  rec.status === "ABSENT"
                                    ? "bg-rose-600 text-white shadow-2xs"
                                    : "bg-slate-100 text-slate-700 hover:bg-rose-50 border border-slate-200"
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditStaffModal(rec)}
                                className="p-2 rounded-lg text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
                                title="Edit Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: SCHOOL PROFILE & INSTITUTIONAL SETTINGS (PRINCIPAL ONLY) */}
        {/* ========================================================================= */}
        {activeTab === "profile" && !isAccountant && (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Building2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
                <span>{t.tabSchoolProfile || "School Profile & Settings"}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Configure official institution details, campus timings, bank & mobile accounts, and school policies.
              </p>
            </div>

            {/* Profile Action Notice */}
            {profileNotice && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{profileNotice}</span>
                </div>
                <button
                  onClick={() => setProfileNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* 5 Sub-tab Navigation Bar (Horizontal Scrollable) */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
                {[
                  { id: "school-info", label: t.schoolInfo || "School Info", icon: Building2 },
                  { id: "timings", label: t.timingsAndCalendar || "Timings & Calendar", icon: Clock },
                  { id: "classes-subjects", label: t.classesAndSubjects || "Classes & Subjects", icon: BookOpen },
                  { id: "fees-accounts", label: t.feesAndAccounts || "Fees & Accounts", icon: CreditCard },
                  { id: "policies", label: t.policiesAndQuietHours || "Policies & Quiet Hours", icon: ShieldCheck },
                ].map((sub) => {
                  const SubIcon = sub.icon;
                  const active = profileSubTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setProfileSubTab(sub.id as any)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 min-h-[42px] flex-shrink-0 ${
                        active
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <SubIcon className={`w-4 h-4 ${active ? "text-white" : "text-slate-500"}`} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub-tab 1: School Info */}
            {profileSubTab === "school-info" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                        <span>Basic Institutional Information</span>
                      </h3>
                      <p className="text-xs text-slate-500">Official identity and contact information for this campus</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        School Official Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Principal Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.principal_name}
                        onChange={(e) => setProfileForm({ ...profileForm, principal_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        City / District *
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Physical Campus Address *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 min-h-[42px]"
                    >
                      <Save className="w-4 h-4 text-white" />
                      <span>{t.saveChanges || "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Sub-tab 2: Timings & Calendar */}
            {profileSubTab === "timings" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <span>{t.timingsAndCalendar || "School Timings & Academic Hours"}</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Official daily gate opening, assembly, off time, and staff late-arrival cutoff
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.schoolStartTime || "Official Start Time"} *
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 08:00 AM"
                          value={profileForm.start_time}
                          onChange={(e) => setProfileForm({ ...profileForm, start_time: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Assembly & Morning Gate Opening</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.schoolOffTime || "Official Off Time"} *
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 02:00 PM"
                          value={profileForm.end_time}
                          onChange={(e) => setProfileForm({ ...profileForm, end_time: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">School bell dismissal time</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t.lateArrivalCutoff || "Late-Arrival Cutoff"} *
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 08:15 AM"
                          value={profileForm.late_cutoff}
                          onChange={(e) => setProfileForm({ ...profileForm, late_cutoff: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-rose-300 bg-rose-50/20 text-rose-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                        />
                      </div>
                      <span className="text-[10px] text-rose-600 mt-1 block">Flags check-in as LATE automatically</span>
                    </div>
                  </div>

                  {/* Working Days Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Academic Working Schedule</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        6 Days / Week (Monday – Saturday)
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 pt-1 text-center text-xs">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                        <div key={day} className="p-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700">
                          {day}
                          <span className="block text-[10px] text-emerald-600 font-bold">Open</span>
                        </div>
                      ))}
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 font-semibold text-rose-700">
                        Sunday
                        <span className="block text-[10px] text-rose-600 font-bold">Holiday</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 min-h-[42px]"
                    >
                      <Save className="w-4 h-4 text-white" />
                      <span>{t.saveChanges || "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Sub-tab 3: Classes & Subjects */}
            {profileSubTab === "classes-subjects" && (
              <div className="space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="text-[11px] font-bold uppercase text-slate-400">Active Classes</div>
                    <div className="text-2xl font-black text-slate-900">{classesList.length}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Active Grades</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="text-[11px] font-bold uppercase text-slate-400">Total Sections</div>
                    <div className="text-2xl font-black text-slate-900">{classesList.length}</div>
                    <div className="text-[10px] text-blue-600 font-semibold">Classrooms</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="text-[11px] font-bold uppercase text-slate-400">Enrolled Students</div>
                    <div className="text-2xl font-black text-slate-900">{studentsList.length}</div>
                    <div className="text-[10px] text-purple-600 font-semibold">Registered Kids</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
                    <div className="text-[11px] font-bold uppercase text-slate-400">Teaching Faculty</div>
                    <div className="text-2xl font-black text-slate-900">
                      {staffList.filter((s) => s.role === "TEACHER").length}
                    </div>
                    <div className="text-[10px] text-amber-600 font-semibold">Active Teachers</div>
                  </div>
                </div>

                {/* Active Grades & Sections */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        <span>Active Classes & Assigned Teachers</span>
                      </h3>
                      <p className="text-xs text-slate-500">Summary of all registered class sections in this campus</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab("classes")}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto min-h-[38px]"
                    >
                      <span>Manage Classes</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {classesList.map((cls) => {
                      const count = studentsList.filter((s) => s.class_id === cls.id).length;
                      return (
                        <div
                          key={cls.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:bg-white transition-all shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-sm">
                              {cls.name} ({cls.section})
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {count} Students
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Teacher: {cls.class_teacher_name || "Unassigned"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Core Curriculum Subjects Overview */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Core Curriculum Subjects</h3>
                      <p className="text-xs text-slate-500">Subjects configured across primary, middle, and matric schedules</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("timetable")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs flex items-center gap-1.5 min-h-[38px]"
                    >
                      <span>View Timetable</span>
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      "Mathematics (ریاضی)",
                      "English Language",
                      "Urdu (اردو لازمی)",
                      "General Science",
                      "Physics",
                      "Chemistry",
                      "Biology",
                      "Computer Science",
                      "Pakistan Studies (مطالعہ پاکستان)",
                      "Islamiyat (اسلامیات)",
                    ].map((subj) => (
                      <span
                        key={subj}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 4: Fees & Accounts */}
            {profileSubTab === "fees-accounts" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-600" />
                        <span>Receiving Payment Accounts & Late Fee Rules</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Direct account details displayed to parents in the Student Portal Pay Fee modal
                      </p>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Official Bank Account</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bank Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Meezan Bank / HBL"
                          value={profileForm.bank_name}
                          onChange={(e) => setProfileForm({ ...profileForm, bank_name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Beacon Grammar School"
                          value={profileForm.bank_account_title}
                          onChange={(e) => setProfileForm({ ...profileForm, bank_account_title: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account / IBAN</label>
                        <input
                          type="text"
                          placeholder="e.g. PK36MEZN0001234567890123"
                          value={profileForm.bank_account_number}
                          onChange={(e) => setProfileForm({ ...profileForm, bank_account_number: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Wallets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Easypaisa */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-emerald-900 text-xs sm:text-sm">Easypaisa Account</h4>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Beacon Grammar Official"
                            value={profileForm.easypaisa_title}
                            onChange={(e) => setProfileForm({ ...profileForm, easypaisa_title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 0300-1234567"
                            value={profileForm.easypaisa_number}
                            onChange={(e) => setProfileForm({ ...profileForm, easypaisa_number: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* JazzCash */}
                    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-amber-900 text-xs sm:text-sm">JazzCash Account</h4>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Account Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Beacon Grammar School"
                            value={profileForm.jazzcash_title}
                            onChange={(e) => setProfileForm({ ...profileForm, jazzcash_title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 0321-9876543"
                            value={profileForm.jazzcash_number}
                            onChange={(e) => setProfileForm({ ...profileForm, jazzcash_number: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono bg-white focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Late Fee Rule */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-700" />
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        {t.defaultLateFee || "Default Late Fee Surcharge (PKR)"}
                      </h4>
                    </div>

                    <div className="max-w-xs">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">PKR</span>
                        <input
                          type="number"
                          min={0}
                          value={profileForm.late_fee_amount}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, late_fee_amount: Number(e.target.value) || 0 })
                          }
                          className="w-full pl-12 pr-3 py-2 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Added to unpaid monthly fee vouchers after the 10th of every month
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 min-h-[42px]"
                    >
                      <Save className="w-4 h-4 text-white" />
                      <span>{t.saveChanges || "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Sub-tab 5: Policies & Quiet Hours */}
            {profileSubTab === "policies" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <span>{t.policiesAndQuietHours || "Policies & Quiet Hours"}</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Configure WhatsApp chat quiet hours to protect teacher rest and institutional code of conduct
                      </p>
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                        Parent-Teacher Chat Quiet Hours (No Disturb Period)
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {t.quietHoursStart || "Quiet Hours Start"}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 08:00 PM"
                          value={profileForm.quiet_hours_start}
                          onChange={(e) => setProfileForm({ ...profileForm, quiet_hours_start: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {t.quietHoursEnd || "Quiet Hours End"}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 07:00 AM"
                          value={profileForm.quiet_hours_end}
                          onChange={(e) => setProfileForm({ ...profileForm, quiet_hours_end: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold bg-white focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      💡 During quiet hours, when a parent attempts to send a chat message to a teacher, a polite
                      notification informs them that the school is outside working hours and the teacher will respond the
                      following morning.
                    </p>
                  </div>

                  {/* Rules and Code of Conduct */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      {t.schoolRules || "Institutional Rules & Code of Conduct"}
                    </label>
                    <textarea
                      rows={6}
                      value={profileForm.rules_and_policies}
                      onChange={(e) => setProfileForm({ ...profileForm, rules_and_policies: e.target.value })}
                      placeholder="List campus rules, uniform regulations, mobile phone restrictions, leave policies..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-sans focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                    />
                    <span className="text-[11px] text-slate-400 block">
                      Displayed on student and parent dashboards for institutional compliance.
                    </span>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-2 min-h-[42px]"
                    >
                      <Save className="w-4 h-4 text-white" />
                      <span>{t.saveChanges || "Save Changes"}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 10: PERSONAL SETTINGS & ACCOUNT SECURITY */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <UserSettingsTab
            currentUser={currentUser}
            onUserUpdate={(updated) => setCurrentUser(updated)}
          />
        )}

      {/* ========================================================================= */}
      {/* MODAL: 1-CLICK MARK AS PAID */}
      {/* ========================================================================= */}
      {markPaidModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4">
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4">
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

      {/* MODAL: BULK STUDENT CLASS PROMOTION */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-2xs flex-shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {isRtl ? "طلبہ کی اگلی کلاس میں اجتماعی ترقی (پروموشن)" : "Bulk Student Class Promotion"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isRtl
                      ? "نئے تعلیمی سیشن کے لیے طلبہ کو اگلی جماعت میں پروموٹ کریں — سابقہ حاضری اور فیس کا ریکارڈ محفوظ رہے گا۔"
                      : "Promote students to next grade for the new academic session. Past attendance & fees remain intact."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Select Source & Target Class */}
            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  {isRtl ? "مرحلہ ۱: موجودہ اور اگلی کلاس کا انتخاب" : "Step 1 — Select Source & Target Class"}
                </span>
                {promoteSourceClassId === promoteTargetClassId && promoteSourceClassId && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {isRtl ? "دونوں کلاسز مختلف ہونی چاہئیں" : "Source and target must be different"}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? "موجودہ کلاس (Source Class) *" : "Current Class (Source) *"}
                  </label>
                  <select
                    value={promoteSourceClassId}
                    onChange={(e) => handleSourceClassChange(e.target.value)}
                    className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {classesList.map((c) => {
                      const count = studentsList.filter((s) => s.class_id === c.id).length;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} - Section {c.section} ({count} {isRtl ? "طلبہ" : "students"})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isRtl ? "اگلی کلاس (Target Class) *" : "Destination Class (Target) *"}
                  </label>
                  <select
                    value={promoteTargetClassId}
                    onChange={(e) => setPromoteTargetClassId(e.target.value)}
                    className="w-full px-3 py-2.5 min-h-[44px] text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>
                      {isRtl ? "-- اگلی کلاس منتخب کریں --" : "-- Select Destination Class --"}
                    </option>
                    {classesList.map((c) => (
                      <option key={c.id} value={c.id} disabled={c.id === promoteSourceClassId}>
                        {c.name} - Section {c.section} {c.id === promoteSourceClassId ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Student Checklist */}
            {(() => {
              const sourceStudents = studentsList.filter((s) => s.class_id === promoteSourceClassId);
              const allSelected =
                sourceStudents.length > 0 &&
                selectedStudentIdsForPromotion.length === sourceStudents.length;

              return (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {isRtl ? "مرحلہ ۲: پروموٹ ہونے والے طلبہ کی تصدیق" : "Step 2 — Student Checklist"}
                      </span>
                      <div className="text-xs text-slate-500">
                        {selectedStudentIdsForPromotion.length} of {sourceStudents.length} {isRtl ? "طلبہ منتخب شدہ" : "students selected"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          allSelected
                            ? handleDeselectAllStudents()
                            : handleSelectAllStudents(sourceStudents.map((s) => s.id))
                        }
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
                      >
                        {allSelected ? (isRtl ? "تمام غیر منتخب کریں" : "Deselect All") : (isRtl ? "تمام منتخب کریں" : "Select All")}
                      </button>

                      <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer pl-1">
                        <input
                          type="checkbox"
                          checked={updateRollNumbers}
                          onChange={(e) => setUpdateRollNumbers(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                        />
                        <span>{isRtl ? "رول نمبر تبدیل کریں" : "Update Roll Numbers"}</span>
                      </label>
                    </div>
                  </div>

                  {sourceStudents.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                      {isRtl ? "اس کلاس میں کوئی طالب علم داخل نہیں ہے۔" : "No enrolled students found in this source class."}
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1.5 p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                      {sourceStudents.map((st) => {
                        const isChecked = selectedStudentIdsForPromotion.includes(st.id);
                        return (
                          <div
                            key={st.id}
                            className={`p-2.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                              isChecked
                                ? "bg-white border-indigo-200 shadow-2xs"
                                : "bg-slate-100/70 border-slate-200 opacity-60"
                            }`}
                          >
                            <label className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSelectStudent(st.id)}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex-shrink-0">
                                #{st.roll_no}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-xs text-slate-900 truncate block">
                                  {st.name}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate block">
                                  ID: {st.student_id} • WhatsApp: {st.parent_whatsapp}
                                </span>
                              </div>
                            </label>

                            {updateRollNumbers && isChecked && (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-[10px] text-slate-400 font-medium">New Roll:</span>
                                <input
                                  type="text"
                                  value={newRollNumbersMap[st.id] ?? st.roll_no}
                                  onChange={(e) =>
                                    setNewRollNumbersMap({
                                      ...newRollNumbersMap,
                                      [st.id]: e.target.value,
                                    })
                                  }
                                  placeholder={st.roll_no}
                                  className="w-16 px-2 py-1 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
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

            {/* Step 3: Confirmation Summary Box */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {isRtl
                    ? `تصدیق: ${selectedStudentIdsForPromotion.length} طلبہ اگلی جماعت میں منتقل ہوں گے`
                    : `Promoting ${selectedStudentIdsForPromotion.length} selected students to target class`}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                {isRtl
                  ? "✓ تمام سابقہ حاضری کے ریکارڈ، امتحانی نمبرات اور فیس ادائیگیوں کی رسیدیں مکمل طور پر محفوظ رہیں گی۔"
                  : "✓ All historical attendance logs, past exam marks, and paid/unpaid fee vouchers remain 100% intact and linked to student profiles."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                {isRtl ? "منسوخ کریں" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleExecutePromotion}
                disabled={
                  isPromoting ||
                  selectedStudentIdsForPromotion.length === 0 ||
                  !promoteTargetClassId ||
                  promoteSourceClassId === promoteTargetClassId
                }
                className="px-5 py-2.5 rounded-xl bg-[#0B3B2E] hover:bg-[#082C22] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
                <span>
                  {isPromoting
                    ? (isRtl ? "پروموٹ ہو رہے ہیں..." : "Promoting...")
                    : (isRtl
                      ? `${selectedStudentIdsForPromotion.length} طلبہ کو پروموٹ کریں`
                      : `Promote ${selectedStudentIdsForPromotion.length} Students`)}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADMIT STUDENT */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4">
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
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.monthlyFee || "Monthly Tuition Fee (PKR)"} *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">PKR</span>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    placeholder="4500"
                    value={studentFormData.monthly_fee}
                    onChange={(e) => setStudentFormData({ ...studentFormData, monthly_fee: Number(e.target.value) || 0 })}
                    className="w-full pl-12 pr-3.5 py-2.5 min-h-[44px] rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tailored monthly fee. Sibling discounts or scholarships can also be adjusted later in the Fees tab.
                </p>
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
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

      {/* ========================================================================= */}
      {/* MODAL: EDIT STAFF ATTENDANCE TIMES & NOTES */}
      {/* ========================================================================= */}
      {showStaffAttendanceModal && editingStaffRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto m-2 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t.editTimes || "Edit Staff Attendance"}</h3>
                <p className="text-xs text-slate-500">{editingStaffRecord.user_name} • {editingStaffRecord.date}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowStaffAttendanceModal(false);
                  setEditingStaffRecord(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-base font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaffTimeModal} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Attendance Status</label>
                <select
                  value={editingStaffRecord.status}
                  onChange={(e) =>
                    setEditingStaffRecord({
                      ...editingStaffRecord,
                      status: e.target.value as StaffAttendanceStatus,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[42px]"
                >
                  <option value="PRESENT">PRESENT (حاضر)</option>
                  <option value="LATE">LATE (تاخیر)</option>
                  <option value="ABSENT">ABSENT (غیر حاضر)</option>
                  <option value="ON_LEAVE">ON_LEAVE (رخصت)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Check-In Time</label>
                  <input
                    type="text"
                    value={editingStaffRecord.check_in_time || ""}
                    onChange={(e) =>
                      setEditingStaffRecord({
                        ...editingStaffRecord,
                        check_in_time: e.target.value,
                      })
                    }
                    placeholder="e.g. 07:55 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[42px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Check-Out Time</label>
                  <input
                    type="text"
                    value={editingStaffRecord.check_out_time || ""}
                    onChange={(e) =>
                      setEditingStaffRecord({
                        ...editingStaffRecord,
                        check_out_time: e.target.value,
                      })
                    }
                    placeholder="e.g. 02:15 PM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[42px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={editingStaffRecord.notes || ""}
                  onChange={(e) =>
                    setEditingStaffRecord({
                      ...editingStaffRecord,
                      notes: e.target.value,
                    })
                  }
                  placeholder="e.g. Approved leave, traffic delay..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowStaffAttendanceModal(false);
                    setEditingStaffRecord(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs min-h-[40px]"
                >
                  Save Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOM FEE ADJUSTMENT (Scholarship / Sibling Discount) */}
      {/* ========================================================================= */}
      {adjustFeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-sm max-h-[85vh] overflow-y-auto m-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>Adjust Monthly Fee</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {adjustFeeModal.record.student_name} ({adjustFeeModal.record.month})
                </p>
              </div>
              <button
                onClick={() => setAdjustFeeModal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomFeeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Amount (PKR)</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={50}
                  value={adjustFeeModal.amount}
                  onChange={(e) =>
                    setAdjustFeeModal({ ...adjustFeeModal, amount: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 min-h-[40px] rounded-xl border border-slate-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Preset Discount Pills */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Quick Presets</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setAdjustFeeModal({
                        ...adjustFeeModal,
                        amount: Math.max(0, (adjustFeeModal.record.amount || 4500) - 500),
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 text-center"
                  >
                    - Rs. 500
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAdjustFeeModal({
                        ...adjustFeeModal,
                        amount: Math.max(0, (adjustFeeModal.record.amount || 4500) - 1000),
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 text-center"
                  >
                    - Rs. 1000
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAdjustFeeModal({
                        ...adjustFeeModal,
                        amount: Math.round((adjustFeeModal.record.amount || 4500) * 0.5),
                      })
                    }
                    className="p-1.5 rounded-lg border border-slate-200 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-semibold text-emerald-800 text-center"
                  >
                    50% Off
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustFeeModal(null)}
                  className="px-3.5 py-2 min-h-[40px] rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  Save Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: STAFF PROFILE (TEACHER / ACCOUNTANT) */}
      {/* ========================================================================= */}
      {selectedStaffForProfile && (() => {
        const staff = selectedStaffForProfile;
        const assignedClasses = classesList.filter(
          (c) =>
            c.class_teacher_name?.trim().toLowerCase() === staff.name.trim().toLowerCase()
        );
        const allTimetables = getTimetables(currentUser?.school_id);
        const teacherSlots = allTimetables.filter(
          (s) =>
            s.teacher_id === staff.id ||
            s.teacher_name?.trim().toLowerCase() === staff.name.trim().toLowerCase()
        );
        const todayAtt =
          getStaffTodayRecord(currentUser?.school_id || "", staff.id) ||
          staffAttendanceList.find((r) => r.user_id === staff.id);
        const attHistory = getStaffAttendanceHistory(currentUser?.school_id || "", staff.id);
        const presentDays = attHistory.filter((r) => r.status === "PRESENT").length;
        const lateDays = attHistory.filter((r) => r.status === "LATE").length;
        const absentDays = attHistory.filter((r) => r.status === "ABSENT").length;
        const onLeaveDays = attHistory.filter((r) => r.status === "ON_LEAVE").length;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col animate-scaleUp">
              {/* Modal Top Header with Emerald Gradient Banner */}
              <div className="relative bg-gradient-to-r from-[#0B3B2E] via-[#0D4838] to-[#082C22] p-5 sm:p-6 text-white flex-shrink-0">
                <button
                  onClick={() => setSelectedStaffForProfile(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Avatar / Photo */}
                  <div className="relative flex-shrink-0">
                    {staff.avatar_url ? (
                      <img
                        src={staff.avatar_url}
                        alt={staff.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-extrabold text-emerald-300 shadow-md">
                        {staff.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0B3B2E] ${
                        staff.status === "ACTIVE" ? "bg-emerald-400" : "bg-slate-400"
                      }`}
                      title={staff.status || "ACTIVE"}
                    />
                  </div>

                  {/* Header Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg sm:text-xl font-extrabold text-white truncate">{staff.name}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                          staff.role === "TEACHER"
                            ? "bg-blue-400/20 text-blue-200 border border-blue-400/30"
                            : "bg-amber-400/20 text-amber-200 border border-amber-400/30"
                        }`}
                      >
                        {staff.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                        {staff.status || "ACTIVE"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100/80">
                      <div className="flex items-center gap-1.5 font-mono bg-black/20 px-2.5 py-1 rounded-lg border border-white/10">
                        <span className="text-emerald-300/70 text-[10px] uppercase font-bold">ID:</span>
                        <span className="font-bold text-white">{staff.identifier}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(staff.identifier, `id-${staff.id}`)}
                          className="ml-1 text-emerald-300 hover:text-white transition-colors"
                          title="Copy Login Identifier"
                        >
                          {copiedKey === `id-${staff.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-300/80" />
                        <span>{schoolData?.name || "School Campus"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800">
                {/* 1. Contact & Quick Connect Banner */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Contact & WhatsApp</span>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900 text-sm">{staff.phone || "No phone registered"}</span>
                    </div>
                    {staff.email && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {staff.phone && (
                      <a
                        href={formatWhatsAppUrl(staff.phone, `Assalam-o-Alaikum ${staff.name}, from ${schoolData?.name}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `Staff Member: ${staff.name}\nRole: ${staff.role}\nLogin ID: ${staff.identifier}\nPhone: ${staff.phone || "N/A"}\nPortal: https://attendlix.vercel.app/login`,
                          `card-${staff.id}`
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      {copiedKey === `card-${staff.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied Info</span>
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

                {/* 2. Role Specific: Assigned Classes & Schedule (TEACHER) OR Finance Responsibilities (ACCOUNTANT) */}
                {staff.role === "TEACHER" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">Assigned Classes & Schedule</h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {assignedClasses.length} In Charge • {teacherSlots.length} Periods
                      </span>
                    </div>

                    {/* Class Teacher Badge(s) */}
                    {assignedClasses.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {assignedClasses.map((cls) => (
                          <div
                            key={cls.id}
                            className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-emerald-600 text-white">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-xs">
                                  {cls.name} - Section {cls.section}
                                </div>
                                <div className="text-[10px] text-emerald-700 font-semibold">
                                  Class Teacher in Charge
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-800">
                              {cls.student_count || 0} Students
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timetable Slots Table / List */}
                    {teacherSlots.length > 0 ? (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Weekly Timetable Periods</span>
                          <span>{teacherSlots.length} Total</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                          {teacherSlots.map((slot) => (
                            <div key={slot.id} className="p-2.5 px-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                                  {slot.day_of_week}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900">{slot.subject}</span>
                                  <span className="text-slate-400 mx-1.5">•</span>
                                  <span className="text-slate-600">{slot.class_name} - {slot.section}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <Clock className="w-3 h-3 text-emerald-600" />
                                <span>{slot.start_time} - {slot.end_time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      assignedClasses.length === 0 && (
                        <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-1.5">
                          <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                          <div className="font-bold text-slate-700 text-xs">No Classes or Timetable Slots Assigned Yet</div>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            Assign this teacher as a Class In-Charge in Classes & Sections or add teaching periods in the Timetable tab.
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  /* ACCOUNTANT VIEW */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">Financial & Administrative Scope</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">Student Fee Registers</div>
                          <div className="text-[11px] text-slate-500">Record cash, bank, JazzCash & Easypaisa dues</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">WhatsApp Fee Reminders</div>
                          <div className="text-[11px] text-slate-500">1-click parent notifications with school account details</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">Fee Receipts & Reconciliation</div>
                          <div className="text-[11px] text-slate-500">Print digital receipts and reconcile monthly recovery</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">Scholarship & Fee Concessions</div>
                          <div className="text-[11px] text-slate-500">Apply sibling discounts or custom monthly fee waivers</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Attendance Snapshot */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">Attendance Snapshot</h4>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {todayAtt?.status === "PRESENT"
                        ? "Present Today"
                        : todayAtt?.status === "LATE"
                        ? "Late Arrival Today"
                        : todayAtt?.status === "ON_LEAVE"
                        ? "On Leave Today"
                        : "Absent / Pending"}
                    </span>
                  </div>

                  {/* Today's Check-in / Check-out Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Today Check-In</span>
                      <div className="text-sm font-extrabold text-slate-900 font-mono">
                        {todayAtt?.check_in_time || "—"}
                      </div>
                      <div className="text-[10px] text-slate-500">Gate cutoff: {schoolData?.late_cutoff || "08:15 AM"}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Today Check-Out</span>
                      <div className="text-sm font-extrabold text-slate-900 font-mono">
                        {todayAtt?.check_out_time || "—"}
                      </div>
                      <div className="text-[10px] text-slate-500">Shift ends: {schoolData?.end_time || "02:00 PM"}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Recorded Status</span>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            todayAtt?.status === "PRESENT"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : todayAtt?.status === "LATE"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : todayAtt?.status === "ON_LEAVE"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {todayAtt?.status || "ABSENT"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{todayAtt?.notes || "No remarks"}</div>
                    </div>
                  </div>

                  {/* Monthly Quick Stats */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Present</span>
                        <span className="font-extrabold text-emerald-700">
                          {presentDays + (todayAtt?.status === "PRESENT" && !attHistory.some((r) => r.date === getTodayDateStr()) ? 1 : 0)} Days
                        </span>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Late</span>
                        <span className="font-extrabold text-amber-600">
                          {lateDays + (todayAtt?.status === "LATE" && !attHistory.some((r) => r.date === getTodayDateStr()) ? 1 : 0)} Days
                        </span>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Leave / Absent</span>
                        <span className="font-extrabold text-rose-600">{onLeaveDays + absentDays} Days</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStaffForProfile(null);
                        setActiveTab("staff-attendance");
                      }}
                      className="text-xs font-bold text-[#0B3B2E] hover:underline flex items-center gap-1"
                    >
                      <span>Full Register</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                <div className="text-[11px] text-slate-500">
                  Role: <strong className="text-slate-700">{staff.role}</strong> • Campus: <strong className="text-slate-700">{schoolData?.name}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStaffForProfile(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* REUSABLE STUDENT PROFILE MODAL */}
      {/* ========================================================================= */}
      <StudentProfileModal
        student={selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        schoolName={schoolData?.name || "Beacon Grammar School"}
        showFeeInfo={true}
        teacherName={currentUser?.name}
        teacherId={currentUser?.id}
        canAddReport={true}
      />
    </DashboardShell>
  );
}
