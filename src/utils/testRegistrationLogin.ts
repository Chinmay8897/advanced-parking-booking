import { supabase } from '../lib/supabase';

/**
 * Comprehensive test to verify registration and login flow
 */
export async function testRegistrationLoginFlow(testEmail: string, testPassword: string, testName: string) {
  console.log('=== Starting Registration-Login Flow Test ===');
  
  const results = {
    cleanup: { success: false, message: '' },
    registration: { success: false, message: '', details: null },
    profileCheck: { success: false, message: '', details: null },
    login: { success: false, message: '', details: null },
    finalCheck: { success: false, message: '', details: null }
  };

  try {
    // Step 1: Cleanup - Remove any existing user with this email
    console.log('Step 1: Cleaning up existing test data...');
    try {
      // First try to sign in to see if user exists
      const { data: existingLogin } = await supabase.auth.signInWithPassword({
        email: testEmail.toLowerCase(),
        password: testPassword,
      });
      
      if (existingLogin.user) {
        console.log('Found existing user, signing out...');
        await supabase.auth.signOut();
      }
      
      results.cleanup = { success: true, message: 'Cleanup completed' };
    } catch (error) {
      results.cleanup = { success: true, message: 'No existing user found (which is good)' };
    }

    // Step 2: Test Registration
    console.log('Step 2: Testing registration...');
    const { data: regData, error: regError } = await supabase.auth.signUp({
      email: testEmail.toLowerCase(),
      password: testPassword,
      options: {
        data: {
          full_name: testName,
        },
      },
    });

    if (regError) {
      results.registration = { 
        success: false, 
        message: `Registration failed: ${regError.message}`,
        details: regError 
      };
    } else if (regData.user) {
      results.registration = { 
        success: true, 
        message: `Registration successful. User ID: ${regData.user.id}`,
        details: { 
          userId: regData.user.id, 
          email: regData.user.email,
          hasSession: !!regData.session,
          emailConfirmed: !!regData.user.email_confirmed_at
        }
      };

      // Step 3: Check if profile was created
      console.log('Step 3: Checking if profile was created...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', regData.user.id)
        .single();

      if (profileError) {
        results.profileCheck = {
          success: false,
          message: `Profile not found: ${profileError.message}`,
          details: profileError
        };
        
        // Try to create profile manually
        console.log('Attempting to create profile manually...');
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: regData.user.id,
            email: testEmail.toLowerCase(),
            full_name: testName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (createError) {
          results.profileCheck.message += ` | Manual creation also failed: ${createError.message}`;
        } else {
          results.profileCheck = {
            success: true,
            message: 'Profile created manually after registration',
            details: { manuallyCreated: true }
          };
        }
      } else {
        results.profileCheck = {
          success: true,
          message: 'Profile found successfully',
          details: profileData
        };
      }
    }

    // Step 4: Test Login (sign out first if we have a session)
    console.log('Step 4: Testing login...');
    await supabase.auth.signOut();
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for signout
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail.toLowerCase(),
      password: testPassword,
    });

    if (loginError) {
      results.login = {
        success: false,
        message: `Login failed: ${loginError.message}`,
        details: loginError
      };
    } else if (loginData.user && loginData.session) {
      results.login = {
        success: true,
        message: 'Login successful',
        details: {
          userId: loginData.user.id,
          email: loginData.user.email,
          hasSession: !!loginData.session,
          sessionValid: loginData.session.expires_at ? new Date(loginData.session.expires_at * 1000) > new Date() : false
        }
      };

      // Step 5: Final check - can we access user data?
      console.log('Step 5: Final check - accessing user profile...');
      const { data: finalProfileData, error: finalProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();

      if (finalProfileError) {
        results.finalCheck = {
          success: false,
          message: `Cannot access profile after login: ${finalProfileError.message}`,
          details: finalProfileError
        };
      } else {
        results.finalCheck = {
          success: true,
          message: 'Successfully accessed user profile after login',
          details: finalProfileData
        };
      }
    } else {
      results.login = {
        success: false,
        message: 'Login returned no user or session',
        details: { user: !!loginData.user, session: !!loginData.session }
      };
    }

  } catch (error) {
    console.error('Test flow error:', error);
    return {
      ...results,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Cleanup - sign out
  await supabase.auth.signOut();

  console.log('=== Test Results ===');
  console.log('Cleanup:', results.cleanup);
  console.log('Registration:', results.registration);
  console.log('Profile Check:', results.profileCheck);
  console.log('Login:', results.login);
  console.log('Final Check:', results.finalCheck);

  return results;
}

/**
 * Quick test to verify if a user can login with existing credentials
 */
export async function quickLoginTest(email: string, password: string) {
  console.log('=== Quick Login Test ===');
  
  try {
    // Sign out first
    await supabase.auth.signOut();
    
    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      return {
        success: false,
        message: `Login failed: ${error.message}`,
        error: error
      };
    }

    if (data.user && data.session) {
      // Check profile access
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      return {
        success: true,
        message: 'Login successful',
        details: {
          user: {
            id: data.user.id,
            email: data.user.email,
            emailConfirmed: !!data.user.email_confirmed_at
          },
          session: {
            valid: !!data.session,
            expiresAt: data.session.expires_at
          },
          profile: {
            found: !profileError,
            data: profile,
            error: profileError?.message
          }
        }
      };
    }

    return {
      success: false,
      message: 'Login returned no user or session'
    };

  } catch (error) {
    return {
      success: false,
      message: `Login test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error
    };
  } finally {
    // Cleanup
    await supabase.auth.signOut();
  }
}

export default { testRegistrationLoginFlow, quickLoginTest };
