
import { useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState, TEST_USERS } from '@/utils/auth-utils';

export function useSupabaseAuth() {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [intendedRole, setIntendedRole] = useState<UserRole>('student');

  useEffect(() => {
    // Set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          // User is authenticated, get profile details
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile?.full_name || session.user.email?.split('@')[0] || 'User',
            role: (profile?.role as UserRole) || intendedRole,
          };

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // No active session
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    // Check for existing session on mount
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
      // The onAuthStateChange handler will handle session if it exists
    };

    checkAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [intendedRole]);

  const login = async (credentials: LoginCredentials) => {
    // Check if this is a test login
    const isTestLogin = 
      (credentials.email === 'teacher@test.com' || credentials.email === 'student@test.com') && 
      credentials.password === 'test123';
    
    if (isTestLogin) {
      const testUser = credentials.role === 'teacher' ? TEST_USERS.teacher : TEST_USERS.student;
      
      setAuthState({
        user: testUser,
        isAuthenticated: true,
        isLoading: false,
      });
      
      // Store in localStorage if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem('moodle_hub_user', JSON.stringify(testUser));
      }
      
      // Configure mock Moodle API for test environment
      if (typeof window !== 'undefined') {
        localStorage.setItem('moodle_url', 'https://test-moodle.example.com');
        localStorage.setItem('moodle_token', 'test-token-123456');
      }
      
      return Promise.resolve();
    }
    
    // Clean up existing auth state before login
    cleanupAuthState();

    try {
      // Attempt global sign out for clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      // Real login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Set user role for profile lookup
      setIntendedRole(credentials.role);

      return Promise.resolve();
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const signup = async (credentials: LoginCredentials) => {
    // Clean up existing auth state before signup
    cleanupAuthState();
    
    try {
      // Attempt global sign out for clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            role: credentials.role,
            full_name: credentials.name || credentials.email.split('@')[0],
          },
        },
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Call edge function to create profile
      try {
        await supabase.functions.invoke('createProfile', {
          body: {
            user: data.user,
            metadata: {
              full_name: credentials.name,
              role: credentials.role,
              email: credentials.email
            }
          }
        });
      } catch (err) {
        console.error("Error calling createProfile function:", err);
        // Continue even if function fails, as the trigger should create the profile
      }

      // Set user role for profile lookup
      setIntendedRole(credentials.role);

      // Show success message
      toast({
        title: "Account Created",
        description: "Your account has been successfully created. You can now sign in.",
      });

      return Promise.resolve();
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
      return Promise.reject(error);
    }
  };

  const logout = async () => {
    // Clean up auth state
    cleanupAuthState();
    
    // Regular logout
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      // Remove any stored mock user data
      localStorage.removeItem('moodle_hub_user');
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout anyway
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      localStorage.removeItem('moodle_hub_user');
      window.location.href = '/auth';
    }
  };

  return {
    authState,
    login,
    signup,
    logout,
    setUserRole: setIntendedRole
  };
}
