
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { StickyHeader } from "@/components/layout/sticky-header";

interface MainLayoutProps {
  children: ReactNode;
  requiredRole: UserRole;
}

export function MainLayout({ children, requiredRole }: MainLayoutProps) {
  const { authState } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;

  console.log("MainLayout - Auth state:", { isLoading, isAuthenticated, userRole: user?.role, requiredRole });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#f7911d] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log("MainLayout - Redirecting to auth, not authenticated");
    return <Navigate to="/auth" replace />;
  }

  if (user.role !== requiredRole) {
    console.log(`MainLayout - Role mismatch, redirecting ${user.role} to their dashboard`);
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return (
    <div className="flex h-screen">
      <StickyHeader className="md:hidden" />
      <Sidebar role={user.role} />
      
      <main className="flex-1 overflow-y-auto bg-slate-50 pt-16 md:pt-0">
        <div className="p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
