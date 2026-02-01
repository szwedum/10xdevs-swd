import { useState, useMemo, useContext, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { CreateTemplateCommand, TemplateDetailDTO } from "@/types";
import type { Database } from "@/db/database.types";
import { SupabaseConfigContext } from "@/lib/contexts/SupabaseConfigContext";

interface UseCreateTemplateResult {
  createTemplate: (data: CreateTemplateCommand) => Promise<TemplateDetailDTO>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateTemplate(): UseCreateTemplateResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const config = useContext(SupabaseConfigContext);

  console.log("useCreateTemplate - config:", config);

  const supabase = useMemo(() => {
    console.log("useCreateTemplate - creating supabase client, config:", config);
    if (!config) {
      console.log("useCreateTemplate - config is null, returning null");
      return null;
    }
    console.log("useCreateTemplate - creating browser client with:", config.supabaseUrl);
    return createBrowserClient<Database>(config.supabaseUrl, config.supabaseKey);
  }, [config]);

  // Set session when supabase client and tokens are available
  useEffect(() => {
    if (supabase && config?.accessToken && config?.refreshToken) {
      console.log("useCreateTemplate - setting session with tokens");
      supabase.auth
        .setSession({
          access_token: config.accessToken,
          refresh_token: config.refreshToken,
        })
        .then(({ data, error }) => {
          if (error) {
            console.error("useCreateTemplate - error setting session:", error);
          } else {
            console.log("useCreateTemplate - session set successfully:", data.session?.user?.id);
          }
        });
    }
  }, [supabase, config?.accessToken, config?.refreshToken]); // Re-run when dependencies change

  const createTemplate = async (data: CreateTemplateCommand): Promise<TemplateDetailDTO> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the API endpoint instead of using browser Supabase client
      // This uses server-side authentication which properly handles RLS
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create template");
      }

      const result: TemplateDetailDTO = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create template";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createTemplate, isLoading, error };
}
