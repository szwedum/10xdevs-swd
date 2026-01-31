import type { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

/**
 * Page Object Model for the Template Exercise List component
 */
export class TemplateExerciseListPOM extends BasePage {
    private readonly listTestId = 'template-exercise-list';
    private readonly emptyListTestId = 'empty-exercise-list';

    constructor(page: Page) {
        super(page);
    }

    /**
     * Check if the exercise list is empty
     */
    async isEmpty(): Promise<boolean> {
        const emptyList = this.getByTestId(this.emptyListTestId);
        return await emptyList.isVisible();
    }

    /**
     * Get the number of exercises in the list
     */
    async getExerciseCount(): Promise<number> {
        // If the list is empty, return 0
        if (await this.isEmpty()) {
            return 0;
        }

        const exerciseItems = this.page.locator('[data-test-id^="exercise-item-"]');
        return await exerciseItems.count();
    }

    /**
     * Get the ID of the last added exercise
     */
    async getLastAddedExerciseId(): Promise<string | null> {
        const exerciseItems = this.page.locator('[data-test-id^="exercise-item-"]');
        const count = await exerciseItems.count();

        if (count === 0) {
            return null;
        }

        const lastItem = exerciseItems.nth(count - 1);
        const testId = await lastItem.getAttribute('data-test-id');

        if (!testId) {
            return null;
        }

        // Extract the ID from the data-test-id attribute (format: "exercise-item-{id}")
        return testId.replace('exercise-item-', '');
    }

    /**
     * Configure an exercise in the list by setting sets, reps, and weight
     */
    async configureExercise(exerciseId: string, sets: number, reps: number, weight: number): Promise<void> {
        // Fill in sets
        const setsInput = this.getByTestId(`sets-input-${exerciseId}`);
        await setsInput.fill(sets.toString());

        // Fill in reps
        const repsInput = this.getByTestId(`reps-input-${exerciseId}`);
        await repsInput.fill(reps.toString());

        // Fill in weight
        const weightInput = this.getByTestId(`weight-input-${exerciseId}`);
        await weightInput.fill(weight.toString());
    }

    /**
     * Remove an exercise from the list
     */
    async removeExercise(exerciseId: string): Promise<void> {
        const removeButton = this.getByTestId(`remove-exercise-${exerciseId}`);
        await removeButton.click();
    }

    /**
     * Move an exercise up in the list
     */
    async moveExerciseUp(exerciseId: string): Promise<void> {
        const moveUpButton = this.getByTestId(`move-up-${exerciseId}`);
        await moveUpButton.click();
    }

    /**
     * Move an exercise down in the list
     */
    async moveExerciseDown(exerciseId: string): Promise<void> {
        const moveDownButton = this.getByTestId(`move-down-${exerciseId}`);
        await moveDownButton.click();
    }

    /**
     * Get the name of an exercise by its ID
     */
    async getExerciseName(exerciseId: string): Promise<string | null> {
        const exerciseItem = this.getByTestId(`exercise-item-${exerciseId}`);
        const nameElement = exerciseItem.locator('h3');
        return await nameElement.textContent();
    }
}
