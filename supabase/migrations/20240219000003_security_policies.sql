-- Enable RLS on all tables
ALTER TABLE captains ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_records ENABLE ROW LEVEL SECURITY;

-- Create User Roles table (since we need to store roles)
CREATE TABLE user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT CHECK (role IN ('admin', 'ops', 'founder')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Helper Functions to check roles
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_founder() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'founder'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_ops() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'ops'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies

-- 1. user_roles: Users can read their own role. Only Admin can manage roles.
CREATE POLICY "Users can read own role" ON user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON user_roles FOR ALL TO authenticated USING (is_admin());

-- 2. General Access Policy
-- Requirement: "Internal-use only", "Role-based".
-- We assume all valid roles (admin, ops, founder) have access to the core operational data.
-- We will create a helper to check if user has ANY valid role.
CREATE OR REPLACE FUNCTION is_internal_user() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'ops', 'founder')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply "Internal Users can View" policy to all tables
CREATE POLICY "Internal users can view captains" ON captains FOR SELECT TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can view applicants" ON captain_applicants FOR SELECT TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can view trips" ON trips FOR SELECT TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can view monitoring" ON trip_monitoring FOR SELECT TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can view vendors" ON vendors FOR SELECT TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can view tasks" ON tasks FOR SELECT TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can view performance" ON performance_records FOR SELECT TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can view trip_vendors" ON trip_vendors FOR SELECT TO authenticated USING (is_internal_user());

-- Apply Write Policies
-- Admins/Founders: Full Write Access
-- Ops: Full Write Access (Operational OS)
-- We can simplify by granting All privileges to verified internal users for this version, 
-- or separate them if we want to be strict. Given "Ops OS", Ops likely need to write to everything.
CREATE POLICY "Internal users can insert/update captains" ON captains FOR ALL TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can insert/update applicants" ON captain_applicants FOR ALL TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can insert/update trips" ON trips FOR ALL TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can insert/update monitoring" ON trip_monitoring FOR ALL TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can insert/update vendors" ON vendors FOR ALL TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can insert/update tasks" ON tasks FOR ALL TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can insert/update performance" ON performance_records FOR ALL TO authenticated USING (is_internal_user());
CREATE POLICY "Internal users can insert/update trip_vendors" ON trip_vendors FOR ALL TO authenticated USING (is_internal_user());

-- Note: In a stricter system, we might restrict DELETE to Admin/Founder only.
-- Let's add that restriction for 'captains' and 'trips' to show role difference.
-- We must DROP the "ALL" policies above for captains/trips and create granular ones if we do this.
-- But for simplicity and meeting the "Role-based" requirement without over-engineering restrictions not asked for:
-- The current implementation uses RLS to restricted access to ONLY those with a role in `user_roles`.
-- Regular `authenticated` users without a row in `user_roles` get NO access.
