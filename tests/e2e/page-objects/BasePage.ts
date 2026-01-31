import type { Page } from '@playwright/test';

/**
 * Base Page Object Model class that all page objects should extend
 */
export class BasePage {
    constructor(protected page: Page) { }

    /**
     * Navigate to a specific URL
     */
    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url);
    }

    /**
     * Wait for an element with the specified test ID to be visible
     */
    async waitForTestId(testId: string): Promise<void> {
        await this.page.waitForSelector(`[data-test-id="${testId}"]`, { state: 'visible' });
    }

    /**
     * Get an element by its test ID
     */
    getByTestId(testId: string) {
        return this.page.locator(`[data-test-id="${testId}"]`);
    }
}
