import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { showToast } from '@/utils/toastUtils';
import { storage, STORAGE_KEYS } from '@/utils/storageUtils';
import { normalizeRole } from '@/utils/roleUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⭐ SIMPLIFIED: Faster user profile fetching
  const fetchUserProfile = async (userId) => {
    try {
      console.log('[AuthContext] 🔍 Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] ❌ Profile fetch error:', error);
        
        // ⭐ CHECK: If profile doesn't exist, create one
        if (error.code === 'PGRST116') { // No rows returned
          console.log('[AuthContext] 📝 No profile found, creating basic profile...');
          
          // ⭐ TRY: Create a basic profile
          const newProfile = {
            id: userId,
            role: 'staff', // Default to staff
            status: 'active',
            first_name: '',
            last_name: '',
            email: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // Try to insert the profile
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
            
          if (insertError) {
            console.error('[AuthContext] ❌ Failed to create profile:', insertError);
            // Return fallback profile anyway
            return newProfile;
          }
          
          console.log('[AuthContext] ✅ Created new profile:', insertData);
          setUser(insertData);
          return insertData;
        }
        
        throw error;
      }

      // ⭐ VALIDATE: Ensure role exists
      if (!data.role || data.role === null) {
        console.warn('[AuthContext] ⚠️ Profile has no role, defaulting to staff');
        data.role = 'staff';
        
        // Update the profile with default role
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'staff' })
          .eq('id', userId);
          
        if (updateError) {
          console.error('[AuthContext] ❌ Failed to update role:', updateError);
        }
      }

      // ⭐ NORMALIZE: Clean and normalize the user data
      const normalizedUser = {
        ...data,
        role: normalizeRole(data.role || 'staff')
      };

      console.log('[AuthContext] ✅ Profile fetched and normalized:', {
        id: normalizedUser.id,
        email: normalizedUser.email,
        role: normalizedUser.role,
        status: normalizedUser.status
      });
      
      setUser(normalizedUser);
      return normalizedUser;
      
    } catch (error) {
      console.error('[AuthContext] ❌ Error fetching profile:', error);
      
      // ⭐ FALLBACK: Don't break auth flow, create minimal user
      const fallbackUser = {
        id: userId,
        role: 'staff',
        status: 'active',
        email: 'unknown@example.com',
        first_name: '',
        last_name: ''
      };
      
      console.log('[AuthContext] 🔧 Using fallback user:', fallbackUser);
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  // ⭐ SIMPLIFIED: Auth state listener with faster timeout
  useEffect(() => {
    console.log('[AuthContext] 🔄 Initializing auth state...');
    
    let isMounted = true;
    let timeoutId;
    
    // ⭐ FASTER: Reduced timeout to 3 seconds
    const authTimeout = setTimeout(() => {
      if (isMounted) {
        console.log('[AuthContext] ⚠️ Auth loading timeout - forcing completion');
        setAuthReady(true);
      }
    }, 3000); // Reduced from 5000ms to 3000ms

    const initializeAuth = async () => {
      try {
        // ⭐ FASTER: Get current session quickly
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AuthContext] ❌ Session error:', error);
          if (isMounted) {
            setAuthReady(true);
          }
          return;
        }

        if (session?.user && isMounted) {
          console.log('[AuthContext] 👤 Found existing session for:', session.user.id);
          
          // ⭐ ASYNC: Fetch profile in background, don't wait
          fetchUserProfile(session.user.id).finally(() => {
            if (isMounted) {
              setAuthReady(true);
              clearTimeout(authTimeout);
            }
          });
        } else {
          console.log('[AuthContext] 🚫 No active session');
          if (isMounted) {
            setAuthReady(true);
            clearTimeout(authTimeout);
          }
        }
        
      } catch (error) {
        console.error('[AuthContext] ❌ Auth initialization error:', error);
        if (isMounted) {
          setAuthReady(true);
          clearTimeout(authTimeout);
        }
      }
    };

    // ⭐ FAST: Initialize immediately
    initializeAuth();

    // ⭐ SIMPLIFIED: Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] 🔄 Auth state changed:', event);
      
      if (!isMounted) return;

      switch (event) {
        case 'SIGNED_IN':
          if (session?.user) {
            // ⭐ BACKGROUND: Don't block UI for profile fetching
            fetchUserProfile(session.user.id);
          }
          break;
          
        case 'SIGNED_OUT':
          setUser(null);
          storage.local.clear();
          storage.session.clear();
          break;
          
        case 'TOKEN_REFRESHED':
          console.log('[AuthContext] 🔄 Token refreshed');
          break;
      }

      if (!authReady) {
        setAuthReady(true);
        clearTimeout(authTimeout);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    
    try {
      console.log('[AuthContext] 🔑 Logging in...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('[AuthContext] ✅ Login successful, fetching profile...');
      console.log('[AuthContext] 🔍 Auth data:', data);
      
      // ⭐ IMMEDIATE: Fetch profile right after login
      let userProfile = null;
      if (data.user) {
        try {
          console.log('[AuthContext] 📋 Fetching profile for user ID:', data.user.id);
          userProfile = await fetchUserProfile(data.user.id);
          console.log('[AuthContext] ✅ Profile fetched successfully:', userProfile);
        } catch (profileError) {
          console.warn('[AuthContext] ⚠️ Profile fetch failed:', profileError);
          console.log('[AuthContext] 🔧 Creating fallback profile...');
          
          userProfile = {
            id: data.user.id,
            email: data.user.email || '',
            role: 'staff', // ⭐ DEFAULT: Assume staff for now
            status: 'active',
            first_name: '',
            last_name: '',
            created_at: new Date().toISOString()
          };
          setUser(userProfile);
          console.log('[AuthContext] 📋 Fallback profile created:', userProfile);
        }
      }
      
      storage.local.set('last_login', new Date().toISOString());
      
      // ⭐ RETURN: User with profile data
      const returnUser = userProfile || {
        id: data.user.id,
        email: data.user.email,
        role: 'staff',
        status: 'active'
      };
      
      console.log('[AuthContext] 🎯 Returning user for login:', returnUser);
      return { user: returnUser };
      
    } catch (error) {
      console.error('[AuthContext] ❌ Login error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        showToast.error('Login Failed', 'Invalid email or password');
      } else if (error.message.includes('Email not confirmed')) {
        showToast.error('Email Not Verified', 'Please check your email and verify your account');
      } else if (error.message.includes('Too many requests')) {
        showToast.error('Too Many Attempts', 'Please wait a few minutes before trying again');
      } else {
        showToast.error('Login Failed', error.message);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password, userData) => {
    setLoading(true);
    
    try {
      console.log('[AuthContext] 📝 Signing up...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
          }
        }
      });

      if (error) throw error;

      showToast.success(
        'Account Created!', 
        'Please check your email to verify your account.'
      );
      
      return { user: data.user };
      
    } catch (error) {
      console.error('[AuthContext] ❌ Signup error:', error);
      
      if (error.message.includes('User already registered')) {
        showToast.error('Account Exists', 'An account with this email already exists');
      } else {
        showToast.error('Signup Failed', error.message);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] 🚪 Logging out...');
      
      // ⭐ CLEAR: All stored data
      storage.local.remove(STORAGE_KEYS.USER_PREFERENCES);
      storage.local.remove(STORAGE_KEYS.DASHBOARD_CONFIG);
      storage.session.clear();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      
      showToast.success('Logged Out', 'You have been successfully logged out');
      
    } catch (error) {
      console.error('[AuthContext] ❌ Logout error:', error);
      showToast.error('Logout Failed', error.message);
    }
  };

  const value = {
    user,
    authReady,
    loading,
    login,
    signup,
    logout,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;