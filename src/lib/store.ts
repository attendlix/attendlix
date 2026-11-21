import {
  School,
  User,
  SchoolClass,
  Student,
  Announcement,
  AttendanceRecord,
  AttendanceStatus,
  Homework,
  ExamMark,
  ChatMessage,
  FeeRecord,
  FeeStatus,
  PaymentMethod,
  TimetableSlot,
  DayOfWeek,
  StaffAttendanceRecord,
  StaffAttendanceStatus,
} from "./types";
import { supabase } from "./supabase";

// Local storage keys
const KEY_CURRENT_USER = "attendlix_current_user";
const KEY_SCHOOLS = "attendlix_schools";
const KEY_USERS = "attendlix_users";
const KEY_CLASSES = "attendlix_classes";
const KEY_STUDENTS = "attendlix_students";
const KEY_ANNOUNCEMENTS = "attendlix_announcements";
const KEY_TIMETABLES = "attendlix_timetables";
const KEY_STAFF_ATTENDANCE = "attendlix_staff_attendance";

// Default Seed Schools
const SEED_SCHOOL_ID = "school-beacon-001";
const SEED_SCHOOLS: School[] = [
  {
    id: SEED_SCHOOL_ID,
    name: "Beacon Grammar School",
    principal_name: "Dr. Asim Farooq",
    city: "Lahore",
    phone: "0300-4567890",
    email: "beacon.lahore@attendlix.com",
    address: "Plot 42-B, Main Boulevard, Gulberg III, Lahore, Pakistan",
    status: "ACTIVE",
    plan: "STANDARD",
    student_count: 148,
    mrr_pkr: 35000,
    trial_days_left: 0,
    start_time: "08:00 AM",
    end_time: "02:00 PM",
    late_cutoff: "08:15 AM",
    quiet_hours_start: "08:00 PM",
    quiet_hours_end: "07:00 AM",
    late_fee_amount: 200,
    rules_and_policies: "1. Minimum 80% attendance required for examination eligibility.\n2. School gates close promptly at 08:15 AM.\n3. Student uniforms must conform to institutional dress code.\n4. Parent visits allowed during designated office hours (10:00 AM – 12:00 PM).",
    bank_name: "Meezan Bank Limited",
    bank_account_title: "Beacon Grammar School System",
    bank_account_number: "PK64MEZN0001020304050607",
    easypaisa_title: "Beacon Grammar School",
    easypaisa_number: "03004567890",
    jazzcash_title: "Beacon Grammar School",
    jazzcash_number: "03004567890",
    created_at: new Date().toISOString(),
  },
  {
    id: "sch-allied-002",
    name: "Allied Grammar Campus",
    city: "Karachi",
    phone: "0321-9876543",
    email: "allied.khi@attendlix.com",
    status: "ACTIVE",
    plan: "PREMIUM",
    student_count: 280,
    mrr_pkr: 55000,
    trial_days_left: 0,
    bank_name: "Habib Bank Limited (HBL)",
    bank_account_title: "Allied Grammar Campus Karachi",
    bank_account_number: "PK36HABB0012345678901234",
    easypaisa_title: "Allied Grammar",
    easypaisa_number: "03219876543",
    jazzcash_title: "Allied Grammar",
    jazzcash_number: "03219876543",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "sch-city-003",
    name: "The City Model Academy",
    city: "Rawalpindi",
    phone: "0333-1122334",
    email: "city.rwp@attendlix.com",
    status: "TRIAL",
    plan: "TRIAL",
    student_count: 94,
    mrr_pkr: 0,
    trial_days_left: 6,
    bank_name: "Bank Alfalah",
    bank_account_title: "The City Model Academy RWP",
    bank_account_number: "PK40ALFH0055112233445566",
    easypaisa_title: "City Model Academy",
    easypaisa_number: "03331122334",
    jazzcash_title: "City Model Academy",
    jazzcash_number: "03331122334",
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "sch-army-004",
    name: "Army Public Model School",
    city: "Peshawar",
    phone: "0345-7788990",
    email: "aps.psw@attendlix.com",
    status: "SUSPENDED",
    plan: "PREMIUM",
    student_count: 420,
    mrr_pkr: 70000,
    trial_days_left: 0,
    bank_name: "Askari Bank",
    bank_account_title: "Army Public Model School Peshawar",
    bank_account_number: "PK12ASKB0099887766554433",
    easypaisa_title: "Army Public School",
    easypaisa_number: "03457788990",
    jazzcash_title: "Army Public School",
    jazzcash_number: "03457788990",
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
];
const SEED_SCHOOL = SEED_SCHOOLS[0];

// Seed Users
const SEED_USERS: User[] = [
  {
    id: "usr-superadmin-01",
    school_id: "global",
    name: "Platform Super Admin (Me)",
    identifier: "superadmin@attendlix.com",
    phone: "0300-0000000",
    email: "superadmin@attendlix.com",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    tempPassword: "admin",
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-principal-01",
    school_id: SEED_SCHOOL_ID,
    name: "Dr. Asim Farooq (Principal)",
    identifier: "principal@beacon.edu.pk",
    phone: "0300-4567890",
    email: "principal@beacon.edu.pk",
    role: "PRINCIPAL",
    status: "ACTIVE",
    tempPassword: "admin",
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-teacher-01",
    school_id: SEED_SCHOOL_ID,
    name: "Ms. Sadia Tariq",
    identifier: "TCH-101",
    phone: "0321-7654321",
    email: "sadia.tariq@gmail.com",
    role: "TEACHER",
    status: "ACTIVE",
    tempPassword: "pass-teacher",
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-teacher-02",
    school_id: SEED_SCHOOL_ID,
    name: "Sir Kamran",
    identifier: "TCH-102",
    phone: "0301-2233445",
    email: "kamran.science@beacon.edu.pk",
    role: "TEACHER",
    status: "ACTIVE",
    tempPassword: "pass-teacher",
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-teacher-03",
    school_id: SEED_SCHOOL_ID,
    name: "Ms. Nida",
    identifier: "TCH-103",
    phone: "0332-4455667",
    email: "nida.english@beacon.edu.pk",
    role: "TEACHER",
    status: "ACTIVE",
    tempPassword: "pass-teacher",
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-accountant-01",
    school_id: SEED_SCHOOL_ID,
    name: "Tariq Mahmood",
    identifier: "ACC-201",
    phone: "0333-9876543",
    email: "tariq.accounts@beacon.edu.pk",
    role: "ACCOUNTANT",
    status: "ACTIVE",
    tempPassword: "pass-accounts",
    created_at: new Date().toISOString(),
  },
  {
    id: "usr-parent-01",
    school_id: SEED_SCHOOL_ID,
    name: "Mohammad Naveed (Parent)",
    identifier: "STD-2026-001",
    phone: "0300-1122334",
    email: "naveed.parent@gmail.com",
    role: "STUDENT_PARENT",
    status: "ACTIVE",
    tempPassword: "pass-parent",
    created_at: new Date().toISOString(),
  },
];

// Seed Classes
const SEED_CLASSES: SchoolClass[] = [
  { id: "cls-01", school_id: SEED_SCHOOL_ID, name: "Grade 8", section: "A", student_count: 36, class_teacher_name: "Ms. Sadia Tariq", created_at: new Date().toISOString() },
  { id: "cls-02", school_id: SEED_SCHOOL_ID, name: "Grade 8", section: "B", student_count: 34, class_teacher_name: "Sir Kamran", created_at: new Date().toISOString() },
  { id: "cls-03", school_id: SEED_SCHOOL_ID, name: "Grade 9 (Science)", section: "A", student_count: 40, class_teacher_name: "Ms. Nida", created_at: new Date().toISOString() },
  { id: "cls-04", school_id: SEED_SCHOOL_ID, name: "Matric Part 2", section: "Green", student_count: 38, class_teacher_name: "Sir Bilal", created_at: new Date().toISOString() },
];

// Seed Students
const SEED_STUDENTS: Student[] = [
  {
    id: "std-01",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    class_name: "Grade 8",
    section: "A",
    name: "Hamza Naveed",
    roll_no: "01",
    parent_whatsapp: "0300-1122334",
    student_id: "STD-2026-001",
    temp_password: "pass-parent",
    status: "ACTIVE",
    monthly_fee: 4500,
    created_at: new Date().toISOString(),
  },
  {
    id: "std-02",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    class_name: "Grade 8",
    section: "A",
    name: "Ayesha Noor",
    roll_no: "02",
    parent_whatsapp: "0322-9988776",
    student_id: "STD-2026-002",
    temp_password: "std-pass-02",
    status: "ACTIVE",
    monthly_fee: 3800,
    created_at: new Date().toISOString(),
  },
  {
    id: "std-03",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    class_name: "Grade 8",
    section: "A",
    name: "Bilal Zubair",
    roll_no: "03",
    parent_whatsapp: "0345-5544332",
    student_id: "STD-2026-003",
    temp_password: "std-pass-03",
    status: "ACTIVE",
    monthly_fee: 5000,
    created_at: new Date().toISOString(),
  },
  {
    id: "std-04",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-03",
    class_name: "Grade 9 (Science)",
    section: "A",
    name: "Zainab Fatima",
    roll_no: "12",
    parent_whatsapp: "0312-3344556",
    student_id: "STD-2026-012",
    temp_password: "std-pass-12",
    status: "ACTIVE",
    monthly_fee: 3200,
    created_at: new Date().toISOString(),
  },
];

// Seed Announcements
const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-01",
    school_id: SEED_SCHOOL_ID,
    title: "Winter Timings Notification",
    content: "Mohtaram Parents & Staff, School timings from Monday will be 8:30 AM to 1:45 PM due to cold weather.",
    audience: "ALL",
    priority: "NORMAL",
    whatsapp_fallback_sent: true,
    recipients_count: 148,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "ann-02",
    school_id: SEED_SCHOOL_ID,
    title: "Mid-Term Examination Datesheet",
    content: "The mid-term exams will commence from December 5th. Complete syllabus is shared on parent portals.",
    audience: "PARENTS",
    priority: "IMPORTANT",
    whatsapp_fallback_sent: true,
    recipients_count: 148,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "ann-03",
    school_id: SEED_SCHOOL_ID,
    title: "Smog Alert & Campus Closure",
    content: "Due to hazardous air quality index (AQI) in Lahore, the campus will remain closed on Friday as per government notification. Classes will proceed online.",
    audience: "ALL",
    priority: "URGENT",
    whatsapp_fallback_sent: true,
    recipients_count: 160,
    created_at: new Date().toISOString(),
  },
  {
    id: "ann-04",
    school_id: SEED_SCHOOL_ID,
    title: "Faculty Evaluation & Curriculum Review",
    content: "All teaching staff must submit term progress logs by Thursday 02:00 PM for the upcoming academic audit.",
    audience: "STAFF",
    priority: "IMPORTANT",
    whatsapp_fallback_sent: true,
    recipients_count: 12,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

// Seed Timetables
const SEED_TIMETABLES: TimetableSlot[] = [
  // Monday - cls-01 (Grade 8 - A)
  { id: "tt-01", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "MON", start_time: "08:00", end_time: "08:45", subject: "Mathematics" },
  { id: "tt-02", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-03", teacher_name: "Ms. Nida", day_of_week: "MON", start_time: "08:45", end_time: "09:30", subject: "English" },
  { id: "tt-03", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-02", teacher_name: "Sir Kamran", day_of_week: "MON", start_time: "09:30", end_time: "10:15", subject: "General Science" },
  { id: "tt-04", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "MON", start_time: "10:45", end_time: "11:30", subject: "Urdu" },
  { id: "tt-05", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-02", teacher_name: "Sir Kamran", day_of_week: "MON", start_time: "11:30", end_time: "12:15", subject: "Islamiyat" },

  // Tuesday - cls-01
  { id: "tt-06", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-03", teacher_name: "Ms. Nida", day_of_week: "TUE", start_time: "08:00", end_time: "08:45", subject: "English" },
  { id: "tt-07", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "TUE", start_time: "08:45", end_time: "09:30", subject: "Mathematics" },
  { id: "tt-08", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-02", teacher_name: "Sir Kamran", day_of_week: "TUE", start_time: "09:30", end_time: "10:15", subject: "Computer Science" },
  { id: "tt-09", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "TUE", start_time: "10:45", end_time: "11:30", subject: "Urdu" },

  // Wednesday - cls-01
  { id: "tt-10", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "WED", start_time: "08:00", end_time: "08:45", subject: "Mathematics" },
  { id: "tt-11", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-02", teacher_name: "Sir Kamran", day_of_week: "WED", start_time: "08:45", end_time: "09:30", subject: "General Science" },
  { id: "tt-12", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-03", teacher_name: "Ms. Nida", day_of_week: "WED", start_time: "09:30", end_time: "10:15", subject: "English" },
  { id: "tt-13", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-03", teacher_name: "Ms. Nida", day_of_week: "WED", start_time: "10:45", end_time: "11:30", subject: "Pak Studies" },

  // Thursday - cls-01
  { id: "tt-14", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-02", teacher_name: "Sir Kamran", day_of_week: "THU", start_time: "08:00", end_time: "08:45", subject: "General Science" },
  { id: "tt-15", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "THU", start_time: "08:45", end_time: "09:30", subject: "Mathematics" },
  { id: "tt-16", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "THU", start_time: "09:30", end_time: "10:15", subject: "Urdu" },
  { id: "tt-17", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-03", teacher_name: "Ms. Nida", day_of_week: "THU", start_time: "10:45", end_time: "11:30", subject: "English" },

  // Friday - cls-01
  { id: "tt-18", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "FRI", start_time: "08:00", end_time: "08:45", subject: "Mathematics" },
  { id: "tt-19", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-03", teacher_name: "Ms. Nida", day_of_week: "FRI", start_time: "08:45", end_time: "09:30", subject: "English" },
  { id: "tt-20", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-02", teacher_name: "Sir Kamran", day_of_week: "FRI", start_time: "09:30", end_time: "10:15", subject: "Islamiyat" },
  { id: "tt-21", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "FRI", start_time: "10:30", end_time: "11:15", subject: "Urdu" },

  // Saturday - cls-01
  { id: "tt-22", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-02", teacher_name: "Sir Kamran", day_of_week: "SAT", start_time: "08:00", end_time: "08:45", subject: "Computer Science" },
  { id: "tt-23", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "SAT", start_time: "08:45", end_time: "09:30", subject: "Mathematics" },
  { id: "tt-24", school_id: SEED_SCHOOL_ID, class_id: "cls-01", class_name: "Grade 8", section: "A", teacher_id: "usr-teacher-03", teacher_name: "Ms. Nida", day_of_week: "SAT", start_time: "09:30", end_time: "10:15", subject: "Library / Reading" },

  // cls-02 (Grade 8 - B)
  { id: "tt-25", school_id: SEED_SCHOOL_ID, class_id: "cls-02", class_name: "Grade 8", section: "B", teacher_id: "usr-teacher-02", teacher_name: "Sir Kamran", day_of_week: "MON", start_time: "08:00", end_time: "08:45", subject: "General Science" },
  { id: "tt-26", school_id: SEED_SCHOOL_ID, class_id: "cls-02", class_name: "Grade 8", section: "B", teacher_id: "usr-teacher-01", teacher_name: "Ms. Sadia Tariq", day_of_week: "MON", start_time: "08:45", end_time: "09:30", subject: "Mathematics" },
];

// Helper to get formatted today date (YYYY-MM-DD)
export function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}

// Seed Staff Attendance Records (Today's date)
const SEED_STAFF_ATTENDANCE: StaffAttendanceRecord[] = [
  {
    id: "sa-seed-01",
    school_id: SEED_SCHOOL_ID,
    user_id: "usr-teacher-01",
    user_name: "Ms. Sadia Tariq",
    user_role: "TEACHER",
    user_identifier: "TCH-101",
    user_phone: "0321-7654321",
    date: getTodayDateStr(),
    check_in_time: "07:52 AM",
    check_out_time: null,
    status: "PRESENT",
    notes: "On-time morning arrival",
    created_at: new Date().toISOString(),
  },
  {
    id: "sa-seed-02",
    school_id: SEED_SCHOOL_ID,
    user_id: "usr-teacher-02",
    user_name: "Sir Kamran",
    user_role: "TEACHER",
    user_identifier: "TCH-102",
    user_phone: "0301-2233445",
    date: getTodayDateStr(),
    check_in_time: "08:24 AM",
    check_out_time: null,
    status: "LATE",
    notes: "Traffic delay on Canal Road",
    created_at: new Date().toISOString(),
  },
  {
    id: "sa-seed-03",
    school_id: SEED_SCHOOL_ID,
    user_id: "usr-teacher-03",
    user_name: "Ms. Nida",
    user_role: "TEACHER",
    user_identifier: "TCH-103",
    user_phone: "0332-4455667",
    date: getTodayDateStr(),
    check_in_time: "07:48 AM",
    check_out_time: "02:00 PM",
    status: "PRESENT",
    notes: "Completed shift & afternoon duty",
    created_at: new Date().toISOString(),
  },
  {
    id: "sa-seed-04",
    school_id: SEED_SCHOOL_ID,
    user_id: "usr-accountant-01",
    user_name: "Tariq Mahmood",
    user_role: "ACCOUNTANT",
    user_identifier: "ACC-201",
    user_phone: "0333-9876543",
    date: getTodayDateStr(),
    check_in_time: "08:02 AM",
    check_out_time: null,
    status: "PRESENT",
    notes: "Fee desk & accounts reporting",
    created_at: new Date().toISOString(),
  },
];

// Helper to safely access browser storage
function getStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === "undefined") return defaultVal;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStorage<T>(key: string, val: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn("Storage write failed", e);
  }
}

// Ensure initial seed data exists
export function initializeStore() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(KEY_SCHOOLS)) {
    setStorage(KEY_SCHOOLS, SEED_SCHOOLS);
  }
  if (!window.localStorage.getItem(KEY_USERS)) {
    setStorage(KEY_USERS, SEED_USERS);
  }
  if (!window.localStorage.getItem(KEY_CLASSES)) {
    setStorage(KEY_CLASSES, SEED_CLASSES);
  }
  if (!window.localStorage.getItem(KEY_STUDENTS)) {
    setStorage(KEY_STUDENTS, SEED_STUDENTS);
  }
  if (!window.localStorage.getItem(KEY_ANNOUNCEMENTS)) {
    setStorage(KEY_ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  }
  if (!window.localStorage.getItem(KEY_TIMETABLES)) {
    setStorage(KEY_TIMETABLES, SEED_TIMETABLES);
  }
  if (!window.localStorage.getItem(KEY_STAFF_ATTENDANCE)) {
    setStorage(KEY_STAFF_ATTENDANCE, SEED_STAFF_ATTENDANCE);
  }
  if (!window.localStorage.getItem(KEY_EXAM_MARKS)) {
    setStorage(KEY_EXAM_MARKS, SEED_EXAM_MARKS);
  }
}

// ----------------------------------------------------
// AUTH & SESSION
// ----------------------------------------------------
export function getCurrentUser(): User | null {
  initializeStore();
  const user = getStorage<User | null>(KEY_CURRENT_USER, null);
  if (!user) {
    // Default to seed principal for frictionless preview
    return SEED_USERS[0];
  }
  return user;
}

export function setCurrentUser(user: User | null): void {
  setStorage(KEY_CURRENT_USER, user);
}

export function logout(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(KEY_CURRENT_USER);
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<{ success: boolean; user: User | null; error?: string }> {
  initializeStore();
  const users = getStorage<User[]>(KEY_USERS, SEED_USERS);
  const index = users.findIndex((u) => u.id === userId);

  let updatedUser: User | null = null;
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    setStorage(KEY_USERS, users);
    updatedUser = users[index];
  }

  const currentUser = getStorage<User | null>(KEY_CURRENT_USER, null);
  if (currentUser && currentUser.id === userId) {
    const merged = { ...currentUser, ...updates };
    setStorage(KEY_CURRENT_USER, merged);
    if (!updatedUser) updatedUser = merged;
  } else if (!currentUser && updatedUser) {
    setStorage(KEY_CURRENT_USER, updatedUser);
  }

  // Non-blocking sync to Supabase users table if schema is available
  try {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;

    if (Object.keys(payload).length > 0) {
      await supabase.from("users").update(payload).eq("id", userId);
    }
  } catch (err) {
    // Non-blocking
  }

  return { success: true, user: updatedUser };
}

export async function updateUserPassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  initializeStore();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: "No authenticated user session found." };
  }

  // 1. Update in local storage
  const users = getStorage<User[]>(KEY_USERS, SEED_USERS);
  const index = users.findIndex((u) => u.id === currentUser.id);
  if (index !== -1) {
    users[index] = { ...users[index], tempPassword: newPassword };
    setStorage(KEY_USERS, users);
  }
  const updatedCurrent = { ...currentUser, tempPassword: newPassword };
  setStorage(KEY_CURRENT_USER, updatedCurrent);

  // 2. Update via Supabase Auth (supabase.auth.updateUser)
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.warn("Supabase auth updateUser:", error.message);
    }
  } catch (err: any) {
    console.warn("Supabase auth error:", err?.message || err);
  }

  // Sync password_hash to users table
  try {
    await supabase.from("users").update({ password_hash: newPassword }).eq("id", currentUser.id);
  } catch (e) {
    // Non-blocking
  }

  return { success: true };
}

export async function loginUser(identifier: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  initializeStore();
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  // 1. Check local storage
  const users = getStorage<User[]>(KEY_USERS, SEED_USERS);
  const found = users.find(
    (u) =>
      u.identifier.toLowerCase() === cleanId ||
      u.phone?.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, "") ||
      u.email?.toLowerCase() === cleanId
  );

  if (found) {
    // For demo/development, allow either the tempPassword or any password if matching
    if (found.tempPassword && found.tempPassword !== cleanPass && cleanPass !== "demo123" && cleanPass !== "admin") {
      return { success: false, error: "Incorrect password. (Tip: Try 'admin' or 'demo123')" };
    }
    setCurrentUser(found);
    return { success: true, user: found };
  }

  // Fallback demo matching
  if (cleanId.includes("admin") || cleanId.includes("principal")) {
    const principal = SEED_USERS[0];
    setCurrentUser(principal);
    return { success: true, user: principal };
  }

  return {
    success: false,
    error: "User not found. Check phone/email or use demo credentials (principal@beacon.edu.pk / admin).",
  };
}

export async function registerSchool(data: {
  schoolName: string;
  principalName: string;
  city: string;
  phone: string;
  email: string;
  password: string;
}): Promise<{ success: boolean; school?: School; user?: User; error?: string }> {
  initializeStore();

  const newSchoolId = "sch-" + Math.random().toString(36).substring(2, 9);
  const newSchool: School = {
    id: newSchoolId,
    name: data.schoolName,
    city: data.city,
    phone: data.phone,
    email: data.email,
    created_at: new Date().toISOString(),
  };

  const newPrincipal: User = {
    id: "usr-" + Math.random().toString(36).substring(2, 9),
    school_id: newSchoolId,
    name: data.principalName,
    identifier: data.email || data.phone,
    phone: data.phone,
    email: data.email,
    role: "PRINCIPAL",
    status: "ACTIVE",
    tempPassword: data.password,
    created_at: new Date().toISOString(),
  };

  // Save to local storage
  const schools = getStorage<School[]>(KEY_SCHOOLS, [SEED_SCHOOL]);
  setStorage(KEY_SCHOOLS, [newSchool, ...schools]);

  const users = getStorage<User[]>(KEY_USERS, SEED_USERS);
  setStorage(KEY_USERS, [newPrincipal, ...users]);

  // Set default classes for new school
  const defaultClasses: SchoolClass[] = [
    { id: "cls-" + Math.random().toString(36).substring(2, 7), school_id: newSchoolId, name: "Grade 1", section: "A", student_count: 0, created_at: new Date().toISOString() },
    { id: "cls-" + Math.random().toString(36).substring(2, 7), school_id: newSchoolId, name: "Grade 2", section: "A", student_count: 0, created_at: new Date().toISOString() },
    { id: "cls-" + Math.random().toString(36).substring(2, 7), school_id: newSchoolId, name: "Grade 8", section: "A", student_count: 0, created_at: new Date().toISOString() },
  ];
  const classes = getStorage<SchoolClass[]>(KEY_CLASSES, SEED_CLASSES);
  setStorage(KEY_CLASSES, [...defaultClasses, ...classes]);

  // Auto-login newly registered principal
  setCurrentUser(newPrincipal);

  // Attempt to write to Supabase if schema is ready
  try {
    await supabase.from("schools").insert([{ id: newSchool.id, name: newSchool.name, city: newSchool.city, phone: newSchool.phone, email: newSchool.email }]);
    await supabase.from("users").insert([{ id: newPrincipal.id, school_id: newSchool.id, name: newPrincipal.name, identifier: newPrincipal.identifier, phone: newPrincipal.phone, email: newPrincipal.email, password_hash: data.password, role: "PRINCIPAL" }]);
  } catch (err) {
    // Non-blocking: local storage handles it smoothly
  }

  return { success: true, school: newSchool, user: newPrincipal };
}

// ----------------------------------------------------
// SCHOOL & STATS
// ----------------------------------------------------
export function getSchool(school_id?: string): School {
  initializeStore();
  const schools = getStorage<School[]>(KEY_SCHOOLS, SEED_SCHOOLS);
  if (!school_id) return schools[0] || SEED_SCHOOLS[0];
  return schools.find((s) => s.id === school_id) || schools[0] || SEED_SCHOOLS[0];
}

export function updateSchoolProfile(school_id: string, updates: Partial<School>): School | null {
  initializeStore();
  const schools = getStorage<School[]>(KEY_SCHOOLS, SEED_SCHOOLS);
  const index = schools.findIndex((s) => s.id === school_id || (school_id === SEED_SCHOOL_ID && s.id === SEED_SCHOOL_ID));
  if (index === -1) return null;

  schools[index] = {
    ...schools[index],
    ...updates,
  };

  setStorage(KEY_SCHOOLS, schools);
  return schools[index];
}

export function getOverviewStats(school_id?: string) {
  initializeStore();
  const currentSchoolId = school_id || SEED_SCHOOL_ID;
  const classes = getClasses(currentSchoolId);
  const students = getStudents(currentSchoolId);
  const staff = getStaff(currentSchoolId);

  const totalStudents = students.length || 148;
  const totalStaff = staff.length || 12;
  const totalClasses = classes.length || 4;

  return {
    totalStudents,
    totalTeachers: staff.filter((s) => s.role === "TEACHER").length || 8,
    totalAccountants: staff.filter((s) => s.role === "ACCOUNTANT").length || 2,
    totalStaff,
    totalClasses,
    attendanceTodayPercent: 96.2,
    feeCollectedPKR: 245000,
    feePendingPKR: 65000,
  };
}

// ----------------------------------------------------
// CLASSES & SECTIONS
// ----------------------------------------------------
export function getClasses(school_id?: string): SchoolClass[] {
  initializeStore();
  const targetId = school_id || SEED_SCHOOL_ID;
  const classes = getStorage<SchoolClass[]>(KEY_CLASSES, SEED_CLASSES);
  const students = getStorage<Student[]>(KEY_STUDENTS, SEED_STUDENTS);

  return classes
    .filter((c) => c.school_id === targetId || targetId === SEED_SCHOOL_ID)
    .map((c) => {
      const count = students.filter((s) => s.class_id === c.id).length;
      return { ...c, student_count: count > 0 ? count : c.student_count || 0 };
    });
}

export function addClass(school_id: string, name: string, section: string, classTeacherName?: string): SchoolClass {
  initializeStore();
  const newClass: SchoolClass = {
    id: "cls-" + Math.random().toString(36).substring(2, 9),
    school_id,
    name: name.trim(),
    section: section.trim().toUpperCase(),
    student_count: 0,
    class_teacher_name: classTeacherName?.trim() || "Unassigned",
    created_at: new Date().toISOString(),
  };

  const existing = getStorage<SchoolClass[]>(KEY_CLASSES, SEED_CLASSES);
  const updated = [newClass, ...existing];
  setStorage(KEY_CLASSES, updated);
  return newClass;
}

// ----------------------------------------------------
// STAFF (TEACHERS & ACCOUNTANTS)
// ----------------------------------------------------
export function getStaff(school_id?: string): User[] {
  initializeStore();
  const targetId = school_id || SEED_SCHOOL_ID;
  const users = getStorage<User[]>(KEY_USERS, SEED_USERS);
  return users.filter(
    (u) => (u.school_id === targetId || targetId === SEED_SCHOOL_ID) && (u.role === "TEACHER" || u.role === "ACCOUNTANT")
  );
}

export function addStaff(
  school_id: string,
  data: { name: string; phone: string; role: "TEACHER" | "ACCOUNTANT"; email?: string }
): { staff: User; rawPassword: string } {
  initializeStore();

  const prefix = data.role === "TEACHER" ? "TCH" : "ACC";
  const randomNum = Math.floor(100 + Math.random() * 900);
  const identifier = `${prefix}-${randomNum}`;
  const generatedPassword = `atx@${Math.floor(1000 + Math.random() * 9000)}`;

  const newStaff: User = {
    id: "usr-" + Math.random().toString(36).substring(2, 9),
    school_id,
    name: data.name.trim(),
    identifier,
    phone: data.phone.trim(),
    email: data.email?.trim() || "",
    role: data.role,
    status: "ACTIVE",
    tempPassword: generatedPassword,
    created_at: new Date().toISOString(),
  };

  const users = getStorage<User[]>(KEY_USERS, SEED_USERS);
  setStorage(KEY_USERS, [newStaff, ...users]);

  return { staff: newStaff, rawPassword: generatedPassword };
}

// ----------------------------------------------------
// STUDENTS & PARENT CREDENTIALS
// ----------------------------------------------------
export function getStudents(school_id?: string): Student[] {
  initializeStore();
  const targetId = school_id || SEED_SCHOOL_ID;
  const students = getStorage<Student[]>(KEY_STUDENTS, SEED_STUDENTS);
  return students.filter((s) => s.school_id === targetId || targetId === SEED_SCHOOL_ID);
}

export function addStudent(
  school_id: string,
  data: { name: string; roll_no: string; class_id: string; parent_whatsapp: string; monthly_fee?: number }
): { student: Student; rawPassword: string } {
  initializeStore();

  const classes = getClasses(school_id);
  const targetClass = classes.find((c) => c.id === data.class_id);

  const randomNum = Math.floor(100 + Math.random() * 900);
  const studentId = `STD-2026-${randomNum}`;
  const generatedPassword = `std@${Math.floor(1000 + Math.random() * 9000)}`;
  const feeAmount = typeof data.monthly_fee === "number" && !isNaN(data.monthly_fee) ? data.monthly_fee : 4500;

  const newStudent: Student = {
    id: "std-" + Math.random().toString(36).substring(2, 9),
    school_id,
    class_id: data.class_id,
    class_name: targetClass?.name || "Class",
    section: targetClass?.section || "A",
    name: data.name.trim(),
    roll_no: data.roll_no.trim(),
    parent_whatsapp: data.parent_whatsapp.trim(),
    student_id: studentId,
    temp_password: generatedPassword,
    status: "ACTIVE",
    monthly_fee: feeAmount,
    created_at: new Date().toISOString(),
  };

  // Add student
  const students = getStorage<Student[]>(KEY_STUDENTS, SEED_STUDENTS);
  setStorage(KEY_STUDENTS, [newStudent, ...students]);

  // Create current month initial fee record for this student
  const currentMonth = new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date());
  const currentYear = new Date().getFullYear();
  const feeRecords = getStorage<FeeRecord[]>(KEY_FEE_RECORDS, SEED_FEE_RECORDS);
  const newFeeRecord: FeeRecord = {
    id: "fee-" + Math.random().toString(36).substring(2, 9),
    school_id,
    student_id: newStudent.id,
    student_name: newStudent.name,
    roll_no: newStudent.roll_no,
    class_id: newStudent.class_id,
    class_name: newStudent.class_name,
    section: newStudent.section,
    parent_whatsapp: newStudent.parent_whatsapp,
    month: currentMonth,
    year: currentYear,
    amount: feeAmount,
    status: "UNPAID",
    created_at: new Date().toISOString(),
  };
  setStorage(KEY_FEE_RECORDS, [newFeeRecord, ...feeRecords]);

  // Also create a linked user account for the Parent/Student
  const newParentUser: User = {
    id: "usr-" + Math.random().toString(36).substring(2, 9),
    school_id,
    name: `${data.name} (Parent)`,
    identifier: studentId,
    phone: data.parent_whatsapp.trim(),
    role: "STUDENT_PARENT",
    status: "ACTIVE",
    tempPassword: generatedPassword,
    created_at: new Date().toISOString(),
  };

  const users = getStorage<User[]>(KEY_USERS, SEED_USERS);
  setStorage(KEY_USERS, [newParentUser, ...users]);

  return { student: newStudent, rawPassword: generatedPassword };
}

// ----------------------------------------------------
// ANNOUNCEMENTS
// ----------------------------------------------------
export function getAnnouncements(school_id?: string): Announcement[] {
  initializeStore();
  const targetId = school_id || SEED_SCHOOL_ID;
  const announcements = getStorage<Announcement[]>(KEY_ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  return announcements.filter((a) => a.school_id === targetId || targetId === SEED_SCHOOL_ID);
}

export function getAnnouncementsForAudience(
  school_id: string | undefined,
  target: "TEACHER" | "STUDENT_PARENT" | "ALL"
): Announcement[] {
  const all = getAnnouncements(school_id);
  if (target === "ALL") return all;
  if (target === "TEACHER") {
    return all.filter((a) => a.audience === "ALL" || a.audience === "STAFF" || a.audience === "TEACHERS");
  }
  if (target === "STUDENT_PARENT") {
    return all.filter((a) => a.audience === "ALL" || a.audience === "PARENTS");
  }
  return all;
}

export function addAnnouncement(
  school_id: string,
  data: {
    title: string;
    content: string;
    audience: "ALL" | "PARENTS" | "STAFF" | "TEACHERS" | "ACCOUNTANTS" | "CLASS";
    priority?: "NORMAL" | "IMPORTANT" | "URGENT";
    class_name?: string;
  }
): Announcement {
  initializeStore();

  const students = getStudents(school_id);
  const staff = getStaff(school_id);

  let count = students.length;
  if (data.audience === "STAFF" || data.audience === "TEACHERS") {
    count = staff.filter((s) => s.role === "TEACHER" || s.role === "ACCOUNTANT").length;
  } else if (data.audience === "ACCOUNTANTS") {
    count = staff.filter((s) => s.role === "ACCOUNTANT").length;
  } else if (data.audience === "ALL") {
    count = students.length + staff.length;
  }

  const newAnn: Announcement = {
    id: "ann-" + Math.random().toString(36).substring(2, 9),
    school_id,
    title: data.title.trim(),
    content: data.content.trim(),
    audience: data.audience,
    priority: data.priority || "NORMAL",
    class_name: data.class_name,
    whatsapp_fallback_sent: true,
    recipients_count: count > 0 ? count : 35,
    created_at: new Date().toISOString(),
  };

  const list = getStorage<Announcement[]>(KEY_ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  setStorage(KEY_ANNOUNCEMENTS, [newAnn, ...list]);
  return newAnn;
}

// ----------------------------------------------------
// TEACHER MODULE: KEYS & SEEDS
// ----------------------------------------------------
const KEY_ATTENDANCE = "attendlix_attendance_records";
const KEY_OFFLINE_ATTENDANCE_QUEUE = "attendlix_offline_attendance_queue";
const KEY_HOMEWORK = "attendlix_homework_list";
const KEY_EXAM_MARKS = "attendlix_exam_marks_list";
const KEY_MESSAGES = "attendlix_chat_messages";

// Seed Homework
const SEED_HOMEWORK: Homework[] = [
  {
    id: "hw-01",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    subject: "Mathematics",
    title: "Exercise 4.2 - Algebraic Equations",
    description: "Complete Questions 1 through 6 in your neat notebooks. Show all rough work.",
    due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "hw-02",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    subject: "Urdu",
    title: "سبق 'قائد اعظم رحمتہ اللہ علیہ' کے سوالات",
    description: "کتاب کے صفحہ نمبر 45 پر دیے گئے سوال نمبر 1 تا 4 کے جوابات تحریر کریں۔",
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "hw-03",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    subject: "Science",
    title: "Photosynthesis Diagram & Definitions",
    description: "Draw the labeled diagram of plant cell photosynthesis and memorize definitions.",
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
];

// Seed Exam Marks
const SEED_EXAM_MARKS: ExamMark[] = [
  // --- Mid-Term Examination 2026 (Hamza Naveed std-01) ---
  {
    id: "exm-mid-01",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Mid-Term Examination 2026",
    exam_type: "MID_TERM",
    subject: "Mathematics",
    total_marks: 100,
    obtained_marks: 92,
    remarks: "Exceptional grasp of algebra and geometric proofs. Keep it up!",
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: "exm-mid-02",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Mid-Term Examination 2026",
    exam_type: "MID_TERM",
    subject: "General Science",
    total_marks: 100,
    obtained_marks: 94,
    remarks: "Brilliant score in physics numericals and plant cell diagrams.",
    created_at: new Date(Date.now() - 86400000 * 13).toISOString(),
  },
  {
    id: "exm-mid-03",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Mid-Term Examination 2026",
    exam_type: "MID_TERM",
    subject: "English",
    total_marks: 100,
    obtained_marks: 86,
    remarks: "Strong reading comprehension. Focus slightly more on essay structure.",
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: "exm-mid-04",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Mid-Term Examination 2026",
    exam_type: "MID_TERM",
    subject: "Urdu",
    total_marks: 100,
    obtained_marks: 88,
    remarks: "بہترین ذخیرہ الفاظ اور خوشخطی۔ قواعد میں بہت اچھی گرفت ہے۔",
    created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
  },
  {
    id: "exm-mid-05",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Mid-Term Examination 2026",
    exam_type: "MID_TERM",
    subject: "Computer Science",
    total_marks: 100,
    obtained_marks: 96,
    remarks: "Top ranker! Logical problem-solving and flowcharting skills are outstanding.",
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "exm-mid-06",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Mid-Term Examination 2026",
    exam_type: "MID_TERM",
    subject: "Islamiyat",
    total_marks: 50,
    obtained_marks: 47,
    remarks: "ماشاءاللہ، حفظ، ترجمہ اور تشریح سب میں قابلِ ستائش کارکردگی۔",
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },

  // --- Monthly Tests (October) (Hamza Naveed std-01) ---
  {
    id: "exm-mth-01",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Monthly Test (October)",
    exam_type: "MONTHLY_TEST",
    subject: "Mathematics",
    total_marks: 50,
    obtained_marks: 46,
    remarks: "Accurate formulas and clear rough work.",
    created_at: new Date(Date.now() - 86400000 * 32).toISOString(),
  },
  {
    id: "exm-mth-02",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Monthly Test (October)",
    exam_type: "MONTHLY_TEST",
    subject: "English",
    total_marks: 50,
    obtained_marks: 42,
    remarks: "Good vocabulary. Practice creative story writing.",
    created_at: new Date(Date.now() - 86400000 * 31).toISOString(),
  },
  {
    id: "exm-mth-03",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Monthly Test (October)",
    exam_type: "MONTHLY_TEST",
    subject: "Urdu",
    total_marks: 50,
    obtained_marks: 45,
    remarks: "عمدہ املا اور بر وقت تحریر۔",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "exm-mth-04",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Monthly Test (October)",
    exam_type: "MONTHLY_TEST",
    subject: "General Science",
    total_marks: 50,
    obtained_marks: 48,
    remarks: "Very neat labeling and thorough definitions.",
    created_at: new Date(Date.now() - 86400000 * 29).toISOString(),
  },

  // --- Final Term Mock Assessment (Hamza Naveed std-01) ---
  {
    id: "exm-fin-01",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Final Term Mock Assessment",
    exam_type: "FINAL_TERM",
    subject: "Mathematics",
    total_marks: 100,
    obtained_marks: 95,
    remarks: "Ready for annual exams. Excellent speed and accuracy.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "exm-fin-02",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Final Term Mock Assessment",
    exam_type: "FINAL_TERM",
    subject: "English",
    total_marks: 100,
    obtained_marks: 90,
    remarks: "Impressive essay on digital literacy. Fluency is commendable.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "exm-fin-03",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Final Term Mock Assessment",
    exam_type: "FINAL_TERM",
    subject: "General Science",
    total_marks: 100,
    obtained_marks: 93,
    remarks: "Excellent grasp of periodic table and physics laws.",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },

  // --- Other students seed marks ---
  {
    id: "exm-02",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-02",
    student_name: "Ayesha Noor",
    roll_no: "02",
    exam_name: "Monthly Test (October)",
    exam_type: "MONTHLY_TEST",
    subject: "Mathematics",
    total_marks: 50,
    obtained_marks: 49,
    remarks: "Flawless score in mental math.",
    created_at: new Date().toISOString(),
  },
  {
    id: "exm-03",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-03",
    student_name: "Bilal Zubair",
    roll_no: "03",
    exam_name: "Monthly Test (October)",
    exam_type: "MONTHLY_TEST",
    subject: "Mathematics",
    total_marks: 50,
    obtained_marks: 38,
    remarks: "Good effort. Review chapter 3 exercises.",
    created_at: new Date().toISOString(),
  },
];

// Seed Messages
const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "msg-01",
    school_id: SEED_SCHOOL_ID,
    student_id: "std-01",
    student_name: "Hamza Naveed",
    sender_role: "PARENT",
    content: "Assalam-o-Alaikum teacher sahiba, Hamza had high fever yesterday. He has completed his English homework though.",
    is_quiet_hours_delayed: false,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "msg-02",
    school_id: SEED_SCHOOL_ID,
    student_id: "std-01",
    student_name: "Hamza Naveed",
    sender_role: "TEACHER",
    content: "Walaikum Assalam. JazakAllah for informing! Hamza may take rest, we will assist him with missed classwork.",
    is_quiet_hours_delayed: false,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "msg-03",
    school_id: SEED_SCHOOL_ID,
    student_id: "std-03",
    student_name: "Bilal Zubair",
    sender_role: "PARENT",
    content: "Respected Teacher, will there be extra coaching for Mathematics before the mid-term exams?",
    is_quiet_hours_delayed: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// ----------------------------------------------------
// ATTENDANCE & OFFLINE QUEUE
// ----------------------------------------------------
export function getDailyAttendance(school_id: string, class_id: string, date: string): Record<string, AttendanceStatus> {
  initializeStore();
  const all = getStorage<AttendanceRecord[]>(KEY_ATTENDANCE, []);
  const matching = all.filter((r) => r.school_id === school_id && r.class_id === class_id && r.date === date);

  const res: Record<string, AttendanceStatus> = {};
  matching.forEach((r) => {
    res[r.student_id] = r.status;
  });
  return res;
}

export function saveClassAttendance(
  school_id: string,
  class_id: string,
  date: string,
  records: { student_id: string; status: AttendanceStatus; student_name?: string; roll_no?: string }[],
  isOffline: boolean = false
): { savedCount: number; absentCount: number; isOffline: boolean } {
  initializeStore();

  const newRecords: AttendanceRecord[] = records.map((r) => ({
    id: "att-" + Math.random().toString(36).substring(2, 9),
    school_id,
    class_id,
    student_id: r.student_id,
    student_name: r.student_name,
    roll_no: r.roll_no,
    date,
    status: r.status,
    synced_at: new Date().toISOString(),
    is_offline_pending: isOffline,
  }));

  // Store in main attendance records (upsert by student_id & date)
  const existing = getStorage<AttendanceRecord[]>(KEY_ATTENDANCE, []);
  const studentIds = new Set(records.map((r) => r.student_id));
  const filtered = existing.filter((r) => !(r.school_id === school_id && r.date === date && studentIds.has(r.student_id)));
  setStorage(KEY_ATTENDANCE, [...newRecords, ...filtered]);

  // If offline, also enqueue into the offline queue
  if (isOffline) {
    const queue = getStorage<any[]>(KEY_OFFLINE_ATTENDANCE_QUEUE, []);
    queue.push({
      batch_id: "batch-" + Date.now(),
      school_id,
      class_id,
      date,
      records: newRecords,
      timestamp: new Date().toISOString(),
    });
    setStorage(KEY_OFFLINE_ATTENDANCE_QUEUE, queue);
  }

  const absentCount = records.filter((r) => r.status === "ABSENT").length;
  return { savedCount: records.length, absentCount, isOffline };
}

export function getOfflineAttendanceQueue(): any[] {
  initializeStore();
  return getStorage<any[]>(KEY_OFFLINE_ATTENDANCE_QUEUE, []);
}

export function syncOfflineAttendanceQueue(): { syncedBatches: number; totalRecords: number } {
  initializeStore();
  const queue = getStorage<any[]>(KEY_OFFLINE_ATTENDANCE_QUEUE, []);
  if (queue.length === 0) return { syncedBatches: 0, totalRecords: 0 };

  const existing = getStorage<AttendanceRecord[]>(KEY_ATTENDANCE, []);
  let totalRecords = 0;

  queue.forEach((batch) => {
    totalRecords += batch.records?.length || 0;
  });

  // Mark all records as synced
  const updatedExisting = existing.map((r) => ({ ...r, is_offline_pending: false }));
  setStorage(KEY_ATTENDANCE, updatedExisting);

  // Clear queue
  setStorage(KEY_OFFLINE_ATTENDANCE_QUEUE, []);
  return { syncedBatches: queue.length, totalRecords };
}

// ----------------------------------------------------
// HOMEWORK
// ----------------------------------------------------
export function getHomeworkList(school_id: string, class_id: string): Homework[] {
  initializeStore();
  const all = getStorage<Homework[]>(KEY_HOMEWORK, SEED_HOMEWORK);
  return all.filter((h) => (h.school_id === school_id || school_id === SEED_SCHOOL_ID) && h.class_id === class_id);
}

export function addHomework(
  school_id: string,
  class_id: string,
  data: { subject: string; title: string; description: string; due_date: string; teacher_id?: string }
): Homework {
  initializeStore();
  const newHw: Homework = {
    id: "hw-" + Math.random().toString(36).substring(2, 9),
    school_id,
    class_id,
    teacher_id: data.teacher_id,
    subject: data.subject.trim(),
    title: data.title.trim(),
    description: data.description.trim(),
    due_date: data.due_date,
    created_at: new Date().toISOString(),
  };

  const existing = getStorage<Homework[]>(KEY_HOMEWORK, SEED_HOMEWORK);
  setStorage(KEY_HOMEWORK, [newHw, ...existing]);
  return newHw;
}

// ----------------------------------------------------
// EXAMS & MARKS
// ----------------------------------------------------
export function getExamMarks(school_id: string, class_id: string, exam_name: string, subject: string): ExamMark[] {
  initializeStore();
  const all = getStorage<ExamMark[]>(KEY_EXAM_MARKS, SEED_EXAM_MARKS);
  return all.filter(
    (m) =>
      (m.school_id === school_id || school_id === SEED_SCHOOL_ID) &&
      m.class_id === class_id &&
      m.exam_name === exam_name &&
      m.subject === subject
  );
}

export function getStudentExamMarks(school_id: string, student_id: string): ExamMark[] {
  initializeStore();
  const all = getStorage<ExamMark[]>(KEY_EXAM_MARKS, SEED_EXAM_MARKS);
  return all.filter(
    (m) =>
      (m.school_id === school_id || school_id === SEED_SCHOOL_ID) &&
      m.student_id === student_id
  );
}

export function saveExamMarksBatch(
  school_id: string,
  class_id: string,
  exam_name: string,
  subject: string,
  total_marks: number,
  marksList: { student_id: string; student_name: string; roll_no: string; obtained_marks: number }[]
): ExamMark[] {
  initializeStore();
  const newMarks: ExamMark[] = marksList.map((m) => ({
    id: "exm-" + Math.random().toString(36).substring(2, 9),
    school_id,
    class_id,
    student_id: m.student_id,
    student_name: m.student_name,
    roll_no: m.roll_no,
    exam_name,
    subject,
    total_marks,
    obtained_marks: m.obtained_marks,
    created_at: new Date().toISOString(),
  }));

  const existing = getStorage<ExamMark[]>(KEY_EXAM_MARKS, SEED_EXAM_MARKS);
  // remove duplicates for same student, exam, subject
  const studentIds = new Set(marksList.map((m) => m.student_id));
  const filtered = existing.filter(
    (e) => !(e.school_id === school_id && e.class_id === class_id && e.exam_name === exam_name && e.subject === subject && studentIds.has(e.student_id))
  );

  setStorage(KEY_EXAM_MARKS, [...newMarks, ...filtered]);
  return newMarks;
}

// ----------------------------------------------------
// PARENT-TEACHER MESSAGES (WITH QUIET HOURS)
// ----------------------------------------------------
export function isQuietHoursActive(): { isActive: boolean; hoursText: string } {
  const now = new Date();
  const currentHour = now.getHours(); // 0 - 23
  // Quiet hours: 8:00 PM (20:00) to 7:00 AM (07:00)
  const isQuiet = currentHour >= 20 || currentHour < 7;
  return {
    isActive: isQuiet,
    hoursText: "8:00 PM – 7:00 AM",
  };
}

export function getStudentMessages(school_id: string, student_id: string): ChatMessage[] {
  initializeStore();
  const all = getStorage<ChatMessage[]>(KEY_MESSAGES, SEED_MESSAGES);
  return all.filter((m) => (m.school_id === school_id || school_id === SEED_SCHOOL_ID) && m.student_id === student_id);
}

export function getAllTeacherMessages(school_id: string): ChatMessage[] {
  initializeStore();
  return getStorage<ChatMessage[]>(KEY_MESSAGES, SEED_MESSAGES);
}

export function sendTeacherMessage(
  school_id: string,
  student_id: string,
  student_name: string,
  content: string,
  sender_role: "TEACHER" | "PARENT" = "TEACHER"
): ChatMessage {
  initializeStore();
  const quietInfo = isQuietHoursActive();

  const msg: ChatMessage = {
    id: "msg-" + Math.random().toString(36).substring(2, 9),
    school_id,
    student_id,
    student_name,
    sender_role,
    content: content.trim(),
    is_quiet_hours_delayed: quietInfo.isActive,
    created_at: new Date().toISOString(),
  };

  const existing = getStorage<ChatMessage[]>(KEY_MESSAGES, SEED_MESSAGES);
  setStorage(KEY_MESSAGES, [msg, ...existing]);
  return msg;
}

// ----------------------------------------------------
// FEE MODULE: KEYS, SEEDS & FUNCTIONS
// ----------------------------------------------------
const KEY_FEE_RECORDS = "attendlix_fee_records";

const SEED_FEE_RECORDS: FeeRecord[] = [
  {
    id: "fee-01",
    school_id: SEED_SCHOOL_ID,
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    class_id: "cls-01",
    class_name: "Grade 8",
    section: "A",
    parent_whatsapp: "0300-1122334",
    month: "November",
    year: 2026,
    amount: 4500,
    status: "PAID",
    payment_method: "EASYPAISA",
    transaction_id: "EP-9824021",
    paid_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "fee-02",
    school_id: SEED_SCHOOL_ID,
    student_id: "std-02",
    student_name: "Ayesha Noor",
    roll_no: "02",
    class_id: "cls-01",
    class_name: "Grade 8",
    section: "A",
    parent_whatsapp: "0322-9988776",
    month: "November",
    year: 2026,
    amount: 3800,
    status: "PAID",
    payment_method: "JAZZCASH",
    transaction_id: "JC-4192003",
    paid_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "fee-03",
    school_id: SEED_SCHOOL_ID,
    student_id: "std-03",
    student_name: "Bilal Zubair",
    roll_no: "03",
    class_id: "cls-01",
    class_name: "Grade 8",
    section: "A",
    parent_whatsapp: "0345-5544332",
    month: "November",
    year: 2026,
    amount: 5000,
    status: "UNPAID",
    created_at: new Date().toISOString(),
  },
  {
    id: "fee-04",
    school_id: SEED_SCHOOL_ID,
    student_id: "std-04",
    student_name: "Zainab Fatima",
    roll_no: "12",
    class_id: "cls-03",
    class_name: "Grade 9 (Science)",
    section: "A",
    parent_whatsapp: "0312-3344556",
    month: "November",
    year: 2026,
    amount: 3200,
    status: "UNPAID",
    created_at: new Date().toISOString(),
  },
  {
    id: "fee-05",
    school_id: SEED_SCHOOL_ID,
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    class_id: "cls-01",
    class_name: "Grade 8",
    section: "A",
    parent_whatsapp: "0300-1122334",
    month: "October",
    year: 2026,
    amount: 4500,
    status: "PAID",
    payment_method: "CASH",
    paid_at: new Date(Date.now() - 86400000 * 35).toISOString(),
    created_at: new Date().toISOString(),
  },
];

export function getFeeRecords(
  school_id: string,
  filters?: { month?: string; year?: number; class_id?: string; status?: FeeStatus }
): FeeRecord[] {
  initializeStore();
  const all = getStorage<FeeRecord[]>(KEY_FEE_RECORDS, SEED_FEE_RECORDS);
  const students = getStudents(school_id);
  const classes = getClasses(school_id);

  // Auto ensure fee records exist for current students if missing
  let records = all.filter((r) => r.school_id === school_id || school_id === SEED_SCHOOL_ID);

  if (filters?.month) {
    records = records.filter((r) => r.month.toLowerCase() === filters.month?.toLowerCase());
  }
  if (filters?.year) {
    records = records.filter((r) => r.year === filters.year);
  }
  if (filters?.class_id && filters.class_id !== "ALL") {
    records = records.filter((r) => r.class_id === filters.class_id);
  }
  if (filters?.status && filters.status !== "ALL" as any) {
    records = records.filter((r) => r.status === filters.status);
  }

  // Enrich with latest student data
  return records.map((r) => {
    const st = students.find((s) => s.id === r.student_id);
    const cls = classes.find((c) => c.id === r.class_id || c.id === st?.class_id);
    return {
      ...r,
      student_name: st?.name || r.student_name,
      roll_no: st?.roll_no || r.roll_no,
      class_name: cls?.name || r.class_name,
      section: cls?.section || r.section,
      parent_whatsapp: st?.parent_whatsapp || r.parent_whatsapp,
    };
  });
}

export function getStudentFeeRecords(school_id: string, student_id: string): FeeRecord[] {
  initializeStore();
  const all = getFeeRecords(school_id);
  return all.filter((r) => r.student_id === student_id);
}

export function updateFeeStatus(
  record_id: string,
  status: FeeStatus,
  payment_method?: PaymentMethod,
  transaction_id?: string
): FeeRecord | null {
  initializeStore();
  const all = getStorage<FeeRecord[]>(KEY_FEE_RECORDS, SEED_FEE_RECORDS);
  const index = all.findIndex((r) => r.id === record_id);
  if (index === -1) return null;

  const updated: FeeRecord = {
    ...all[index],
    status,
    payment_method: status === "PAID" ? payment_method || "CASH" : undefined,
    transaction_id: status === "PAID" ? transaction_id || undefined : undefined,
    paid_at: status === "PAID" ? new Date().toISOString() : undefined,
  };

  all[index] = updated;
  setStorage(KEY_FEE_RECORDS, all);
  return updated;
}

export function payStudentFee(
  school_id: string,
  student_id: string,
  month: string,
  year: number,
  payment_method: PaymentMethod,
  transaction_id?: string
): FeeRecord {
  initializeStore();
  const all = getStorage<FeeRecord[]>(KEY_FEE_RECORDS, SEED_FEE_RECORDS);
  const foundIndex = all.findIndex(
    (r) =>
      (r.school_id === school_id || school_id === SEED_SCHOOL_ID) &&
      r.student_id === student_id &&
      r.month.toLowerCase() === month.toLowerCase() &&
      r.year === year
  );

  const students = getStudents(school_id);
  const targetStudent = students.find((s) => s.id === student_id);

  if (foundIndex !== -1) {
    all[foundIndex] = {
      ...all[foundIndex],
      status: "PAID",
      payment_method,
      transaction_id: transaction_id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      paid_at: new Date().toISOString(),
    };
    setStorage(KEY_FEE_RECORDS, all);
    return all[foundIndex];
  } else {
    const studentMonthlyFee = targetStudent?.monthly_fee ?? 4500;
    const newRecord: FeeRecord = {
      id: "fee-" + Math.random().toString(36).substring(2, 9),
      school_id,
      student_id,
      student_name: targetStudent?.name || "Student",
      roll_no: targetStudent?.roll_no || "01",
      class_id: targetStudent?.class_id || "cls-01",
      class_name: targetStudent?.class_name || "Class",
      section: targetStudent?.section || "A",
      parent_whatsapp: targetStudent?.parent_whatsapp || "0300-0000000",
      month,
      year,
      amount: studentMonthlyFee,
      status: "PAID",
      payment_method,
      transaction_id: transaction_id || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setStorage(KEY_FEE_RECORDS, [newRecord, ...all]);
    return newRecord;
  }
}

export function adjustFeeRecordAmount(record_id: string, delta: number): FeeRecord | null {
  initializeStore();
  const all = getStorage<FeeRecord[]>(KEY_FEE_RECORDS, SEED_FEE_RECORDS);
  const index = all.findIndex((r) => r.id === record_id);
  if (index === -1) return null;

  const currentAmount = Number(all[index].amount) || 0;
  const newAmount = Math.max(0, currentAmount + delta);

  all[index] = {
    ...all[index],
    amount: newAmount,
  };
  setStorage(KEY_FEE_RECORDS, all);
  return all[index];
}

export function updateFeeRecordAmount(record_id: string, newAmount: number): FeeRecord | null {
  initializeStore();
  const all = getStorage<FeeRecord[]>(KEY_FEE_RECORDS, SEED_FEE_RECORDS);
  const index = all.findIndex((r) => r.id === record_id);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    amount: Math.max(0, newAmount),
  };
  setStorage(KEY_FEE_RECORDS, all);
  return all[index];
}

export function getFeeSummary(school_id: string, month: string = "November", year: number = 2026) {
  const records = getFeeRecords(school_id, { month, year });
  const students = getStudents(school_id);

  const totalStudents = students.length || records.length || 4;
  const paidList = records.filter((r) => r.status === "PAID");
  const unpaidList = records.filter((r) => r.status === "UNPAID");

  const totalCollectedPKR = paidList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalPendingPKR = unpaidList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return {
    totalStudents,
    paidCount: paidList.length,
    unpaidCount: unpaidList.length,
    totalCollectedPKR,
    totalPendingPKR,
  };
}

// ----------------------------------------------------
// SUPER ADMIN MODULE
// ----------------------------------------------------
export function getAllSchools(): School[] {
  initializeStore();
  return getStorage<School[]>(KEY_SCHOOLS, SEED_SCHOOLS);
}

export function getPlatformStats() {
  const schools = getAllSchools();
  const totalSchools = schools.length;
  const activeSubscriptions = schools.filter((s) => s.status === "ACTIVE").length;
  const totalStudentsPlatform = schools.reduce((acc, curr) => acc + (curr.student_count || 148), 0);
  const platformMRR = schools
    .filter((s) => s.status === "ACTIVE")
    .reduce((acc, curr) => acc + (curr.mrr_pkr || 35000), 0);

  return {
    totalSchools,
    activeSubscriptions,
    totalStudentsPlatform,
    platformMRR,
  };
}

export function updateSchoolStatus(
  school_id: string,
  status: "ACTIVE" | "TRIAL" | "SUSPENDED"
): School | null {
  initializeStore();
  const schools = getStorage<School[]>(KEY_SCHOOLS, SEED_SCHOOLS);
  const index = schools.findIndex((s) => s.id === school_id);
  if (index === -1) return null;

  schools[index] = {
    ...schools[index],
    status,
    mrr_pkr: status === "ACTIVE" ? schools[index].mrr_pkr || 35000 : 0,
  };

  setStorage(KEY_SCHOOLS, schools);
  return schools[index];
}

export function extendSchoolTrial(school_id: string, days: number = 14): School | null {
  initializeStore();
  const schools = getStorage<School[]>(KEY_SCHOOLS, SEED_SCHOOLS);
  const index = schools.findIndex((s) => s.id === school_id);
  if (index === -1) return null;

  schools[index] = {
    ...schools[index],
    status: "TRIAL",
    trial_days_left: (schools[index].trial_days_left || 0) + days,
  };

  setStorage(KEY_SCHOOLS, schools);
  return schools[index];
}

export function onboardManualSchool(data: {
  name: string;
  city: string;
  phone: string;
  email: string;
  plan?: "TRIAL" | "STANDARD" | "PREMIUM";
}): School {
  initializeStore();
  const schools = getStorage<School[]>(KEY_SCHOOLS, SEED_SCHOOLS);
  const newId = "sch-" + Math.random().toString(36).substring(2, 9);

  const plan = data.plan || "TRIAL";
  const newSchool: School = {
    id: newId,
    name: data.name.trim(),
    city: data.city.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || "",
    status: plan === "TRIAL" ? "TRIAL" : "ACTIVE",
    plan,
    student_count: 50,
    mrr_pkr: plan === "PREMIUM" ? 55000 : plan === "STANDARD" ? 35000 : 0,
    trial_days_left: plan === "TRIAL" ? 14 : 0,
    created_at: new Date().toISOString(),
  };

  const updated = [newSchool, ...schools];
  setStorage(KEY_SCHOOLS, updated);
  return newSchool;
}

export function updateSchoolPaymentDetails(
  school_id: string,
  details: {
    bank_name?: string;
    bank_account_title?: string;
    bank_account_number?: string;
    easypaisa_title?: string;
    easypaisa_number?: string;
    jazzcash_title?: string;
    jazzcash_number?: string;
  }
): School | null {
  initializeStore();
  const schools = getStorage<School[]>(KEY_SCHOOLS, SEED_SCHOOLS);
  const index = schools.findIndex((s) => s.id === school_id);
  if (index === -1) return null;

  schools[index] = {
    ...schools[index],
    bank_name: details.bank_name !== undefined ? details.bank_name.trim() : schools[index].bank_name,
    bank_account_title: details.bank_account_title !== undefined ? details.bank_account_title.trim() : schools[index].bank_account_title,
    bank_account_number: details.bank_account_number !== undefined ? details.bank_account_number.trim() : schools[index].bank_account_number,
    easypaisa_title: details.easypaisa_title !== undefined ? details.easypaisa_title.trim() : schools[index].easypaisa_title,
    easypaisa_number: details.easypaisa_number !== undefined ? details.easypaisa_number.trim() : schools[index].easypaisa_number,
    jazzcash_title: details.jazzcash_title !== undefined ? details.jazzcash_title.trim() : schools[index].jazzcash_title,
    jazzcash_number: details.jazzcash_number !== undefined ? details.jazzcash_number.trim() : schools[index].jazzcash_number,
  };

  setStorage(KEY_SCHOOLS, schools);
  return schools[index];
}

// ----------------------------------------------------
// TIMETABLE SYSTEM (Principal, Teacher & Student)
// ----------------------------------------------------

export const DAYS_ORDER: DayOfWeek[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

function timeToMinutes(t: string): number {
  if (!t) return 0;
  const parts = t.split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export function getTimetables(school_id?: string): TimetableSlot[] {
  initializeStore();
  const targetSchoolId = school_id || SEED_SCHOOL_ID;
  const list = getStorage<TimetableSlot[]>(KEY_TIMETABLES, SEED_TIMETABLES);
  return list.filter((item) => item.school_id === targetSchoolId || targetSchoolId === SEED_SCHOOL_ID);
}

export function getClassTimetable(school_id: string, class_id: string): TimetableSlot[] {
  const all = getTimetables(school_id);
  return all
    .filter((slot) => slot.class_id === class_id)
    .sort((a, b) => {
      const dayDiff = DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week);
      if (dayDiff !== 0) return dayDiff;
      return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
    });
}

export function getTeacherTimetable(school_id: string, teacher_id: string): TimetableSlot[] {
  const all = getTimetables(school_id);
  return all
    .filter((slot) => slot.teacher_id === teacher_id)
    .sort((a, b) => {
      const dayDiff = DAYS_ORDER.indexOf(a.day_of_week) - DAYS_ORDER.indexOf(b.day_of_week);
      if (dayDiff !== 0) return dayDiff;
      return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
    });
}

export function checkTeacherClash(
  school_id: string,
  teacher_id: string,
  day_of_week: DayOfWeek,
  start_time: string,
  end_time: string,
  excludeSlotId?: string
): { hasClash: boolean; conflictingSlot?: TimetableSlot; message?: string } {
  const all = getTimetables(school_id);
  const newStart = timeToMinutes(start_time);
  const newEnd = timeToMinutes(end_time);

  if (newEnd <= newStart) {
    return {
      hasClash: true,
      message: "End time must be after start time.",
    };
  }

  const conflicting = all.find((slot) => {
    if (excludeSlotId && slot.id === excludeSlotId) return false;
    if (slot.teacher_id !== teacher_id) return false;
    if (slot.day_of_week !== day_of_week) return false;

    const existingStart = timeToMinutes(slot.start_time);
    const existingEnd = timeToMinutes(slot.end_time);

    // Overlap condition: start1 < end2 && end1 > start2
    return newStart < existingEnd && newEnd > existingStart;
  });

  if (conflicting) {
    const teacherName = conflicting.teacher_name || "This teacher";
    const className = conflicting.class_name ? `${conflicting.class_name} - ${conflicting.section || ""}` : "another class";
    return {
      hasClash: true,
      conflictingSlot: conflicting,
      message: `${teacherName} is already assigned to ${className} (${conflicting.subject}) from ${conflicting.start_time} to ${conflicting.end_time}.`,
    };
  }

  return { hasClash: false };
}

export function saveTimetableSlot(
  school_id: string,
  data: {
    id?: string;
    class_id: string;
    teacher_id: string;
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    subject: string;
  }
): { success: boolean; slot?: TimetableSlot; error?: string } {
  initializeStore();

  // 1. Clash Check
  const clash = checkTeacherClash(
    school_id,
    data.teacher_id,
    data.day_of_week,
    data.start_time,
    data.end_time,
    data.id
  );

  if (clash.hasClash) {
    return { success: false, error: clash.message };
  }

  // 2. Resolve Class and Teacher metadata
  const classes = getClasses(school_id);
  const foundClass = classes.find((c) => c.id === data.class_id);
  const staff = getStaff(school_id);
  const foundTeacher = staff.find((s) => s.id === data.teacher_id);

  const all = getTimetables(school_id);
  let savedSlot: TimetableSlot;

  if (data.id) {
    const idx = all.findIndex((s) => s.id === data.id);
    if (idx !== -1) {
      savedSlot = {
        ...all[idx],
        class_id: data.class_id,
        class_name: foundClass?.name || all[idx].class_name || "Grade Class",
        section: foundClass?.section || all[idx].section || "A",
        teacher_id: data.teacher_id,
        teacher_name: foundTeacher?.name || all[idx].teacher_name || "Teacher",
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        subject: data.subject.trim(),
      };
      all[idx] = savedSlot;
    } else {
      savedSlot = {
        id: data.id,
        school_id,
        class_id: data.class_id,
        class_name: foundClass?.name || "Grade Class",
        section: foundClass?.section || "A",
        teacher_id: data.teacher_id,
        teacher_name: foundTeacher?.name || "Teacher",
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        subject: data.subject.trim(),
        created_at: new Date().toISOString(),
      };
      all.unshift(savedSlot);
    }
  } else {
    savedSlot = {
      id: "tt-" + Math.random().toString(36).substring(2, 9),
      school_id,
      class_id: data.class_id,
      class_name: foundClass?.name || "Grade Class",
      section: foundClass?.section || "A",
      teacher_id: data.teacher_id,
      teacher_name: foundTeacher?.name || "Teacher",
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      subject: data.subject.trim(),
      created_at: new Date().toISOString(),
    };
    all.unshift(savedSlot);
  }

  setStorage(KEY_TIMETABLES, all);

  // Async Supabase sync
  try {
    supabase
      .from("timetables")
      .upsert({
        id: savedSlot.id.startsWith("tt-") ? undefined : savedSlot.id,
        school_id: savedSlot.school_id,
        class_id: savedSlot.class_id,
        teacher_id: savedSlot.teacher_id,
        day_of_week: savedSlot.day_of_week,
        start_time: savedSlot.start_time,
        end_time: savedSlot.end_time,
        subject: savedSlot.subject,
      })
      .then(() => {});
  } catch (e) {
    // offline or schema fallback
  }

  return { success: true, slot: savedSlot };
}

export function deleteTimetableSlot(slot_id: string): boolean {
  initializeStore();
  const all = getStorage<TimetableSlot[]>(KEY_TIMETABLES, SEED_TIMETABLES);
  const filtered = all.filter((s) => s.id !== slot_id);
  setStorage(KEY_TIMETABLES, filtered);

  try {
    supabase.from("timetables").delete().eq("id", slot_id).then(() => {});
  } catch (e) {
    // non-blocking
  }

  return true;
}

// ==============================================================================
// 7. TEACHER & STAFF DAILY ATTENDANCE (CHECK-IN / CHECK-OUT)
// ==============================================================================

export function formatCurrentTime(d: Date = new Date()): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = minutes < 10 ? "0" + minutes : String(minutes);
  const hrStr = hours < 10 ? "0" + hours : String(hours);
  return `${hrStr}:${minStr} ${ampm}`;
}

export function getStaffAttendance(school_id: string, date: string = getTodayDateStr()): StaffAttendanceRecord[] {
  initializeStore();
  const allSaved = getStorage<StaffAttendanceRecord[]>(KEY_STAFF_ATTENDANCE, SEED_STAFF_ATTENDANCE);
  const staffMembers = getStaff(school_id);

  // Match saved record or synthesize an unrecorded / absent placeholder for that day
  return staffMembers.map((staff) => {
    const existing = allSaved.find(
      (rec) => rec.school_id === school_id && rec.user_id === staff.id && rec.date === date
    );

    if (existing) {
      return {
        ...existing,
        user_name: staff.name,
        user_role: staff.role,
        user_identifier: staff.identifier,
        user_phone: staff.phone,
      };
    }

    return {
      id: `sa-rec-${staff.id}-${date}`,
      school_id,
      user_id: staff.id,
      user_name: staff.name,
      user_role: staff.role,
      user_identifier: staff.identifier,
      user_phone: staff.phone,
      date,
      check_in_time: null,
      check_out_time: null,
      status: "ABSENT" as StaffAttendanceStatus,
      notes: "No check-in recorded",
      created_at: new Date().toISOString(),
    };
  });
}

export function getStaffAttendanceStats(school_id: string, date: string = getTodayDateStr()) {
  const records = getStaffAttendance(school_id, date);
  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const onLeave = records.filter((r) => r.status === "ON_LEAVE").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;

  return {
    totalStaff: total,
    present,
    late,
    onLeave,
    absent,
  };
}

export function saveStaffAttendanceRecord(
  school_id: string,
  record: Partial<StaffAttendanceRecord> & { user_id: string; date: string }
): StaffAttendanceRecord {
  initializeStore();
  const allSaved = getStorage<StaffAttendanceRecord[]>(KEY_STAFF_ATTENDANCE, SEED_STAFF_ATTENDANCE);
  const staffMembers = getStaff(school_id);
  const staff = staffMembers.find((s) => s.id === record.user_id);

  const idx = allSaved.findIndex(
    (r) => r.school_id === school_id && r.user_id === record.user_id && r.date === record.date
  );

  let updatedRecord: StaffAttendanceRecord;

  if (idx !== -1) {
    updatedRecord = {
      ...allSaved[idx],
      ...record,
      user_name: staff?.name || allSaved[idx].user_name || "Staff Member",
      user_role: staff?.role || allSaved[idx].user_role || "TEACHER",
      user_identifier: staff?.identifier || allSaved[idx].user_identifier || "",
      user_phone: staff?.phone || allSaved[idx].user_phone || "",
    };
    allSaved[idx] = updatedRecord;
  } else {
    updatedRecord = {
      id: "sa-" + Math.random().toString(36).substring(2, 9),
      school_id,
      user_id: record.user_id,
      user_name: staff?.name || "Staff Member",
      user_role: staff?.role || "TEACHER",
      user_identifier: staff?.identifier || "",
      user_phone: staff?.phone || "",
      date: record.date,
      check_in_time: record.check_in_time !== undefined ? record.check_in_time : null,
      check_out_time: record.check_out_time !== undefined ? record.check_out_time : null,
      status: record.status || "PRESENT",
      notes: record.notes || "",
      created_at: new Date().toISOString(),
    };
    allSaved.unshift(updatedRecord);
  }

  setStorage(KEY_STAFF_ATTENDANCE, allSaved);

  // Sync to Supabase
  try {
    supabase
      .from("staff_attendance")
      .upsert({
        school_id: updatedRecord.school_id,
        user_id: updatedRecord.user_id,
        date: updatedRecord.date,
        check_in_time: updatedRecord.check_in_time,
        check_out_time: updatedRecord.check_out_time,
        status: updatedRecord.status,
        notes: updatedRecord.notes,
      })
      .then(() => {});
  } catch (e) {
    // Non-blocking fallback
  }

  return updatedRecord;
}

export function getStaffTodayRecord(
  school_id: string,
  user_id: string,
  date: string = getTodayDateStr()
): StaffAttendanceRecord | null {
  initializeStore();
  const allSaved = getStorage<StaffAttendanceRecord[]>(KEY_STAFF_ATTENDANCE, SEED_STAFF_ATTENDANCE);
  const found = allSaved.find(
    (r) => r.school_id === school_id && r.user_id === user_id && r.date === date
  );
  return found || null;
}

export function teacherCheckIn(
  school_id: string,
  user_id: string
): { success: boolean; record: StaffAttendanceRecord; error?: string } {
  initializeStore();
  const date = getTodayDateStr();
  const now = new Date();
  const timeFormatted = formatCurrentTime(now);

  // Late threshold: check-in after 8:15 AM
  const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15);
  const status: StaffAttendanceStatus = isLate ? "LATE" : "PRESENT";

  const existing = getStaffTodayRecord(school_id, user_id, date);

  const saved = saveStaffAttendanceRecord(school_id, {
    user_id,
    date,
    check_in_time: timeFormatted,
    status: existing?.status === "ON_LEAVE" ? "ON_LEAVE" : status,
    notes: isLate ? "Self check-in (Late arrival)" : "Self check-in (On-time)",
  });

  return { success: true, record: saved };
}

export function teacherCheckOut(
  school_id: string,
  user_id: string
): { success: boolean; record: StaffAttendanceRecord; error?: string } {
  initializeStore();
  const date = getTodayDateStr();
  const now = new Date();
  const timeFormatted = formatCurrentTime(now);

  const existing = getStaffTodayRecord(school_id, user_id, date);
  if (!existing || !existing.check_in_time) {
    // Auto check-in first if missing
    teacherCheckIn(school_id, user_id);
  }

  const saved = saveStaffAttendanceRecord(school_id, {
    user_id,
    date,
    check_out_time: timeFormatted,
  });

  return { success: true, record: saved };
}


