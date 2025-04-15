
import { MainLayout } from "@/components/layout/main-layout";

export default function StudentGrades() {
  return (
    <MainLayout requiredRole="student">
      <div>
        <h1 className="text-3xl font-bold mb-6">My Grades</h1>
        <p>This page is under construction. Check back soon for your grade information.</p>
      </div>
    </MainLayout>
  );
}
