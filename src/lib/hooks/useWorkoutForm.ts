import { useState, useCallback, useEffect } from "react";
import type {
    WorkoutPrefillResponseDTO,
    CreateWorkoutCommand,
    CreateWorkoutResponseDTO,
    ValidationErrorResponseDTO,
} from "../../types";

export interface WorkoutFormSetVM {
    set_index: number;
    reps: number | "";
    weight: number | "";
    error?: string;
}

export interface WorkoutFormExerciseVM {
    exercise_id: string;
    exercise_name: string;
    position: number;
    sets: WorkoutFormSetVM[];
    completed: boolean;
}

export interface WorkoutFormVM {
    template_id: string;
    template_name: string;
    logged_at: string;
    exercises: WorkoutFormExerciseVM[];
}

function mapPrefillToFormVM(prefill: WorkoutPrefillResponseDTO): WorkoutFormVM {
    return {
        template_id: prefill.template_id,
        template_name: prefill.template_name,
        logged_at: new Date().toISOString(),
        exercises: prefill.exercises.map((exercise) => ({
            exercise_id: exercise.exercise_id,
            exercise_name: exercise.exercise_name,
            position: exercise.position,
            sets: exercise.suggested_sets.map((set) => ({
                set_index: set.set_index,
                reps: set.reps,
                weight: set.weight,
                error: undefined,
            })),
            completed: false,
        })),
    };
}

function validateSet(reps: number | "", weight: number | ""): string | undefined {
    if (reps === "" || weight === "") {
        return "All fields are required";
    }

    if (reps < 1 || reps > 99) {
        return "Reps must be between 1 and 99";
    }

    if (weight < 0 || weight > 999) {
        return "Weight must be between 0 and 999";
    }

    if (!Number.isInteger(reps)) {
        return "Reps must be a whole number";
    }

    const weightStr = weight.toString();
    const decimalPart = weightStr.split(".")[1];
    if (decimalPart && decimalPart.length > 1) {
        return "Weight can have at most 1 decimal place";
    }

    return undefined;
}

export function useWorkoutForm(prefill: WorkoutPrefillResponseDTO) {
    const [formData, setFormData] = useState<WorkoutFormVM>(() => {
        if (typeof window === "undefined") {
            return mapPrefillToFormVM(prefill);
        }

        const storageKey = `workout_draft_${prefill.template_id}`;
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed;
            }
        } catch (err) {
            console.error("Error loading draft from localStorage:", err);
            localStorage.removeItem(storageKey);
        }
        return mapPrefillToFormVM(prefill);
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<CreateWorkoutResponseDTO | null>(null);

    useEffect(() => {
        const storageKey = `workout_draft_${prefill.template_id}`;
        const timeoutId = setTimeout(() => {
            try {
                localStorage.setItem(storageKey, JSON.stringify(formData));
            } catch (err) {
                console.error("Error saving draft to localStorage:", err);
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, [formData, prefill.template_id]);

    const updateSet = useCallback(
        (exerciseIdx: number, setIdx: number, field: "reps" | "weight", value: number | "") => {
            setFormData((prev) => {
                const newExercises = [...prev.exercises];
                const exercise = { ...newExercises[exerciseIdx] };
                const sets = [...exercise.sets];
                const set = { ...sets[setIdx] };

                set[field] = value;
                set.error = validateSet(set.reps, set.weight);

                sets[setIdx] = set;
                exercise.sets = sets;
                exercise.completed = sets.every((s) => !s.error && s.reps !== "" && s.weight !== "");
                newExercises[exerciseIdx] = exercise;

                return { ...prev, exercises: newExercises };
            });
        },
        []
    );

    const validateForm = useCallback((): boolean => {
        let hasErrors = false;
        const validatedData = { ...formData };

        validatedData.exercises = validatedData.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => {
                const error = validateSet(set.reps, set.weight);
                if (error) hasErrors = true;
                return { ...set, error };
            }),
        }));

        if (hasErrors) {
            setFormData(validatedData);
        }

        return !hasErrors;
    }, [formData]);

    const submitWorkout = useCallback(async (): Promise<boolean> => {
        if (!validateForm()) {
            return false;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const command: CreateWorkoutCommand = {
                template_id: formData.template_id,
                logged_at: formData.logged_at,
                exercises: formData.exercises.map((exercise) => ({
                    exercise_id: exercise.exercise_id,
                    position: exercise.position,
                    sets: exercise.sets.map((set) => ({
                        set_index: set.set_index,
                        reps: set.reps as number,
                        weight: set.weight as number,
                    })),
                })),
            };

            const response = await fetch("/api/workouts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(command),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    const errorData: ValidationErrorResponseDTO = await response.json();
                    const validatedData = { ...formData };

                    errorData.details.forEach((detail) => {
                        const pathParts = detail.field.split(".");
                        if (pathParts[0] === "exercises" && pathParts.length >= 4) {
                            const exerciseIdx = parseInt(pathParts[1], 10);
                            const setIdx = parseInt(pathParts[3], 10);
                            if (!isNaN(exerciseIdx) && !isNaN(setIdx)) {
                                validatedData.exercises[exerciseIdx].sets[setIdx].error = detail.message;
                            }
                        }
                    });

                    setFormData(validatedData);
                    setSubmitError("Please fix the validation errors");
                    return false;
                }

                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create workout");
            }

            const result: CreateWorkoutResponseDTO = await response.json();
            setSubmitSuccess(result);

            localStorage.removeItem(`workout_draft_${prefill.template_id}`);

            return true;
        } catch (err) {
            console.error("Error submitting workout:", err);
            setSubmitError(err instanceof Error ? err.message : "Failed to create workout");
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, prefill.template_id, validateForm]);

    const clearDraft = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(`workout_draft_${prefill.template_id}`);
        }
    }, [prefill.template_id]);

    const isFormValid = formData.exercises.every((exercise) =>
        exercise.sets.every((set) => set.reps !== "" && set.weight !== "" && !set.error)
    );

    return {
        formData,
        isSubmitting,
        submitError,
        submitSuccess,
        isFormValid,
        updateSet,
        submitWorkout,
        clearDraft,
    };
}
