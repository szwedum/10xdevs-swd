import { TemplateExerciseItem } from "./TemplateExerciseItem";
import type { TemplateExerciseListProps } from "./types";

export function TemplateExerciseList({
    exercises,
    onUpdate,
    onRemove,
    onMoveUp,
    onMoveDown,
}: TemplateExerciseListProps) {
    if (exercises.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Add exercises to your template using the selector above
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {exercises.map((exercise, index) => (
                <TemplateExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    canMoveUp={index > 0}
                    canMoveDown={index < exercises.length - 1}
                    onUpdate={(field, value) => onUpdate(exercise.id, field, value)}
                    onRemove={() => onRemove(exercise.id)}
                    onMoveUp={() => onMoveUp(exercise.id)}
                    onMoveDown={() => onMoveDown(exercise.id)}
                />
            ))}
        </div>
    );
}
