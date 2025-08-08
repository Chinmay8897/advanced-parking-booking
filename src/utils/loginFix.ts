import { supabase } from '../lib/supabase';

export interface LoginFixResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Comprehensive login fix utility to address common login issues
 */
export class LoginFix {
  
  /**
   * Check if environment variables are properly configured
   */
  static checkEnvironment(): LoginFixResult {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return {
        success: false,
        message: 'Missing Supabase environment variables. Please check your .env file.',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
          solution: 'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
        }
      };
    }
    
    return {
      success: true,
      message: 'Environment variables are properly configured',
      details: { supabaseUrl: supabaseUrl.substring(0, 20) + '...' }
    };
  }
  
  /**
   * Test Supabase connection
   */
  static async testConnection(): Promise<LoginFixResult> {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        return {
          success: false,
          message: 'Failed to connect to Supabase database',
          details: {
            error: error.message,
            code: error.code,
            solution: 'Check your Supabase URL and API key, and ensure the profiles table exists'
          }
        };
      }
      
      return {
        success: true,
        message: 'Successfully connected to Supabase',
        details: data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Connection test failed with exception',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Check your network connection and Supabase configuration'
        }
      };
    }
  }
  
  /**
   * Validate email format
   */
  static validateEmail(email: string): LoginFixResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !email.trim()) {
      return {
        success: false,
        message: 'Email is required',
        details: { solution: 'Please enter your email address' }
      };
    }
    
    if (!emailRegex.test(email.trim())) {
      return {
        success: false,
        message: 'Invalid email format',
        details: { 
          email: email.trim(),
          solution: 'Please enter a valid email address (e.g., user@example.com)'
        }
      };
    }
    
    return {
      success: true,
      message: 'Email format is valid',
      details: { normalizedEmail: email.trim().toLowerCase() }
    };
  }
  
  /**
   * Validate password
   */
  static validatePassword(password: string): LoginFixResult {
    if (!password) {
      return {
        success: false,
        message: 'Password is required',
        details: { solution: 'Please enter your password' }
      };
    }
    
    if (password.length < 6) {
      return {
        success: false,
        message: 'Password is too short',
        details: { 
          length: password.length,
          solution: 'Password must be at least 6 characters long'
        }
      };
    }
    
    return {
      success: true,
      message: 'Password format is valid',
      details: { length: password.length }
    };
  }
  
  /**
   * Check if user exists in the system
   */
  static async checkUserExists(email: string): Promise<LoginFixResult> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      // Check profiles table (most reliable method)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', normalizedEmail)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        return {
          success: false,
          message: 'Unable to verify user existence',
          details: {
            error: profileError.message,
            solution: 'Database connection issue or user does not exist'
          }
        };
      }
      
      if (profileData) {
        return {
          success: true,
          message: 'User found in profiles table',
          details: { email: normalizedEmail }
        };
      }
      
      return {
        success: false,
        message: 'User not found',
        details: {
          email: normalizedEmail,
          solution: 'Please register a new account or check your email address'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error checking user existence',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Please try again or contact support'
        }
      };
    }
  }
  
  /**
   * Attempt to fix common login issues
   */
  static async attemptLoginFix(email: string, password: string): Promise<LoginFixResult> {
    // Step 1: Check environment
    const envCheck = this.checkEnvironment();
    if (!envCheck.success) {
      return envCheck;
    }
    
    // Step 2: Test connection
    const connectionCheck = await this.testConnection();
    if (!connectionCheck.success) {
      return connectionCheck;
    }
    
    // Step 3: Validate inputs
    const emailCheck = this.validateEmail(email);
    if (!emailCheck.success) {
      return emailCheck;
    }
    
    const passwordCheck = this.validatePassword(password);
    if (!passwordCheck.success) {
      return passwordCheck;
    }
    
    // Step 4: Check if user exists
    const userCheck = await this.checkUserExists(email);
    if (!userCheck.success) {
      return userCheck;
    }
    
    return {
      success: true,
      message: 'All login prerequisites are satisfied',
      details: {
        environment: 'OK',
        connection: 'OK',
        email: 'Valid',
        password: 'Valid',
        userExists: 'Yes',
        nextStep: 'Try logging in again'
      }
    };
  }
  
  /**
   * Get helpful error message based on Supabase error
   */
  static getHelpfulErrorMessage(error: any): string {
    if (!error) return 'Unknown error occurred';
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('invalid login credentials') || message.includes('invalid_credentials')) {
      return 'Invalid email or password. Please double-check your credentials and try again.';
    }
    
    if (message.includes('email not confirmed') || message.includes('email_not_confirmed')) {
      return 'Please check your email and click the confirmation link. If you didn\'t receive it, try registering again.';
    }
    
    if (message.includes('too many requests') || message.includes('rate_limit')) {
      return 'Too many login attempts. Please wait a few minutes and try again.';
    }
    
    if (message.includes('user not found') || message.includes('user_not_found')) {
      return 'No account found with this email. Please check your email or create a new account.';
    }
    
    if (message.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    
    if (message.includes('signup_disabled')) {
      return 'New account registration is currently disabled. Please contact support.';
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }
    
    if (message.includes('configuration') || message.includes('environment')) {
      return 'Authentication service configuration error. Please contact support.';
    }
    
    return error.message || 'An unexpected error occurred. Please try again.';
  }
}

export default LoginFix;
