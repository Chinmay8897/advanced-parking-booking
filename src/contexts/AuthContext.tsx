import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase, getAuthFingerprint } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { clearSupabaseStorage } from '../lib/clearStorage';

// Define types
type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (name: string, email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<{ error: any }>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 0) Bust cached sessions when client config changes (URL/key/storageKey)
    try {
      const FINGERPRINT_KEY = 'pe_auth_fingerprint_v1';
      const current = getAuthFingerprint();
      const existing = typeof window !== 'undefined' ? window.localStorage.getItem(FINGERPRINT_KEY) : null;
      if (existing && existing !== current) {
        console.warn('Auth fingerprint changed. Purging old Supabase storage.');
        try { clearSupabaseStorage(); } catch {}
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(FINGERPRINT_KEY, current);
      }
    } catch {}

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Validate the stored session; if invalid, clear it to avoid cache issues
          const { data: userData, error: userErr } = await supabase.auth.getUser();
          if (userErr || !userData?.user) {
            console.warn('Invalid/expired session detected on load. Clearing stored session.');
            await supabase.auth.signOut();
            try { clearSupabaseStorage(); } catch {}
            setUser(null);
          } else {
            await fetchUserProfile(userData.user);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Error retrieving initial session:', e);
        // As a safety measure, clear potentially corrupt storage
        try { clearSupabaseStorage(); } catch {}
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes (do not block UI on profile fetch)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          // Set basic user immediately to avoid spinner hang
          const basicName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || session.user.email || '';
          setUser({ id: session.user.id, email: session.user.email!, name: basicName });
          setLoading(false);
          // Fetch full profile in background (no await)
          fetchUserProfile(session.user).catch(err => console.warn('Background profile fetch failed:', err));
        } else {
          console.log('No session, setting user to null');
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Helper function to create user profile
  const createUserProfile = async (userId: string, email: string, fullName: string) => {
    try {
      console.log('Creating profile for user:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email.toLowerCase(),
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
      if (error) {
        console.error('Error creating profile:', error);
        // Try insert as fallback
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email.toLowerCase(),
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (insertError && !insertError.message?.includes('duplicate')) {
          console.error('Error inserting profile:', insertError);
          return { error: insertError };
        }
      }
      
      console.log('Profile created successfully');
      return { error: null };
    } catch (error) {
      console.error('Exception creating profile:', error);
      return { error };
    }
  };

  const fetchUserProfile = async (user: User) => {
    if (!user) {
      console.error('fetchUserProfile called with no user');
      return { error: 'No user provided' };
    }
    
    console.log('Fetching profile for user:', user.id);
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // Try to get the user's profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.log('Profile fetch error:', error.code, error.message);
          
          // If the error is that no rows were returned or permission denied, try to create a profile
          if (error.code === 'PGRST116' || error.message?.includes('No rows') || 
              error.code === 'PGRST301' || error.message?.includes('permission denied')) {
            console.log('No profile found or permission denied, creating one...');
            
            // Create a new profile
            const { error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  email: user.email!.toLowerCase(),
                  full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
              ]);

            if (createError) {
              console.error('Error creating profile:', createError);
              
              // If duplicate key error, the profile already exists but we couldn't access it
              // This could be due to RLS policies
              if (createError.code === '23505' || createError.message?.includes('duplicate')) {
                console.log('Profile already exists, trying upsert as a fallback...');
                
                // Try upsert as a last resort
                const { error: upsertError } = await supabase
                  .from('profiles')
                  .upsert({
                    id: user.id,
                    email: user.email!.toLowerCase(),
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                    updated_at: new Date().toISOString()
                  }, { onConflict: 'id' });
                  
                if (upsertError) {
                  console.error('Error upserting profile:', upsertError);
                  retryCount++;
                  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
                  continue;
                }
                
                // Try fetching again after upsert
                const { data: upsertedProfile, error: fetchAfterUpsertError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .single();
                  
                if (fetchAfterUpsertError) {
                  console.error('Error fetching after upsert:', fetchAfterUpsertError);
                  retryCount++;
                  continue;
                }
                
                console.log('Successfully fetched profile after upsert:', upsertedProfile);
                setUser({
                  id: user.id,
                  email: user.email!,
                  name: upsertedProfile.full_name || user.email?.split('@')[0] || '',
                });
                return { error: null };
              } else {
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
                continue;
              }
            } else {
              console.log('Profile created successfully');
              // Fetch the newly created profile
              const { data: newProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

              if (fetchError) {
                console.error('Error fetching newly created profile:', fetchError);
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
                continue;
              }

              setUser({
                id: user.id,
                email: user.email!,
                name: newProfile.full_name || user.email?.split('@')[0] || '',
              });
              return { error: null };
            }
          } else {
            console.error('Error fetching profile:', error);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
            continue;
          }
        }

        // Profile found, update the user state
        console.log('Profile found:', profile);
        setUser({
          id: user.id,
          email: user.email!,
          name: profile.full_name || user.email?.split('@')[0] || user.email || '',
        });
        return { error: null };
      } catch (error) {
        console.error('Unexpected error in fetchUserProfile:', error);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retrying
      }
    }

    // If we get here, we've failed to fetch or create a profile after max retries
    console.warn(`Failed to fetch/create profile after ${maxRetries} attempts`);
    
    // As a last resort, try a direct upsert
    try {
      console.log('Attempting final upsert as last resort...');
      const { error: finalUpsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!.toLowerCase(),
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
        
      if (!finalUpsertError) {
        // Try one more fetch
        const { data: finalProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (finalProfile) {
          console.log('Final profile fetch successful:', finalProfile);
          setUser({
            id: user.id,
            email: user.email!,
            name: finalProfile.full_name || user.email?.split('@')[0] || '',
          });
          return { error: null };
        }
      }
    } catch (e) {
      console.error('Final upsert attempt failed:', e);
    }
    
    // Set basic user info without profile
    setUser({
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || user.email || '',
    });
    
    return { error: 'Failed to fetch or create profile' };
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);

      // Basic validation
      if (!email || !password) {
        return { error: { message: 'Email and password are required' } };
      }

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase();

      // Guard: if a corrupt/expired session is present, clear it before login to avoid cache issues
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: userData, error: userErr } = await supabase.auth.getUser();
          if (userErr || !userData?.user) {
            console.warn('Clearing corrupt session before login');
            await supabase.auth.signOut();
            try { clearSupabaseStorage(); } catch {}
          }
        }
      } catch (preLoginErr) {
        console.warn('Pre-login session check failed, clearing storage as precaution');
        try { clearSupabaseStorage(); } catch {}
      }

      // Attempt login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        // If login fails due to token issues, clear storage so the next attempt succeeds
        if (
          typeof error?.message === 'string' && (
            error.message.toLowerCase().includes('refresh token') ||
            error.message.toLowerCase().includes('invalid') ||
            error.message.toLowerCase().includes('session')
          )
        ) {
          try { clearSupabaseStorage(); } catch {}
        }
        return { error };
      }

      console.log('Login successful for user:', data.user?.id);

      // Fetch user profile after successful authentication
      if (data.user) {
        await fetchUserProfile(data.user);
      }

      return { error: null };
    } catch (error) {
      console.error('Login exception:', error);
      return { error: { message: 'Login failed. Please try again.' } };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Starting registration for:', email);
      
      // Normalize inputs
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = name.trim();
      
      if (!normalizedEmail || !password || !normalizedName) {
        console.error('Registration error: Missing required fields');
        return { error: { message: 'Name, email, and password are required.' } };
      }

      // Create the user account with email confirmation disabled for immediate login
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        
        // Handle user already exists case
        if (error.message?.includes('already registered') || error.message?.includes('already been registered')) {
          console.log('User already exists, attempting to sign them in...');
          // Try to sign in the existing user
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });
          
          if (loginError) {
            return { error: { message: 'This email is already registered. Please use the correct password to log in.' } };
          }
          
          if (loginData.user) {
            await fetchUserProfile(loginData.user);
            return { error: null };
          }
        }
        
        return { error: { message: error.message || 'Registration failed. Please try again.' } };
      }

      console.log('Registration successful:', data);
      
      // Handle the case where user is created but needs email confirmation
      if (data.user && !data.session) {
        console.log('User created but needs email confirmation');
        // For development, we'll create the profile anyway
        if (data.user?.id) {
          await createUserProfile(data.user.id, normalizedEmail, normalizedName);
        }
        return { error: { message: 'Registration successful! Please check your email to confirm your account before logging in.' } };
      }
      
      // Handle successful registration with immediate session
      if (data.user && data.session) {
        console.log('User created and logged in:', data.user.id);
        
        // Create profile for the new user
        await createUserProfile(data.user.id, normalizedEmail, normalizedName);
        
        // Fetch the user profile to set the user state
        await fetchUserProfile(data.user);
        
        return { error: null };
      }
      
      return { error: { message: 'Registration completed but login failed. Please try logging in manually.' } };


    } catch (error) {
      console.error('Registration error:', error);
      return { error: { message: 'Registration failed. Please try again later.' } };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      // Proactively clear Supabase auth storage to avoid stale tokens across refreshes
      try { clearSupabaseStorage(); } catch {}
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};