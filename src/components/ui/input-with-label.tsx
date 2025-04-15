
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface InputWithLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
}

export function InputWithLabel({
  label,
  className,
  containerClassName,
  labelClassName,
  id,
  ...props
}: InputWithLabelProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("w-full space-y-1.5", containerClassName)}>
      <Label 
        htmlFor={inputId} 
        className={cn("font-sans text-xl font-medium", labelClassName)}
      >
        {label}
      </Label>
      <Input 
        id={inputId} 
        className={cn("h-[58px] rounded-[15px] border-gray-medium px-4 py-3 text-xl", className)} 
        placeholder={props.placeholder || `Enter your ${label.toLowerCase()}`}
        {...props} 
      />
    </div>
  );
}
