# REST API Plan - GymRatPlanner

## 1. Resources

The API is organized around the following main resources, each corresponding to database entities:

- **Exercises** → `exercises` table
- **Templates** → `templates` table
- **Template Exercises** → `template_exercises` table (nested within Templates)
- **Workouts** → `workouts` table
- **Workout Exercises** → `workout_exercises` table (nested within Workouts)
- **Workout Sets** → `workout_sets` table (nested within Workout Exercises)
- **Personal Bests** → `personal_bests` table
- **Event Logs** → `analytics.event_log` table

## 2. Endpoints

### 2.2 Exercises

#### GET /api/exercises
**Description:** Retrieve list of all available exercises with optional search filtering

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `search` (optional, string) - Filter exercises by name (case-insensitive)
- `limit` (optional, integer, default: 100) - Maximum number of results
- `offset` (optional, integer, default: 0) - Pagination offset

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Bench Press",
      "created_by": "uuid or null",
      "created_at": "2025-01-29T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 150
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

#### GET /api/exercises/:id
**Description:** Retrieve details of a specific exercise

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "name": "Bench Press",
  "created_by": "uuid or null",
  "created_at": "2025-01-29T10:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Exercise does not exist

---

### 2.3 Templates

#### GET /api/templates
**Description:** Retrieve all workout templates for the authenticated user

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit` (optional, integer, default: 50) - Maximum number of results
- `offset` (optional, integer, default: 0) - Pagination offset
- `sort` (optional, string, default: "created_at") - Sort field (created_at, name)
- `order` (optional, string, default: "desc") - Sort order (asc, desc)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Push Day",
      "created_at": "2025-01-29T10:00:00Z",
      "exercise_count": 5
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 12
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

#### GET /api/templates/:id
**Description:** Retrieve detailed information about a specific template including all exercises

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Push Day",
  "created_at": "2025-01-29T10:00:00Z",
  "exercises": [
    {
      "id": "uuid",
      "template_id": "uuid",
      "exercise_id": "uuid",
      "exercise_name": "Bench Press",
      "sets": 4,
      "reps": 8,
      "default_weight": 80.00,
      "position": 1
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Template belongs to another user
- `404 Not Found` - Template does not exist

---

#### POST /api/templates
**Description:** Create a new workout template

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "name": "Push Day",
  "exercises": [
    {
      "exercise_id": "uuid",
      "sets": 4,
      "reps": 8,
      "default_weight": 80.00,
      "position": 1
    }
  ]
}
```

**Validation Rules:**
- `name`: Required, max 60 characters, unique per user
- `exercises`: Required, array with at least 1 exercise
- `sets`: Required, integer between 1 and 99
- `reps`: Required, integer between 1 and 99
- `default_weight`: Optional, numeric between 0 and 999.99
- `position`: Required, unique within template

**Response (201 Created):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "Push Day",
  "created_at": "2025-01-29T10:00:00Z",
  "exercises": [
    {
      "id": "uuid",
      "template_id": "uuid",
      "exercise_id": "uuid",
      "exercise_name": "Bench Press",
      "sets": 4,
      "reps": 8,
      "default_weight": 80.00,
      "position": 1
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Validation error (invalid sets/reps/weight, missing required fields)
- `401 Unauthorized` - Invalid or missing token
- `409 Conflict` - Template name already exists for this user

---

#### DELETE /api/templates/:id
**Description:** Permanently delete a workout template

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "message": "Template deleted successfully",
  "deleted_id": "uuid"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Template belongs to another user
- `404 Not Found` - Template does not exist

---

### 2.4 Workouts

#### GET /api/workouts
**Description:** Retrieve workout history for the authenticated user

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `limit` (optional, integer, default: 50) - Maximum number of results
- `offset` (optional, integer, default: 0) - Pagination offset
- `from_date` (optional, ISO 8601 date) - Filter workouts after this date
- `to_date` (optional, ISO 8601 date) - Filter workouts before this date
- `template_id` (optional, uuid) - Filter by template

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "template_id": "uuid or null",
      "template_name": "Push Day or null",
      "logged_at": "2025-01-29T10:00:00Z",
      "exercise_count": 5,
      "total_sets": 20
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 45
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

#### GET /api/workouts/:id
**Description:** Retrieve detailed information about a specific workout including all exercises and sets

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "template_id": "uuid or null",
  "template_name": "Push Day or null",
  "logged_at": "2025-01-29T10:00:00Z",
  "exercises": [
    {
      "id": "uuid",
      "workout_id": "uuid",
      "exercise_id": "uuid",
      "exercise_name": "Bench Press",
      "position": 1,
      "sets": [
        {
          "id": "uuid",
          "workout_exercise_id": "uuid",
          "set_index": 1,
          "reps": 8,
          "weight": 80.00
        }
      ]
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Workout belongs to another user
- `404 Not Found` - Workout does not exist

---

#### POST /api/workouts
**Description:** Create and complete a new workout (log workout results)

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "template_id": "uuid or null",
  "logged_at": "2025-01-29T10:00:00Z",
  "exercises": [
    {
      "exercise_id": "uuid",
      "position": 1,
      "sets": [
        {
          "set_index": 1,
          "reps": 8,
          "weight": 80.00
        }
      ]
    }
  ]
}
```

**Validation Rules:**
- `template_id`: Optional, must be valid template owned by user
- `logged_at`: Optional, defaults to current timestamp
- `exercises`: Required, array with at least 1 exercise
- `position`: Required, unique within workout
- `sets`: Required, array with at least 1 set
- `set_index`: Required, unique within workout exercise
- `reps`: Required, integer between 1 and 99
- `weight`: Required, numeric between 0 and 999.99

**Response (201 Created):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "template_id": "uuid or null",
  "logged_at": "2025-01-29T10:00:00Z",
  "exercises": [
    {
      "id": "uuid",
      "workout_id": "uuid",
      "exercise_id": "uuid",
      "exercise_name": "Bench Press",
      "position": 1,
      "sets": [
        {
          "id": "uuid",
          "workout_exercise_id": "uuid",
          "set_index": 1,
          "reps": 8,
          "weight": 80.00
        }
      ]
    }
  ],
  "personal_bests_updated": [
    {
      "exercise_id": "uuid",
      "exercise_name": "Bench Press",
      "previous_weight": 75.00,
      "new_weight": 80.00
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Validation error (invalid reps/weight, missing required fields)
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Template belongs to another user
- `404 Not Found` - Template or exercise does not exist

---

#### GET /api/workouts/prefill/:template_id
**Description:** Get prefilled workout data based on user's last workout for each exercise in the template

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "template_id": "uuid",
  "template_name": "Push Day",
  "exercises": [
    {
      "exercise_id": "uuid",
      "exercise_name": "Bench Press",
      "position": 1,
      "suggested_sets": [
        {
          "set_index": 1,
          "reps": 8,
          "weight": 80.00,
          "source": "last_workout"
        }
      ]
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Template belongs to another user
- `404 Not Found` - Template does not exist

---

### 2.5 Personal Bests

#### GET /api/personal-bests
**Description:** Retrieve all personal bests for the authenticated user

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `exercise_id` (optional, uuid) - Filter by specific exercise
- `limit` (optional, integer, default: 100) - Maximum number of results
- `offset` (optional, integer, default: 0) - Pagination offset

**Response (200 OK):**
```json
{
  "data": [
    {
      "user_id": "uuid",
      "exercise_id": "uuid",
      "exercise_name": "Bench Press",
      "weight": 100.00,
      "updated_at": "2025-01-29T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 25
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

#### GET /api/personal-bests/:exercise_id
**Description:** Retrieve personal best for a specific exercise

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "user_id": "uuid",
  "exercise_id": "uuid",
  "exercise_name": "Bench Press",
  "weight": 100.00,
  "updated_at": "2025-01-29T10:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - No personal best exists for this exercise

---

### 2.6 Event Logs

#### POST /api/events
**Description:** Log an analytics event

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
  "event_type": "template_created",
  "payload": {
    "template_id": "uuid",
    "template_name": "Push Day",
    "exercise_count": 5
  }
}
```

**Validation Rules:**
- `event_type`: Required, string (template_created, workout_completed, etc.)
- `payload`: Required, JSON object with event-specific data

**Response (201 Created):**
```json
{
  "id": "bigint",
  "user_id": "uuid",
  "event_type": "template_created",
  "occurred_at": "2025-01-29T10:00:00Z",
  "payload": {
    "template_id": "uuid",
    "template_name": "Push Day",
    "exercise_count": 5
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid event type or payload
- `401 Unauthorized` - Invalid or missing token

---

#### GET /api/events
**Description:** Retrieve event logs for the authenticated user (for analytics purposes)

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `event_type` (optional, string) - Filter by event type
- `from_date` (optional, ISO 8601 date) - Filter events after this date
- `to_date` (optional, ISO 8601 date) - Filter events before this date
- `limit` (optional, integer, default: 100) - Maximum number of results
- `offset` (optional, integer, default: 0) - Pagination offset

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "bigint",
      "user_id": "uuid",
      "event_type": "template_created",
      "occurred_at": "2025-01-29T10:00:00Z",
      "payload": {
        "template_id": "uuid",
        "template_name": "Push Day"
      }
    }
  ],
  "pagination": {
    "limit": 100,
    "offset": 0,
    "total": 250
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

## 3. Authentication and Authorization

### 3.1 Authentication Mechanism

**Supabase Auth with JWT-based Sessions**

The API uses Supabase Auth for authentication, which provides:
- JWT-based access tokens
- Refresh tokens for session renewal
- Secure token storage and transmission
- Built-in session management

### 3.2 Implementation Details

**Token Format:**
- Access tokens are JWTs signed by Supabase
- Tokens contain user ID (`sub` claim) and expiration time
- Tokens are transmitted via `Authorization: Bearer {token}` header

**Session Management:**
- Access tokens expire after a configurable period (default: 1 hour)
- Refresh tokens are used to obtain new access tokens
- Sessions are validated on every API request via Supabase client

**Token Validation:**
- All protected endpoints require valid JWT in Authorization header
- Token validation is handled by Supabase middleware
- Invalid or expired tokens return `401 Unauthorized`

### 3.3 Authorization Strategy

**Row-Level Security (RLS) Policies**

Authorization is enforced at the database level using PostgreSQL RLS policies:

1. **User Data Isolation:**
   - All user-owned resources (templates, workouts, personal bests) are filtered by `user_id = auth.uid()`
   - RLS policies automatically enforce data isolation
   - No additional application-level authorization checks needed

2. **Exercise Access:**
   - All authenticated users can read all exercises
   - Users can only modify exercises they created (`created_by = auth.uid()`)
   - Seed exercises (`created_by IS NULL`) cannot be deleted

3. **Event Logs:**
   - Users can insert events with their own `user_id`
   - Users can only read their own events

**API-Level Authorization:**
- Middleware extracts JWT and validates session
- User ID from JWT is used in database queries
- RLS policies enforce data access rules automatically

### 3.4 Security Considerations

**Token Security:**
- Tokens transmitted over HTTPS only
- Tokens stored securely on client (httpOnly cookies or secure storage)
- Short-lived access tokens minimize exposure risk

**Rate Limiting:**
- Implement rate limiting per user/IP address
- Suggested limits:
  - Authentication endpoints: 5 requests per minute
  - Read endpoints: 100 requests per minute
  - Write endpoints: 30 requests per minute

**CORS Configuration:**
- Configure allowed origins for production domain
- Restrict to specific HTTP methods
- Include credentials in CORS policy

**Input Sanitization:**
- All inputs validated against schema
- SQL injection prevented by parameterized queries (Supabase client)
- XSS prevention through proper output encoding

---

## 4. Validation and Business Logic

### 4.1 Validation Rules by Resource

#### Templates
- **name**: Required, max 60 characters, unique per user
- **exercises**: Required, minimum 1 exercise
- **Constraint**: Template name must be unique per user (enforced by database)

#### Template Exercises
- **sets**: Required, integer, range 1-99
- **reps**: Required, integer, range 1-99
- **default_weight**: Optional, numeric, range 0-999.99, precision 1 decimal places
- **position**: Required, unique within template
- **Constraint**: Position must be unique within template (enforced by database)

#### Workouts
- **logged_at**: Optional, defaults to current timestamp
- **template_id**: Optional, must reference valid template owned by user
- **exercises**: Required, minimum 1 exercise

#### Workout Exercises
- **exercise_id**: Required, must reference valid exercise
- **position**: Required, unique within workout
- **sets**: Required, minimum 1 set
- **Constraint**: Position must be unique within workout (enforced by database)

#### Workout Sets
- **set_index**: Required, unique within workout exercise
- **reps**: Required, integer, range 1-99
- **weight**: Required, numeric, range 0-999.99, precision 1 decimal places
- **Constraint**: Set index must be unique within workout exercise (enforced by database)

#### Personal Bests
- **weight**: Required, numeric, range 0-999.99, precision 1 decimal places
- **Constraint**: Composite primary key (user_id, exercise_id)

#### Event Logs
- **event_type**: Required, string
- **payload**: Required, valid JSON object

### 4.2 Business Logic Implementation

#### Personal Best Automatic Updates
**Trigger:** Workout completion (POST /api/workouts)

**Logic:**
1. When a workout is saved, iterate through all workout sets
2. For each exercise, find the maximum weight logged
3. Compare with existing personal best for that exercise
4. If new weight > current PB, update personal_bests table
5. Use database trigger `upsert_personal_best()` for atomic updates
6. Return list of updated personal bests in API response

**Implementation:**
- Database trigger on `workout_sets` table (AFTER INSERT)
- Trigger executes `ON CONFLICT DO UPDATE` for atomic upserts
- No application-level logic required

#### Workout Prefilling
**Trigger:** User starts workout from template (GET /api/workouts/prefill/:template_id)

**Logic:**
1. Retrieve template exercises with their default values
2. For each exercise, query user's last completed workout containing that exercise
3. Extract sets, reps, and weights from the last workout
4. If no previous workout exists, use template defaults or personal best
5. Return prefilled data structure for client to populate workout form

**Implementation:**
- Query last workout per exercise using `workouts.logged_at DESC` index
- Join workout_exercises and workout_sets to get complete set data
- Fallback hierarchy: last workout → personal best → template default → 0

#### Template Creation Event Logging
**Trigger:** Template creation (POST /api/templates)

**Logic:**
1. Create template record in database
2. Create template_exercises records
3. Emit `template_created` event to analytics.event_log
4. Include template_id, template_name, and exercise_count in payload

**Implementation:**
- Event logged after successful template creation
- Use database transaction to ensure atomicity
- Event includes timestamp (occurred_at) set to current time

#### Workout Completion Event Logging
**Trigger:** Workout completion (POST /api/workouts)

**Logic:**
1. Create workout record in database
2. Create workout_exercises and workout_sets records
3. Trigger personal best updates (via database trigger)
4. Emit `workout_completed` event to analytics.event_log
5. Include workout_id, template_id, and exercise_count in payload

**Implementation:**
- Event logged after successful workout creation
- Use database transaction to ensure atomicity
- Event includes timestamp (occurred_at) set to current time

#### Template Deletion
**Trigger:** Template deletion (DELETE /api/templates/:id)

**Logic:**
1. Verify template belongs to authenticated user (via RLS)
2. Delete template record (cascade deletes template_exercises)
3. Workouts referencing this template have template_id set to NULL (ON DELETE SET NULL)
4. Return success response

**Implementation:**
- Database cascade handles related record deletion
- ON DELETE SET NULL preserves workout history
- No event logging required for MVP

### 4.3 Error Handling

**Validation Errors (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "exercises[0].sets",
      "message": "Sets must be between 1 and 99"
    }
  ]
}
```

**Authentication Errors (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

**Authorization Errors (403 Forbidden):**
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

**Not Found Errors (404 Not Found):**
```json
{
  "error": "Not found",
  "message": "The requested resource does not exist"
}
```

**Conflict Errors (409 Conflict):**
```json
{
  "error": "Conflict",
  "message": "A template with this name already exists"
}
```

**Server Errors (500 Internal Server Error):**
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

### 4.4 Data Consistency

**Transaction Boundaries:**
- Template creation: Single transaction for template + template_exercises
- Workout creation: Single transaction for workout + workout_exercises + workout_sets
- Personal best updates: Atomic via database trigger with ON CONFLICT

**Cascade Deletes:**
- Deleting template cascades to template_exercises
- Deleting workout cascades to workout_exercises and workout_sets
- Deleting user cascades to all user-owned data

**Referential Integrity:**
- All foreign keys enforced at database level
- ON DELETE CASCADE for dependent records
- ON DELETE SET NULL for optional references (workout.template_id)

---

## 5. API Design Principles

### 5.1 RESTful Conventions
- Resources identified by nouns (exercises, templates, workouts)
- HTTP methods map to CRUD operations (GET, POST, DELETE)
- Nested resources accessed via parent resource (e.g., /api/workouts/prefill/:template_id)
- Consistent URL structure and naming

### 5.2 Response Format
- All responses use JSON format
- Success responses include data and metadata
- Error responses include error type and descriptive message
- Timestamps in ISO 8601 format (UTC)

### 5.3 Pagination
- List endpoints support limit/offset pagination
- Default limits prevent excessive data transfer
- Pagination metadata included in responses
- Consider cursor-based pagination for future scaling

### 5.4 Filtering and Sorting
- Query parameters for filtering (search, date ranges, IDs)
- Sort parameter for ordering results
- Case-insensitive search where applicable

### 5.5 Versioning
- API version in URL path (e.g., /api/v1/templates)
- Version 1 is implicit for MVP (no /v1 prefix needed initially)
- Future versions can be added without breaking existing clients

---

## 6. Technology Integration

### 6.1 Astro 5 Integration
- API routes defined in `src/pages/api/` directory
- Server-side rendering for API endpoints
- TypeScript for type-safe API handlers
- Middleware for authentication and error handling

### 6.2 Supabase Integration
- Supabase client for database operations
- Supabase Auth for authentication
- RLS policies for authorization
- Real-time subscriptions available for future features

### 6.3 React Components
- React components consume API via fetch or Supabase client
- Client-side state management for workout logging
- Form validation before API submission
- Optimistic UI updates for better UX

### 6.4 TypeScript Types
- Shared types between frontend and backend
- Generated types from database schema
- Type-safe API request/response handling
- Validation using Zod or similar library

---

## 7. Future Enhancements

### 7.1 Additional Endpoints (Post-MVP)
- PATCH /api/templates/:id - Update template
- DELETE /api/workouts/:id - Delete workout
- PATCH /api/workouts/:id - Edit workout
- POST /api/exercises - Create custom exercise
- GET /api/analytics/progress - Progress tracking
- GET /api/analytics/metrics - Success metrics

### 7.2 Advanced Features
- Real-time workout collaboration
- Template sharing between users
- Workout recommendations based on history
- Advanced analytics and visualizations
- Export workout data (CSV, JSON)
- Import workout data from other apps

### 7.3 Performance Optimizations
- Caching for frequently accessed data (exercises)
- Database query optimization
- Connection pooling
- CDN for static assets
- Response compression

### 7.4 Security Enhancements
- Password reset flow
- Email verification
- Two-factor authentication
- API key management for third-party integrations
- Audit logging for sensitive operations
