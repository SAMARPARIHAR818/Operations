-- Advanced Data Validation Trigger
CREATE OR REPLACE FUNCTION validate_data_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Prevent Trip without Captain if status is 'Live'
    IF TG_TABLE_NAME = 'trips' THEN
        IF NEW.status = 'Live' AND NEW.captain_id IS NULL THEN
            RAISE EXCEPTION 'Cannot set Trip to Live without an assigned Captain.';
        END IF;

        -- 2. Warn/Block if Revenue < Cost (Optional: strictly prevent or just warn? Prompt says "Prevent")
        IF NEW.total_revenue < NEW.total_cost THEN
            RAISE EXCEPTION 'Total Revenue cannot be less than Total Cost.';
        END IF;
    END IF;

    -- 3. Duplicate Vendor Entry Check (on vendors table)
    -- Assuming name + city should be unique
    IF TG_TABLE_NAME = 'vendors' THEN
         IF EXISTS (SELECT 1 FROM public.vendors WHERE name = NEW.name AND city = NEW.city AND id != NEW.id) THEN
            RAISE EXCEPTION 'Duplicate Vendor entry detected for Name and City.';
         END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bind Triggers
DROP TRIGGER IF EXISTS validate_trip_data ON public.trips;
CREATE TRIGGER validate_trip_data
BEFORE INSERT OR UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION validate_data_integrity();

DROP TRIGGER IF EXISTS validate_vendor_data ON public.vendors;
CREATE TRIGGER validate_vendor_data
BEFORE INSERT OR UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION validate_data_integrity();
