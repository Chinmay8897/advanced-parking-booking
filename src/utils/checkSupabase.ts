import { supabase } from '../lib/supabase';

// Function to check if Supabase project is accessible
export const checkSupabaseProject = async () => {
  try {
    // Get the Supabase URL from environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    // Extract project ID from the URL
    const projectId = supabaseUrl.match(/https:\/\/([^\.]+)\.supabase\.co/)?.[1];
    
    console.log('Checking Supabase project:', projectId);
    
    // Try a simple health check query
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      // Check if it's a permission error
      if (error.code === '42501') {
        return {
          success: false,
          message: 'Permission denied for schema public',
          details: 'This may indicate an issue with database permissions or RLS policies',
          error
        };
      }
      
      // Check if it's a connection error
      if (error.message?.includes('fetch failed')) {
        return {
          success: false,
          message: 'Failed to connect to Supabase project',
          details: 'The project may be paused, deleted, or the URL may be incorrect',
          error
        };
      }
      
      return {
        success: false,
        message: 'Error connecting to Supabase',
        error
      };
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase project',
      projectId,
      data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Exception when checking Supabase project',
      error
    };
  }
};