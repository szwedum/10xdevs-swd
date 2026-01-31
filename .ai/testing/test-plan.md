# GymRatPlanner - Test Plan (Course Project)

## 1. Introduction and Testing Objectives

### 1.1 Project Overview
GymRatPlanner is a web-based workout tracking application built with Astro 5, React 19, TypeScript 5, and Supabase. The application enables gym users to create reusable workout templates, log workouts with prefilled data from previous sessions, and track personal bests.

### 1.2 Testing Objectives
- **Ensure Core Functionality**: Verify that all MVP features work correctly
- **Validate Data Integrity**: Ensure database operations maintain consistency
- **Verify Security**: Confirm RLS policies protect user data
- **Regression Prevention**: Establish automated tests for critical paths

### 1.3 Success Criteria
- All critical user flows work without errors
- Security policies prevent unauthorized data access
- Input validation prevents invalid data entry
- 70%+ code coverage for business logic (services, API endpoints)

---

## 2. Scope of Testing

### 2.1 In Scope

**Critical Components**:
- Authentication (login, signup)
- Template management (create, list, delete)
- Workout logging (create, prefill data)
- Exercise search

**Critical API Endpoints**:
- `/api/auth/*` - Authentication
- `/api/templates` - Template CRUD
- `/api/workouts` - Workout CRUD
- `/api/exercises` - Exercise retrieval

**Database & Security**:
- RLS policies for user data isolation
- Personal best trigger functionality
- Input validation (Zod schemas)

### 2.2 Out of Scope
- Performance/load testing
- Cross-browser compatibility testing
- Accessibility testing (WCAG compliance)
- Advanced security penetration testing

---

## 3. Essential Test Types

### 3.1 Unit Tests (Priority: HIGH)

**Tools**: Vitest

**Focus Areas**:

**Service Layer** (`tests/unit/services/`):
- `template.service.test.ts` - Create, get, delete templates
- `workout.service.test.ts` - Create workout, prefill data

**Validation Schemas** (`tests/unit/validation/`):
- `template.schema.test.ts` - Template creation validation
- `workout.schema.test.ts` - Workout creation validation

**Key Test Cases**:
- Valid input acceptance
- Boundary values (sets: 1-99, reps: 1-99, weight: 0-999)
- Required field validation
- Duplicate template name rejection

### 3.2 Integration Tests (Priority: HIGH)

**Tools**: Vitest

**API Endpoints** (`tests/integration/api/`):
- `auth.test.ts` - Login, signup, logout
- `templates.test.ts` - CRUD operations, authorization
- `workouts.test.ts` - Create workout, prefill, list

**Database** (`tests/integration/database/`):
- `rls-policies.test.ts` - User data isolation
- `triggers.test.ts` - Personal best updates

**Key Test Cases**:
- Successful operations with valid data
- Unauthorized access prevention (401/403)
- Validation error handling (400)
- RLS policy enforcement
- Cascade deletes

### 3.3 E2E Tests (Priority: HIGH)

**Tools**: Playwright

**Critical User Flows** (`tests/e2e/`):
- `auth.spec.ts` - Complete auth flow
- `templates.spec.ts` - Create, view, delete template
- `workouts.spec.ts` - Log workout with prefill data

**Key Scenarios**:
1. **Authentication**: Signup → Login → Access protected page → Logout
2. **Template Creation**: Login → Create template → View in list → Delete
3. **Workout Logging**: Select template → Prefill form → Modify values → Submit → Verify personal best

---

## 4. Essential Test Scenarios (Condensed)

### 4.1 Authentication Flow (E2E)
- **Signup**: Valid registration → Session created → Redirect to templates
- **Login**: Valid credentials → Session created → Access granted
- **Logout**: Clear session → Redirect to login → Protected pages blocked
- **Edge Cases**: Duplicate email, invalid credentials, empty forms

### 4.2 Template Management (E2E + Integration)
- **Create**: Enter name → Add exercises → Set parameters → Save → Verify in list
- **View List**: Display all templates → Show exercise counts → Pagination
- **View Details**: Show template with all exercises → Preserve order
- **Delete**: Confirm deletion → Cascade to template_exercises → Remove from list
- **Edge Cases**: Duplicate names, invalid values (sets/reps/weight), empty list

### 4.3 Workout Logging (E2E + Integration)
- **Prefill**: Select template → Load form with last workout data or defaults
- **Submit**: Modify values → Save workout → Update personal bests → Show in history
- **View History**: List workouts chronologically → Show counts → Filter by date/template
- **Edge Cases**: First workout (no history), boundary values, network errors

### 4.4 Security & Data Integrity (Integration)
- **RLS Policies**: Users can only access their own data → 401/403 on unauthorized access
- **Personal Best Trigger**: New best updates table → Lower weight doesn't downgrade
- **Cascade Deletes**: Template deletion removes exercises → Workouts preserved
- **Validation**: Reject invalid inputs → Enforce constraints (unique names, value ranges)

### 4.5 Critical Edge Cases to Test
- Duplicate template names
- Boundary values: sets (1-99), reps (1-99), weight (0-999)
- Empty states (new user, no templates, no workouts)
- Unauthorized access attempts
- First-time workout (no previous data)
- Concurrent operations

---

## 5. Test Environment & Setup

### 5.1 Tools & Configuration
- **Node.js**: v22.14.0
- **Test Runner**: Vitest (unit/integration)
- **E2E Framework**: Playwright
- **Database**: Supabase (separate test project)

### 5.2 Test Database
- Reset state before each test suite
- Seed with test data (users, exercises)
- Use transactions for isolation

### 5.3 CI/CD (GitHub Actions)
- Unit tests on every commit
- Integration + E2E tests on pull requests
- Coverage reports (70%+ target)

---

## 6. Test Execution Strategy

### 6.1 Execution Order
1. Unit tests (validation, services)
2. Integration tests (API, database)
3. E2E tests (critical flows)

### 6.2 When to Run
- **On Commit**: Unit tests (Husky hook)
- **On PR**: Unit + Integration tests
- **Before Merge**: Full suite including E2E

### 6.3 Coverage Targets
- **Service Layer & API**: 70%+
- **Validation Schemas**: 90%+
- **Overall Project**: 70%+

---

## 7. Key Risks & Mitigation

### 7.1 Critical Risks
1. **RLS Policy Bypass** → Extensive RLS testing, security audit
2. **Data Loss on Workout Submit** → E2E tests, transaction rollback
3. **Personal Best Errors** → Trigger tests, concurrent operation tests

### 7.2 Medium Risks
4. **Auth Token Expiration** → Test session scenarios
5. **Invalid Input Handling** → Comprehensive validation tests

---

## 8. Test Suite Structure

```
tests/
├── unit/
│   ├── services/          # template.service.test.ts, workout.service.test.ts
│   └── validation/        # template.schema.test.ts, workout.schema.test.ts
├── integration/
│   ├── api/              # auth.test.ts, templates.test.ts, workouts.test.ts
│   └── database/         # rls-policies.test.ts, triggers.test.ts
└── e2e/
    ├── auth.spec.ts      # Complete auth flow
    ├── templates.spec.ts # Template CRUD
    └── workouts.spec.ts  # Workout logging with prefill
```

### 8.1 Configuration Files

**vitest.config.ts** - Basic setup with jsdom, coverage thresholds (70%+)
**playwright.config.ts** - E2E setup for chromium, baseURL: localhost:3000

### 8.2 NPM Scripts (add to package.json)
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 9. Quick Start Guide

### 9.1 Setup
1. Install dependencies: `npm install -D vitest @vitest/ui @testing-library/react playwright`
2. Create test directories: `mkdir -p tests/{unit,integration,e2e}`
3. Configure Vitest and Playwright (see section 8.1)

### 9.2 Writing Your First Test
```typescript
// tests/unit/validation/template.schema.test.ts
import { describe, it, expect } from 'vitest';
import { createTemplateSchema } from '@/lib/validation/template.schema';

describe('Template Schema Validation', () => {
  it('should accept valid template data', () => {
    const validData = {
      name: 'Push Day',
      exercises: [{ exercise_id: 'uuid', sets: 4, reps: 8, default_weight: 80, position: 0 }]
    };
    expect(() => createTemplateSchema.parse(validData)).not.toThrow();
  });

  it('should reject duplicate template names', () => {
    // Test implementation
  });
});
```

### 9.3 Running Tests
- **Development**: `npm run test` (watch mode)
- **CI**: `npm run test:unit && npm run test:integration && npm run test:e2e`
- **Coverage**: `npm run test:coverage`

---

## 10. Test Data Examples

### 10.1 Sample Test Data

**User**:
```json
{ "email": "test@example.com", "password": "TestPassword123!" }
```

**Template**:
```json
{
  "name": "Push Day",
  "exercises": [{
    "exercise_id": "uuid-bench-press",
    "sets": 4,
    "reps": 8,
    "default_weight": 80,
    "position": 0
  }]
}
```

**Workout**:
```json
{
  "template_id": "uuid-template",
  "exercises": [{
    "exercise_id": "uuid-bench-press",
    "position": 0,
    "sets": [
      { "set_index": 0, "reps": 8, "weight": 80 },
      { "set_index": 1, "reps": 8, "weight": 82.5 }
    ]
  }]
}
```

---

## 11. Common Test Patterns

### 11.1 API Test Pattern
```typescript
describe('POST /api/templates', () => {
  it('should create template with valid data', async () => {
    const response = await request(app)
      .post('/api/templates')
      .send(validTemplate)
      .set('Cookie', authCookie);
    
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: validTemplate.name });
  });
});
```

### 11.2 E2E Test Pattern
```typescript
test('user can create template', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.goto('/templates/new');
  await page.fill('[name="name"]', 'Test Template');
  // Add exercises...
  await page.click('button:has-text("Save")');
  
  await expect(page.locator('text=Test Template')).toBeVisible();
});
```

---

## 12. Summary

This test plan focuses on **essential tests** for the GymRatPlanner course project:

**Priority Tests**:
1. ✅ Unit tests for services and validation (70%+ coverage)
2. ✅ Integration tests for API endpoints and RLS policies
3. ✅ E2E tests for critical user flows (auth, templates, workouts)

**Key Benefits**:
- Comprehensive coverage with minimal test overhead
- Focus on high-risk areas (security, data integrity)
- Practical for course project timeline
- Establishes foundation for future expansion

**Next Steps**:
1. Set up Vitest and Playwright
2. Start with unit tests (validation schemas)
3. Add integration tests (API + RLS)
4. Complete with E2E tests (critical flows)

