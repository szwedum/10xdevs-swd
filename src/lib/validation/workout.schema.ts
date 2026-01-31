import { z } from "zod";

export const workoutSetSchema = z.object({
  set_index: z.number().int().min(0),
  reps: z.number().int().min(1).max(99),
  weight: z.number().min(0).max(999.99).multipleOf(0.01),
});

export const workoutExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  position: z.number().int().min(0),
  sets: z
    .array(workoutSetSchema)
    .min(1)
    .max(20)
    .refine(
      (sets) => {
        const indices = sets.map((s) => s.set_index);
        const uniqueIndices = new Set(indices);
        return indices.length === uniqueIndices.size;
      },
      {
        message: "Set indices must be unique within exercise",
      }
    ),
});

export const createWorkoutSchema = z.object({
  template_id: z.string().uuid().nullable().optional(),
  logged_at: z.string().datetime().optional(),
  exercises: z
    .array(workoutExerciseSchema)
    .min(1)
    .max(50)
    .refine(
      (exercises) => {
        const positions = exercises.map((e) => e.position);
        const uniquePositions = new Set(positions);
        return positions.length === uniquePositions.size;
      },
      {
        message: "Exercise positions must be unique within workout",
      }
    ),
});
