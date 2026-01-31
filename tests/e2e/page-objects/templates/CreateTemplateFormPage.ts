import type { Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { TemplateNameInputPOM } from './TemplateNameInputPOM.ts';
import { ExerciseSelectorPOM } from './ExerciseSelectorPOM.ts';
import { TemplateExerciseListPOM } from './TemplateExerciseListPOM.ts';
import { FormActionsPOM } from './FormActionsPOM.ts';

/**
 * Page Object Model for the Create Template Form page
 */
export class CreateTemplateFormPage extends BasePage {
    public readonly templateNameInput: TemplateNameInputPOM;
    public readonly exerciseSelector: ExerciseSelectorPOM;
    public readonly exerciseList: TemplateExerciseListPOM;
    public readonly formActions: FormActionsPOM;

    constructor(page: Page) {
        super(page);
        this.templateNameInput = new TemplateNameInputPOM(page);
        this.exerciseSelector = new ExerciseSelectorPOM(page);
        this.exerciseList = new TemplateExerciseListPOM(page);
        this.formActions = new FormActionsPOM(page);
    }

    /**
     * Navigate to the create template page
     */
    async navigateToCreateTemplate(): Promise<void> {
        await this.navigateTo('/templates/create');
        await this.waitForTestId('create-template-form');
    }

    /**
     * Fill the template name
     */
    async fillTemplateName(name: string): Promise<void> {
        await this.templateNameInput.fillTemplateName(name);
    }

    /**
     * Select an exercise by name
     */
    async selectExercise(exerciseName: string): Promise<void> {
        await this.exerciseSelector.selectExercise(exerciseName);
    }

    /**
     * Configure an exercise in the list
     */
    async configureExercise(exerciseId: string, sets: number, reps: number, weight: number): Promise<void> {
        await this.exerciseList.configureExercise(exerciseId, sets, reps, weight);
    }

    /**
     * Save the template
     */
    async saveTemplate(): Promise<void> {
        await this.formActions.clickSaveButton();
    }

    /**
     * Cancel template creation
     */
    async cancelTemplateCreation(): Promise<void> {
        await this.formActions.clickCancelButton();
    }

    /**
     * Complete the entire template creation flow
     */
    async createTemplate(name: string, exercises: Array<{ name: string, sets?: number, reps?: number, weight?: number }>): Promise<void> {
        await this.navigateToCreateTemplate();
        await this.fillTemplateName(name);

        for (const exercise of exercises) {
            await this.selectExercise(exercise.name);

            // Get the ID of the last added exercise
            const exerciseId = await this.exerciseList.getLastAddedExerciseId();

            if (exerciseId && (exercise.sets !== undefined || exercise.reps !== undefined || exercise.weight !== undefined)) {
                await this.configureExercise(
                    exerciseId,
                    exercise.sets ?? 3,  // Default values if not provided
                    exercise.reps ?? 10,
                    exercise.weight ?? 0
                );
            }
        }

        await this.saveTemplate();
    }
}
