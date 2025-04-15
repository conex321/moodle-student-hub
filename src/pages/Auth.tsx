
import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SchoolLogo } from "@/components/ui/school-logo";
import { UserRole } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  const [userType, setUserType] = useState<UserRole>("student");
  const { setUserRole } = useAuth();

  const toggleUserType = () => {
    const newRole = userType === "student" ? "teacher" : "student";
    setUserType(newRole);
    setUserRole(newRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-light">
      <div className="flex flex-row w-full max-w-6xl justify-center items-center gap-6 px-4">
        {/* Left Panel - Login Form */}
        <div className="bg-white rounded-[15px] p-8 w-full max-w-[554px] shadow-md">
          <LoginForm userType={userType} onToggleUserType={toggleUserType} />
        </div>

        {/* Right Panel - School Info (hidden on small screens) */}
        <div className="hidden md:flex bg-teal-lighter rounded-xl p-10 w-full max-w-[762px] flex-col items-center justify-center">
          <div className="mb-8">
            <SchoolLogo size="md" />
          </div>
          <h2 className="font-roboto text-3xl font-medium text-navy mb-2">
            YOUR SCHOOL NAME
          </h2>
          <h3 className="font-roboto text-3xl font-medium text-navy">
            HIGH SCHOOL
          </h3>
        </div>
      </div>
    </div>
  );
}
