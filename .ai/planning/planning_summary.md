<conversation_summary>
<decisions>
1. The MVP will be a **web application only**, usable both on desktop/laptop and via mobile browsers, with no native mobile app in scope.

2. **Workout template structure** is limited to:
   - Exercise name
   - Number of sets
   - Number of reps per set
   - Weight per rep  
   No additional parameters (tempo, rest, RPE, notes) are included in the MVP.

3. The **exercise library** will:
   - Include a basic predefined list of exercises.
   - Allow users to add custom exercises to their personal list.
   - Be presented as a single flat list with **simple text search**.
   - Always display an **“Add new exercise”** option in the search UI.

4. **Personal best (PB) logic**:
   - A PB is defined as the **highest weight** logged for a given exercise for a user.
   - PBs are tracked **globally per exercise per user** (not per template).
   - PB values are used as **default inserted values in templates** and can be edited by the user.
   - PBs are **automatically updated only when a higher weight is logged** in a workout.

5. **Workout prefill behavior**:
   - When starting a workout from a template, the user sees the template’s list of exercises with editable fields for sets, reps, and weight.
   - These fields are **prefilled with values from the last completed workout**, per exercise and per set index.
   - For newly added sets in a workout, defaults are either taken from the previous set’s values or left empty (to be specified explicitly in PRD).

6. **Template vs workout separation**:
   - There will be **two separate views**: one for **editing templates** and a different one for **logging workouts**.
   - Changes made while logging a workout (sets/reps/weight adjustments) **do not change the template structure or defaults**; templates are only changed via the edit view.

7. **User onboarding flow**:
   - After sign-up, the user is **prompted to create their first workout template**.
   - Once the first template is created, the user is **prompted to log their first workout** using that template and save initial results.

8. **Template management (CRUD)**:
   - Users can create, read, update, and delete workout templates.
   - Template deletion is a **hard delete** and requires a **confirmation dialog**.
   - Template creation time and last modification time are stored.

9. **Event logging / basic analytics data**:
   - The system will store at least:
     - `template_created`
     - `template_modified`
     - `workout_completed`  
   - These events support tracking template usage and workout completion, even though full analytics/monitoring tools are deprioritized.

10. **User account system & authentication**:
    - Users authenticate with **email and password**.
    - **JWT tokens** will be used for authentication/authorization.
    - No specific password complexity or security policy has been defined yet.

11. **User profile**:
    - Profile fields include: **age, sex, weight, height, location**.
    - The profile section is part of the app but is **secondary in navigation priority** compared to templates and workout logging.

12. **Validation rules for numeric inputs**:
    - Sets and reps:
      - Minimum: **1**
      - Maximum: **99**
    - Weight:
      - Maximum: **999 kg**
    - Negative values and empty required fields are **not allowed** (must be validated and handled as errors).
    - These validations apply at least on the client side.

13. **Navigation priorities**:
    - **Templates** and **workout logging** are the **primary navigation items**.
    - **Profile** is accessible via a secondary/menu entry, not as a top-level focus area.

14. **Error handling / destructive actions**:
    - MVP will rely on:
      - **Confirmation dialogs** for destructive actions (e.g., deleting templates).
      - Simple **Cancel/Back** actions in forms.
    - A more advanced undo/rollback system is explicitly deferred beyond the MVP.

15. **Technical stack and delivery**:
    - Frontend: **Astro 5** with **React**, **TypeScript**, and **Tailwind CSS**.
    - Backend: **Supabase** with **PostgreSQL** as the data store.
    - CI/CD: **GitHub Actions** will be used for deployment pipelines.
    - Advanced analytics/monitoring and detailed capacity planning are currently **second priority**.

</decisions>

<matched_recommendations>
1. **Minimal template structure**  
   The recommendation to start with a minimal, structured model (exercise, sets, reps, weight) was **adopted**, excluding additional complexity like tempo or rest.

2. **Curated exercise library + custom exercises**  
   The suggestion to combine a basic curated library with user-defined custom exercises was **adopted**. The user extended this with a flat list and simple text search, dropping grouping for now.

3. **Global per-exercise personal bests**  
   The recommendation to track PBs as a single global value per exercise per user and use them as defaults was **adopted**, with PBs auto-updated when higher weights are logged.

4. **Guided onboarding after sign-up**  
   The idea of prompting new users to create a template immediately after sign-up and then run a workout using it was **adopted** and explicitly confirmed in the flow.

5. **Separate views for template editing and workout logging**  
   The recommendation to clearly separate these flows in the UI to avoid accidental template changes during logging was **fully adopted** (two dedicated views).

6. **Simple text search in the exercise picker**  
   The recommendation to support search in the exercise library was **adopted**. Grouping into “Basic” vs “My exercises” was not adopted; the list remains flat.

7. **Rely on confirmations instead of undo for MVP**  
   The suggestion to handle destructive actions via confirmations and simple navigation without implementing a full undo system was **adopted** for template deletion and forms.

8. **Clear numeric validation rules**  
   The recommendation to define explicit ranges and validation for sets, reps, and weight was **adopted**, resulting in concrete min/max values and rejection of negative/empty values.

9. **Primary navigation focus on core flows**  
   The recommendation to keep templates and workout logging as primary navigation items, with the profile in a secondary position, was **adopted**.

10. **Explicit, maintainable tech stack choice**  
    The recommendation to pick and document a simple, maintainable stack was **acted upon**, resulting in the concrete choice of Astro + React + TS + Tailwind + Supabase + GitHub Actions.

</matched_recommendations>

<prd_planning_summary>
a. **Main functional requirements**

- **Authentication & authorization**
  - Sign-up and login using **email and password**.
  - Session management using **JWT tokens**.
  - Basic auth flows (login, logout) required; exact security policies (e.g., password rules, reset flows) remain to be clarified.

- **User profile**
  - View and edit basic profile data: **age, sex, weight, height, location**.
  - Profile is not central to daily flows but must be accessible for updating user info.

- **Exercise management**
  - Access a **basic predefined exercise library**.
  - Add **custom exercises** that become part of the user’s personal library.
  - Select exercises from a **single searchable list** with simple text search.
  - Provide an always-visible **“Add new exercise”** action in the selection/search UI.

- **Workout templates**
  - Create templates with:
    - Template name/identifier.
    - Ordered list of exercises.
    - For each exercise: **sets, reps, default weight**.
  - Store **creation** and **last modification timestamps**.
  - Allow updating templates (add/remove exercises, edit sets/reps/weights defaults).
  - Allow **hard deletion** of templates (with confirmation).
  - Associate templates with the user’s account.

- **Workout logging**
  - Start a workout from a selected template.
  - Show template exercises with per-set fields for sets, reps, and weight.
  - Prefill these fields using **values from the user’s last completed workout** for each exercise and set index.
  - Allow editing of sets, reps, and weight during the workout without affecting the underlying template.
  - Permit adding/removing sets during logging; newly added sets default to previous-set values or empty.
  - On workout completion:
    - Persist a **workout record** with all entered values.
    - Emit a `workout_completed` event.
    - Update **personal bests** for relevant exercises when higher weights are recorded.

- **Personal best management**
  - Maintain a **global PB per exercise per user** (based on max weight).
  - Use PB as a **default weight value** in templates (and likely as the initial default when no prior workouts exist).
  - Automatically update PBs when a workout logs a higher weight than the current PB.

- **Event logging / data for metrics**
  - Record at least:
    - `template_created` (with timestamps, user ID, template ID).
    - `template_modified` (with timestamps).
    - `workout_completed` (with timestamps and associated template/workout ID).
  - These events support later analysis of usage, even if no full analytics stack is chosen yet.

- **User interface & navigation**
  - Two main views:
    - **Template management** (list of templates, create/edit/delete).
    - **Workout logging** (start workout from template, enter results).
  - **Profile** accessible as a secondary navigation element.
  - Web-based UI compatible with desktop and mobile browsers (responsiveness implied but not heavily optimized for native/mobile-only patterns).

- **Technical foundations**
  - Frontend in **Astro 5 + React + TypeScript + Tailwind**.
  - Backend and database via **Supabase (PostgreSQL)**.
  - CI/CD using **GitHub Actions**.

b. **Key user stories and usage paths**

- **US1: New user onboarding**
  - As a new user, I sign up with my email and password.
  - After sign-up, I am prompted to **create my first workout template** by choosing exercises (from library or custom) and defining sets, reps, and default weights.
  - When I save the template, I am prompted to **start my first workout** using it and fill in sets/reps/weights to record my first results.

- **US2: Returning user logging a workout**
  - As a returning user, I log in and see my list of templates.
  - I select a template to **start a workout**.
  - For each exercise and set, the fields are **pre-filled with the values from my last completed workout**.
  - I adjust sets/reps/weights as needed and complete the workout.
  - The system saves the workout, updates PBs if higher weights are recorded, and records a `workout_completed` event.

- **US3: Managing templates**
  - As a user, I can view all my templates, create new ones, and edit existing ones:
    - Add/remove exercises.
    - Change sets, reps, and default weights.
  - When I delete a template, I must confirm the action in a dialog before it is removed.

- **US4: Managing exercises**
  - As a user creating or editing a template, I search for exercises using **text search** over a single list.
  - If I don’t find what I need, I use the always-visible **“Add new exercise”** option to create a custom exercise.
  - The new exercise is added both to my library and can be used immediately in the template.

- **US5: Tracking personal bests**
  - As a user, when I lift a higher weight than before for a given exercise, the system automatically updates my **personal best**.
  - For future templates or first-time setups, PB values can be used as **sensible defaults** for the weight field.

- **US6: Managing profile**
  - As a user, I can access my profile from secondary navigation to set or update my age, sex, weight, height, and location.
  - Profile changes do not directly affect template structure but may be used for future features.

c. **Important success criteria and ways to measure them**

- **Stated success criteria (from project description)**:
  - **90%** of users have created training templates **with completed results**.
  - **75%** of users have at least **3 training templates**.

- **Measurement approach (based on current decisions)**:
  - Use stored events and data:
    - `template_created` events and the templates table to count the number of templates per user.
    - `workout_completed` events and associated data to detect whether templates have actually been used for logging results.
  - For each user:
    - Check whether they have at least **one template** and at least **one `workout_completed`** referencing a template (for the 90% criterion).
    - Count how many templates they have created (for the 75% with ≥3 templates criterion).
  - A precise evaluation window (e.g., within N days after sign-up) and analytics tooling are not yet defined but can be derived from stored timestamps and events.

d. **Unresolved issues / areas for later clarification (briefly in summary)**

- Exact precedence/combination rules between **PB defaults** and **last-workout defaults**, especially for:
  - First-ever workout.
  - Exercises newly added to templates.
- Detailed **security and account management** behavior:
  - Password policies.
  - Password reset and email verification flows.
  - Session expiry and secure handling of JWTs.
- **Workout deletion** behavior and whether historical workouts can be edited or removed.
- **Concurrency and conflict handling** (multiple devices editing/logging at once).
- Concrete **analytics solution** and **timeframe** for measuring success criteria (beyond raw events in the database).
- Clarification of some validation semantics (e.g., whether any fields may be optional in edge cases or must always be filled).

</prd_planning_summary>

<unresolved_issues>
1. **Interaction between PB defaults and last-workout defaults**:
   - For the first workout (no history), or when adding a new exercise, how exactly should PB and template defaults be combined or prioritized when pre-filling fields?

2. **Security and account flows**:
   - No decisions yet on:
     - Password strength/complexity requirements.
     - Password reset and account recovery mechanisms.
     - Email verification.
     - Session expiration and refresh strategies for JWTs.

3. **Workout lifecycle management**:
   - Not yet specified:
     - Whether workouts can be edited after completion.
     - Whether workouts can be deleted and under what constraints/confirmations.

4. **Concurrency and data consistency**:
   - Behavior when the same template is opened/edited or used for logging from multiple sessions/devices at the same time has been explicitly deferred.

5. **Analytics and evaluation window for success criteria**:
   - While key events (`template_created`, `template_modified`, `workout_completed`) are identified, there is no chosen analytics tool or defined time window (e.g., first 14 or 30 days after sign-up) for measuring the 90% and 75% success metrics.

6. **Edge-case validation rules**:
   - Exact handling of empty fields and partial workouts (e.g., skipped sets/exercises) needs to be made explicit to avoid ambiguity between strict validation and user flexibility.

</unresolved_issues>
</conversation_summary>