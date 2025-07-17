
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MoodleForm } from "@/components/auth/moodle-form";
import { StickyHeader } from "@/components/layout/sticky-header";

export default function MoodleConfig() {
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is a teacher, redirect to teacher dashboard
    if (authState.user?.role === 'teacher') {
      navigate('/teacher/dashboard');
    }
  }, [authState.user, navigate]);

  // If user is a teacher, return null while redirecting
  if (authState.user?.role === 'teacher') {
    return null;
  }
  
  // Only student users should see the config page
  if (authState.user?.role !== 'student') {
    return null;
  }
  
  return (
    <div className="min-h-screen">
      <StickyHeader />
      <div className="min-h-screen flex items-center justify-center bg-gray-light pt-16">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
          <h1 className="font-sans text-3xl font-medium mb-6 text-center">
            Moodle Configuration
          </h1>
          <p className="text-gray-600 mb-4 text-center">
            Please enter your Moodle credentials to sync your courses and grades.
          </p>
          <MoodleForm />
        </div>
      </div>
    </div>
  );
}
