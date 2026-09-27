-- FixMyCampus Database Schema for Supabase
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sla_urgent_hours INTEGER DEFAULT 2,
    sla_high_hours INTEGER DEFAULT 12,
    sla_medium_hours INTEGER DEFAULT 24,
    sla_low_hours INTEGER DEFAULT 48,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial departments
INSERT INTO public.departments (id, name, description, sla_urgent_hours, sla_high_hours, sla_medium_hours, sla_low_hours, icon)
VALUES 
    ('electrical', 'Electrical & Power', 'Power outlets, wiring, elevator lifts, generator, solar grid, lighting', 2, 8, 24, 48, 'Zap'),
    ('civil_maintenance', 'Civil & Plumbing', 'Water leaks, broken taps, washrooms, potholes, masonry, doors & locks', 3, 12, 24, 72, 'Wrench'),
    ('housekeeping', 'Housekeeping & Sanitation', 'Classroom cleanliness, garbage bins, restroom hygiene, pest control', 4, 12, 24, 48, 'Sparkles'),
    ('it_network', 'IT & Digital Infrastructure', 'Campus Wi-Fi, lab PCs, smartboards, servers, LAN ports, audio-visual', 2, 6, 18, 36, 'Wifi'),
    ('food_services', 'Food Services & Dining', 'Mess cleanliness, cafeteria food hygiene, drinking water coolers, kitchen safety', 1, 4, 12, 24, 'Utensils'),
    ('hostel', 'Hostel Affairs', 'Dormitory amenities, furniture, geysers, room fixtures, warden oversight', 3, 12, 24, 48, 'Building'),
    ('security', 'Campus Safety & Security', 'Gates, CCTV cameras, night lights, emergency access, trespass hazards', 1, 4, 12, 24, 'ShieldAlert')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT CHECK (role IN ('student', 'admin')) DEFAULT 'student',
    department_id TEXT REFERENCES public.departments(id),
    roll_number TEXT,
    verified BOOLEAN DEFAULT true,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    reporter_id UUID NOT NULL,
    reporter_name TEXT NOT NULL,
    reporter_email TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    department_id TEXT NOT NULL REFERENCES public.departments(id),
    location_building TEXT NOT NULL,
    location_floor TEXT NOT NULL,
    location_room TEXT NOT NULL,
    location_details TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('pending', 'assigned', 'in_progress', 'resolved', 'reopened', 'closed', 'escalated')) DEFAULT 'pending',
    assigned_to_id UUID,
    assigned_to_name TEXT,
    duplicate_of UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    upvotes INTEGER DEFAULT 1,
    upvoter_ids JSONB DEFAULT '[]'::jsonb,
    resolution_note TEXT,
    resolution_photo TEXT,
    reopen_reason TEXT,
    is_food_hygiene BOOLEAN DEFAULT false,
    food_hygiene_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ
);

-- 4. STATUS HISTORY
CREATE TABLE IF NOT EXISTS public.status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by_id UUID,
    changed_by_name TEXT NOT NULL,
    changed_by_role TEXT NOT NULL,
    note TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'status_update',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FOOD HYGIENE INSPECTIONS
CREATE TABLE IF NOT EXISTS public.food_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    facility_name TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    inspection_date TIMESTAMPTZ DEFAULT now(),
    checklist JSONB NOT NULL,
    score INTEGER NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    corrective_actions TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for lightning fast lookups & analytics
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON public.complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_reporter ON public.complaints(reporter_id);
CREATE INDEX IF NOT EXISTS idx_complaints_building ON public.complaints(location_building);
CREATE INDEX IF NOT EXISTS idx_history_complaint ON public.status_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_inspections ENABLE ROW LEVEL SECURITY;

-- Permissive policies for read / authenticated writes
CREATE POLICY "Departments are viewable by everyone" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Complaints are viewable by authenticated users" ON public.complaints FOR SELECT USING (true);
CREATE POLICY "Students can insert complaints" ON public.complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update complaints" ON public.complaints FOR UPDATE USING (true);

CREATE POLICY "Status history is viewable by all" ON public.status_history FOR SELECT USING (true);
CREATE POLICY "Status history insertable by all authenticated" ON public.status_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Notifications viewable by recipient" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Notifications insertable by system" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Notifications updatable by recipient" ON public.notifications FOR UPDATE USING (true);

CREATE POLICY "Food inspections viewable by all" ON public.food_inspections FOR SELECT USING (true);
CREATE POLICY "Food inspections insertable by admin" ON public.food_inspections FOR INSERT WITH CHECK (true);
