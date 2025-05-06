import { MainLayout } from "@/components/layout/main-layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export default function TeacherGrades() {
  const navigate = useNavigate();

  const handleNavigateToReports = () => {
    navigate("/student/reports");
  };

  return (
    // <MainLayout requiredRole="teacher">
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleNavigateToReports}
          className="mt-4"
        >
          View Student Reports
        </Button>
        <h1 className="text-3xl font-bold mb-6">Grade Management</h1>
        <p className="mb-4">This page is under construction. Check back soon for grade management features.</p>
        
      </div>
    // </MainLayout>
  );
}