# PostgreSQL Database Schema – GymRatPlanner

## 1. Tables, Columns & Constraints

This table is managed by Supabase Auth.

### 1.1 `exercises`
| column | type | constraints |
|--------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| name | varchar(60) | NOT NULL, UNIQUE |
| created_by | uuid | FK → `auth.users(id)`, NULLABLE |
| created_at | timestamptz | NOT NULL, default `now()` |

CHECK: none

---

### 1.2 `templates`
| column | type | constraints |
|--------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| name | varchar(60) | NOT NULL |
| created_at | timestamptz | NOT NULL, default `now()` |

CONSTRAINTS
- UNIQUE (`user_id`, `name`)

---

### 1.3 `template_exercises`
| column | type | constraints |
|--------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| template_id | uuid | NOT NULL, FK → `templates(id)` ON DELETE CASCADE |
| exercise_id | uuid | NOT NULL, FK → `exercises(id)` |
| sets | smallint | NOT NULL, CHECK 1 ≤ sets ≤ 99 |
| reps | smallint | NOT NULL, CHECK 1 ≤ reps ≤ 99 |
| default_weight | numeric(6,2) | CHECK 0 ≤ default_weight ≤ 999 |
| position | smallint | NOT NULL |

CONSTRAINTS
- UNIQUE (`template_id`, `position`)

---

### 1.4 `workouts`
| column | type | constraints |
|--------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| user_id | uuid | NOT NULL, FK → `auth.users(id)` ON DELETE CASCADE |
| template_id | uuid | FK → `templates(id)` ON DELETE SET NULL |
| logged_at | timestamptz | NOT NULL, default `now()` |

---

### 1.5 `workout_exercises`
| column | type | constraints |
|--------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| workout_id | uuid | NOT NULL, FK → `workouts(id)` ON DELETE CASCADE |
| exercise_id | uuid | NOT NULL, FK → `exercises(id)` |
| position | smallint | NOT NULL |

CONSTRAINTS
- UNIQUE (`workout_id`, `position`)

---

### 1.6 `workout_sets`
| column | type | constraints |
|--------|------|-------------|
| id | uuid | PK, default `gen_random_uuid()` |
| workout_exercise_id | uuid | NOT NULL, FK → `workout_exercises(id)` ON DELETE CASCADE |
| set_index | smallint | NOT NULL |
| reps | smallint | NOT NULL, CHECK 1 ≤ reps ≤ 99 |
| weight | numeric(6,2) | NOT NULL, CHECK 0 ≤ weight ≤ 999 |

CONSTRAINTS
- UNIQUE (`workout_exercise_id`, `set_index`)

---

### 1.7 `personal_bests`
| column | type | constraints |
|--------|------|-------------|
| user_id | uuid | PK part, FK → `auth.users(id)` |
| exercise_id | uuid | PK part, FK → `exercises(id)` |
| weight | numeric(6,2) | NOT NULL |
| updated_at | timestamptz | NOT NULL, default `now()` |

---

### 1.8 `analytics.event_log`
(Schema: `analytics`)
| column | type | constraints |
|--------|------|-------------|
| id | bigserial | PK |
| user_id | uuid | FK → `auth.users(id)` |
| event_type | text | NOT NULL |
| occurred_at | timestamptz | NOT NULL, default `now()` |
| payload | jsonb | NOT NULL |

Partitioned monthly (`occurred_at`) with 5-year retention.

## 2. Relationships
- **1-to-M** `users → templates` (cascade delete)
- **1-to-M** `templates → template_exercises` (cascade delete)
- **1-to-M** `users → workouts` (cascade delete)
- **1-to-M** `workouts → workout_exercises` (cascade delete)
- **1-to-M** `workout_exercises → workout_sets` (cascade delete)
- **M-to-M** `users ↔ exercises` via `personal_bests`

## 3. Indexes
- `templates_user_name_idx` UNIQUE (`user_id`, `name`)
- `workouts_user_logged_at_idx` (`user_id`, `logged_at` DESC)
- `personal_bests_exercise_user_idx` (`exercise_id`, `user_id`)
- `template_exercises_template_position_idx` UNIQUE (`template_id`, `position`)
- `workout_exercises_workout_position_idx` UNIQUE (`workout_id`, `position`)
- `workout_sets_exercise_set_idx` UNIQUE (`workout_exercise_id`, `set_index`)
- `analytics.event_log_event_time_idx` (`event_type`, `occurred_at` DESC)

## 4. PostgreSQL Row-Level Security Policies
All policies assume Supabase with `auth.uid()`.

### 4.1 `exercises`
- `SELECT` for role `authenticated` (all rows).
- `INSERT`, `UPDATE`, `DELETE` permitted where `created_by = auth.uid()` OR `created_by IS NULL` (prevent deletion of seed rows).

### 4.2 `templates`, `template_exercises`, `workouts`, `workout_exercises`, `workout_sets`
- Enable RLS.
- Policy `owner_access`: `user_id = auth.uid()` (or joins via parent tables) for `SELECT`, `UPDATE`, `DELETE`.
- `INSERT` allowed when `user_id = auth.uid()`.

### 4.3 `personal_bests`
- Same owner policy using `user_id = auth.uid()` for all operations.

### 4.4 `analytics.event_log`
- `INSERT` allowed to all authenticated users (`user_id = auth.uid()`).
- `SELECT` limited to own rows (`user_id = auth.uid()`).

## 5. Additional Notes
- Numeric weight precision (`numeric(6,2)`) stores up to 999.99 kg.
- Ordering of exercises and sets preserved via `position` & `set_index` with UNIQUE constraints.
- Trigger `upsert_personal_best()` on `workout_sets` AFTER INSERT maintains `personal_bests` atomically (`ON CONFLICT DO UPDATE`).
- Future scale: consider partitioning `workout_sets` & `workouts` by year once >10 M rows.
