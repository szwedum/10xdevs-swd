import type { APIRoute } from "astro";
import { z } from "zod";

import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { ExerciseService } from "../../../lib/services/exercise.service";
import type { ErrorResponseDTO, ValidationErrorResponseDTO } from "../../../types";

export const prerender = false;

// Validation schema for query parameters
export const queryParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().min(1).optional(),
});

export const GET: APIRoute = async ({ url, cookies, request }): Promise<Response> => {
  try {
    // Validate and parse query parameters
    const params = queryParamsSchema.parse(Object.fromEntries(url.searchParams));

    // Use authenticated server client to respect RLS policies
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const result = await ExerciseService.getExercises(supabase, params);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const body: ValidationErrorResponseDTO = {
        error: "Validation Error",
        details: err.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      };
      return new Response(JSON.stringify(body), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error fetching exercises:", err);
    const body: ErrorResponseDTO = {
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
