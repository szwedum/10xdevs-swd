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

  // Create browser and perform actual login to get proper cookies
  const baseURL = config.projects[0].use?.baseURL || "http://localhost:4321";
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  // Navigate to login page
  await page.goto(`${baseURL}/login`);

  // Wait for the form to be ready (React component needs to hydrate)
  await page.waitForSelector('input[name="email"]', { state: "visible" });
  await page.waitForTimeout(1000); // Give React time to hydrate

  // Fill in login form
  await page.fill('input[name="email"]', process.env.E2E_USERNAME!);
  await page.fill('input[name="password"]', process.env.E2E_PASSWORD!);

  // Submit the form and wait for the API call and navigation
  const [response] = await Promise.all([
    page.waitForResponse((response) => response.url().includes('/api/auth/login') && response.status() === 200),
    page.click('button[type="submit"]'),
  ]);

  console.log("Login API response:", response.status());

  // Wait for the redirect to complete
  await page.waitForURL(`${baseURL}/templates`, { timeout: 5000 });

  console.log("Login completed, current URL:", page.url());

  // Save the storage state for tests (includes cookies set by the login endpoint)
  await context.storageState({ path: "tests/.auth/user.json" });
  await browser.close();

  console.log("Global setup completed");
}

export default globalSetup;
