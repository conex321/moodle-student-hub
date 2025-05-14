
import React from "react";
import { cn } from "@/lib/utils";

interface SchoolLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function SchoolLogo({
  className,
  size = "md"
}: SchoolLogoProps) {
  // Size mappings
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };
  
  return (
    <div className={cn("bg-white rounded-full flex items-center justify-center", sizeMap[size], className)}>
      <div className="w-3/4 h-3/4 flex items-center justify-center">
        <img 
          alt="SIS Logo" 
          className="w-full h-full object-contain"
          src="/lovable-uploads/a838bc80-25a6-4184-8490-0daf76cc4ad2.png" 
        />
      </div>
    </div>
  );
}
