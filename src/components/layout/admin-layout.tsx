
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { StickyHeader } from "@/components/layout/sticky-header";

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
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestEnvironment, setIsTestEnvironment] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const checkAdmin = () => {
      const storedAdmin = localStorage.getItem('moodle_hub_admin');
      
      if (storedAdmin) {
        try {
          const admin = JSON.parse(storedAdmin) as AdminUser;
          setAdminUser(admin);
          
          // Check if this is a test environment
          const user = localStorage.getItem('moodle_hub_user');
          if (user) {
            const userData = JSON.parse(user);
            setIsTestEnvironment(
              userData.email === 'teacher@test.com' || 
              userData.email === 'student@test.com' ||
              admin.id.startsWith('test-')
            );
          }
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

  const handleBackToApp = () => {
    const user = localStorage.getItem('moodle_hub_user');
    if (user) {
      const userData = JSON.parse(user);
      const route = userData.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
      navigate(route);
    } else {
      navigate('/auth');
    }
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
      <StickyHeader />
      <aside className="bg-gray-900 text-white w-64 flex flex-col pt-16">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Moodle Hub Admin</h1>
          {isTestEnvironment && (
            <div className="mt-2 px-2 py-1 bg-amber-500 text-amber-950 text-xs font-medium rounded flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Test Environment
            </div>
          )}
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
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => navigate('/admin/school-access')}
              >
                School Access
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-gray-800"
                onClick={() => navigate('/admin/create-school')}
              >
                Create School
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
          
          {isTestEnvironment && (
            <Button 
              variant="outline" 
              className="w-full justify-start text-white border-gray-600 mb-2"
              onClick={handleBackToApp}
            >
              Back to App
            </Button>
          )}
          
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
      
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-16">
        <div className="p-6 max-w-7xl mx-auto">
          {isTestEnvironment && (
            <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg flex items-center">
              <AlertTriangle className="text-amber-500 mr-3 h-5 w-5" />
              <div>
                <h3 className="font-semibold text-amber-800">Test Environment</h3>
                <p className="text-sm text-amber-700">
                  You are currently in a test environment. Changes made here will not affect any real Moodle instance.
                </p>
              </div>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
