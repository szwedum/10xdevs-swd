# API Endpoint Implementation Plan: GET Workout History

## 1. Endpoint Overview
Retrieve paginated workout history for the authenticated user with optional filtering by date range and template. Each workout entry includes summary statistics like exercise count and total sets.

## 2. Request Details
- **HTTP Method:** GET
- **URL Structure:** `/api/workouts`
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)
- **Query Parameters:**
  - `limit` (optional, integer, default: 50)
  - `offset` (optional, integer, default: 0)
  - `from_date` (optional, ISO 8601)
  - `to_date` (optional, ISO 8601)
  - `template_id` (optional, UUID)

## 3. Used Types

```typescript
interface WorkoutHistoryFilters {
  limit?: number;
  offset?: number;
  fromDate?: Date;
  toDate?: Date;
  templateId?: string;
}

interface WorkoutSummary {
  id: string;
  userId: string;
  templateId: string | null;
  templateName: string | null;
  loggedAt: string;
  exerciseCount: number;
  totalSets: number;
}

interface PaginationMetadata {
  limit: number;
  offset: number;
  total: number;
}

interface WorkoutHistoryResponse {
  data: WorkoutSummary[];
  pagination: PaginationMetadata;
}
```

## 4. Data Flow
1. **Request Validation:**
   - Parse and validate query parameters
   - Validate authentication token

2. **Database Queries:**
   ```sql
   -- Main query to get workout summaries
   SELECT 
     w.id,
     w.user_id,
     w.template_id,
     t.name as template_name,
     w.logged_at,
     COUNT(DISTINCT we.id) as exercise_count,
     COUNT(ws.id) as total_sets
   FROM workouts w
   LEFT JOIN templates t ON w.template_id = t.id
   LEFT JOIN workout_exercises we ON w.id = we.workout_id
   LEFT JOIN workout_sets ws ON we.id = ws.workout_exercise_id
   WHERE w.user_id = :userId
     AND (:templateId::uuid IS NULL OR w.template_id = :templateId)
     AND (:fromDate::timestamptz IS NULL OR w.logged_at >= :fromDate)
     AND (:toDate::timestamptz IS NULL OR w.logged_at <= :toDate)
   GROUP BY w.id, t.name
   ORDER BY w.logged_at DESC
   LIMIT :limit
   OFFSET :offset;

   -- Count total records for pagination
   SELECT COUNT(*)
   FROM workouts w
   WHERE w.user_id = :userId
     AND (:templateId::uuid IS NULL OR w.template_id = :templateId)
     AND (:fromDate::timestamptz IS NULL OR w.logged_at >= :fromDate)
     AND (:toDate::timestamptz IS NULL OR w.logged_at <= :toDate);
   ```

## 5. Security Considerations
1. **Authentication:**
   - Validate JWT token using Supabase Auth
   - Ensure token is not expired
   - Extract user_id from token

2. **Authorization:**
   - Verify user can only access their own workout history
   - Implement RLS policies in Supabase

3. **Input Validation:**
   - Sanitize and validate all query parameters
   - Use parameterized queries to prevent SQL injection
   - Implement rate limiting

## 6. Error Handling
1. **Client Errors (4xx):**
   - 400: Invalid query parameters
     - Non-numeric limit/offset
     - Invalid date formats
     - Invalid UUID format for template_id
     - from_date after to_date
   - 401: Missing or invalid authentication token

2. **Server Errors (5xx):**
   - 500: Database query failures
   - 500: Unexpected server errors

3. **Error Response Format:**
   ```json
   {
     "error": {
       "code": "INVALID_PARAMETER",
       "message": "Invalid parameter value",
       "details": {
         "parameter": "limit",
         "reason": "Must be a positive integer"
       }
     }
   }
   ```

## 7. Performance Considerations
1. **Query Optimization:**
   - Create indexes on:
     - workouts(user_id, logged_at)
     - workouts(template_id)
     - workout_exercises(workout_id)
   - Use materialized views for frequently accessed data
   - Implement query result caching

2. **Pagination:**
   - Enforce reasonable page size limits
   - Use cursor-based pagination for better performance
   - Cache pagination metadata

## 8. Implementation Steps

1. **Setup Types (1 hour)**
   - Create DTO interfaces in `src/types.ts`
   - Create validation schema in `src/lib/validation/workout.schema.ts`

2. **Create Service Layer (2 hours)**
   ```typescript
   // src/lib/services/workout.service.ts
   class WorkoutService {
     async getWorkoutHistory(
       userId: string,
       filters: WorkoutHistoryFilters
     ): Promise<WorkoutHistoryResponse>;
   }
   ```

3. **Implement API Route (2 hours)**
   - Create route handler in `src/pages/api/workouts/index.ts`
   - Implement query parameter validation
   - Add error handling middleware

4. **Database Optimization (1 hour)**
   - Create necessary indexes
   - Implement RLS policies
   - Test query performance
