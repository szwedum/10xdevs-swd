import type { APIRoute } from 'astro';
import { z } from 'zod';

import { DEFAULT_USER_ID, supabaseClient } from '../../../../db/supabase.client';
import { workoutPrefillParamsSchema } from '../../../../lib/validation/workout.prefill.schema';
import type { ErrorResponseDTO } from '../../../../types';
import { WorkoutService } from '../../../../lib/services/workout.service';

export const prerender = false;

export const GET: APIRoute = async ({ params }): Promise<Response> => {
    try {
        // Validate template ID
        const { id: templateId } = workoutPrefillParamsSchema.parse(params);

        const result = await WorkoutService.getPrefillData(
            supabaseClient,
            templateId,
            DEFAULT_USER_ID,
        );

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return new Response(JSON.stringify({
                error: 'Bad Request',
                message: 'Invalid template ID format',
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (err instanceof Error) {
            if (err.message === 'Template not found') {
                return new Response(JSON.stringify({
                    error: 'Not Found',
                    message: 'Template not found',
                }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }

        console.error('Error prefilling workout:', err);
        const body: ErrorResponseDTO = {
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
        };
        return new Response(JSON.stringify(body), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
