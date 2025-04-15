
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings, Users, BookOpen, Activity } from "lucide-react";

// Mock data for dashboard
const mockStats = [
  { name: "Total Users", value: 156, icon: Users, color: "bg-blue-500" },
  { name: "Active Courses", value: 24, icon: BookOpen, color: "bg-green-500" },
  { name: "System Uptime", value: "99.8%", icon: Activity, color: "bg-purple-500" },
  { name: "Configurations", value: 12, icon: Settings, color: "bg-orange-500" },
];

const mockActivityData = [
  { name: 'Mon', users: 20, courses: 15 },
  { name: 'Tue', users: 30, courses: 20 },
  { name: 'Wed', users: 25, courses: 18 },
  { name: 'Thu', users: 40, courses: 22 },
  { name: 'Fri', users: 35, courses: 20 },
  { name: 'Sat', users: 15, courses: 10 },
  { name: 'Sun', users: 10, courses: 8 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  
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
        
        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Weekly user and course activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8884d8" name="Active Users" />
                  <Bar dataKey="courses" fill="#82ca9d" name="Course Interactions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Moodle Connection Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Current status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="font-medium">Connected</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/moodle-config')}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="text-sm">
                  <span className="text-gray-500">2 hours ago</span>
                  <p>Moodle configuration updated by Admin</p>
                </li>
                <li className="text-sm">
                  <span className="text-gray-500">5 hours ago</span>
                  <p>New user registered: John Doe</p>
                </li>
                <li className="text-sm">
                  <span className="text-gray-500">Yesterday</span>
                  <p>System maintenance completed</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
