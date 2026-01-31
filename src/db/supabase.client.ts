import { createClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";
import { createServerClient, createBrowserClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// Legacy client for backward compatibility (to be phased out)
export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Browser client for React components with authentication support
export const createSupabaseBrowserClient = () => {
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Cookie options for SSR client
export const cookieOptions: CookieOptionsWithName = {
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
};

// Helper function to parse cookie header
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
    return cookieHeader.split(";").map((cookie) => {
        const [name, ...rest] = cookie.trim().split("=");
        return { name, value: rest.join("=") };
    });
}

// SSR-aware Supabase client factory
export const createSupabaseServerInstance = (context: {
    headers: Headers;
    cookies: AstroCookies;
}) => {
    const supabase = createServerClient<Database>(
        import.meta.env.SUPABASE_URL,
        import.meta.env.SUPABASE_KEY,
        {
            cookieOptions,
            cookies: {
                getAll() {
                    return parseCookieHeader(context.headers.get("Cookie") ?? "");
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        context.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    return supabase;
};
