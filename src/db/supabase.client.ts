import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

// TODO: Remove when auth is implemented
export const DEFAULT_USER_ID = "a36d88ce-4421-43e1-adbc-3fad9e027df9";

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
