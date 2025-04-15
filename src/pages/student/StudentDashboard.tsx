
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { moodleApi } from "@/services/moodleApi";
import { MoodleCourse } from "@/types/moodle";
import { Book, Calendar, GraduationCap } from "lucide-react";

export default function StudentDashboard() {
  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const fetchedCourses = await moodleApi.getCourses();
        setCourses(fetchedCourses.slice(0, 3)); // Show just a few for the dashboard
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <MainLayout requiredRole="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Enrolled Courses</CardTitle>
              <Book className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? '...' : courses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active this semester
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Upcoming Deadlines</CardTitle>
              <Calendar className="h-5 w-5 text-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Within the next 7 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Grade Average</CardTitle>
              <GraduationCap className="h-5 w-5 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="p-4 rounded-lg border hover:bg-teal-lighter transition-colors duration-200 cursor-pointer"
                  >
                    <div className="font-medium text-lg">{course.fullname}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(course.startdate * 1000).toLocaleDateString()} - 
                      {new Date(course.enddate * 1000).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No courses found. Please contact your administrator.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
