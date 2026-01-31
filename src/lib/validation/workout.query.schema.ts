import { z } from "zod";

export const workoutQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    from_date: z
      .string()
      .datetime()
      .transform((date) => new Date(date).toISOString())
      .optional(),
    to_date: z
      .string()
      .datetime()
      .transform((date) => new Date(date).toISOString())
      .optional(),
    template_id: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (data.from_date && data.to_date) {
        return new Date(data.from_date) <= new Date(data.to_date);
      }
      return true;
    },
    {
      message: "from_date must be before or equal to to_date",
      path: ["from_date"],
    }
  );
