import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

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
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          console.log('No session, setting user to null');
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

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

      // Validate inputs
      if (!email || !password) {
        console.error('Login error: Email or password is empty');
        return { error: { message: 'Email and password are required' } };
      }

      // Check if Supabase environment variables are loaded
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Login error: Supabase environment variables are missing');
        return { error: { message: 'Authentication service configuration error. Please contact support.' } };
      }

      console.log('Supabase URL:', supabaseUrl.substring(0, 15) + '...');
      console.log('Supabase Key exists:', !!supabaseAnonKey);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message?.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before logging in.';
        } else if (error.message?.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        }
        
        return { error: { ...error, message: errorMessage } };
      }

      console.log('Login successful for user:', data.user?.id);
      console.log('User email confirmed:', data.user?.email_confirmed_at);
      console.log('Session exists:', !!data.session);

      if (data.user) {
        // Check if user email is confirmed
        if (!data.user.email_confirmed_at && !data.user.confirmed_at) {
          console.warn('User email not confirmed');
          return { error: { message: 'Please check your email and click the confirmation link before logging in.' } };
        }
        
        const { error: profileError } = await fetchUserProfile(data.user);
        if (profileError) {
          console.warn('Profile fetch/creation failed, attempting to create profile during login');
          
          // Try to create a profile for this user as a fallback
          try {
            const { error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                email: data.user.email!.toLowerCase(),
                full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });
              
            if (createError) {
              console.error('Error creating profile during login:', createError);
            } else {
              console.log('Profile created successfully during login');
              await fetchUserProfile(data.user);
            }
          } catch (createErr) {
            console.error('Exception creating profile during login:', createErr);
          }
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Login exception:', error);
      return { error: { message: 'An unexpected error occurred. Please try again.' } };
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
      
      // Check if Supabase environment variables are loaded
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Registration error: Supabase environment variables are missing');
        return { error: { message: 'Authentication service configuration error. Please contact support.' } };
      }

      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      
      if (existingUser?.user) {
        console.log('User already exists, attempting to log in');
        const { error: profileError } = await fetchUserProfile(existingUser.user);
        if (profileError) {
          console.warn('Profile fetch failed during login of existing user:', profileError);
        }
        return { error: null };
      }

      // Create the user account
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
        
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message?.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        }
        
        return { error: { ...error, message: errorMessage } };
      }

      // Defensive: get user from data.session if not present in data.user
      const userObj = data.user || data.session?.user;
      if (!userObj) {
        console.error('No user object returned after signUp');
        return { error: { message: 'No user object returned after signUp' } };
      }

      console.log('User created successfully:', userObj.id);
      let profileCreated = false;

      try {
        // Wait for the user to be fully committed to the database
        console.log('Waiting for user to be committed...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try upsert instead of insert to handle potential race conditions
        console.log('Creating profile with upsert...');
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userObj.id,
              email: userObj.email!.toLowerCase(),
              full_name: name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
          );
          
        console.log('Profile creation result:', { profileError });

        if (profileError) {
          // If permission error, try direct insert
          if (profileError.code === 'PGRST301' || profileError.message?.includes('permission denied')) {
            console.warn('Permission error on upsert, trying direct insert...');
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: userObj.id,
                  email: userObj.email!.toLowerCase(),
                  full_name: name,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
              ]);
              
            if (insertError) {
              // If duplicate key error, ignore (profile already exists)
              if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
                console.warn('Profile already exists, continuing.');
                // Proceed to fetch profile
                const { error: fetchError } = await fetchUserProfile(userObj);
                if (!fetchError) {
                  profileCreated = true;
                  console.log('Successfully fetched existing profile');
                }
              } else {
                // Show error and stop registration
                console.error('Error creating profile:', insertError);
                return { error: { message: 'Profile creation failed. Please contact support or try again later.' } };
              }
            } else {
              console.log('Profile created successfully via insert');
              // Only fetch profile if creation succeeded
              const { error: fetchError } = await fetchUserProfile(userObj);
              if (!fetchError) {
                profileCreated = true;
              }
            }
          } else if (profileError.code === '23505' || profileError.message?.includes('duplicate')) {
            console.warn('Profile already exists, continuing.');
            // Proceed to fetch profile
            const { error: fetchError } = await fetchUserProfile(userObj);
            if (!fetchError) {
              profileCreated = true;
              console.log('Successfully fetched existing profile');
            }
          } else {
            // Show error and stop registration
            console.error('Error creating profile:', profileError);
            return { error: { message: 'Profile creation failed. Please contact support or try again later.' } };
          }
        } else {
          console.log('Profile created successfully via upsert');
          // Only fetch profile if creation succeeded
          const { error: fetchError } = await fetchUserProfile(userObj);
          if (!fetchError) {
            profileCreated = true;
          }
        }

        // Set the user state immediately after profile creation
        setUser({
          id: userObj.id,
          email: userObj.email!,
          name: name,
        });
      } catch (profileError) {
        // Show error and stop registration
        console.error('Profile creation failed:', profileError);
        return { error: { message: 'Profile creation failed. Please contact support or try again later.' } };
      }

      // Final attempt to fetch/create profile if all previous attempts failed
      if (!profileCreated) {
        console.log('All profile creation attempts failed, trying one last fetchUserProfile...');
        await fetchUserProfile(userObj);
      }

      console.log('Registration completed successfully');
      return { error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: { message: 'Registration failed. Please try again later.' } };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
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