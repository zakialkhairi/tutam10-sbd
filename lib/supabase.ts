import { createClient } from '@supabase/supabase-js';

const sanitize = (val: string | undefined) => {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
};

const supabaseUrl = sanitize(process.env.NEXT_PUBLIC_SUPABASE_URL)
  .replace(/\/$/, '')
  .replace(/\/rest\/v1$/, '');
const supabaseAnonKey = sanitize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing or invalid! URL:',
    supabaseUrl ? 'SET' : 'MISSING',
    'KEY:',
    supabaseAnonKey ? 'SET' : 'MISSING'
  );
}

console.log('Initializing Supabase with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);