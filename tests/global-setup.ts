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

  // Create browser and set up storage state
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Set localStorage with Supabase session
  await context.addInitScript(
    ({ supabaseSession }) => {
      window.localStorage.setItem("supabase.auth.token", JSON.stringify(supabaseSession));
    },
    {
      supabaseSession: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + authData.session.expires_in,
      },
    }
  );

  // Save the storage state for tests
  await context.storageState({ path: "tests/.auth/user.json" });
  await browser.close();

  console.log("Global setup completed");
}

export default globalSetup;
