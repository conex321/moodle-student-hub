
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in
    const checkAdmin = () => {
      const storedAdmin = localStorage.getItem('moodle_hub_admin');
      
      if (storedAdmin) {
        try {
          const admin = JSON.parse(storedAdmin) as AdminUser;
          setAdminUser(admin);
        } catch (error) {
          setAdminUser(null);
        }
      }
      
      setIsLoading(false);
    };

    checkAdmin();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('moodle_hub_admin');
    navigate('/admin');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex h-screen">
      <aside className="bg-gray-900 text-white w-64 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Moodle Hub Admin</h1>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => navigate('/admin/dashboard')}
              >
                Dashboard
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => navigate('/admin/moodle-config')}
              >
                Moodle Configuration
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => navigate('/admin/users')}
              >
                User Management
              </Button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-700">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Logged in as:</p>
            <p className="font-medium">{adminUser.name}</p>
            <p className="text-sm text-gray-400">{adminUser.email}</p>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-gray-600"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
