
import React from "react";

interface ErrorMessageProps {
  error: string | null;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  
  return (
    <div className="w-full p-4 mb-4 text-white bg-red-500 rounded-lg flex items-center justify-center text-sm font-medium">
      {error}
    </div>
  );
}
