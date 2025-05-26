
import { UserRole } from "@/types/auth";

// Clean up Supabase auth state to prevent auth issues
export const cleanupAuthState = () => {
  console.log('Cleaning up auth state');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      console.log('Removing localStorage key:', key);
      localStorage.removeItem(key);
    }
  });
  
  // Also check sessionStorage if available
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log('Removing sessionStorage key:', key);
        sessionStorage.removeItem(key);
      }
    });
  }

  // Remove app-specific auth data
  localStorage.removeItem('moodle_hub_user');
  localStorage.removeItem('moodle_hub_admin');
  
  console.log('Auth state cleanup completed');
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
