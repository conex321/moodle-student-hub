
import { useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SchoolLogo } from "@/components/ui/school-logo";
import { UserRole } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { StickyHeader } from "@/components/layout/sticky-header";

export default function Auth() {
  // Fixed userType to be "teacher" only
  const [userType] = useState<UserRole>("teacher");
  const { setUserRole } = useAuth();
  
  // Set role to teacher on component mount
  useEffect(() => {
    setUserRole("teacher");
  }, [setUserRole]);

  return (
    <div className="min-h-screen">
      <StickyHeader />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f7911d]/80 to-[#f7911d]/60 pt-16">
        <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Left Panel - School Info (hidden on small screens) */}
          <div className="hidden md:flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl p-10 w-full max-w-[500px] shadow-xl">
            <div className="mb-8">
              <SchoolLogo size="lg" className="shadow-md" />
            </div>
            <h2 className="font-roboto text-3xl font-bold text-navy mb-2 text-center">SISConex</h2>
            <h3 className="font-roboto text-2xl font-medium text-navy text-center">Grading Tracking Software</h3>
            <div className="mt-8 flex flex-col items-center">
              <p className="text-navy/70 text-center max-w-xs">
                Access your courses, assignments, and grades all in one place
              </p>
              <div className="mt-6 bg-[#f7911d]/10 rounded-xl p-6 w-full">
                <h4 className="text-navy font-medium mb-2">Need help?</h4>
                <p className="text-sm text-navy/70">Contact IT support at support@sisconex.com</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="bg-white rounded-2xl p-8 w-full max-w-[450px] shadow-xl">
            <LoginForm userType={userType} onToggleUserType={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
