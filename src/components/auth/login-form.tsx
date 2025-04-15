
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { moodleApi } from "@/services/moodleApi";
import { EyeIcon, EyeOffIcon, LogIn } from "lucide-react";

interface LoginFormProps {
  userType: UserRole;
  onToggleUserType: () => void;
}

export function LoginForm({ userType, onToggleUserType }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({
        email,
        password,
        role: userType,
        rememberMe,
      });
      
      // Check if Moodle credentials are already set
      if (moodleApi.hasCredentials()) {
        navigate(userType === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
      } else {
        navigate("/config");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setError(null);
    setIsLoading(true);

    try {
      await login({
        email: userType === "teacher" ? "teacher@test.com" : "student@test.com",
        password: "test123",
        role: userType,
        rememberMe: false,
      });
      
      // For test environment, we assume Moodle is configured
      navigate(userType === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
    } catch (err) {
      setError("Test login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const otherUserType = userType === "teacher" ? "Student" : "Faculty";

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
      <h1 className="font-sans text-4xl font-medium mb-2">Welcome</h1>
      <p className="font-sans text-lg text-gray-600 mb-8">Please enter your details to sign in</p>

      {error && (
        <div className="w-full p-4 mb-4 text-white bg-red-500 rounded-lg flex items-center justify-center text-sm font-medium">
          {error}
        </div>
      )}

      <div className="w-full space-y-5 mb-6">
        <InputWithLabel
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          containerClassName="space-y-2"
          className="h-12 rounded-lg shadow-sm border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
        />

        <div className="w-full space-y-2">
          <InputWithLabel
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            containerClassName="space-y-2 relative"
            className="h-12 rounded-lg shadow-sm border-gray-200 pr-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => 
                setRememberMe(checked === true)
              }
              className="h-4 w-4 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <label
              htmlFor="remember-me"
              className="font-sans text-sm text-gray-700 cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>
          
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleTestLogin}
        disabled={isLoading}
        className="w-full h-12 mt-3 text-primary border-primary hover:bg-primary/10 font-medium rounded-lg transition-all duration-200"
      >
        <LogIn className="mr-2 h-4 w-4" /> Test the Environment
      </Button>

      <div className="w-full mt-6 pt-6 border-t border-gray-100 flex flex-col items-center space-y-4">
        <p className="font-sans text-sm text-gray-600">
          Don't have an account? <span className="text-primary hover:underline cursor-pointer">Sign up</span>
        </p>

        <button
          type="button"
          onClick={onToggleUserType}
          className="font-medium text-sm text-blue hover:underline transition-all"
        >
          Login as {otherUserType}
        </button>
      </div>
    </form>
  );
}
