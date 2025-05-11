
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { moodleApi } from "@/services/moodleApi";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import the extracted components
import { LoginHeader } from "./login-header";
import { ErrorMessage } from "./error-message";
import { LoginFormInputs } from "./login-form-inputs";
import { LoginButton } from "./login-button";
import { LoginTabs } from "./login-tabs";

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
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Handle sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role: userType,
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          toast.success("Account created successfully! Signing you in...");
          
          // Automatically sign in after successful signup
          try {
            await login({
              email,
              password,
              role: userType,
              rememberMe,
            });
            
            // Teachers always go directly to dashboard, students go to config if needed
            if (userType === "teacher") {
              navigate("/teacher/dashboard");
            } else if (moodleApi.hasCredentials()) {
              navigate("/student/dashboard");
            } else {
              navigate("/config");
            }
            
            return; // Exit function after successful login
          } catch (loginErr: any) {
            // If auto-login fails, show error but don't reset isSignUp
            setError(`Account created but login failed: ${loginErr.message || "Please try logging in manually."}`);
            setIsSignUp(false); // Switch back to login mode so user can try again
          }
        }
      } else {
        // Handle sign in
        await login({
          email,
          password,
          role: userType,
          rememberMe,
        });
        
        // Check if Moodle credentials are already set for students only
        if (userType === "teacher") {
          navigate("/teacher/dashboard");
        } else if (moodleApi.hasCredentials()) {
          navigate("/student/dashboard");
        } else {
          navigate("/config");
        }
      }
    } catch (err: any) {
      let errorMessage = "Authentication failed. Please try again.";
      
      // Provide more specific error messages for common issues
      if (err.message?.includes("email") || err.message?.includes("Email")) {
        errorMessage = "Invalid email format or email already in use.";
      } else if (err.message?.includes("password")) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
      
      // For test environment, we always direct to dashboard
      navigate(userType === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
    } catch (err) {
      setError("Test login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const goToAdminLogin = () => {
    navigate("/admin");
  };

  const otherUserType = userType === "teacher" ? "Student" : "Faculty";

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
      <LoginHeader isSignUp={isSignUp} />
      <ErrorMessage error={error} />
      
      <LoginFormInputs
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        rememberMe={rememberMe}
        setRememberMe={setRememberMe}
        isSignUp={isSignUp}
      />

      <LoginButton 
        isLoading={isLoading} 
        isSignUp={isSignUp} 
        handleTestLogin={handleTestLogin} 
      />

      <LoginTabs
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        otherUserType={otherUserType}
        onToggleUserType={onToggleUserType}
        goToAdminLogin={goToAdminLogin}
      />
    </form>
  );
}
