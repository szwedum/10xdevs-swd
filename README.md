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
  - PostgreSQL database
  - Built-in user authentication
  - Real-time subscriptions
  - RESTful API

### CI/CD
- **GitHub Actions** - Automated testing and deployment pipelines

### Development Tools
- **ESLint** - Code linting and quality checks
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **lint-staged** - Run linters on staged files

## Getting Started Locally

### Prerequisites

- **Node.js**: Version 22.14.0 (specified in `.nvmrc`)
  - We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions
  - Run `nvm use` in the project directory to automatically switch to the correct version

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 10xdevs-swd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the project root with your Supabase credentials:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
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

🚧 **Current Status**: MVP Development Phase

This project is currently in active development as a Minimum Viable Product (MVP). The focus is on delivering core workout tracking functionality with a clean, simple user experience.

### Success Metrics

The MVP will be considered successful if:
- **90%** of users create templates with completed workout results within 30 days of sign-up
- **75%** of users create 3 or more templates within 30 days of sign-up
- Users log an average of **3+ workouts per week**
- **30%** of completed workouts result in at least one new personal best

## License

This project is licensed under the MIT License - see the LICENSE file for details (if available).

---

**Built with ❤️ for gym enthusiasts who want to track their progress and crush their personal bests.**
