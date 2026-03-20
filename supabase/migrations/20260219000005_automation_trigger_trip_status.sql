-- Automated action when Trip Status changes
CREATE OR REPLACE FUNCTION handle_trip_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the status change in Audit Logs
    INSERT INTO public.audit_logs (
        action_type,
        entity_name,
        entity_id,
        old_value,
        new_value,
        timestamp
    ) VALUES (
        'STATUS_CHANGE',
        'trips',
        NEW.id,
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status),
        NOW()
    );

    -- AUTOMATION: When Trip goes 'Live'
    IF NEW.status = 'Live' AND OLD.status != 'Live' THEN
        
        -- 1. Create default monitoring entry if not exists
        IF NOT EXISTS (SELECT 1 FROM public.trip_monitoring WHERE trip_id = NEW.id) THEN
            INSERT INTO public.trip_monitoring (trip_id, alert_level)
            VALUES (NEW.id, 'Green');
        END IF;

        -- 2. Notify Assigned Captain
        IF NEW.captain_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, role_target, title, message, type)
            VALUES (
                NEW.captain_id,
                'captain',
                'Trip is Now Live',
                'Trip to ' || NEW.destination || ' is now Live. Please submit daily logs.',
                'Action_Required'
            );
        END IF;

        -- 3. Log System Event
        INSERT INTO public.system_logs (log_level, source, message, details)
        VALUES ('INFO', 'trigger:trip_status', 'Trip ' || NEW.id || ' went Live. Automation executed.', jsonb_build_object('trip_id', NEW.id));
        
    END IF;

    -- AUTOMATION: When Trip is 'Completed'
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        -- Trigger Feedback Request (Placeholder for now, usually handled by Edge Function or just a notification)
        INSERT INTO public.alerts (type, severity, message, reference_entity, reference_id)
        VALUES (
            'Performance',
            'Low',
            'Trip Completed. Waiting for feedback processing.',
            'trip',
            NEW.id
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger
DROP TRIGGER IF EXISTS on_trip_status_change ON public.trips;

CREATE TRIGGER on_trip_status_change
AFTER UPDATE OF status ON public.trips
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION handle_trip_status_change();
