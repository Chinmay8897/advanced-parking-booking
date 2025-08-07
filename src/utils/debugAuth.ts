import { supabase } from '../lib/supabase';

// Debug utility to help identify authentication issues
export const debugAuthIssues = async () => {
  const results = {
    environmentCheck: false,
    connectionCheck: false,
    authConfigCheck: false,
    profileTableCheck: false,
    issues: [] as string[],
    recommendations: [] as string[]
  };

  try {
    // 1. Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      results.issues.push('Missing Supabase environment variables');
      results.recommendations.push('Check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    } else {
      results.environmentCheck = true;
      console.log('✓ Environment variables are set');
    }

    // 2. Test basic connection
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) {
        results.issues.push(`Database connection failed: ${error.message}`);
        results.recommendations.push('Check your Supabase project URL and ensure the database is accessible');
      } else {
        results.connectionCheck = true;
        console.log('✓ Database connection successful');
      }
    } catch (err: any) {
      results.issues.push(`Database connection exception: ${err.message}`);
    }

    // 3. Check auth configuration
    try {
      const { data: { session } } = await supabase.auth.getSession();
      results.authConfigCheck = true;
      console.log('✓ Auth configuration working, current session:', !!session);
    } catch (err: any) {
      results.issues.push(`Auth configuration error: ${err.message}`);
      results.recommendations.push('Check Supabase auth settings and RLS policies');
    }

    // 4. Check profiles table structure
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" which is OK
        results.issues.push(`Profiles table access error: ${error.message}`);
        results.recommendations.push('Check if profiles table exists and has correct RLS policies');
      } else {
        results.profileTableCheck = true;
        console.log('✓ Profiles table accessible');
      }
    } catch (err: any) {
      results.issues.push(`Profiles table exception: ${err.message}`);
    }

    // 5. Additional recommendations based on common issues
    if (results.issues.length === 0) {
      results.recommendations.push('All basic checks passed. The issue might be:');
      results.recommendations.push('- Email confirmation required but not completed');
      results.recommendations.push('- User profile not created during registration');
      results.recommendations.push('- RLS policies preventing profile access');
      results.recommendations.push('- Case sensitivity in email addresses');
    }

  } catch (error: any) {
    results.issues.push(`Debug check failed: ${error.message}`);
  }

  return results;
};

// Test a specific user's login flow
export const testUserLogin = async (email: string, password: string) => {
  const testResults = {
    step1_validation: false,
    step2_auth_attempt: false,
    step3_session_created: false,
    step4_user_confirmed: false,
    step5_profile_exists: false,
    error: null as any,
    details: {} as any
  };

  try {
    // Step 1: Validate inputs
    if (!email || !password) {
      testResults.error = 'Email or password is empty';
      return testResults;
    }
    testResults.step1_validation = true;

    // Step 2: Attempt authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    testResults.details.authData = data;
    testResults.details.authError = error;

    if (error) {
      testResults.error = error;
      return testResults;
    }
    testResults.step2_auth_attempt = true;

    // Step 3: Check session
    if (data.session) {
      testResults.step3_session_created = true;
      testResults.details.sessionId = data.session.access_token.substring(0, 10) + '...';
    }

    // Step 4: Check user confirmation
    if (data.user?.email_confirmed_at) {
      testResults.step4_user_confirmed = true;
      testResults.details.confirmedAt = data.user.email_confirmed_at;
    } else {
      testResults.error = 'User email not confirmed';
      testResults.details.userMetadata = data.user?.user_metadata;
    }

    // Step 5: Check profile exists
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      testResults.details.profileData = profile;
      testResults.details.profileError = profileError;

      if (!profileError && profile) {
        testResults.step5_profile_exists = true;
      }
    }

  } catch (error: any) {
    testResults.error = error;
  }

  return testResults;
};

// Check if email confirmation is required
export const checkEmailConfirmationSettings = async () => {
  try {
    // This is a simple test - try to sign up with a test email
    // and see what happens
    const testEmail = `test-${Date.now()}@example.com`;
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
    });

    return {
      requiresConfirmation: !data.user?.email_confirmed_at,
      userCreated: !!data.user,
      sessionCreated: !!data.session,
      error: error?.message,
      details: {
        userId: data.user?.id,
        emailConfirmedAt: data.user?.email_confirmed_at,
        confirmationSentAt: data.user?.confirmation_sent_at
      }
    };
  } catch (error: any) {
    return {
      error: error.message,
      requiresConfirmation: null,
      userCreated: false,
      sessionCreated: false
    };
  }
};