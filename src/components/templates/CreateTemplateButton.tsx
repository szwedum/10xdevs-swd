import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CreateTemplateButton() {
    return (
        <Button
            onClick={() => window.location.href = '/templates/new'}
            aria-label="Create new template"
        >
            <Plus className="mr-2 h-4 w-4" />
            Create Template
        </Button>
    );
}
