
import React, { useEffect, useState } from "react";
import { SchoolLogo } from "@/components/ui/school-logo";
import { cn } from "@/lib/utils";

interface StickyHeaderProps {
  className?: string;
}

export function StickyHeader({ className }: StickyHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-2 px-4",
        scrolled ? "bg-white/90 backdrop-blur-md shadow-md" : "bg-transparent",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SchoolLogo size="sm" className="shadow-none" />
          <h1 className="font-roboto text-2xl font-bold text-[#f7911d]">SISConex</h1>
        </div>
      </div>
    </header>
  );
}
