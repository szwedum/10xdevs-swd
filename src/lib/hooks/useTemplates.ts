import { useState, useEffect, useCallback } from "react";
import type { TemplateListItemDTO, TemplateListResponseDTO } from "@/types";

interface UseTemplatesResult {
  templates: TemplateListItemDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTemplates(): UseTemplatesResult {
  const [templates, setTemplates] = useState<TemplateListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/templates?limit=50&offset=0&sort=created_at&order=desc", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data: TemplateListResponseDTO = await response.json();
      setTemplates(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch templates";
      setError(errorMessage);
      console.error("Error fetching templates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
  };
}
