import { useEffect, useState } from "react";
import type { WorkoutListItemDTO } from "../../types";

export function WorkoutsList() {
    const [workouts, setWorkouts] = useState<WorkoutListItemDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchWorkouts() {
            try {
                const response = await fetch("/api/workouts?limit=20&offset=0");
                if (!response.ok) {
                    throw new Error("Failed to fetch workouts");
                }
                const data = await response.json();
                setWorkouts(data.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch workouts");
            } finally {
                setIsLoading(false);
            }
        }

        fetchWorkouts();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading workouts...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                    <h2 className="text-lg font-semibold text-red-700">Error</h2>
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (workouts.length === 0) {
        return (
            <div className="container py-16 text-center">
                <h2 className="text-2xl font-semibold">No workouts logged yet</h2>
                <p className="mt-2 text-muted-foreground">Start a workout from a template to see it here.</p>
            </div>
        );
    }

    return (
        <section className="container py-8">
            <div className="space-y-4">
                {workouts.map((workout) => (
                    <article
                        key={workout.id}
                        className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold">
                                    {workout.template_name ?? "Custom Workout"}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(workout.logged_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {workout.exercise_count} exercises · {workout.total_sets} sets
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
