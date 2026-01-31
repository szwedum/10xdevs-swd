# View Implementation Plan – Active Workout View

## 1. Overview
The **Active Workout View** allows an authenticated user to log exercise results for a workout derived from a chosen template. It fetches suggested set data (prefill), displays all template exercises in a single scrolling form, validates inputs, persists the workout on completion, optionally updates personal bests, and redirects back to the templates list after success.

## 2. View Routing
Path: `/workout/[templateId]` (Astro dynamic route)

*File structure*
```
src/pages/workout/[templateId].astro   → page wrapper (auth, data fetching)
src/components/workout/               → React component tree
```

## 3. Component Structure
- **WorkoutPage (Astro)**
  - **WorkoutForm (React)**
    - **StickyHeader** – workout name + date
    - **ProgressIndicator** _(optional)_
    - **ExerciseInput** (repeated)
      - **SetInputRow** (repeated)
    - **StickyFooterActions** – Complete / Cancel buttons
    - **LoadingOverlay** _(conditional)_
    - **SuccessToast** _(portal)_
    - **CancelConfirmationDialog** _(portal)_

## 4. Component Details
### WorkoutPage.astro
- **Purpose**: top-level route; checks auth, fetches prefill data via server-side load, passes props to `WorkoutForm`.
- **Main elements**: `<WorkoutForm prefill={prefill} />`.
- **Events**: none (delegated).
- **Validation**: none.
- **Props**: `prefill: WorkoutPrefillResponseDTO`.

### WorkoutForm (React)
- **Purpose**: owns form state, renders exercises, handles validation and API calls.
- **Main elements**: `<form>`, children components, portals.
- **Events**:
  - `onBlur` / `onChange` for set inputs → field-level validation.
  - `onSubmit` → POST `/api/workouts`.
  - `onCancel` → open confirmation dialog.
- **Validation**: FR-040‒047, US-018, US-019 (sets 1-99, reps 1-99, weight 0-999, positive, required).
- **Types**: `WorkoutFormVM`, `WorkoutFormExerciseVM`, `WorkoutFormSetVM` (see §5).
- **Props**: `prefill: WorkoutPrefillResponseDTO`.

### StickyHeader
- Shows template name + current date.
- Uses `position:sticky; top:0;`.
- No inputs; aria-live region for progress updates.

### ProgressIndicator _(optional)_
- Displays `Exercise i / n` as user focuses inputs.

### ExerciseInput
- **Purpose**: renders an exercise block.
- **Main elements**: `<fieldset>` with `<legend>` exercise name; mapped `SetInputRow` list.
- **Events**: propagate `onSetChange`.
- **Validation**: per-field; marks block valid when all sets valid.
- **Props**: `exercise: WorkoutFormExerciseVM`, `updateSet(idx, field, value)`.

### SetInputRow
- Inputs: `reps`, `weight`; label for `set_index`.
- Uses numeric `<input type="number">` with min/max attributes.

### StickyFooterActions
- **Elements**: primary button _Complete Workout_, secondary _Cancel Workout_.
- Disabled state while submitting / loading.

### LoadingOverlay
- Covers form during prefill fetch or submission.

### SuccessToast
- Shows success + PB notifications; aria-live region.

### CancelConfirmationDialog
- Modal with destructive style; on confirm → navigate back `/templates`.

## 5. Types
```ts
// ViewModel for form state (derived from DTOs)
export interface WorkoutFormSetVM {
  set_index: number;
  reps: number | "";     // empty = UI empty
  weight: number | "";
  error?: string;         // validation message
}

export interface WorkoutFormExerciseVM {
  exercise_id: string;
  exercise_name: string;
  position: number;
  sets: WorkoutFormSetVM[];
  completed: boolean;      // UI flag
}

export interface WorkoutFormVM {
  template_id: string;
  template_name: string;
  logged_at: string;       // ISO string (now)
  exercises: WorkoutFormExerciseVM[];
}
```

DTOs reused from `types.ts`:
- `WorkoutPrefillResponseDTO` (prefill fetch)
- `CreateWorkoutCommand`, `CreateWorkoutResponseDTO` (submit)

## 6. State Management
Custom hook **`useWorkoutForm`** encapsulates:
- Conversion of prefill DTO → `WorkoutFormVM`.
- Local `useState` for form, `errors`, `loading`, `submitStatus`.
- Field update helpers `updateSet`, `markCompleted`, etc.
- Validation with _zod_ schema.
- Auto-save to `localStorage` (key `workout_draft_{templateId}`) on change; load on mount.
- Provide context to nested components via `WorkoutFormContext`.

## 7. API Integration
| Action | Method & URL | Request Type | Success Response |
|--------|--------------|--------------|------------------|
| Prefill | `GET /api/workouts/prefill/{templateId}` | – | `WorkoutPrefillResponseDTO` |
| Complete | `POST /api/workouts` | `CreateWorkoutCommand` | `CreateWorkoutResponseDTO` |

Steps:
1. `WorkoutPage` SSR/CSR fetch prefill with auth header.
2. `WorkoutForm` assembles `CreateWorkoutCommand` from state on submit.
3. Call `fetch('/api/workouts',{method:'POST',body:JSON.stringify(cmd)})`.
4. On 200 → show SuccessToast and navigate.
5. On 422 → map `ValidationErrorResponseDTO` to field errors.
6. On 401/403 → redirect to login or templates.

## 8. User Interactions
- **Input change/blur** → validate field, update VM.
- **Complete Workout** → POST, disable buttons, show loader, on success toast + redirect.
- **Cancel Workout** → open dialog, if confirm navigate away.
- **Focus move** → update ProgressIndicator.
- **Auto-save** → localStorage every 2 s debounce.

## 9. Conditions and Validation
- Sets 1-99, Reps 1-99, Weight 0-999, positive ints/float ≤ 1 decimal.
- All fields required before submit.
- Client-side zod schema mirrors server.
- Disable submit until all validation passes.
- Ownership/security: API will verify; front-end checks 403.

## 10. Error Handling
- **Network/Server**: toast with generic error, keep user on page.
- **Validation 422**: highlight invalid inputs, scroll to first error, announce via aria-live.
- **401/403**: clear local draft, redirect to login/templates.
- **Prefill 404**: show not-found message + back link.
- **LocalStorage parse error**: ignore and clear key.

## 11. Implementation Steps
1. Create new route file `src/pages/workout/[templateId].astro`.
2. Implement server-side loader to fetch prefill (Supabase client + `getSession`).
3. Generate ViewModel via `mapPrefillToFormVM` util.
4. Scaffold `WorkoutForm` with state hook and zod schema.
5. Build child components (`StickyHeader`, `ExerciseInput`, `SetInputRow`, `StickyFooterActions`).
6. Add `ProgressIndicator`, `LoadingOverlay`, modals via `react-aria` or `headlessui`.
7. Implement `useWorkoutForm` hook with auto-save + restore.
8. Wire submit to POST `/api/workouts`; on success toast + `router.push('/templates')`.
9. Add Tailwind styling for sticky header/footer and responsive layout.
10. Add unit tests for `mapPrefillToFormVM`, validation schema, and hook logic.
11. Add a_playwright e2e test: start workout → log values → complete → redirect.
12. Update navigation to link templates details → `/workout/{id}`.
13. QA: a11y audit (labels, tab order, aria-live).
14. Remove completed localStorage draft after POST or cancel.

---

_End of plan_
