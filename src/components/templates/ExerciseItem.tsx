import type { TemplateExerciseDTO } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExerciseItemProps {
    exercise: TemplateExerciseDTO;
    position: number;
}

export function ExerciseItem({ exercise, position }: ExerciseItemProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-sm">
                        {position}
                    </span>
                    <span>{exercise.exercise_name}</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <dl className="grid grid-cols-3 gap-4">
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground">Sets</dt>
                        <dd className="text-2xl font-bold">{exercise.sets}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground">Reps</dt>
                        <dd className="text-2xl font-bold">{exercise.reps}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-muted-foreground">Weight</dt>
                        <dd className="text-2xl font-bold">
                            {exercise.default_weight ? `${exercise.default_weight}kg` : '—'}
                        </dd>
                    </div>
                </dl>
            </CardContent>
        </Card>
    );
}
