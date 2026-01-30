# API Endpoint Implementation Plan: GET Template Details

## 1. Endpoint Overview
Retrieves detailed information about a specific workout template including all associated exercises. This endpoint provides the template metadata and a complete list of exercises with their configuration (sets, reps, weights).

## 2. Request Details
- **HTTP Method**: GET
- **URL Structure**: `/api/templates/:id`
- **Parameters**:
  - `id` (path parameter, UUID) - Template identifier
- **Headers**:
  - `Authorization: Bearer {access_token}` (required)

## 3. Used Types

```typescript
// Response DTOs
interface TemplateDetailsResponse {
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
  default_weight: number;
  position: number;
}

// Service Types
interface TemplateService {
  getTemplateDetails(templateId: string, userId: string): Promise<TemplateDetailsResponse>;
}
```

## 4. Data Flow
1. Request arrives at API endpoint
2. Middleware validates authentication token and extracts user ID
3. Endpoint handler validates template ID format
4. Call to TemplateService.getTemplateDetails
5. Service performs:
   - Query to verify template ownership
   - Join query to fetch template with exercises
   - Transform data to response DTO
6. Return formatted response

### Database Query
```sql
SELECT 
  t.id,
  t.user_id,
  t.name,
  t.created_at,
  json_agg(
    json_build_object(
      'id', te.id,
      'template_id', te.template_id,
      'exercise_id', te.exercise_id,
      'exercise_name', e.name,
      'sets', te.sets,
      'reps', te.reps,
      'default_weight', te.default_weight,
      'position', te.position
    ) ORDER BY te.position
  ) as exercises
FROM templates t
LEFT JOIN template_exercises te ON t.id = te.template_id
LEFT JOIN exercises e ON te.exercise_id = e.id
WHERE t.id = :templateId
GROUP BY t.id, t.user_id, t.name, t.created_at;
```

## 5. Security Considerations
- **Authentication**: Validate Bearer token via Supabase Auth middleware
- **Authorization**: Verify template belongs to requesting user
- **Input Validation**: 
  - Validate UUID format for template ID
  - Sanitize all inputs before database queries
- **Rate Limiting**: Apply standard API rate limits
- **SQL Injection Prevention**: Use parameterized queries

## 6. Error Handling

| Scenario | Status Code | Response |
|----------|-------------|-----------|
| Invalid/missing token | 401 | `{ "error": "Unauthorized" }` |
| Template belongs to another user | 403 | `{ "error": "Forbidden" }` |
| Template not found | 404 | `{ "error": "Template not found" }` |
| Invalid UUID format | 400 | `{ "error": "Invalid template ID" }` |
| Database error | 500 | `{ "error": "Internal server error" }` |

## 7. Performance Considerations
- Use single SQL query with JOIN and aggregation
- Index on templates(id, user_id)
- Index on template_exercises(template_id, position)
- Consider caching for frequently accessed templates
- Pagination not required (templates typically have <20 exercises)

## 8. Implementation Steps

1. **Create Types (src/types.ts)**
   - Add TemplateDetailsResponse interface
   - Add TemplateExerciseResponse interface

2. **Create Template Service (src/lib/services/template.service.ts)**
   - Implement getTemplateDetails method
   - Add error handling and type safety
   - Add database query with proper joins

3. **Create API Endpoint (src/pages/api/templates/[id].ts)**
   ```typescript
   export const GET: APIRoute = async ({ params, request }) => {
     const { id } = params;
     const userId = await getUserIdFromRequest(request);
     
     // Validate UUID
     if (!isValidUUID(id)) {
       return new Response(
         JSON.stringify({ error: "Invalid template ID" }), 
         { status: 400 }
       );
     }

     try {
       const template = await templateService.getTemplateDetails(id, userId);
       return new Response(JSON.stringify(template));
     } catch (error) {
       // Handle different error types
       return handleApiError(error);
     }
   }
   ```

4. **Add Error Handling**
   - Create custom error types
   - Implement error logging
   - Add error transformation utility
