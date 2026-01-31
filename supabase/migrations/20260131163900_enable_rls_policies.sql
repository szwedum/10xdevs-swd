-- =====================================================
-- Migration: Re-enable RLS policies on core GymRatPlanner tables
-- Created: 2026-01-31
-- Purpose: Re-enable Row Level Security to enforce user-specific data access.
--          This ensures users can only access their own templates and workouts.
-- Affected: exercises, templates, template_exercises, workouts,
--           workout_exercises, workout_sets, personal_bests,
--           analytics.event_log
-- =====================================================

-- Note: The RLS policies were already created in migration 20260128141700_initial_schema.sql
-- This migration simply re-enables RLS enforcement on all tables.

alter table exercises enable row level security;
alter table templates enable row level security;
alter table template_exercises enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table workout_sets enable row level security;
alter table personal_bests enable row level security;
alter table analytics.event_log enable row level security;
