import { z } from "zod";

export const createTemplateExerciseSchema = z.object({
  exercise_id: z.string().uuid(),
  sets: z.number().int().min(1).max(99),
  reps: z.number().int().min(1).max(99),
  default_weight: z.number().min(0).max(999.99).multipleOf(0.01).optional(),
  position: z.number().int().min(0),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(60),
  exercises: z
    .array(createTemplateExerciseSchema)
    .min(1)
    .max(50)
    .refine(
      (exercises) => {
        const positions = exercises.map((e) => e.position);
        const uniquePositions = new Set(positions);
        return positions.length === uniquePositions.size;
      },
      {
        message: "Exercise positions must be unique within template",
      }
    ),
});
