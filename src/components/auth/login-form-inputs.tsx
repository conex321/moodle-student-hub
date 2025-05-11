
import React, { useState } from "react";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface LoginFormInputsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  isSignUp: boolean;
}

export function LoginFormInputs({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  isSignUp
}: LoginFormInputsProps) {
  return (
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

      {!isSignUp && (
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
      )}
    </div>
  );
}
