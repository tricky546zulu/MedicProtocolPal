
import { createClient } from '@supabase/supabase-js';

// Access your Supabase URL and Anon Key from Replit's environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('Testing Supabase client connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 'undefined');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection by fetching from users table
async function testConnection() {
  try {
    console.log('Testing connection to users table...');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5);

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      console.log('✅ Supabase client connection successful!');
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
}

// Call the function to test the connection
testConnection();
