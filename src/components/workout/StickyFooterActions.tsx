import { cn } from "../../lib/utils";

interface StickyFooterActionsProps {
    onComplete: (e: React.FormEvent) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    isValid: boolean;
}

interface ActionButtonsProps extends StickyFooterActionsProps {
    className?: string;
}

function ActionButtons({
    onCancel,
    onComplete,
    isSubmitting,
    isValid,
    className,
}: ActionButtonsProps) {
    return (
        <div className={cn("flex flex-col gap-3 sm:flex-row sm:justify-end", className)}>
            <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
                Cancel Workout
            </button>
            <button
                type="submit"
                onClick={onComplete}
                disabled={isSubmitting || !isValid}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
                {isSubmitting ? "Saving..." : "Complete Workout"}
            </button>
        </div>
    );
}

export function StickyFooterActions(props: StickyFooterActionsProps) {
    return (
        <>
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                <ActionButtons {...props} />
            </div>
            <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <ActionButtons {...props} className="max-w-2xl ml-auto" />
                </div>
            </footer>
        </>
    );
}
