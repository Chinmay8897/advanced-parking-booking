/**
 * Network connectivity tests for Supabase
 */

export async function testSupabaseConnectivity() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('=== Network Connectivity Test ===');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      error: 'Missing environment variables',
      details: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      }
    };
  }

  try {
    // Test 1: Basic URL accessibility
    console.log('Test 1: Testing basic URL accessibility...');
    const basicResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    console.log('Basic URL test status:', basicResponse.status);
    const basicText = await basicResponse.text();
    console.log('Basic URL response:', basicText);

    // Test 2: Test with API key
    console.log('Test 2: Testing with API key...');
    const authResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    console.log('Auth test status:', authResponse.status);
    const authText = await authResponse.text();
    console.log('Auth response:', authText);

    // Test 3: Test auth endpoint specifically
    console.log('Test 3: Testing auth endpoint...');
    const authEndpointResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      signal: AbortSignal.timeout(10000)
    });
    
    console.log('Auth endpoint status:', authEndpointResponse.status);
    const authEndpointText = await authEndpointResponse.text();
    console.log('Auth endpoint response:', authEndpointText);

    return {
      success: true,
      tests: {
        basicUrl: {
          status: basicResponse.status,
          response: basicText
        },
        withApiKey: {
          status: authResponse.status,
          response: authText
        },
        authEndpoint: {
          status: authEndpointResponse.status,
          response: authEndpointText
        }
      }
    };

  } catch (error: any) {
    console.error('Network test failed:', error);
    return {
      success: false,
      error: error.message,
      errorType: error.name,
      details: {
        isTimeoutError: error.name === 'TimeoutError',
        isNetworkError: error.name === 'TypeError' && error.message.includes('fetch'),
        isCorsError: error.message.includes('CORS')
      }
    };
  }
}

export async function testSupabaseClientDirectly() {
  console.log('=== Direct Supabase Client Test ===');
  
  try {
    // Import Supabase client
    console.log('Step 1: Importing Supabase client...');
    const { createClient } = await import('@supabase/supabase-js');
    console.log('✅ Supabase client imported successfully');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing environment variables');
    }

    console.log('Step 2: Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // Don't persist for testing
      }
    });
    console.log('✅ Supabase client created successfully');

    console.log('Step 3: Testing client connection with timeout...');
    
    // Create a promise that will timeout after 10 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Client query timeout after 10 seconds')), 10000);
    });
    
    // Test with a simple query that should work with any setup
    const queryPromise = supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    console.log('Step 4: Executing query with timeout protection...');
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    
    console.log('✅ Query completed');
    console.log('Direct client test result:', { data, error });
    
    return {
      success: !error,
      data,
      error: error?.message,
      errorCode: error?.code,
      step: 'query_completed'
    };

  } catch (error: any) {
    console.error('❌ Direct client test failed at step:', error.message);
    
    // Determine which step failed
    let failedStep = 'unknown';
    if (error.message.includes('import')) {
      failedStep = 'import';
    } else if (error.message.includes('createClient')) {
      failedStep = 'client_creation';
    } else if (error.message.includes('timeout')) {
      failedStep = 'query_timeout';
    } else if (error.message.includes('Missing environment')) {
      failedStep = 'environment';
    } else {
      failedStep = 'query_execution';
    }
    
    return {
      success: false,
      error: error.message,
      errorType: error.name,
      failedStep,
      step: failedStep
    };
  }
}

export default { testSupabaseConnectivity, testSupabaseClientDirectly };
