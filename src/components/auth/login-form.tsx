
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { moodleApi } from "@/services/moodleApi";

interface LoginFormProps {
  userType: UserRole;
  onToggleUserType: () => void;
}

export function LoginForm({ userType, onToggleUserType }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const otherUserType = userType === "teacher" ? "Student" : "Faculty";

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
      <h1 className="font-sans text-5xl font-medium mb-2.5">Welcome</h1>
      <p className="font-sans text-xl font-medium mb-8">please enter your details</p>

      {error && (
        <div className="w-full p-4 mb-4 text-white bg-red-500 rounded-lg">
          {error}
        </div>
      )}

      <div className="w-full space-y-5 mb-5">
        <InputWithLabel
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputWithLabel
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => 
              setRememberMe(checked === true)
            }
            className="w-[21px] h-[21px] border-gray-medium bg-gray-light rounded mr-2.5 data-[state=checked]:bg-primary"
          />
          <label
            htmlFor="remember-me"
            className="font-sans text-xl font-medium"
          >
            remember me
          </label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-[58px] bg-primary text-2xl font-medium rounded-[15px] mb-5"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <div className="font-sans text-xl font-medium">
        <span>Don&apos;t have an account yet? </span>
        <span className="text-gray-dark cursor-pointer">Signup</span>
      </div>

      <button
        type="button"
        onClick={onToggleUserType}
        className="font-roboto text-2xl font-bold text-blue mt-5"
      >
        Login as {otherUserType} ?
      </button>
    </form>
  );
}
