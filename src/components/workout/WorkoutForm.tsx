import { useState } from "react";
import type { WorkoutPrefillResponseDTO } from "../../types";
import { useWorkoutForm } from "../../lib/hooks/useWorkoutForm";
import { StickyHeader } from "./StickyHeader";
import { ExerciseInput } from "./ExerciseInput";
import { StickyFooterActions } from "./StickyFooterActions";
import { LoadingOverlay } from "./LoadingOverlay";
import { SuccessToast } from "./SuccessToast";

export type { WorkoutFormSetVM, WorkoutFormExerciseVM, WorkoutFormVM } from "../../lib/hooks/useWorkoutForm";

interface WorkoutFormProps {
    prefill: WorkoutPrefillResponseDTO;
}

export function WorkoutForm({ prefill }: WorkoutFormProps) {
    const {
        formData,
        isSubmitting,
        submitError,
        submitSuccess,
        isFormValid,
        updateSet,
        submitWorkout,
        clearDraft,
    } = useWorkoutForm(prefill);

    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await submitWorkout();
        if (success && submitSuccess) {
            setTimeout(() => {
                window.location.href = "/templates";
            }, 2000);
        }
    };

    const handleCancel = () => {
        setShowCancelDialog(true);
    };

    const confirmCancel = () => {
        clearDraft();
        window.location.href = "/templates";
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <StickyHeader templateName={formData.template_name} loggedAt={formData.logged_at} />

            <form onSubmit={handleSubmit} className="pb-32">
                <div className="container mx-auto px-4 py-6 max-w-2xl">
                    {formData.exercises.map((exercise, idx) => (
                        <ExerciseInput
                            key={exercise.exercise_id}
                            exercise={exercise}
                            exerciseIndex={idx}
                            updateSet={updateSet}
                        />
                    ))}
                </div>
            </form>

            <StickyFooterActions
                onComplete={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
                isValid={isFormValid}
            />

            {isSubmitting && <LoadingOverlay />}

            {submitSuccess && (
                <SuccessToast
                    workoutId={submitSuccess.id}
                    personalBests={submitSuccess.personal_bests_updated}
                />
            )}

            {submitError && (
                <div className="fixed bottom-24 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-50" role="alert">
                    {submitError}
                </div>
            )}

            {showCancelDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                        <h2 className="text-xl font-bold mb-4">Cancel Workout?</h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to cancel? Your progress will be lost.
                        </p>
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowCancelDialog(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Continue Workout
                            </button>
                            <button
                                type="button"
                                onClick={confirmCancel}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Cancel Workout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
