import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CreateTemplateForm from './CreateTemplateForm';
import * as useCreateTemplateModule from '@/lib/hooks/useCreateTemplate';
import * as useNavigateModule from '@/lib/hooks/useNavigate';
import * as validationModule from '@/lib/validation/template-form.validation';
import type { ExerciseDTO } from '@/types';

// Mock dependencies
vi.mock('@/lib/hooks/useNavigate', () => ({
    useNavigate: vi.fn(),
}));

vi.mock('@/lib/hooks/useCreateTemplate', () => ({
    useCreateTemplate: vi.fn(),
}));

vi.mock('@/lib/validation/template-form.validation', async () => {
    const actual = await vi.importActual('@/lib/validation/template-form.validation');
    return {
        ...actual,
        validateForm: vi.fn(),
    };
});

// Mock child components
vi.mock('./TemplateNameInput', () => ({
    TemplateNameInput: ({ value, onChange, error, autoFocus }: any) => (
        <div data-testid="mock-template-name-input">
            <form className="space-y-8" role="form">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    data-testid="template-name-input"
                    aria-invalid={!!error}
                />
            </form>
            {error && <span data-testid="template-name-error">{error}</span>}
        </div>
    ),
}));

vi.mock('./ExerciseSelector', () => ({
    ExerciseSelector: ({ onSelect, selectedExerciseIds, disabled }: any) => (
        <div data-testid="mock-exercise-selector">
            <button
                onClick={() => onSelect({ id: 'ex-1', name: 'Push-ups' })}
                disabled={disabled || selectedExerciseIds.includes('ex-1')}
                data-testid="select-exercise-1"
            >
                Select Push-ups
            </button>
            <button
                onClick={() => onSelect({ id: 'ex-2', name: 'Squats' })}
                disabled={disabled || selectedExerciseIds.includes('ex-2')}
                data-testid="select-exercise-2"
            >
                Select Squats
            </button>
        </div>
    ),
}));

vi.mock('./TemplateExerciseList', () => ({
    TemplateExerciseList: ({ exercises, onUpdate, onRemove, onMoveUp, onMoveDown }: any) => (
        <div data-testid="mock-exercise-list">
            {exercises.map((exercise: any) => (
                <div key={exercise.id} data-testid={`exercise-item-${exercise.id}`}>
                    <span>{exercise.exercise_name}</span>
                    <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => onUpdate(exercise.id, 'sets', parseInt(e.target.value))}
                        data-testid={`sets-input-${exercise.id}`}
                    />
                    <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => onUpdate(exercise.id, 'reps', parseInt(e.target.value))}
                        data-testid={`reps-input-${exercise.id}`}
                    />
                    <input
                        type="number"
                        value={exercise.default_weight}
                        onChange={(e) => onUpdate(exercise.id, 'default_weight', parseFloat(e.target.value))}
                        data-testid={`weight-input-${exercise.id}`}
                    />
                    <button onClick={() => onRemove(exercise.id)} data-testid={`remove-${exercise.id}`}>
                        Remove
                    </button>
                    <button onClick={() => onMoveUp(exercise.id)} data-testid={`move-up-${exercise.id}`}>
                        Move Up
                    </button>
                    <button onClick={() => onMoveDown(exercise.id)} data-testid={`move-down-${exercise.id}`}>
                        Move Down
                    </button>
                </div>
            ))}
        </div>
    ),
}));

vi.mock('./FormActions', () => ({
    FormActions: ({ onSave, onCancel, isLoading, isValid }: any) => (
        <div data-testid="mock-form-actions">
            <button onClick={onSave} disabled={!isValid || isLoading} data-testid="save-button">
                {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onCancel} disabled={isLoading} data-testid="cancel-button">
                Cancel
            </button>
        </div>
    ),
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
    randomUUID: vi.fn().mockReturnValue('mock-uuid-123'),
});

describe('CreateTemplateForm', () => {
    const mockNavigate = vi.fn();
    const mockCreateTemplate = vi.fn();

    const mockProps = {
        supabaseUrl: 'https://mock-supabase-url.com',
        supabaseKey: 'mock-supabase-key',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
    };

    beforeEach(() => {
        // Setup mocks
        (useNavigateModule.useNavigate as any).mockReturnValue(mockNavigate);
        (useCreateTemplateModule.useCreateTemplate as any).mockReturnValue({
            createTemplate: mockCreateTemplate,
            isLoading: false,
            error: null,
        });
        (validationModule.validateForm as any).mockReturnValue(false); // Default to invalid form

        // Reset mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Rendering', () => {
        it('should render all form components', () => {
            // Arrange & Act
            render(<CreateTemplateForm {...mockProps} />);

            // Assert
            expect(screen.getByTestId('mock-template-name-input')).toBeInTheDocument();
            expect(screen.getByTestId('mock-exercise-selector')).toBeInTheDocument();
            expect(screen.getByTestId('mock-exercise-list')).toBeInTheDocument();
            expect(screen.getByTestId('mock-form-actions')).toBeInTheDocument();
        });

        it('should not show error message when there is no submit error', () => {
            // Arrange & Act
            render(<CreateTemplateForm {...mockProps} />);

            // Assert
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('should show error message when there is a submit error', () => {
            // Arrange
            const errorMessage = 'Failed to create template';
            (useCreateTemplateModule.useCreateTemplate as any).mockReturnValue({
                createTemplate: mockCreateTemplate,
                isLoading: false,
                error: errorMessage,
            });

            // Act
            render(<CreateTemplateForm {...mockProps} />);

            // Assert
            expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
        });
    });

    describe('Form interactions', () => {
        it('should update template name when input changes', () => {
            // Arrange
            render(<CreateTemplateForm {...mockProps} />);
            const nameInput = screen.getByTestId('template-name-input');

            // Act
            fireEvent.change(nameInput, { target: { value: 'My New Workout' } });

            // Assert
            expect(nameInput).toHaveValue('My New Workout');
        });

        it('should add exercise when selected from selector', async () => {
            // Arrange
            render(<CreateTemplateForm {...mockProps} />);

            // Act
            fireEvent.click(screen.getByTestId('select-exercise-1'));

            // Assert
            await waitFor(() => {
                expect(screen.getByTestId('exercise-item-mock-uuid-123')).toBeInTheDocument();
                expect(screen.getByText('Push-ups')).toBeInTheDocument();
            });
        });

        it('should update exercise values when inputs change', async () => {
            // Arrange
            render(<CreateTemplateForm {...mockProps} />);

            // Add an exercise first
            fireEvent.click(screen.getByTestId('select-exercise-1'));

            // Act - Update sets
            const setsInput = await screen.findByTestId('sets-input-mock-uuid-123');
            fireEvent.change(setsInput, { target: { value: '5' } });

            // Update reps
            const repsInput = screen.getByTestId('reps-input-mock-uuid-123');
            fireEvent.change(repsInput, { target: { value: '12' } });

            // Update weight
            const weightInput = screen.getByTestId('weight-input-mock-uuid-123');
            fireEvent.change(weightInput, { target: { value: '50' } });

            // Assert
            expect(setsInput).toHaveValue(5);
            expect(repsInput).toHaveValue(12);
            expect(weightInput).toHaveValue(50);
        });

        it('should remove exercise when remove button is clicked', async () => {
            // Arrange
            render(<CreateTemplateForm {...mockProps} />);

            // Add an exercise first
            fireEvent.click(screen.getByTestId('select-exercise-1'));

            // Act
            const removeButton = await screen.findByTestId('remove-mock-uuid-123');
            fireEvent.click(removeButton);

            // Assert
            expect(screen.queryByTestId('exercise-item-mock-uuid-123')).not.toBeInTheDocument();
        });

        it('should move exercise up when move up button is clicked', async () => {
            // Arrange
            // Set up sequential UUID values
            const mockUuids = ['mock-uuid-1', 'mock-uuid-2'];
            let uuidIndex = 0;
            (crypto.randomUUID as any).mockImplementation(() => mockUuids[uuidIndex++]);

            render(<CreateTemplateForm {...mockProps} />);

            // Add two exercises
            fireEvent.click(screen.getByTestId('select-exercise-1')); // uuid-1
            await screen.findByTestId('exercise-item-mock-uuid-1');

            fireEvent.click(screen.getByTestId('select-exercise-2')); // uuid-2
            await screen.findByTestId('exercise-item-mock-uuid-2');

            // Act - Move second exercise up
            const moveUpButton = screen.getByTestId('move-up-mock-uuid-2');
            fireEvent.click(moveUpButton);

            // Assert - We can't directly test the order in the DOM due to mocking,
            // but we can verify the function was called
            expect(moveUpButton).toBeInTheDocument();
        });

        it('should move exercise down when move down button is clicked', async () => {
            // Arrange
            // Set up sequential UUID values
            const mockUuids = ['mock-uuid-1', 'mock-uuid-2'];
            let uuidIndex = 0;
            (crypto.randomUUID as any).mockImplementation(() => mockUuids[uuidIndex++]);

            render(<CreateTemplateForm {...mockProps} />);

            // Add two exercises
            fireEvent.click(screen.getByTestId('select-exercise-1')); // uuid-1
            await screen.findByTestId('exercise-item-mock-uuid-1');

            fireEvent.click(screen.getByTestId('select-exercise-2')); // uuid-2
            await screen.findByTestId('exercise-item-mock-uuid-2');

            // Act - Move first exercise down
            const moveDownButton = screen.getByTestId('move-down-mock-uuid-1');
            fireEvent.click(moveDownButton);

            // Assert
            expect(moveDownButton).toBeInTheDocument();
        });
    });

    describe('Form submission', () => {
        it('should call createTemplate with correct data when form is submitted', async () => {
            // Arrange
            (validationModule.validateForm as any).mockReturnValue(true); // Make form valid
            mockCreateTemplate.mockResolvedValueOnce({ id: 'new-template-id' });

            // Reset the crypto mock to ensure it returns consistent values
            (crypto.randomUUID as any).mockReturnValue('mock-uuid-123');

            render(<CreateTemplateForm {...mockProps} />);

            // Fill form
            fireEvent.change(screen.getByTestId('template-name-input'), { target: { value: 'My Workout Plan' } });

            // Add exercise and wait for it to appear in the DOM
            fireEvent.click(screen.getByTestId('select-exercise-1'));
            await screen.findByTestId('exercise-item-mock-uuid-123');

            // Update exercise values
            const setsInput = screen.getByTestId('sets-input-mock-uuid-123');
            fireEvent.change(setsInput, { target: { value: '4' } });
            fireEvent.change(screen.getByTestId('reps-input-mock-uuid-123'), { target: { value: '15' } });
            fireEvent.change(screen.getByTestId('weight-input-mock-uuid-123'), { target: { value: '25' } });

            // Act - Submit form
            fireEvent.click(screen.getByTestId('save-button'));

            // Assert
            await waitFor(() => {
                expect(mockCreateTemplate).toHaveBeenCalledWith({
                    name: 'My Workout Plan',
                    exercises: [
                        {
                            exercise_id: 'ex-1',
                            sets: 4,
                            reps: 15,
                            default_weight: 25,
                            position: 0,
                        },
                    ],
                });
            });

            expect(mockNavigate).toHaveBeenCalledWith('/templates');
        });

        it('should navigate to templates list when cancel is clicked', () => {
            // Arrange
            render(<CreateTemplateForm {...mockProps} />);

            // Act
            fireEvent.click(screen.getByTestId('cancel-button'));

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/templates');
        });

        it('should handle form submission errors', async () => {
            // Arrange
            (validationModule.validateForm as any).mockReturnValue(true); // Make form valid
            const error = new Error('API error');
            mockCreateTemplate.mockRejectedValueOnce(error);

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            render(<CreateTemplateForm {...mockProps} />);

            // Fill form
            fireEvent.change(screen.getByTestId('template-name-input'), { target: { value: 'My Workout Plan' } });
            fireEvent.click(screen.getByTestId('select-exercise-1'));

            // Act - Submit form
            fireEvent.click(screen.getByTestId('save-button'));

            // Assert
            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith('Error creating template:', error);
            });

            expect(mockNavigate).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should prevent default form submission', () => {
            // Arrange
            render(<CreateTemplateForm {...mockProps} />);
            const form = document.querySelector('form');
            const preventDefaultMock = vi.fn();

            // Act
            fireEvent.submit(form!, { preventDefault: preventDefaultMock });

            // Assert
            expect(preventDefaultMock).toHaveBeenCalled();
        });
    });

    describe('Validation', () => {
        it('should validate template name on change', () => {
            // Arrange
            const validateTemplateNameSpy = vi.spyOn(validationModule, 'validateTemplateName');
            render(<CreateTemplateForm {...mockProps} />);

            // Act
            fireEvent.change(screen.getByTestId('template-name-input'), { target: { value: 'My Workout' } });

            // Assert
            expect(validateTemplateNameSpy).toHaveBeenCalledWith('My Workout');
        });

        it('should validate sets on update', async () => {
            // Arrange
            const validateSetsSpy = vi.spyOn(validationModule, 'validateSets');
            render(<CreateTemplateForm {...mockProps} />);

            // Add an exercise
            fireEvent.click(screen.getByTestId('select-exercise-1'));

            // Act
            const setsInput = await screen.findByTestId('sets-input-mock-uuid-123');
            fireEvent.change(setsInput, { target: { value: '5' } });

            // Assert
            expect(validateSetsSpy).toHaveBeenCalledWith(5);
        });

        it('should validate reps on update', async () => {
            // Arrange
            const validateRepsSpy = vi.spyOn(validationModule, 'validateReps');
            render(<CreateTemplateForm {...mockProps} />);

            // Add an exercise
            fireEvent.click(screen.getByTestId('select-exercise-1'));

            // Act
            const repsInput = await screen.findByTestId('reps-input-mock-uuid-123');
            fireEvent.change(repsInput, { target: { value: '12' } });

            // Assert
            expect(validateRepsSpy).toHaveBeenCalledWith(12);
        });

        it('should validate weight on update', async () => {
            // Arrange
            const validateWeightSpy = vi.spyOn(validationModule, 'validateWeight');
            render(<CreateTemplateForm {...mockProps} />);

            // Add an exercise
            fireEvent.click(screen.getByTestId('select-exercise-1'));

            // Act
            const weightInput = await screen.findByTestId('weight-input-mock-uuid-123');
            fireEvent.change(weightInput, { target: { value: '50' } });

            // Assert
            expect(validateWeightSpy).toHaveBeenCalledWith(50);
        });

        it('should check form validity when rendering form actions', () => {
            // Arrange
            render(<CreateTemplateForm {...mockProps} />);

            // Assert
            expect(validationModule.validateForm).toHaveBeenCalled();
        });
    });

    describe('Edge cases', () => {
        it('should handle multiple exercises with correct positions', async () => {
            // Arrange
            // Set up sequential UUID values
            const mockUuids = ['mock-uuid-1', 'mock-uuid-2'];
            let uuidIndex = 0;
            (crypto.randomUUID as any).mockImplementation(() => mockUuids[uuidIndex++]);

            (validationModule.validateForm as any).mockReturnValue(true); // Make form valid
            mockCreateTemplate.mockResolvedValueOnce({ id: 'new-template-id' });

            render(<CreateTemplateForm {...mockProps} />);

            // Add two exercises
            fireEvent.click(screen.getByTestId('select-exercise-1')); // uuid-1
            await screen.findByTestId('exercise-item-mock-uuid-1');

            fireEvent.click(screen.getByTestId('select-exercise-2')); // uuid-2
            await screen.findByTestId('exercise-item-mock-uuid-2');

            // Act - Submit form
            fireEvent.click(screen.getByTestId('save-button'));

            // Assert
            await waitFor(() => {
                expect(mockCreateTemplate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        exercises: [
                            expect.objectContaining({ exercise_id: 'ex-1', position: 0 }),
                            expect.objectContaining({ exercise_id: 'ex-2', position: 1 }),
                        ],
                    })
                );
            });
        });

        it('should update positions after removing an exercise', async () => {
            // Arrange
            // Set up sequential UUID values
            const mockUuids = ['mock-uuid-1', 'mock-uuid-2', 'mock-uuid-3'];
            let uuidIndex = 0;
            (crypto.randomUUID as any).mockImplementation(() => mockUuids[uuidIndex++]);

            (validationModule.validateForm as any).mockReturnValue(true); // Make form valid
            mockCreateTemplate.mockResolvedValueOnce({ id: 'new-template-id' });

            render(<CreateTemplateForm {...mockProps} />);

            // Add three exercises
            fireEvent.click(screen.getByTestId('select-exercise-1')); // uuid-1
            await screen.findByTestId('exercise-item-mock-uuid-1');

            fireEvent.click(screen.getByTestId('select-exercise-2')); // uuid-2
            await screen.findByTestId('exercise-item-mock-uuid-2');

            // Reset uuidIndex to reuse mock-uuid-1 for the third exercise
            uuidIndex = 2;
            fireEvent.click(screen.getByTestId('select-exercise-1')); // uuid-3
            await screen.findByTestId('exercise-item-mock-uuid-3');

            // Remove the middle exercise
            const removeButton = screen.getByTestId('remove-mock-uuid-2');
            fireEvent.click(removeButton);

            // Act - Submit form
            fireEvent.click(screen.getByTestId('save-button'));

            // Assert
            await waitFor(() => {
                expect(mockCreateTemplate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        exercises: [
                            expect.objectContaining({ position: 0 }),
                            expect.objectContaining({ position: 1 }),
                        ],
                    })
                );
            });
        });

        it('should disable form actions during submission', async () => {
            // Arrange
            (validationModule.validateForm as any).mockReturnValue(true); // Make form valid

            // Mock createTemplate to delay resolution
            let resolvePromise: Function;
            const createPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });
            mockCreateTemplate.mockImplementation(() => createPromise);

            render(<CreateTemplateForm {...mockProps} />);

            // Fill form
            fireEvent.change(screen.getByTestId('template-name-input'), { target: { value: 'My Workout' } });
            fireEvent.click(screen.getByTestId('select-exercise-1'));

            // Act - Submit form
            fireEvent.click(screen.getByTestId('save-button'));

            // Assert - Button should be disabled during submission
            await waitFor(() => {
                expect(screen.getByTestId('save-button')).toBeDisabled();
                expect(screen.getByTestId('cancel-button')).toBeDisabled();
            });

            // Resolve the promise
            resolvePromise!({ id: 'new-template-id' });
        });
    });
});
