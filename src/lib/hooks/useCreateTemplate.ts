import { useState, useMemo, useContext, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { CreateTemplateCommand, TemplateDetailDTO } from "@/types";
import type { Database } from "@/db/database.types";
import { SupabaseConfigContext } from "@/lib/contexts/SupabaseConfigContext";

interface UseCreateTemplateResult {
    createTemplate: (data: CreateTemplateCommand) => Promise<TemplateDetailDTO>;
    isLoading: boolean;
    error: string | null;
}

export function useCreateTemplate(): UseCreateTemplateResult {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const config = useContext(SupabaseConfigContext);

    console.log('useCreateTemplate - config:', config);

    const supabase = useMemo(() => {
        console.log('useCreateTemplate - creating supabase client, config:', config);
        if (!config) {
            console.log('useCreateTemplate - config is null, returning null');
            return null;
        }
        console.log('useCreateTemplate - creating browser client with:', config.supabaseUrl);
        return createBrowserClient<Database>(config.supabaseUrl, config.supabaseKey);
    }, [config]);

    // Set session when supabase client and tokens are available
    useEffect(() => {
        if (supabase && config?.accessToken && config?.refreshToken) {
            console.log('useCreateTemplate - setting session with tokens');
            supabase.auth.setSession({
                access_token: config.accessToken,
                refresh_token: config.refreshToken,
            }).then(({ data, error }) => {
                if (error) {
                    console.error('useCreateTemplate - error setting session:', error);
                } else {
                    console.log('useCreateTemplate - session set successfully:', data.session?.user?.id);
                }
            });
        }
    }, []); // Run only once on mount

    const createTemplate = async (data: CreateTemplateCommand): Promise<TemplateDetailDTO> => {
        if (!supabase) {
            throw new Error("Supabase client not initialized");
        }

        setIsLoading(true);
        setError(null);

        try {
            // Ensure session is set before proceeding
            let userId: string;
            if (config?.accessToken && config?.refreshToken) {
                console.log('createTemplate - ensuring session is set');
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                    access_token: config.accessToken,
                    refresh_token: config.refreshToken,
                });
                console.log('createTemplate - setSession response:', {
                    session: sessionData.session?.user?.id,
                    error: sessionError
                });
                if (sessionError) {
                    console.error('createTemplate - session error:', sessionError);
                    throw new Error(`Session error: ${sessionError.message}`);
                }
                if (!sessionData.session?.user?.id) {
                    throw new Error("Session not created - tokens may be invalid");
                }
                userId = sessionData.session.user.id;
                console.log('createTemplate - using userId from session:', userId);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                console.log('createTemplate - user from getUser:', user?.id);
                if (!user?.id) throw new Error("User not authenticated");
                userId = user.id;
            }

            // Create template
            const { data: template, error: templateError } = await supabase
                .from("templates")
                .insert({
                    name: data.name,
                    user_id: userId,
                })
                .select()
                .single();

            if (templateError) throw templateError;

            // Create template exercises
            const { error: exercisesError } = await supabase
                .from("template_exercises")
                .insert(
                    data.exercises.map((exercise) => ({
                        template_id: template.id,
                        exercise_id: exercise.exercise_id,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        default_weight: exercise.default_weight,
                        position: exercise.position,
                    }))
                );

            if (exercisesError) throw exercisesError;

            // Fetch complete template with exercises
            const { data: templateDetail, error: detailError } = await supabase
                .from("templates")
                .select(`
          *,
          template_exercises (
            *,
            exercises (*)
          )
        `)
                .eq("id", template.id)
                .single();

            if (detailError) throw detailError;

            // Transform to match TemplateDetailDTO structure
            const response: TemplateDetailDTO = {
                id: templateDetail.id,
                user_id: templateDetail.user_id,
                name: templateDetail.name,
                created_at: templateDetail.created_at,
                exercises: templateDetail.template_exercises.map((te: any) => ({
                    id: te.id,
                    template_id: te.template_id,
                    exercise_id: te.exercise_id,
                    exercise_name: te.exercises.name,
                    sets: te.sets,
                    reps: te.reps,
                    default_weight: te.default_weight,
                    position: te.position,
                })),
            };

            return response;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create template";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { createTemplate, isLoading, error };
}
