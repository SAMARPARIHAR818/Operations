-- Generic Audit Logging Function
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF (TG_OP = 'INSERT') THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;

    INSERT INTO public.audit_logs (
        user_id, -- Will be null if triggered by system, or auth.uid() if RLS allows
        action_type,
        entity_name,
        entity_id,
        old_value,
        new_value
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data
    );
    
    RETURN NULL; -- Result is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Audit Log to Critical Tables
-- Trips
DROP TRIGGER IF EXISTS audit_trips_change ON public.trips;
CREATE TRIGGER audit_trips_change
AFTER INSERT OR UPDATE OR DELETE ON public.trips
FOR EACH ROW EXECUTE FUNCTION log_table_changes();

-- Captains
DROP TRIGGER IF EXISTS audit_captains_change ON public.captains;
CREATE TRIGGER audit_captains_change
AFTER INSERT OR UPDATE OR DELETE ON public.captains
FOR EACH ROW EXECUTE FUNCTION log_table_changes();

-- Vendors
DROP TRIGGER IF EXISTS audit_vendors_change ON public.vendors;
CREATE TRIGGER audit_vendors_change
AFTER INSERT OR UPDATE OR DELETE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION log_table_changes();
