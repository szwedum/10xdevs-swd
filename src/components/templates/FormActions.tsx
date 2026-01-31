import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { FormActionsProps } from "./types";

export function FormActions({
    onSave,
    onCancel,
    isLoading,
    isValid,
}: FormActionsProps) {
    return (
        <div className="flex justify-end gap-4">
            <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                type="button"
            >
                Cancel
            </Button>
            <Button
                onClick={onSave}
                disabled={!isValid || isLoading}
                type="submit"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Template
            </Button>
        </div>
    );
}
