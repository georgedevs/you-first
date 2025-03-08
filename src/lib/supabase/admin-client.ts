import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''; // Add this to your .env.local

// This client has admin privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);