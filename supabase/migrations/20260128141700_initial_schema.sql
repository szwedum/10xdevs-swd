-- =====================================================
-- Migration: Initial Schema for GymRatPlanner
-- Created: 2026-01-28
-- Purpose: Create all core tables, relationships, indexes, RLS policies, and triggers
-- Affected: exercises, templates, template_exercises, workouts, workout_exercises, 
--           workout_sets, personal_bests, analytics.event_log
-- =====================================================

-- =====================================================
-- 1. Create analytics schema
-- =====================================================
create schema if not exists analytics;

-- =====================================================
-- 2. Create tables
-- =====================================================

-- -----------------------------------------------------
-- 2.1 exercises table
-- Stores exercise definitions (e.g., "Bench Press", "Squat")
-- Can be created by users or seeded as defaults
-- -----------------------------------------------------
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name varchar(60) not null unique,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

comment on table exercises is 'Exercise definitions that can be used in templates and workouts';
comment on column exercises.created_by is 'User who created this exercise; NULL for seed/default exercises';

-- -----------------------------------------------------
-- 2.2 templates table
-- User-defined workout templates
-- Each user can have multiple templates with unique names
-- -----------------------------------------------------
create table templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(60) not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

comment on table templates is 'User-defined workout templates';
comment on column templates.name is 'Template name, must be unique per user';

-- -----------------------------------------------------
-- 2.3 template_exercises table
-- Exercises within a template with default sets/reps/weight
-- Position determines the order of exercises in the template
-- -----------------------------------------------------
create table template_exercises (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  sets smallint not null check (sets >= 1 and sets <= 99),
  reps smallint not null check (reps >= 1 and reps <= 99),
  default_weight numeric(6,2) check (default_weight >= 0 and default_weight <= 999),
  position smallint not null,
  unique (template_id, position)
);

comment on table template_exercises is 'Exercises within a template with default parameters';
comment on column template_exercises.position is 'Order of exercise in template (0-indexed)';
comment on column template_exercises.default_weight is 'Suggested starting weight in kg';

-- -----------------------------------------------------
-- 2.4 workouts table
-- Logged workout sessions
-- Can optionally reference the template they were based on
-- -----------------------------------------------------
create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references templates(id) on delete set null,
  logged_at timestamptz not null default now()
);

comment on table workouts is 'Logged workout sessions';
comment on column workouts.template_id is 'Template used for this workout; NULL if created from scratch';

-- -----------------------------------------------------
-- 2.5 workout_exercises table
-- Exercises performed in a specific workout
-- Position determines the order exercises were performed
-- -----------------------------------------------------
create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id uuid not null references exercises(id),
  position smallint not null,
  unique (workout_id, position)
);

comment on table workout_exercises is 'Exercises performed in a workout';
comment on column workout_exercises.position is 'Order exercise was performed in workout';

-- -----------------------------------------------------
-- 2.6 workout_sets table
-- Individual sets performed for each exercise in a workout
-- Stores actual reps and weight used
-- -----------------------------------------------------
create table workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references workout_exercises(id) on delete cascade,
  set_index smallint not null,
  reps smallint not null check (reps >= 1 and reps <= 99),
  weight numeric(6,2) not null check (weight >= 0 and weight <= 999),
  unique (workout_exercise_id, set_index)
);

comment on table workout_sets is 'Individual sets performed for each exercise';
comment on column workout_sets.set_index is 'Set number (0-indexed)';
comment on column workout_sets.weight is 'Weight used in kg';

-- -----------------------------------------------------
-- 2.7 personal_bests table
-- Tracks the highest weight achieved per user per exercise
-- Composite primary key ensures one record per user-exercise pair
-- -----------------------------------------------------
create table personal_bests (
  user_id uuid not null references auth.users(id),
  exercise_id uuid not null references exercises(id),
  weight numeric(6,2) not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

comment on table personal_bests is 'Personal best (highest weight) per user per exercise';
comment on column personal_bests.weight is 'Highest weight achieved in kg';

-- -----------------------------------------------------
-- 2.8 analytics.event_log table
-- Event tracking for analytics and user behavior analysis
-- Partitioned by month for performance and retention management
-- -----------------------------------------------------
create table analytics.event_log (
  id bigserial,
  user_id uuid references auth.users(id),
  event_type text not null,
  occurred_at timestamptz not null default now(),
  payload jsonb not null,
  primary key (id, occurred_at)
) partition by range (occurred_at);

comment on table analytics.event_log is 'Event log for analytics, partitioned monthly with 5-year retention';
comment on column analytics.event_log.event_type is 'Type of event (e.g., workout_completed, template_created)';
comment on column analytics.event_log.payload is 'Event-specific data in JSON format';

-- Create initial partitions for current and next 3 months
create table analytics.event_log_2026_01 partition of analytics.event_log
  for values from ('2026-01-01') to ('2026-02-01');

create table analytics.event_log_2026_02 partition of analytics.event_log
  for values from ('2026-02-01') to ('2026-03-01');

create table analytics.event_log_2026_03 partition of analytics.event_log
  for values from ('2026-03-01') to ('2026-04-01');

create table analytics.event_log_2026_04 partition of analytics.event_log
  for values from ('2026-04-01') to ('2026-05-01');

-- =====================================================
-- 3. Create indexes for query performance
-- =====================================================

-- Index for finding templates by user and name
create unique index templates_user_name_idx on templates(user_id, name);

-- Index for finding workouts by user, ordered by date (most recent first)
create index workouts_user_logged_at_idx on workouts(user_id, logged_at desc);

-- Index for finding personal bests by exercise and user
create index personal_bests_exercise_user_idx on personal_bests(exercise_id, user_id);

-- Index for enforcing unique positions within templates
create unique index template_exercises_template_position_idx on template_exercises(template_id, position);

-- Index for enforcing unique positions within workouts
create unique index workout_exercises_workout_position_idx on workout_exercises(workout_id, position);

-- Index for enforcing unique set indices within workout exercises
create unique index workout_sets_exercise_set_idx on workout_sets(workout_exercise_id, set_index);

-- Index for analytics queries by event type and time
create index event_log_event_time_idx on analytics.event_log(event_type, occurred_at desc);

-- =====================================================
-- 4. Enable Row Level Security (RLS)
-- =====================================================

alter table exercises enable row level security;
alter table templates enable row level security;
alter table template_exercises enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table workout_sets enable row level security;
alter table personal_bests enable row level security;
alter table analytics.event_log enable row level security;

-- =====================================================
-- 5. Create RLS Policies
-- =====================================================

-- -----------------------------------------------------
-- 5.1 exercises policies
-- All authenticated users can view exercises
-- Users can only modify exercises they created or seed exercises (created_by IS NULL)
-- -----------------------------------------------------

-- Allow all authenticated users to view exercises
create policy "exercises_select_authenticated"
  on exercises
  for select
  to authenticated
  using (true);

-- Allow authenticated users to insert exercises (will be owned by them)
create policy "exercises_insert_authenticated"
  on exercises
  for insert
  to authenticated
  with check (created_by = auth.uid());

-- Allow users to update their own exercises or seed exercises
create policy "exercises_update_authenticated"
  on exercises
  for update
  to authenticated
  using (created_by = auth.uid() or created_by is null);

-- Allow users to delete their own exercises (but not seed exercises)
create policy "exercises_delete_authenticated"
  on exercises
  for delete
  to authenticated
  using (created_by = auth.uid());

-- -----------------------------------------------------
-- 5.2 templates policies
-- Users can only access their own templates
-- -----------------------------------------------------

create policy "templates_select_authenticated"
  on templates
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "templates_insert_authenticated"
  on templates
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "templates_update_authenticated"
  on templates
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "templates_delete_authenticated"
  on templates
  for delete
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------
-- 5.3 template_exercises policies
-- Users can only access template_exercises for their own templates
-- -----------------------------------------------------

create policy "template_exercises_select_authenticated"
  on template_exercises
  for select
  to authenticated
  using (
    exists (
      select 1 from templates
      where templates.id = template_exercises.template_id
      and templates.user_id = auth.uid()
    )
  );

create policy "template_exercises_insert_authenticated"
  on template_exercises
  for insert
  to authenticated
  with check (
    exists (
      select 1 from templates
      where templates.id = template_exercises.template_id
      and templates.user_id = auth.uid()
    )
  );

create policy "template_exercises_update_authenticated"
  on template_exercises
  for update
  to authenticated
  using (
    exists (
      select 1 from templates
      where templates.id = template_exercises.template_id
      and templates.user_id = auth.uid()
    )
  );

create policy "template_exercises_delete_authenticated"
  on template_exercises
  for delete
  to authenticated
  using (
    exists (
      select 1 from templates
      where templates.id = template_exercises.template_id
      and templates.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------
-- 5.4 workouts policies
-- Users can only access their own workouts
-- -----------------------------------------------------

create policy "workouts_select_authenticated"
  on workouts
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "workouts_insert_authenticated"
  on workouts
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "workouts_update_authenticated"
  on workouts
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "workouts_delete_authenticated"
  on workouts
  for delete
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------
-- 5.5 workout_exercises policies
-- Users can only access workout_exercises for their own workouts
-- -----------------------------------------------------

create policy "workout_exercises_select_authenticated"
  on workout_exercises
  for select
  to authenticated
  using (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "workout_exercises_insert_authenticated"
  on workout_exercises
  for insert
  to authenticated
  with check (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "workout_exercises_update_authenticated"
  on workout_exercises
  for update
  to authenticated
  using (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "workout_exercises_delete_authenticated"
  on workout_exercises
  for delete
  to authenticated
  using (
    exists (
      select 1 from workouts
      where workouts.id = workout_exercises.workout_id
      and workouts.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------
-- 5.6 workout_sets policies
-- Users can only access workout_sets for their own workouts
-- -----------------------------------------------------

create policy "workout_sets_select_authenticated"
  on workout_sets
  for select
  to authenticated
  using (
    exists (
      select 1 from workout_exercises
      join workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = workout_sets.workout_exercise_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "workout_sets_insert_authenticated"
  on workout_sets
  for insert
  to authenticated
  with check (
    exists (
      select 1 from workout_exercises
      join workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = workout_sets.workout_exercise_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "workout_sets_update_authenticated"
  on workout_sets
  for update
  to authenticated
  using (
    exists (
      select 1 from workout_exercises
      join workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = workout_sets.workout_exercise_id
      and workouts.user_id = auth.uid()
    )
  );

create policy "workout_sets_delete_authenticated"
  on workout_sets
  for delete
  to authenticated
  using (
    exists (
      select 1 from workout_exercises
      join workouts on workouts.id = workout_exercises.workout_id
      where workout_exercises.id = workout_sets.workout_exercise_id
      and workouts.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------
-- 5.7 personal_bests policies
-- Users can only access their own personal bests
-- -----------------------------------------------------

create policy "personal_bests_select_authenticated"
  on personal_bests
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "personal_bests_insert_authenticated"
  on personal_bests
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "personal_bests_update_authenticated"
  on personal_bests
  for update
  to authenticated
  using (user_id = auth.uid());

create policy "personal_bests_delete_authenticated"
  on personal_bests
  for delete
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------
-- 5.8 analytics.event_log policies
-- Users can insert events and view their own events
-- -----------------------------------------------------

create policy "event_log_select_authenticated"
  on analytics.event_log
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "event_log_insert_authenticated"
  on analytics.event_log
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- =====================================================
-- 6. Create trigger function for personal_bests
-- Automatically updates personal_bests when a new workout_set is inserted
-- Uses ON CONFLICT to handle upserts atomically
-- =====================================================

create or replace function upsert_personal_best()
returns trigger as $$
declare
  v_user_id uuid;
  v_exercise_id uuid;
begin
  -- Get user_id and exercise_id by joining through workout_exercises and workouts
  select w.user_id, we.exercise_id
  into v_user_id, v_exercise_id
  from workout_exercises we
  join workouts w on w.id = we.workout_id
  where we.id = new.workout_exercise_id;

  -- Upsert personal best: insert or update if new weight is higher
  insert into personal_bests (user_id, exercise_id, weight, updated_at)
  values (v_user_id, v_exercise_id, new.weight, now())
  on conflict (user_id, exercise_id)
  do update set
    weight = greatest(personal_bests.weight, excluded.weight),
    updated_at = case
      when excluded.weight > personal_bests.weight then now()
      else personal_bests.updated_at
    end;

  return new;
end;
$$ language plpgsql security definer;

comment on function upsert_personal_best is 'Automatically maintains personal_bests table when workout_sets are inserted';

-- Create trigger to call the function after each workout_set insert
create trigger trigger_upsert_personal_best
  after insert on workout_sets
  for each row
  execute function upsert_personal_best();

comment on trigger trigger_upsert_personal_best on workout_sets is 'Updates personal_bests when a new set is logged';
