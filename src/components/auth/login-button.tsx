
import React from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  isLoading: boolean;
  isSignUp: boolean;
  handleTestLogin: () => void;
}

export function LoginButton({ isLoading, isSignUp, handleTestLogin }: LoginButtonProps) {
  return (
    <div className="w-full space-y-3">
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-all duration-200 shadow-sm"
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isSignUp ? "Signing up..." : "Signing in..."}
          </span>
        ) : (
          isSignUp ? "Sign up" : "Sign in"
        )}
      </Button>

      {!isSignUp && (
        <Button
          type="button"
          variant="outline"
          onClick={handleTestLogin}
          disabled={isLoading}
          className="w-full h-12 text-primary border-primary hover:bg-primary/10 font-medium rounded-lg transition-all duration-200"
        >
          <LogIn className="mr-2 h-4 w-4" /> Test the Environment
        </Button>
      )}
    </div>
  );
}
