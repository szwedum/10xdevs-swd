import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import type { ExerciseDTO, ExerciseListResponseDTO } from "@/types";

interface UseExercisesParams {
    search?: string;
}

interface UseExercisesResult {
    exercises: ExerciseDTO[];
    loading: boolean;
    error: string | null;
}

export function useExercises(params?: UseExercisesParams): UseExercisesResult {
    const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debouncedSearch = useDebounce(params?.search, 300);

    useEffect(() => {
        const fetchExercises = async () => {
            setLoading(true);
            setError(null);

            try {
                const url = new URL("/api/exercises", window.location.origin);
                url.searchParams.set("limit", "100");

                if (debouncedSearch) {
                    url.searchParams.set("search", debouncedSearch);
                }

                const response = await fetch(url.toString());

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result: ExerciseListResponseDTO = await response.json();
                setExercises(result.data);
            } catch (err) {
                setError("Failed to load exercises. Please try again.");
                console.error("Error fetching exercises:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchExercises();
    }, [debouncedSearch]);

    return { exercises, loading, error };
}
