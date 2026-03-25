// One-time script: Add nullable country column to posts table
// Run: node scripts/add-country-column.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Use rpc to run raw SQL — requires a helper function in Supabase
  // Since we can't run raw DDL via the REST API, we'll verify the column
  // exists by attempting a select on it
  const { data, error } = await supabase
    .from('posts')
    .select('id, country')
    .limit(1);

  if (error && error.message.includes('country')) {
    console.log('Column "country" does not exist yet.');
    console.log('Please run this SQL in the Supabase SQL Editor:');
    console.log('  ALTER TABLE posts ADD COLUMN IF NOT EXISTS country text;');
    process.exit(1);
  }

  console.log('Column "country" exists on posts table.');
  if (data && data.length > 0) {
    console.log('Sample row:', data[0]);
  }
}

main().catch(console.error);
