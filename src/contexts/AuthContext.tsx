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

  const fetchUserProfile = async (supabaseUser: User) => {
    try {
      console.log('Fetching profile for user:', supabaseUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, still set the user with basic info
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email!,
        });
        return;
      }

      console.log('Profile fetched successfully:', profile);
      
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: profile?.full_name || undefined,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { error };
      }

      console.log('Login successful for user:', data.user?.id);

      if (data.user) {
        await fetchUserProfile(data.user);
      }

      return { error: null };
    } catch (error) {
      console.error('Login exception:', error);
      return { error };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Starting registration for:', email);
      
      // Create the user account with auto-confirm
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      console.log('User created successfully:', data.user?.id);

      if (data.user) {
        try {
          // Wait for the user to be fully committed to the database
          console.log('Waiting for user to be committed...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Create profile record manually
          console.log('Creating profile...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                email: data.user.email!,
                full_name: name,
              },
            ]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't fail the registration if profile creation fails
            // The user account was created successfully
          } else {
            console.log('Profile created successfully');
          }

          // The user should already be logged in after signUp
          console.log('Fetching user profile...');
          await fetchUserProfile(data.user);
        } catch (profileError) {
          console.error('Profile creation failed:', profileError);
          // User was created but profile failed - still consider it a success
          await fetchUserProfile(data.user);
        }
      }

      console.log('Registration completed successfully');
      return { error: null };
    } catch (error) {
      console.error('Registration error:', error);
      return { error };
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