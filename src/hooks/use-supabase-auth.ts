
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
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check for existing test user session first
        const storedUser = localStorage.getItem('moodle_hub_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (isMounted) {
              setAuthState({
                user: parsedUser,
                isAuthenticated: true,
                isLoading: false,
              });
              console.log("Found stored test user:", parsedUser);
            }
            return;
          } catch (error) {
            console.error("Error parsing stored user:", error);
            localStorage.removeItem('moodle_hub_user');
          }
        }

        // Get current session immediately
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) {
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
          return;
        }

        if (session && session.user) {
          console.log("Found existing session:", session.user.id);
          
          try {
            // Get user profile
            const { data: profiles } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id);

            if (isMounted) {
              const profile = profiles && profiles.length > 0 ? profiles[0] : null;
              
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
            }
          } catch (profileError) {
            console.error("Error fetching profile:", profileError);
            if (isMounted) {
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          }
        } else {
          console.log("No existing session found");
          if (isMounted) {
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    };

    // Set up the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (!isMounted) return;
        
        if (session && session.user) {
          // Set loading state immediately
          setAuthState(prev => ({
            ...prev,
            isLoading: true,
          }));

          // Defer profile fetching to avoid deadlock
          setTimeout(async () => {
            if (!isMounted) return;
            
            try {
              const { data: profiles } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id);

              if (!isMounted) return;

              const profile = profiles && profiles.length > 0 ? profiles[0] : null;

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
            } catch (error) {
              console.error("Error fetching profile:", error);
              if (!isMounted) return;
              
              setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          }, 0);
        } else {
          // No active session
          console.log("No active session");
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    // Initialize auth state
    initializeAuth();
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [intendedRole]);

  const login = async (credentials: LoginCredentials) => {
    console.log("Login called with:", credentials);
    
    // Check if this is a test login
    const isTestLogin = 
      (credentials.email === 'teacher@test.com' || credentials.email === 'student@test.com') && 
      credentials.password === 'test123';
    
    if (isTestLogin) {
      console.log("Using test login");
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
        console.log("Signout before login failed:", err);
      }

      // Real login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error("Supabase login error:", error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      console.log("Supabase login successful:", data);

      // Set user role for profile lookup
      setIntendedRole(credentials.role);

      return Promise.resolve();
    } catch (error: any) {
      console.error("Login error:", error);
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
    console.log('Logout initiated');
    
    try {
      // Set loading state to prevent multiple logout attempts
      setAuthState(prev => ({
        ...prev,
        isLoading: true
      }));

      // Clean up auth state first
      cleanupAuthState();
      
      // Check if this is a test user logout
      const storedUser = localStorage.getItem('moodle_hub_user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.email === 'teacher@test.com' || userData.email === 'student@test.com') {
            console.log('Logging out test user');
            localStorage.removeItem('moodle_hub_user');
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            window.location.href = '/auth';
            return;
          }
        } catch (error) {
          console.error('Error parsing stored user during logout:', error);
        }
      }

      // For real Supabase users, attempt to sign out
      console.log('Attempting Supabase signout');
      
      // Try global signout first
      const { error: globalError } = await supabase.auth.signOut({ scope: 'global' });
      
      if (globalError) {
        console.error('Global signout error:', globalError);
        // If global signout fails, try local signout
        const { error: localError } = await supabase.auth.signOut({ scope: 'local' });
        if (localError) {
          console.error('Local signout error:', localError);
        }
      }

      console.log('Signout completed, cleaning up state');
      
      // Force state cleanup regardless of signout success
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Remove any remaining stored data
      localStorage.removeItem('moodle_hub_user');
      localStorage.removeItem('moodle_hub_admin');
      
      // Clear any Supabase auth data
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      console.log('Logout completed, redirecting to auth');
      
      // Force redirect
      window.location.href = '/auth';
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even if there's an error
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      // Clean up storage
      localStorage.removeItem('moodle_hub_user');
      localStorage.removeItem('moodle_hub_admin');
      cleanupAuthState();
      
      // Show error but still redirect
      toast({
        title: "Logout Warning",
        description: "There was an issue during logout, but you have been signed out.",
        variant: "destructive",
      });
      
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
