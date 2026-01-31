/**
 * Utility functions for validation
 */

/**
 * Validates if a string is a valid UUID
 * @param id The ID to validate
 * @returns True if the ID is a valid UUID, false otherwise
 */
export function isValidUUID(id: unknown): boolean {
    if (id === undefined || id === null || id === "undefined" || id === "null" || !id) {
        return false;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof id === "string" && uuidRegex.test(id);
}

/**
 * Validates a template ID and throws an error if invalid
 * @param templateId The template ID to validate
 * @throws Error if the template ID is invalid
 */
export function validateTemplateId(templateId: unknown): asserts templateId is string {
    if (templateId === undefined || templateId === null || templateId === "undefined" || templateId === "null" || !templateId) {
        console.error(`Invalid template ID detected: ${String(templateId)}`);
        throw new Error("Invalid template ID: Template ID is required");
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof templateId !== "string" || !uuidRegex.test(templateId)) {
        console.error(`Invalid template ID format: ${String(templateId)}`);
        throw new Error(`Invalid template ID format: ${String(templateId)}`);
    }
}
