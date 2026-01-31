import { useState } from "react";
import { useNavigate } from "@/lib/hooks/useNavigate";
import { useCreateTemplate } from "@/lib/hooks/useCreateTemplate";
import { validateTemplateName, validateSets, validateReps, validateWeight, validateForm } from "@/lib/validation/template-form.validation";
import type { CreateTemplateFormState, TemplateExerciseFormItem } from "./types";
import { TemplateNameInput } from "./TemplateNameInput";
import { ExerciseSelector } from "./ExerciseSelector";
import { TemplateExerciseList } from "./TemplateExerciseList";
import { FormActions } from "./FormActions";
import type { ExerciseDTO } from "@/types";
import { SupabaseConfigContext } from "@/lib/contexts/SupabaseConfigContext";

interface CreateTemplateFormProps {
    supabaseUrl: string;
    supabaseKey: string;
    accessToken: string;
    refreshToken: string;
}

function CreateTemplateFormInner() {
    const navigate = useNavigate();
    const { createTemplate, isLoading, error: submitError } = useCreateTemplate();
    const [formState, setFormState] = useState<CreateTemplateFormState>({
        name: "",
        exercises: [],
        isSubmitting: false,
    });

    const handleNameChange = (name: string) => {
        setFormState((prev) => ({
            ...prev,
            name,
            nameError: validateTemplateName(name),
        }));
    };

    const handleExerciseSelect = (exercise: ExerciseDTO) => {
        const newExercise: TemplateExerciseFormItem = {
            id: crypto.randomUUID(),
            exercise_id: exercise.id,
            exercise_name: exercise.name,
            sets: 3,
            reps: 10,
            default_weight: 0,
            position: formState.exercises.length,
            errors: {},
        };

        setFormState((prev) => ({
            ...prev,
            exercises: [...prev.exercises, newExercise],
        }));
    };

    const handleExerciseUpdate = (
        id: string,
        field: "sets" | "reps" | "default_weight",
        value: number
    ) => {
        setFormState((prev) => ({
            ...prev,
            exercises: prev.exercises.map((exercise) => {
                if (exercise.id !== id) return exercise;

                let error: string | undefined;
                switch (field) {
                    case "sets":
                        error = validateSets(value);
                        break;
                    case "reps":
                        error = validateReps(value);
                        break;
                    case "default_weight":
                        error = validateWeight(value);
                        break;
                }

                return {
                    ...exercise,
                    [field]: value,
                    errors: {
                        ...exercise.errors,
                        [field]: error,
                    },
                };
            }),
        }));
    };

    const handleExerciseRemove = (id: string) => {
        setFormState((prev) => ({
            ...prev,
            exercises: prev.exercises
                .filter((exercise) => exercise.id !== id)
                .map((exercise, index) => ({
                    ...exercise,
                    position: index,
                })),
        }));
    };

    const handleExerciseMove = (id: string, direction: "up" | "down") => {
        setFormState((prev) => {
            const index = prev.exercises.findIndex((e) => e.id === id);
            if (index === -1) return prev;

            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.exercises.length) return prev;

            const exercises = [...prev.exercises];
            const temp = exercises[index];
            exercises[index] = exercises[newIndex];
            exercises[newIndex] = temp;

            return {
                ...prev,
                exercises: exercises.map((exercise, i) => ({
                    ...exercise,
                    position: i,
                })),
            };
        });
    };

    const handleSubmit = async () => {
        console.log('=== handleSubmit called ===');
        console.log('Form state:', formState);
        console.log('Is valid:', validateForm(formState));

        try {
            setFormState((prev) => ({ ...prev, isSubmitting: true }));

            console.log('Calling createTemplate...');
            await createTemplate({
                name: formState.name,
                exercises: formState.exercises.map((exercise) => ({
                    exercise_id: exercise.exercise_id,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    default_weight: exercise.default_weight,
                    position: exercise.position,
                })),
            });

            console.log('Template created successfully, navigating...');
            navigate("/templates");
        } catch (error) {
            console.error('Error creating template:', error);
            setFormState((prev) => ({
                ...prev,
                isSubmitting: false,
            }));
        }
    };

    return (
        <form
            data-test-id="create-template-form"
            onSubmit={(e) => {
                console.log('Form onSubmit event triggered');
                e.preventDefault();
                handleSubmit();
            }}
            className="space-y-8"
        >
            <TemplateNameInput
                value={formState.name}
                onChange={handleNameChange}
                error={formState.nameError}
                autoFocus
            />

            <div className="space-y-4">
                <ExerciseSelector
                    onSelect={handleExerciseSelect}
                    selectedExerciseIds={formState.exercises.map((e) => e.exercise_id)}
                    disabled={formState.isSubmitting}
                />

                <TemplateExerciseList
                    exercises={formState.exercises}
                    onUpdate={handleExerciseUpdate}
                    onRemove={handleExerciseRemove}
                    onMoveUp={(id) => handleExerciseMove(id, "up")}
                    onMoveDown={(id) => handleExerciseMove(id, "down")}
                />
            </div>

            {submitError && (
                <p className="text-sm text-destructive" role="alert">
                    {submitError}
                </p>
            )}

            <FormActions
                onSave={handleSubmit}
                onCancel={() => navigate("/templates")}
                isLoading={formState.isSubmitting}
                isValid={validateForm(formState)}
            />
        </form>
    );
}

export default function CreateTemplateForm({ supabaseUrl, supabaseKey, accessToken, refreshToken }: CreateTemplateFormProps) {
    console.log('CreateTemplateForm - props:', { supabaseUrl, supabaseKey: supabaseKey ? '***' : 'undefined', hasTokens: !!(accessToken && refreshToken) });

    return (
        <SupabaseConfigContext.Provider value={{ supabaseUrl, supabaseKey, accessToken, refreshToken }}>
            <CreateTemplateFormInner />
        </SupabaseConfigContext.Provider>
    );
}
