import { useState } from 'react';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { TemplateListItemDTO } from '@/types';

interface TemplateCardProps {
    template: TemplateListItemDTO;
    onDeleted?: () => void;
}

export function TemplateCard({ template, onDeleted }: TemplateCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleStartWorkout = () => {
        window.location.href = `/workout/${template.id}`;
    };

    const handleViewDetails = () => {
        window.location.href = `/templates/${template.id}`;
    };

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);

        try {
            const response = await fetch(`/api/templates/${template.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete template');
            }

            toast.success('Template deleted successfully');

            if (onDeleted) {
                onDeleted();
            }
        } catch (error) {
            toast.error('Error', {
                description: error instanceof Error ? error.message : 'Failed to delete template',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{template.name}</span>
                    </CardTitle>
                    <CardDescription>
                        {template.exercise_count} exercise{template.exercise_count === 1 ? '' : 's'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Created on {new Date(template.created_at).toLocaleDateString()}
                    </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button
                        onClick={handleStartWorkout}
                        className="flex-1"
                        aria-label={`Start workout with ${template.name}`}
                    >
                        Start Workout
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleViewDetails}
                        className="flex-1"
                        aria-label={`View details of ${template.name}`}
                    >
                        View Details
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        className="flex-1"
                        aria-label={`Delete ${template.name}`}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </CardFooter>
            </Card>

            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title="Delete Template"
                description={`Are you sure you want to delete "${template.name}"? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </>
    );
}
