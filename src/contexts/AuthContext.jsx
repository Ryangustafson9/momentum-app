import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true

  // Initialize auth state
  useEffect(() => {
    console.log('🔄 Initializing auth state...');
    
    // Timeout fallback to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⏰ Auth loading timeout - forcing completion');
      setLoading(false);
    }, 10000); // 10 second max loading time
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setUser(null);
        } else if (session?.user) {
          console.log('✅ Found existing session');
          await fetchUserProfile(session.user.id);
        } else {
          console.log('ℹ️ No existing session found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Session initialization error:', error);
        setUser(null);
      } finally {
        clearTimeout(loadingTimeout); // Clear timeout
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        clearTimeout(loadingTimeout); // Clear timeout
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = async (userId) => {
    try {
      console.log('🔍 Fetching user profile for:', userId);
      
      // Add a small delay to ensure the profile was created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching profile:', error);
        
        // If profile doesn't exist yet, try again after a longer delay
        if (error.code === 'PGRST116') {
          console.log('🔄 Profile not found, retrying in 1 second...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (retryError) {
            console.error('❌ Retry failed:', retryError);
            return null;
          }
          
          console.log('✅ Profile fetched on retry:', retryData);
          setUser(retryData);
          return retryData;
        }
        
        return null;
      }

      console.log('✅ Profile fetched:', data);
      setUser(data);
      return data;
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      return null;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔑 Logging in...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw error;
      }

      console.log('✅ Login successful');
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      console.log('📝 Starting signup process...');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ Signup error:', error);
        throw error;
      }

      // Create profile if signup successful
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              role: userData.role || 'member',
              first_name: userData.firstName || '',    
              last_name: userData.lastName || '',      
              display_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(), // Changed from full_name
              created_at: new Date().toISOString(),
            }
          ]);

        if (profileError) {
          console.error('❌ Error creating profile:', profileError);
          throw profileError;
        }

        console.log('✅ Profile created successfully');
      }

      console.log('✅ Signup successful');
      return data;
    } catch (error) {
      console.error('❌ Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 Logging out...');

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Logout error:', error);
        throw error;
      }

      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user profile
  const refreshProfile = async () => {
    if (user?.id) {
      return await fetchUserProfile(user.id);
    }
    return null;
  };

  const value = {
    user,
    loading,
    login,
    signUp,
    register: signUp,  // Alias for signup
    signIn: login,     // Alias for login  
    signOut: logout,   // Alias for logout
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


