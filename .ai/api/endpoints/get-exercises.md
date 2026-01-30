# API Endpoint Implementation Plan: GET /api/exercises

## 1. Endpoint Overview
Retrieve a paginated list of exercises with optional search filtering by name. This endpoint provides basic exercise information and supports pagination for efficient data retrieval.

## 2. Request Details
- **HTTP Method**: GET
- **URL Structure**: `/api/exercises`
- **Headers**:
  - Required: `Authorization: Bearer {access_token}`
- **Query Parameters**:
  - Optional:
    - `search` (string): Case-insensitive name filter
    - `limit` (integer, default: 100): Maximum number of results
    - `offset` (integer, default: 0): Pagination offset

## 3. Used Types

```typescript
// Types for request parameters
interface ExerciseSearchParams {
  search?: string;
  limit?: number;
  offset?: number;
}

// Response types
interface Exercise {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
}

interface PaginationMeta {
  limit: number;
  offset: number;
  total: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Final response type
type ExerciseListResponse = PaginatedResponse<Exercise>;
```

## 4. Data Flow
1. **Request Validation**:
   - Validate authentication token
   - Parse and validate query parameters
   - Apply default values for limit/offset

2. **Database Query**:
   ```sql
   SELECT 
     id, name, created_by, created_at,
     COUNT(*) OVER() as total_count
   FROM exercises
   WHERE 
     CASE 
       WHEN $1::text IS NOT NULL 
       THEN LOWER(name) LIKE '%' || LOWER($1) || '%'
       ELSE true 
     END
   ORDER BY name ASC
   LIMIT $2
   OFFSET $3
   ```

3. **Response Transformation**:
   - Map database results to Exercise DTO
   - Construct pagination metadata
   - Return formatted response

## 5. Security Considerations
1. **Authentication**:
   - Validate JWT token presence and format
   - Verify token signature and expiration
   - Extract user claims for audit logging

2. **Input Validation**:
   - Sanitize search parameter to prevent SQL injection
   - Enforce reasonable limits:
     - Maximum search string length: 60 chars (matches DB column)
     - Maximum limit: 100
     - Minimum limit: 1
     - Minimum offset: 0

3. **Rate Limiting**:
   - Apply standard API rate limiting rules
   - Consider caching frequently requested results

## 6. Error Handling

| Scenario | Status Code | Response |
|----------|-------------|-----------|
| Missing/Invalid token | 401 | `{ "error": "Unauthorized" }` |
| Invalid limit/offset | 400 | `{ "error": "Invalid pagination parameters" }` |
| Database error | 500 | `{ "error": "Internal server error" }` |

Error logging:
- Log all 4xx errors at INFO level
- Log all 5xx errors at ERROR level
- Include request ID, user ID (if available), and timestamp

## 7. Performance Considerations
1. **Query Optimization**:
   - Index on `name` column for efficient search
   - Use materialized view if read-heavy workload
   - Consider caching common searches

2. **Response Size**:
   - Paginate results to prevent large payloads
   - Compress response if supported by client
   - Use appropriate data types to minimize payload size

## 8. Implementation Steps

1. **Setup Types (src/types.ts)**:
   - Define interfaces for request/response types
   - Create zod validation schemas

2. **Create Service Layer (src/lib/services/exercise.service.ts)**:
   ```typescript
   class ExerciseService {
     async getExercises(params: ExerciseSearchParams): Promise<ExerciseListResponse>;
   }
   ```

3. **Implement API Route (src/pages/api/exercises/index.ts)**:
   - Add route handler with parameter validation
   - Integrate with ExerciseService
   - Implement error handling

4. **Add Database Indexes**:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_exercises_name 
   ON exercises(name);
   ```

5. **Implement Validation**:
   - Create input validation schema
   - Add parameter sanitization
   - Implement error responses
