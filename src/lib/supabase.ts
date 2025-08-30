import { createClient } from '@supabase/supabase-js';

// Read and sanitize envs to avoid invisible whitespace issues in hosting providers
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Basic sanity checks to help surface prod misconfig quickly
if (!supabaseUrl || !supabaseAnonKey) {
  // Throw a descriptive error in development; log in production
  const msg = '[Supabase] Missing envs: ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.';
  if (import.meta.env.DEV) throw new Error(msg);
  // eslint-disable-next-line no-console
  console.error(msg, { urlPresent: !!supabaseUrl, keyPresent: !!supabaseAnonKey });
}
if (!/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(supabaseUrl)) {
  // eslint-disable-next-line no-console
  console.error('[Supabase] VITE_SUPABASE_URL looks invalid:', supabaseUrl);
}

// Use a stable, project-scoped storage key to avoid collisions with stale tokens
// across different builds/environments. This helps prevent the need to clear
// the entire browser cache after refreshes.
// Bump the storage key version to invalidate stale sessions once across all clients
let storageKey = 'pe_supabase_auth_v3';
try {
  const host = new URL(supabaseUrl).host.split('.').join('_');
  storageKey = `pe_${host}_auth_v3`;
} catch {
  // fallback to default if URL parsing fails
}

export const getAuthStorageKey = () => storageKey;
export const getAuthFingerprint = () => `${supabaseUrl}|${supabaseAnonKey}|${storageKey}`;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // set true only if using OAuth redirect flow
    storageKey,
    // Explicit storage to localStorage (browser). In SSR it will be undefined.
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          parking_slot_id: string;
          parking_slot_name: string;
          start_time: string;
          end_time: string;
          total_amount: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          parking_slot_id: string;
          parking_slot_name: string;
          start_time: string;
          end_time: string;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          parking_slot_id?: string;
          parking_slot_name?: string;
          start_time?: string;
          end_time?: string;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          created_at?: string;
          updated_at?: string;
        };
      };
      parking_slots: {
        Row: {
          id: string;
          slot_number: string;
          location: string;
          hourly_rate: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot_number: string;
          location: string;
          hourly_rate: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_number?: string;
          location?: string;
          hourly_rate?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}