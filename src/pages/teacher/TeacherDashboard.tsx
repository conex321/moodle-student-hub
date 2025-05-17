
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { moodleApi } from "@/services/moodleApi";
import { statisticsApi, SchoolStatistics } from "@/services/statisticsApi";
import { MoodleCourse, MoodleStudent } from "@/types/moodle";
import { Book, GraduationCap, School, User, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TeacherDashboard() {
  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [students, setStudents] = useState<MoodleStudent[]>([]);
  const [statistics, setStatistics] = useState<SchoolStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

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

    const fetchStatistics = async () => {
      try {
        const stats = await statisticsApi.getSchoolStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    fetchData();
    fetchStatistics();
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
              <CardTitle className="text-lg font-medium">Total Schools</CardTitle>
              <School className="h-5 w-5 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{isStatsLoading ? '...' : statistics?.totalSchools || 0}</div>
              <p className="text-xs text-muted-foreground">
                In the system
              </p>
            </CardContent>
          </Card>
        </div>

        {/* School Statistics Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>School Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : statistics ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statistics.submissionsBySchool}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="schoolName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="submissionCount" fill="#f7911d" name="Submissions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No statistics available
              </div>
            )}
          </CardContent>
        </Card>

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
              <CardTitle>Schools Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : statistics ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Total Submissions:</span>
                    <span className="font-bold">{statistics.totalSubmissions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Average Submissions Per School:</span>
                    <span className="font-bold">{statistics.averageSubmissionsPerSchool.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}</span>
                  </div>
                  <h3 className="font-medium text-lg pt-2">Schools</h3>
                  <ul className="divide-y">
                    {statistics.schoolNames.map((school) => (
                      <li key={school} className="py-2">
                        {school}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No statistics available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
