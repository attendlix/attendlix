export type UserRole = "PRINCIPAL" | "TEACHER" | "ACCOUNTANT" | "STUDENT_PARENT";

export interface School {
  id: string;
  name: string;
  city: string;
  phone: string;
  email?: string;
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
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
}

export interface Announcement {
  id: string;
  school_id: string;
  title: string;
  content: string;
  audience: "ALL" | "PARENTS" | "TEACHERS" | "ACCOUNTANTS" | "CLASS";
  class_name?: string;
  whatsapp_fallback_sent: boolean;
  recipients_count?: number;
  created_at: string;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE";

export interface AttendanceRecord {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  student_name?: string;
  roll_no?: string;
  date: string;
  status: AttendanceStatus;
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
