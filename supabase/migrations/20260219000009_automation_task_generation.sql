-- Automated Task Generation
CREATE OR REPLACE FUNCTION auto_generate_tasks()
RETURNS TRIGGER AS $$
DECLARE
    trip_id UUID;
    dest TEXT;
BEGIN
    trip_id := NEW.id;
    dest := NEW.destination;

    -- 1. WHEN: Trip Created (INSERT)
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.tasks (title, trip_id, status, priority, due_date, description)
        VALUES 
            ('Confirm Hotel Booking - ' || dest, trip_id, 'Pending', 'High', NOW() + INTERVAL '2 days', 'Verify hotel reservation details.'),
            ('Confirm Transport - ' || dest, trip_id, 'Pending', 'High', NOW() + INTERVAL '3 days', 'Ensure vehicle is allocated.'),
            ('Create WhatsApp Group - ' || dest, trip_id, 'Pending', 'Medium', NOW() + INTERVAL '1 day', 'Add captain and guests.'),
            ('Assign Captain Briefing Call', trip_id, 'Pending', 'Medium', NOW() + INTERVAL '5 days', 'Brief captain on itinerary.'),
            ('Vendor Payment Follow-up', trip_id, 'Pending', 'Low', NOW() + INTERVAL '7 days', 'Check advance payment status.');
    
    -- 2. WHEN: Trip Goes Live (UPDATE status = 'Live')
    ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'Live' AND OLD.status != 'Live') THEN
        INSERT INTO public.tasks (title, trip_id, status, priority, due_date, description)
        VALUES
            ('Daily Compliance Check - Day 1', trip_id, 'Pending', 'High', NOW() + INTERVAL '1 day', 'Verify logs are submitted.'),
            ('Sentiment Review', trip_id, 'Pending', 'Medium', NOW() + INTERVAL '2 days', 'Check guest sentiment early.'),
            ('Mid-trip Ops Call', trip_id, 'Pending', 'Medium', NOW() + INTERVAL '3 days', 'Call captain for status update.');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger to Trips Table
DROP TRIGGER IF EXISTS on_trip_task_generation ON public.trips;
CREATE TRIGGER on_trip_task_generation
AFTER INSERT OR UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION auto_generate_tasks();
