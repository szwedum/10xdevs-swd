import { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../db/database.types';
import type {
    CreateTemplateCommand,
    CreateTemplateExerciseCommand,
    TemplateDetailDTO,
    TemplateListItemDTO,
    TemplateListResponseDTO,
} from '../../types';

export interface GetTemplatesOptions {
    limit: number;
    offset: number;
    sort: 'created_at' | 'name';
    order: 'asc' | 'desc';
}

/**
 * Service layer responsible for interacting with the `templates` table.
 * Keeps database-specific details away from the route handler.
 */
export class TemplateService {
    public static async getTemplateDetails(
        supabase: SupabaseClient<Database>,
        templateId: string,
        userId: string,
    ): Promise<TemplateDetailDTO> {
        const { data: template, error } = await supabase
            .from('templates')
            .select(`
                id,
                user_id,
                name,
                created_at,
                template_exercises (id, template_id, exercise_id, sets, reps, default_weight, position, exercises (name))
            `)
            .eq('id', templateId)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // not found
                throw new Error('Template not found');
            }
            throw new Error(`Error fetching template: ${error.message}`);
        }

        return {
            id: template.id,
            user_id: template.user_id,
            name: template.name,
            created_at: template.created_at,
            exercises: template.template_exercises.map((te: any) => ({
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
    }
    public static async createTemplate(
        supabase: SupabaseClient<Database>,
        userId: string,
        command: CreateTemplateCommand,
    ): Promise<TemplateDetailDTO> {
        const { name, exercises } = command;

        console.log('Creating template with:', { userId, name, exercises });

        // Start transaction
        const { data: template, error: templateError } = await supabase
            .from('templates')
            .insert({ user_id: userId, name })
            .select()
            .single();

        console.log('Template creation result:', { template, error: templateError });

        if (templateError) {
            if (templateError.code === '23505') { // unique_violation
                throw new Error(`Template name '${name}' already exists`);
            }
            throw new Error(`Error creating template: ${templateError.message}`);
        }

        // Insert exercises
        const exerciseInserts = exercises.map((exercise) => ({
            template_id: template.id,
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: exercise.reps,
            default_weight: exercise.default_weight,
            position: exercise.position,
        }));

        const { data: templateExercises, error: exercisesError } = await supabase
            .from('template_exercises')
            .insert(exerciseInserts)
            .select(`
                id,
                template_id,
                exercise_id,
                exercises (name),
                sets,
                reps,
                default_weight,
                position
            `);

        if (exercisesError) {
            throw new Error(`Error creating template exercises: ${exercisesError.message}`);
        }

        return {
            id: template.id,
            user_id: template.user_id,
            name: template.name,
            created_at: template.created_at,
            exercises: templateExercises.map((te) => ({
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
    }
    public static async getTemplates(
        supabase: SupabaseClient<Database>,
        userId: string,
        options: GetTemplatesOptions,
    ): Promise<TemplateListResponseDTO> {
        const { limit, offset, sort, order } = options;

        console.log('Building Supabase query with:', { userId, sort, order, offset, limit });

        // ------------------------------------------------------------------
        // Fetch paginated templates together with the exercise count.
        // ------------------------------------------------------------------
        const { data: templates, error } = await supabase
            .from('templates')
            .select(`
                id,
                user_id,
                name,
                created_at,
                template_exercises(count)`)
            .eq('user_id', userId)
            .order(sort, { ascending: order === 'asc' })
            .range(offset, offset + limit - 1);

        console.log('Supabase query result:', { templates, error });

        if (error) {
            throw new Error(`DB error retrieving templates: ${error.message}`);
        }

        const list: TemplateListItemDTO[] = (templates || []).map((row: any) => ({
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            created_at: row.created_at,
            exercise_count: Array.isArray(row.template_exercises)
                ? row.template_exercises[0]?.count ?? 0
                : // For PostgREST 1-row aggregation
                (row.template_exercises as unknown as { count: number }).count ?? 0,
        }));

        // ------------------------------------------------------------------
        // Retrieve total number of templates for pagination metadata.
        // ------------------------------------------------------------------
        const { count: total, error: countError } = await supabase
            .from('templates')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) {
            throw new Error(`DB error counting templates: ${countError.message}`);
        }

        return {
            data: list,
            pagination: {
                limit,
                offset,
                total: total ?? 0,
            },
        };
    }
}
