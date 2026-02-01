import { chromium, type FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

async function globalSetup(config: FullConfig) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL and SUPABASE_KEY must be set in environment variables");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const testEmail = process.env.E2E_USERNAME || "test@example.com";
  const testPassword = process.env.E2E_PASSWORD || "testpassword123";

  console.log("Setting up test environment...");

  const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_USERNAME!,
    password: process.env.E2E_PASSWORD!,
  });

  if (checkError && checkError.message !== "Invalid login credentials") {
    console.error("Error checking existing user:", checkError);
  }

  if (!existingUser?.user) {
    console.log("Creating test user...");
    const { data, error } = await supabase.auth.signUp({
      email: process.env.E2E_USERNAME!,
      password: process.env.E2E_PASSWORD!,
    });

    if (error) {
      throw new Error(`Failed to create test user: ${error.message}`);
    }

    console.log("Test user created successfully");
  } else {
    console.log("Test user already exists");
  }

  // Authenticate with Supabase directly
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.E2E_USERNAME!,
    password: process.env.E2E_PASSWORD!,
  });

  if (authError) {
    throw new Error(`Failed to authenticate for tests: ${authError.message}`);
  }

  if (!authData.session) {
    throw new Error("No session returned from authentication");
  }

  console.log("Successfully authenticated with Supabase");

  // Seed exercises for tests using authenticated client
  console.log("Seeding exercises...");
  const SEED_EXERCISES = [
    { name: "Bench Press", created_by: authData.user.id },
    { name: "Incline Bench Press", created_by: authData.user.id },
    { name: "Decline Bench Press", created_by: authData.user.id },
    { name: "Overhead Press", created_by: authData.user.id },
    { name: "Dumbbell Press", created_by: authData.user.id },
    { name: "Dumbbell Incline Press", created_by: authData.user.id },
    { name: "Push-ups", created_by: authData.user.id },
    { name: "Dips", created_by: authData.user.id },
    { name: "Lateral Raises", created_by: authData.user.id },
    { name: "Front Raises", created_by: authData.user.id },
    { name: "Tricep Extensions", created_by: authData.user.id },
    { name: "Tricep Pushdowns", created_by: authData.user.id },
    { name: "Deadlift", created_by: authData.user.id },
    { name: "Barbell Row", created_by: authData.user.id },
    { name: "Dumbbell Row", created_by: authData.user.id },
    { name: "Pull-ups", created_by: authData.user.id },
    { name: "Chin-ups", created_by: authData.user.id },
    { name: "Lat Pulldowns", created_by: authData.user.id },
    { name: "Face Pulls", created_by: authData.user.id },
    { name: "Hammer Curls", created_by: authData.user.id },
    { name: "Bicep Curls", created_by: authData.user.id },
    { name: "Preacher Curls", created_by: authData.user.id },
    { name: "Squat", created_by: authData.user.id },
    { name: "Front Squat", created_by: authData.user.id },
    { name: "Romanian Deadlift", created_by: authData.user.id },
    { name: "Leg Press", created_by: authData.user.id },
    { name: "Bulgarian Split Squats", created_by: authData.user.id },
    { name: "Lunges", created_by: authData.user.id },
    { name: "Calf Raises", created_by: authData.user.id },
    { name: "Leg Extensions", created_by: authData.user.id },
    { name: "Leg Curls", created_by: authData.user.id },
    { name: "Hip Thrusts", created_by: authData.user.id },
    { name: "Planks", created_by: authData.user.id },
    { name: "Russian Twists", created_by: authData.user.id },
    { name: "Ab Rollouts", created_by: authData.user.id },
    { name: "Hanging Leg Raises", created_by: authData.user.id },
    { name: "Cable Crunches", created_by: authData.user.id },
    { name: "Wood Choppers", created_by: authData.user.id },
    { name: "Clean and Jerk", created_by: authData.user.id },
    { name: "Power Clean", created_by: authData.user.id },
    { name: "Snatch", created_by: authData.user.id },
    { name: "Power Snatch", created_by: authData.user.id },
    { name: "Kettlebell Swings", created_by: authData.user.id },
    { name: "Battle Ropes", created_by: authData.user.id },
    { name: "Box Jumps", created_by: authData.user.id },
    { name: "Burpees", created_by: authData.user.id },
  ];

  // Create authenticated Supabase client
  const authenticatedSupabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authData.session.access_token}`,
      },
    },
  });

  const { data: existingExercises } = await authenticatedSupabase.from("exercises").select("name");
  const existingNames = new Set(existingExercises?.map((e) => e.name) || []);
  const newExercises = SEED_EXERCISES.filter((e) => !existingNames.has(e.name));

  if (newExercises.length > 0) {
    const { error: seedError } = await authenticatedSupabase.from("exercises").insert(newExercises);
    if (seedError) {
      console.error("Failed to seed exercises:", seedError);
    } else {
      console.log(`Seeded ${newExercises.length} exercises`);
    }
  } else {
    console.log("All exercises already exist");
  }

  // Wait for the dev server to be ready
  const baseURL = config.projects[0].use?.baseURL || "http://localhost:4321";
  console.log("Waiting for dev server to be ready...");

  // Poll the server until it's ready (max 60 seconds)
  const maxWaitTime = 60000;
  const startTime = Date.now();
  let serverReady = false;

  while (!serverReady && Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(baseURL);
      if (response.ok || response.status === 404) {
        serverReady = true;
        console.log("Dev server is ready");
      }
    } catch (error) {
      // Server not ready yet, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!serverReady) {
    throw new Error("Dev server did not start in time");
  }

  // Create browser and perform actual login to get proper cookies
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  // Navigate to login page
  await page.goto(`${baseURL}/login`);

  // Wait for the form to be ready (React component needs to hydrate)
  await page.waitForSelector('input[name="email"]', { state: "visible" });
  await page.waitForSelector('button[type="submit"]:not([disabled])', { state: "visible" });

  // Wait for React to hydrate - check if the form is interactive
  await page.waitForTimeout(2000);

  // Fill in login form
  await page.fill('input[name="email"]', process.env.E2E_USERNAME!);
  await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);

  // Submit the form and wait for the API call and navigation
  // Use Promise.race to handle both success and error responses
  const [response] = await Promise.all([
    page.waitForResponse((response) => response.url().includes("/api/auth/login"), { timeout: 30000 }),
    page.click('button[type="submit"]'),
  ]);

  console.log("Login API response:", response.status());

  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(`Login failed with status ${response.status()}: ${body}`);
  }

  // Wait for the redirect to complete
  await page.waitForURL(`${baseURL}/templates`, { timeout: 10000 });

  console.log("Login completed, current URL:", page.url());

  // Save the storage state for tests (includes cookies set by the login endpoint)
  await context.storageState({ path: "tests/.auth/user.json" });
  await browser.close();

  console.log("Global setup completed");
}

export default globalSetup;
