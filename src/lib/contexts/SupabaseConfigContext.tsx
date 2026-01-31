import { createContext } from "react";

export interface SupabaseConfig {
    supabaseUrl: string;
    supabaseKey: string;
    accessToken?: string;
    refreshToken?: string;
}

export const SupabaseConfigContext = createContext<SupabaseConfig | null>(null);
