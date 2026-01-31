# UI Architecture for GymRatPlanner

## 1. UI Structure Overview

GymRatPlanner is a web-based workout tracking application built with Astro 5, React 19, TypeScript, and Tailwind CSS. The UI architecture follows an MVP-first approach, prioritizing core functionality over sophisticated features. The application consists of two primary sections: **Templates** (for managing workout templates) and **Workout Logging** (for recording active workouts).

The architecture is designed around 7 core API endpoints, ensuring tight integration between frontend and backend. The interface is mobile-responsive, accessible via desktop and mobile browsers, with a focus on simplicity and usability for gym users tracking their progress.

**Key Architectural Principles:**
- **API-Driven Design**: UI structure directly maps to available API endpoints
- **Mobile-First Responsive**: Single-column layouts on mobile, enhanced layouts on desktop
- **Simple State Management**: React local state only, no global state management
- **Progressive Enhancement**: Core functionality works without JavaScript where possible
- **Security by Default**: Supabase Auth with Row-Level Security (RLS) for data isolation

## 2. View List

### 2.1 Authentication Views

#### 2.1.1 Login View
- **View Path**: `/login`
- **Main Purpose**: Authenticate returning users with email and password
- **Key Information to Display**:
  - Login form with email and password fields
  - Error messages for invalid credentials
  - Link to sign-up page
  - "Forgot password" placeholder (future enhancement)
- **Key View Components**:
  - `LoginForm` (React component)
  - Email input field (type="email", required)
  - Password input field (type="password", required)
  - Submit button ("Log In")
  - Error message display area
  - Link to sign-up page
- **UX Considerations**:
  - Auto-focus on email field on page load
  - Show/hide password toggle (optional)
  - Clear error messages for authentication failures
  - Loading state during authentication
  - Redirect to `/templates` after successful login
- **Accessibility Considerations**:
  - Proper form labels with `for` attributes
  - ARIA labels for error messages
  - Keyboard navigation support
  - Focus management after errors
  - Sufficient color contrast for error states
- **Security Considerations**:
  - HTTPS-only transmission
  - No password visible in plain text
  - Rate limiting on authentication attempts (API-level)
  - Session token stored securely via Supabase Auth
  - CSRF protection via Supabase

**User Stories Addressed**: US-002 (User Login), US-004 (Session Management)

---

#### 2.1.2 Sign-Up View
- **View Path**: `/signup`
- **Main Purpose**: Allow new users to create an account with email and password
- **Key Information to Display**:
  - Sign-up form with email and password fields
  - Password requirements (if any)
  - Error messages for validation failures
  - Link to login page
- **Key View Components**:
  - `SignUpForm` (React component)
  - Email input field (type="email", required)
  - Password input field (type="password", required)
  - Confirm password field (optional)
  - Submit button ("Sign Up")
  - Error message display area
  - Link to login page
- **UX Considerations**:
  - Auto-focus on email field
  - Real-time email format validation
  - Password strength indicator (optional)
  - Clear error messages for duplicate emails
  - Loading state during account creation
  - Redirect to `/templates` after successful sign-up
- **Accessibility Considerations**:
  - Proper form labels
  - ARIA live regions for validation errors
  - Keyboard navigation
  - Focus management
  - Screen reader announcements for errors
- **Security Considerations**:
  - Client-side email format validation
  - Server-side validation via Supabase Auth
  - Secure password storage (handled by Supabase)
  - No password stored in browser memory
  - Session established immediately after sign-up

**User Stories Addressed**: US-001 (User Sign-Up), US-004 (Session Management)

---

### 2.2 Template Management Views

#### 2.2.1 Templates List View (Landing Page)
- **View Path**: `/templates`
- **Main Purpose**: Display all user's workout templates and provide quick access to template actions
- **Key Information to Display**:
  - List of all templates with names
  - Exercise count per template (optional)
  - Creation date (optional)
  - Empty state message if no templates exist
  - User logout option
- **Key View Components**:
  - `TemplateList` (React component)
  - `TemplateCard` component for each template
  - "Create New Template" button (prominent, top of page)
  - Navigation header with logout button
  - Empty state component with call-to-action
  - Each template card contains:
    - Template name (clickable to view details)
    - "Start Workout" button (primary action)
    - "View Details" button (secondary action)
    - "Delete" button (destructive action)
- **UX Considerations**:
  - Templates sorted by creation date (newest first) or alphabetically
  - Visual distinction between action buttons (colors, icons)
  - Hover states for interactive elements on desktop
  - Touch-friendly button sizes on mobile (min 44x44px)
  - Loading state while fetching templates
  - Smooth transitions when templates are added/removed
  - Empty state encourages template creation
  - Confirmation dialog for delete action (native browser confirm)
- **Accessibility Considerations**:
  - Semantic HTML list structure (`<ul>`, `<li>`)
  - Proper heading hierarchy (h1 for page title, h2 for template names)
  - Button elements for all actions
  - Descriptive button labels
  - Keyboard navigation between templates
  - Focus indicators on interactive elements
  - Screen reader announcements for template count
- **Security Considerations**:
  - Only display templates owned by authenticated user (enforced by RLS)
  - Session validation on page load
  - Redirect to login if session invalid
  - No template data exposed in URLs

**API Integration**: GET /api/templates

**User Stories Addressed**: US-008 (View All Templates), US-021 (Primary Navigation), US-023 (User Data Isolation)

---

#### 2.2.2 Template Details View
- **View Path**: `/templates/[id]`
- **Main Purpose**: Display detailed information about a specific template including all exercises
- **Key Information to Display**:
  - Template name
  - Creation date
  - Ordered list of exercises with:
    - Exercise name
    - Number of sets
    - Number of reps per set
    - Default weight
  - Total exercise count
- **Key View Components**:
  - Template header with name and metadata
  - `ExerciseList` component showing ordered exercises
  - Exercise item component for each exercise
  - Action buttons:
    - "Start Workout" (primary action)
    - "Delete Template" (destructive action)
    - "Back to Templates" (navigation)
  - Confirmation dialog for deletion
- **UX Considerations**:
  - Clear visual hierarchy (template name prominent)
  - Exercise list maintains position order from template
  - Visual separation between exercises
  - Loading state while fetching template details
  - Error state if template not found
  - Confirmation dialog explains deletion is permanent
  - Success message after deletion
  - Automatic redirect to templates list after deletion
- **Accessibility Considerations**:
  - Semantic heading structure
  - Ordered list (`<ol>`) for exercises to convey sequence
  - Descriptive labels for all data fields
  - Keyboard navigation
  - Focus management after actions
  - ARIA labels for action buttons
- **Security Considerations**:
  - Verify template ownership (403 if unauthorized)
  - Session validation
  - No sensitive data in URL parameters
  - Authorization check via RLS

**API Integration**: GET /api/templates/:id, DELETE /api/templates/:id (future)

**User Stories Addressed**: US-009 (View Template Details), US-010 (Delete Workout Template), US-020 (Confirmation for Destructive Actions)

---

#### 2.2.3 Create Template View
- **View Path**: `/templates/new`
- **Main Purpose**: Allow users to create new workout templates by selecting exercises and defining sets/reps/weights
- **Key Information to Display**:
  - Template creation form
  - Template name input
  - Exercise selection interface
  - List of added exercises with configuration
  - Form validation errors
- **Key View Components**:
  - `TemplateForm` (React component)
  - Template name input field (required, max 60 chars)
  - `ExerciseSelector` component (searchable dropdown)
  - Exercise configuration section for each added exercise:
    - Exercise name (read-only)
    - Sets input (1-99)
    - Reps input (1-99)
    - Default weight input (0-999.99 kg)
    - Remove exercise button
    - Position reordering controls (optional)
  - "Add Exercise" button
  - Form action buttons:
    - "Save Template" (primary)
    - "Cancel" (secondary, navigates back)
  - Validation error messages
- **UX Considerations**:
  - Auto-focus on template name field
  - Exercise search filters as user types
  - Minimum 1 exercise required to save
  - Visual feedback when exercises are added
  - Drag-and-drop reordering (optional, can use up/down buttons)
  - Inline validation errors near relevant fields
  - Loading state during save operation
  - Success message after template creation
  - Redirect to templates list after successful save
  - Prevent duplicate exercise selection (optional)
  - Default weight can be prefilled from personal best (if available)
- **Accessibility Considerations**:
  - Form labels for all inputs
  - Required field indicators
  - Error messages associated with inputs via `aria-describedby`
  - Logical tab order through form
  - Keyboard-accessible exercise selection
  - Focus management when adding/removing exercises
  - Screen reader announcements for dynamic content changes
- **Security Considerations**:
  - Client-side validation before submission
  - Server-side validation via API
  - Input sanitization to prevent XSS
  - Template associated with authenticated user automatically
  - No user_id in form data (derived from session)

**API Integration**: GET /api/exercises (with search), POST /api/templates

**User Stories Addressed**: US-007 (Create Workout Template), US-005 (View Exercise Library), US-006 (Search Exercises), US-018 (Input Validation for Sets and Reps), US-019 (Input Validation for Weight)

---

### 2.3 Workout Logging Views

#### 2.3.1 Active Workout View
- **View Path**: `/workout/[templateId]`
- **Main Purpose**: Log workout results by recording sets, reps, and weights for each exercise in the template
- **Key Information to Display**:
  - Workout header (template name, current date)
  - Vertical list of all exercises from template
  - For each exercise:
    - Exercise name
    - Input fields for each set (reps, weight)
    - Set index numbers
  - Prefilled values from last workout
  - Form validation errors
- **Key View Components**:
  - `WorkoutForm` (React component)
  - Workout header section
  - `ExerciseInput` component for each exercise:
    - Exercise name (read-only)
    - Set inputs (array of set_index, reps, weight)
    - Visual separation between sets
  - Form action buttons:
    - "Complete Workout" (primary, bottom of form)
    - "Cancel Workout" (destructive, with confirmation)
  - Loading indicator during prefill and save
  - Success message after completion
  - Personal best achievement notification (if any)
- **UX Considerations**:
  - Form prefilled with data from GET /api/workouts/prefill/:template_id
  - Fallback to template defaults if no previous workout
  - Single-page form (no pagination between exercises)
  - Vertical scrolling layout for all exercises
  - Sticky header with workout name and date
  - Sticky footer with action buttons
  - Auto-save to local storage (optional, for session recovery)
  - Visual progress indicator (e.g., "Exercise 3 of 5")
  - Inline validation on blur or submit
  - Clear distinction between completed and pending exercises (optional)
  - Confirmation dialog for cancel action
  - Success message shows updated personal bests
  - Automatic redirect to templates list after completion
- **Accessibility Considerations**:
  - Semantic form structure
  - Labels for all inputs
  - Grouped inputs for each set (fieldset/legend)
  - Logical tab order through exercises and sets
  - Keyboard navigation
  - Focus management
  - Error messages linked to inputs
  - Screen reader announcements for validation errors
  - ARIA live regions for dynamic updates
- **Security Considerations**:
  - Session validation on page load
  - Template ownership verification
  - Input validation (client and server)
  - Workout associated with authenticated user
  - No manipulation of user_id or template_id in form

**API Integration**: GET /api/workouts/prefill/:template_id, POST /api/workouts

**User Stories Addressed**: US-011 (Start Workout from Template), US-012 (Log Workout Data), US-013 (Complete Workout), US-014 (Cancel Workout), US-016 (Automatic Personal Best Update), US-018 (Input Validation), US-019 (Input Validation for Weight)

---

### 2.4 Optional/Future Views

#### 2.4.1 Workout History View
- **View Path**: `/workouts`
- **Main Purpose**: Display past completed workouts for reference
- **Key Information to Display**:
  - List of completed workouts
  - For each workout:
    - Date logged
    - Template name (if associated)
    - Exercise count
    - Total sets completed
  - Pagination controls
- **Key View Components**:
  - `WorkoutList` component
  - `WorkoutCard` for each workout
  - Date range filter (optional)
  - Template filter (optional)
  - Pagination controls
  - "View Details" action for each workout
- **UX Considerations**:
  - Sorted by date (newest first)
  - Read-only view (no editing in MVP)
  - Loading state while fetching
  - Empty state if no workouts
  - Filter and search capabilities (optional)
- **Accessibility Considerations**:
  - Semantic list structure
  - Proper headings
  - Keyboard navigation
  - Focus management
- **Security Considerations**:
  - Only show user's own workouts
  - Session validation
  - RLS enforcement

**API Integration**: GET /api/workouts

**User Stories Addressed**: Future enhancement (not in MVP scope)

---

#### 2.4.2 Workout Details View
- **View Path**: `/workouts/[id]`
- **Main Purpose**: Display detailed information about a specific completed workout
- **Key Information to Display**:
  - Workout date
  - Template name
  - All exercises with sets, reps, and weights logged
  - Personal bests achieved in this workout
- **Key View Components**:
  - Workout header
  - Exercise list with set details
  - Personal best indicators
  - "Back to History" navigation
- **UX Considerations**:
  - Read-only display
  - Visual highlighting of personal bests
  - Clear data presentation
- **Accessibility Considerations**:
  - Semantic structure
  - Proper headings
  - Keyboard navigation
- **Security Considerations**:
  - Workout ownership verification
  - Session validation

**API Integration**: GET /api/workouts/:id

**User Stories Addressed**: Future enhancement (not in MVP scope)

---

#### 2.4.3 Personal Bests View
- **View Path**: `/personal-bests`
- **Main Purpose**: Display all personal best records for each exercise
- **Key Information to Display**:
  - List of exercises with personal bests
  - For each exercise:
    - Exercise name
    - Best weight achieved
    - Date achieved
- **Key View Components**:
  - `PersonalBestList` component
  - Exercise filter/search
  - Sort options (by exercise name, weight, date)
- **UX Considerations**:
  - Sorted by most recent updates
  - Visual emphasis on recent achievements
  - Empty state if no personal bests
- **Accessibility Considerations**:
  - Semantic list structure
  - Proper headings
  - Keyboard navigation
- **Security Considerations**:
  - Only show user's own personal bests
  - Session validation

**API Integration**: GET /api/personal-bests

**User Stories Addressed**: US-015 (View Personal Bests) - Optional for MVP

---

## 3. User Journey Map

### 3.1 Primary User Journey: First-Time User

**Goal**: Create a template and complete first workout

1. **Sign Up** (`/signup`)
   - User enters email and password
   - Submits sign-up form
   - Account created via Supabase Auth
   - Automatic login and redirect to `/templates`

2. **Empty Templates State** (`/templates`)
   - User sees empty state message
   - Call-to-action: "Create Your First Template"
   - User clicks "Create New Template" button
   - Navigate to `/templates/new`

3. **Create Template** (`/templates/new`)
   - User enters template name (e.g., "Push Day")
   - User searches for exercises (e.g., "bench press")
   - User selects exercise from dropdown
   - User enters sets (4), reps (8), default weight (80 kg)
   - User adds more exercises (repeat search/select/configure)
   - User clicks "Save Template"
   - Client validates inputs
   - POST /api/templates
   - Success message displayed
   - Redirect to `/templates`

4. **Templates List** (`/templates`)
   - User sees newly created template
   - User clicks "Start Workout" on template
   - Navigate to `/workout/[templateId]`

5. **Start Workout** (`/workout/[templateId]`)
   - GET /api/workouts/prefill/:template_id
   - Form displays with template defaults (no previous workout)
   - User performs exercises and logs results
   - User modifies weights/reps as needed
   - User scrolls through all exercises
   - User clicks "Complete Workout"
   - Client validates inputs
   - POST /api/workouts
   - Success message: "Workout completed! New personal bests: Bench Press (80 kg)"
   - Redirect to `/templates`

6. **Return to Templates** (`/templates`)
   - User sees template list
   - User can start another workout or create new template

---

### 3.2 Secondary User Journey: Returning User

**Goal**: Complete workout using existing template

1. **Login** (`/login`)
   - User enters email and password
   - Submits login form
   - Authentication via Supabase Auth
   - Redirect to `/templates`

2. **Templates List** (`/templates`)
   - User sees list of existing templates
   - User clicks "Start Workout" on desired template
   - Navigate to `/workout/[templateId]`

3. **Start Workout** (`/workout/[templateId]`)
   - GET /api/workouts/prefill/:template_id
   - Form prefilled with data from last workout
   - User sees previous weights/reps as starting point
   - User adjusts values based on current performance
   - User completes all exercises
   - User clicks "Complete Workout"
   - POST /api/workouts
   - Personal bests automatically updated if exceeded
   - Success message with PB updates
   - Redirect to `/templates`

---

### 3.3 Tertiary User Journey: Template Management

**Goal**: View template details and delete unused template

1. **Templates List** (`/templates`)
   - User sees list of templates
   - User clicks "View Details" on specific template
   - Navigate to `/templates/[id]`

2. **Template Details** (`/templates/[id]`)
   - GET /api/templates/:id
   - User reviews exercises, sets, reps, weights
   - User decides template is no longer needed
   - User clicks "Delete Template"
   - Browser confirmation dialog: "Are you sure? This action cannot be undone."
   - User confirms deletion
   - DELETE /api/templates/:id (future endpoint)
   - Success message: "Template deleted"
   - Redirect to `/templates`

3. **Templates List** (`/templates`)
   - Template removed from list
   - User continues with remaining templates

---

### 3.4 Edge Case Journey: Cancel Workout

**Goal**: Start workout but cancel without saving

1. **Start Workout** (`/workout/[templateId]`)
   - User begins logging workout
   - User fills in some exercises
   - User decides to cancel (e.g., interrupted, needs to leave gym)
   - User clicks "Cancel Workout"
   - Browser confirmation dialog: "Cancel workout? Your progress will not be saved."
   - User confirms cancellation
   - No API call (no data saved)
   - Redirect to `/templates`

2. **Templates List** (`/templates`)
   - User returns to templates
   - No workout record created
   - Personal bests not updated

---

### 3.5 Error Handling Journey

**Goal**: Handle validation errors during template creation

1. **Create Template** (`/templates/new`)
   - User enters template name
   - User adds exercise but enters invalid values:
     - Sets: 150 (exceeds max of 99)
     - Reps: -5 (negative value)
     - Weight: 1200 (exceeds max of 999.99)
   - User clicks "Save Template"
   - Client-side validation catches errors
   - Error messages displayed inline:
     - "Sets must be between 1 and 99"
     - "Reps cannot be negative"
     - "Weight must not exceed 999 kg"
   - Form submission prevented
   - User corrects values
   - User clicks "Save Template" again
   - Validation passes
   - POST /api/templates
   - Success, redirect to `/templates`

---

## 4. Layout and Navigation Structure

### 4.1 Global Layout Structure

**Layout Hierarchy:**
```
┌─────────────────────────────────────┐
│         Header / Navigation         │
├─────────────────────────────────────┤
│                                     │
│                                     │
│          Main Content Area          │
│                                     │
│                                     │
├─────────────────────────────────────┤
│      Footer (optional, minimal)     │
└─────────────────────────────────────┘
```

**Header Components:**
- Application logo/name: "GymRatPlanner"
- Primary navigation (when authenticated):
  - "Templates" link (active state indicator)
  - "Workouts" link (optional, future)
- User menu:
  - User email or username
  - Logout button

**Main Content Area:**
- Full-width container on mobile
- Max-width container on desktop (e.g., 1200px)
- Padding for content spacing
- Responsive breakpoints using Tailwind defaults

**Footer:**
- Minimal or none for MVP
- Optional: version number, privacy policy link

---

### 4.2 Navigation Patterns

#### 4.2.1 Primary Navigation (Authenticated Users)

**Navigation Type**: Horizontal tab-style navigation bar

**Navigation Items:**
1. **Templates** (default landing page)
   - Path: `/templates`
   - Always accessible
   - Active state when on templates views

2. **Workout** (contextual, only during active workout)
   - Path: `/workout/[templateId]`
   - Not in main navigation (accessed via "Start Workout" action)
   - Back navigation to templates available

3. **Workouts** (optional, future)
   - Path: `/workouts`
   - Workout history view
   - Active state when viewing history

**Navigation Behavior:**
- Sticky header on scroll (optional)
- Active state visually distinct (underline, bold, color)
- Mobile: Hamburger menu or bottom navigation (optional)
- Desktop: Horizontal navigation bar

---

#### 4.2.2 Contextual Navigation

**Within Template Views:**
- Breadcrumb navigation (optional):
  - Templates > Template Details
  - Templates > Create Template
- "Back" buttons on detail/form views
- Cancel actions return to previous view

**Within Workout View:**
- No navigation away during active workout (prevents data loss)
- Cancel button with confirmation
- Complete button finishes and navigates away

---

#### 4.2.3 Mobile Navigation Considerations

**Mobile Breakpoint**: < 640px

**Mobile Navigation Options:**

**Option A: Bottom Navigation Bar**
- Fixed bottom bar with primary navigation items
- Icon + label for each item
- Persistent across views
- Touch-friendly (min 44x44px targets)

**Option B: Hamburger Menu**
- Top-left hamburger icon
- Slide-out menu with navigation items
- Overlay when open
- Close button or tap outside to dismiss

**Recommendation**: Bottom navigation for MVP (simpler, more accessible)

---

### 4.3 Routing Structure

**Route Hierarchy:**
```
/
├── /login (public)
├── /signup (public)
├── /templates (protected, default landing)
│   ├── /templates/new (protected)
│   └── /templates/[id] (protected)
├── /workout/[templateId] (protected)
└── /workouts (protected, optional)
    └── /workouts/[id] (protected, optional)
```

**Route Protection:**
- Public routes: `/login`, `/signup`
- Protected routes: All others
- Middleware checks Supabase Auth session
- Redirect to `/login` if unauthenticated
- Redirect to `/templates` if authenticated user visits `/login`

---

### 4.4 Page Transitions

**Transition Strategy**: Simple, fast transitions

**Transition Types:**
- **Navigation between views**: Instant (no animation for MVP)
- **Form submissions**: Loading indicator, then redirect
- **Modal/dialog open**: Fade in (if using custom dialogs)
- **List updates**: Fade in new items (optional)

**Loading States:**
- Skeleton screens (optional, can use simple "Loading..." text)
- Disabled buttons during API calls
- Spinner or progress indicator for long operations

---

## 5. Key Components

### 5.1 Shared UI Components (shadcn/ui)

#### 5.1.1 Button
**Purpose**: Consistent button styling across application

**Variants:**
- **Primary**: Main actions (e.g., "Save Template", "Complete Workout")
- **Secondary**: Alternative actions (e.g., "Cancel", "Back")
- **Destructive**: Dangerous actions (e.g., "Delete Template")
- **Ghost**: Subtle actions (e.g., navigation links)

**Props:**
- `variant`: primary | secondary | destructive | ghost
- `size`: small | medium | large
- `disabled`: boolean
- `loading`: boolean (shows spinner)

**Accessibility:**
- Semantic `<button>` element
- Disabled state prevents interaction
- Focus visible indicator
- Sufficient color contrast

---

#### 5.1.2 Input
**Purpose**: Text input fields for forms

**Types:**
- Text input (template name, search)
- Number input (sets, reps, weight)
- Email input (authentication)
- Password input (authentication)

**Props:**
- `type`: text | number | email | password
- `label`: string
- `placeholder`: string
- `required`: boolean
- `error`: string (validation error message)
- `min`, `max`: number (for number inputs)

**Accessibility:**
- Label associated with input
- Required indicator
- Error message linked via `aria-describedby`
- Focus visible indicator

---

#### 5.1.3 Select / Dropdown
**Purpose**: Exercise selection, filtering

**Variants:**
- **Simple Select**: Native `<select>` for mobile
- **Searchable Select**: Custom dropdown with search (desktop)

**Props:**
- `options`: array of {value, label}
- `value`: selected value
- `onChange`: callback
- `searchable`: boolean
- `placeholder`: string

**Accessibility:**
- Keyboard navigation (arrow keys, enter)
- ARIA attributes for custom select
- Focus management
- Screen reader support

---

#### 5.1.4 Form
**Purpose**: Form wrapper with validation

**Features:**
- Form state management
- Validation on submit
- Error display
- Loading state

**Props:**
- `onSubmit`: callback
- `validationSchema`: validation rules
- `initialValues`: form defaults

**Accessibility:**
- Semantic `<form>` element
- Error summary at top (optional)
- Focus on first error field

---

#### 5.1.5 Card
**Purpose**: Container for template/workout items

**Features:**
- Consistent spacing and borders
- Hover states (desktop)
- Responsive layout

**Usage:**
- Template cards in list view
- Workout cards in history view
- Exercise cards in forms

**Accessibility:**
- Semantic HTML structure
- Proper heading hierarchy within card

---

#### 5.1.6 Alert / Toast
**Purpose**: Success, error, and info messages

**Variants:**
- **Success**: Green, checkmark icon (e.g., "Template created!")
- **Error**: Red, error icon (e.g., "Failed to save template")
- **Info**: Blue, info icon (e.g., "Loading...")
- **Warning**: Yellow, warning icon (e.g., "Session expiring soon")

**Behavior:**
- Auto-dismiss after 5 seconds (configurable)
- Manual dismiss button
- Stack multiple alerts (optional)

**Accessibility:**
- ARIA live region for screen readers
- Focus management for important alerts
- Sufficient color contrast

---

### 5.2 Custom Application Components

#### 5.2.1 TemplateList
**Purpose**: Display list of user's workout templates

**Props:**
- `templates`: array of template objects
- `onStartWorkout`: callback
- `onViewDetails`: callback
- `onDelete`: callback

**Features:**
- Renders `TemplateCard` for each template
- Empty state when no templates
- Loading state while fetching
- Responsive grid layout (1 column mobile, 2-3 columns desktop)

**Accessibility:**
- Semantic list structure
- Proper headings
- Keyboard navigation

---

#### 5.2.2 TemplateCard
**Purpose**: Individual template item in list

**Props:**
- `template`: template object (id, name, exercise_count)
- `onStartWorkout`: callback
- `onViewDetails`: callback
- `onDelete`: callback

**Features:**
- Template name (clickable to details)
- Exercise count badge
- Action buttons (Start, View, Delete)
- Hover state (desktop)

**Accessibility:**
- Semantic HTML
- Descriptive button labels
- Focus indicators

---

#### 5.2.3 TemplateForm
**Purpose**: Create new workout template

**Props:**
- `onSubmit`: callback
- `onCancel`: callback

**Features:**
- Template name input
- Exercise selector with search
- Dynamic exercise list (add/remove)
- Exercise configuration (sets, reps, weight)
- Form validation
- Loading state during save

**State Management:**
- Local state for form data
- Array of exercises with positions
- Validation errors

**Accessibility:**
- Form labels and structure
- Error messages
- Keyboard navigation
- Focus management

---

#### 5.2.4 ExerciseSelector
**Purpose**: Search and select exercises from library

**Props:**
- `exercises`: array of available exercises
- `onSelect`: callback
- `selectedExercises`: array of already selected exercise IDs

**Features:**
- Search input with real-time filtering
- Dropdown list of matching exercises
- Keyboard navigation (arrow keys, enter)
- Prevent duplicate selection
- Loading state while fetching exercises

**Behavior:**
- Fetch exercises on mount (GET /api/exercises)
- Filter locally as user types
- Clear search after selection

**Accessibility:**
- Combobox pattern (ARIA)
- Keyboard navigation
- Screen reader support

---

#### 5.2.5 WorkoutForm
**Purpose**: Log workout results for all exercises

**Props:**
- `templateId`: string
- `onComplete`: callback
- `onCancel`: callback

**Features:**
- Workout header (template name, date)
- List of exercises with set inputs
- Prefilled data from last workout
- Form validation
- Loading state during save
- Success message with PB updates

**State Management:**
- Local state for workout data
- Array of exercises with sets
- Validation errors
- Loading state

**Lifecycle:**
- Mount: Fetch prefill data (GET /api/workouts/prefill/:template_id)
- Submit: Validate and POST /api/workouts
- Success: Show message, redirect to templates

**Accessibility:**
- Form structure
- Labels and fieldsets
- Error messages
- Keyboard navigation

---

#### 5.2.6 ExerciseInput
**Purpose**: Input fields for single exercise in workout

**Props:**
- `exercise`: exercise object (id, name, sets)
- `value`: array of set data {set_index, reps, weight}
- `onChange`: callback

**Features:**
- Exercise name (read-only)
- Input row for each set:
  - Set number (read-only)
  - Reps input (number, 1-99)
  - Weight input (number, 0-999.99)
- Visual separation between sets
- Validation on blur

**Accessibility:**
- Fieldset/legend for exercise
- Labels for inputs
- Error messages
- Keyboard navigation

---

#### 5.2.7 ConfirmDialog
**Purpose**: Confirmation for destructive actions

**Props:**
- `open`: boolean
- `title`: string
- `message`: string
- `confirmLabel`: string (e.g., "Delete")
- `cancelLabel`: string (e.g., "Cancel")
- `onConfirm`: callback
- `onCancel`: callback

**Features:**
- Modal overlay
- Clear title and message
- Confirm and cancel buttons
- Escape key to cancel
- Click outside to cancel (optional)

**Note**: For MVP, can use native `window.confirm()` instead of custom component

**Accessibility:**
- Focus trap within dialog
- Focus on confirm button on open
- Restore focus on close
- ARIA dialog role
- Keyboard navigation (Tab, Escape)

---

#### 5.2.8 LoadingSpinner
**Purpose**: Visual indicator for loading states

**Variants:**
- **Inline**: Small spinner next to text
- **Overlay**: Full-page loading overlay
- **Button**: Spinner inside button

**Features:**
- Animated spinner icon
- Optional loading text
- Accessible to screen readers

**Accessibility:**
- ARIA live region
- Screen reader announcement: "Loading"

---

#### 5.2.9 ErrorMessage
**Purpose**: Display validation and API errors

**Props:**
- `message`: string
- `type`: inline | banner
- `dismissible`: boolean

**Features:**
- Error icon
- Clear error text
- Dismiss button (if dismissible)
- Appropriate color contrast

**Accessibility:**
- ARIA role="alert"
- Focus management for critical errors
- Sufficient color contrast

---

#### 5.2.10 EmptyState
**Purpose**: Display when no data exists

**Props:**
- `title`: string
- `message`: string
- `actionLabel`: string (optional)
- `onAction`: callback (optional)

**Features:**
- Icon or illustration
- Descriptive title and message
- Call-to-action button (optional)
- Centered layout

**Usage:**
- No templates created yet
- No workout history
- No search results

**Accessibility:**
- Semantic HTML
- Descriptive text
- Keyboard-accessible action button

---

### 5.3 Layout Components

#### 5.3.1 AppLayout
**Purpose**: Global layout wrapper for authenticated pages

**Features:**
- Header with navigation
- Main content area
- Footer (optional)
- Responsive layout

**Props:**
- `children`: React nodes

---

#### 5.3.2 AuthLayout
**Purpose**: Layout for authentication pages (login, signup)

**Features:**
- Centered form container
- Minimal header (logo only)
- No navigation
- Responsive layout

**Props:**
- `children`: React nodes

---

#### 5.3.3 PageHeader
**Purpose**: Consistent page headers

**Props:**
- `title`: string
- `actions`: React nodes (buttons, etc.)

**Features:**
- Page title (h1)
- Optional action buttons (e.g., "Create New Template")
- Responsive layout

**Accessibility:**
- Proper heading level
- Semantic HTML

---

### 5.4 Component Composition Example

**Templates List Page Composition:**
```
<AppLayout>
  <PageHeader title="My Templates" actions={<Button>Create New Template</Button>} />
  <TemplateList templates={templates}>
    {templates.map(template => (
      <TemplateCard
        key={template.id}
        template={template}
        onStartWorkout={handleStartWorkout}
        onViewDetails={handleViewDetails}
        onDelete={handleDelete}
      />
    ))}
  </TemplateList>
  {templates.length === 0 && (
    <EmptyState
      title="No templates yet"
      message="Create your first workout template to get started"
      actionLabel="Create Template"
      onAction={handleCreateTemplate}
    />
  )}
</AppLayout>
```

---

## 6. Responsive Design Strategy

### 6.1 Breakpoint System (Tailwind CSS)

**Breakpoints:**
- **Mobile**: < 640px (default, mobile-first)
- **Tablet**: 640px - 1024px (sm, md)
- **Desktop**: > 1024px (lg, xl, 2xl)

**Design Approach**: Mobile-first, progressive enhancement

---

### 6.2 Mobile Layout (< 640px)

**Characteristics:**
- Single-column layouts
- Full-width components
- Stacked navigation (bottom bar or hamburger)
- Touch-friendly targets (min 44x44px)
- Simplified forms (native inputs)
- Reduced padding/margins
- Larger font sizes for readability

**Specific Adaptations:**
- **Templates List**: Single column, full-width cards
- **Template Form**: Vertical form layout, full-width inputs
- **Workout Form**: Single column, stacked exercises
- **Navigation**: Bottom navigation bar or hamburger menu
- **Buttons**: Full-width or stacked vertically

---

### 6.3 Tablet Layout (640px - 1024px)

**Characteristics:**
- Two-column layouts where appropriate
- Increased spacing
- Side-by-side buttons
- Enhanced hover states

**Specific Adaptations:**
- **Templates List**: 2-column grid
- **Template Form**: Two-column layout for sets/reps/weight
- **Workout Form**: Wider form, more spacing
- **Navigation**: Horizontal navigation bar

---

### 6.4 Desktop Layout (> 1024px)

**Characteristics:**
- Multi-column layouts
- Maximum width containers (1200px)
- Enhanced hover states
- Keyboard shortcuts (optional)
- More visual hierarchy

**Specific Adaptations:**
- **Templates List**: 3-column grid
- **Template Form**: Optimized layout with side-by-side fields
- **Workout Form**: Wider form with better spacing
- **Navigation**: Full horizontal navigation with dropdowns (if needed)

---

## 7. Accessibility Requirements

### 7.1 WCAG 2.1 Level AA Compliance

**Key Requirements:**
- **Perceivable**: Information presented in multiple ways
- **Operable**: All functionality available via keyboard
- **Understandable**: Clear, consistent interface
- **Robust**: Compatible with assistive technologies

---

### 7.2 Semantic HTML

**Requirements:**
- Proper heading hierarchy (h1 → h2 → h3)
- Semantic elements (`<nav>`, `<main>`, `<article>`, `<section>`)
- Lists for list content (`<ul>`, `<ol>`, `<li>`)
- Buttons for actions (`<button>`)
- Links for navigation (`<a>`)
- Forms with proper structure (`<form>`, `<label>`, `<input>`)

---

### 7.3 Keyboard Navigation

**Requirements:**
- All interactive elements keyboard accessible
- Logical tab order
- Visible focus indicators
- Keyboard shortcuts for common actions (optional)
- Escape key to close dialogs
- Enter key to submit forms
- Arrow keys for navigation (where appropriate)

**Focus Management:**
- Focus on first input when form loads
- Focus on first error after validation failure
- Focus on confirmation button in dialogs
- Restore focus after dialog closes

---

### 7.4 Screen Reader Support

**Requirements:**
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content
- ARIA roles for custom components (dialog, combobox)
- Descriptive link text (no "click here")
- Alt text for images (if any)
- Form error announcements

**ARIA Attributes:**
- `aria-label`: Descriptive labels for elements
- `aria-describedby`: Link errors to inputs
- `aria-live`: Announce dynamic changes
- `aria-required`: Indicate required fields
- `aria-invalid`: Indicate validation errors

---

### 7.5 Color Contrast

**Requirements:**
- Text contrast ratio: 4.5:1 minimum (WCAG AA)
- Large text contrast ratio: 3:1 minimum
- Interactive element contrast: 3:1 minimum
- Error states clearly distinguishable (not color alone)

**Testing:**
- Use contrast checker tools
- Test with color blindness simulators

---

### 7.6 Form Accessibility

**Requirements:**
- Labels for all inputs
- Required field indicators (* or "required" text)
- Error messages associated with inputs
- Fieldsets for grouped inputs
- Clear instructions
- Validation errors announced to screen readers

---

## 8. Security Considerations

### 8.1 Authentication and Authorization

**Authentication:**
- Supabase Auth with JWT-based sessions
- Secure token storage (httpOnly cookies or secure storage)
- HTTPS-only transmission
- Session validation on every protected route
- Automatic redirect to login if session invalid

**Authorization:**
- Row-Level Security (RLS) at database level
- User can only access own data
- `auth.uid()` used in all database queries
- No user_id manipulation in client code

---

### 8.2 Input Validation and Sanitization

**Client-Side Validation:**
- Validate all inputs before submission
- Enforce min/max constraints
- Prevent negative values
- Email format validation
- Required field validation

**Server-Side Validation:**
- API validates all inputs
- Reject invalid data
- Sanitize inputs to prevent SQL injection (handled by Supabase)
- Prevent XSS attacks (escape output)

---

### 8.3 Session Management

**Session Security:**
- Secure token storage
- Short-lived access tokens (1 hour default)
- Refresh tokens for session renewal
- Logout clears session completely
- Session expiry handled gracefully

**Session Expiry Handling:**
- Detect expired session
- Redirect to login
- Preserve intended destination (optional)
- Show message: "Session expired, please log in again"

---

### 8.4 Data Protection

**Data Isolation:**
- RLS ensures users only see own data
- No data leakage via URLs
- No sensitive data in client-side storage
- No user_id in form data

**HTTPS:**
- All traffic over HTTPS in production
- Secure cookies
- No mixed content

---

### 8.5 CSRF Protection

**Protection Mechanisms:**
- Supabase Auth handles CSRF tokens
- SameSite cookie attribute
- Origin validation

---

### 8.6 Rate Limiting

**Rate Limits (API-level):**
- Authentication endpoints: 5 requests/minute
- Read endpoints: 100 requests/minute
- Write endpoints: 30 requests/minute

**Client-Side:**
- Disable buttons during API calls
- Prevent double submissions
- Debounce search inputs

---

## 9. Error Handling and Edge Cases

### 9.1 Network Errors

**Scenarios:**
- API request fails (network error)
- API request times out
- Server returns 500 error

**Handling:**
- Display error message: "Unable to connect. Please check your internet connection."
- Provide retry button
- Preserve form data (don't lose user input)
- Log error for debugging

---

### 9.2 Validation Errors

**Scenarios:**
- User enters invalid data
- API returns 400 validation error

**Handling:**
- Display inline error messages
- Highlight invalid fields
- Prevent form submission
- Focus on first error field
- Clear, actionable error messages

---

### 9.3 Authorization Errors

**Scenarios:**
- User tries to access another user's data (403)
- Session expired (401)

**Handling:**
- 401: Redirect to login with message
- 403: Show error message, redirect to templates
- Log error for security monitoring

---

### 9.4 Not Found Errors

**Scenarios:**
- Template not found (404)
- Workout not found (404)

**Handling:**
- Display error message: "Template not found"
- Provide navigation back to templates list
- Log error for debugging

---

### 9.5 Empty States

**Scenarios:**
- No templates created
- No workout history
- No search results
- No exercises in template

**Handling:**
- Display empty state component
- Provide clear message
- Offer call-to-action (e.g., "Create your first template")
- Ensure empty state is visually distinct

---

### 9.6 Loading States

**Scenarios:**
- Fetching data from API
- Submitting form
- Deleting resource

**Handling:**
- Display loading indicator (spinner or skeleton)
- Disable interactive elements
- Show loading text (e.g., "Loading templates...")
- Timeout after 30 seconds with error message

---

### 9.7 Session Expiry During Workout

**Scenario:**
- User starts workout, session expires mid-workout

**Handling:**
- Detect session expiry on form submission
- Save workout data to local storage (optional)
- Redirect to login with message: "Session expired. Please log in to save your workout."
- After login, attempt to restore workout data (optional)

---

### 9.8 Duplicate Template Names

**Scenario:**
- User tries to create template with existing name

**Handling:**
- API returns 409 Conflict
- Display error: "A template with this name already exists"
- Allow user to modify name
- Prevent submission until name is unique

---

### 9.9 Browser Compatibility

**Considerations:**
- Test on modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Polyfills for missing features (if needed)
- Display warning for unsupported browsers (optional)

---

## 10. Performance Considerations

### 10.1 Initial Load Performance

**Optimizations:**
- Code splitting (Astro automatic)
- Lazy load React components
- Minimize bundle size
- Optimize images (if any)
- Use CDN for static assets

---

### 10.2 API Request Optimization

**Strategies:**
- Minimize API calls
- Cache exercise list (rarely changes)
- Debounce search inputs (300ms)
- Cancel in-flight requests on navigation
- Use pagination for large lists

---

### 10.3 Form Performance

**Optimizations:**
- Debounce validation (don't validate on every keystroke)
- Validate on blur or submit
- Use controlled components efficiently
- Avoid unnecessary re-renders

---

### 10.4 Mobile Performance

**Considerations:**
- Optimize for slower networks
- Reduce payload sizes
- Use native inputs on mobile
- Minimize JavaScript execution
- Test on real devices

---

## 11. Future Enhancements

### 11.1 Planned Features (Post-MVP)

**Template Editing:**
- Edit existing templates (PATCH /api/templates/:id)
- Add/remove exercises from templates
- Reorder exercises

**Workout History:**
- View past workouts (GET /api/workouts)
- Workout details view (GET /api/workouts/:id)
- Delete workouts (DELETE /api/workouts/:id)
- Edit completed workouts (PATCH /api/workouts/:id)

**Personal Bests:**
- Dedicated personal bests view (GET /api/personal-bests)
- Visual indicators during workout (show current PB)
- PB achievement celebrations

**Advanced Features:**
- Workout analytics and charts
- Progress tracking over time
- Template sharing between users
- Custom exercise creation
- Rest timer between sets
- Notes per exercise or workout

**User Profile:**
- Profile management (age, weight, height)
- Settings page
- Password reset
- Email verification

**Onboarding:**
- Guided onboarding flow for new users
- Sample templates
- Tutorial tooltips

---

### 11.2 Technical Enhancements

**State Management:**
- Consider Redux or Zustand for complex state
- Offline support with service workers
- Optimistic UI updates

**Real-Time Features:**
- Live workout tracking (if multi-device)
- Real-time sync across devices

**Performance:**
- Implement caching strategies
- Virtual scrolling for long lists
- Image optimization

**Accessibility:**
- WCAG 2.1 Level AAA compliance
- Enhanced keyboard shortcuts
- Voice control support

**Security:**
- Two-factor authentication
- Advanced password policies
- Audit logging

---

## 12. Implementation Priorities

### 12.1 Phase 1: MVP Core (Current Scope)

**Priority 1: Authentication**
- Login view
- Sign-up view
- Session management
- Logout functionality

**Priority 2: Template Management**
- Templates list view
- Create template view
- Template details view
- Delete template (with confirmation)

**Priority 3: Workout Logging**
- Active workout view
- Workout prefill
- Complete workout
- Cancel workout

**Priority 4: Exercise Management**
- Exercise selection
- Exercise search

---

### 12.2 Phase 2: Enhanced MVP

**Priority 5: Workout History**
- Workout list view
- Workout details view

**Priority 6: Personal Bests**
- Personal bests view
- PB indicators in workout

**Priority 7: Polish**
- Improved loading states
- Better error handling
- Enhanced mobile experience

---

### 12.3 Phase 3: Advanced Features

**Priority 8: Template Editing**
- Edit template functionality
- Reorder exercises

**Priority 9: Analytics**
- Progress charts
- Workout statistics

**Priority 10: Social Features**
- Template sharing
- User profiles

---

## 13. Design System and Styling

### 13.1 Color Palette

**Primary Colors:**
- Primary: Blue (#3B82F6) - Main actions, links
- Secondary: Gray (#6B7280) - Secondary actions
- Destructive: Red (#EF4444) - Delete, cancel actions
- Success: Green (#10B981) - Success messages, PB achievements
- Warning: Yellow (#F59E0B) - Warnings
- Info: Blue (#3B82F6) - Info messages

**Neutral Colors:**
- Background: White (#FFFFFF) / Dark (#1F2937) for dark mode
- Text: Gray-900 (#111827) / Gray-100 for dark mode
- Border: Gray-300 (#D1D5DB)

---

### 13.2 Typography

**Font Family:**
- System font stack (Tailwind default): `font-sans`
- Monospace for numbers: `font-mono` (optional)

**Font Sizes:**
- Heading 1: 2.25rem (36px)
- Heading 2: 1.875rem (30px)
- Heading 3: 1.5rem (24px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

### 13.3 Spacing

**Spacing Scale (Tailwind):**
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

**Component Spacing:**
- Form fields: mb-4 (1rem)
- Sections: mb-8 (2rem)
- Page padding: p-4 (1rem) mobile, p-8 (2rem) desktop

---

### 13.4 Shadows and Borders

**Shadows:**
- Card: shadow-md
- Hover: shadow-lg
- Modal: shadow-xl

**Borders:**
- Default: border-gray-300
- Radius: rounded-md (0.375rem)
- Focus ring: ring-2 ring-primary

---

### 13.5 Icons

**Icon Library**: Lucide React (recommended)

**Common Icons:**
- Plus: Add exercise, create template
- Trash: Delete action
- Check: Complete, success
- X: Close, cancel
- Search: Search input
- User: User menu
- Logout: Logout button
- ChevronRight: Navigation
- ChevronDown: Dropdown

---

## 14. Testing Considerations

### 14.1 Manual Testing Checklist

**Authentication:**
- [ ] Sign up with valid email/password
- [ ] Sign up with invalid email (error shown)
- [ ] Sign up with existing email (error shown)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (error shown)
- [ ] Logout successfully
- [ ] Session persists on page refresh
- [ ] Redirect to login when unauthenticated

**Template Management:**
- [ ] View empty templates list
- [ ] Create template with valid data
- [ ] Create template with invalid data (errors shown)
- [ ] View template details
- [ ] Delete template (confirmation shown)
- [ ] Cancel template deletion
- [ ] Search exercises in template form
- [ ] Add multiple exercises to template
- [ ] Remove exercise from template form

**Workout Logging:**
- [ ] Start workout from template
- [ ] Workout form prefilled with last workout data
- [ ] Workout form uses template defaults (first workout)
- [ ] Edit sets/reps/weights in workout
- [ ] Complete workout successfully
- [ ] Personal bests updated after workout
- [ ] Cancel workout (confirmation shown)
- [ ] Validation errors shown for invalid inputs

**Responsive Design:**
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Touch targets appropriate size on mobile
- [ ] Navigation works on all screen sizes

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announces content
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Color contrast sufficient

---

### 14.2 Automated Testing (Future)

**Unit Tests:**
- Component rendering
- Form validation logic
- State management

**Integration Tests:**
- API integration
- Form submissions
- Navigation flows

**End-to-End Tests:**
- Complete user journeys
- Authentication flows
- Template creation and workout logging

---

## 15. Deployment and Monitoring

### 15.1 Deployment Checklist

**Pre-Deployment:**
- [ ] Environment variables configured
- [ ] Supabase Auth configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] HTTPS configured
- [ ] CORS configured

**Post-Deployment:**
- [ ] Test authentication
- [ ] Test all core features
- [ ] Verify API endpoints
- [ ] Check error handling
- [ ] Monitor performance

---

### 15.2 Monitoring (Future)

**Metrics to Track:**
- Page load times
- API response times
- Error rates
- User engagement (templates created, workouts logged)
- Session duration

**Error Tracking:**
- Client-side errors (Sentry or similar)
- API errors
- Authentication failures

---

## 16. Documentation Requirements

### 16.1 User Documentation

**Help Content:**
- How to create a template
- How to log a workout
- How personal bests work
- FAQ section

**In-App Guidance:**
- Tooltips for complex features
- Empty state messages with guidance
- Error messages with solutions

---

### 16.2 Developer Documentation

**Code Documentation:**
- Component prop types
- API integration patterns
- State management patterns
- Styling conventions

**Architecture Documentation:**
- This UI architecture document
- API plan
- Database schema
- Deployment guide

---

## Appendix A: User Story to UI Mapping

| User Story | Primary View | Secondary View | Components |
|------------|-------------|----------------|------------|
| US-001: User Sign-Up | Sign-Up View | - | SignUpForm |
| US-002: User Login | Login View | - | LoginForm |
| US-003: User Logout | All Views (Header) | - | Header, LogoutButton |
| US-004: Session Management | All Protected Views | - | Middleware |
| US-005: View Exercise Library | Create Template View | - | ExerciseSelector |
| US-006: Search Exercises | Create Template View | - | ExerciseSelector |
| US-007: Create Workout Template | Create Template View | - | TemplateForm, ExerciseSelector |
| US-008: View All Templates | Templates List View | - | TemplateList, TemplateCard |
| US-009: View Template Details | Template Details View | - | TemplateDetails |
| US-010: Delete Workout Template | Template Details View | Templates List View | ConfirmDialog |
| US-011: Start Workout from Template | Templates List/Details | Active Workout View | WorkoutForm |
| US-012: Log Workout Data | Active Workout View | - | WorkoutForm, ExerciseInput |
| US-013: Complete Workout | Active Workout View | - | WorkoutForm |
| US-014: Cancel Workout | Active Workout View | - | ConfirmDialog |
| US-015: View Personal Bests | Personal Bests View (Future) | - | PersonalBestList |
| US-016: Automatic Personal Best Update | Active Workout View | - | API-handled |
| US-017: Personal Best as Default Weight | Create Template View | - | TemplateForm |
| US-018: Input Validation (Sets/Reps) | All Forms | - | Form validation |
| US-019: Input Validation (Weight) | All Forms | - | Form validation |
| US-020: Confirmation for Destructive Actions | All Views | - | ConfirmDialog |
| US-021: Primary Navigation | All Authenticated Views | - | Header, Navigation |
| US-022: Responsive Mobile Experience | All Views | - | Responsive layout |
| US-023: User Data Isolation | All Views | - | RLS, API |
| US-024: Session Security | All Views | - | Supabase Auth |

---

## Appendix B: API Endpoint to UI View Mapping

| API Endpoint | HTTP Method | UI View | Purpose |
|--------------|-------------|---------|---------|
| /api/exercises | GET | Create Template View | Fetch exercises for selection |
| /api/templates | GET | Templates List View | Fetch all user templates |
| /api/templates/:id | GET | Template Details View | Fetch single template details |
| /api/templates | POST | Create Template View | Create new template |
| /api/templates/:id | DELETE | Template Details View | Delete template (future) |
| /api/workouts/prefill/:template_id | GET | Active Workout View | Prefill workout form |
| /api/workouts | POST | Active Workout View | Save completed workout |
| /api/workouts | GET | Workout History View (future) | Fetch workout history |
| /api/workouts/:id | GET | Workout Details View (future) | Fetch single workout details |
| /api/personal-bests | GET | Personal Bests View (future) | Fetch all personal bests |

---

## Appendix C: Validation Rules Summary

| Field | Min | Max | Type | Required | Notes |
|-------|-----|-----|------|----------|-------|
| Template Name | 1 char | 60 chars | String | Yes | Unique per user |
| Sets | 1 | 99 | Integer | Yes | No negatives |
| Reps | 1 | 99 | Integer | Yes | No negatives |
| Weight | 0 | 999.99 | Decimal | Yes | No negatives, 1 decimal place |
| Email | - | - | Email | Yes | Valid email format |
| Password | - | - | String | Yes | Supabase default rules |
| Exercise Selection | 1 | - | Array | Yes | Min 1 exercise per template |
| Set Index | 1 | - | Integer | Yes | Unique within workout exercise |

---

## Appendix D: Component Hierarchy

```
App
├── AuthLayout
│   ├── LoginView
│   │   └── LoginForm
│   └── SignUpView
│       └── SignUpForm
└── AppLayout
    ├── Header
    │   ├── Navigation
    │   └── UserMenu
    ├── TemplatesListView
    │   ├── PageHeader
    │   ├── TemplateList
    │   │   └── TemplateCard (multiple)
    │   └── EmptyState
    ├── TemplateDetailsView
    │   ├── TemplateHeader
    │   ├── ExerciseList
    │   └── ActionButtons
    ├── CreateTemplateView
    │   └── TemplateForm
    │       ├── ExerciseSelector
    │       └── ExerciseInput (multiple)
    ├── ActiveWorkoutView
    │   └── WorkoutForm
    │       ├── WorkoutHeader
    │       └── ExerciseInput (multiple)
    └── WorkoutHistoryView (future)
        └── WorkoutList
            └── WorkoutCard (multiple)
```

---

## Appendix E: Glossary

**Terms:**
- **Template**: Predefined workout structure with exercises, sets, reps, and default weights
- **Workout**: Completed training session with actual logged results
- **Exercise**: Individual movement (e.g., Bench Press, Squat)
- **Set**: Single round of an exercise with specific reps and weight
- **Personal Best (PB)**: Highest weight logged for an exercise
- **Prefill**: Auto-populate workout form with data from last workout
- **RLS**: Row-Level Security (database-level authorization)
- **MVP**: Minimum Viable Product
- **UX**: User Experience
- **WCAG**: Web Content Accessibility Guidelines
- **ARIA**: Accessible Rich Internet Applications

---

**Document Version**: 1.0  
**Last Updated**: January 31, 2025  
**Status**: Final MVP Architecture
