import type { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object Model for the Form Actions component
 */
export class FormActionsPOM extends BasePage {
    private readonly containerTestId = 'form-actions';
    private readonly saveButtonTestId = 'save-template-button';
    private readonly cancelButtonTestId = 'cancel-button';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Click the Save Template button
     */
    async clickSaveButton(): Promise<void> {
        const saveButton = this.getByTestId(this.saveButtonTestId);
        await saveButton.click();
    }

    /**
     * Click the Cancel button
     */
    async clickCancelButton(): Promise<void> {
        const cancelButton = this.getByTestId(this.cancelButtonTestId);
        await cancelButton.click();
    }

    /**
     * Check if the Save button is disabled
     */
    async isSaveButtonDisabled(): Promise<boolean> {
        const saveButton = this.getByTestId(this.saveButtonTestId);
        return await saveButton.isDisabled();
    }

    /**
     * Check if the Cancel button is disabled
     */
    async isCancelButtonDisabled(): Promise<boolean> {
        const cancelButton = this.getByTestId(this.cancelButtonTestId);
        return await cancelButton.isDisabled();
    }

    /**
     * Check if the form is in loading state (Save button shows loading indicator)
     */
    async isLoading(): Promise<boolean> {
        const saveButton = this.getByTestId(this.saveButtonTestId);
        const loader = saveButton.locator('.animate-spin');
        return await loader.isVisible();
    }

    /**
     * Wait for the form to finish submitting
     */
    async waitForSubmissionComplete(): Promise<void> {
        // Wait for the loading state to disappear
        await this.page.waitForFunction(
            (saveButtonTestId) => {
                const button = document.querySelector(`[data-test-id="${saveButtonTestId}"]`);
                return button && !button.querySelector('.animate-spin');
            },
            this.saveButtonTestId
        );
    }
}
