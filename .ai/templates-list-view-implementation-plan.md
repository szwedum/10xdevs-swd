# View Implementation Plan – Templates List View

## 1. Overview
Displays all workout templates owned by the authenticated user. Serves as the landing page after login and primary entry point for starting workouts, viewing template details, creating new templates, and deleting existing ones.

## 2. View Routing
- **Path**: `/templates`
- **Guard**: Requires valid Supabase Auth session; redirect to `/login` if session invalid.

## 3. Component Structure
```
TemplatesPage (Astro ‑ /pages/templates.astro)
 ├─ <NavigationHeader />
 ├─ <TemplatesList /> (React)
 │   ├─ <CreateTemplateButton />
 │   ├─ Empty ⇒ <EmptyState />
 │   └─ Non-empty ⇒ list of <TemplateCard />
 └─ <ConfirmDialog /> (portal – invoked by TemplateCard)
```

## 4. Component Details
### NavigationHeader
- **Purpose**: Top navigation with app logo, primary links (Templates, Workout Logging) and Logout button.
- **Main elements**: `<header>`, `<nav>`, `<ul><li>`, `<button>` (logout).
- **Handled interactions**: Click navigation links → `astro:redirect`; click **Logout** → call Supabase `auth.signOut()` then redirect.
- **Validation**: N/A.
- **Types**: none.
- **Props**: `{ currentPath: string }` (to highlight active link).

### TemplatesList
- **Purpose**: Fetches templates from API and renders list or empty state.
- **Main elements**: Container `<section>` holding `CreateTemplateButton`, list `<ul>` of `TemplateCard`, or `EmptyState`.
- **Handled interactions**:
  - Pagination controls (future; not in MVP) – stub.
- **Validation**: none.
- **Types**: `TemplateListResponseDTO`, `TemplateListItemDTO`.
- **Props**: none (data fetched internally via hook).

### TemplateCard
- **Purpose**: Visual representation of single template with primary/secondary/ destructive actions.
- **Main elements**: `<li>` wrapped in shadcn/ui `Card` with template name, meta info, and three buttons.
- **Handled interactions**:
  - **Start Workout** → `astro:redirect` to `/workout/[id]`.
  - **View Details** → `astro:redirect` to `/templates/[id]`.
  - **Delete** → opens `ConfirmDialog` and, on confirm, issues `DELETE /api/templates/:id`, then refetches list.
- **Validation**: none.
- **Types**: `TemplateCardProps` ({ item: `TemplateListItemDTO`}).
- **Props**: see Types.

### CreateTemplateButton
- **Purpose**: Prominent CTA to create a new template.
- **Main elements**: shadcn/ui `Button` with icon.
- **Handled interactions**: click → navigate to `/templates/new`.
- **Validation**: none.
- **Types**: none.
- **Props**: none.

### EmptyState
- **Purpose**: Encourages template creation when list empty.
- **Main elements**: Illustration/icon, explanatory text, `CreateTemplateButton`.
- **Handled interactions**: same as above.
- **Validation**: none.
- **Types**: none.
- **Props**: none.

### ConfirmDialog (shared modal)
- **Purpose**: Generic confirmation for destructive actions (template deletion, etc.).
- **Main elements**: Portal-rendered dialog with title, description, Confirm/Cancel buttons.
- **Handled interactions**: Confirm → resolves promise, Cancel → closes dialog.
- **Validation**: none.
- **Types**: `ConfirmDialogProps` ({ title: string; description?: string; onConfirm(): void }).
- **Props**: see Types.

## 5. Types
- `TemplateListItemDTO` – imported from `@/src/types.ts` (`id`, `user_id`, `name`, `created_at`, `exercise_count`).
- `TemplateListResponseDTO` – list + pagination (imported).
- `TemplateCardProps`:
```ts
interface TemplateCardProps {
  item: TemplateListItemDTO;
  onDeleted?: (id: string) => void;
}
```
- `ConfirmDialogProps`:
```ts
interface ConfirmDialogProps {
  title: string;
  description?: string;
  onConfirm: () => void;
}
```
- Hook result type `useTemplates`:
```ts
interface UseTemplatesResult {
  templates: TemplateListItemDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

## 6. State Management
- **Local component state**
  - `templates`: array from API (TemplatesList).
  - `loading`, `error` booleans/strings.
  - `showConfirm`, `pendingDeleteId` (TemplateCard + ConfirmDialog).
- **Custom hook** `useTemplates` (in `src/lib/hooks/useTemplates.ts`): wraps fetch logic, manages loading/error, exposes `refetch`.
- Global state not required.

## 7. API Integration
- **GET /api/templates**
  - Request headers: `Authorization: Bearer {access_token}`.
  - Query: `limit=50&offset=0&sort=created_at&order=desc`.
  - Response type: `TemplateListResponseDTO`.
- **DELETE /api/templates/:id** (assumed implemented for MVP)
  - Request headers: Auth as above.
  - Response type: `DeleteResponseDTO` (success) | `ErrorResponseDTO` (error).
- Fetch utility in `src/lib/services/template.service.ts` will expose:
  - `getTemplates(params): Promise<TemplateListResponseDTO>`
  - `deleteTemplate(id): Promise<DeleteResponseDTO>`

## 8. User Interactions
- **Load page** → fetch templates, show loading, then render list or empty state.
- **Create New Template** → button click navigates to `/templates/new`.
- **Start Workout** → navigate to `/workout/[templateId]`.
- **View Details** → navigate to `/templates/[templateId]`.
- **Delete Template** → click Delete → ConfirmDialog → DELETE request → on success remove card and show toast.
- **Logout** → session sign-out and redirect.

## 9. Conditions and Validation
- **Session present**: verify via Supabase auth utilities on page load; redirect if missing.
- **API success (200)**: render templates; if `data.length === 0`, show `EmptyState`.
- **API error 401**: redirect to `/login`.
- **API error others**: set `error` state → show `ErrorMessage`.
- **Delete response success**: remove from list, decrement count.

## 10. Error Handling
- Network/API failures → display inline `ErrorMessage` with retry button.
- 401 Unauthorized → automatic logout + redirect.
- 404 Not Found on delete → display toast: "Template already deleted" and refetch.
- Unexpected errors logged to console for dev.

## 11. Implementation Steps
1. **Routing**: add `/templates.astro` page with auth guard (redirect if no session).
2. **API Service**: implement `getTemplates` & `deleteTemplate` in `template.service.ts`.
3. **Hook**: create `useTemplates` for data fetching, loading, error, refetch.
4. **Components**:
   1. `NavigationHeader` – responsive Tailwind layout.
   2. `CreateTemplateButton` – shared CTA.
   3. `TemplateCard` – card layout with action buttons and aria labels.
   4. `EmptyState` – illustration + CTA.
   5. `ConfirmDialog` – reusable portal dialog using shadcn/ui primitives.
5. **TemplatesList** – compose components, call `useTemplates`, handle delete flow.
6. **Integrate** `TemplatesList` into `/templates.astro` with Astro `<Island>`.
7. **Styling**: Tailwind classes; ensure hover states & mobile sizing.
8. **Accessibility**: semantic `<ul>/<li>`, proper headings, focus management in `ConfirmDialog`.
9. **Testing**: manual tests – list loads, buttons navigate, delete works, empty state.
10. **Code Lint/Format**: run `eslint` and `prettier`, commit.
11. **Document**: update README with view description (optional).
