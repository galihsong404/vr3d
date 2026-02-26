import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''; // Use service role key for backend ops if needed, but for now anon works.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Default client (anon)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client (bypasses RLS) - Use carefully in API routes only
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || supabaseKey);
