import { supabase } from '../lib/supabase';

/**
 * Simple diagnostic tool to check basic connectivity and configuration
 */
export async function runBasicDiagnostics() {
  console.log('=== Running Basic Diagnostics ===');
  
  const results = {
    environment: { success: false, message: '', details: {} },
    supabaseConnection: { success: false, message: '', details: {} },
    authService: { success: false, message: '', details: {} },
    databaseAccess: { success: false, message: '', details: {} }
  };

  // 1. Check environment variables
  try {
    console.log('Step 1: Checking environment variables...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      results.environment = {
        success: false,
        message: 'Missing environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          urlPreview: supabaseUrl ? supabaseUrl.substring(0, 20) + '...' : 'MISSING',
          keyPreview: supabaseAnonKey ? 'Present' : 'MISSING'
        }
      };
    } else {
      results.environment = {
        success: true,
        message: 'Environment variables found',
        details: {
          urlPreview: supabaseUrl.substring(0, 30) + '...',
          keyPreview: 'Present (length: ' + supabaseAnonKey.length + ')'
        }
      };
    }
  } catch (error) {
    results.environment = {
      success: false,
      message: 'Error checking environment: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: { error }
    };
  }

  // 2. Test basic Supabase connection
  try {
    console.log('Step 2: Testing Supabase connection...');
    const startTime = Date.now();
    
    // Simple connection test with timeout
    const connectionTest = await Promise.race([
      supabase.from('profiles').select('count').limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000)
      )
    ]) as any;
    
    const duration = Date.now() - startTime;
    
    if (connectionTest.error) {
      results.supabaseConnection = {
        success: false,
        message: 'Connection failed: ' + connectionTest.error.message,
        details: {
          errorCode: connectionTest.error.code,
          duration: duration + 'ms',
          error: connectionTest.error
        }
      };
    } else {
      results.supabaseConnection = {
        success: true,
        message: 'Connection successful',
        details: {
          duration: duration + 'ms',
          data: connectionTest.data
        }
      };
    }
  } catch (error) {
    results.supabaseConnection = {
      success: false,
      message: 'Connection test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: { error }
    };
  }

  // 3. Test auth service
  try {
    console.log('Step 3: Testing auth service...');
    const startTime = Date.now();
    
    // Test getting current session (should not hang)
    const sessionTest = await Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout after 5 seconds')), 5000)
      )
    ]) as any;
    
    const duration = Date.now() - startTime;
    
    if (sessionTest.error) {
      results.authService = {
        success: false,
        message: 'Auth service error: ' + sessionTest.error.message,
        details: {
          duration: duration + 'ms',
          error: sessionTest.error
        }
      };
    } else {
      results.authService = {
        success: true,
        message: 'Auth service accessible',
        details: {
          duration: duration + 'ms',
          hasSession: !!sessionTest.data.session,
          sessionUser: sessionTest.data.session?.user?.id || 'None'
        }
      };
    }
  } catch (error) {
    results.authService = {
      success: false,
      message: 'Auth service test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: { error }
    };
  }

  // 4. Test database access
  try {
    console.log('Step 4: Testing database access...');
    const startTime = Date.now();
    
    // Test reading from profiles table
    const dbTest = await Promise.race([
      supabase.from('profiles').select('id, email').limit(1),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout after 8 seconds')), 8000)
      )
    ]) as any;
    
    const duration = Date.now() - startTime;
    
    if (dbTest.error) {
      results.databaseAccess = {
        success: false,
        message: 'Database access failed: ' + dbTest.error.message,
        details: {
          errorCode: dbTest.error.code,
          duration: duration + 'ms',
          error: dbTest.error
        }
      };
    } else {
      results.databaseAccess = {
        success: true,
        message: 'Database access successful',
        details: {
          duration: duration + 'ms',
          recordCount: dbTest.data?.length || 0
        }
      };
    }
  } catch (error) {
    results.databaseAccess = {
      success: false,
      message: 'Database test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: { error }
    };
  }

  console.log('=== Diagnostic Results ===');
  console.log('Environment:', results.environment);
  console.log('Supabase Connection:', results.supabaseConnection);
  console.log('Auth Service:', results.authService);
  console.log('Database Access:', results.databaseAccess);

  return results;
}

/**
 * Quick test to see if we can perform a basic auth operation
 */
export async function quickAuthTest(email: string, password: string) {
  console.log('=== Quick Auth Test ===');
  console.log('Testing with email:', email);
  
  try {
    // First, sign out any existing session
    console.log('Step 1: Signing out existing session...');
    await supabase.auth.signOut();
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to sign in
    console.log('Step 2: Attempting sign in...');
    const startTime = Date.now();
    
    const { data, error } = await Promise.race([
      supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth operation timeout')), 10000)
      )
    ]) as any;
    
    const duration = Date.now() - startTime;
    
    console.log('Step 3: Auth operation completed in', duration + 'ms');
    
    if (error) {
      console.log('Auth error:', error);
      return {
        success: false,
        message: error.message,
        details: {
          duration: duration + 'ms',
          errorCode: error.name || error.code,
          error
        }
      };
    }
    
    if (data.user) {
      console.log('Auth successful, user ID:', data.user.id);
      
      // Sign out again to clean up
      await supabase.auth.signOut();
      
      return {
        success: true,
        message: 'Authentication successful',
        details: {
          duration: duration + 'ms',
          userId: data.user.id,
          userEmail: data.user.email,
          hasSession: !!data.session
        }
      };
    }
    
    return {
      success: false,
      message: 'No user returned from auth',
      details: {
        duration: duration + 'ms',
        data
      }
    };
    
  } catch (error) {
    console.error('Quick auth test failed:', error);
    return {
      success: false,
      message: 'Auth test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: { error }
    };
  }
}

export default { runBasicDiagnostics, quickAuthTest };
