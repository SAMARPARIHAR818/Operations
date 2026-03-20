-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE captain_status AS ENUM ('Active', 'Inactive', 'Suspended');
CREATE TYPE trip_type AS ENUM ('Party', 'Explorer', 'Elderly', 'International');
CREATE TYPE trip_status AS ENUM ('Upcoming', 'Live', 'Completed', 'Cancelled');
CREATE TYPE applicant_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE applicant_final_status AS ENUM ('Shortlisted', 'Rejected', 'Onboarded');
CREATE TYPE risk_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE vendor_type AS ENUM ('Hotel', 'Transport', 'Activity', 'Local Partner');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE task_status AS ENUM ('Pending', 'In Progress', 'Completed');
CREATE TYPE task_category AS ENUM ('Hiring', 'Monitoring', 'Vendor', 'Finance', 'Crisis');

-- TABLE 1: captains
CREATE TABLE captains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    city TEXT,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status captain_status DEFAULT 'Active',
    experience_years INTEGER,
    total_trips_completed INTEGER DEFAULT 0,
    average_nps_score FLOAT,
    crisis_handling_score FLOAT CHECK (crisis_handling_score BETWEEN 1 AND 10),
    communication_score FLOAT CHECK (communication_score BETWEEN 1 AND 10),
    leadership_score FLOAT CHECK (leadership_score BETWEEN 1 AND 10),
    engagement_score FLOAT CHECK (engagement_score BETWEEN 1 AND 10),
    instagram_presence_score FLOAT CHECK (instagram_presence_score BETWEEN 1 AND 10),
    reliability_score FLOAT CHECK (reliability_score BETWEEN 1 AND 10),
    late_report_count INTEGER DEFAULT 0,
    cancellation_incidents INTEGER DEFAULT 0,
    preferred_trip_type trip_type[],
    risk_flag BOOLEAN DEFAULT FALSE,
    internal_notes TEXT,
    captain_overall_score FLOAT CHECK (captain_overall_score BETWEEN 0 AND 100), -- Computed via trigger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 2: captain_applicants
CREATE TABLE captain_applicants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    city TEXT,
    interview_date TIMESTAMP WITH TIME ZONE,
    interviewer_notes TEXT,
    communication_score FLOAT CHECK (communication_score BETWEEN 1 AND 10),
    confidence_score FLOAT CHECK (confidence_score BETWEEN 1 AND 10),
    maturity_score FLOAT CHECK (maturity_score BETWEEN 1 AND 10),
    leadership_potential_score FLOAT CHECK (leadership_potential_score BETWEEN 1 AND 10),
    founder_round_status applicant_status DEFAULT 'Pending',
    final_status applicant_final_status,
    rejection_reason TEXT,
    applicant_score FLOAT, -- Computed via trigger
    is_recommended BOOLEAN GENERATED ALWAYS AS (applicant_score > 7.5) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 3: trips
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    trip_type trip_type NOT NULL,
    status trip_status DEFAULT 'Upcoming',
    captain_id UUID REFERENCES captains(id),
    expected_pax INTEGER,
    confirmed_pax INTEGER,
    total_revenue NUMERIC(15, 2) DEFAULT 0,
    total_cost NUMERIC(15, 2) DEFAULT 0,
    gross_profit NUMERIC(15, 2) GENERATED ALWAYS AS (total_revenue - total_cost) STORED,
    net_profit NUMERIC(15, 2), -- Could be calculated but field requested
    vendor_cost_total NUMERIC(15, 2) DEFAULT 0,
    activity_cost_total NUMERIC(15, 2) DEFAULT 0,
    marketing_cost_allocated NUMERIC(15, 2) DEFAULT 0,
    cancellation_rate FLOAT DEFAULT 0,
    risk_level risk_level DEFAULT 'Low',
    group_sentiment_score FLOAT CHECK (group_sentiment_score BETWEEN 1 AND 10),
    compliance_score FLOAT CHECK (compliance_score BETWEEN 0 AND 100),
    trip_health_score FLOAT CHECK (trip_health_score BETWEEN 0 AND 100), -- Computed via trigger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Derived calculations (view pending, but columns added above for persistence via triggers)

-- TABLE 4: trip_monitoring
CREATE TABLE trip_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    morning_update_received BOOLEAN DEFAULT FALSE,
    itinerary_shared BOOLEAN DEFAULT FALSE,
    wakeup_done BOOLEAN DEFAULT FALSE,
    vendor_coordination_done BOOLEAN DEFAULT FALSE,
    activity_proof_uploaded BOOLEAN DEFAULT FALSE,
    emergency_issue_flag BOOLEAN DEFAULT FALSE,
    complaint_count INTEGER DEFAULT 0,
    sentiment_score FLOAT CHECK (sentiment_score BETWEEN 1 AND 10),
    ops_rating FLOAT CHECK (ops_rating BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 5: vendors
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_name TEXT NOT NULL,
    vendor_type vendor_type NOT NULL,
    location TEXT,
    contact_person TEXT,
    phone TEXT,
    base_price NUMERIC(15, 2),
    negotiated_price NUMERIC(15, 2),
    last_negotiated_date TIMESTAMP WITH TIME ZONE,
    payment_terms TEXT,
    reliability_score FLOAT CHECK (reliability_score BETWEEN 1 AND 10),
    escalation_incidents INTEGER DEFAULT 0,
    cancellation_history INTEGER DEFAULT 0,
    average_rating FLOAT CHECK (average_rating BETWEEN 1 AND 10),
    risk_flag BOOLEAN DEFAULT FALSE,
    internal_notes TEXT,
    vendor_score FLOAT, -- Computed via trigger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction Table: trip_vendors
CREATE TABLE trip_vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    agreed_price NUMERIC(15, 2),
    status TEXT, -- e.g., 'Booked', 'Paid', 'Cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 6: tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    linked_trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    linked_captain_id UUID REFERENCES captains(id) ON DELETE SET NULL,
    priority task_priority DEFAULT 'Medium',
    deadline TIMESTAMP WITH TIME ZONE,
    assigned_to UUID, -- References auth.users or internal user table
    status task_status DEFAULT 'Pending',
    category task_category,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLE 7: performance_records
CREATE TABLE performance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    captain_id UUID REFERENCES captains(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    trip_nps FLOAT,
    complaint_count INTEGER DEFAULT 0,
    upsell_success BOOLEAN DEFAULT FALSE,
    punctuality_score FLOAT CHECK (punctuality_score BETWEEN 1 AND 10),
    group_engagement_score FLOAT CHECK (group_engagement_score BETWEEN 1 AND 10),
    issue_resolution_score FLOAT CHECK (issue_resolution_score BETWEEN 1 AND 10),
    final_rating FLOAT, -- Computed via trigger
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_captains_email ON captains(email);
CREATE INDEX idx_captains_phone ON captains(phone);
CREATE INDEX idx_trips_captain_id ON trips(captain_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_monitoring_trip_id ON trip_monitoring(trip_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
