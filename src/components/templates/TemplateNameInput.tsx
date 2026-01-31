import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TemplateNameInputProps } from "./types";

export function TemplateNameInput({
    value,
    onChange,
    onBlur,
    error,
    autoFocus = false,
}: TemplateNameInputProps) {
    return (
        <div className="space-y-2" data-test-id="template-name-container">
            <Label htmlFor="template-name">
                Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
                id="template-name"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                maxLength={60}
                autoFocus={autoFocus}
                aria-describedby={error ? "template-name-error" : undefined}
                aria-invalid={!!error}
                className={error ? "border-destructive" : ""}
                data-test-id="template-name-input"
            />
            {error && (
                <p
                    id="template-name-error"
                    className="text-sm text-destructive"
                    aria-live="polite"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
