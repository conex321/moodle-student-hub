
import { Link, useLocation } from "react-router-dom";
import { 
  Book, 
  Calendar, 
  GraduationCap, 
  Home, 
  LogOut, 
  Settings, 
  User, 
  Users 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

interface SidebarItem {
  icon: typeof Home;
  label: string;
  href: string;
}

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();

  const studentItems: SidebarItem[] = [
    { icon: Home, label: "Dashboard", href: "/student/dashboard" },
    { icon: Book, label: "Courses", href: "/student/courses" },
    { icon: Calendar, label: "Calendar", href: "/student/calendar" },
    { icon: GraduationCap, label: "Grades", href: "/student/grades" },
    { icon: User, label: "Profile", href: "/student/profile" },
  ];
  
  const teacherItems: SidebarItem[] = [
    { icon: Home, label: "Dashboard", href: "/teacher/dashboard" },
    { icon: Users, label: "Students", href: "/teacher/students" },
    { icon: Book, label: "Courses", href: "/teacher/courses" },
    { icon: Calendar, label: "Schedule", href: "/teacher/schedule" },
    { icon: GraduationCap, label: "Grades", href: "/teacher/grades" },
    { icon: Settings, label: "Settings", href: "/teacher/settings" },
  ];
  
  const items = role === "student" ? studentItems : teacherItems;
  
  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <aside className="bg-white h-screen w-64 flex flex-col shadow-lg">
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-2xl font-bold text-navy">Moodle Hub</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-medium text-lg h-12",
                    location.pathname === item.href
                      ? "bg-primary text-black"
                      : "text-gray-dark hover:bg-teal-lighter"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start text-lg font-medium"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
