
-- Allow public access for development/testing purposes
-- This allows verify the frontend without needing authentication
-- Should be removed or disabled in production

-- Policies for trips
CREATE POLICY "Public can view trips" ON trips FOR SELECT TO anon USING (true);
CREATE POLICY "Public can insert trips" ON trips FOR INSERT TO anon WITH CHECK (true);

-- Policies for captains
CREATE POLICY "Public can view captains" ON captains FOR SELECT TO anon USING (true);

-- Policies for monitoring
CREATE POLICY "Public can view monitoring" ON trip_monitoring FOR SELECT TO anon USING (true);
CREATE POLICY "Public can insert monitoring" ON trip_monitoring FOR INSERT TO anon WITH CHECK (true);

-- Policies for vendors
CREATE POLICY "Public can view vendors" ON vendors FOR SELECT TO anon USING (true);
