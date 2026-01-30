import type { Tables, TablesInsert, TablesUpdate } from './db/database.types';

// ============================================================================
// Base Entity Types (Direct mappings from database)
// ============================================================================

export type Exercise = Tables<'exercises'>;
export type Template = Tables<'templates'>;
export type TemplateExercise = Tables<'template_exercises'>;
export type Workout = Tables<'workouts'>;
export type WorkoutExercise = Tables<'workout_exercises'>;
export type WorkoutSet = Tables<'workout_sets'>;
export type PersonalBest = Tables<'personal_bests'>;

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationDTO {
    limit: number;
    offset: number;
    total: number;
}

export interface PaginatedResponseDTO<T> {
    data: T[];
    pagination: PaginationDTO;
}

// ============================================================================
// Exercise DTOs
// ============================================================================

export type ExerciseDTO = Exercise;

export type ExerciseListResponseDTO = PaginatedResponseDTO<ExerciseDTO>;

// ============================================================================
// Template DTOs
// ============================================================================

export interface TemplateListItemDTO extends Pick<Template, 'id' | 'user_id' | 'name' | 'created_at'> {
    exercise_count: number;
}

export type TemplateListResponseDTO = PaginatedResponseDTO<TemplateListItemDTO>;

export interface TemplateExerciseDTO extends Omit<TemplateExercise, 'default_weight'> {
    exercise_name: string;
    default_weight: number | null;
}

export interface TemplateDetailDTO extends Pick<Template, 'id' | 'user_id' | 'name' | 'created_at'> {
    exercises: TemplateExerciseDTO[];
}

// ============================================================================
// Template Command Models (for creating templates)
// ============================================================================

export interface CreateTemplateExerciseCommand {
    exercise_id: string;
    sets: number;
    reps: number;
    default_weight?: number | null;
    position: number;
}

export interface CreateTemplateCommand {
    name: string;
    exercises: CreateTemplateExerciseCommand[];
}

// ============================================================================
// Workout DTOs
// ============================================================================

export interface WorkoutListItemDTO extends Pick<Workout, 'id' | 'user_id' | 'template_id' | 'logged_at'> {
    template_name: string | null;
    exercise_count: number;
    total_sets: number;
}

export type WorkoutListResponseDTO = PaginatedResponseDTO<WorkoutListItemDTO>;

export type WorkoutSetDTO = WorkoutSet;

export interface WorkoutExerciseDTO extends Pick<WorkoutExercise, 'id' | 'workout_id' | 'exercise_id' | 'position'> {
    exercise_name: string;
    sets: WorkoutSetDTO[];
}

export interface WorkoutDetailDTO extends Pick<Workout, 'id' | 'user_id' | 'template_id' | 'logged_at'> {
    template_name: string | null;
    exercises: WorkoutExerciseDTO[];
}

// ============================================================================
// Workout Command Models (for creating workouts)
// ============================================================================

export interface CreateWorkoutSetCommand {
    set_index: number;
    reps: number;
    weight: number;
}

export interface CreateWorkoutExerciseCommand {
    exercise_id: string;
    position: number;
    sets: CreateWorkoutSetCommand[];
}

export interface CreateWorkoutCommand {
    template_id?: string | null;
    logged_at?: string;
    exercises: CreateWorkoutExerciseCommand[];
}

// ============================================================================
// Workout Creation Response (includes personal best updates)
// ============================================================================

export interface PersonalBestUpdateDTO {
    exercise_id: string;
    exercise_name: string;
    previous_weight: number;
    new_weight: number;
}

export interface CreateWorkoutResponseDTO extends WorkoutDetailDTO {
    personal_bests_updated: PersonalBestUpdateDTO[];
}

// ============================================================================
// Workout Prefill DTOs (for prefilling workout forms from templates)
// ============================================================================

export interface WorkoutPrefillSetDTO {
    set_index: number;
    reps: number;
    weight: number;
    source: 'last_workout' | 'personal_best' | 'template_default' | 'default';
}

export interface WorkoutPrefillExerciseDTO {
    exercise_id: string;
    exercise_name: string;
    position: number;
    suggested_sets: WorkoutPrefillSetDTO[];
}

export interface WorkoutPrefillResponseDTO {
    template_id: string;
    template_name: string;
    exercises: WorkoutPrefillExerciseDTO[];
}

// ============================================================================
// Personal Best DTOs
// ============================================================================

export interface PersonalBestDTO extends Pick<PersonalBest, 'user_id' | 'exercise_id' | 'weight' | 'updated_at'> {
    exercise_name: string;
}

export type PersonalBestListResponseDTO = PaginatedResponseDTO<PersonalBestDTO>;

// ============================================================================
// Event Log DTOs (for analytics)
// ============================================================================

export interface EventLogDTO {
    id: number;
    user_id: string;
    event_type: string;
    occurred_at: string;
    payload: Record<string, unknown>;
}

export type EventLogListResponseDTO = PaginatedResponseDTO<EventLogDTO>;

export interface CreateEventCommand {
    event_type: string;
    payload: Record<string, unknown>;
}

// ============================================================================
// Common Response Types
// ============================================================================

export interface SuccessMessageDTO {
    message: string;
}

export interface DeleteResponseDTO extends SuccessMessageDTO {
    deleted_id: string;
}

export interface ValidationErrorDetail {
    field: string;
    message: string;
}

export interface ValidationErrorResponseDTO {
    error: string;
    details: ValidationErrorDetail[];
}

export interface ErrorResponseDTO {
    error: string;
    message: string;
}
