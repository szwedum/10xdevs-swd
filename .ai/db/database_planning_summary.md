<conversation_summary>
<decisions>
1. **Granularity of workout data** – Store individual sets in `workout_sets`; include `reps` and `weight` per row so users can vary reps/weight per-set.  
2. **Timestamps** – Only keep a single `logged_at` timestamp for workouts in MVP; omit session duration tracking.  
3. **Data-integrity checks** – Add CHECK constraints for sets (1–99), reps (1–99), weight (≤ 999 kg) in `template_exercises`, `workout_sets`, and `personal_bests`; enforce max length (e.g., 60 chars) for exercise and template names.  
4. **Template uniqueness** – Unique index on (`user_id`, `name`) in `templates`.  
5. **Event logging** – Use `analytics.event_log` with columns (`event_type`, `user_id`, `occurred_at`, `payload jsonb`); index `event_type`, `occurred_at`; monthly range partitions; 5-year retention target.  
6. **Personal bests** – Persist in `personal_bests`; update via `AFTER INSERT ON workout_sets` trigger calling `upsert_personal_best()` that performs atomic `ON CONFLICT … DO UPDATE`.  
7. **Exercise catalog** – `exercises` is shared/immutable; add nullable `created_by` for future custom entries; RLS allows `SELECT` to all authenticated users.  
8. **Template deletion** – Hard-delete template rows; `workouts.template_id` is nullable with `ON DELETE SET NULL` to preserve history.  
9. **Ordering** – Add `position` integer plus composite UNIQUE (`template_id`, `position`) and (`workout_id`, `position`).  
10. **Indexes & scalability** – Composite indexes (`user_id`, `completed_at`) on `workouts` and (`exercise_id`, `user_id`) on `personal_bests`; table-level range partitioning postponed except for `event_log`.
</decisions>

<matched_recommendations>
1. Capture every set in `workout_sets` for detailed history.  
2. Store `reps` on `workout_sets` rows to allow per-set variation.  
3. Enforce CHECK constraints for numeric ranges and name lengths.  
4. Unique (`user_id`, `name`) index for templates.  
5. `analytics.event_log` schema with jsonb payload + indexes.  
6. Persist personal bests; update via trigger with atomic upsert.  
7. Shared `exercises` table with nullable `created_by` and open `SELECT` RLS.  
8. `ON DELETE SET NULL` on `template_id` to keep workout history.  
9. `position` column + composite UNIQUE to preserve exercise order.  
10. Composite indexes for key query patterns; defer heavy partitioning except monthly `event_log` partitions.
</matched_recommendations>

<database_planning_summary>
• **Core entities**: `users` (supabase auth), `exercises`, `templates`, `template_exercises`, `workouts`, `workout_exercises`, `workout_sets`, `personal_bests`, `analytics.event_log`.  
• **Relationships**:  
  – `templates.user_id → users.id` (FK, cascade delete hard)  
  – `template_exercises.template_id → templates.id` (ordered by `position`)  
  – `workouts.user_id → users.id`; optional `template_id → templates.id` (`SET NULL` on delete)  
  – `workout_exercises.workout_id → workouts.id`; ordered  
  – `workout_sets.workout_exercise_id → workout_exercises.id`  
  – `personal_bests.user_id + exercise_id` composite PK/FK  
• **Key constraints & indexes**: CHECKs on numeric fields and name lengths; unique (`user_id`, `name`) on templates; composite indexes on `workouts(user_id, completed_at)` and `personal_bests(exercise_id, user_id)`.  
• **Security (RLS)**:  
  – `exercises`: read-only `SELECT` for all authenticated users.  
  – All mutable tables: policies restricting rows to `auth.uid()`.  
• **Data-integrity automation**: trigger `upsert_personal_best()` after insert on `workout_sets`.  
• **Analytics & logging**: separate `analytics` schema, `event_log` with jsonb payload, monthly partitions, 5-year retention.  
• **Scalability**: current scale (<1 k users) handled by indexes; partitioning only on `event_log`; revisit at 10 M+ rows.  
• **Data model flexibility**: nullable `created_by` on `exercises` anticipates custom exercises; weight stored as `numeric(6,2)` kilograms; future unit preferences can add column later.
<entities>
- **exercises**
  - `id uuid` (PK)
  - `name varchar(60)`
  - `created_by uuid` (nullable FK `users.id`)
  - `created_at timestamptz`

- **templates**
  - `id uuid` (PK)
  - `user_id uuid` (FK `users.id`)
  - `name varchar(60)`
  - `created_at timestamptz`

- **template_exercises**
  - `id uuid` (PK)
  - `template_id uuid` (FK `templates.id`)
  - `exercise_id uuid` (FK `exercises.id`)
  - `sets smallint`
  - `reps smallint`
  - `default_weight numeric(6,2)`
  - `position smallint`

- **workouts**
  - `id uuid` (PK)
  - `user_id uuid` (FK `users.id`)
  - `template_id uuid` (nullable FK `templates.id`)
  - `logged_at timestamptz`

- **workout_exercises**
  - `id uuid` (PK)
  - `workout_id uuid` (FK `workouts.id`)
  - `exercise_id uuid` (FK `exercises.id`)
  - `position smallint`

- **workout_sets**
  - `id uuid` (PK)
  - `workout_exercise_id uuid` (FK `workout_exercises.id`)
  - `set_index smallint`
  - `reps smallint`
  - `weight numeric(6,2)`

- **personal_bests**
  - `user_id uuid` (PK part)
  - `exercise_id uuid` (PK part)
  - `weight numeric(6,2)`
  - `updated_at timestamptz`

- **analytics.event_log**
  - `id bigserial` (PK)
  - `user_id uuid`
  - `event_type text`
  - `occurred_at timestamptz`
  - `payload jsonb`
</entities>
</database_planning_summary>

<unresolved_issues>
1. Exact max length limits for exercise and template names (proposed 60 chars—confirm).  
2. Retention/archival mechanism details for data older than 5 years.  
3. Whether monthly partitions should also apply to very large tables like `workout_sets` in future.  
4. Naming convention for schemas, tables, and indexes to ensure consistency.  
5. Final decision on weight unit localization strategy post-MVP.  
</unresolved_issues>
</conversation_summary>
