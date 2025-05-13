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
  return <div className={cn("bg-white rounded-full flex items-center justify-center shadow-sm", sizeMap[size], className)}>
      <div className="w-3/4 h-3/4 flex items-center justify-center text-navy font-bold font-roboto">
        <img alt="School Logo" className="w-full h-full object-contain p-2" src="/lovable-uploads/d258da3c-28f5-4fbc-97c5-cc69e5bdee91.png" />
      </div>
    </div>;
}