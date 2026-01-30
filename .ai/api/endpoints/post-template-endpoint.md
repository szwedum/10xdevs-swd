# API Endpoint Implementation Plan: Create Workout Template

## 1. Endpoint Overview
Creates a new workout template with associated exercises. Templates are user-specific collections of exercises with predefined sets, reps, and optional default weights. Each exercise within a template has a specific position for ordering.

## 2. Request Details
- **HTTP Method**: POST
- **URL**: `/api/templates`
- **Headers**: 
  ```
  Authorization: Bearer {access_token}
  Content-Type: application/json
  ```
- **Request Body**:
  ```typescript
  interface CreateTemplateRequest {
    name: string;
    exercises: CreateTemplateExerciseRequest[];
  }

  interface CreateTemplateExerciseRequest {
    exercise_id: string;
    sets: number;
    reps: number;
    default_weight?: number;
    position: number;
  }
  ```

## 3. Used Types

### DTOs
```typescript
// Request Types
interface CreateTemplateCommand {
  userId: string;
  name: string;
  exercises: CreateTemplateExerciseCommand[];
}

interface CreateTemplateExerciseCommand {
  exerciseId: string;
  sets: number;
  reps: number;
  defaultWeight?: number;
  position: number;
}

// Response Types
interface TemplateResponse {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  exercises: TemplateExerciseResponse[];
}

interface TemplateExerciseResponse {
  id: string;
  template_id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  default_weight?: number;
  position: number;
}
```

## 4. Data Flow
1. **Request Validation**
   - Validate request body schema
   - Validate template name constraints
   - Validate exercise array presence and length
   - Validate sets/reps/weight ranges
   - Validate position uniqueness

2. **Database Operations**
   ```sql
   -- Transaction Start
   
   -- 1. Insert template
   INSERT INTO templates (user_id, name)
   VALUES ($1, $2)
   RETURNING id;
   
   -- 2. Insert template exercises
   INSERT INTO template_exercises 
   (template_id, exercise_id, sets, reps, default_weight, position)
   VALUES ($1, $2, $3, $4, $5, $6);
   
   -- 3. Query full template data
   SELECT 
     t.id, t.user_id, t.name, t.created_at,
     te.id as exercise_id, te.exercise_id,
     e.name as exercise_name,
     te.sets, te.reps, te.default_weight, te.position
   FROM templates t
   JOIN template_exercises te ON t.id = te.template_id
   JOIN exercises e ON te.exercise_id = e.id
   WHERE t.id = $1;
   
   -- Transaction End
   ```

## 5. Security Considerations
1. **Authentication & Authorization**
   - Validate JWT token
   - Extract user_id from token
   - Ensure user has permission to create templates

2. **Input Sanitization**
   - Use parameterized queries for all database operations
   - Validate and sanitize template name for XSS
   - Validate UUID formats for exercise_ids

3. **Rate Limiting**
   - Apply rate limiting per user
   - Set maximum exercises per template (e.g., 50)

## 6. Error Handling

### Validation Errors (400)
- Template name missing or invalid length
- Empty exercises array
- Invalid sets/reps ranges
- Invalid weight range
- Invalid position values
- Duplicate positions

### Authentication Errors (401)
- Missing authorization header
- Invalid/expired token
- Malformed token

### Conflict Errors (409)
- Template name already exists for user

### Server Errors (500)
- Database connection errors
- Transaction failures
- Unexpected runtime errors

## 7. Performance Considerations
1. **Database Optimization**
   - Use single transaction for all operations
   - Utilize existing indexes on:
     - templates(user_id, name)
     - template_exercises(template_id, position)
     - exercises(id)

2. **Request Size Limits**
   - Maximum 50 exercises per template
   - Maximum request body size: 50KB

3. **Caching Strategy**
   - Cache exercise data for validation
   - Cache user template names for uniqueness checks

## 8. Implementation Steps

1. **Setup Types (1 day)**
   - Create request/response interfaces
   - Create validation schemas
   - Create database types

2. **Create Template Service (2 days)**
   ```typescript
   class TemplateService {
     async createTemplate(cmd: CreateTemplateCommand): Promise<TemplateResponse>;
     private validateTemplateName(userId: string, name: string): Promise<void>;
     private validateExercises(exercises: CreateTemplateExerciseCommand[]): Promise<void>;
     private buildTemplateResponse(template: Template, exercises: TemplateExercise[]): TemplateResponse;
   }
   ```

3. **Implement Validation Layer (1 day)**
   - Request schema validation
   - Business rule validation
   - Custom validation error messages

4. **Database Layer (2 days)**
   - Implement template repository
   - Create database transaction wrapper
   - Add error handling and retries

5. **API Route Handler (1 day)**
   - Setup route in API router
   - Implement authentication middleware
   - Add request/response logging
