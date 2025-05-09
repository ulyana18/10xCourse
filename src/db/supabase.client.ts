import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey); 

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "ea4387f0-8063-4fbf-9afa-20a324186642";
