import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useExercises } from "@/lib/hooks/useExercises";
import type { ExerciseSelectorProps } from "./types";

export function ExerciseSelector({
    onSelect,
    selectedExerciseIds,
    disabled = false,
}: ExerciseSelectorProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const { exercises, loading, error } = useExercises({ search });

    const availableExercises = exercises.filter(
        (exercise) => !selectedExerciseIds.includes(exercise.id)
    );

    React.useEffect(() => {
        console.log('=== ExerciseSelector Debug ===');
        console.log('Total exercises:', exercises.length);
        console.log('Available exercises:', availableExercises.length);
        console.log('Loading:', loading);
        console.log('Error:', error);
        console.log('Open:', open);
        console.log('First 3 exercises:', availableExercises.slice(0, 3).map(e => ({ id: e.id, name: e.name })));
    }, [exercises.length, availableExercises.length, loading, error, open]);

    return (
        <div className="space-y-2" data-test-id="exercise-selector-container">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        disabled={disabled || loading}
                        data-test-id="select-exercise-button"
                    >
                        <span className="truncate">
                            {loading ? "Loading exercises..." : "Select an exercise"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" side="bottom" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search exercises..."
                            value={search}
                            onValueChange={setSearch}
                            data-test-id="exercise-search-input"
                        />
                        <CommandList>
                            {error ? (
                                <CommandEmpty>Failed to load exercises. Please try again.</CommandEmpty>
                            ) : availableExercises.length === 0 ? (
                                <CommandEmpty>No exercises found.</CommandEmpty>
                            ) : (
                                <CommandGroup>
                                    {availableExercises.map((exercise) => (
                                        <button
                                            key={exercise.id}
                                            type="button"
                                            className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => {
                                                onSelect(exercise);
                                                setOpen(false);
                                                setSearch("");
                                            }}
                                            data-test-id={`exercise-item-${exercise.id}`}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedExerciseIds.includes(exercise.id)
                                                        ? "opacity-100"
                                                        : "opacity-0"
                                                )}
                                            />
                                            {exercise.name}
                                        </button>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
