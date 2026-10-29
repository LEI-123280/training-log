-- ==============================================================================
-- GymLog PWA - Supabase PostgreSQL Schema
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Exercises Table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    target_muscle TEXT NOT NULL,
    equipment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Routines (Workout Templates) Table
CREATE TABLE IF NOT EXISTS routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Routine Exercises Table
CREATE TABLE IF NOT EXISTS routine_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    target_sets INT NOT NULL DEFAULT 3
);

-- 4. Workout Sessions Table
CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    notes TEXT,
    sync_status TEXT DEFAULT 'synced'
);

-- 5. Workout Sets (Completed Sets) Table
CREATE TABLE IF NOT EXISTS workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
    set_number INT NOT NULL,
    weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 0,
    reps INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT TRUE,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast queries and aggregation
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine ON routine_exercises(routine_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_start_time ON workout_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session ON workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_logged ON workout_sets(exercise_id, logged_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- For single-user personal app, permit authenticated anon role access or token policy:
CREATE POLICY "Allow public anon full access for personal log" ON exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon full access for personal log" ON routines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon full access for personal log" ON routine_exercises FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon full access for personal log" ON workout_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public anon full access for personal log" ON workout_sets FOR ALL USING (true) WITH CHECK (true);
