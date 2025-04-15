
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, UserRole } from '@/types/auth';

interface AuthContextProps {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

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
    // This is a placeholder for Supabase auth
    // In a real app, you'd use Supabase auth here
    
    // Mock login for demonstration
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
