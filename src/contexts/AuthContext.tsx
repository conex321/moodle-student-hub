
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';

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

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      // In a real app, you'd check with Supabase here
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

    checkAuth();
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
    
    // Regular login logic (mock for now, would use Supabase in real app)
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        if (credentials.email && credentials.password) {
          const user: User = {
            id: `user-${Date.now()}`,
            email: credentials.email,
            name: credentials.email.split('@')[0],
            role: credentials.role,
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          if (credentials.rememberMe) {
            localStorage.setItem('moodle_hub_user', JSON.stringify(user));
          }
          
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const logout = async () => {
    // This is a placeholder for Supabase auth
    // In a real app, you'd use Supabase auth here
    
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('moodle_hub_user');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        resolve();
      }, 500);
    });
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
