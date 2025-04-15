
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // This is a simple mock authentication for admin
      // In a real app, this would be a secure authentication process
      if (email === "admin@test.com" && password === "admin123") {
        // Store admin session
        localStorage.setItem("moodle_hub_admin", JSON.stringify({
          id: "admin-1",
          email: email,
          name: "Administrator",
          role: "admin"
        }));
        
        toast({
          title: "Login successful",
          description: "Welcome to the Admin Dashboard",
        });
        
        navigate("/admin/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputWithLabel
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
              labelClassName="text-base"
            />

            <div className="space-y-1.5">
              <InputWithLabel
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 pr-10"
                containerClassName="relative"
                labelClassName="text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-9"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary text-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Admin credentials for testing: </span>
              <br />
              <code className="bg-gray-100 p-1 rounded text-xs">
                Email: admin@test.com, Password: admin123
              </code>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
