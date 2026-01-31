import type { TemplateExerciseDTO } from "@/types";
import { ExerciseItem } from "./ExerciseItem";

interface ExerciseListProps {
  exercises: TemplateExerciseDTO[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  return (
    <ol className="space-y-4">
      {exercises.map((exercise, index) => (
        <li key={exercise.exercise_id}>
          <ExerciseItem exercise={exercise} position={index + 1} />
        </li>
      ))}
    </ol>
  );
}
