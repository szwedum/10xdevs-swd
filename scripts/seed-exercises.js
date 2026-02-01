import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, "..", ".env.test") });

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

async function seedExercises() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testEmail = process.env.E2E_USERNAME;
  const testPassword = process.env.E2E_PASSWORD;

  if (!supabaseUrl || !supabaseKey) {
    console.error("SUPABASE_URL and SUPABASE_KEY must be set in .env.test");
    process.exit(1);
  }

  if (!testEmail || !testPassword) {
    console.error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Authenticate as test user to bypass RLS
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (authError || !authData.user) {
    console.error("✗ Failed to authenticate:", authError?.message || "No user returned");
    process.exit(1);
  }

  console.log("Seeding exercises to test database...");

  // Get existing exercises
  const { data: existing } = await supabase.from("exercises").select("name");

  // Filter out exercises that already exist
  const existingNames = new Set(existing?.map((e) => e.name) || []);
  const newExercises = SEED_EXERCISES.filter((e) => !existingNames.has(e.name)).map((e) => ({
    ...e,
    created_by: authData.user.id, // Add created_by to satisfy RLS policy
  }));

  if (newExercises.length === 0) {
    console.log("✓ All exercises already exist");
    console.log(`  Total exercises in database: ${existingNames.size}`);
    return;
  }

  // Insert only new exercises
  const { data: exercises, error } = await supabase.from("exercises").insert(newExercises).select();

  if (error) {
    console.error("✗ Failed to seed exercises:", error.message);
    process.exit(1);
  }

  console.log(`✓ Successfully added ${exercises?.length || 0} new exercises`);
  console.log(`  Total exercises in database: ${(existing?.length || 0) + (exercises?.length || 0)}`);
}

seedExercises().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
