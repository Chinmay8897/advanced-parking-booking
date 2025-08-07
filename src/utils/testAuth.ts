import { supabase } from '../lib/supabase';

// This function tests the Supabase connection and authentication
export const testSupabaseConnection = async () => {
  try {
    // Check if environment variables are loaded
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('Environment variables check:');
    console.log('VITE_SUPABASE_URL exists:', !!supabaseUrl);
    console.log('VITE_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey);
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        message: 'Missing Supabase environment variables',
        details: { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey }
      };
    }
    
    // Test a simple query to verify connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        error
      };
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase',
      data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Exception when testing Supabase connection',
      error
    };
  }
};

// This function tests the authentication with demo credentials
export const testDemoAuth = async () => {
  try {
    const email = 'demo@example.com';
    const password = 'password123';
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      return {
        success: false,
        message: 'Failed to authenticate with demo credentials',
        error
      };
    }
    
    return {
      success: true,
      message: 'Successfully authenticated with demo credentials',
      user: data.user
    };
  } catch (error) {
    return {
      success: false,
      message: 'Exception when testing demo authentication',
      error
    };
  }
};