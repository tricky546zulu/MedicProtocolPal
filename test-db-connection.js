// Test script to debug Supabase connection
import postgres from 'postgres';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Key length:', SERVICE_ROLE_KEY ? SERVICE_ROLE_KEY.length : 'undefined');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing environment variables');
  process.exit(1);
}

const url = new URL(SUPABASE_URL);
const projectRef = url.hostname.split('.')[0];

// Try multiple connection formats with proper URL encoding
const encodedKey = encodeURIComponent(SERVICE_ROLE_KEY);
const formats = [
  // Format 1: Direct connection
  `postgresql://postgres:${encodedKey}@${url.hostname}:5432/postgres`,
  
  // Format 2: Pooler with port 5432 (session mode)  
  `postgresql://postgres.${projectRef}:${encodedKey}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`,
  
  // Format 3: Pooler with port 6543 (transaction mode)
  `postgresql://postgres.${projectRef}:${encodedKey}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
];

for (let i = 0; i < formats.length; i++) {
  console.log(`\nTrying format ${i + 1}...`);
  try {
    const sql = postgres(formats[i], {
      ssl: 'require',
      max: 1,
      connect_timeout: 10,
      prepare: false
    });
    
    const result = await sql`SELECT 1 as test`;
    console.log(`✅ Format ${i + 1} works!`, result);
    sql.end();
    break;
  } catch (error) {
    console.log(`❌ Format ${i + 1} failed:`, error.message);
  }
}