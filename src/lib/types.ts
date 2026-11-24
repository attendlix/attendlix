export type UserRole = "SUPER_ADMIN" | "PRINCIPAL" | "TEACHER" | "ACCOUNTANT" | "STUDENT_PARENT";

export interface School {
  id: string;
  name: string;
  principal_name?: string;
  city: string;
  phone: string;
  email?: string;
  address?: string;
  status?: "ACTIVE" | "TRIAL" | "SUSPENDED";
  plan?: "TRIAL" | "STANDARD" | "PREMIUM" | string;
  student_count?: number;
  mrr_pkr?: number;
  billing_note?: string;
  trial_days_left?: number;
  // School Timings & Attendance Cutoff
  start_time?: string;
  end_time?: string;
  late_cutoff?: string;
  // Policies & Parent-Teacher Chat Quiet Hours
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  late_fee_amount?: number;
  rules_and_policies?: string;
  // Dynamic Payment Receiving Accounts
  bank_name?: string;
  bank_account_title?: string;
  bank_account_number?: string;
  easypaisa_title?: string;
  easypaisa_number?: string;
  jazzcash_title?: string;
  jazzcash_number?: string;
  created_at: string;
}

export interface User {
  id: string;
  school_id: string;
  name: string;
  identifier: string; // Phone, Email, or Generated ID (TCH-..., ACC-..., etc.)
  phone?: string;
  email?: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  tempPassword?: string;
  avatar_url?: string;
  created_at: string;
}

export interface SchoolClass {
  id: string;
  school_id: string;
  name: string; // e.g. "Grade 8"
  section: string; // e.g. "A"
  student_count?: number;
  class_teacher_name?: string;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  class_id: string;
  class_name?: string;
  section?: string;
  name: string;
  roll_no: string;
  parent_whatsapp: string;
  student_id: string; // Login ID, e.g. STD-2026-001
  temp_password?: string;
  monthly_fee?: number; // Per-student custom fee (scholarships/discounts)
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
}

export type AnnouncementAudience = "ALL" | "PARENTS" | "STAFF" | "TEACHERS" | "ACCOUNTANTS" | "CLASS";
export type AnnouncementPriority = "NORMAL" | "IMPORTANT" | "URGENT";

export interface Announcement {
  id: string;
  school_id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  priority?: AnnouncementPriority;
  class_name?: string;
  whatsapp_fallback_sent: boolean;
  recipients_count?: number;
  created_at: string;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE" | "LATE";

export interface AttendanceRecord {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  student_name?: string;
  roll_no?: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  marked_by?: string;
  synced_at: string;
  is_offline_pending?: boolean;
}

export interface Homework {
  id: string;
  school_id: string;
  class_id: string;
  teacher_id?: string;
  subject: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

export interface ExamMark {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  student_name?: string;
  roll_no?: string;
  exam_name: string;
  subject: string;
  total_marks: number;
  obtained_marks: number;
  remarks?: string;
  exam_type?: "MONTHLY_TEST" | "MID_TERM" | "FINAL_TERM" | "QUIZ";
  created_at: string;
}

export interface ChatMessage {
  id: string;
  school_id: string;
  student_id: string;
  student_name?: string;
  sender_role: "TEACHER" | "PARENT" | "PRINCIPAL";
  content: string;
  is_quiet_hours_delayed?: boolean;
  created_at: string;
}

export type FeeStatus = "PAID" | "UNPAID";
export type PaymentMethod = "CASH" | "JAZZCASH" | "EASYPAISA" | "BANK_TRANSFER";

export interface FeeRecord {
  id: string;
  school_id: string;
  student_id: string;
  student_name?: string;
  roll_no?: string;
  class_id?: string;
  class_name?: string;
  section?: string;
  parent_whatsapp?: string;
  month: string;
  year: number;
  amount: number;
  status: FeeStatus;
  payment_method?: PaymentMethod;
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
}

export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export interface TimetableSlot {
  id: string;
  school_id: string;
  class_id: string;
  class_name?: string;
  section?: string;
  teacher_id: string;
  teacher_name?: string;
  day_of_week: DayOfWeek;
  start_time: string; // "08:00"
  end_time: string;   // "08:45"
  subject: string;
  created_at?: string;
}

export type StaffAttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "ON_LEAVE";

export interface StaffAttendanceRecord {
  id: string;
  school_id: string;
  user_id: string;
  user_name?: string;
  user_role?: UserRole;
  user_identifier?: string;
  user_phone?: string;
  date: string; // "YYYY-MM-DD"
  check_in_time?: string | null;  // e.g. "07:55 AM"
  check_out_time?: string | null; // e.g. "02:15 PM"
  status: StaffAttendanceStatus;
  notes?: string;
  created_at: string;
}


