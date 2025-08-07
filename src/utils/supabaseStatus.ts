import { supabase } from '../lib/supabase';

// Function to check Supabase project status
export const checkSupabaseStatus = async () => {
  try {
    // Get the Supabase URL from environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    // Extract project ID from the URL
    const projectId = supabaseUrl.match(/https:\/\/([^\.]+)\.supabase\.co/)?.[1];
    
    console.log('Checking Supabase project status:', projectId);
    
    // Try a simple health check query
    const startTime = Date.now();
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    const responseTime = Date.now() - startTime;
    
    // Check for specific error codes
    if (error) {
      // Check if it's a permission error
      if (error.code === '42501') {
        return {
          status: 'permission_denied',
          active: true, // The project is active but has permission issues
          message: 'Permission denied for schema public',
          details: 'This may indicate an issue with database permissions or RLS policies',
          responseTime,
          error
        };
      }
      
      // Check if it's a connection error
      if (error.message?.includes('fetch failed') || 
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('network error')) {
        return {
          status: 'connection_failed',
          active: false, // The project might be paused
          message: 'Failed to connect to Supabase project',
          details: 'The project may be paused, deleted, or the URL may be incorrect',
          responseTime,
          error
        };
      }
      
      return {
        status: 'error',
        active: true, // The project is responding with errors, so it's active
        message: 'Error connecting to Supabase',
        responseTime,
        error
      };
    }
    
    return {
      status: 'active',
      active: true,
      message: 'Supabase project is active',
      projectId,
      responseTime,
      data
    };
  } catch (error) {
    return {
      status: 'exception',
      active: false,
      message: 'Exception when checking Supabase project',
      error
    };
  }
};

// Function to provide recommendations based on project status
export const getSupabaseRecommendations = (statusResult: any) => {
  const recommendations = [];
  
  if (!statusResult.active) {
    recommendations.push({
      title: 'Reactivate your Supabase project',
      description: 'Your project appears to be paused. Free tier Supabase projects are paused after 7 days of inactivity.',
      steps: [
        'Log in to your Supabase dashboard at https://app.supabase.com',
        'Find your project in the list',
        'Click on the "Resume" button to unpause it'
      ]
    });
    
    recommendations.push({
      title: 'Prevent future pausing',
      description: 'To prevent your project from being paused in the future, you can:',
      steps: [
        'Upgrade to a paid plan',
        'Set up a scheduled task to ping your database at least once every 6 days',
        'Use a service like GitHub Actions, Vercel Cron Jobs, or a simple script to make regular database calls'
      ]
    });
  }
  
  if (statusResult.status === 'permission_denied') {
    recommendations.push({
      title: 'Fix permission issues',
      description: 'Your project is active but has permission issues with the "public" schema.',
      steps: [
        'Check your Row Level Security (RLS) policies',
        'Ensure the "anon" role has appropriate permissions',
        'Run the following SQL in the Supabase SQL Editor:',
        'grant usage on schema public to postgres, anon, authenticated, service_role;',
        'alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;',
        'alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;',
        'alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;'
      ]
    });
  }
  
  return recommendations;
};