/**
 * Debug utility to check if environment variables are properly loaded
 */
export function debugEnvironmentVariables() {
  console.log('=== Environment Variables Debug ===');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Raw environment check:');
  console.log('VITE_SUPABASE_URL exists:', !!supabaseUrl);
  console.log('VITE_SUPABASE_URL value:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'UNDEFINED');
  console.log('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
  console.log('VITE_SUPABASE_ANON_KEY length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
  console.log('VITE_SUPABASE_ANON_KEY starts with eyJ:', supabaseAnonKey ? supabaseAnonKey.startsWith('eyJ') : false);
  
  // Check all environment variables
  console.log('All VITE_ environment variables:');
  Object.keys(import.meta.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      console.log(`${key}:`, import.meta.env[key] ? 'SET' : 'NOT SET');
    }
  });
  
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPreview: supabaseUrl ? supabaseUrl.substring(0, 50) : 'MISSING',
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
    keyStartsCorrect: supabaseAnonKey ? supabaseAnonKey.startsWith('eyJ') : false
  };
}

export default debugEnvironmentVariables;
