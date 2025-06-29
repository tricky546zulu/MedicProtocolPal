
import { createClient } from '@supabase/supabase-js';

// Note: Using direct database connection instead of Supabase client
// as per blueprint instructions for server-side operations
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Initialize the Supabase client for client-side operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Example function to test the connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users') // Using the users table from your schema
      .select('count(*)', { count: 'exact', head: true });

    if (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    } else {
      console.log('Supabase connection successful');
      return true;
    }
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
}
