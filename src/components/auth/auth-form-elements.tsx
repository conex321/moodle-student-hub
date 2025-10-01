
import React from "react";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface PasswordInputProps {
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  autoComplete?: string;
}

export function PasswordInput({
  password,
  setPassword,
  showPassword,
  setShowPassword,
  autoComplete = "current-password"
}: PasswordInputProps) {
  return (
    <div className="w-full space-y-2 relative">
      <InputWithLabel
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete={autoComplete}
        containerClassName="space-y-2"
        className="h-12 rounded-lg shadow-sm border-gray-200 pr-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-[38px] text-gray-500 hover:text-gray-700 transition-colors"
        tabIndex={-1}
      >
        {showPassword ? (
          <EyeOffIcon className="h-5 w-5" />
        ) : (
          <EyeIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

interface RememberMeProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function RememberMeCheckbox({ checked, onChange }: RememberMeProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember-me"
        checked={checked}
        onCheckedChange={(checked) => onChange(checked === true)}
        className="h-4 w-4 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <label
        htmlFor="remember-me"
        className="font-sans text-sm text-gray-700 cursor-pointer select-none"
      >
        Remember me
      </label>
    </div>
  );
}

interface ErrorMessageProps {
  message: string | null;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className="w-full p-4 mb-4 text-white bg-red-500 rounded-lg flex items-center justify-center text-sm font-medium">
      {message}
    </div>
  );
}
