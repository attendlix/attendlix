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
