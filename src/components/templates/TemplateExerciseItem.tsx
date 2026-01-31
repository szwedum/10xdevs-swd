import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoveUp, MoveDown, Trash2 } from "lucide-react";
import type { TemplateExerciseItemProps } from "./types";

export function TemplateExerciseItem({
    exercise,
    canMoveUp,
    canMoveDown,
    onUpdate,
    onRemove,
    onMoveUp,
    onMoveDown,
}: TemplateExerciseItemProps) {
    return (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{exercise.exercise_name}</h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMoveUp}
                        disabled={!canMoveUp}
                        aria-label="Move exercise up"
                    >
                        <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMoveDown}
                        disabled={!canMoveDown}
                        aria-label="Move exercise down"
                    >
                        <MoveDown className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRemove}
                        className="text-destructive"
                        aria-label="Remove exercise"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label htmlFor={`sets-${exercise.id}`} className="text-sm font-medium">
                        Sets <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id={`sets-${exercise.id}`}
                        type="number"
                        min={1}
                        max={99}
                        value={exercise.sets}
                        onChange={(e) => onUpdate("sets", parseInt(e.target.value, 10))}
                        aria-describedby={
                            exercise.errors.sets ? `sets-error-${exercise.id}` : undefined
                        }
                        aria-invalid={!!exercise.errors.sets}
                        className={exercise.errors.sets ? "border-destructive" : ""}
                    />
                    {exercise.errors.sets && (
                        <p
                            id={`sets-error-${exercise.id}`}
                            className="text-sm text-destructive"
                        >
                            {exercise.errors.sets}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor={`reps-${exercise.id}`} className="text-sm font-medium">
                        Reps <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id={`reps-${exercise.id}`}
                        type="number"
                        min={1}
                        max={99}
                        value={exercise.reps}
                        onChange={(e) => onUpdate("reps", parseInt(e.target.value, 10))}
                        aria-describedby={
                            exercise.errors.reps ? `reps-error-${exercise.id}` : undefined
                        }
                        aria-invalid={!!exercise.errors.reps}
                        className={exercise.errors.reps ? "border-destructive" : ""}
                    />
                    {exercise.errors.reps && (
                        <p
                            id={`reps-error-${exercise.id}`}
                            className="text-sm text-destructive"
                        >
                            {exercise.errors.reps}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor={`weight-${exercise.id}`}
                        className="text-sm font-medium"
                    >
                        Weight (kg) <span className="text-destructive">*</span>
                    </label>
                    <Input
                        id={`weight-${exercise.id}`}
                        type="number"
                        min={0}
                        max={999.99}
                        step={0.01}
                        value={exercise.default_weight}
                        onChange={(e) =>
                            onUpdate("default_weight", parseFloat(e.target.value))
                        }
                        aria-describedby={
                            exercise.errors.default_weight
                                ? `weight-error-${exercise.id}`
                                : undefined
                        }
                        aria-invalid={!!exercise.errors.default_weight}
                        className={exercise.errors.default_weight ? "border-destructive" : ""}
                    />
                    {exercise.errors.default_weight && (
                        <p
                            id={`weight-error-${exercise.id}`}
                            className="text-sm text-destructive"
                        >
                            {exercise.errors.default_weight}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
