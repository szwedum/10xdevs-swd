# UI Architecture Planning Summary - GymRatPlanner MVP

## Conversation Summary

<decisions>
1. Simplified navigation to two main views: Templates (landing page) and Workout (active workout only)
2. Removed dashboard/landing page complexity in favor of direct Templates view
3. Simplified template list to basic list view with essential actions only
4. Single-page workout form with vertical exercise layout
5. Removed Personal Best UI representation (handled by API internally)
6. Basic form validation on submission only (no real-time validation)
7. Simple searchable dropdown for exercise selection (no modal interface)
8. React local state only - no complex state management or offline support
9. Native browser confirm() dialogs for destructive actions
10. Minimal loading states with simple "Loading..." text
11. Basic accessibility using semantic HTML and proper labels only
12. MVP-focused approach prioritizing functionality over sophistication
</decisions>

<matched_recommendations>
1. **Two-View Navigation Structure**: Templates as default landing page and Workout view only during active workout session, matching FR-048 requirements
2. **Simple Template List**: List view showing template name with three action buttons (Start Workout, View Details, Delete with confirmation)
3. **Single-Page Workout Form**: Vertical list of exercises with input fields for sets/reps/weights and single "Complete Workout" button
4. **No PB UI**: Personal bests handled internally by API without dedicated UI representation (no endpoint available)
5. **Basic Form Validation**: HTML5 validation with error display on submission, API error responses shown in alerts
6. **Simple Exercise Selection**: Native select element on mobile with text filtering capability
7. **Minimal State Management**: React local state for form handling, no Redux/Context needed
8. **Native Confirmation Dialogs**: Browser confirm() for template deletion and workout cancellation
9. **Simple Loading States**: Text-based loading indicators, disabled buttons during API calls
10. **Basic Accessibility**: Semantic HTML elements, proper form labels, sufficient color contrast
</matched_recommendations>

<ui_architecture_planning_summary>

## Main UI Architecture Requirements

### Core Principles
- **MVP-First Approach**: Minimal viable interface focusing on core functionality
- **API-Driven Design**: UI structure aligned with 7 available API endpoints
- **Mobile-Responsive**: Works on desktop and mobile browsers (FR-051)
- **Simple & Functional**: Prioritizes working features over sophisticated UX

### Technology Stack
- **Frontend Framework**: Astro 5 with React 19 for interactive components
- **Styling**: Tailwind CSS 4
- **Component Library**: shadcn/ui for accessible React components
- **Type Safety**: TypeScript 5
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React local state (useState, useReducer)

## Key Views, Screens, and User Flows

### 1. Authentication Flow
**Views**: Login, Sign Up
- Email and password authentication (FR-001, FR-002)
- Redirect to Templates view after successful auth
- Simple form validation
- Error messages for invalid credentials

### 2. Templates View (Landing Page)
**Primary View**: Template List
- Display all user templates (GET /api/templates)
- Each template shows:
  - Template name
  - Three action buttons: Start Workout, View Details, Delete
- "Create New Template" button at top
- Empty state message if no templates exist

**Secondary View**: Template Details
- Display template information (GET /api/templates/:id)
- Show ordered list of exercises with sets/reps/default weight
- Actions: Start Workout, Delete Template, Back to List
- Delete requires confirmation dialog (FR-018)

**Tertiary View**: Create Template Form
- Template name input field
- Exercise selection (searchable dropdown using GET /api/exercises)
- For each exercise: sets, reps, default weight inputs
- Add/Remove exercise buttons
- Save and Cancel buttons
- Client-side validation (FR-040 to FR-047)
- POST /api/templates on save

### 3. Workout Logging Flow
**View**: Active Workout
- Triggered by "Start Workout" from template
- Fetch prefilled data (GET /api/workouts/prefill/:template_id)
- Single-page form displaying:
  - Workout header (template name, date)
  - Vertical list of all exercises
  - For each exercise:
    - Exercise name
    - Input fields for sets, reps, weight (prefilled from last workout)
    - Visual separation between exercises
- Bottom actions:
  - Complete Workout button (POST /api/workouts)
  - Cancel button (with confirmation)
- Form validation on submission
- Success message after completion
- Redirect to Templates view

### 4. Workout History (Optional/Future)
**View**: Workout List
- Display past workouts (GET /api/workouts)
- Show date, template name, exercise count
- Read-only view (no editing/deletion in MVP)

## API Integration and State Management Strategy

### API Endpoints Integration

1. **GET /api/exercises**
   - Used in: Create Template form
   - Purpose: Populate exercise selection dropdown
   - Includes search filtering

2. **GET /api/templates**
   - Used in: Templates List view
   - Purpose: Display all user templates
   - Supports pagination

3. **GET /api/templates/:id**
   - Used in: Template Details view
   - Purpose: Show detailed template information
   - Returns template with exercises array

4. **POST /api/templates**
   - Used in: Create Template form
   - Purpose: Save new template
   - Validates and creates template with exercises

5. **GET /api/workouts/prefill/:template_id**
   - Used in: Start Workout action
   - Purpose: Prefill workout form with last workout data
   - Returns suggested sets/reps/weights

6. **POST /api/workouts**
   - Used in: Complete Workout action
   - Purpose: Save completed workout
   - Triggers PB updates automatically
   - Returns updated PBs in response

7. **GET /api/workouts**
   - Used in: Workout History view (if implemented)
   - Purpose: Display past workouts
   - Supports filtering and pagination

### State Management Strategy

**Approach**: React Local State Only
- No Redux, Context API, or external state management
- Each component manages its own state
- Form state using useState/useReducer
- No global state needed for MVP

**Data Flow**:
1. Component mounts → Fetch data from API
2. Store data in local state
3. User interaction → Update local state
4. Form submission → POST to API
5. Success → Update UI and navigate

**No Offline Support**: All operations require active connection

**No Caching**: Fresh data fetched on each view load

**Error Handling**: Display API errors using browser alerts or simple error messages

## Responsiveness, Accessibility, and Security Considerations

### Responsiveness (FR-051)
**Mobile-First Approach**:
- Single-column layouts on mobile
- Touch-friendly button sizes (minimum 44x44px)
- Responsive typography using Tailwind
- Native form controls on mobile devices
- Simplified navigation for small screens

**Desktop Enhancements**:
- Multi-column layouts where appropriate
- Hover states for interactive elements
- Keyboard shortcuts (optional)

**Breakpoints** (Tailwind defaults):
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Accessibility (Basic)
**Semantic HTML**:
- Use proper heading hierarchy (h1, h2, h3)
- Form labels for all inputs
- Button elements for actions
- List elements for template/workout lists

**Form Accessibility**:
- Label-input associations
- Required field indicators
- Error messages linked to inputs
- Logical tab order

**Color Contrast**:
- WCAG AA compliance minimum
- Sufficient contrast for text and buttons
- Visual feedback for interactive elements

**Keyboard Navigation**:
- All interactive elements keyboard accessible
- Logical focus order
- Visible focus indicators

### Security Considerations

**Authentication** (FR-004):
- Supabase Auth JWT-based sessions
- Session validation on protected routes
- Automatic redirect to login if session invalid

**Authorization** (FR-006):
- Row-Level Security (RLS) at database level
- User can only access own data
- auth.uid() used in all queries

**Data Validation**:
- Client-side validation (FR-047)
- Server-side validation in API
- Sanitized inputs to prevent XSS

**Session Management**:
- Secure token storage
- HTTPS only in production
- Logout clears session

## Component Architecture

### Page Components (Astro)
1. `/login` - Login page
2. `/signup` - Sign up page
3. `/templates` - Templates list (landing)
4. `/templates/[id]` - Template details
5. `/templates/new` - Create template
6. `/workout/[templateId]` - Active workout
7. `/workouts` - Workout history (optional)

### React Components
1. `TemplateList` - Display templates with actions
2. `TemplateCard` - Individual template item
3. `TemplateForm` - Create/edit template form
4. `ExerciseSelector` - Searchable exercise dropdown
5. `WorkoutForm` - Active workout logging form
6. `ExerciseInput` - Sets/reps/weight inputs for single exercise
7. `ConfirmDialog` - Confirmation for destructive actions (or use native)
8. `LoadingSpinner` - Simple loading indicator
9. `ErrorMessage` - Display error messages

### Shared Components (shadcn/ui)
- Button
- Input
- Select
- Form
- Card
- Alert

## User Flows

### Flow 1: Create Template
1. User clicks "Create New Template" on Templates view
2. Navigate to Create Template form
3. Enter template name
4. Search and select exercises
5. For each exercise, enter sets/reps/weight
6. Click "Save Template"
7. Validate inputs
8. POST /api/templates
9. On success: Navigate to Templates view
10. On error: Display error message

### Flow 2: Start and Complete Workout
1. User clicks "Start Workout" on template
2. GET /api/workouts/prefill/:template_id
3. Navigate to Workout view
4. Display prefilled form with exercises
5. User modifies sets/reps/weights as needed
6. User clicks "Complete Workout"
7. Validate inputs
8. POST /api/workouts
9. On success: Show success message, navigate to Templates
10. On error: Display error message

### Flow 3: Delete Template
1. User clicks "Delete" on template
2. Show confirmation dialog (browser confirm)
3. If confirmed: DELETE /api/templates/:id (future endpoint)
4. On success: Remove from list, show success message
5. On error: Display error message

### Flow 4: View Template Details
1. User clicks "View Details" on template
2. GET /api/templates/:id
3. Display template with exercises list
4. User can Start Workout or Delete from this view

## Form Validation Rules

### Template Form
- **name**: Required, max 60 characters
- **exercises**: Minimum 1 exercise required
- **sets**: Integer, 1-99 (FR-040, FR-041)
- **reps**: Integer, 1-99 (FR-042, FR-043)
- **weight**: Numeric, 0-999.99 (FR-044)
- No negative values (FR-045)

### Workout Form
- **exercises**: Minimum 1 exercise
- **sets**: Array with minimum 1 set
- **reps**: Integer, 1-99
- **weight**: Numeric, 0-999.99
- All fields required (FR-046)

### Validation Timing
- HTML5 validation on inputs
- Full validation on form submission
- Display errors inline or at form level
- Prevent submission with invalid data

</ui_architecture_planning_summary>

<unresolved_issues>

1. **Template Deletion Endpoint**: DELETE /api/templates/:id is marked as "Future Enhancement" in API plan but required by FR-017. Need to clarify if this will be implemented for MVP or if templates are permanent.

2. **Personal Best Display**: While PB updates are automatic (FR-038), there's no endpoint to retrieve PBs for display. GET /api/personal-bests exists in API plan but implementation status unclear. Should PBs be shown during workout logging?

3. **Workout History Implementation**: GET /api/workouts endpoint exists but no clear requirement for workout history view in MVP. Should this be implemented or deferred?

4. **Event Logging**: FR-054 and FR-055 require event logging for template_created and workout_completed, but no UI indication needed. Confirm this is handled automatically by API.

5. **Cancel Workout Behavior**: FR-033 requires ability to cancel workout without saving. Should this clear form state and navigate back, or show confirmation first?

6. **Empty State Handling**: Need to define empty states for:
   - No templates created yet
   - No exercises in template
   - No workout history

7. **Loading State Duration**: For slow connections, should we implement timeout handling or just rely on browser timeout?

8. **Error Recovery**: When API calls fail, should user be able to retry or must they navigate back and start over?

9. **Session Expiry**: How should UI handle expired Supabase Auth sessions during active workout? Save draft locally?

10. **Template Name Uniqueness**: FR-019 mentions unique template names per user. Should UI prevent duplicate names or just show API error?

</unresolved_issues>
