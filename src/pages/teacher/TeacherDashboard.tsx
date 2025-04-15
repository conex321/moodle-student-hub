
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { moodleApi } from "@/services/moodleApi";
import { MoodleCourse, MoodleStudent } from "@/types/moodle";
import { Book, GraduationCap, User, Users } from "lucide-react";

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [students, setStudents] = useState<MoodleStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedCourses = await moodleApi.getCourses();
        setCourses(fetchedCourses.slice(0, 3)); // Show just a few for the dashboard
        
        const fetchedStudents = await moodleApi.getAllStudents();
        setStudents(fetchedStudents.slice(0, 5)); // Show just a few for the dashboard
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout requiredRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-lg text-gray-600">Welcome back!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Active Courses</CardTitle>
              <Book className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? '...' : courses.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Courses you're teaching
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Total Students</CardTitle>
              <Users className="h-5 w-5 text-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoading ? '...' : students.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all your courses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-lg font-medium">Grading Pending</CardTitle>
              <GraduationCap className="h-5 w-5 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Assignments to grade
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        {course.shortname} • {new Date(course.startdate * 1000).toLocaleDateString()}
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

          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div 
                      key={student.id} 
                      className="flex items-center gap-3 p-4 rounded-lg border hover:bg-teal-lighter transition-colors duration-200 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-teal-light flex items-center justify-center">
                        {student.profileimageurl ? (
                          <img 
                            src={student.profileimageurl} 
                            alt={student.fullname} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{student.fullname}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No students found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
