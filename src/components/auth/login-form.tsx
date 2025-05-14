
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginTab } from "./login-tab";
import { RegisterTab } from "./register-tab";

interface LoginFormProps {
  userType: UserRole;
  onToggleUserType: () => void;
}

export function LoginForm({ userType }: LoginFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "login" | "register");
    setError(null);
  };

  const handleRegistrationSuccess = () => {
    setActiveTab("login");
    setError(null);
  };

  const goToAdminLogin = () => {
    navigate("/admin");
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="font-sans text-4xl font-medium mb-2">Welcome</h1>
      <p className="font-sans text-lg text-gray-600 mb-8">Faculty Login Portal</p>

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginTab 
            userType={userType} 
            onError={setError}
            error={error}
          />
        </TabsContent>
        
        <TabsContent value="register">
          <RegisterTab 
            userType={userType}
            onSuccess={handleRegistrationSuccess}
            onError={setError}
            error={error}
          />
        </TabsContent>
      </Tabs>

      <div className="w-full mt-6 pt-6 border-t border-gray-100 flex flex-col items-center space-y-4">
        <div className="flex flex-col items-center space-y-2 w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={goToAdminLogin}
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings className="h-4 w-4 mr-1" /> Admin Access
          </Button>
        </div>
      </div>
    </div>
  );
}
