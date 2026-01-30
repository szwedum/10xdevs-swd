# API Endpoint Implementation Plan: POST /api/workouts

## 1. Endpoint Overview
Create and complete a new workout with exercise sets, optionally based on a template. Tracks personal bests and returns workout details with any personal best updates.

## 2. Request Details
- **HTTP Method**: POST
- **URL**: `/api/workouts`
- **Headers**: 
  ```
  Authorization: Bearer {access_token}
  ```
- **Request Body**:
  ```typescript
  CreateWorkoutCommand {
    template_id?: string;
    logged_at?: string;
    exercises: Array<{
      exercise_id: string;
      position: number;
      sets: Array<{
        set_index: number;
        reps: number;
        weight: number;
      }>
    }>
  }
  ```

## 3. Used Types
```typescript
// Already defined in src/types.ts:
import {
  CreateWorkoutCommand,
  CreateWorkoutResponseDTO,
  PersonalBestUpdateDTO
} from '../types';

// New types to create:
import { z } from 'zod';

const workoutSetSchema = z.object({
  set_index: z.number().int().min(1),
  reps: z.number().int().min(1).max(99),
  weight: z.number().min(0).max(999.99)
});

const workoutExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  position: z.number().int().min(1),
  sets: z.array(workoutSetSchema).min(1)
});

const createWorkoutSchema = z.object({
  template_id: z.string().uuid().nullable().optional(),
  logged_at: z.string().datetime().optional(),
  exercises: z.array(workoutExerciseSchema).min(1)
});
```

## 4. Data Flow
1. **Request Validation**:
   - Validate request body against Zod schema
   - Verify template ownership if template_id provided
   - Check exercise existence
   - Validate unique positions and set_indices

2. **Database Operations** (in transaction):
   ```typescript
   // 1. Create workout
   const workout = await db.from('workouts').insert({
     user_id,
     template_id,
     logged_at: logged_at || new Date().toISOString()
   }).select().single();

   // 2. Create workout exercises
   const workoutExercises = await db.from('workout_exercises')
     .insert(exercises.map(...)).select();

   // 3. Create workout sets
   const workoutSets = await db.from('workout_sets')
     .insert(exercises.flatMap(...)).select();

   // 4. Update personal bests
   const personalBestUpdates = await updatePersonalBests(userId, exercises);
   ```

3. **Response Assembly**:
   - Combine workout, exercises, sets data
   - Include personal best updates
   - Format as CreateWorkoutResponseDTO

## 5. Security Considerations
1. **Authentication**:
   - Validate JWT token via Supabase Auth middleware
   - Extract user_id from token

2. **Authorization**:
   - Verify template ownership if template_id provided
   - Ensure exercises exist and are accessible

3. **Input Validation**:
   - Sanitize all inputs via Zod schema
   - Validate numeric ranges
   - Prevent SQL injection via Supabase

4. **Rate Limiting**:
   - Consider implementing rate limiting for high-frequency requests

## 6. Error Handling
```typescript
try {
  // Main logic
} catch (error) {
  if (error instanceof z.ZodError) {
    return new Response(JSON.stringify({
      error: 'Validation Error',
      details: error.errors
    }), { status: 400 });
  }

  if (error instanceof TemplateNotFoundError) {
    return new Response(JSON.stringify({
      error: 'Not Found',
      message: 'Template not found'
    }), { status: 404 });
  }

  // Log error to analytics.event_log
  await logError('workout_creation_failed', error);

  return new Response(JSON.stringify({
    error: 'Internal Server Error',
    message: 'Failed to create workout'
  }), { status: 500 });
}
```

## 7. Performance Considerations
1. **Database Optimization**:
   - Use single transaction for all operations
   - Batch insert workout sets
   - Index on (user_id, template_id) for template lookup
   - Index on exercise_id for existence check

2. **Caching**:
   - Consider caching exercise data
   - Cache personal best lookups during high-load periods

## 8. Implementation Steps

1. **Service Layer** (`src/lib/services/workout.service.ts`):
   - Implement `createWorkout` method
   - Add personal best tracking logic
   - Create validation helpers

2. **Schema Validation** (`src/lib/validation/workout.schema.ts`):
   - Define Zod schemas for request validation
   - Add custom validators for unique constraints

3. **Database Layer**:
   - Add workout creation transaction
   - Implement personal best update logic
   - Create exercise existence check

4. **API Endpoint** (`src/pages/api/workouts/index.ts`):
   - Implement POST handler
   - Add error handling
   - Integrate with workout service
