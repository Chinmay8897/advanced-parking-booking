/**
 * Simple Supabase client test without database queries
 */

export async function testClientCreationOnly() {
  console.log('=== Simple Client Creation Test ===');
  
  try {
    console.log('Step 1: Getting environment variables...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('URL exists:', !!supabaseUrl);
    console.log('Key exists:', !!supabaseAnonKey);
    console.log('URL preview:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING');
    console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing environment variables');
    }

    console.log('Step 2: Importing Supabase...');
    const { createClient } = await import('@supabase/supabase-js');
    console.log('✅ Import successful');

    console.log('Step 3: Creating client...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✅ Client created successfully');

    console.log('Step 4: Testing client properties...');
    console.log('Client has auth:', !!supabase.auth);
    console.log('Client has from method:', typeof supabase.from === 'function');
    console.log('✅ Client properties verified');

    return {
      success: true,
      message: 'Client creation successful',
      details: {
        hasAuth: !!supabase.auth,
        hasFrom: typeof supabase.from === 'function',
        urlValid: supabaseUrl.includes('supabase.co'),
        keyValid: supabaseAnonKey.startsWith('eyJ')
      }
    };

  } catch (error: any) {
    console.error('❌ Simple client test failed:', error);
    return {
      success: false,
      error: error.message,
      errorType: error.name
    };
  }
}

export async function testAuthServiceOnly() {
  console.log('=== Auth Service Only Test ===');
  
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing environment variables');
    }

    console.log('Testing auth endpoint directly...');
    
    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth service timeout after 8 seconds')), 8000);
    });
    
    // Test auth service endpoint
    const authTestPromise = fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const response = await Promise.race([authTestPromise, timeoutPromise]) as Response;
    const responseText = await response.text();
    
    console.log('Auth service response status:', response.status);
    console.log('Auth service response:', responseText);
    
    return {
      success: response.status < 500, // Accept 4xx as "working" (auth issues vs service issues)
      status: response.status,
      response: responseText,
      message: response.status < 500 ? 'Auth service accessible' : 'Auth service error'
    };

  } catch (error: any) {
    console.error('❌ Auth service test failed:', error);
    return {
      success: false,
      error: error.message,
      isTimeout: error.message.includes('timeout')
    };
  }
}

export default { testClientCreationOnly, testAuthServiceOnly };
