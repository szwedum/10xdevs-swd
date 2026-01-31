import type { APIRoute } from 'astro';
import { supabaseClient } from '../../../db/supabase.client';
import type { ErrorResponseDTO } from '../../../types';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }): Promise<Response> => {
    try {
        const accessToken = cookies.get('sb-access-token')?.value;
        const refreshToken = cookies.get('sb-refresh-token')?.value;

        if (accessToken && refreshToken) {
            await supabaseClient.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            await supabaseClient.auth.signOut();
        }

        cookies.delete('sb-access-token', { path: '/' });
        cookies.delete('sb-refresh-token', { path: '/' });

        return new Response(JSON.stringify({
            message: 'Logout successful',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Logout error:', err);

        cookies.delete('sb-access-token', { path: '/' });
        cookies.delete('sb-refresh-token', { path: '/' });

        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred during logout',
        } as ErrorResponseDTO), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
