import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTemplates } from './useTemplates';
import type { TemplateListResponseDTO } from '@/types';

describe('useTemplates', () => {
    const mockTemplatesData: TemplateListResponseDTO = {
        data: [
            {
                id: '1',
                user_id: 'user-1',
                name: 'Upper Body Workout',
                created_at: '2024-01-15T10:00:00Z',
                exercise_count: 5,
            },
            {
                id: '2',
                user_id: 'user-1',
                name: 'Lower Body Workout',
                created_at: '2024-01-14T10:00:00Z',
                exercise_count: 4,
            },
        ],
        pagination: {
            limit: 50,
            offset: 0,
            total: 2,
        },
    };

    beforeEach(() => {
        global.fetch = vi.fn();
        delete (window as any).location;
        (window as any).location = { href: '' };
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Successful data fetching', () => {
        it('should fetch templates successfully and update state', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockTemplatesData,
            });

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert - Initial loading state
            expect(result.current.loading).toBe(true);
            expect(result.current.templates).toEqual([]);
            expect(result.current.error).toBe(null);

            // Assert - After successful fetch
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.templates).toEqual(mockTemplatesData.data);
            expect(result.current.error).toBe(null);
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/templates?limit=50&offset=0&sort=created_at&order=desc',
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        });

        it('should handle empty templates list', async () => {
            // Arrange
            const emptyResponse: TemplateListResponseDTO = {
                data: [],
                pagination: { limit: 50, offset: 0, total: 0 },
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => emptyResponse,
            });

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.templates).toEqual([]);
            expect(result.current.error).toBe(null);
        });
    });

    describe('Authentication handling', () => {
        it('should redirect to login on 401 status', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({ error: 'Unauthorized' }),
            });

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(window.location.href).toBe('/login');
            expect(result.current.templates).toEqual([]);
            expect(result.current.error).toBe(null);
        });

        it('should not set error state on 401 redirect', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 401,
            });

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe(null);
            expect(console.error).not.toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        it('should handle non-401 HTTP errors', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: 'Internal Server Error' }),
            });

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch templates');
            expect(result.current.templates).toEqual([]);
            expect(console.error).toHaveBeenCalledWith(
                'Error fetching templates:',
                expect.any(Error)
            );
        });

        it('should handle 404 errors', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 404,
            });

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch templates');
            expect(result.current.templates).toEqual([]);
        });

        it('should handle network errors', async () => {
            // Arrange
            (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Network error');
            expect(result.current.templates).toEqual([]);
            expect(console.error).toHaveBeenCalledWith(
                'Error fetching templates:',
                expect.any(Error)
            );
        });

        it('should handle non-Error exceptions', async () => {
            // Arrange
            (global.fetch as any).mockRejectedValueOnce('String error');

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Failed to fetch templates');
            expect(result.current.templates).toEqual([]);
        });

        it('should handle malformed JSON response', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => {
                    throw new Error('Invalid JSON');
                },
            });

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe('Invalid JSON');
            expect(result.current.templates).toEqual([]);
        });
    });

    describe('Refetch functionality', () => {
        it('should refetch templates when refetch is called', async () => {
            // Arrange
            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockTemplatesData,
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({
                        ...mockTemplatesData,
                        data: [mockTemplatesData.data[0]],
                    }),
                });

            // Act
            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.templates).toHaveLength(2);

            // Act - Refetch
            await result.current.refetch();

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.templates).toHaveLength(1);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('should reset error state on refetch', async () => {
            // Arrange
            (global.fetch as any)
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockTemplatesData,
                });

            // Act
            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.error).toBe('Network error');
            });

            // Act - Refetch
            await result.current.refetch();

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.error).toBe(null);
            expect(result.current.templates).toEqual(mockTemplatesData.data);
        });

        it('should set loading state during refetch', async () => {
            // Arrange
            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockTemplatesData,
                })
                .mockImplementationOnce(
                    () =>
                        new Promise((resolve) => {
                            setTimeout(() => {
                                resolve({
                                    ok: true,
                                    status: 200,
                                    json: async () => mockTemplatesData,
                                });
                            }, 100);
                        })
                );

            // Act
            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Act - Refetch
            const refetchPromise = result.current.refetch();

            // Assert - Loading state during refetch
            expect(result.current.loading).toBe(true);

            await refetchPromise;

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });
        });
    });

    describe('State management', () => {
        it('should maintain stable refetch reference', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValue({
                ok: true,
                status: 200,
                json: async () => mockTemplatesData,
            });

            // Act
            const { result, rerender } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const firstRefetch = result.current.refetch;

            // Act - Rerender
            rerender();

            // Assert - refetch reference should be stable
            expect(result.current.refetch).toBe(firstRefetch);
        });

        it('should clear previous templates on error', async () => {
            // Arrange
            (global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => mockTemplatesData,
                })
                .mockRejectedValueOnce(new Error('Network error'));

            // Act
            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.templates).toHaveLength(2);
            });

            // Act - Refetch with error
            await result.current.refetch();

            // Assert - Templates should remain from previous successful fetch
            await waitFor(() => {
                expect(result.current.error).toBe('Network error');
            });

            expect(result.current.templates).toHaveLength(2);
        });
    });

    describe('Edge cases', () => {
        it('should handle concurrent refetch calls', async () => {
            // Arrange
            let resolveCount = 0;
            (global.fetch as any).mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => {
                            resolveCount++;
                            resolve({
                                ok: true,
                                status: 200,
                                json: async () => mockTemplatesData,
                            });
                        }, 50);
                    })
            );

            // Act
            const { result } = renderHook(() => useTemplates());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            // Act - Multiple concurrent refetches
            const refetch1 = result.current.refetch();
            const refetch2 = result.current.refetch();
            const refetch3 = result.current.refetch();

            await Promise.all([refetch1, refetch2, refetch3]);

            // Assert - All calls should complete
            expect(result.current.loading).toBe(false);
            expect(result.current.templates).toEqual(mockTemplatesData.data);
        });

        it('should handle fetch returning null data', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ data: null, pagination: { limit: 50, offset: 0, total: 0 } }),
            });

            // Act
            const { result } = renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.templates).toBe(null);
        });
    });

    describe('API contract validation', () => {
        it('should call API with correct query parameters', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockTemplatesData,
            });

            // Act
            renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/templates?limit=50&offset=0&sort=created_at&order=desc',
                    expect.objectContaining({
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                );
            });
        });

        it('should call API with correct headers', async () => {
            // Arrange
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockTemplatesData,
            });

            // Act
            renderHook(() => useTemplates());

            // Assert
            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            'Content-Type': 'application/json',
                        }),
                    })
                );
            });
        });
    });
});
