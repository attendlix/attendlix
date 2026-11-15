-- ==============================================================================
-- ATTENDLIX: Multi-Tenant School Management ERP Database Schema
-- Optimized for Supabase / PostgreSQL with Row-Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
CREATE TYPE user_role AS ENUM ('PRINCIPAL', 'TEACHER', 'ACCOUNTANT', 'STUDENT_PARENT');
CREATE TYPE announcement_audience AS ENUM ('ALL', 'PARENTS', 'TEACHERS', 'ACCOUNTANTS', 'CLASS');

-- 3. Schools Table (Tenant Root)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    logo_url TEXT,
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
