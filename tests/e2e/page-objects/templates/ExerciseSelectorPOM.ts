import type { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object Model for the Exercise Selector component
 */
export class ExerciseSelectorPOM extends BasePage {
    private readonly containerTestId = 'exercise-selector-container';
    private readonly buttonTestId = 'select-exercise-button';
    private readonly searchInputTestId = 'exercise-search-input';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Open the exercise selector dropdown
     */
    async openSelector(): Promise<void> {
        const button = this.getByTestId(this.buttonTestId);
        await button.click();
        // Wait for the search input to be visible, indicating the dropdown is open
        await this.waitForTestId(this.searchInputTestId);
    }

    /**
     * Search for exercises by name
     */
    async searchExercises(searchTerm: string): Promise<void> {
        const searchInput = this.getByTestId(this.searchInputTestId);
        await searchInput.fill(searchTerm);
        // Wait a bit for search results to update
        await this.page.waitForTimeout(300);
    }

    /**
     * Select an exercise by name
     * This method opens the selector, optionally searches, and selects the exercise
     */
    async selectExercise(exerciseName: string): Promise<void> {
        await this.openSelector();

        // If the exercise name contains specific terms, search for it first
        if (exerciseName.length > 3) {
            await this.searchExercises(exerciseName.substring(0, 3));
        }

        // Find and click on the exercise item that contains the name
        const exerciseItems = this.page.locator('[data-test-id^="exercise-item-"]');
        const count = await exerciseItems.count();

        for (let i = 0; i < count; i++) {
            const item = exerciseItems.nth(i);
            const text = await item.textContent();

            if (text && text.includes(exerciseName)) {
                await item.click();
                return;
            }
        }

        throw new Error(`Exercise with name "${exerciseName}" not found in the selector`);
    }

    /**
     * Check if the exercise selector is disabled
     */
    async isDisabled(): Promise<boolean> {
        const button = this.getByTestId(this.buttonTestId);
        return await button.isDisabled();
    }
}
