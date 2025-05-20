
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/protected-route";

// Pages
import Auth from "./pages/Auth";
import MoodleConfig from "./pages/MoodleConfig";
// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCourses from "./pages/student/StudentCourses";
import StudentCalendar from "./pages/student/StudentCalendar";
import StudentGrades from "./pages/student/StudentGrades";
import StudentProfile from "./pages/student/StudentProfile";
// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherCourses from "./pages/teacher/TeacherCourses";
import TeacherSchedule from "./pages/teacher/TeacherSchedule";
import TeacherGrades from "./pages/teacher/TeacherGrades";
import TeacherSettings from "./pages/teacher/TeacherSettings";
import Reports from './pages/reportTable'
// Admin Pages
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMoodleConfig from "./pages/admin/AdminMoodleConfig";
import AdminUsers from "./pages/admin/AdminUsers";
import TeacherSchoolAccess from "./pages/admin/TeacherSchoolAccess";
import CreateSchoolForm from './pages/admin/CreateSchoolForm'

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/config" element={
              <ProtectedRoute>
                <MoodleConfig />
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<StudentCourses />} />
            <Route path="/student/calendar" element={<StudentCalendar />} />
            <Route path="/student/grades" element={<StudentGrades />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            
            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/students" element={<TeacherStudents />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/schedule" element={<TeacherSchedule />} />
            <Route path="/teacher/grades" element={<TeacherGrades />} />
            <Route path="/teacher/settings" element={<TeacherSettings />} />
            <Route path="/teacher/reports" element={<Reports />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminAuth />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/moodle-config" element={<AdminMoodleConfig />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/school-access" element={<TeacherSchoolAccess />} />
            <Route path="/admin/createschoole" element={<CreateSchoolForm/>} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
