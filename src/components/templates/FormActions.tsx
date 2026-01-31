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
        <div className="flex justify-end gap-4" data-test-id="form-actions">
            <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                type="button"
                data-test-id="cancel-button"
            >
                Cancel
            </Button>
            <Button
                onClick={onSave}
                disabled={!isValid || isLoading}
                type="submit"
                data-test-id="save-template-button"
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Template
            </Button>
        </div>
    );
}
