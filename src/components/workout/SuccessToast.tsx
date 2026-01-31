import type { PersonalBestUpdateDTO } from "../../types";

interface SuccessToastProps {
    workoutId: string;
    personalBests: PersonalBestUpdateDTO[];
}

export function SuccessToast({ workoutId, personalBests }: SuccessToastProps) {
    return (
        <div
            className="fixed bottom-24 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md"
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold mb-1">Workout Completed!</h3>
                    <p className="text-sm text-green-100">Your workout has been saved successfully.</p>

                    {personalBests.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-green-500">
                            <p className="font-semibold text-sm mb-2">🎉 New Personal Bests!</p>
                            <ul className="space-y-1">
                                {personalBests.map((pb) => (
                                    <li key={pb.exercise_id} className="text-sm text-green-100">
                                        <span className="font-medium">{pb.exercise_name}:</span>{" "}
                                        {pb.previous_weight}kg → {pb.new_weight}kg
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
