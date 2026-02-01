import { type FullConfig } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

async function globalTeardown(config: FullConfig) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("SUPABASE_URL and SUPABASE_KEY not set, skipping teardown");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const testEmail = process.env.E2E_USERNAME || "test@example.com";
  const testPassword = process.env.E2E_PASSWORD || "testpassword123";

  console.log("Tearing down test environment...");

  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.E2E_USERNAME!,
      password: process.env.E2E_PASSWORD!,
    });

    if (signInError) {
      console.warn("Could not sign in to clean up test user:", signInError.message);
      return;
    }

    if (data.user) {
      // Instead of deleting the user, clean up any test data created during tests
      // This approach avoids needing admin privileges
      console.log("Cleaning up test data for user:", data.user.id);

      try {
        // Delete templates created during tests
        const { error: templatesError } = await supabase.from("templates").delete().eq("user_id", data.user.id);

        if (templatesError) {
          console.warn("Error cleaning up templates:", templatesError.message);
        } else {
          console.log("Successfully cleaned up templates");
        }

        // Delete any exercises created by this user
        const { error: exercisesError } = await supabase.from("exercises").delete().eq("created_by", data.user.id);

        if (exercisesError) {
          console.warn("Error cleaning up exercises:", exercisesError.message);
        } else {
          console.log("Successfully cleaned up exercises");
        }

        // Add more cleanup operations for other tables as needed
      } catch (cleanupError) {
        console.warn("Error during data cleanup:", cleanupError);
      }
    }
  } catch (error) {
    console.warn("Error during teardown:", error);
  }

  console.log("Global teardown completed");
}

export default globalTeardown;
