// One-time script to create catering_inquiries table via Supabase
// Run with: node create_catering_table.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  // Try to insert a test row to see if table exists
  const { error: testErr } = await supabase
    .from('catering_inquiries')
    .select('id')
    .limit(1);

  if (!testErr) {
    console.log('catering_inquiries table already exists!');
    return;
  }

  console.log('Table does not exist. Please run this SQL in Supabase Dashboard > SQL Editor:');
  console.log(`
-- Create catering inquiries table
CREATE TABLE IF NOT EXISTS catering_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_date DATE,
  guest_count TEXT,
  event_type TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE catering_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert (public form submissions)
CREATE POLICY "Allow public catering inquiries"
  ON catering_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated admins to read all inquiries
CREATE POLICY "Allow admins to read catering inquiries"
  ON catering_inquiries
  FOR SELECT
  TO authenticated
  USING (true);
`);
}

main().catch(console.error);
