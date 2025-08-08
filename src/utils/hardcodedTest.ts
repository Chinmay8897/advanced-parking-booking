/**
 * Test with hardcoded values to bypass environment variable issues
 */

export async function testWithHardcodedValues() {
  console.log('=== Hardcoded Values Test ===');
  
  // TEMPORARILY hardcode your values here for testing
  // Using your actual Supabase values from the debug output:
  const HARDCODED_URL = 'https://rfluefoqeyefirokspj.supabase.co';
  const HARDCODED_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'fallback-key';
  
  console.log('Using hardcoded values for testing...');
  console.log('URL:', HARDCODED_URL);
  console.log('Key length:', HARDCODED_KEY.length);
  
  if (HARDCODED_KEY === 'fallback-key' || !HARDCODED_KEY) {
    return {
      success: false,
      error: 'Environment variable VITE_SUPABASE_ANON_KEY not found'
    };
  }
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    console.log('Creating client with hardcoded values...');
    const supabase = createClient(HARDCODED_URL, HARDCODED_KEY);
    
    console.log('Testing simple query...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    console.log('Hardcoded test result:', { data, error });
    
    return {
      success: !error,
      data,
      error: error?.message,
      message: 'Test completed with hardcoded values'
    };

  } catch (error: any) {
    console.error('Hardcoded test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default testWithHardcodedValues;
