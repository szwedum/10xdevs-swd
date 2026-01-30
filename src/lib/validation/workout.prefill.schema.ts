import { z } from 'zod';

export const workoutPrefillParamsSchema = z.object({
    id: z.string().uuid('Invalid template ID format'),
});
