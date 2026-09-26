-- =============================================================================
-- TravelLord AI — NH-766 Wayanad Corridor MVP Database Schema
-- Run this in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =============================================================================

-- 1. Create hazard_segments table (Static seeded segments for MVP)
CREATE TABLE IF NOT EXISTS public.hazard_segments (
    segment_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    hazard_type TEXT NOT NULL,
    severity DOUBLE PRECISION NOT NULL CHECK (severity >= 0 AND severity <= 1),
    base_confidence DOUBLE PRECISION NOT NULL CHECK (base_confidence >= 0 AND base_confidence <= 1),
    source TEXT NOT NULL,
    trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('rising', 'stable', 'falling')),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create crowd_verifications table
CREATE TABLE IF NOT EXISTS public.crowd_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id TEXT NOT NULL REFERENCES public.hazard_segments(segment_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('cleared', 'still_blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create trips table
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    mode TEXT NOT NULL,
    travel_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- Row Level Security (RLS) Configuration
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.hazard_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crowd_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public read hazard_segments" ON public.hazard_segments;
DROP POLICY IF EXISTS "Public read crowd_verifications" ON public.crowd_verifications;
DROP POLICY IF EXISTS "Authenticated insert own crowd_verifications" ON public.crowd_verifications;
DROP POLICY IF EXISTS "Users can CRUD own trips" ON public.trips;

-- Policy 1: hazard_segments - public read access for all
CREATE POLICY "Public read hazard_segments" 
ON public.hazard_segments 
FOR SELECT 
USING (true);

-- Policy 2: crowd_verifications - anyone can SELECT
CREATE POLICY "Public read crowd_verifications" 
ON public.crowd_verifications 
FOR SELECT 
USING (true);

-- Policy 3: crowd_verifications - only authenticated users can INSERT their own row
CREATE POLICY "Authenticated insert own crowd_verifications" 
ON public.crowd_verifications 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy 4: trips - authenticated users can only access their own rows for all operations
CREATE POLICY "Users can CRUD own trips" 
ON public.trips 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- Seed Data: 6 Corridor Hazard Segments along NH-766 Wayanad
-- =============================================================================

INSERT INTO public.hazard_segments (
    segment_id, name, lat, lng, hazard_type, severity, base_confidence, source, trend, last_updated
) VALUES
('S1', 'Adivaram to Chooralmala', 11.4880, 76.1220, 'landslide', 0.85, 0.80, 'GSI susceptibility zone (Modeled)', 'rising', now()),
('S2', 'Meppadi Junction', 11.5480, 76.2790, 'flood', 0.55, 0.70, 'IMD rainfall bulletin (Modeled)', 'stable', now()),
('S3', 'Vythiri Ghat Section', 11.5760, 76.0980, 'landslide', 0.60, 0.60, 'GSI susceptibility zone (Modeled)', 'stable', now()),
('S4', 'Muthanga Wildlife Corridor', 11.6280, 76.4310, 'wildlife', 0.45, 0.50, 'Forest dept corridor map (Simulated)', 'falling', now()),
('S5', 'Lakkidi Viewpoint Curve', 11.5000, 75.9980, 'landslide', 0.30, 0.65, 'GSI susceptibility zone (Modeled)', 'stable', now()),
('S6', 'Kalpetta Bypass', 11.6090, 76.0830, 'road_closure', 0.20, 0.90, 'Local traffic advisory (Simulated)', 'falling', now())
ON CONFLICT (segment_id) DO UPDATE SET
    name = EXCLUDED.name,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    hazard_type = EXCLUDED.hazard_type,
    severity = EXCLUDED.severity,
    base_confidence = EXCLUDED.base_confidence,
    source = EXCLUDED.source,
    trend = EXCLUDED.trend,
    last_updated = EXCLUDED.last_updated;

-- 4. Create safe_locations table (Shelters & Designated Waypoints)
CREATE TABLE IF NOT EXISTS public.safe_locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    location_type TEXT NOT NULL DEFAULT 'SAFE_ZONE',
    capacity_status TEXT NOT NULL DEFAULT 'AVAILABLE',
    nearest_segment_id TEXT REFERENCES public.hazard_segments(segment_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create decision_history table (Auditable decision logs)
CREATE TABLE IF NOT EXISTS public.decision_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resolved_action TEXT NOT NULL,
    risk_score DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    decision_window_minutes INTEGER NOT NULL DEFAULT 15,
    recoverability TEXT NOT NULL DEFAULT 'HIGH',
    controlling_segment_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.safe_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read safe_locations" ON public.safe_locations FOR SELECT USING (true);
CREATE POLICY "Users can CRUD own decision_history" ON public.decision_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- Performance & Query Optimization Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_crowd_verifications_segment_created ON public.crowd_verifications (segment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trips_user_created ON public.trips (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_decision_history_trip_user ON public.decision_history (trip_id, user_id, created_at DESC);
