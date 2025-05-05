
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextProps {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Mock test data
const TEST_USERS = {
  teacher: {
    id: 'test-teacher-123',
    email: 'teacher@test.com',
    name: 'Test Teacher',
    role: 'teacher' as UserRole,
  },
  student: {
    id: 'test-student-456',
    email: 'student@test.com',
    name: 'Test Student',
    role: 'student' as UserRole,
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [intendedRole, setIntendedRole] = useState<UserRole>('student');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for existing Supabase session
    const checkAuth = async () => {
      // First check for Supabase session
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      
      if (supabaseSession) {
        const userRole = supabaseSession.user.user_metadata.role as UserRole || 'student';
        const user: User = {
          id: supabaseSession.user.id,
          email: supabaseSession.user.email || '',
          name: supabaseSession.user.email?.split('@')[0] || '',
          role: userRole,
        };
        
        setSession(supabaseSession);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
      
      // Fallback to local storage for test users
      const storedUser = localStorage.getItem('moodle_hub_user');
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as User;
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error parsing stored user:', error);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession);
        setSession(currentSession);
        
        if (currentSession) {
          const userRole = currentSession.user.user_metadata.role as UserRole || 'student';
          const user: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            name: currentSession.user.email?.split('@')[0] || '',
            role: userRole,
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          localStorage.removeItem('moodle_hub_user');
        }
      }
    );

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    
    // Real login with Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Set user role in user metadata if it doesn't exist
        if (!data.user.user_metadata.role) {
          await supabase.auth.updateUser({
            data: { role: credentials.role }
          });
        }
        
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.email?.split('@')[0] || '',
          role: (data.user.user_metadata.role as UserRole) || credentials.role,
        };
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        if (credentials.rememberMe) {
          localStorage.setItem('moodle_hub_user', JSON.stringify(user));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Try to log out from Supabase
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Supabase logout error:', error);
    } catch (err) {
      console.error('Error during Supabase logout:', err);
    }
    
    // Always clean up local state
    localStorage.removeItem('moodle_hub_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    return Promise.resolve();
  };

  const setUserRole = (role: UserRole) => {
    setIntendedRole(role);
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, setUserRole }}>
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
