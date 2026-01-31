import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TemplateCard } from './TemplateCard';
import type { TemplateListItemDTO } from '@/types';
import * as toast from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock ConfirmDialog component
vi.mock('@/components/shared/ConfirmDialog', () => ({
    ConfirmDialog: ({ open, onOpenChange, onConfirm, title, description, confirmText, cancelText }: any) => (
        <div data-testid="mock-confirm-dialog">
            {open && (
                <div>
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <button onClick={() => onConfirm()} data-testid="confirm-button">
                        {confirmText || 'Confirm'}
                    </button>
                    <button onClick={() => onOpenChange(false)} data-testid="cancel-button">
                        {cancelText || 'Cancel'}
                    </button>
                </div>
            )}
        </div>
    ),
}));

describe('TemplateCard', () => {
    const mockTemplate: TemplateListItemDTO = {
        id: 'template-123',
        user_id: 'user-456',
        name: 'Upper Body Workout',
        created_at: '2024-01-15T10:00:00Z',
        exercise_count: 3,
    };

    const mockOnDeleted = vi.fn();

    beforeEach(() => {
        // Mock fetch
        global.fetch = vi.fn();

        // Mock window.location
        delete (window as any).location;
        (window as any).location = { href: '' };

        // Clear mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Rendering', () => {
        it('should render template information correctly', () => {
            // Arrange & Act
            render(<TemplateCard template={mockTemplate} />);

            // Assert
            expect(screen.getByText('Upper Body Workout')).toBeInTheDocument();
            expect(screen.getByText('3 exercises')).toBeInTheDocument();
            expect(screen.getByText(/Created on/)).toBeInTheDocument();
        });

        it('should render singular "exercise" text when count is 1', () => {
            // Arrange
            const singleExerciseTemplate = { ...mockTemplate, exercise_count: 1 };

            // Act
            render(<TemplateCard template={singleExerciseTemplate} />);

            // Assert
            expect(screen.getByText('1 exercise')).toBeInTheDocument();
        });

        it('should render all action buttons', () => {
            // Arrange & Act
            render(<TemplateCard template={mockTemplate} />);

            // Assert
            expect(screen.getByRole('button', { name: /Start workout with Upper Body Workout/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /View details of Upper Body Workout/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Delete Upper Body Workout/i })).toBeInTheDocument();
        });

        it('should format the date correctly', () => {
            // Arrange & Act
            render(<TemplateCard template={mockTemplate} />);

            // Assert - Check if date is formatted (exact format depends on locale)
            const dateText = screen.getByText(/Created on/);
            expect(dateText).toBeInTheDocument();

            // This is a loose check since the exact format depends on the user's locale
            const dateRegex = /Created on \d{1,2}\/\d{1,2}\/\d{2,4}/;
            expect(dateText.textContent).toMatch(dateRegex);
        });
    });

    describe('Navigation', () => {
        it('should navigate to workout page when "Start Workout" is clicked', () => {
            // Arrange
            render(<TemplateCard template={mockTemplate} />);

            // Act
            fireEvent.click(screen.getByRole('button', { name: /Start workout with Upper Body Workout/i }));

            // Assert
            expect(window.location.href).toBe(`/workout/${mockTemplate.id}`);
        });

        it('should navigate to template details when "View Details" is clicked', () => {
            // Arrange
            render(<TemplateCard template={mockTemplate} />);

            // Act
            fireEvent.click(screen.getByRole('button', { name: /View details of Upper Body Workout/i }));

            // Assert
            expect(window.location.href).toBe(`/templates/${mockTemplate.id}`);
        });
    });

    describe('Delete functionality', () => {
        it('should show confirmation dialog when delete button is clicked', () => {
            // Arrange
            render(<TemplateCard template={mockTemplate} />);

            // Act
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));

            // Assert
            expect(screen.getByTestId('mock-confirm-dialog')).toBeInTheDocument();
            expect(screen.getByText(/Are you sure you want to delete "Upper Body Workout"/)).toBeInTheDocument();
        });

        it('should close confirmation dialog when cancel is clicked', () => {
            // Arrange
            render(<TemplateCard template={mockTemplate} />);

            // Act - Open dialog
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));

            // Assert - Dialog is open
            expect(screen.getByTestId('confirm-button')).toBeInTheDocument();

            // Act - Cancel
            fireEvent.click(screen.getByTestId('cancel-button'));

            // Assert - Dialog content is gone
            expect(screen.queryByTestId('confirm-button')).not.toBeInTheDocument();
        });

        it('should call API to delete template when confirmed', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
            });

            render(<TemplateCard template={mockTemplate} onDeleted={mockOnDeleted} />);

            // Act - Open dialog and confirm
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));
            fireEvent.click(screen.getByTestId('confirm-button'));

            // Assert
            expect(global.fetch).toHaveBeenCalledWith(
                `/api/templates/${mockTemplate.id}`,
                { method: 'DELETE' }
            );

            await waitFor(() => {
                expect(toast.toast.success).toHaveBeenCalledWith('Template deleted successfully');
            });

            expect(mockOnDeleted).toHaveBeenCalled();
        });

        it('should show error toast when delete fails', async () => {
            // Arrange
            const errorMessage = 'Server error';
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ message: errorMessage }),
            });

            render(<TemplateCard template={mockTemplate} onDeleted={mockOnDeleted} />);

            // Act - Open dialog and confirm
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));
            fireEvent.click(screen.getByTestId('confirm-button'));

            // Assert
            await waitFor(() => {
                expect(toast.toast.error).toHaveBeenCalledWith('Error', {
                    description: errorMessage,
                });
            });

            expect(mockOnDeleted).not.toHaveBeenCalled();
        });

        it('should handle JSON parse error in error response', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => { throw new Error('Invalid JSON'); },
            });

            render(<TemplateCard template={mockTemplate} />);

            // Act - Open dialog and confirm
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));
            fireEvent.click(screen.getByTestId('confirm-button'));

            // Assert
            await waitFor(() => {
                expect(toast.toast.error).toHaveBeenCalledWith('Error', {
                    description: 'Failed to delete template',
                });
            });
        });

        it('should handle network errors', async () => {
            // Arrange
            (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            render(<TemplateCard template={mockTemplate} />);

            // Act - Open dialog and confirm
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));
            fireEvent.click(screen.getByTestId('confirm-button'));

            // Assert
            await waitFor(() => {
                expect(toast.toast.error).toHaveBeenCalledWith('Error', {
                    description: 'Network error',
                });
            });
        });

        it('should handle non-Error exceptions', async () => {
            // Arrange
            (global.fetch as any).mockRejectedValueOnce('String error');

            render(<TemplateCard template={mockTemplate} />);

            // Act - Open dialog and confirm
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));
            fireEvent.click(screen.getByTestId('confirm-button'));

            // Assert
            await waitFor(() => {
                expect(toast.toast.error).toHaveBeenCalledWith('Error', {
                    description: 'Failed to delete template',
                });
            });
        });
    });

    describe('UI states', () => {
        it('should disable delete button and show "Deleting..." text while deleting', async () => {
            // Arrange
            let resolvePromise: Function;
            const fetchPromise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            (global.fetch as any).mockImplementationOnce(() => fetchPromise);

            render(<TemplateCard template={mockTemplate} />);

            // Act - Open dialog and confirm
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));
            fireEvent.click(screen.getByTestId('confirm-button'));

            // Assert - Button should be disabled and text should change
            const deleteButton = screen.getByRole('button', { name: /Delete Upper Body Workout/i });
            expect(deleteButton).toBeDisabled();
            expect(deleteButton).toHaveTextContent('Deleting...');

            // Resolve the fetch promise
            resolvePromise!({
                ok: true,
                status: 200,
            });

            // Assert - Button should be enabled again
            await waitFor(() => {
                expect(deleteButton).not.toBeDisabled();
                expect(deleteButton).toHaveTextContent('Delete');
            });
        });

        it('should reset isDeleting state even when API call fails', async () => {
            // Arrange
            (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            render(<TemplateCard template={mockTemplate} />);

            // Act - Open dialog and confirm
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));
            fireEvent.click(screen.getByTestId('confirm-button'));

            // Assert - Button should be disabled initially
            const deleteButton = screen.getByRole('button', { name: /Delete Upper Body Workout/i });
            expect(deleteButton).toBeDisabled();

            // Assert - Button should be enabled again after error
            await waitFor(() => {
                expect(deleteButton).not.toBeDisabled();
            });
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels on buttons', () => {
            // Arrange & Act
            render(<TemplateCard template={mockTemplate} />);

            // Assert
            expect(screen.getByRole('button', { name: `Start workout with ${mockTemplate.name}` })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: `View details of ${mockTemplate.name}` })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: `Delete ${mockTemplate.name}` })).toBeInTheDocument();
        });
    });

    describe('Edge cases', () => {
        it('should handle templates with very long names', () => {
            // Arrange
            const longNameTemplate = {
                ...mockTemplate,
                name: 'This is an extremely long template name that should be truncated in the UI to prevent layout issues',
            };

            // Act
            render(<TemplateCard template={longNameTemplate} />);

            // Assert - The name should be rendered (truncation is handled by CSS)
            expect(screen.getByText(longNameTemplate.name)).toBeInTheDocument();
        });

        it('should handle optional onDeleted callback not being provided', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
            });

            // Act - Render without onDeleted prop
            render(<TemplateCard template={mockTemplate} />);

            // Open dialog and confirm
            fireEvent.click(screen.getByRole('button', { name: /Delete Upper Body Workout/i }));
            fireEvent.click(screen.getByTestId('confirm-button'));

            // Assert - Should not throw errors
            await waitFor(() => {
                expect(toast.toast.success).toHaveBeenCalledWith('Template deleted successfully');
            });
        });
    });
});
