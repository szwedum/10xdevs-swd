import { forwardRef } from "react";
import { SetInputRow } from "./SetInputRow";
import type { WorkoutFormExerciseVM } from "./WorkoutForm";

interface ExerciseInputProps {
    exercise: WorkoutFormExerciseVM;
    exerciseIndex: number;
    updateSet: (exerciseIdx: number, setIdx: number, field: "reps" | "weight", value: number | "") => void;
}

export const ExerciseInput = forwardRef<HTMLFieldSetElement, ExerciseInputProps>(
    ({ exercise, exerciseIndex, updateSet }, ref) => {
        return (
            <fieldset ref={ref} className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <legend className="text-xl font-semibold text-gray-900 mb-4 px-2">
                    {exercise.exercise_name}
                </legend>

                <div className="space-y-3">
                    {exercise.sets.map((set, setIdx) => (
                        <SetInputRow
                            key={set.set_index}
                            set={set}
                            setIndex={setIdx}
                            exerciseIndex={exerciseIndex}
                            updateSet={updateSet}
                        />
                    ))}
                </div>

                {exercise.completed && (
                    <div className="mt-4 text-sm text-green-600 font-medium" role="status">
                        ✓ Exercise completed
                    </div>
                )}
            </fieldset>
        );
    }
);

ExerciseInput.displayName = "ExerciseInput";
