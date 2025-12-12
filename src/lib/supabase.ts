import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client if env vars are present, otherwise provide a safe stub
let _supabase: any = null;
if (supabaseUrl && supabaseAnonKey) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    // Avoid throwing during module initialization so the app can still render
    // Provide a minimal stub with the pieces the app expects to call
    // Methods return safe default shapes to prevent runtime crashes
    // Log a warning to help developers notice missing configuration
    // eslint-disable-next-line no-console
    console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Supabase is disabled.');

    _supabase = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
            signUp: async () => ({ error: { message: 'Supabase not configured' } }),
            signInWithOAuth: async () => ({ error: { message: 'Supabase not configured' } }),
            signOut: async () => ({ error: null }),
        },
        from: (_: string) => ({
            select: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
        }),
    };
}

export const supabase: any = _supabase;

// Export types for TypeScript
export type { User, Session } from '@supabase/supabase-js';
