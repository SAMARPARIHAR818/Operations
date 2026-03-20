-- Add itinerary column to trips to store checkpoints array
ALTER TABLE trips ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
