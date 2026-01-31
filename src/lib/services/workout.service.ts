import { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../db/database.types";
import { validateTemplateId } from "../utils/validation";
import type {
  CreateWorkoutCommand,
  CreateWorkoutResponseDTO,
  WorkoutPrefillResponseDTO,
  WorkoutListResponseDTO,
} from "../../types";

export interface GetWorkoutsOptions {
  limit: number;
  offset: number;
  fromDate?: string;
  toDate?: string;
  templateId?: string;
}

export class WorkoutService {
  public static async getPrefillData(
    supabase: SupabaseClient<Database>,
    templateId: unknown,
    userId: string
  ): Promise<WorkoutPrefillResponseDTO> {
    // Validate template ID using utility function
    try {
      validateTemplateId(templateId);
    } catch (error) {
      // Re-throw with more context for debugging
      console.error(`Template ID validation failed in getPrefillData: ${templateId}`);
      throw error;
    }
    // Get template with exercises
    const { data: template, error: templateError } = await supabase
      .from("templates")
      .select(
        `
                id,
                name,
                template_exercises!inner (
                    id,
                    exercise_id,
                    exercises (id, name),
                    sets,
                    reps,
                    default_weight,
                    position
                )
            `
      )
      .eq("id", templateId)
      .eq("user_id", userId)
      .single();

    if (templateError) {
      if (templateError.code === "PGRST116") {
        throw new Error("Template not found");
      }
      throw new Error(`Error fetching template: ${templateError.message}`);
    }

    // Get exercise IDs
    const exerciseIds = template.template_exercises.map((te: any) => te.exercise_id);

    // Get last workout data for these exercises
    const { data: lastWorkouts } = await supabase
      .from("workouts")
      .select(
        `
                id,
                workout_exercises!inner (
                    exercise_id,
                    workout_sets!inner (reps, weight)
                )
            `
      )
      .eq("user_id", userId)
      .in("workout_exercises.exercise_id", exerciseIds)
      .order("logged_at", { ascending: false });

    // Create a map of last workout data by exercise ID
    const lastWorkoutMap = new Map();
    lastWorkouts?.forEach((workout: any) => {
      workout.workout_exercises.forEach((we: any) => {
        if (!lastWorkoutMap.has(we.exercise_id)) {
          // Get the highest weight set
          const maxWeightSet = we.workout_sets.reduce(
            (max: any, set: any) => (set.weight > (max?.weight ?? 0) ? set : max),
            null
          );
          if (maxWeightSet) {
            lastWorkoutMap.set(we.exercise_id, {
              reps: maxWeightSet.reps,
              weight: maxWeightSet.weight,
            });
          }
        }
      });
    });

    return {
      template_id: template.id,
      template_name: template.name,
      exercises: template.template_exercises.map((te: any) => {
        const lastWorkout = lastWorkoutMap.get(te.exercise_id);
        return {
          exercise_id: te.exercise_id,
          exercise_name: te.exercises.name,
          position: te.position,
          suggested_sets: Array(te.sets)
            .fill(0)
            .map((_, idx) => ({
              set_index: idx,
              reps: lastWorkout?.reps ?? te.reps,
              weight: lastWorkout?.weight ?? te.default_weight ?? 0,
              source: lastWorkout ? "last_workout" : "template_default",
            })),
        };
      }),
    };
  }
  public static async getWorkouts(
    supabase: SupabaseClient<Database>,
    userId: string,
    options: GetWorkoutsOptions
  ): Promise<WorkoutListResponseDTO> {
    const { limit, offset, fromDate, toDate, templateId } = options;

    // Build base query
    // First, get workouts with template names
    let query = supabase
      .from("workouts")
      .select(
        `
                id,
                user_id,
                template_id,
                logged_at,
                templates (name)
            `,
        { count: "exact" }
      )
      .eq("user_id", userId);

    // Apply filters
    if (fromDate) {
      query = query.gte("logged_at", fromDate);
    }
    if (toDate) {
      query = query.lte("logged_at", toDate);
    }
    if (templateId) {
      query = query.eq("template_id", templateId);
    }

    // Get paginated results with total count
    console.log("Executing query with options:", { limit, offset, fromDate, toDate, templateId });
    const {
      data: workouts,
      error,
      count,
    } = await query.order("logged_at", { ascending: false }).range(offset, offset + limit - 1);

    console.log("Query result:", { workouts, error, count });

    if (error) {
      throw new Error(`Error fetching workouts: ${error.message}`);
    }

    // Then get exercise and set counts
    const workoutIds = workouts?.map((w) => w.id) || [];
    const { data: counts } = await supabase
      .from("workout_exercises")
      .select(
        `
                workout_id,
                workout_sets (count)
            `
      )
      .in("workout_id", workoutIds);

    const exerciseCounts = new Map();
    const setCounts = new Map();
    counts?.forEach((we: any) => {
      const workoutId = we.workout_id;
      exerciseCounts.set(workoutId, (exerciseCounts.get(workoutId) || 0) + 1);
      setCounts.set(workoutId, (setCounts.get(workoutId) || 0) + we.workout_sets.count);
    });

    return {
      data: (workouts || []).map((w: any) => ({
        id: w.id,
        user_id: w.user_id,
        template_id: w.template_id,
        template_name: w.templates?.name ?? null,
        logged_at: w.logged_at,
        exercise_count: exerciseCounts.get(w.id) || 0,
        total_sets: setCounts.get(w.id) || 0,
      })),
      pagination: {
        limit,
        offset,
        total: count ?? 0,
      },
    };
  }
  public static async createWorkout(
    supabase: SupabaseClient<Database>,
    userId: string,
    command: CreateWorkoutCommand
  ): Promise<CreateWorkoutResponseDTO> {
    const { template_id, logged_at = new Date().toISOString(), exercises } = command;

    // Create workout
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert({
        user_id: userId,
        template_id,
        logged_at,
      })
      .select()
      .single();

    if (workoutError) {
      throw new Error(`Error creating workout: ${workoutError.message}`);
    }

    // Create workout exercises with their sets
    const exerciseInserts = exercises.map((e) => ({
      workout_id: workout.id,
      exercise_id: e.exercise_id,
      position: e.position,
    }));

    const { data: workoutExercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .insert(exerciseInserts).select(`
                id,
                workout_id,
                exercise_id,
                exercises (
                    id,
                    name
                ),
                position
            `);

    if (exercisesError) {
      throw new Error(`Error creating workout exercises: ${exercisesError.message}`);
    }

    // Create sets for each exercise
    const setInserts = exercises.flatMap((exercise, idx) =>
      exercise.sets.map((set) => ({
        workout_exercise_id: workoutExercises[idx].id,
        set_index: set.set_index,
        reps: set.reps,
        weight: set.weight,
      }))
    );

    const { data: workoutSets, error: setsError } = await supabase.from("workout_sets").insert(setInserts).select();

    if (setsError) {
      throw new Error(`Error creating workout sets: ${setsError.message}`);
    }

    // Get template name if workout was based on template
    let template_name = null;
    if (template_id) {
      const { data: template } = await supabase.from("templates").select("name").eq("id", template_id).single();
      template_name = template?.name ?? null;
    }

    // Format response
    return {
      id: workout.id,
      user_id: workout.user_id,
      template_id: workout.template_id,
      template_name,
      logged_at: workout.logged_at,
      exercises: workoutExercises.map((we, idx) => ({
        id: we.id,
        workout_id: we.workout_id,
        exercise_id: we.exercise_id,
        exercise_name: we.exercises.name,
        position: we.position,
        sets: exercises[idx].sets.map((set, setIdx) => ({
          id: workoutSets[idx * exercises[idx].sets.length + setIdx].id,
          workout_exercise_id: we.id,
          set_index: set.set_index,
          reps: set.reps,
          weight: set.weight,
        })),
      })),
      // Personal bests are handled by database trigger
      personal_bests_updated: [],
    };
  }
}
