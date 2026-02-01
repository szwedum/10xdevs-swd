import { chromium, type FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalSetup(config: FullConfig) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';

    console.log('Setting up test environment...');

    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
    });

    if (checkError && checkError.message !== 'Invalid login credentials') {
        console.error('Error checking existing user:', checkError);
    }

    if (!existingUser?.user) {
        console.log('Creating test user...');
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (error) {
            throw new Error(`Failed to create test user: ${error.message}`);
        }

        console.log('Test user created successfully');
    } else {
        console.log('Test user already exists');
    }

    const browser = await chromium.launch();
    const page = await browser.newPage();
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

    await page.goto(`${baseURL}/api/auth/login`);
    await page.evaluate(
        async ({ email, password }) => {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                throw new Error('Failed to authenticate');
            }
        },
        { email: testEmail, password: testPassword }
    );

    await page.context().storageState({ path: 'tests/.auth/user.json' });
    await browser.close();

    console.log('Global setup completed');
}

export default globalSetup;
