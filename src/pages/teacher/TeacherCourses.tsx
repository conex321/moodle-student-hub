
import { MainLayout } from "@/components/layout/main-layout";

export default function TeacherCourses() {
  return (
    <MainLayout requiredRole="teacher">
      <div>
        <h1 className="text-3xl font-bold mb-6">Courses</h1>
        <p>This page is under construction. Check back soon for course management.</p>
      </div>
    </MainLayout>
  );
}
