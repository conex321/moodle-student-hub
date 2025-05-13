
import { UserRole } from "@/types/auth";

// Clean up Supabase auth state to prevent auth issues
export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Also check sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Mock test data for easily testing the UI without actual auth
export const TEST_USERS = {
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
