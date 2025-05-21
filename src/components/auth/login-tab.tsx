
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserRole } from "@/types/auth";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";
import { moodleApi } from "@/services/moodleApi";
import { 
  PasswordInput, 
  RememberMeCheckbox,
  ErrorMessage
} from "./auth-form-elements";

interface LoginTabProps {
  userType: UserRole;
  onError: (error: string | null) => void;
  error: string | null;
}

export function LoginTab({ userType, onError, error }: LoginTabProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    setIsLoading(true);

    // Validate inputs
    if (!email.trim()) {
      onError("Email is required");
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      onError("Password is required");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", { email, role: userType });

      await login({
        email,
        password,
        role: userType, // Always "teacher" now
        rememberMe,
      });
      
      console.log("Login successful, redirecting to teacher dashboard");
      
      // Always redirect to teacher dashboard
      navigate("/teacher/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      onError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    onError(null);
    setIsLoading(true);

    try {
      console.log("Attempting test teacher login");
      
      await login({
        email: "teacher@test.com",
        password: "test123",
        role: "teacher",
        rememberMe: false,
      });
      
      console.log("Test login successful, redirecting to teacher dashboard");
      
      // Always go to teacher dashboard
      navigate("/teacher/dashboard");
    } catch (err) {
      console.error("Test login error:", err);
      onError("Test login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
      <ErrorMessage message={error} />
      
      <div className="w-full space-y-5 mb-6">
        <InputWithLabel
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          containerClassName="space-y-2"
          className="h-12 rounded-lg shadow-sm border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
        />

        <PasswordInput
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <div className="flex items-center justify-between w-full">
          <RememberMeCheckbox 
            checked={rememberMe} 
            onChange={setRememberMe} 
          />
          
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-[#f7911d] hover:bg-[#f7911d]/90 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleTestLogin}
        disabled={isLoading}
        className="w-full h-12 mt-3 text-[#f7911d] border-[#f7911d] hover:bg-[#f7911d]/10 font-medium rounded-lg transition-all duration-200"
      >
        <LogIn className="mr-2 h-4 w-4" /> Test the Environment
      </Button>
    </form>
  );
}
