
import { MainLayout } from "@/components/layout/main-layout";

export default function StudentCourses() {
  return (
    <MainLayout requiredRole="student">
      <div>
        <h1 className="text-3xl font-bold mb-6">My Courses</h1>
        <p>This page is under construction. Check back soon for your course information.</p>
      </div>
    </MainLayout>
  );
}
