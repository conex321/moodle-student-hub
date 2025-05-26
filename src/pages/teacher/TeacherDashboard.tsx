import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { moodleApi } from "@/services/moodleApi";
import { statisticsApi, SchoolStatistics } from "@/services/statisticsApi";
import { MoodleCourse, MoodleStudent } from "@/types/moodle";
import { Book, GraduationCap, School, User, Users, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function TeacherDashboard() {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [students, setStudents] = useState<MoodleStudent[]>([]);
  const [statistics, setStatistics] = useState<SchoolStatistics | null>(null);
  const [filteredStatistics, setFilteredStatistics] = useState<SchoolStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isRefreshingProfile, setIsRefreshingProfile] = useState(false);
  const [accessibleSchools, setAccessibleSchools] = useState<string[]>([]);

  const fetchUserProfile = async () => {
    if (!authState.user?.id || !authState.isAuthenticated) {
      console.log('No authenticated user, skipping profile fetch');
      setAccessibleSchools([]);
      return;
    }

    try {
      console.log('Fetching profile for user ID:', authState.user.id);

      // Query Supabase for the user's profile
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('accessible_schools')
        .eq('id', authState.user.id);

      // Log the raw response for debugging
      console.log('Supabase profiles response:', { profiles, error });

      if (error) {
        console.error('Supabase error:', error);
        setAccessibleSchools([]);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profile found for user ID:', authState.user.id);
        setAccessibleSchools([]);
        return;
      }

      const profile = profiles[0]; // Get the first (and should be only) result
      const schools = profile?.accessible_schools || [];
      setAccessibleSchools(schools);
      console.log('Teacher accessible schools:', schools);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setAccessibleSchools([]);
    }
  };

  const handleRefreshProfile = async () => {
    setIsRefreshingProfile(true);
    try {
      await fetchUserProfile();
      toast({
        title: "Profile refreshed",
        description: "Your accessible schools have been updated",
      });
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingProfile(false);
    }
  };

  useEffect(() => {
    // Only fetch profile if user is authenticated
    if (authState.isAuthenticated && authState.user?.id) {
      fetchUserProfile();
    } else {
      setAccessibleSchools([]);
    }
  }, [authState.user?.id, authState.isAuthenticated]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authState.isAuthenticated) {
        setIsLoading(false);
        return;
      }

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
      if (!authState.isAuthenticated) {
        setIsStatsLoading(false);
        return;
      }

      try {
        const stats = await statisticsApi.getSchoolStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsStatsLoading(false);
      }
    };

    if (authState.isAuthenticated) {
      fetchData();
      fetchStatistics();
    } else {
      setIsLoading(false);
      setIsStatsLoading(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    if (statistics && accessibleSchools.length > 0) {
      // Filter statistics to show only accessible schools
      const filteredSubmissionsBySchool = statistics.submissionsBySchool.filter(
        school => accessibleSchools.includes(school.schoolName)
      );

      const filteredSchoolNames = statistics.schoolNames.filter(
        schoolName => accessibleSchools.includes(schoolName)
      );

      const totalFilteredSubmissions = filteredSubmissionsBySchool.reduce(
        (sum, school) => sum + school.submissionCount, 0
      );

      const avgSubmissions = filteredSubmissionsBySchool.length > 0 
        ? totalFilteredSubmissions / filteredSubmissionsBySchool.length 
        : 0;

      const filtered: SchoolStatistics = {
        totalSchools: filteredSchoolNames.length,
        schoolNames: filteredSchoolNames,
        totalSubmissions: totalFilteredSubmissions,
        averageSubmissionsPerSchool: avgSubmissions,
        submissionsBySchool: filteredSubmissionsBySchool
      };

      setFilteredStatistics(filtered);
      console.log('Filtered statistics for teacher:', filtered);
    } else if (statistics && accessibleSchools.length === 0) {
      // If no accessible schools, show empty statistics
      setFilteredStatistics({
        totalSchools: 0,
        schoolNames: [],
        totalSubmissions: 0,
        averageSubmissionsPerSchool: 0,
        submissionsBySchool: []
      });
    }
  }, [statistics, accessibleSchools]);

  const displayStats = filteredStatistics || statistics;

  return (
    <MainLayout requiredRole="teacher">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="text-lg text-gray-600">Welcome back!</p>
            <Button 
              variant="outline" 
              onClick={handleRefreshProfile}
              disabled={isRefreshingProfile}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshingProfile ? 'animate-spin' : ''}`} />
              {isRefreshingProfile ? 'Refreshing...' : 'Refresh Access'}
            </Button>
          </div>
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
              <CardTitle className="text-lg font-medium">Accessible Schools</CardTitle>
              <School className="h-5 w-5 text-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isStatsLoading ? '...' : (displayStats?.totalSchools || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Schools you have access to
              </p>
            </CardContent>
          </Card>
        </div>

        {/* School Statistics Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>School Submissions (Your Access)</CardTitle>
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : displayStats && displayStats.submissionsBySchool.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayStats.submissionsBySchool}>
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
                {accessibleSchools.length === 0 
                  ? "No schools assigned to you. Please contact your administrator."
                  : "No statistics available for your assigned schools"
                }
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
              <CardTitle>Your Schools Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isStatsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : displayStats && displayStats.schoolNames.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Total Submissions:</span>
                    <span className="font-bold">{displayStats.totalSubmissions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Average Submissions Per School:</span>
                    <span className="font-bold">{displayStats.averageSubmissionsPerSchool.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}</span>
                  </div>
                  <h3 className="font-medium text-lg pt-2">Your Assigned Schools</h3>
                  <ul className="divide-y">
                    {displayStats.schoolNames.map((school) => (
                      <li key={school} className="py-2">
                        {school}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {accessibleSchools.length === 0 
                    ? "No schools assigned to you."
                    : "No statistics available for your assigned schools."
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
