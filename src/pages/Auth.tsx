import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SchoolLogo } from "@/components/ui/school-logo";
import { UserRole } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
export default function Auth() {
  const [userType, setUserType] = useState<UserRole>("student");
  const {
    setUserRole
  } = useAuth();
  const toggleUserType = () => {
    const newRole = userType === "student" ? "teacher" : "student";
    setUserType(newRole);
    setUserRole(newRole);
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-light to-teal-lighter">
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
            <div className="mt-6 bg-teal-lighter/50 rounded-xl p-6 w-full">
              <h4 className="text-navy font-medium mb-2">Need help?</h4>
              <p className="text-sm text-navy/70">
                Contact IT support at support@yourschool.edu
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="bg-white rounded-2xl p-8 w-full max-w-[450px] shadow-xl">
          <LoginForm userType={userType} onToggleUserType={toggleUserType} />
        </div>
      </div>
    </div>;
}