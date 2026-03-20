-- Fix: validate_data_integrity() trigger uses wrong column names
-- vendors table columns are vendor_name and location, not name and city
CREATE OR REPLACE FUNCTION validate_data_integrity()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Trip: Cannot go Live without Captain
    IF TG_TABLE_NAME = 'trips' THEN
        IF NEW.status = 'Live' AND NEW.captain_id IS NULL THEN
            RAISE EXCEPTION 'Cannot set Trip to Live without an assigned Captain.';
        END IF;
        IF NEW.total_revenue < NEW.total_cost THEN
            RAISE EXCEPTION 'Total Revenue cannot be less than Total Cost.';
        END IF;
    END IF;

    -- 2. Vendor: Duplicate check (vendor_name + location)
    IF TG_TABLE_NAME = 'vendors' THEN
         IF EXISTS (SELECT 1 FROM public.vendors WHERE vendor_name = NEW.vendor_name AND location = NEW.location AND id != NEW.id) THEN
            RAISE EXCEPTION 'Duplicate Vendor entry detected for Name and Location.';
         END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
