
import React from "react";
import { UserRole } from "@/types/auth";

interface LoginTabsProps {
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
  otherUserType: string;
  onToggleUserType: () => void;
  goToAdminLogin: () => void;
}

export function LoginTabs({
  isSignUp,
  setIsSignUp,
  otherUserType,
  onToggleUserType,
  goToAdminLogin,
}: LoginTabsProps) {
  return (
    <div className="w-full mt-6 pt-6 border-t border-gray-100 flex flex-col items-center space-y-4">
      <p className="font-sans text-sm text-gray-600">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <span 
              className="text-primary hover:underline cursor-pointer"
              onClick={() => setIsSignUp(false)}
            >
              Sign in
            </span>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <span 
              className="text-primary hover:underline cursor-pointer"
              onClick={() => setIsSignUp(true)}
            >
              Sign up
            </span>
          </>
        )}
      </p>

      <div className="flex flex-col items-center space-y-2 w-full">
        <button
          type="button"
          onClick={onToggleUserType}
          className="font-medium text-sm text-blue hover:underline transition-all"
        >
          {isSignUp ? `Sign up` : `Login`} as {otherUserType}
        </button>
        
        <button
          type="button"
          onClick={goToAdminLogin}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Admin Access
        </button>
      </div>
    </div>
  );
}
