import { supabase } from '../lib/supabase';

export interface LoginDiagnosticResult {
  step: string;
  success: boolean;
  error?: string;
  details?: any;
}

export async function runLoginDiagnostic(email: string, password: string): Promise<LoginDiagnosticResult[]> {
  const results: LoginDiagnosticResult[] = [];

  // Step 1: Check environment variables
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      results.push({
        step: 'Environment Variables Check',
        success: false,
        error: 'Missing Supabase environment variables',
        details: { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey }
      });
      return results;
    }
    
    results.push({
      step: 'Environment Variables Check',
      success: true,
      details: { supabaseUrl: supabaseUrl.substring(0, 20) + '...', hasAnonKey: true }
    });
  } catch (error) {
    results.push({
      step: 'Environment Variables Check',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return results;
  }

  // Step 2: Test Supabase connection
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      results.push({
        step: 'Supabase Connection Test',
        success: false,
        error: error.message,
        details: error
      });
    } else {
      results.push({
        step: 'Supabase Connection Test',
        success: true,
        details: 'Successfully connected to Supabase'
      });
    }
  } catch (error) {
    results.push({
      step: 'Supabase Connection Test',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Step 3: Validate input
  if (!email || !password) {
    results.push({
      step: 'Input Validation',
      success: false,
      error: 'Email and password are required',
      details: { email: !!email, password: !!password }
    });
    return results;
  }

  results.push({
    step: 'Input Validation',
    success: true,
    details: { email: email, passwordLength: password.length }
  });

  // Step 4: Attempt login
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (authError) {
      results.push({
        step: 'Authentication Attempt',
        success: false,
        error: authError.message,
        details: {
          code: authError.name,
          status: authError.status,
          authError
        }
      });
      return results;
    }

    if (!authData.user) {
      results.push({
        step: 'Authentication Attempt',
        success: false,
        error: 'No user returned from authentication',
        details: authData
      });
      return results;
    }

    results.push({
      step: 'Authentication Attempt',
      success: true,
      details: {
        userId: authData.user.id,
        email: authData.user.email,
        emailConfirmed: authData.user.email_confirmed_at !== null,
        lastSignIn: authData.user.last_sign_in_at
      }
    });

    // Step 5: Check email confirmation
    if (!authData.user.email_confirmed_at) {
      results.push({
        step: 'Email Confirmation Check',
        success: false,
        error: 'Email not confirmed',
        details: {
          emailConfirmedAt: authData.user.email_confirmed_at,
          confirmationSentAt: authData.user.confirmation_sent_at
        }
      });
    } else {
      results.push({
        step: 'Email Confirmation Check',
        success: true,
        details: {
          emailConfirmedAt: authData.user.email_confirmed_at
        }
      });
    }

    // Step 6: Fetch user profile
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        results.push({
          step: 'Profile Fetch',
          success: false,
          error: profileError.message,
          details: {
            code: profileError.code,
            hint: profileError.hint,
            profileError
          }
        });
      } else {
        results.push({
          step: 'Profile Fetch',
          success: true,
          details: {
            profileId: profileData.id,
            fullName: profileData.full_name,
            createdAt: profileData.created_at
          }
        });
      }
    } catch (error) {
      results.push({
        step: 'Profile Fetch',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Step 7: Test session
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        results.push({
          step: 'Session Check',
          success: false,
          error: sessionError.message,
          details: sessionError
        });
      } else {
        results.push({
          step: 'Session Check',
          success: true,
          details: {
            hasSession: !!sessionData.session,
            accessToken: sessionData.session?.access_token ? 'Present' : 'Missing',
            expiresAt: sessionData.session?.expires_at
          }
        });
      }
    } catch (error) {
      results.push({
        step: 'Session Check',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

  } catch (error) {
    results.push({
      step: 'Authentication Attempt',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return results;
}

export async function testRegisteredUserLogin(): Promise<{
  testUser: { email: string; password: string };
  results: LoginDiagnosticResult[];
}> {
  // Create a test user for diagnosis
  const testUser = {
    email: 'test.user@example.com',
    password: 'TestPassword123!'
  };

  // First, try to register the test user (if not already registered)
  try {
    const { error: registerError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
    });
    
    // Ignore "User already registered" error
    if (registerError && !registerError.message.includes('already registered')) {
      console.log('Registration error:', registerError.message);
    }
  } catch (error) {
    console.log('Registration attempt error:', error);
  }

  // Now run the diagnostic on the test user
  const results = await runLoginDiagnostic(testUser.email, testUser.password);
  
  return { testUser, results };
}