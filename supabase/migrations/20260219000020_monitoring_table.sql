-- Phase 7.1: Trip Monitoring Logs

CREATE TABLE IF NOT EXISTS public.trip_monitoring_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    log_date DATE DEFAULT CURRENT_DATE,
    morning_update BOOLEAN DEFAULT false,
    wakeup_call BOOLEAN DEFAULT false,
    vendor_coordination BOOLEAN DEFAULT false,
    complaint_count INT DEFAULT 0,
    sentiment_score INT CHECK (sentiment_score BETWEEN 1 AND 10),
    ops_rating INT CHECK (ops_rating BETWEEN 1 AND 10),
    notes TEXT,
    proof_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.trip_monitoring_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage monitoring"
ON public.trip_monitoring_logs FOR ALL TO authenticated USING (true);
