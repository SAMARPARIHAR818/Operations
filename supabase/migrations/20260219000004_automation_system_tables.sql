-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ALERTS TABLE
-- Stores critical system alerts (Risk, Deadline, Performance, Finance)
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('Risk', 'Deadline', 'Performance', 'Finance', 'System')),
    severity TEXT NOT NULL CHECK (severity IN ('High', 'Medium', 'Low')),
    reference_entity TEXT, -- e.g., 'trip', 'captain'
    reference_id UUID,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. NOTIFICATIONS TABLE
-- Stores user-facing notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- Optional: if null, system-wide or role-based
    role_target TEXT, -- e.g., 'admin', 'captain'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('Info', 'Warning', 'Action_Required')),
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AUDIT LOGS TABLE
-- Tracks changes to critical entities
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL, -- e.g., 'UPDATE', 'INSERT', 'DELETE'
    entity_name TEXT NOT NULL, -- e.g., 'trips'
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB, -- Extra context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SYSTEM HEALTH LOGS TABLE
-- Tracks API failures, Cron successes, and Errors
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    log_level TEXT NOT NULL CHECK (log_level IN ('INFO', 'WARN', 'ERROR', 'CRITICAL')),
    source TEXT NOT NULL, -- e.g., 'cron', 'edge_function', 'database_trigger'
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES

-- Alerts: Admins see all, others see relevant
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all alerts"
ON public.alerts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);

-- Notifications: Users see their own or role-based
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    role_target = (SELECT role FROM public.users WHERE id = auth.uid())
);

-- Audit Logs: Read-only for Admins
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid() AND users.role = 'admin'
    )
);
