import { supabase } from '../lib/supabase';

/**
 * Keep the Supabase connection alive by making a lightweight query
 * This prevents the free-tier project from being paused due to inactivity
 */
export const keepSupabaseAlive = async () => {
  try {
    // Make a simple query to keep the connection active
    await supabase.from('profiles').select('id').limit(1);
    console.log('Supabase keep-alive ping successful');
  } catch (error) {
    console.error('Supabase keep-alive ping failed:', error);
  }
};

/**
 * Start the keep-alive interval
 * Pings the database every 5 minutes to prevent inactivity
 */
export const startKeepAlive = () => {
  // Ping immediately on start
  keepSupabaseAlive();

  // Then ping every 5 minutes (300000ms)
  const intervalId = setInterval(keepSupabaseAlive, 5 * 60 * 1000);

  // Return the interval ID in case we need to clear it later
  return intervalId;
};
