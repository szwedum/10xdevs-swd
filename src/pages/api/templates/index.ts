import type { APIRoute } from "astro";
import { z } from "zod";

import { supabaseClient } from "../../../db/supabase.client";
import { createTemplateSchema } from "../../../lib/validation/template.schema";
import type { ErrorResponseDTO, ValidationErrorResponseDTO } from "../../../types";
import { TemplateService } from "../../../lib/services/template.service";

export const prerender = false;

// ---------------------------------------------------------------------------
// Validation schema for query parameters (Step 2 of implementation plan)
// ---------------------------------------------------------------------------
export const queryParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  sort: z.enum(["created_at", "name"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// ---------------------------------------------------------------------------
// GET /api/templates handler (Step 3 of implementation plan)
// ---------------------------------------------------------------------------
export const POST: APIRoute = async ({ request, locals }): Promise<Response> => {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Authentication required",
      } as ErrorResponseDTO),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await request.json();
    const validatedBody = createTemplateSchema.parse(body);

    const result = await TemplateService.createTemplate(supabaseClient, userId, validatedBody);

    return new Response(JSON.stringify(result), {
      status: 201,
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

    if (err instanceof Error && err.message.includes("already exists")) {
      return new Response(
        JSON.stringify({
          error: "Conflict",
          message: err.message,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error(
      "Error creating template:",
      err instanceof Error
        ? {
          message: err.message,
          stack: err.stack,
        }
        : err
    );
    const body: ErrorResponseDTO = {
      error: "Internal Server Error",
      message: err instanceof Error ? err.message : "An unexpected error occurred",
    };
    return new Response(JSON.stringify(body), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const GET: APIRoute = async ({ url, locals }): Promise<Response> => {
  const userId = locals.user?.id;
  if (!userId) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Authentication required",
      } as ErrorResponseDTO),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate query parameters
  let params: z.infer<typeof queryParamsSchema>;
  try {
    params = queryParamsSchema.parse(Object.fromEntries(url.searchParams));
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
    // Unknown validation error
    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "Invalid request parameters",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Business logic via service layer
  try {
    console.log("Calling TemplateService with params:", {
      userId,
      params,
    });
    const result = await TemplateService.getTemplates(supabaseClient, userId, params);
    console.log("Service returned result:", result);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching templates:", error instanceof Error ? error.message : error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack available");
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
