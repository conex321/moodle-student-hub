
import { MainLayout } from "@/components/layout/main-layout";

export default function StudentProfile() {
  return (
    <MainLayout requiredRole="student">
      <div>
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <p>This page is under construction. Check back soon for your profile information.</p>
      </div>
    </MainLayout>
  );
}
