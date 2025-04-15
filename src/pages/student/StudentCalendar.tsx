
import { MainLayout } from "@/components/layout/main-layout";

export default function StudentCalendar() {
  return (
    <MainLayout requiredRole="student">
      <div>
        <h1 className="text-3xl font-bold mb-6">Calendar</h1>
        <p>This page is under construction. Check back soon for your calendar information.</p>
      </div>
    </MainLayout>
  );
}
