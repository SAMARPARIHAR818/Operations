-- Team Hub: team_members, standups, leaves, captain_pipeline, time_entries

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL CHECK (department IN ('Operations', 'Sales', 'Marketing', 'Finance', 'Support', 'Leadership')),
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'Offline' CHECK (status IN ('Online', 'Busy', 'On Leave', 'Offline')),
    location TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    specialization TEXT,
    salary NUMERIC(10, 2) DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_pending INTEGER DEFAULT 0,
    tasks_overdue INTEGER DEFAULT 0,
    on_time_rate FLOAT DEFAULT 100,
    trips_managed INTEGER DEFAULT 0,
    rating FLOAT DEFAULT 0,
    current_task TEXT,
    vendors_managed TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Standups
CREATE TABLE IF NOT EXISTS standups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    check_in_time TEXT,
    focus_items TEXT[] DEFAULT '{}',
    yesterday_done TEXT[] DEFAULT '{}',
    blockers TEXT DEFAULT 'None',
    mood TEXT DEFAULT '🟢' CHECK (mood IN ('🟢', '🟡', '🔴')),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(member_id, date)
);

-- Leave Requests
CREATE TABLE IF NOT EXISTS leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Annual', 'Sick', 'Personal', 'WFH', 'Half Day')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Approved', 'Pending', 'Rejected')),
    reason TEXT,
    approved_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Captain Onboarding Pipeline
CREATE TABLE IF NOT EXISTS captain_pipeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT,
    applied_date DATE DEFAULT CURRENT_DATE,
    stage TEXT DEFAULT 'Application' CHECK (stage IN ('Application', 'Screening', 'Interview', 'Trial Trip', 'Onboarded')),
    assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
    experience TEXT,
    rating FLOAT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Entries
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    hours FLOAT NOT NULL CHECK (hours > 0 AND hours <= 24),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_standups_date ON standups(date);
CREATE INDEX IF NOT EXISTS idx_standups_member ON standups(member_id);
CREATE INDEX IF NOT EXISTS idx_leaves_member ON leaves(member_id);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON captain_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_time_entries_member ON time_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);

-- Enable RLS but allow public access (matching existing pattern)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE standups ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE captain_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access on team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access on standups" ON standups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access on leaves" ON leaves FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access on captain_pipeline" ON captain_pipeline FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access on time_entries" ON time_entries FOR ALL USING (true) WITH CHECK (true);
