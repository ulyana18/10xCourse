import { createClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey); 

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "f25d1fd3-f04f-40ac-aa5f-827c0d66d1de";
