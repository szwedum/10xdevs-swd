# View Implementation Plan – Create Template View

## 1. Overview

The Create Template View allows authenticated users to create new workout templates by entering a template name, selecting exercises from a searchable library, and configuring sets, reps, and default weight for each exercise. The view enforces comprehensive validation, supports exercise reordering, and provides an accessible, mobile-friendly interface. Upon successful creation, users are redirected to the templates list view.

## 2. View Routing

- **Path**: `/templates/new`
- **Guard**: Requires valid Supabase Auth session; redirect to `/login` if session invalid or missing.
- **Navigation**: Accessible via "Create Template" button from `/templates` list view.

## 3. Component Structure

```
CreateTemplatePage (Astro - /pages/templates/new.astro)
├─ <NavigationHeader />
└─ <CreateTemplateForm /> (React)
    ├─ <TemplateNameInput />
    ├─ <ExerciseSelector />
    ├─ <TemplateExerciseList />
    │   └─ <TemplateExerciseItem /> (repeated for each added exercise)
    │       ├─ Exercise name display (read-only)
    │       ├─ Sets input field
    │       ├─ Reps input field
    │       ├─ Default weight input field
    │       ├─ Remove exercise button
    │       └─ Position controls (up/down buttons)
    └─ <FormActions />
        ├─ Save Template button (primary)
        └─ Cancel button (secondary)
```

## 4. Component Details

### NavigationHeader
- **Component description**: Shared top navigation bar displaying app logo, primary navigation links (Templates, Workout Logging), and Logout button. Highlights the current active section.
- **Main elements**: `<header>` with `<nav>` containing `<ul>` of navigation links and logout `<button>`.
- **Handled interactions**: 
  - Click navigation link → Navigate to respective section
  - Click Logout → Sign out via Supabase Auth, redirect to `/login`
- **Handled validation**: None.
- **Types**: None (shared component).
- **Props**: `{ currentPath: string }` to highlight active navigation item.

### CreateTemplateForm
- **Component description**: Main form orchestrator that manages overall template creation state, coordinates child components, handles form submission, and manages API interactions. Renders template name input, exercise selector, list of added exercises, and form action buttons.
- **Main elements**: 
  - `<form>` wrapper with `onSubmit` handler
  - Container `<div>` sections for each form area
  - Conditional error message display area
  - Loading overlay during submission
- **Handled interactions**:
  - Form submission → Validate all fields, call POST /api/templates, handle response
  - Cancel action → Navigate back to `/templates` without saving
  - Add exercise → Update exercises array with new item
  - Remove exercise → Remove from array, recalculate positions
  - Reorder exercise → Swap positions in array
- **Handled validation**:
  - Template name: Required, 1-60 characters
  - Exercises array: Minimum 1 exercise required
  - Overall form validity before enabling save button
  - Aggregate validation errors from all child components
- **Types**: `CreateTemplateFormState`, `CreateTemplateCommand`, `TemplateExerciseFormItem`, `ExerciseDTO`, `ValidationErrorResponseDTO`, `ErrorResponseDTO`.
- **Props**: None (top-level form component).

### TemplateNameInput
- **Component description**: Labeled text input field for entering the workout template name. Displays validation errors inline and auto-focuses on component mount.
- **Main elements**:
  - `<div>` container
  - `<label>` with required indicator (*)
  - `<input type="text">` with maxLength attribute
  - `<span>` for error message with `aria-live="polite"`
- **Handled interactions**:
  - onChange → Update parent state with new value
  - onBlur → Trigger validation, display errors
- **Handled validation**:
  - Required field: Must not be empty
  - Maximum length: 60 characters
  - Display error message: "Template name is required" or "Maximum 60 characters allowed"
- **Types**: `TemplateNameInputProps`.
- **Props**:
  ```typescript
  interface TemplateNameInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    autoFocus?: boolean;
  }
  ```

### ExerciseSelector
- **Component description**: Searchable dropdown component for selecting exercises from the library. Features real-time search filtering, displays exercise names, and prevents duplicate selections (optional). Implemented using shadcn/ui Combobox or Select component.
- **Main elements**:
  - `<div>` container with label
  - Search `<input>` field for filtering
  - Dropdown list `<ul>` of available exercises
  - "Add Exercise" button or auto-add on selection
- **Handled interactions**:
  - Search input onChange → Filter exercise list (debounced 300ms)
  - Select exercise → Call parent's onSelect handler with selected exercise
  - Clear search after selection
- **Handled validation**: None (selection only, no input validation).
- **Types**: `ExerciseSelectorProps`, `ExerciseDTO`, `ExerciseListResponseDTO`.
- **Props**:
  ```typescript
  interface ExerciseSelectorProps {
    onSelect: (exercise: ExerciseDTO) => void;
    selectedExerciseIds: string[]; // For preventing duplicates
    disabled?: boolean;
  }
  ```

### TemplateExerciseList
- **Component description**: Container component that renders the list of added exercises. Manages the collection of `TemplateExerciseItem` components and coordinates update/remove/reorder actions. Displays empty state message if no exercises added.
- **Main elements**:
  - `<div>` or `<section>` container with heading
  - `<ul>` list of exercise items
  - Conditional empty state message
- **Handled interactions**:
  - Delegates all interactions to child `TemplateExerciseItem` components
  - Coordinates position changes for reordering
- **Handled validation**: None (delegates to child components).
- **Types**: `TemplateExerciseListProps`, `TemplateExerciseFormItem`.
- **Props**:
  ```typescript
  interface TemplateExerciseListProps {
    exercises: TemplateExerciseFormItem[];
    onUpdate: (id: string, field: 'sets' | 'reps' | 'default_weight', value: number) => void;
    onRemove: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
  }
  ```

### TemplateExerciseItem
- **Component description**: Individual exercise configuration row displaying exercise name (read-only) and editable input fields for sets, reps, and default weight. Includes remove button and position reordering controls (up/down arrows). Displays inline validation errors for each field.
- **Main elements**:
  - `<li>` wrapper with card styling
  - Exercise name `<span>` or `<p>` (read-only)
  - Three number input fields: sets, reps, default_weight
  - Each input has associated `<label>` and error `<span>`
  - Remove button (icon button)
  - Position control buttons (up/down arrows)
- **Handled interactions**:
  - Input onChange → Update parent state via onUpdate callback
  - Input onBlur → Trigger field validation
  - Remove button click → Call onRemove callback
  - Move up button click → Call onMoveUp callback
  - Move down button click → Call onMoveDown callback
- **Handled validation**:
  - **Sets**: 
    - Required field
    - Integer between 1 and 99
    - No negative values
    - Error messages: "Sets must be between 1 and 99"
  - **Reps**:
    - Required field
    - Integer between 1 and 99
    - No negative values
    - Error messages: "Reps must be between 1 and 99"
  - **Default Weight**:
    - Required field
    - Number between 0 and 999.99
    - No negative values
    - Maximum 2 decimal places
    - Error messages: "Weight must be between 0 and 999.99 kg"
- **Types**: `TemplateExerciseItemProps`, `TemplateExerciseFormItem`.
- **Props**:
  ```typescript
  interface TemplateExerciseItemProps {
    exercise: TemplateExerciseFormItem;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onUpdate: (field: 'sets' | 'reps' | 'default_weight', value: number) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
  }
  ```

### FormActions
- **Component description**: Form action buttons section containing primary "Save Template" button and secondary "Cancel" button. Manages loading state during submission and disables save button when form is invalid.
- **Main elements**:
  - `<div>` container with flex layout
  - Primary `<button>` for Save (shadcn/ui Button component)
  - Secondary `<button>` for Cancel
  - Loading spinner overlay on save button when submitting
- **Handled interactions**:
  - Save button click → Trigger form submission via onSave callback
  - Cancel button click → Navigate back via onCancel callback
- **Handled validation**: 
  - Disable save button when `isValid === false`
  - Disable both buttons when `isLoading === true`
- **Types**: `FormActionsProps`.
- **Props**:
  ```typescript
  interface FormActionsProps {
    onSave: () => void;
    onCancel: () => void;
    isLoading: boolean;
    isValid: boolean;
  }
  ```

## 5. Types

### Existing DTOs (from `@/src/types.ts`)
- **ExerciseDTO**: Exercise entity from database
  ```typescript
  interface ExerciseDTO {
    id: string;
    name: string;
    created_by: string | null;
    created_at: string;
  }
  ```

- **ExerciseListResponseDTO**: Paginated exercise list response
  ```typescript
  interface ExerciseListResponseDTO {
    data: ExerciseDTO[];
    pagination: PaginationDTO;
  }
  ```

- **CreateTemplateCommand**: API request payload for creating template
  ```typescript
  interface CreateTemplateCommand {
    name: string;
    exercises: CreateTemplateExerciseCommand[];
  }
  ```

- **CreateTemplateExerciseCommand**: Exercise configuration within template
  ```typescript
  interface CreateTemplateExerciseCommand {
    exercise_id: string;
    sets: number;
    reps: number;
    default_weight?: number | null;
    position: number;
  }
  ```

- **ValidationErrorResponseDTO**: API validation error response
  ```typescript
  interface ValidationErrorResponseDTO {
    error: string;
    details: ValidationErrorDetail[];
  }
  
  interface ValidationErrorDetail {
    field: string;
    message: string;
  }
  ```

- **ErrorResponseDTO**: Generic API error response
  ```typescript
  interface ErrorResponseDTO {
    error: string;
    message: string;
  }
  ```

### New ViewModel Types (to be created)

- **TemplateExerciseFormItem**: Form state for a single exercise in the template
  ```typescript
  interface TemplateExerciseFormItem {
    id: string; // Temporary client-side ID (crypto.randomUUID()) for React keys
    exercise_id: string; // UUID from ExerciseDTO
    exercise_name: string; // Display name from ExerciseDTO
    sets: number; // Default: 3
    reps: number; // Default: 10
    default_weight: number; // Default: 0
    position: number; // 0-indexed position in list
    errors: {
      sets?: string;
      reps?: string;
      default_weight?: string;
    };
  }
  ```

- **CreateTemplateFormState**: Overall form state
  ```typescript
  interface CreateTemplateFormState {
    name: string; // Template name
    nameError?: string; // Validation error for name field
    exercises: TemplateExerciseFormItem[]; // Array of added exercises
    isSubmitting: boolean; // Loading state during API call
    submitError?: string; // Global error message from API
  }
  ```

- **TemplateNameInputProps**: Props for TemplateNameInput component
  ```typescript
  interface TemplateNameInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    autoFocus?: boolean;
  }
  ```

- **ExerciseSelectorProps**: Props for ExerciseSelector component
  ```typescript
  interface ExerciseSelectorProps {
    onSelect: (exercise: ExerciseDTO) => void;
    selectedExerciseIds: string[]; // To prevent duplicate selections
    disabled?: boolean;
  }
  ```

- **TemplateExerciseListProps**: Props for TemplateExerciseList component
  ```typescript
  interface TemplateExerciseListProps {
    exercises: TemplateExerciseFormItem[];
    onUpdate: (id: string, field: 'sets' | 'reps' | 'default_weight', value: number) => void;
    onRemove: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
  }
  ```

- **TemplateExerciseItemProps**: Props for TemplateExerciseItem component
  ```typescript
  interface TemplateExerciseItemProps {
    exercise: TemplateExerciseFormItem;
    canMoveUp: boolean; // False for first item
    canMoveDown: boolean; // False for last item
    onUpdate: (field: 'sets' | 'reps' | 'default_weight', value: number) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
  }
  ```

- **FormActionsProps**: Props for FormActions component
  ```typescript
  interface FormActionsProps {
    onSave: () => void;
    onCancel: () => void;
    isLoading: boolean;
    isValid: boolean;
  }
  ```

## 6. State Management

State is managed locally within the `CreateTemplateForm` React component using React hooks (`useState`). No global state management (Redux, Zustand, etc.) is required for this view.

### State Variables

1. **formState: CreateTemplateFormState**
   - Manages template name, validation errors, exercises array, submission state
   - Updated via setter functions for each field

2. **exercises: ExerciseDTO[]**
   - Available exercises fetched from API
   - Populated via `useExercises` custom hook

3. **searchQuery: string**
   - Current search filter for exercise selector
   - Debounced to prevent excessive filtering

4. **isLoadingExercises: boolean**
   - Loading state for exercise API call
   - Managed by `useExercises` hook

### Custom Hooks

#### useExercises
Located in `src/lib/hooks/useExercises.ts`:
```typescript
interface UseExercisesParams {
  search?: string;
}

interface UseExercisesResult {
  exercises: ExerciseDTO[];
  loading: boolean;
  error: string | null;
}

function useExercises(params?: UseExercisesParams): UseExercisesResult
```

**Purpose**: Fetches exercises from GET /api/exercises endpoint with optional search filtering. Handles loading and error states.

**Implementation**:
- Uses `useEffect` to fetch on mount and when search param changes
- Debounces search queries (300ms) to reduce API calls
- Returns exercises array, loading boolean, and error string

#### useCreateTemplate
Located in `src/lib/hooks/useCreateTemplate.ts`:
```typescript
interface UseCreateTemplateResult {
  createTemplate: (data: CreateTemplateCommand) => Promise<TemplateDetailDTO>;
  isLoading: boolean;
  error: string | null;
}

function useCreateTemplate(): UseCreateTemplateResult
```

**Purpose**: Handles template creation via POST /api/templates endpoint. Manages loading state and error handling.

**Implementation**:
- Exposes `createTemplate` function that accepts `CreateTemplateCommand`
- Returns promise that resolves with created template or rejects with error
- Manages `isLoading` and `error` state internally

### State Update Patterns

- **Add Exercise**: Push new `TemplateExerciseFormItem` to exercises array with auto-generated ID and position
- **Remove Exercise**: Filter out by ID, recalculate positions (0, 1, 2, ...)
- **Update Exercise Field**: Map over exercises array, update matching item
- **Move Exercise**: Swap array elements at indices, recalculate positions
- **Validate Field**: Update errors object within specific exercise item
- **Submit Form**: Transform `CreateTemplateFormState` to `CreateTemplateCommand`, call API

## 7. API Integration

### GET /api/exercises

**Purpose**: Retrieve list of available exercises with optional search filtering.

**Request**:
- Method: `GET`
- URL: `/api/exercises?search={query}&limit=100&offset=0`
- Headers: `Authorization: Bearer {access_token}` (from Supabase session)
- Query Parameters:
  - `search` (optional, string): Filter exercises by name (case-insensitive)
  - `limit` (optional, integer, default: 100): Maximum results
  - `offset` (optional, integer, default: 0): Pagination offset

**Response Type**: `ExerciseListResponseDTO`
```typescript
{
  data: ExerciseDTO[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}
```

**Error Responses**:
- `400 Bad Request`: Invalid query parameters (ValidationErrorResponseDTO)
- `401 Unauthorized`: Invalid or missing auth token
- `500 Internal Server Error`: Server error (ErrorResponseDTO)

**Frontend Integration**:
- Called via `useExercises` hook on component mount
- Re-called when search query changes (debounced)
- Results stored in component state and passed to `ExerciseSelector`

### POST /api/templates

**Purpose**: Create a new workout template.

**Request**:
- Method: `POST`
- URL: `/api/templates`
- Headers: 
  - `Authorization: Bearer {access_token}`
  - `Content-Type: application/json`
- Body Type: `CreateTemplateCommand`
```typescript
{
  name: string; // 1-60 characters
  exercises: [
    {
      exercise_id: string; // UUID
      sets: number; // 1-99
      reps: number; // 1-99
      default_weight: number; // 0-999.99, optional
      position: number; // 0-indexed
    }
  ];
}
```

**Response Type**: `TemplateDetailDTO` (201 Created)
```typescript
{
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  exercises: TemplateExerciseDTO[];
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors (ValidationErrorResponseDTO)
  - Invalid name length
  - Invalid sets/reps/weight values
  - Empty exercises array
  - Duplicate positions
- `401 Unauthorized`: Invalid or missing auth token
- `409 Conflict`: Template name already exists for user
- `500 Internal Server Error`: Server error (ErrorResponseDTO)

**Frontend Integration**:
- Called via `useCreateTemplate` hook on form submission
- Transform `CreateTemplateFormState` to `CreateTemplateCommand`:
  - Map exercises array to remove client-side fields (id, exercise_name, errors)
  - Ensure positions are sequential (0, 1, 2, ...)
- Handle success: Show toast message, redirect to `/templates`
- Handle validation errors: Map API field errors to form field errors
- Handle other errors: Display global error message

## 8. User Interactions

### Page Load
1. User navigates to `/templates/new`
2. System verifies Supabase Auth session (redirect to `/login` if invalid)
3. Page renders with auto-focus on template name input
4. `useExercises` hook fetches exercises from API
5. Exercise selector displays loading state, then populates with exercises

### Enter Template Name
1. User types in template name input field
2. `onChange` handler updates `formState.name`
3. Character count updates (optional visual feedback)
4. On blur, validation runs:
   - If empty: Set `nameError` to "Template name is required"
   - If > 60 chars: Set `nameError` to "Maximum 60 characters allowed"
   - If valid: Clear `nameError`

### Search Exercises
1. User types in exercise search field
2. `onChange` handler updates `searchQuery` state (debounced 300ms)
3. Exercise list filters in real-time based on search query
4. If no results, display "No exercises found" message

### Select Exercise
1. User clicks exercise from dropdown or presses Enter
2. `onSelect` handler called with selected `ExerciseDTO`
3. New `TemplateExerciseFormItem` created:
   - `id`: Generated via `crypto.randomUUID()`
   - `exercise_id`: From selected exercise
   - `exercise_name`: From selected exercise
   - `sets`: Default 3
   - `reps`: Default 10
   - `default_weight`: Default 0 (or personal best if available)
   - `position`: Current array length
   - `errors`: Empty object
4. Item added to `formState.exercises` array
5. Visual feedback: Exercise appears in list below
6. Search field clears
7. Focus moves to first input of newly added exercise (optional)

### Configure Exercise (Sets/Reps/Weight)
1. User enters value in sets, reps, or weight input
2. `onChange` handler updates corresponding field in exercise item
3. On blur, validation runs:
   - **Sets**: Check 1-99 range, show error if invalid
   - **Reps**: Check 1-99 range, show error if invalid
   - **Weight**: Check 0-999.99 range, show error if invalid
4. Error message displays below input field if validation fails
5. Save button remains disabled if any validation errors exist

### Remove Exercise
1. User clicks remove button (trash icon) on exercise item
2. `onRemove` handler called with exercise ID
3. Exercise filtered out of `formState.exercises` array
4. Remaining exercises' positions recalculated (0, 1, 2, ...)
5. Visual feedback: Exercise item removed with animation (optional)

### Reorder Exercise (Move Up/Down)
1. User clicks up or down arrow button on exercise item
2. `onMoveUp` or `onMoveDown` handler called with exercise ID
3. Exercise swapped with adjacent item in array
4. Positions recalculated for both items
5. Visual feedback: Items swap positions with animation (optional)

### Save Template
1. User clicks "Save Template" button
2. Client-side validation runs:
   - Validate template name (required, 1-60 chars)
   - Validate at least 1 exercise exists
   - Validate all exercise fields (sets, reps, weight)
3. If validation fails:
   - Display inline error messages
   - Scroll to first error (optional)
   - Keep save button disabled
4. If validation passes:
   - Transform form state to `CreateTemplateCommand`
   - Set `isSubmitting` to true (disable buttons, show loading)
   - Call POST /api/templates via `useCreateTemplate` hook
5. On success (201):
   - Display success toast: "Template created successfully"
   - Redirect to `/templates` after 1 second
6. On validation error (400):
   - Map API field errors to form errors
   - Display inline error messages
   - Set `isSubmitting` to false
7. On other error (401, 409, 500):
   - Display global error message
   - Set `isSubmitting` to false
   - Allow user to retry

### Cancel
1. User clicks "Cancel" button
2. Navigate back to `/templates` without saving
3. No confirmation dialog required (form data discarded)

## 9. Conditions and Validation

### Client-Side Validation Rules

#### Template Name
- **Component**: `TemplateNameInput`
- **Conditions**:
  - Required: Must not be empty
  - Max length: 60 characters
- **Validation Timing**: On blur and on submit
- **Error Messages**:
  - Empty: "Template name is required"
  - Too long: "Maximum 60 characters allowed"
- **UI Impact**: Error message displays below input, input border turns red

#### Exercises Array
- **Component**: `CreateTemplateForm`
- **Conditions**:
  - Minimum 1 exercise required
- **Validation Timing**: Continuous (affects save button state)
- **Error Messages**: "Add at least one exercise to create a template" (displayed near exercise selector)
- **UI Impact**: Save button disabled when exercises.length === 0

#### Sets (per exercise)
- **Component**: `TemplateExerciseItem`
- **Conditions**:
  - Required: Must not be empty
  - Type: Integer
  - Range: 1 to 99
  - No negative values
- **Validation Timing**: On blur and on submit
- **Error Messages**: "Sets must be between 1 and 99"
- **UI Impact**: Error message below input, input border turns red, save button disabled

#### Reps (per exercise)
- **Component**: `TemplateExerciseItem`
- **Conditions**:
  - Required: Must not be empty
  - Type: Integer
  - Range: 1 to 99
  - No negative values
- **Validation Timing**: On blur and on submit
- **Error Messages**: "Reps must be between 1 and 99"
- **UI Impact**: Error message below input, input border turns red, save button disabled

#### Default Weight (per exercise)
- **Component**: `TemplateExerciseItem`
- **Conditions**:
  - Required: Must not be empty
  - Type: Number (decimal allowed)
  - Range: 0 to 999.99
  - No negative values
  - Maximum 2 decimal places
- **Validation Timing**: On blur and on submit
- **Error Messages**: "Weight must be between 0 and 999.99 kg"
- **UI Impact**: Error message below input, input border turns red, save button disabled

#### Position (per exercise)
- **Component**: `CreateTemplateForm` (auto-managed)
- **Conditions**:
  - Unique within template
  - Sequential (0, 1, 2, ...)
- **Validation Timing**: Automatic on add/remove/reorder
- **Error Messages**: None (handled automatically)
- **UI Impact**: None (transparent to user)

### Form-Level Validation

**Save Button State**:
- Disabled when:
  - Template name is empty or invalid
  - Exercises array is empty
  - Any exercise has validation errors
  - Form is submitting (`isSubmitting === true`)
- Enabled when:
  - All fields are valid
  - At least 1 exercise exists
  - Not currently submitting

### Server-Side Validation

The API performs additional validation and returns errors via `ValidationErrorResponseDTO`. Frontend maps these errors to form fields:

**Mapping Strategy**:
- Field path format: `"name"`, `"exercises[0].sets"`, `"exercises[1].reps"`
- Parse field path to identify component and field
- Update corresponding error state in form
- Display inline error message

**Example**:
```typescript
// API response
{
  error: "Validation Error",
  details: [
    { field: "name", message: "Template name is required" },
    { field: "exercises[0].sets", message: "Sets must be between 1 and 99" }
  ]
}

// Frontend mapping
formState.nameError = "Template name is required";
formState.exercises[0].errors.sets = "Sets must be between 1 and 99";
```

## 10. Error Handling

### Client-Side Errors

#### Empty Template Name
- **Trigger**: User blurs name input without entering value
- **Handling**: Display "Template name is required" below input, disable save button
- **Recovery**: User enters valid name, error clears on blur

#### Template Name Too Long
- **Trigger**: User enters > 60 characters
- **Handling**: Display "Maximum 60 characters allowed" below input, disable save button
- **Recovery**: User reduces length, error clears on blur

#### No Exercises Added
- **Trigger**: User attempts to save without adding exercises
- **Handling**: Display message "Add at least one exercise to create a template", disable save button
- **Recovery**: User adds exercise, message disappears, save button enables

#### Invalid Sets/Reps/Weight
- **Trigger**: User enters value outside valid range
- **Handling**: Display specific error message below input, disable save button
- **Recovery**: User corrects value, error clears on blur

#### Exercise API Load Failure
- **Trigger**: GET /api/exercises returns error
- **Handling**: Display error message "Failed to load exercises. Please try again.", disable exercise selector
- **Recovery**: Provide "Retry" button to refetch exercises

### API Errors

#### 400 Bad Request (Validation Error)
- **Trigger**: POST /api/templates returns validation errors
- **Handling**: 
  - Parse `ValidationErrorResponseDTO`
  - Map field errors to form fields
  - Display inline error messages
  - Keep form editable for corrections
- **Recovery**: User corrects errors, resubmits form

#### 401 Unauthorized
- **Trigger**: Auth token invalid or missing
- **Handling**: Redirect to `/login` page
- **Recovery**: User logs in again

#### 409 Conflict
- **Trigger**: Template name already exists for user
- **Handling**: Display error "A template with this name already exists" below name input
- **Recovery**: User changes template name, resubmits

#### 500 Internal Server Error
- **Trigger**: Server error during template creation
- **Handling**: Display global error message "An error occurred. Please try again."
- **Recovery**: Provide "Retry" button to resubmit form

#### Network Error
- **Trigger**: Network connection lost during API call
- **Handling**: Display error "Network error. Check your connection and try again."
- **Recovery**: Provide "Retry" button, user checks connection and resubmits

### Edge Cases

#### Duplicate Exercise Selection
- **Trigger**: User attempts to add same exercise twice (optional feature)
- **Handling**: Filter already-selected exercises from dropdown, or show message "Exercise already added"
- **Recovery**: User selects different exercise

#### Rapid Add/Remove Actions
- **Trigger**: User quickly adds and removes exercises
- **Handling**: Ensure state updates are batched correctly, positions recalculated accurately
- **Recovery**: Automatic (no user action needed)

#### Navigation During Submission
- **Trigger**: User navigates away while form is submitting
- **Handling**: No special handling in MVP (form submission may complete in background)
- **Recovery**: None (acceptable for MVP)

#### Browser Back Button
- **Trigger**: User clicks browser back button
- **Handling**: Navigate to previous page, form data lost (no persistence in MVP)
- **Recovery**: None (user must re-enter data)

## 11. Implementation Steps

### Step 1: Create Astro Page with Auth Guard
- Create `/src/pages/templates/new.astro`
- Add Supabase Auth session check
- Redirect to `/login` if session invalid
- Import and render `NavigationHeader` component
- Create placeholder for `CreateTemplateForm` React component

### Step 2: Define TypeScript Types
- Create `/src/components/templates/types.ts`
- Define all ViewModel types:
  - `TemplateExerciseFormItem`
  - `CreateTemplateFormState`
  - `TemplateNameInputProps`
  - `ExerciseSelectorProps`
  - `TemplateExerciseListProps`
  - `TemplateExerciseItemProps`
  - `FormActionsProps`

### Step 3: Create Custom Hooks

#### useExercises Hook
- Create `/src/lib/hooks/useExercises.ts`
- Implement fetch logic for GET /api/exercises
- Add search parameter support
- Implement debouncing (300ms)
- Handle loading and error states
- Return `{ exercises, loading, error }`

#### useCreateTemplate Hook
- Create `/src/lib/hooks/useCreateTemplate.ts`
- Implement POST /api/templates logic
- Handle loading and error states
- Return `{ createTemplate, isLoading, error }`

### Step 4: Create Validation Utilities
- Create `/src/lib/validation/template-form.validation.ts`
- Implement validation functions:
  - `validateTemplateName(name: string): string | undefined`
  - `validateSets(sets: number): string | undefined`
  - `validateReps(reps: number): string | undefined`
  - `validateWeight(weight: number): string | undefined`
  - `validateForm(state: CreateTemplateFormState): boolean`

### Step 5: Build Child Components

#### TemplateNameInput Component
- Create `/src/components/templates/TemplateNameInput.tsx`
- Implement controlled input with label
- Add maxLength attribute (60)
- Add autoFocus support
- Display error message with aria-describedby
- Style with Tailwind CSS

#### ExerciseSelector Component
- Create `/src/components/templates/ExerciseSelector.tsx`
- Implement using shadcn/ui Combobox or Select
- Add search input with debouncing
- Filter exercises based on search query
- Prevent duplicate selections using selectedExerciseIds
- Handle loading and empty states
- Style with Tailwind CSS

#### TemplateExerciseItem Component
- Create `/src/components/templates/TemplateExerciseItem.tsx`
- Implement card layout with shadcn/ui Card component
- Add read-only exercise name display
- Add three number inputs (sets, reps, weight) with labels
- Add validation on blur for each input
- Display inline error messages
- Add remove button (trash icon from Lucide)
- Add up/down buttons for reordering (arrow icons)
- Disable up button if `canMoveUp === false`
- Disable down button if `canMoveDown === false`
- Style with Tailwind CSS
- Ensure mobile-friendly touch targets

#### TemplateExerciseList Component
- Create `/src/components/templates/TemplateExerciseList.tsx`
- Implement container with heading
- Map over exercises array to render `TemplateExerciseItem` components
- Pass appropriate props to each item (canMoveUp, canMoveDown)
- Display empty state message if no exercises
- Style with Tailwind CSS

#### FormActions Component
- Create `/src/components/templates/FormActions.tsx`
- Implement button group with shadcn/ui Button components
- Add "Save Template" primary button
- Add "Cancel" secondary button
- Show loading spinner on save button when `isLoading === true`
- Disable save button when `isValid === false` or `isLoading === true`
- Disable cancel button when `isLoading === true`
- Style with Tailwind CSS

### Step 6: Build Main Form Component

#### CreateTemplateForm Component
- Create `/src/components/templates/CreateTemplateForm.tsx`
- Initialize state with `useState<CreateTemplateFormState>`
- Integrate `useExercises` hook for fetching exercises
- Integrate `useCreateTemplate` hook for submission
- Implement form submission handler:
  - Validate all fields
  - Transform state to `CreateTemplateCommand`
  - Call `createTemplate` function
  - Handle success: Show toast, redirect to `/templates`
  - Handle errors: Map to form fields or display global error
- Implement exercise management handlers:
  - `handleAddExercise`: Add new exercise to array
  - `handleRemoveExercise`: Remove by ID, recalculate positions
  - `handleUpdateExercise`: Update field value
  - `handleMoveUp`: Swap with previous item
  - `handleMoveDown`: Swap with next item
- Implement validation handlers:
  - `validateName`: Check name on blur
  - `validateExerciseField`: Check sets/reps/weight on blur
- Compose child components with appropriate props
- Style with Tailwind CSS

### Step 7: Integrate Form into Astro Page
- Import `CreateTemplateForm` in `/src/pages/templates/new.astro`
- Render as Astro island with `client:load` directive
- Pass any necessary props (none required)
- Ensure proper layout and spacing

### Step 8: Implement Accessibility Features
- Add semantic HTML elements (`<form>`, `<label>`, `<fieldset>`)
- Associate labels with inputs using `htmlFor` and `id`
- Add `aria-describedby` to inputs with error messages
- Add `aria-invalid` to inputs with errors
- Add `aria-live="polite"` to error message containers
- Ensure logical tab order through form
- Add keyboard support for exercise selector (arrow keys, Enter, Escape)
- Manage focus when adding/removing exercises
- Add screen reader announcements for dynamic changes
- Test with keyboard navigation only

### Step 9: Style with Tailwind CSS
- Apply responsive layout (mobile-first approach)
- Use shadcn/ui components for consistent styling
- Add hover states for buttons and interactive elements
- Add focus states with visible outlines
- Ensure touch targets are at least 44x44px on mobile
- Add loading states with spinners or skeleton screens
- Add smooth transitions for add/remove animations (optional)
- Test on various screen sizes (mobile, tablet, desktop)

### Step 10: Add Error Handling and Toast Notifications
- Install/configure toast library (e.g., sonner, react-hot-toast)
- Add success toast on template creation
- Add error toast for API failures
- Add inline error messages for validation
- Ensure errors are accessible (aria-live, aria-describedby)

### Step 11: Testing
- **Manual Testing**:
  - Load page, verify auth guard works
  - Verify auto-focus on template name
  - Test template name validation (empty, too long)
  - Test exercise search filtering
  - Test adding exercises (verify defaults)
  - Test configuring exercises (sets, reps, weight)
  - Test validation for each field (min, max, negative)
  - Test removing exercises
  - Test reordering exercises (up/down)
  - Test save with valid data (verify redirect)
  - Test save with invalid data (verify errors)
  - Test cancel button (verify navigation)
  - Test API error scenarios (401, 500)
  - Test mobile responsiveness
  - Test keyboard navigation
  - Test screen reader compatibility

- **Edge Cases**:
  - Add and immediately remove exercise
  - Rapid reordering
  - Submit with empty exercises array
  - Submit during API call (verify button disabled)
  - Network error during submission

### Step 12: Code Quality and Documentation
- Run ESLint and fix any issues
- Run Prettier to format code
- Add JSDoc comments to complex functions
- Add inline comments for non-obvious logic
- Ensure all TypeScript types are properly defined
- Remove console.logs and debug code
- Commit changes with descriptive commit message

### Step 13: Final Review
- Review implementation against PRD requirements
- Verify all user stories are satisfied
- Check accessibility compliance
- Verify mobile responsiveness
- Test in multiple browsers (Chrome, Firefox, Safari)
- Update README or documentation if needed
