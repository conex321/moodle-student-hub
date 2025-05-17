
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Settings, Users, BookOpen, Activity, School } from "lucide-react";
import { statisticsApi, SchoolStatistics } from "@/services/statisticsApi";

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<SchoolStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const stats = await statisticsApi.getSchoolStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // Mock data for dashboard, enhanced with real statistics when available
  const mockStats = [
    { 
      name: "Total Schools", 
      value: isLoading ? "..." : statistics?.totalSchools || 0, 
      icon: School, 
      color: "bg-blue-500" 
    },
    { 
      name: "Total Submissions", 
      value: isLoading ? "..." : statistics?.totalSubmissions.toLocaleString() || 0, 
      icon: BookOpen, 
      color: "bg-green-500" 
    },
    { 
      name: "System Uptime", 
      value: "99.8%", 
      icon: Activity, 
      color: "bg-purple-500" 
    },
    { 
      name: "Configurations", 
      value: 12, 
      icon: Settings, 
      color: "bg-orange-500" 
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={() => navigate('/admin/moodle-config')}>
            Manage Moodle Connection
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockStats.map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Submissions by School</CardTitle>
              <CardDescription>Distribution of assignments submitted per school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : statistics ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statistics.submissionsBySchool}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="schoolName" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="submissionCount" fill="#f7911d" name="Submissions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No statistics available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submissions Distribution</CardTitle>
              <CardDescription>Percentage of total submissions by school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : statistics && statistics.submissionsBySchool.some(school => school.submissionCount > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statistics.submissionsBySchool}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="submissionCount"
                        nameKey="schoolName"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statistics.submissionsBySchool.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No submission data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Schools Overview</CardTitle>
            <CardDescription>Information about all schools in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : statistics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">Total Schools:</span>
                      <span className="font-bold">{statistics.totalSchools}</span>
                    </div>
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
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">All Schools</h3>
                    <ul className="space-y-2">
                      {statistics.schoolNames.map((school) => (
                        <li key={school} className="p-2 bg-gray-50 rounded-lg">
                          {school}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Submissions by School</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">School Name</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Submission Count</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">% of Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {statistics.submissionsBySchool.map((school) => (
                          <tr key={school.schoolName}>
                            <td className="px-4 py-2 whitespace-nowrap">{school.schoolName}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{school.submissionCount.toLocaleString()}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {statistics.totalSubmissions > 0 
                                ? ((school.submissionCount / statistics.totalSubmissions) * 100).toFixed(2) 
                                : '0.00'}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No statistics available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
