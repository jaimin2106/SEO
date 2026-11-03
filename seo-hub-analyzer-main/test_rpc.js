import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'admin@gmail.com', password: 'password123' }); // Try to login if needed or assume RLS bypass
  if (error) console.log("Login error (ignoring if just testing):", error.message);

  const res = await supabase.rpc('start_scan_job', { p_url: 'https://test.com', p_domain: 'test.com' });
  console.log(JSON.stringify(res, null, 2));
}
test();
