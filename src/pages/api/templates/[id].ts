import type { APIRoute } from "astro";
import { z } from "zod";

import { supabaseClient } from "../../../db/supabase.client";
import type { ErrorResponseDTO, DeleteResponseDTO } from "../../../types";
import { TemplateService } from "../../../lib/services/template.service";

export const prerender = false;

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid template ID format");

export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
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
    // Validate template ID
    const templateId = uuidSchema.parse(params.id);

    const result = await TemplateService.getTemplateDetails(supabaseClient, templateId, userId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid template ID format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (err instanceof Error) {
      if (err.message === "Template not found") {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: "Template not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    console.error("Error fetching template details:", err);
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

export const DELETE: APIRoute = async ({ params, locals }): Promise<Response> => {
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
    const templateId = uuidSchema.parse(params.id);

    const result: DeleteResponseDTO = await TemplateService.deleteTemplate(supabaseClient, templateId, userId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid template ID format",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (err instanceof Error) {
      if (err.message === "Template not found") {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: "Template not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    console.error("Error deleting template:", err);
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
