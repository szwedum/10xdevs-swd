import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Dumbbell className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No templates created</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You haven't created any workout templates yet. Start by creating your first template to organize your
          exercises.
        </p>
        <Button
          onClick={() => (window.location.href = "/templates/new")}
          aria-label="Create your first workout template"
        >
          Create Your First Template
        </Button>
      </div>
    </div>
  );
}
