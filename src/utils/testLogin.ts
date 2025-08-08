import { supabase } from '../lib/supabase';

/**
 * Simple test utility to verify login functionality for existing users
 */
export async function testExistingUserLogin(email: string, password: string) {
  console.log('Testing login for existing user:', email);
  
  try {
    // Attempt to sign in with provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error('Login test failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    if (data.user && data.session) {
      console.log('Login test successful!');
      console.log('User ID:', data.user.id);
      console.log('User email:', data.user.email);
      console.log('Session valid:', !!data.session);
      
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.warn('Profile not found, but login successful:', profileError);
      } else {
        console.log('User profile found:', profile);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        profile: profile || null
      };
    }

    return {
      success: false,
      error: 'No user or session returned'
    };

  } catch (error) {
    console.error('Login test exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if user can access protected routes (parking booking)
 */
export async function testParkingAccess() {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        success: false,
        error: 'No active session - user needs to log in first'
      };
    }

    // Test access to parking slots (basic read operation)
    const { data, error } = await supabase
      .from('parking_slots')
      .select('id, name, location')
      .limit(1);

    if (error) {
      console.error('Parking access test failed:', error);
      return {
        success: false,
        error: 'Cannot access parking data: ' + error.message
      };
    }

    console.log('Parking access test successful');
    return {
      success: true,
      message: 'User can access parking booking features',
      sampleData: data
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default { testExistingUserLogin, testParkingAccess };
