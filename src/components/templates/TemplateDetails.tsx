import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { TemplateDetailDTO } from "@/types";
import { ExerciseList } from "./ExerciseList";

interface TemplateDetailsProps {
  templateId: string;
}

export function TemplateDetails({ templateId }: TemplateDetailsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [template, setTemplate] = useState<TemplateDetailDTO | null>(null);

  useEffect(() => {
    async function fetchTemplate() {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Template not found");
          }
          throw new Error("Failed to fetch template details");
        }

        const data: TemplateDetailDTO = await response.json();
        setTemplate(data);
      } catch (error) {
        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to fetch template details",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplate();
  }, [templateId]);

  const handleStartWorkout = () => {
    window.location.href = `/workout/${templateId}`;
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      toast.success("Template deleted successfully");
      window.location.href = "/templates";
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to delete template",
      });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading template details...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Template not found</h1>
          <p className="text-muted-foreground">This template may have been deleted or does not exist.</p>
          <Button onClick={() => (window.location.href = "/templates")}>Back to Templates</Button>
        </div>
      </div>
    );
  }

  return (
    <section className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Created on {new Date(template.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => (window.location.href = "/templates")} variant="outline">
            Back to Templates
          </Button>
          <Button onClick={handleStartWorkout}>Start Workout</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Template"}
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Exercises ({template.exercises.length})</h2>
        <ExerciseList exercises={template.exercises} />
      </div>
    </section>
  );
}
