import type { Page } from "@playwright/test";
import { BasePage } from "../BasePage";

/**
 * Page Object Model for the Exercise Selector component
 */
export class ExerciseSelectorPOM extends BasePage {
  private readonly containerTestId = "exercise-selector-container";
  private readonly buttonTestId = "select-exercise-button";
  private readonly searchInputTestId = "exercise-search-input";

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

    // Search for the exercise to narrow down results
    await this.searchExercises(exerciseName);

    // Wait a bit for search results to filter
    await this.page.waitForTimeout(500);

    // Use Playwright's getByRole to find the exact button by accessible name
    // The buttons in the exercise list should have the exercise name as text content
    const exerciseButton = this.page.getByRole('button', { name: exerciseName, exact: true });

    try {
      await exerciseButton.waitFor({ state: 'visible', timeout: 5000 });
      await exerciseButton.click();
    } catch (error) {
      throw new Error(`Exercise with name "${exerciseName}" not found in the selector`);
    }
  }

  /**
   * Check if the exercise selector is disabled
   */
  async isDisabled(): Promise<boolean> {
    const button = this.getByTestId(this.buttonTestId);
    return await button.isDisabled();
  }
}
