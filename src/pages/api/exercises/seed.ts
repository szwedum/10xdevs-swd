import type { APIRoute } from "astro";
import { supabaseClient } from "../../../db/supabase.client";

export const prerender = false;

const SEED_EXERCISES = [
  // Push Exercises
  { name: "Bench Press" },
  { name: "Incline Bench Press" },
  { name: "Decline Bench Press" },
  { name: "Overhead Press" },
  { name: "Dumbbell Press" },
  { name: "Dumbbell Incline Press" },
  { name: "Push-ups" },
  { name: "Dips" },
  { name: "Lateral Raises" },
  { name: "Front Raises" },
  { name: "Tricep Extensions" },
  { name: "Tricep Pushdowns" },
  // Pull Exercises
  { name: "Deadlift" },
  { name: "Barbell Row" },
  { name: "Dumbbell Row" },
  { name: "Pull-ups" },
  { name: "Chin-ups" },
  { name: "Lat Pulldowns" },
  { name: "Face Pulls" },
  { name: "Hammer Curls" },
  { name: "Bicep Curls" },
  { name: "Preacher Curls" },
  // Legs Exercises
  { name: "Squat" },
  { name: "Front Squat" },
  { name: "Romanian Deadlift" },
  { name: "Leg Press" },
  { name: "Bulgarian Split Squats" },
  { name: "Lunges" },
  { name: "Calf Raises" },
  { name: "Leg Extensions" },
  { name: "Leg Curls" },
  { name: "Hip Thrusts" },
  // Core Exercises
  { name: "Planks" },
  { name: "Russian Twists" },
  { name: "Ab Rollouts" },
  { name: "Hanging Leg Raises" },
  { name: "Cable Crunches" },
  { name: "Wood Choppers" },
  // Olympic Lifts
  { name: "Clean and Jerk" },
  { name: "Power Clean" },
  { name: "Snatch" },
  { name: "Power Snatch" },
  // Cardio/Conditioning
  { name: "Kettlebell Swings" },
  { name: "Battle Ropes" },
  { name: "Box Jumps" },
  { name: "Burpees" },
];

export const GET: APIRoute = async (): Promise<Response> => {
  // First, get existing exercises
  const { data: existing } = await supabaseClient.from("exercises").select("name");

  // Filter out exercises that already exist
  const existingNames = new Set(existing?.map((e) => e.name) || []);
  const newExercises = SEED_EXERCISES.filter((e) => !existingNames.has(e.name));

  if (newExercises.length === 0) {
    return new Response(
      JSON.stringify({
        message: "All exercises already exist",
        count: existingNames.size,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Insert only new exercises
  const { data: exercises, error } = await supabaseClient.from("exercises").insert(newExercises).select();

  if (error) {
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "Failed to seed exercises",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Successfully added new exercises",
      added: exercises?.length || 0,
      total: (existing?.length || 0) + (exercises?.length || 0),
      data: exercises,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
