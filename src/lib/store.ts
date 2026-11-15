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
} from "./types";
import { supabase } from "./supabase";

// Local storage keys
const KEY_CURRENT_USER = "attendlix_current_user";
const KEY_SCHOOLS = "attendlix_schools";
const KEY_USERS = "attendlix_users";
const KEY_CLASSES = "attendlix_classes";
const KEY_STUDENTS = "attendlix_students";
const KEY_ANNOUNCEMENTS = "attendlix_announcements";

// Default Seed Schools
const SEED_SCHOOL_ID = "school-beacon-001";
const SEED_SCHOOLS: School[] = [
  {
    id: SEED_SCHOOL_ID,
    name: "Beacon Grammar School",
    city: "Lahore",
    phone: "0300-4567890",
    email: "beacon.lahore@attendlix.com",
    status: "ACTIVE",
    plan: "STANDARD",
    student_count: 148,
    mrr_pkr: 35000,
    trial_days_left: 0,
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
    whatsapp_fallback_sent: true,
    recipients_count: 148,
    created_at: new Date().toISOString(),
  },
  {
    id: "ann-02",
    school_id: SEED_SCHOOL_ID,
    title: "Mid-Term Examination Datesheet",
    content: "The mid-term exams will commence from December 5th. Complete syllabus is shared on parent portals.",
    audience: "PARENTS",
    whatsapp_fallback_sent: true,
    recipients_count: 148,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
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
  const schools = getStorage<School[]>(KEY_SCHOOLS, [SEED_SCHOOL]);
  if (!school_id) return schools[0] || SEED_SCHOOL;
  return schools.find((s) => s.id === school_id) || schools[0] || SEED_SCHOOL;
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
  data: { name: string; roll_no: string; class_id: string; parent_whatsapp: string }
): { student: Student; rawPassword: string } {
  initializeStore();

  const classes = getClasses(school_id);
  const targetClass = classes.find((c) => c.id === data.class_id);

  const randomNum = Math.floor(100 + Math.random() * 900);
  const studentId = `STD-2026-${randomNum}`;
  const generatedPassword = `std@${Math.floor(1000 + Math.random() * 9000)}`;

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
    created_at: new Date().toISOString(),
  };

  // Add student
  const students = getStorage<Student[]>(KEY_STUDENTS, SEED_STUDENTS);
  setStorage(KEY_STUDENTS, [newStudent, ...students]);

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

export function addAnnouncement(
  school_id: string,
  data: {
    title: string;
    content: string;
    audience: "ALL" | "PARENTS" | "TEACHERS" | "ACCOUNTANTS" | "CLASS";
    class_name?: string;
  }
): Announcement {
  initializeStore();

  const students = getStudents(school_id);
  const staff = getStaff(school_id);

  let count = students.length;
  if (data.audience === "TEACHERS") count = staff.filter((s) => s.role === "TEACHER").length;
  else if (data.audience === "ACCOUNTANTS") count = staff.filter((s) => s.role === "ACCOUNTANT").length;
  else if (data.audience === "ALL") count = students.length + staff.length;

  const newAnn: Announcement = {
    id: "ann-" + Math.random().toString(36).substring(2, 9),
    school_id,
    title: data.title.trim(),
    content: data.content.trim(),
    audience: data.audience,
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
  {
    id: "exm-01",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-01",
    student_name: "Hamza Naveed",
    roll_no: "01",
    exam_name: "Monthly Test (October)",
    subject: "Mathematics",
    total_marks: 50,
    obtained_marks: 46,
    created_at: new Date().toISOString(),
  },
  {
    id: "exm-02",
    school_id: SEED_SCHOOL_ID,
    class_id: "cls-01",
    student_id: "std-02",
    student_name: "Ayesha Noor",
    roll_no: "02",
    exam_name: "Monthly Test (October)",
    subject: "Mathematics",
    total_marks: 50,
    obtained_marks: 49,
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
    subject: "Mathematics",
    total_marks: 50,
    obtained_marks: 38,
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
    amount: 4500,
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
    amount: 4500,
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
    amount: 5000,
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
      amount: 4500,
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
