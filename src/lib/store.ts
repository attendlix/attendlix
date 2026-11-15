import { School, User, SchoolClass, Student, Announcement } from "./types";
import { supabase } from "./supabase";

// Local storage keys
const KEY_CURRENT_USER = "attendlix_current_user";
const KEY_SCHOOLS = "attendlix_schools";
const KEY_USERS = "attendlix_users";
const KEY_CLASSES = "attendlix_classes";
const KEY_STUDENTS = "attendlix_students";
const KEY_ANNOUNCEMENTS = "attendlix_announcements";

// Default Seed School
const SEED_SCHOOL_ID = "school-beacon-001";
const SEED_SCHOOL: School = {
  id: SEED_SCHOOL_ID,
  name: "Beacon Grammar School",
  city: "Lahore",
  phone: "0300-4567890",
  email: "beacon.lahore@attendlix.com",
  created_at: new Date().toISOString(),
};

// Seed Principal User
const SEED_USERS: User[] = [
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
    setStorage(KEY_SCHOOLS, [SEED_SCHOOL]);
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
