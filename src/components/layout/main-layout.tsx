
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

interface MainLayoutProps {
  children: ReactNode;
  requiredRole: UserRole;
}

export function MainLayout({ children, requiredRole }: MainLayoutProps) {
  const { authState } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== requiredRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="flex h-screen">
      <Sidebar role={user.role} />
      
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
