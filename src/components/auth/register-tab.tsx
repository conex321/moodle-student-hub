
import React, { useState } from "react";
import { UserRole } from "@/types/auth";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus } from "lucide-react";
import { 
  PasswordInput,
  ErrorMessage
} from "./auth-form-elements";
import { useNavigate } from "react-router-dom";

interface RegisterTabProps {
  userType: UserRole;
  onSuccess: () => void;
  onError: (error: string | null) => void;
  error: string | null;
}

export function RegisterTab({ userType, onSuccess, onError, error }: RegisterTabProps) {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);
    setIsLoading(true);

    if (password.length < 6) {
      onError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      await signup({
        email,
        password,
        role: userType,
        rememberMe: false,
        name
      });
      
      // Redirect to appropriate dashboard based on user type instead of going to login tab
      if (userType === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
      
      setPassword("");
      
    } catch (err: any) {
      onError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="w-full flex flex-col items-center">
      <ErrorMessage message={error} />
      
      <div className="w-full space-y-5 mb-6">
        <InputWithLabel
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          containerClassName="space-y-2"
          className="h-12 rounded-lg shadow-sm border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
        />

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

        <div className="w-full space-y-2">
          <PasswordInput
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            autoComplete="new-password"
          />
          <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
      >
        {isLoading ? "Creating Account..." : "Create Account"}
        <UserPlus className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
