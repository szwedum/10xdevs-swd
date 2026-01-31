import { useId } from "react";
import type { WorkoutFormSetVM } from "./WorkoutForm";

interface SetInputRowProps {
    set: WorkoutFormSetVM;
    setIndex: number;
    exerciseIndex: number;
    updateSet: (exerciseIdx: number, setIdx: number, field: "reps" | "weight", value: number | "") => void;
}

export function SetInputRow({ set, setIndex, exerciseIndex, updateSet }: SetInputRowProps) {
    const repsId = useId();
    const weightId = useId();

    const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateSet(exerciseIndex, setIndex, "reps", value === "" ? "" : parseInt(value, 10));
    };

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateSet(exerciseIndex, setIndex, "weight", value === "" ? "" : parseFloat(value));
    };

    return (
        <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg font-semibold text-gray-700">
                {set.set_index + 1}
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor={repsId} className="block text-sm font-medium text-gray-700 mb-1">
                        Reps
                    </label>
                    <input
                        id={repsId}
                        type="number"
                        min="1"
                        max="99"
                        step="1"
                        value={set.reps}
                        onChange={handleRepsChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        aria-invalid={!!set.error}
                        aria-describedby={set.error ? `${repsId}-error` : undefined}
                    />
                </div>

                <div>
                    <label htmlFor={weightId} className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                    </label>
                    <input
                        id={weightId}
                        type="number"
                        min="0"
                        max="999"
                        step="0.1"
                        value={set.weight}
                        onChange={handleWeightChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        aria-invalid={!!set.error}
                        aria-describedby={set.error ? `${weightId}-error` : undefined}
                    />
                </div>
            </div>

            {set.error && (
                <div
                    id={`${repsId}-error`}
                    className="col-span-2 text-sm text-red-600"
                    role="alert"
                >
                    {set.error}
                </div>
            )}
        </div>
    );
}
