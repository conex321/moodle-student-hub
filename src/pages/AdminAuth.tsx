
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setIsLoading(true);

    try {
      // Validate input fields
      if (!email.trim()) {
        throw new Error("Email is required");
      }

      if (!password.trim()) {
        throw new Error("Password is required");
      }

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
      setError(error instanceof Error ? error.message : "Invalid credentials");
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAdminLogin = async () => {
    setError(null); // Clear previous errors
    setIsLoading(true);
    
    try {
      // Create a test admin user
      localStorage.setItem("moodle_hub_admin", JSON.stringify({
        id: "test-admin-1",
        email: "admin@test.com",
        name: "Test Administrator",
        role: "admin"
      }));
      
      toast({
        title: "Test admin login successful",
        description: "Welcome to the Admin Dashboard (Test Environment)",
      });
      
      navigate("/admin/dashboard");
    } catch (error) {
      setError("Could not log in as test admin");
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Could not log in as test admin.",
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <InputWithLabel
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12"
              labelClassName="text-base"
            />

            <div className="space-y-1.5 relative">
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
            
            <Button
              type="button"
              variant="outline"
              onClick={handleTestAdminLogin}
              disabled={isLoading}
              className="w-full h-12 mt-3 text-primary border-primary hover:bg-primary/10 font-medium rounded-lg transition-all duration-200"
            >
              <LogIn className="mr-2 h-4 w-4" /> Test Admin Access
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
