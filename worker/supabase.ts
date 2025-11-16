import { createClient } from '@supabase/supabase-js';
import { Context } from 'hono';
// This function initializes and returns Supabase clients.
// It's designed to be called within a route handler to access context (c.env).
export const getSupabaseClients = (c: Context) => {
  const supabaseUrl = c.env.SUPABASE_URL as string;
  const supabaseAnonKey = c.env.SUPABASE_ANON_KEY as string;
  const supabaseServiceRoleKey = c.env.SUPABASE_SERVICE_ROLE_KEY as string;
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error('Supabase environment variables are not set.');
  }
  // Public client for read-only operations, using the anon key.
  const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);
  // Admin client for write operations and bypassing RLS, using the service role key.
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return { supabasePublic, supabaseAdmin };
};