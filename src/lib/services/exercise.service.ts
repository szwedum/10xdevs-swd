import { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../../db/database.types';
import type { ExerciseDTO, ExerciseListResponseDTO } from '../../types';

export interface GetExercisesOptions {
    limit: number;
    offset: number;
    search?: string;
}

export class ExerciseService {
    public static async getExercises(
        supabase: SupabaseClient<Database>,
        options: GetExercisesOptions,
    ): Promise<ExerciseListResponseDTO> {
        const { limit, offset, search } = options;

        // Build query
        let query = supabase
            .from('exercises')
            .select('*', { count: 'exact' });

        // Apply search filter if provided
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Apply pagination
        const { data: exercises, error, count } = await query
            .order('name')
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error(`Error fetching exercises: ${error.message}`);
        }

        return {
            data: exercises as ExerciseDTO[],
            pagination: {
                limit,
                offset,
                total: count ?? 0,
            },
        };
    }
}
