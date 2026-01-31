import type { CreateTemplateFormState } from "@/components/templates/types";

export const validateTemplateName = (name: string): string | undefined => {
    if (!name.trim()) {
        return "Template name is required";
    }
    if (name.length > 60) {
        return "Maximum 60 characters allowed";
    }
    return undefined;
};

export const validateSets = (sets: number): string | undefined => {
    if (sets < 1 || sets > 99 || !Number.isInteger(sets)) {
        return "Sets must be between 1 and 99";
    }
    return undefined;
};

export const validateReps = (reps: number): string | undefined => {
    if (reps < 1 || reps > 99 || !Number.isInteger(reps)) {
        return "Reps must be between 1 and 99";
    }
    return undefined;
};

export const validateWeight = (weight: number): string | undefined => {
    if (weight < 0 || weight > 999.99) {
        return "Weight must be between 0 and 999.99 kg";
    }
    if (!/^\d+(\.\d{0,2})?$/.test(weight.toString())) {
        return "Weight must have maximum 2 decimal places";
    }
    return undefined;
};

export const validateForm = (state: CreateTemplateFormState): boolean => {
    if (validateTemplateName(state.name)) {
        return false;
    }

    if (state.exercises.length === 0) {
        return false;
    }

    return !state.exercises.some(exercise =>
        exercise.errors.sets ||
        exercise.errors.reps ||
        exercise.errors.default_weight
    );
};
