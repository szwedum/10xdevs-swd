import type { ExerciseDTO } from '@/types';

export interface TemplateExerciseFormItem {
    id: string;
    exercise_id: string;
    exercise_name: string;
    sets: number;
    reps: number;
    default_weight: number;
    position: number;
    errors: {
        sets?: string;
        reps?: string;
        default_weight?: string;
    };
}

export interface CreateTemplateFormState {
    name: string;
    nameError?: string;
    exercises: TemplateExerciseFormItem[];
    isSubmitting: boolean;
    submitError?: string;
}

export interface TemplateNameInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    autoFocus?: boolean;
}

export interface ExerciseSelectorProps {
    onSelect: (exercise: ExerciseDTO) => void;
    selectedExerciseIds: string[];
    disabled?: boolean;
}

export interface TemplateExerciseListProps {
    exercises: TemplateExerciseFormItem[];
    onUpdate: (id: string, field: 'sets' | 'reps' | 'default_weight', value: number) => void;
    onRemove: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
}

export interface TemplateExerciseItemProps {
    exercise: TemplateExerciseFormItem;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onUpdate: (field: 'sets' | 'reps' | 'default_weight', value: number) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

export interface FormActionsProps {
    onSave: () => void;
    onCancel: () => void;
    isLoading: boolean;
    isValid: boolean;
}
