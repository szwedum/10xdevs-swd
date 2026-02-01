import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

test.describe('Authentication and Database Access', () => {
    test('should be able to access Supabase with authenticated user', async ({ page }) => {
        // The auth state is already set up by global-setup.ts

        // Navigate to the home page
        await page.goto('/');

        // Check that we're on the home page (not redirected to login)
        await expect(page).not.toHaveURL(/\/login/);

        console.log('Testing server-side Supabase authentication...');

        // Create a server-side Supabase client to test database access
        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_PUBLIC_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // First authenticate with Supabase
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: process.env.E2E_USERNAME!,
            password: process.env.E2E_PASSWORD!,
        });

        expect(authError).toBeNull();
        expect(authData.user).toBeTruthy();
        console.log('Successfully authenticated with Supabase for database operations');

        // Try to access the templates table (which has RLS enabled)
        const { data: templates, error } = await supabase
            .from('templates')
            .select('*')
            .limit(10);

        // We should be able to query without error
        expect(error).toBeNull();
        // Data should be an array (might be empty if no templates exist)
        expect(Array.isArray(templates)).toBe(true);
        console.log(`Found ${templates?.length || 0} existing templates`);

        // Create a test template to verify we can write to the database
        const testTemplate = {
            user_id: authData.user.id,
            name: `Test Template ${Date.now()}`
        };

        const { data: insertedTemplate, error: insertError } = await supabase
            .from('templates')
            .insert(testTemplate)
            .select()
            .single();

        expect(insertError).toBeNull();
        expect(insertedTemplate).toBeTruthy();
        expect(insertedTemplate.name).toBe(testTemplate.name);

        console.log('Successfully created test template with ID:', insertedTemplate?.id);

        // The global-teardown.ts will clean up this template
    });
});
