import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Safe validation for URL formatting to prevent boot crashes
const isValidUrl = (url: string): boolean => {
  if (!url || url.includes('your_supabase_project_url')) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-project.supabase.co';
const finalKey = supabaseAnonKey && !supabaseAnonKey.includes('your_supabase_anon_key') 
  ? supabaseAnonKey 
  : 'placeholder-anon-key';

if (!isValidUrl(supabaseUrl)) {
  console.warn(
    'Supabase environment variables are missing or invalid. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

export const supabase = createClient(finalUrl, finalKey);
