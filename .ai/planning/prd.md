# Product Requirements Document (PRD) - GymRatPlanner

## 1. Product Overview

GymRatPlanner is a web-based workout tracking application designed to help gym users record, track, and improve their training performance. The MVP focuses on creating reusable workout templates and logging workout results to track personal progress over time.

### 1.1 Product Vision

Enable gym users to easily remember and track their workout results by providing a simple, template-based system that automatically saves personal bests and prefills workout data based on previous sessions.

### 1.2 Target Users

Gym users who want to track their workout progress without complex analytics or social features. The primary user is someone who follows structured workout routines and wants to beat their previous performance.

### 1.3 Platform

Web application accessible via desktop, laptop, and mobile browsers. No native mobile applications are included in the MVP scope.

### 1.4 Technical Stack

- Frontend: Astro 5 with React, TypeScript, and Tailwind CSS
- Backend: Supabase with PostgreSQL database
- Authentication: Supabase Auth (built-in JWT sessions)
- CI/CD: GitHub Actions

## 2. User Problem

Gym users struggle to remember the weights, sets, and reps they achieved in previous workouts. This makes it difficult to:

- Track progress over time
- Know what weight to use for each exercise
- Ensure progressive overload
- Stay motivated by seeing improvements

Without a tracking system, users either rely on memory (unreliable), use paper notebooks (inconvenient), or use overly complex fitness apps with features they don't need.

GymRatPlanner solves this by providing a focused, template-based system that automatically remembers previous workout data and highlights personal bests.

## 3. Functional Requirements

### 3.1 Authentication and Authorization

- FR-001: Users must be able to sign up using email and password
- FR-002: Users must be able to log in using email and password
- FR-003: Users must be able to log out
- FR-004: System must use Supabase Auth session mechanism for session management
- FR-005: All workout templates and data must be associated with the authenticated user
- FR-006: Users can only access their own workout data

### 3.2 Exercise Management

- FR-007: System must provide a basic predefined exercise library
- FR-008: Exercise selection must display a list with text search capability
- FR-009: Exercise search must filter exercises based on name matching

### 3.3 Workout Template Management

- FR-010: Users must be able to create workout templates
- FR-011: Each template must have a name/identifier
- FR-012: Each template must contain an ordered list of exercises
- FR-013: For each exercise in a template, users must specify: number of sets, number of reps per set, default weight per rep
- FR-014: System must store creation timestamp for each template
- FR-015: Users must be able to view all their templates
- FR-016: Users must be able to view template details
- FR-017: Users must be able to delete templates
- FR-018: Template deletion must require confirmation dialog
- FR-019: Template deletion must be a hard delete (permanent removal)
- FR-020: System must emit a template_created event when a template is created
- FR-021: Templates must be associated with the user account

### 3.4 Workout Logging

- FR-022: Users must be able to start a workout from a selected template
- FR-023: Workout logging view must display all exercises from the template
- FR-024: For each exercise, users must see editable fields for sets, reps, and weight
- FR-025: Fields must be prefilled with values from the user's last completed workout for that exercise and set index
- FR-026: Users must be able to edit sets, reps, and weight values during workout logging
- FR-027: Changes made during workout logging must not affect the underlying template structure
- FR-028: Users must be able to complete a workout
- FR-029: System must persist a workout record with all entered values upon completion
- FR-030: System must emit a workout_completed event when a workout is finished
- FR-031: System must update personal bests when higher weights are recorded
- FR-032: Workout logging view must be separate from template editing view
- FR-033: Users must be able to cancel a workout without saving

### 3.5 Personal Best Management

- FR-034: System must maintain a global personal best (PB) per exercise per user
- FR-035: Personal best must be defined as the highest weight logged for a given exercise
- FR-036: Personal bests must be tracked globally (not per template)
- FR-037: PB values must be used as default weight values in templates
- FR-038: System must automatically update PB when a higher weight is logged in any workout
- FR-039: PB updates must only occur when the new weight exceeds the current PB

### 3.6 Data Validation

- FR-040: Number of sets must have a minimum value of 1
- FR-041: Number of sets must have a maximum value of 99
- FR-042: Number of reps must have a minimum value of 1
- FR-043: Number of reps must have a maximum value of 99
- FR-044: Weight must have a maximum value of 999 kg
- FR-045: Negative values must not be allowed for sets, reps, or weight
- FR-046: Empty required fields must not be allowed and must display validation errors
- FR-047: Validation must occur at least on the client side

### 3.7 User Interface and Navigation

- FR-048: Application must have two primary navigation items: Templates and Workout Logging
- FR-049: Template management view must display list of all user templates
- FR-050: Workout logging view must allow starting a workout from a template
- FR-051: UI must be responsive and usable on desktop and mobile browsers
- FR-052: Destructive actions must display confirmation dialogs
- FR-053: Forms must provide Cancel/Back actions

### 3.8 Event Logging

- FR-054: System must record template_created events with timestamp, user ID, and template ID
- FR-055: System must record workout_completed events with timestamp and associated template/workout ID
- FR-056: Events must be stored for future analysis and metrics calculation

## 4. Product Boundaries

### 4.1 In Scope for MVP

- Web application only (desktop and mobile browser support)
- Email and password authentication
- Workout template CRUD operations (Create, Read, Delete)
- Workout logging with prefilled data from previous workouts
- Personal best tracking per exercise
- Basic predefined exercise library
- Simple text search for exercises
- Event logging for key user actions
- Confirmation dialogs for destructive actions

### 4.2 Out of Scope for MVP

- Native mobile applications (iOS/Android)
- User profile management (age, sex, weight, height, location)
- Custom exercise creation
- Template editing (users can delete and recreate)
- Adding/removing sets during workout
- Guided onboarding flow
- Sharing workout templates between users
- Social features or user-to-user interactions
- Advanced analytics or result analysis dashboards
- Workout history visualization or charts
- Exercise grouping or categorization
- Advanced exercise parameters (tempo, rest time, RPE, notes)
- Password reset and email verification flows
- Advanced security policies (password complexity rules)
- Undo/rollback system for actions
- Workout editing after completion
- Workout deletion functionality
- Concurrency handling for multi-device editing
- Advanced analytics tooling or monitoring
- Detailed capacity planning

### 4.3 Future Considerations (Post-MVP)

- User profile management
- Custom exercise creation
- Template editing functionality
- Dynamic set management during workouts
- Guided onboarding experience
- Template sharing between users
- Workout result analysis and progress visualization
- Advanced exercise library with categorization
- Workout history editing and deletion
- Multi-device synchronization with conflict resolution
- Password reset and account recovery
- Email verification
- Advanced analytics dashboard

## 5. User Stories

### 5.1 Authentication and Account Management

US-001: User Sign-Up
- Title: User creates a new account
- Description: As a new user, I want to sign up with my email and password so that I can access the application and save my workout data.
- Acceptance Criteria:
  - User can enter email and password on sign-up page
  - System validates email format
  - System creates user account upon successful sign-up
  - User is redirected to templates page after sign-up
  - System displays error message if email already exists
  - System displays error message if required fields are empty

US-002: User Login
- Title: User logs into their account
- Description: As a returning user, I want to log in with my email and password so that I can access my saved workout templates and data.
- Acceptance Criteria:
  - User can enter email and password on login page
  - System validates credentials against stored user data
  - System establishes a Supabase Auth session upon successful login
  - User is redirected to templates page after login
  - System displays error message for invalid credentials
  - System displays error message if required fields are empty

US-003: User Logout
- Title: User logs out of their account
- Description: As a logged-in user, I want to log out so that my account is secure when I'm done using the application.
- Acceptance Criteria:
  - User can access logout option from application
  - System invalidates Supabase Auth session upon logout
  - User is redirected to login page after logout
  - User cannot access protected pages after logout without logging in again

US-004: Session Management
- Title: System maintains user session
- Description: As a logged-in user, I want my session to be maintained so that I don't have to log in repeatedly during normal usage.
- Acceptance Criteria:
  - System uses Supabase Auth sessions to maintain user session
  - Protected routes require a valid Supabase Auth session (enforced via RLS/auth.uid())
  - System relies on Supabase RLS/auth.uid() to validate the session on each protected request
  - User is redirected to login if session is invalid or missing

### 5.2 Exercise Management

US-005: View Exercise Library
- Title: User views available exercises
- Description: As a user creating a template, I want to view available exercises so that I can select exercises for my workout.
- Acceptance Criteria:
  - User sees a list of predefined exercises
  - Exercises are displayed with their names
  - List is accessible during template creation

US-006: Search Exercises
- Title: User searches for exercises
- Description: As a user, I want to search for exercises by name so that I can quickly find the exercise I need.
- Acceptance Criteria:
  - User can enter text in search field
  - System filters exercise list based on name matching
  - Search is case-insensitive
  - Search results update as user types
  - User sees all exercises if search field is empty

### 5.3 Workout Template Management

US-007: Create Workout Template
- Title: User creates a new workout template
- Description: As a user, I want to create a workout template so that I can reuse the same workout structure in future sessions.
- Acceptance Criteria:
  - User can access template creation page
  - User can enter template name
  - User can add exercises to template from exercise library
  - For each exercise, user can specify: sets, reps, default weight
  - User can save the template
  - System stores creation timestamp
  - System emits template_created event
  - System validates that template name is not empty
  - System validates sets, reps, and weight according to validation rules (FR-040 to FR-047)

US-008: View All Templates
- Title: User views list of all their templates
- Description: As a user, I want to see all my workout templates so that I can choose which one to use or delete.
- Acceptance Criteria:
  - User can access templates page from primary navigation
  - Page displays list of all user's templates
  - Each template shows its name
  - User can select a template to view details
  - User can select a template to start a workout
  - Empty state is shown if user has no templates

US-009: View Template Details
- Title: User views details of a specific template
- Description: As a user, I want to view the details of a workout template so that I can see what exercises and parameters it contains.
- Acceptance Criteria:
  - User can view template name
  - User can view ordered list of exercises in template
  - For each exercise, user can view: sets, reps, default weight
  - User can navigate back to template list
  - User can start a workout from this view
  - User can delete the template from this view

US-010: Delete Workout Template
- Title: User deletes a workout template
- Description: As a user, I want to delete workout templates I no longer use so that my template list stays organized.
- Acceptance Criteria:
  - User can access delete option for a template
  - System displays confirmation dialog before deletion
  - Confirmation dialog clearly states that deletion is permanent
  - User can confirm or cancel deletion
  - System performs hard delete (permanent removal) upon confirmation
  - Template is removed from user's template list
  - User cannot access deleted template after deletion
  - User remains on templates page after deletion

### 5.4 Workout Logging

US-011: Start Workout from Template
- Title: User starts a workout using a template
- Description: As a user, I want to start a workout from a template so that I can log my exercise results based on a predefined structure.
- Acceptance Criteria:
  - User can select a template and start a workout
  - System displays workout logging view (separate from template viewing)
  - Workout view shows all exercises from the template
  - For each exercise, user sees editable fields for sets, reps, and weight
  - Fields are prefilled with values from user's last completed workout for that exercise
  - If no previous workout exists, fields use template defaults or PB values
  - User can proceed to log workout data

US-012: Log Workout Data
- Title: User logs sets, reps, and weights during workout
- Description: As a user during a workout, I want to enter or modify sets, reps, and weights so that I can record what I actually performed.
- Acceptance Criteria:
  - User can edit sets, reps, and weight for each exercise
  - Changes do not affect the underlying template
  - System validates inputs according to validation rules (FR-040 to FR-047)
  - User sees validation errors for invalid inputs
  - User can navigate between exercises
  - User can see which exercises are completed or pending

US-013: Complete Workout
- Title: User completes and saves a workout
- Description: As a user, I want to complete my workout so that my results are saved and my personal bests are updated.
- Acceptance Criteria:
  - User can complete the workout
  - System validates that all required fields are filled
  - System persists workout record with all entered values
  - System emits workout_completed event with timestamp and IDs
  - System updates personal bests for exercises where higher weight was logged
  - User sees confirmation that workout was saved
  - User is redirected to templates page or workout summary

US-014: Cancel Workout
- Title: User cancels workout without saving
- Description: As a user during a workout, I want to cancel and discard my progress if I need to stop without saving.
- Acceptance Criteria:
  - User can cancel the workout
  - System displays confirmation dialog
  - User can confirm or cancel the cancellation
  - No workout record is saved if user confirms cancellation
  - No events are emitted if workout is cancelled
  - No personal bests are updated if workout is cancelled
  - User is redirected to templates page

### 5.5 Personal Best Management

US-015: View Personal Bests
- Title: User views their personal bests
- Description: As a user, I want to see my personal best for each exercise so that I know what weight I'm trying to beat.
- Acceptance Criteria:
  - User can view personal best for each exercise they've performed
  - Personal best displays the highest weight logged for that exercise
  - Personal best is visible during workout logging
  - Personal best is visible during template creation

US-016: Automatic Personal Best Update
- Title: System automatically updates personal bests
- Description: As a user completing a workout, I want my personal bests to be automatically updated when I lift heavier weights so that I don't have to manually track them.
- Acceptance Criteria:
  - System compares logged weights to current personal bests
  - System updates PB only when new weight exceeds current PB
  - System updates PB per exercise globally (not per template)
  - PB update occurs when workout is completed
  - User is notified when a new personal best is achieved
  - Updated PB is immediately available for future workouts

US-017: Personal Best as Default Weight
- Title: Personal best is used as default weight in templates
- Description: As a user creating a template, I want my personal best to be suggested as the default weight so that I start with a relevant baseline.
- Acceptance Criteria:
  - When adding an exercise to a template, default weight is set to user's PB for that exercise
  - If no PB exists for an exercise, default weight is empty or zero
  - User can override the PB default with a different value
  - PB default is used only for template creation, not during workout logging

### 5.6 Data Validation and Error Handling

US-018: Input Validation for Sets and Reps
- Title: System validates sets and reps inputs
- Description: As a user entering workout data, I want the system to validate my inputs so that I don't accidentally enter invalid data.
- Acceptance Criteria:
  - Sets must be between 1 and 99
  - Reps must be between 1 and 99
  - Negative values are rejected
  - Empty required fields show validation error
  - User sees clear error messages for invalid inputs
  - User cannot save template or complete workout with invalid data

US-019: Input Validation for Weight
- Title: System validates weight inputs
- Description: As a user entering weight data, I want the system to validate my inputs so that I don't enter unrealistic values.
- Acceptance Criteria:
  - Weight must not exceed 999 kg
  - Negative weight values are rejected
  - Empty weight field shows validation error
  - User sees clear error message for invalid weight
  - User cannot save template or complete workout with invalid weight

US-020: Confirmation for Destructive Actions
- Title: System confirms destructive actions
- Description: As a user, I want to be asked to confirm before deleting data so that I don't accidentally lose my work.
- Acceptance Criteria:
  - Deleting a template shows confirmation dialog
  - Cancelling a workout shows confirmation dialog
  - Confirmation dialogs clearly explain the action and consequences
  - User can confirm or cancel the action
  - Action proceeds only if user confirms
  - User can easily dismiss confirmation dialog

### 5.7 Navigation and User Interface

US-021: Primary Navigation
- Title: User navigates between main sections
- Description: As a user, I want to easily navigate between templates and workout logging so that I can quickly access the features I need.
- Acceptance Criteria:
  - Primary navigation includes Templates and Workout Logging
  - Navigation is visible on all pages
  - Current section is visually indicated
  - User can click navigation items to switch sections
  - Navigation is responsive on mobile browsers

US-022: Responsive Mobile Experience
- Title: User accesses application on mobile browser
- Description: As a user on a mobile device, I want the application to work well in my mobile browser so that I can log workouts at the gym.
- Acceptance Criteria:
  - Application is usable on mobile browsers
  - Layout adapts to smaller screen sizes
  - Touch targets are appropriately sized
  - Text is readable without zooming
  - Forms are easy to fill out on mobile
  - Navigation works well on mobile

### 5.8 Data Access and Security

US-023: User Data Isolation
- Title: Users can only access their own data
- Description: As a user, I want my workout data to be private so that other users cannot see or modify my templates and workouts.
- Acceptance Criteria:
  - User can only view their own templates
  - User can only view their own workouts
  - User can only view their own personal bests
  - System enforces authorization checks on all data access
  - Attempting to access another user's data returns error or redirect

US-024: Session Security
- Title: User session is secure
- Description: As a user, I want my session to be secure so that my account cannot be compromised.
- Acceptance Criteria:
  - Supabase Auth sessions (JWT-based) are used for authentication
  - Session tokens are transmitted securely
  - Invalid or revoked sessions are rejected
  - Expired sessions require re-login
  - Logout clears the Supabase Auth session on the client

## 6. Success Metrics

### 6.1 Primary Success Criteria

Metric 1: Template Creation and Usage Rate
- Definition: Percentage of users who have created at least one workout template with completed workout results
- Target: 90% of users
- Measurement Method:
  - Count users with at least one template_created event
  - Count users with at least one workout_completed event
  - Calculate percentage of users meeting both criteria
  - Data source: template_created and workout_completed events in database

Metric 2: Template Diversity
- Definition: Percentage of users who have created at least 3 workout templates
- Target: 75% of users
- Measurement Method:
  - Count number of templates per user from templates table
  - Calculate percentage of users with 3 or more templates
  - Data source: templates table with user_id grouping

### 6.2 Supporting Metrics

Metric 3: Workout Logging Frequency
- Definition: Average number of workouts logged per active user per week
- Target: 3+ workouts per week
- Measurement Method:
  - Count workout_completed events per user per week
  - Calculate average across all active users
  - Data source: workout_completed events with timestamps

Metric 4: Personal Best Achievement Rate
- Definition: Percentage of completed workouts that result in at least one new personal best
- Target: 30% of workouts
- Measurement Method:
  - Track PB updates associated with workout completions
  - Calculate percentage of workouts with PB updates
  - Data source: Personal bests table with update timestamps, workout_completed events

Metric 5: Template Reuse Rate
- Definition: Average number of times each template is used for workouts
- Target: 5+ uses per template
- Measurement Method:
  - Count workout_completed events per template
  - Calculate average across all templates
  - Data source: workout_completed events with template_id

### 6.3 Measurement Timeframe

- Primary metrics (90% and 75% targets) will be evaluated within 30 days of user sign-up
- Supporting metrics will be tracked continuously and reviewed weekly
- All metrics rely on event logging (template_created, workout_completed) and database records

### 6.4 Data Collection Requirements

- All events must include: timestamp, user_id, relevant entity IDs
- Events must be stored in a queryable format (database table or log system)
- Timestamps must be stored in UTC
- User sign-up date must be recorded for cohort analysis
- Analytics queries must be able to:
  - Group users by sign-up date
  - Count events per user
  - Calculate percentages and averages
  - Filter by date ranges

### 6.5 Success Evaluation

The MVP will be considered successful if:
- At least 90% of users have created templates with completed results within 30 days of sign-up
- At least 75% of users have created 3 or more templates within 30 days of sign-up
- Supporting metrics show healthy engagement (workout frequency, template reuse)

If success criteria are not met, the product team will:
- Analyze drop-off points in user journey
- Review event logs to identify friction points
- Conduct user interviews to understand barriers
- Iterate on core features based on findings