-- =====================================================
-- migration: disable rls / policies on core gymratplanner tables
-- created: 2026-01-28
-- purpose: temporarily disable row level security on tables defined in
--          20260128141700_initial_schema.sql so that all rls policies
--          become inactive (useful for early development and debugging).
-- affected: exercises, templates, template_exercises, workouts,
--           workout_exercises, workout_sets, personal_bests,
--           analytics.event_log
-- =====================================================

-- note: this migration does not drop policies; it simply disables
-- row level security on the affected tables so that policies are
-- no longer enforced. rls can be re-enabled later in a follow-up
-- migration when you are ready to enforce policies again.

alter table exercises disable row level security;
alter table templates disable row level security;
alter table template_exercises disable row level security;
alter table workouts disable row level security;
alter table workout_exercises disable row level security;
alter table workout_sets disable row level security;
alter table personal_bests disable row level security;
alter table analytics.event_log disable row level security;
