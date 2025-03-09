// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables 
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "ERROR: Supabase URL or Key is missing. Make sure you have a .env.local file with the following variables:\n" +
    "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\n" +
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key"
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// Helper function to check Supabase connection
export async function checkSupabaseConnection() {
  try {
    // Try a simple query to check if connection works
    const {error } = await supabase.from('customers').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { ok: false, error };
    }
    
    return { ok: true };
  } catch (err) {
    console.error('Supabase connection exception:', err);
    return { ok: false, error: err };
  }
}