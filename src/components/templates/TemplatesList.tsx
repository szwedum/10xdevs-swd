import { Button } from "@/components/ui/button";
import { useTemplates } from "@/lib/hooks/useTemplates";
import { CreateTemplateButton } from "./CreateTemplateButton";
import { EmptyState } from "./EmptyState";
import { TemplateCard } from "./TemplateCard";

export function TemplatesList() {
  const { templates, loading, error, refetch } = useTemplates();

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center" role="status" aria-live="polite">
        <p className="text-sm text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div
          className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-destructive/50 bg-destructive/10 p-8 text-center"
          role="alert"
          aria-live="assertive"
        >
          <h2 className="text-lg font-semibold text-destructive">Error Loading Templates</h2>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">{error}</p>
          <Button onClick={refetch} variant="outline" aria-label="Retry loading templates">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const hasTemplates = templates.length > 0;

  return (
    <section className="container py-8" aria-labelledby="templates-heading">
      <div className="flex items-center justify-between">
        <h1 id="templates-heading" className="text-3xl font-bold tracking-tight">
          Your Templates
        </h1>
        <CreateTemplateButton />
      </div>

      <div className="mt-8">
        {hasTemplates ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Workout templates list">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} onDeleted={refetch} />
            ))}
          </ul>
        ) : (
          <EmptyState />
        )}
      </div>
    </section>
  );
}
