# API Endpoint Implementation Plan: GET /api/templates

## 1. Endpoint Overview

This endpoint retrieves all workout templates belonging to the authenticated user. It supports pagination and sorting to efficiently handle large datasets. The response includes a list of templates with basic information (id, user_id, name, created_at) and the count of exercises associated with each template.

**Key Features:**
- User-specific template retrieval (filtered by authenticated user)
- Pagination support with configurable limit and offset
- Sorting by creation date or name
- Exercise count aggregation for each template

## 2. Request Details

- **HTTP Method:** GET
- **URL Structure:** `/api/templates`
- **Authentication:** Required (Bearer token in Authorization header)

### Parameters

**Required:**
- `Authorization` header: `Bearer {access_token}` - JWT token from Supabase Auth

**Optional Query Parameters:**
| Parameter | Type | Default | Validation | Description |
|-----------|------|---------|------------|-------------|
| `limit` | integer | 50 | 1 ≤ limit ≤ 100 | Maximum number of results per page |
| `offset` | integer | 0 | offset ≥ 0 | Number of records to skip for pagination |
| `sort` | string | "created_at" | enum: ["created_at", "name"] | Field to sort by |
| `order` | string | "desc" | enum: ["asc", "desc"] | Sort order (ascending/descending) |

### Request Body
None (GET request)

## 3. Used Types

All required types already exist in `src/types.ts`:

### Response DTOs
```typescript
// Main response type
TemplateListResponseDTO = PaginatedResponseDTO<TemplateListItemDTO>

// Individual template item
interface TemplateListItemDTO {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  exercise_count: number;
}

// Pagination metadata
interface PaginationDTO {
  limit: number;
  offset: number;
  total: number;
}
```

### Error DTOs
```typescript
// Generic error response
interface ErrorResponseDTO {
  error: string;
  message: string;
}

// Validation error response
interface ValidationErrorResponseDTO {
  error: string;
  details: ValidationErrorDetail[];
}

interface ValidationErrorDetail {
  field: string;
  message: string;
}
```

### Validation Schema (Zod)
Create inline validation schema in the endpoint:
```typescript
const queryParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(['created_at', 'name']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
});
```

## 4. Response Details

### Success Response (200 OK)
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

### Error Responses

**401 Unauthorized**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**400 Bad Request**
```json
{
  "error": "Validation Error",
  "details": [
    {
      "field": "limit",
      "message": "Must be between 1 and 100"
    }
  ]
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## 5. Data Flow

### Request Flow
1. **Middleware Layer** (`src/middleware/index.ts`)
   - Intercepts request
   - Extracts JWT token from Authorization header
   - Validates token with Supabase Auth
   - Attaches authenticated user and Supabase client to `context.locals`

2. **Endpoint Handler** (`src/pages/api/templates/index.ts`)
   - Receives request with authenticated context
   - Extracts and validates query parameters using Zod
   - Calls TemplateService with validated parameters

3. **Service Layer** (`src/lib/services/template.service.ts`)
   - Receives user_id and query options
   - Constructs Supabase query:
     - Filter by user_id
     - Join with template_exercises to count exercises
     - Apply sorting (created_at or name)
     - Apply pagination (limit and offset)
   - Fetches total count for pagination metadata
   - Returns TemplateListResponseDTO

4. **Response**
   - Endpoint handler receives service response
   - Returns JSON with 200 status code

### Database Query Pattern
```typescript
// Main query with exercise count
const { data: templates, error } = await supabase
  .from('templates')
  .select(`
    id,
    user_id,
    name,
    created_at,
    template_exercises(count)
  `)
  .eq('user_id', userId)
  .order(sort, { ascending: order === 'asc' })
  .range(offset, offset + limit - 1);

// Count query for total
const { count, error: countError } = await supabase
  .from('templates')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);
```

## 6. Security Considerations

### Authentication & Authorization
- **JWT Verification:** Middleware validates Bearer token using Supabase Auth
- **User Isolation:** All queries MUST filter by authenticated user_id from `context.locals.user`
- **No token = 401:** Reject requests without valid authentication immediately

### Data Access Control
- **Row-Level Security:** Templates are filtered by user_id to prevent cross-user data access
- **No RLS bypass:** Never use service role key for this endpoint
- **User context required:** Always use authenticated Supabase client from context.locals

### Input Validation
- **Parameter sanitization:** Zod validates all query parameters before processing
- **SQL injection prevention:** Supabase SDK uses parameterized queries
- **Type safety:** TypeScript ensures type correctness throughout the flow

### Rate Limiting & DoS Prevention
- **Limit cap:** Maximum limit set to 100 to prevent excessive data retrieval
- **Reasonable defaults:** Default limit of 50 balances performance and usability
- **Pagination required:** Large datasets must be paginated

### Data Exposure
- **Minimal fields:** Only return necessary fields (no sensitive data)
- **Exercise count only:** Don't expose full exercise details in list view
- **User_id included:** Allows frontend to verify data ownership

## 7. Error Handling

### Error Scenarios

| Scenario | Status Code | Response | Handling |
|----------|-------------|----------|----------|
| Missing/invalid token | 401 | `{ error: "Unauthorized", message: "Authentication required" }` | Middleware rejects request early |
| Invalid limit (< 1 or > 100) | 400 | Validation error with field details | Zod validation catches and formats error |
| Invalid offset (< 0) | 400 | Validation error with field details | Zod validation catches and formats error |
| Invalid sort field | 400 | Validation error with field details | Zod validation catches and formats error |
| Invalid order value | 400 | Validation error with field details | Zod validation catches and formats error |
| Database connection error | 500 | Generic error message | Log error, return safe message to client |
| Unexpected service error | 500 | Generic error message | Log error, return safe message to client |
| User has no templates | 200 | Empty data array with total: 0 | Valid response, not an error |

### Error Handling Strategy

**Validation Errors (400):**
```typescript
try {
  const params = queryParamsSchema.parse(url.searchParams);
} catch (error) {
  if (error instanceof z.ZodError) {
    return new Response(JSON.stringify({
      error: 'Validation Error',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    }), { status: 400 });
  }
}
```

**Service Errors (500):**
```typescript
try {
  const result = await templateService.getTemplates(userId, params);
  return new Response(JSON.stringify(result), { status: 200 });
} catch (error) {
  console.error('Error fetching templates:', error);
  return new Response(JSON.stringify({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  }), { status: 500 });
}
```

**Authentication Errors (401):**
Handled by middleware before reaching endpoint handler.

## 8. Performance Considerations

### Potential Bottlenecks
- **Large template counts:** Users with hundreds of templates may experience slow queries
- **Exercise count aggregation:** Counting exercises requires join operation
- **Multiple database queries:** Separate queries for data and total count

### Optimization Strategies

**Database Indexing:**
- Index on `templates.user_id` (likely already exists due to FK)
- Index on `templates.created_at` for sorting
- Index on `templates.name` for name-based sorting
- Composite index on `(user_id, created_at)` for optimal query performance

**Query Optimization:**
- Use single query with count when possible
- Leverage Supabase's built-in pagination
- Consider materialized view for exercise counts if performance degrades


**Response Size:**
- Minimal fields in list view (detailed view separate endpoint)
- Reasonable default limit (50) balances UX and performance
- Maximum limit cap (100) prevents excessive data transfer

## 9. Implementation Steps

### Step 1: Create Template Service
**File:** `src/lib/services/template.service.ts`

- Create `TemplateService` class or module
- Implement `getTemplates(supabase, userId, options)` method
- Build Supabase query with:
  - Filter by user_id
  - Select template fields + exercise count
  - Apply sorting based on options
  - Apply pagination with range()
- Execute count query for total
- Transform database response to `TemplateListResponseDTO`
- Handle database errors gracefully

### Step 2: Create Zod Validation Schema
**File:** `src/pages/api/templates/index.ts`

- Import Zod
- Define `queryParamsSchema` with:
  - limit: coerce to number, int, min 1, max 100, default 50
  - offset: coerce to number, int, min 0, default 0
  - sort: enum ["created_at", "name"], default "created_at"
  - order: enum ["asc", "desc"], default "desc"

### Step 3: Implement GET Handler
**File:** `src/pages/api/templates/index.ts`

- Export `export const prerender = false`
- Implement GET handler function
- Extract authenticated user from `context.locals.user`
- Return 401 if user not authenticated
- Parse and validate query parameters with Zod
- Handle validation errors (return 400 with details)
- Call `templateService.getTemplates()` with validated params
- Handle service errors (return 500)
- Return successful response with 200 status

### Step 4: Verify Middleware Configuration
**File:** `src/middleware/index.ts`

- Ensure middleware extracts JWT from Authorization header
- Verify Supabase client is attached to context.locals
- Confirm authenticated user is available in context.locals.user
- Test that unauthenticated requests are rejected

### Step 5: Add Type Exports (if needed)
**File:** `src/types.ts`

- Verify all required types are exported
- Confirm `TemplateListResponseDTO` is available
- Ensure `TemplateListItemDTO` matches API spec
- No new types needed (all exist)

