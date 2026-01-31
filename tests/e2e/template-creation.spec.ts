import { test, expect } from '@playwright/test';
import { CreateTemplateFormPage } from './page-objects/templates/CreateTemplateFormPage.ts';

test.describe('Template Creation Flow', () => {
    test('should create a new workout template', async ({ page }) => {
        // Arrange
        const templatePage = new CreateTemplateFormPage(page);
        const templateName = 'Full Body Workout';
        const exercises = [
            { name: 'Bench Press', sets: 4, reps: 8, weight: 60 },
            { name: 'Squat', sets: 5, reps: 5, weight: 100 },
            { name: 'Pull-up', sets: 3, reps: 12, weight: 0 }
        ];

        // Act
        await templatePage.navigateToCreateTemplate();

        // Fill template name
        await templatePage.fillTemplateName(templateName);

        // Add exercises one by one
        for (const exercise of exercises) {
            await templatePage.selectExercise(exercise.name);

            // Get the ID of the last added exercise
            const exerciseId = await templatePage.exerciseList.getLastAddedExerciseId();

            if (exerciseId) {
                await templatePage.configureExercise(
                    exerciseId,
                    exercise.sets,
                    exercise.reps,
                    exercise.weight
                );
            }
        }

        // Save the template
        await templatePage.saveTemplate();

        // Assert
        // We expect to be redirected to the templates list page
        await expect(page).toHaveURL(/\/templates$/);
    });

    test('should validate template name', async ({ page }) => {
        // Arrange
        const templatePage = new CreateTemplateFormPage(page);

        // Act
        await templatePage.navigateToCreateTemplate();

        // Try to save without entering a name
        await expect(templatePage.formActions.isSaveButtonDisabled()).resolves.toBe(true);

        // Enter an invalid name (too short)
        await templatePage.fillTemplateName('A');

        // Assert
        await expect(templatePage.templateNameInput.hasError()).resolves.toBe(true);
        await expect(templatePage.formActions.isSaveButtonDisabled()).resolves.toBe(true);

        // Enter a valid name
        await templatePage.fillTemplateName('Valid Template Name');

        // Assert
        await expect(templatePage.templateNameInput.hasError()).resolves.toBe(false);
        // Save button might still be disabled if no exercises are added
    });

    test('should allow adding and removing exercises', async ({ page }) => {
        // Arrange
        const templatePage = new CreateTemplateFormPage(page);

        // Act
        await templatePage.navigateToCreateTemplate();
        await templatePage.fillTemplateName('Exercise Test Template');

        // Add an exercise
        await templatePage.selectExercise('Deadlift');

        // Assert
        await expect(templatePage.exerciseList.getExerciseCount()).resolves.toBe(1);

        // Get the ID of the added exercise
        const exerciseId = await templatePage.exerciseList.getLastAddedExerciseId();
        expect(exerciseId).not.toBeNull();

        if (exerciseId) {
            // Remove the exercise
            await templatePage.exerciseList.removeExercise(exerciseId);

            // Assert
            await expect(templatePage.exerciseList.getExerciseCount()).resolves.toBe(0);
            await expect(templatePage.exerciseList.isEmpty()).resolves.toBe(true);
        }
    });
});
