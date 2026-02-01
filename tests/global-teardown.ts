import { type FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalTeardown(config: FullConfig) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.warn('SUPABASE_URL and SUPABASE_KEY not set, skipping teardown');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testpassword123';

    console.log('Tearing down test environment...');

    try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
        });

        if (signInError) {
            console.warn('Could not sign in to clean up test user:', signInError.message);
            return;
        }

        if (data.user) {
            const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);

            if (deleteError) {
                console.warn('Could not delete test user:', deleteError.message);
            } else {
                console.log('Test user cleaned up successfully');
            }
        }
    } catch (error) {
        console.warn('Error during teardown:', error);
    }

    console.log('Global teardown completed');
}

export default globalTeardown;
