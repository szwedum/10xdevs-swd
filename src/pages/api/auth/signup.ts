import type { APIRoute } from "astro";
import { z } from "zod";
import { supabaseClient } from "../../../db/supabase.client";
import type { ErrorResponseDTO } from "../../../types";

export const prerender = false;

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const POST: APIRoute = async ({ request, cookies }): Promise<Response> => {
  try {
    const body = await request.json();
    const { email, password } = signupSchema.parse(body);

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      return new Response(
        JSON.stringify({
          error: "Signup Failed",
          message: error.message,
        } as ErrorResponseDTO),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!data.session) {
      return new Response(
        JSON.stringify({
          message: "Signup successful. Please check your email to confirm your account.",
          user: {
            id: data.user?.id,
            email: data.user?.email,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    cookies.set("sb-access-token", data.session.access_token, {
      path: "/",
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookies.set("sb-refresh-token", data.session.refresh_token, {
      path: "/",
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return new Response(
      JSON.stringify({
        message: "Signup successful",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: err.issues[0].message,
        } as ErrorResponseDTO),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Signup error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      } as ErrorResponseDTO),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
