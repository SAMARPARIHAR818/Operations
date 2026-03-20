-- Phase 7: Real-Time Data Entry System Schema

-- 1. Enhanced Captains Profile
ALTER TABLE public.captains
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS detailed_scores JSONB DEFAULT '{}'::jsonb;
-- detailed_scores example: { "communication": 5, "leadership": 4, "crisis_handling": 5 }

-- 2. Itinerary Items Table
CREATE TABLE IF NOT EXISTS public.itinerary_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    activity_name TEXT NOT NULL,
    time_slot TIME, -- Optional specific time
    location TEXT,
    responsible_person TEXT, -- e.g., "Captain", "Vendor Driver"
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Skipped', 'Delayed')),
    completion_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for itinerary_items
ALTER TABLE public.itinerary_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users view itinerary"
ON public.itinerary_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users manage itinerary"
ON public.itinerary_items FOR ALL TO authenticated USING (true);

-- 3. Storage Buckets (Insert if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('captain-photos', 'captain-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-documents', 'trip-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage (Simplified for allowed authenticated uploads)
CREATE POLICY "Auth users can upload captain photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'captain-photos');

CREATE POLICY "Auth users can view captain photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'captain-photos');

CREATE POLICY "Auth users can upload trip docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'trip-documents');

CREATE POLICY "Auth users can view trip docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'trip-documents');
