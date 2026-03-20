-- Fix auto_generate_tasks trigger to use correct column names
-- The tasks table uses 'linked_trip_id' NOT 'trip_id', and 'deadline' NOT 'due_date'

CREATE OR REPLACE FUNCTION auto_generate_tasks()
RETURNS TRIGGER AS $$
DECLARE
    v_trip_id UUID;
    dest TEXT;
BEGIN
    v_trip_id := NEW.id;
    dest := NEW.destination;

    -- 1. WHEN: Trip Created (INSERT)
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.tasks (title, linked_trip_id, status, priority, deadline, description)
        VALUES 
            ('Confirm Hotel Booking - ' || dest, v_trip_id, 'Pending', 'High', NOW() + INTERVAL '2 days', 'Verify hotel reservation details.'),
            ('Confirm Transport - ' || dest, v_trip_id, 'Pending', 'High', NOW() + INTERVAL '3 days', 'Ensure vehicle is allocated.'),
            ('Create WhatsApp Group - ' || dest, v_trip_id, 'Pending', 'Medium', NOW() + INTERVAL '1 day', 'Add captain and guests.'),
            ('Assign Captain Briefing Call', v_trip_id, 'Pending', 'Medium', NOW() + INTERVAL '5 days', 'Brief captain on itinerary.'),
            ('Vendor Payment Follow-up', v_trip_id, 'Pending', 'Low', NOW() + INTERVAL '7 days', 'Check advance payment status.');
    
    -- 2. WHEN: Trip Goes Live (UPDATE status = 'Live')
    ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'Live' AND OLD.status != 'Live') THEN
        INSERT INTO public.tasks (title, linked_trip_id, status, priority, deadline, description)
        VALUES
            ('Daily Compliance Check - Day 1', v_trip_id, 'Pending', 'High', NOW() + INTERVAL '1 day', 'Verify logs are submitted.'),
            ('Sentiment Review', v_trip_id, 'Pending', 'Medium', NOW() + INTERVAL '2 days', 'Check guest sentiment early.'),
            ('Mid-trip Ops Call', v_trip_id, 'Pending', 'Medium', NOW() + INTERVAL '3 days', 'Call captain for status update.');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-bind trigger (idempotent)
DROP TRIGGER IF EXISTS on_trip_task_generation ON public.trips;
CREATE TRIGGER on_trip_task_generation
AFTER INSERT OR UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION auto_generate_tasks();
