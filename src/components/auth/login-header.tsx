
import React from "react";

interface LoginHeaderProps {
  isSignUp: boolean;
}

export function LoginHeader({ isSignUp }: LoginHeaderProps) {
  return (
    <>
      <h1 className="font-sans text-4xl font-medium mb-2">Welcome</h1>
      <p className="font-sans text-lg text-gray-600 mb-8">
        Please enter your details to {isSignUp ? "sign up" : "sign in"}
      </p>
    </>
  );
}
