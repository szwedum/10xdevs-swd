import type { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object Model for the Template Name Input component
 */
export class TemplateNameInputPOM extends BasePage {
    private readonly containerTestId = 'template-name-container';
    private readonly inputTestId = 'template-name-input';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Fill the template name input
     */
    async fillTemplateName(name: string): Promise<void> {
        const input = this.getByTestId(this.inputTestId);
        await input.fill(name);
    }

    /**
     * Get the current template name value
     */
    async getTemplateName(): Promise<string> {
        const input = this.getByTestId(this.inputTestId);
        return await input.inputValue();
    }

    /**
     * Check if the template name input has an error
     */
    async hasError(): Promise<boolean> {
        const container = this.getByTestId(this.containerTestId);
        const errorElement = container.locator('[id="template-name-error"]');
        return await errorElement.isVisible();
    }

    /**
     * Get the error message if present
     */
    async getErrorMessage(): Promise<string | null> {
        const container = this.getByTestId(this.containerTestId);
        const errorElement = container.locator('[id="template-name-error"]');

        if (await errorElement.isVisible()) {
            return await errorElement.textContent();
        }

        return null;
    }
}
