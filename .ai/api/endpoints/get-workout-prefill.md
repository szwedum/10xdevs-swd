# API Endpoint Implementation Plan: GET Workout Prefill

## 1. Endpoint Overview
Retrieves prefilled workout data based on a user's last workout for each exercise in a specified template. This endpoint helps users start new workouts with their most recent performance data, improving the workout logging experience.

## 2. Request Details
- **HTTP Method**: GET
- **URL Structure**: `/api/workouts/prefill/:template_id`
- **Parameters**:
  - Required:
    - `template_id` (UUID) - URL parameter
    - `Authorization` (string) - Bearer token in header
  - Optional: None
- **Request Body**: None required

## 3. Used Types

```typescript
// Response Types
interface PrefillWorkoutResponse {
  template_id: string;
  template_name: string;
  exercises: PrefillExercise[];
}

interface PrefillExercise {
  exercise_id: string;
  exercise_name: string;
  position: number;
  suggested_sets: SuggestedSet[];
}

interface SuggestedSet {
  set_index: number;
  reps: number;
  weight: number;
  source: 'last_workout';
}

// Service Types
interface LastWorkoutData {
  workout_id: string;
  exercise_id: string;
  sets: {
    set_index: number;
    reps: number;
    weight: number;
  }[];
}
```

## 4. Data Flow
1. **Request Validation**:
   - Validate template_id format
   - Verify auth token and extract user_id

2. **Data Access**:
   ```sql
   -- 1. Verify template access
   SELECT id, name 
   FROM templates 
   WHERE id = :template_id 
   AND user_id = :user_id;

   -- 2. Get template exercises
   SELECT te.exercise_id, e.name, te.position, te.sets, te.reps, te.default_weight
   FROM template_exercises te
   JOIN exercises e ON e.id = te.exercise_id
   WHERE te.template_id = :template_id
   ORDER BY te.position;

   -- 3. Get last workout data for each exercise
   WITH LastWorkouts AS (
     SELECT DISTINCT ON (we.exercise_id)
       w.id as workout_id,
       we.exercise_id,
       w.logged_at
     FROM workouts w
     JOIN workout_exercises we ON we.workout_id = w.id
     WHERE w.user_id = :user_id
     AND we.exercise_id = ANY(:exercise_ids)
     ORDER BY we.exercise_id, w.logged_at DESC
   )
   SELECT 
     lw.workout_id,
     lw.exercise_id,
     ws.set_index,
     ws.reps,
     ws.weight
   FROM LastWorkouts lw
   JOIN workout_exercises we ON we.workout_id = lw.workout_id 
   AND we.exercise_id = lw.exercise_id
   JOIN workout_sets ws ON ws.workout_exercise_id = we.id
   ORDER BY lw.exercise_id, ws.set_index;
   ```

## 5. Security Considerations
1. **Authentication**:
   - Validate JWT token
   - Ensure token is not expired
   - Extract and verify user claims

2. **Authorization**:
   - Verify template ownership
   - Implement RLS policies for database queries

3. **Input Validation**:
   - Sanitize template_id parameter
   - Validate UUID format
   - Implement request rate limiting

4. **Data Access Control**:
   - Use parameterized queries
   - Enforce row-level security
   - Validate all database operations

## 6. Error Handling
1. **Client Errors**:
   - 401 Unauthorized
     - Invalid token format
     - Expired token
     - Missing token
   - 403 Forbidden
     - Template belongs to another user
   - 404 Not Found
     - Template does not exist

2. **Server Errors**:
   - 500 Internal Server Error
     - Database connection issues
     - Query execution errors
     - Unexpected runtime errors

3. **Error Logging**:
   ```typescript
   await logError({
     userId: user.id,
     endpoint: '/api/workouts/prefill',
     errorCode: statusCode,
     errorMessage: message,
     stackTrace: error.stack
   });
   ```

## 7. Performance Considerations
1. **Query Optimization**:
   - Use appropriate indexes
   - Minimize number of database roundtrips
   - Implement query result caching

2. **Response Size**:
   - Limit maximum exercises per template
   - Implement pagination if needed
   - Compress response payload

3. **Caching Strategy**:
   - Cache template data
   - Cache exercise metadata
   - Invalidate cache on workout updates

## 8. Implementation Steps
1. **Setup Types and Interfaces**:
   - Create response DTOs
   - Define service interfaces
   - Setup error types

2. **Create Database Queries**:
   - Implement template access verification
   - Create exercise data retrieval
   - Setup last workout fetching

3. **Implement Services**:
   ```typescript
   class WorkoutPrefillService {
     async getPrefillData(templateId: string, userId: string): Promise<PrefillWorkoutResponse>;
     private async verifyTemplateAccess(templateId: string, userId: string): Promise<Template>;
     private async getTemplateExercises(templateId: string): Promise<TemplateExercise[]>;
     private async getLastWorkoutData(exerciseIds: string[], userId: string): Promise<Map<string, LastWorkoutData>>;
   }
   ```

4. **Create API Route Handler**:
   - Setup route in Astro
   - Implement request validation
   - Add error handling
   - Setup response formatting

5. **Add Security Measures**:
   - Implement authentication middleware
   - Setup rate limiting
   - Add input sanitization

6. **Setup Error Handling**:
   - Create error logging
   - Implement error responses
   - Add error monitoring