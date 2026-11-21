-- ==============================================================================
-- ATTENDLIX: Multi-Tenant School Management ERP Database Schema
-- Optimized for Supabase / PostgreSQL with Row-Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
CREATE TYPE user_role AS ENUM ('PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'STUDENT_PARENT');
CREATE TYPE announcement_audience AS ENUM ('ALL', 'PARENTS', 'TEACHERS', 'ACCOUNTANTS', 'CLASS');
CREATE TYPE announcement_priority AS ENUM ('NORMAL', 'IMPORTANT', 'URGENT');

-- 3. Schools Table (Tenant Root)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    principal_name VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    logo_url TEXT,
    -- School Timings & Attendance Cutoff
    start_time VARCHAR(20) DEFAULT '08:00 AM',
    end_time VARCHAR(20) DEFAULT '02:00 PM',
    late_cutoff VARCHAR(20) DEFAULT '08:15 AM',
    -- Policies & Quiet Hours
    quiet_hours_start VARCHAR(20) DEFAULT '08:00 PM',
    quiet_hours_end VARCHAR(20) DEFAULT '07:00 AM',
    late_fee_amount NUMERIC(10, 2) DEFAULT 200.00,
    rules_and_policies TEXT,
    -- Dynamic School Payment Receiving Accounts
    bank_name VARCHAR(100),
    bank_account_title VARCHAR(150),
    bank_account_number VARCHAR(50),
    easypaisa_title VARCHAR(150),
    easypaisa_number VARCHAR(30),
    jazzcash_title VARCHAR(150),
    jazzcash_number VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Users Table (Principal, Teachers, Accountants, Parents/Students)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    identifier VARCHAR(100) NOT NULL, -- Phone, Email, or Generated ID (e.g. TCH-101, STD-201)
    phone VARCHAR(30),
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_school_identifier UNIQUE (school_id, identifier)
);

-- Index for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_identifier ON public.users(identifier);
CREATE INDEX IF NOT EXISTS idx_users_school ON public.users(school_id);

-- 5. Classes & Sections Table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Grade 8", "Matric Part 1"
    section VARCHAR(50) NOT NULL, -- e.g., "A", "B", "Green"
    class_teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_school_class_section UNIQUE (school_id, name, section)
);

CREATE INDEX IF NOT EXISTS idx_classes_school ON public.classes(school_id);

-- 6. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    parent_whatsapp VARCHAR(30) NOT NULL,
    student_id VARCHAR(50) NOT NULL, -- Unique login ID (e.g., STD-2026-042)
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    monthly_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL, -- Customized monthly tuition fee
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_school_roll_no UNIQUE (school_id, class_id, roll_no),
    CONSTRAINT unique_school_student_id UNIQUE (school_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_students_school ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);

-- 7. Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    audience announcement_audience DEFAULT 'ALL' NOT NULL,
    priority announcement_priority DEFAULT 'NORMAL' NOT NULL,
    target_audience VARCHAR(50) DEFAULT 'ALL',
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    whatsapp_fallback_sent BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_announcements_school ON public.announcements(school_id);

-- ==============================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES FOR STRICT DATA ISOLATION
-- ==============================================================================

-- Enable RLS on every table
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Note: In Supabase, queries authenticated with JWT will match auth.jwt() ->> 'school_id'
-- Example Policy for Users table:
CREATE POLICY "Users can only view data from their own school"
    ON public.users
    FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');

CREATE POLICY "Classes strictly scoped by school_id"
    ON public.classes
    FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');

CREATE POLICY "Students strictly scoped by school_id"
    ON public.students
    FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');

CREATE POLICY "Announcements strictly scoped by school_id"
    ON public.announcements
    FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');
-- ==============================================================================
-- ATTENDLIX: Step 3 - Teacher Module Database Schema (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. Create Additional Enums
DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LEAVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_sender_role AS ENUM ('TEACHER', 'PARENT', 'PRINCIPAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Attendance Table (Daily Class Attendance with Offline Sync Support)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    status attendance_status DEFAULT 'PRESENT' NOT NULL,
    marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    whatsapp_alert_sent BOOLEAN DEFAULT false NOT NULL,
    CONSTRAINT unique_student_daily_attendance UNIQUE (school_id, student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_school ON public.attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON public.attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance(student_id);

-- 3. Homework Table
CREATE TABLE IF NOT EXISTS public.homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    subject VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_homework_class ON public.homework(class_id);
CREATE INDEX IF NOT EXISTS idx_homework_school ON public.homework(school_id);

-- 4. Exam Marks Table
CREATE TABLE IF NOT EXISTS public.exam_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exam_name VARCHAR(100) NOT NULL, -- e.g. "Monthly Test (Oct)", "Mid-Term Exam"
    subject VARCHAR(100) NOT NULL,
    total_marks NUMERIC(5, 2) NOT NULL,
    obtained_marks NUMERIC(5, 2) NOT NULL,
    entered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_student_exam_subject UNIQUE (school_id, class_id, student_id, exam_name, subject)
);

CREATE INDEX IF NOT EXISTS idx_exam_marks_lookup ON public.exam_marks(school_id, class_id, exam_name, subject);

-- 5. Parent-Teacher Messages (Per Student Thread with Quiet Hours)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    sender_role message_sender_role NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    is_quiet_hours_delayed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_student ON public.messages(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_school ON public.messages(school_id);

-- ==============================================================================
-- RLS POLICIES FOR TEACHER TABLES
-- ==============================================================================

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendance scoped by school_id"
    ON public.attendance FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');

CREATE POLICY "Homework scoped by school_id"
    ON public.homework FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');

CREATE POLICY "Exam marks scoped by school_id"
    ON public.exam_marks FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');

CREATE POLICY "Messages scoped by school_id"
    ON public.messages FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');
-- ==============================================================================
-- ATTENDLIX: Step 4 - Simplified Fee Records Schema (Supabase / PostgreSQL)
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE fee_status AS ENUM ('PAID', 'UNPAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_channel AS ENUM ('CASH', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- fee_records Table
CREATE TABLE IF NOT EXISTS public.fee_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL, -- e.g. "November", "October"
    year INT NOT NULL, -- e.g. 2026
    amount NUMERIC(10, 2) NOT NULL DEFAULT 4500.00,
    status fee_status DEFAULT 'UNPAID' NOT NULL,
    payment_method payment_channel,
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_student_monthly_fee UNIQUE (school_id, student_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_fee_records_school ON public.fee_records(school_id);
CREATE INDEX IF NOT EXISTS idx_fee_records_lookup ON public.fee_records(school_id, month, year, status);
CREATE INDEX IF NOT EXISTS idx_fee_records_student ON public.fee_records(student_id);

-- Row-Level Security (RLS)
ALTER TABLE public.fee_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fee records strictly scoped by school_id"
    ON public.fee_records FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');
-- ==============================================================================
-- ATTENDLIX: Step 6 - Weekly Timetable Management Schema (Supabase / PostgreSQL)
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE timetable_day AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- timetables Table
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    day_of_week timetable_day NOT NULL,
    start_time TIME NOT NULL, -- e.g. '08:00:00'
    end_time TIME NOT NULL,   -- e.g. '08:45:00'
    subject VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_time_order CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_timetables_school ON public.timetables(school_id);
CREATE INDEX IF NOT EXISTS idx_timetables_class_day ON public.timetables(school_id, class_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetables_teacher_day ON public.timetables(school_id, teacher_id, day_of_week);

-- Row-Level Security (RLS)
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Timetables strictly scoped by school_id"
    ON public.timetables FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');

-- ==============================================================================
-- ATTENDLIX: Step 7 - Teacher & Staff Daily Attendance Schema (Supabase / PostgreSQL)
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE staff_attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- staff_attendance Table (Check-In / Check-Out Tracking)
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status staff_attendance_status DEFAULT 'PRESENT' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_staff_daily_attendance UNIQUE (school_id, user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_school ON public.staff_attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_lookup ON public.staff_attendance(school_id, date, status);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_user ON public.staff_attendance(school_id, user_id, date);

-- Row-Level Security (RLS)
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

-- 1. Strict multi-tenant isolation policy
CREATE POLICY "Staff attendance strictly scoped by school_id"
    ON public.staff_attendance FOR ALL
    USING (school_id = NULLIF(current_setting('app.current_school_id', true), '')::UUID OR auth.role() = 'service_role');

-- 2. Staff self-service policy: staff can read their own attendance records
CREATE POLICY "Staff can view their own attendance"
    ON public.staff_attendance FOR SELECT
    USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- 3. Staff check-in policy: staff can record their check-in/out timestamp for today
CREATE POLICY "Staff can update their check-in check-out times"
    ON public.staff_attendance FOR UPDATE
    USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- ==============================================================================
-- ATTENDLIX: Step 8 - Dynamic Payment Accounts & Flexible Student Fee Schema
-- ==============================================================================

-- 1. Add payment account columns to schools table
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS bank_account_title VARCHAR(150);
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50);
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS easypaisa_title VARCHAR(150);
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS easypaisa_number VARCHAR(30);
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS jazzcash_title VARCHAR(150);
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS jazzcash_number VARCHAR(30);

-- 2. Add per-student monthly fee column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL;

-- ==============================================================================
-- ATTENDLIX: Step 9 - Announcement Priority, Target Audience & School Profile Settings Schema
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE announcement_priority AS ENUM ('NORMAL', 'IMPORTANT', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS priority announcement_priority DEFAULT 'NORMAL' NOT NULL;
ALTER TABLE public.announcements ADD COLUMN IF NOT EXISTS target_audience VARCHAR(50) DEFAULT 'ALL';

ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS principal_name VARCHAR(150);
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS start_time VARCHAR(20) DEFAULT '08:00 AM';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS end_time VARCHAR(20) DEFAULT '02:00 PM';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS late_cutoff VARCHAR(20) DEFAULT '08:15 AM';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS quiet_hours_start VARCHAR(20) DEFAULT '08:00 PM';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS quiet_hours_end VARCHAR(20) DEFAULT '07:00 AM';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS late_fee_amount NUMERIC(10, 2) DEFAULT 200.00;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS rules_and_policies TEXT;

-- Step 10: User Profile Avatar & Settings
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;



