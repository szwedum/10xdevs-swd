# Authentication Architecture Specification - GymRatPlanner

## Document Overview

Technical architecture for user registration, login, and logout in GymRatPlanner using Astro 5 + React + Supabase Auth.

**MVP SCOPE**: This specification covers ONLY the authentication features defined in the PRD. Password reset and email verification are explicitly OUT OF SCOPE for MVP and will be implemented post-MVP.

---

## 1. USER INTERFACE ARCHITECTURE

### 1.1 Page Structure

#### Public Pages (Unauthenticated)

**Landing Page** (`/src/pages/index.astro`)
- **Status**: Exists
- **Behavior**: Check session cookies → redirect authenticated users to `/templates`, show landing page for unauthenticated
- **Layout**: `BaseLayout.astro` with public `NavigationHeader.astro`

**Login Page** (`/src/pages/login.astro`)
- **Status**: Exists
- **Components**: `LoginForm` (React, `client:load`)
- **Layout**: `AuthLayout.astro`
- **No changes required**

**Sign Up Page** (`/src/pages/signup.astro`)
- **Status**: Exists
- **Components**: `SignUpForm` (React, `client:load`)
- **Layout**: `AuthLayout.astro`
- **No changes required**

#### Protected Pages (Authenticated)

**Standard Authentication Pattern** (all protected pages):
```typescript
export const prerender = false;

const accessToken = Astro.cookies.get("sb-access-token")?.value;
const refreshToken = Astro.cookies.get("sb-refresh-token")?.value;

if (!accessToken || !refreshToken) {
  return Astro.redirect("/login");
}

const supabase = createClient<Database>(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_KEY
);

const { data: { session }, error } = await supabase.auth.setSession({
  access_token: accessToken,
  refresh_token: refreshToken,
});

if (error || !session) {
  Astro.cookies.delete("sb-access-token", { path: "/" });
  Astro.cookies.delete("sb-refresh-token", { path: "/" });
  return Astro.redirect("/login");
}
```

**Pages requiring this pattern**:
- `/src/pages/templates.astro` ✓ (implemented)
- `/src/pages/templates/[id].astro` (needs implementation)
- `/src/pages/templates/new.astro` (needs implementation)
- `/src/pages/workouts.astro` (needs implementation)
- `/src/pages/workout/[id].astro` (needs implementation)
- `/src/pages/workout/active.astro` (needs implementation)

### 1.2 React Components

#### LoginForm (`/src/components/auth/LoginForm.tsx`)
- **Status**: Exists, functional
- **No changes required**
- **Responsibilities**: Email/password form, validation, API call to `/api/auth/login`, redirect to `/templates`

#### SignUpForm (`/src/components/auth/SignUpForm.tsx`)
- **Status**: Exists, functional
- **No changes required**
- **Responsibilities**: Email/password/confirm form, password matching validation, API call to `/api/auth/signup`

### 1.3 Validation & Error Messages

#### Client-Side Validation
- **Email**: HTML5 `type="email"` + browser validation
- **Required**: HTML5 `required` attribute
- **Password Matching**: JavaScript comparison before API call
- **Error Display**: Inline error banner + toast notifications

#### Server-Side Validation (Zod)
- **Email**: `z.string().email("Invalid email address")`
- **Password**: `z.string().min(6, "Password must be at least 6 characters")`
- **HTTP 400**: Validation errors
- **HTTP 401**: Authentication failures
- **HTTP 500**: Internal server errors

#### Error Messages
- **Invalid Credentials**: "Invalid login credentials" (401)
- **Email Exists**: "User already registered" (400)
- **Network Error**: "Network error. Please check your connection" (toast)
- **Server Error**: "An unexpected error occurred" (500)

### 1.4 User Flow Scenarios

#### Registration Flow
1. User → `/signup` → enters email/password/confirm
2. Client validates password matching
3. POST `/api/auth/signup` → Supabase creates user
4. Set cookies (`sb-access-token`, `sb-refresh-token`)
5. Redirect to `/templates`

#### Login Flow
1. User → `/login` → enters email/password
2. POST `/api/auth/login` → Supabase validates credentials
3. Set cookies
4. Redirect to `/templates`

#### Logout Flow
1. User clicks "Log out" button
2. POST `/api/auth/logout` → Supabase invalidates session
3. Delete cookies
4. Redirect to `/login`

---

## 2. BACKEND LOGIC

### 2.1 API Endpoints

#### POST /api/auth/signup
- **Status**: Exists, functional
- **Request**: `{ email: string, password: string }`
- **Validation**: Zod schema (email format, password min 6 chars)
- **Process**: `supabaseClient.auth.signUp()` → set cookies
- **Response**: 201 with `{ message, user: { id, email } }`
- **No changes required**

#### POST /api/auth/login
- **Status**: Exists, functional
- **Request**: `{ email: string, password: string }`
- **Validation**: Zod schema
- **Process**: `supabaseClient.auth.signInWithPassword()` → set cookies
- **Response**: 200 with `{ message, user: { id, email } }`
- **No changes required**

#### POST /api/auth/logout
- **Status**: Exists, functional
- **Process**: Retrieve cookies → `supabaseClient.auth.signOut()` → delete cookies
- **Response**: 200 with `{ message }`
- **No changes required**

### 2.2 Cookie Management

**Cookie Configuration**:
```typescript
{
  path: "/",
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,    // 7 days (access token)
  maxAge: 60 * 60 * 24 * 30,   // 30 days (refresh token)
}
```

**Cookies**:
- `sb-access-token`: JWT access token
- `sb-refresh-token`: Long-lived refresh token

### 2.3 Service Layer Updates

**Current Issue**: Services use `DEFAULT_USER_ID` constant

**Required Changes**:
1. Remove `DEFAULT_USER_ID` from `/src/db/supabase.client.ts`
2. Update all service methods to accept `userId: string` parameter
3. Update all API endpoints to extract `userId` from session
4. Pass `userId` to service methods

**Example Service Pattern**:
```typescript
export async function getTemplates(
  supabase: SupabaseClient<Database>,
  userId: string,  // From session.user.id
  limit: number,
  offset: number
): Promise<{ templates: TemplateListItemDTO[]; total: number }> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", userId)  // Explicit filter + RLS enforcement
    .range(offset, offset + limit - 1);
  // ...
}
```

**API Endpoint Pattern**:
```typescript
export const POST: APIRoute = async ({ locals, cookies }) => {
  const accessToken = cookies.get("sb-access-token")?.value;
  const refreshToken = cookies.get("sb-refresh-token")?.value;

  if (!accessToken || !refreshToken) {
    return new Response(JSON.stringify({
      error: "Unauthorized",
      message: "Authentication required",
    }), { status: 401 });
  }

  const supabase = locals.supabase;
  const { data: { session }, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !session) {
    return new Response(JSON.stringify({
      error: "Unauthorized",
      message: "Invalid or expired session",
    }), { status: 401 });
  }

  const userId = session.user.id;  // Extract user ID
  // Pass userId to service methods
};
```

### 2.4 Type Definitions

**Add to `/src/types.ts`**:
```typescript
// ============================================================================
// Authentication DTOs
// ============================================================================

export interface AuthUserDTO {
  id: string;
  email: string;
}

export interface LoginResponseDTO extends SuccessMessageDTO {
  user: AuthUserDTO;
}

export interface SignupResponseDTO extends SuccessMessageDTO {
  user: AuthUserDTO;
}
```

### 2.5 Middleware Enhancement (Optional)

**Current** (`/src/middleware/index.ts`):
```typescript
export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});
```

**Enhanced** (optional optimization):
```typescript
export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.supabase = supabaseClient;
  
  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;
  
  if (accessToken && refreshToken) {
    const { data: { session } } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    
    if (session) {
      context.locals.session = session;
      context.locals.user = session.user;
    }
  }
  
  return next();
});
```

**Update `/src/env.d.ts`**:
```typescript
import type { SupabaseClient, Session, User } from "@supabase/supabase-js";
import type { Database } from "./db/database.types.ts";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      session?: Session;
      user?: User;
    }
  }
}
```

---

## 3. AUTHENTICATION SYSTEM

### 3.1 Supabase Auth Methods

**Sign Up**:
```typescript
const { data, error } = await supabaseClient.auth.signUp({
  email: string,
  password: string,
});
```

**Sign In**:
```typescript
const { data, error } = await supabaseClient.auth.signInWithPassword({
  email: string,
  password: string,
});
```

**Sign Out**:
```typescript
const { error } = await supabaseClient.auth.signOut();
```

**Set Session** (validate tokens):
```typescript
const { data: { session }, error } = await supabaseClient.auth.setSession({
  access_token: string,
  refresh_token: string,
});
```

### 3.2 Session Management

**Session Structure**:
```typescript
{
  access_token: string;      // JWT, 1 hour default
  refresh_token: string;     // 30 days default
  expires_at: number;
  expires_in: number;
  user: {
    id: string;              // User UUID
    email: string;
  };
}
```

**Token Refresh**:
- Automatic via `setSession()` when access token expired
- Refresh token used to obtain new access token
- If refresh token expired → user must log in again

**Session Validation**:
1. Retrieve tokens from cookies
2. Call `setSession()` with tokens
3. Supabase validates and auto-refreshes if needed
4. Return session object or error

### 3.3 RLS Policies

**Database-Level Security**: All tables enforce Row-Level Security

**Policy Pattern**:
```sql
CREATE POLICY "Users can access own data"
ON table_name FOR ALL
USING (auth.uid() = user_id);
```

**Tables with RLS**:
- `templates`: `user_id = auth.uid()`
- `template_exercises`: Via join to `templates`
- `workouts`: `user_id = auth.uid()`
- `workout_exercises`: Via join to `workouts`
- `workout_sets`: Via join to `workout_exercises`
- `personal_bests`: `user_id = auth.uid()`
- `analytics.event_log`: `user_id = auth.uid()`

**Exercises Table** (special case):
- `SELECT`: All authenticated users
- `INSERT/UPDATE/DELETE`: Only if `created_by = auth.uid()` OR `created_by IS NULL`

---

## 4. IMPLEMENTATION CHECKLIST

### Type Definitions
- [ ] Add `AuthUserDTO`, `LoginResponseDTO`, `SignupResponseDTO` to `/src/types.ts`
- [ ] Update `App.Locals` in `/src/env.d.ts` (optional)

### Service Layer
- [ ] Remove `DEFAULT_USER_ID` from `/src/db/supabase.client.ts`
- [ ] Update all service methods to accept `userId` parameter
- [ ] Update all API endpoints to extract `userId` from session
- [ ] Update all API endpoints to pass `userId` to services

### Page Authentication
- [ ] `/src/pages/templates/[id].astro`
- [ ] `/src/pages/templates/new.astro`
- [ ] `/src/pages/workouts.astro`
- [ ] `/src/pages/workout/[id].astro`
- [ ] `/src/pages/workout/active.astro`

### Configuration
- [ ] Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- [ ] **DISABLE** email confirmation in Supabase Dashboard (Auth > Providers > Email > Confirm email: OFF)
- [ ] Ensure auto-confirm is enabled for immediate user access after signup

---

## 5. SECURITY CONSIDERATIONS

### Token Security
- **Storage**: httpOnly cookies (not accessible to JavaScript)
- **Transmission**: HTTPS in production (secure flag)
- **Expiration**: Access token 1 hour, refresh token 30 days

### Password Security
- **Hashing**: bcrypt (Supabase managed)
- **Minimum**: 6 characters (enforced client + server)
- **Reset**: Not implemented in MVP (out of scope)

### Session Security
- **Validation**: Every protected page/API request
- **Invalidation**: Logout invalidates on Supabase
- **Refresh**: Automatic via `setSession()`

### CSRF Protection
- **SameSite**: `sameSite: "lax"` on cookies
- **Origin**: Supabase validates request origin

### XSS Protection
- **httpOnly**: Tokens not accessible to JavaScript
- **Sanitization**: React auto-escapes output

### Data Isolation
- **RLS**: Database-level enforcement
- **User ID**: Explicit filtering in services
- **Session**: User ID from validated session

### Rate Limiting
- **Supabase**: Automatic rate limiting on auth endpoints
- **Brute Force**: Automatic lockout after failed attempts

---

## 6. COMPATIBILITY WITH EXISTING FEATURES

### Template Management
- **Before**: Templates use `DEFAULT_USER_ID`
- **After**: Templates associated with authenticated user's ID
- **Migration**: Update service methods and API endpoints to use session user ID
- **RLS**: Ensures users only access own templates

### Workout Logging
- **Before**: Workouts use `DEFAULT_USER_ID`
- **After**: Workouts associated with authenticated user's ID
- **Migration**: Same as templates
- **RLS**: Ensures users only access own workouts

### Personal Bests
- **Before**: Personal bests use `DEFAULT_USER_ID`
- **After**: Personal bests per authenticated user
- **Migration**: Same as templates
- **RLS**: Ensures users only access own personal bests

### Exercise Library
- **Behavior**: Shared across all users (read-only)
- **No Changes**: Exercises remain public for all authenticated users
- **RLS**: SELECT allowed for all, INSERT/UPDATE/DELETE restricted

### Navigation
- **Before**: No authentication-aware navigation
- **After**: "Log out" button in authenticated navigation
- **Current**: Already implemented in `NavigationHeader.astro`

### Landing Page
- **Before**: Static landing page
- **After**: Redirects authenticated users to `/templates`
- **Current**: Already implemented in `/src/pages/index.astro`

---

## 7. MVP SCOPE ALIGNMENT

### In Scope (MVP)
- ✅ Email/password signup
- ✅ Email/password login
- ✅ Logout
- ✅ Session management with Supabase Auth
- ✅ httpOnly cookie-based token storage
- ✅ RLS policies for data isolation
- ✅ Protected page authentication
- ✅ User-specific data access

### Out of Scope (Post-MVP)
- ❌ Password reset/recovery flows
- ❌ Email verification
- ❌ Password complexity rules
- ❌ Account recovery mechanisms
- ❌ "Forgot password?" functionality

**Rationale**: Per PRD Section 4.2, password reset and email verification are explicitly excluded from MVP to focus on core workout tracking functionality. These features will be added in post-MVP iterations.

---

## 8. SUMMARY

This specification provides an MVP authentication architecture for GymRatPlanner using Supabase Auth integrated with Astro 5 SSR. Key components:

1. **UI Layer**: Public pages (login, signup) and protected pages with session validation
2. **API Layer**: RESTful endpoints for signup, login, and logout with Zod validation
3. **Service Layer**: Updated to accept user ID from authenticated sessions
4. **Security**: httpOnly cookies, RLS policies, automatic token refresh
5. **Compatibility**: Seamless integration with existing template and workout features

All existing functionality preserved while adding secure, user-isolated data access. Password reset and email verification deferred to post-MVP per PRD requirements.
