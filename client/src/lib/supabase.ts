// Note: Using direct database connection instead of Supabase client
// as per blueprint instructions
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// This file exists for potential future Supabase client usage
// Currently using direct API calls through our Express server
