import type { APIRoute } from 'astro';
import { z } from 'zod';

import { DEFAULT_USER_ID, supabaseClient } from '../../../db/supabase.client';
import { workoutQuerySchema } from '../../../lib/validation/workout.query.schema';
import { createWorkoutSchema } from '../../../lib/validation/workout.schema';
import type { ErrorResponseDTO, ValidationErrorResponseDTO } from '../../../types';
import { WorkoutService } from '../../../lib/services/workout.service';

export const prerender = false;

export const GET: APIRoute = async ({ url }): Promise<Response> => {
    try {
        // Validate and parse query parameters
        const params = workoutQuerySchema.parse(Object.fromEntries(url.searchParams));

        const result = await WorkoutService.getWorkouts(supabaseClient, DEFAULT_USER_ID, {
            limit: params.limit,
            offset: params.offset,
            fromDate: params.from_date,
            toDate: params.to_date,
            templateId: params.template_id,
        });

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            const body: ValidationErrorResponseDTO = {
                error: 'Validation Error',
                details: err.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            };
            return new Response(JSON.stringify(body), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.error('Error fetching workouts:', err);
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

export const POST: APIRoute = async ({ request }): Promise<Response> => {
    try {
        const body = await request.json();
        const validatedBody = createWorkoutSchema.parse(body);

        const result = await WorkoutService.createWorkout(
            supabaseClient,
            DEFAULT_USER_ID,
            validatedBody,
        );

        return new Response(JSON.stringify(result), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        if (err instanceof Error && err.name === 'ZodError') {
            const body: ValidationErrorResponseDTO = {
                error: 'Validation Error',
                details: JSON.parse(err.message).map((e: any) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            };
            return new Response(JSON.stringify(body), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.error('Error creating workout:', err);
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
