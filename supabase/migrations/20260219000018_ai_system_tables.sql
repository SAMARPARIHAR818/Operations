-- AI System Tables

-- 1. Daily Ops Focus
-- Stores the AI-generated "Morning Briefing" priorities
CREATE TABLE IF NOT EXISTS public.daily_ops_focus (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    focus_date DATE DEFAULT CURRENT_DATE,
    top_priorities JSONB, -- Array of { id, title, impact_score, type, reason }
    summary_text TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT daily_ops_focus_date_key UNIQUE (focus_date)
);

-- 2. AI Decision/Chat Logs
-- Tracks every interaction for auditing and "Continuous Learning"
CREATE TABLE IF NOT EXISTS public.ai_decision_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    request_type TEXT, -- 'chat', 'recommendation', 'draft'
    query_text TEXT,
    ai_response_text TEXT,
    context_used JSONB, -- Snapshot of critical data fed to AI
    user_feedback_score INT CHECK (user_feedback_score BETWEEN 1 AND 5),
    actual_outcome TEXT, -- For future RLHF
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Settings
ALTER TABLE public.daily_ops_focus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view daily focus"
ON public.daily_ops_focus FOR SELECT
TO authenticated
USING (true);

-- Only system/functions usually insert this, but for now allow admins
CREATE POLICY "Admins manage daily focus"
ON public.daily_ops_focus FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);


ALTER TABLE public.ai_decision_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own logs"
ON public.ai_decision_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users insert their logs"
ON public.ai_decision_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
