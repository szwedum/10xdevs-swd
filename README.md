# GymRatPlanner

A web-based workout tracking application designed to help gym users record, track, and improve their training performance. GymRatPlanner focuses on creating reusable workout templates and logging workout results to track personal progress over time.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

GymRatPlanner solves a common problem for gym users: remembering the weights, sets, and reps achieved in previous workouts. The application provides a focused, template-based system that automatically remembers previous workout data and highlights personal bests.

### Key Features

- **Workout Templates**: Create reusable workout templates with predefined exercises, sets, reps, and weights
- **Smart Workout Logging**: Log workouts with prefilled data from your last session for each exercise
- **Personal Best Tracking**: Automatically track and update your personal bests for each exercise
- **Exercise Library**: Browse and search through a predefined exercise library
- **User Authentication**: Secure email/password authentication with JWT tokens
- **Responsive Design**: Works seamlessly on desktop and mobile browsers

### Target Users

Gym users who follow structured workout routines and want to track their progress without complex analytics or social features. Perfect for anyone who wants to beat their previous performance and ensure progressive overload.

## Tech Stack

### Frontend
- **[Astro 5](https://astro.build/)** - Fast, modern web framework for building performant applications with minimal JavaScript
- **[React 19](https://react.dev/)** - UI library for interactive components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Static typing for improved code quality and IDE support
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI development
- **[Shadcn/ui](https://ui.shadcn.com/)** - Accessible component library built with Radix UI
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend
- **[Supabase](https://supabase.com/)** - Open-source Backend-as-a-Service providing:
  - PostgreSQL database with Row-Level Security (RLS)
  - Built-in user authentication with JWT tokens
  - Real-time subscriptions
  - RESTful API
  - Database migrations and version control

#### Database Architecture
The application uses a PostgreSQL database with the following schema:
- **exercises** - Exercise library (bench press, squat, deadlift, etc.)
- **templates** - User-created workout templates
- **template_exercises** - Exercises within templates with sets/reps/weight configuration
- **workouts** - Logged workout sessions
- **workout_exercises** - Exercises performed in a workout
- **workout_sets** - Individual sets logged during workouts
- **personal_bests** - Tracks maximum weight achieved per exercise per user
- **analytics.event_log** - User activity tracking (partitioned by month)

All tables implement Row-Level Security (RLS) policies to ensure users can only access their own data.

### CI/CD
- **GitHub Actions** - Automated testing and deployment pipelines

### Development Tools
- **ESLint** - Code linting and quality checks
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files

### Testing
- **[Vitest](https://vitest.dev/)** - Fast unit and integration testing framework
  - Unit tests for services and validation schemas
  - Integration tests for API endpoints and database operations
  - Coverage reporting (70%+ target for business logic)
- **[Playwright](https://playwright.dev/)** - End-to-end testing framework
  - E2E tests for critical user flows (authentication, templates, workouts)
  - Cross-browser testing capabilities
  - Automated UI testing

## Getting Started Locally

### Prerequisites

- **Node.js**: Version 22.14.0 (specified in `.nvmrc`)
  - We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions
  - Run `nvm use` in the project directory to automatically switch to the correct version

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/szwedum/10xdevs-swd.git
   cd 10xdevs-swd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   
   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Run the database migrations from the `supabase/migrations` directory:
      - `20260128141700_initial_schema.sql` - Creates all tables and relationships
      - `20260128144010_disable_rls_policies.sql` - Initial RLS setup
      - `20260131163900_enable_rls_policies.sql` - Enables Row-Level Security
   
   c. Seed the exercise library (optional but recommended):
      ```bash
      npm run seed:exercises
      ```

4. **Set up environment variables**
   
   Create a `.env` file in the project root with your Supabase credentials:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:4321` (or the port shown in your terminal)

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Astro development server with hot module replacement |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run astro` | Run Astro CLI commands directly |
| `npm run lint` | Check code for linting errors using ESLint |
| `npm run lint:fix` | Automatically fix linting errors where possible |
| `npm run format` | Format code using Prettier |
| `npm run test` | Run tests in watch mode (Vitest) |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |
| `npm run test:coverage` | Generate test coverage report |
| `npm run seed:exercises` | Seed the test database with exercise data (required for e2e tests) |

## Project Structure

```
10xdevs-swd/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── navigation/     # Navigation and layout components
│   │   ├── templates/      # Template management components
│   │   ├── workout/        # Workout logging components
│   │   └── ui/             # Reusable UI components (shadcn/ui)
│   ├── layouts/            # Astro layout components
│   ├── lib/
│   │   ├── services/       # Business logic and API clients
│   │   ├── hooks/          # React custom hooks
│   │   └── contexts/       # React context providers
│   ├── pages/              # Astro pages and API routes
│   │   ├── api/           # REST API endpoints
│   │   ├── templates/     # Template pages
│   │   └── workout/       # Workout pages
│   └── db/                 # Database client and types
├── supabase/
│   └── migrations/         # Database schema migrations
├── tests/
│   ├── unit/              # Unit tests (Vitest)
│   ├── integration/       # Integration tests (Vitest)
│   └── e2e/               # End-to-end tests (Playwright)
└── scripts/               # Utility scripts (e.g., database seeding)
```

## API Endpoints

The application provides a RESTful API built with Astro server endpoints:

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user and return session
- `POST /api/auth/logout` - End user session

### Exercises
- `GET /api/exercises` - List all available exercises
- `GET /api/exercises?search=query` - Search exercises by name

### Templates
- `GET /api/templates` - Get all templates for authenticated user
- `POST /api/templates` - Create new workout template
- `DELETE /api/templates/:id` - Delete a template

### Workouts
- `GET /api/workouts/:templateId` - Get workout data prefilled from last session
- `POST /api/workouts` - Log a completed workout
- `GET /api/workouts/personal-bests` - Get all personal bests for the user

All API endpoints (except auth) require authentication via session cookies. The API returns JSON responses and uses standard HTTP status codes.

## Testing

### Running Tests

The project includes comprehensive testing at multiple levels:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user flows in a real browser environment

### E2E Test Setup

**Important**: Before running e2e tests for the first time, you need to seed the test database with exercise data.

1. **Create a `.env.test` file** in the project root with your test environment credentials:
   ```env
   SUPABASE_URL=your_test_supabase_url
   SUPABASE_KEY=your_test_supabase_anon_key
   E2E_USERNAME=test@example.com
   E2E_PASSWORD=your_test_password
   ```

2. **Seed the exercise database** (one-time setup):
   ```bash
   npm run seed:exercises
   ```
   
   This command will:
   - Authenticate with your test Supabase instance
   - Insert 46 predefined exercises (Bench Press, Squat, Deadlift, etc.)
   - Skip exercises that already exist (safe to run multiple times)
   
   **Note**: The exercises are associated with the test user account and will be cleaned up after each test run by the global teardown. You'll need to re-run this command if the test database is reset or after running the full e2e test suite.

3. **Run the e2e tests**:
   ```bash
   npm run test:e2e
   ```

### Test Database Management

The e2e tests use a separate test database to avoid affecting your development data:

- **Global Setup**: Creates/authenticates the test user and performs browser login
- **Global Teardown**: Cleans up test data (templates and exercises) after all tests complete
- **Exercise Seeding**: Must be done manually before running tests (see above)

If you encounter "Exercise not found" errors during e2e tests, re-run the seed command:
```bash
npm run seed:exercises
```

## Deployment

The application can be deployed to any platform that supports Node.js applications. The project is configured with:

- **Server-side rendering (SSR)** using Astro with Node.js adapter
- **Environment variables** for Supabase configuration
- **Production build** optimized for performance

### Recommended Deployment Platforms

- **[Vercel](https://vercel.com)** - Zero-config deployment for Astro applications
- **[Netlify](https://netlify.com)** - Supports Astro SSR with Node.js
- **[Railway](https://railway.app)** - Simple deployment with automatic HTTPS
- **[Fly.io](https://fly.io)** - Deploy as a Docker container

### Deployment Steps

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment variables on your hosting platform:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`

3. Deploy the `dist/` directory with Node.js runtime

4. Ensure your Supabase project allows connections from your deployment domain

## Project Scope

### MVP Features (In Scope)

✅ **Core Functionality**
- Web application for desktop and mobile browsers
- Email and password authentication with JWT tokens
- Workout template CRUD operations (Create, Read, Delete)
- Workout logging with prefilled data from previous sessions
- Personal best tracking per exercise globally
- Basic predefined exercise library with text search
- Event logging for user actions (template creation, workout completion)
- Confirmation dialogs for destructive actions

✅ **User Experience**
- Responsive design for mobile and desktop browsers
- Simple navigation between Templates and Workout Logging
- Input validation for sets (1-99), reps (1-99), and weight (max 999 kg)
- Clear error messages and user feedback

### Out of Scope for MVP

❌ **Not Included**
- Native mobile applications (iOS/Android)
- User profile management (age, sex, weight, height, location)
- Custom exercise creation
- Template editing (users can delete and recreate templates)
- Adding/removing sets during workout
- Guided onboarding flow
- Sharing workout templates between users
- Social features or user interactions
- Advanced analytics or result analysis dashboards
- Workout history visualization or charts
- Exercise grouping or categorization
- Advanced exercise parameters (tempo, rest time, RPE, notes)
- Password reset and email verification flows
- Workout editing or deletion after completion
- Multi-device synchronization with conflict resolution

### Future Considerations (Post-MVP)

🔮 **Planned for Future Releases**
- User profile management
- Custom exercise creation
- Template editing functionality
- Dynamic set management during workouts
- Guided onboarding experience
- Template sharing between users
- Workout result analysis and progress visualization
- Advanced exercise library with categorization
- Workout history editing and deletion
- Password reset and account recovery
- Advanced analytics dashboard

## Project Status

✅ **Current Status**: MVP Complete

The Minimum Viable Product (MVP) has been successfully implemented with all core features fully functional. The application delivers a complete workout tracking experience with template management, workout logging, and personal best tracking.

### Implemented Features

All MVP features have been completed and tested:
- ✅ User authentication (signup, login, logout)
- ✅ Workout template creation and management
- ✅ Exercise library with search functionality
- ✅ Workout logging with prefilled data from previous sessions
- ✅ Personal best tracking and automatic updates
- ✅ Responsive design for mobile and desktop
- ✅ Input validation and error handling
- ✅ Comprehensive test coverage (unit, integration, and E2E tests)

### Success Metrics

The MVP will be considered successful if:
- **90%** of users create templates with completed workout results within 30 days of sign-up
- **75%** of users create 3 or more templates within 30 days of sign-up
- Users log an average of **3+ workouts per week**
- **30%** of completed workouts result in at least one new personal best

## Contributing

Contributions are welcome! This project follows standard development practices:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Run tests to ensure everything works:
   ```bash
   npm run lint
   npm run test:unit
   npm run test:integration
   npm run test:e2e
   ```
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Quality

- All code must pass ESLint and Prettier checks
- Maintain or improve test coverage
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features

## License

This project is licensed under the MIT License - see the LICENSE file for details (if available).

---

## Additional Resources

- **[Astro Documentation](https://docs.astro.build/)** - Learn about Astro framework
- **[Supabase Documentation](https://supabase.com/docs)** - Database and authentication setup
- **[Tailwind CSS Documentation](https://tailwindcss.com/docs)** - Styling reference
- **[Playwright Documentation](https://playwright.dev/)** - E2E testing guide

---

**Built with ❤️ for gym enthusiasts who want to track their progress and crush their personal bests.**
