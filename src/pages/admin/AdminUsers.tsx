
import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, UserPlus, Check, X, MoreHorizontal, UserCog } from "lucide-react";

// Mock user data
const mockTeachers = [
  { id: 1, name: "John Smith", email: "john.smith@example.com", role: "teacher", status: "active" },
  { id: 2, name: "Maria Johnson", email: "maria.johnson@example.com", role: "teacher", status: "active" },
];

const mockStudents = [
  { id: 3, name: "Alex Brown", email: "alex.brown@example.com", role: "student", status: "active" },
  { id: 4, name: "Taylor Wilson", email: "taylor.wilson@example.com", role: "student", status: "active" },
  { id: 5, name: "Jamie Davis", email: "jamie.davis@example.com", role: "student", status: "inactive" },
];

const mockAdmins = [
  { id: 6, name: "Admin User", email: "admin@test.com", role: "admin", status: "active" },
];

export default function AdminUsers() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState(mockTeachers);
  const [students, setStudents] = useState(mockStudents);
  const [admins, setAdmins] = useState(mockAdmins);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "student" });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const handleAddUser = () => {
    // Validation
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required",
      });
      return;
    }
    
    // Mock adding a new user
    const newId = Math.floor(Math.random() * 1000) + 10;
    const userToAdd = {
      id: newId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "active",
    };
    
    if (newUser.role === "teacher") {
      setTeachers([...teachers, userToAdd]);
    } else if (newUser.role === "student") {
      setStudents([...students, userToAdd]);
    } else if (newUser.role === "admin") {
      setAdmins([...admins, userToAdd]);
    }
    
    toast({
      title: "User added",
      description: `${newUser.name} has been added as a ${newUser.role}`,
    });
    
    // Reset form
    setNewUser({ name: "", email: "", password: "", role: "student" });
  };
  
  const getAllUsers = () => {
    return [...teachers, ...students, ...admins];
  };
  
  const getFilteredUsers = () => {
    const query = searchQuery.toLowerCase();
    let usersToFilter;
    
    switch (activeTab) {
      case "teachers":
        usersToFilter = teachers;
        break;
      case "students":
        usersToFilter = students;
        break;
      case "admins":
        usersToFilter = admins;
        break;
      default:
        usersToFilter = getAllUsers();
    }
    
    if (!query) return usersToFilter;
    
    return usersToFilter.filter(
      user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
    );
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account for the Moodle Hub
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <InputWithLabel
                  label="Full Name"
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="e.g., John Smith"
                  required
                />
                
                <InputWithLabel
                  label="Email Address"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="email@example.com"
                  required
                />
                
                <InputWithLabel
                  label="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Create a secure password"
                  required
                />
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">User Role</label>
                  <div className="flex space-x-4 mt-2">
                    {["student", "teacher", "admin"].map((role) => (
                      <label key={role} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={newUser.role === role}
                          onChange={() => setNewUser({...newUser, role})}
                          className="rounded text-primary"
                        />
                        <span className="capitalize">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleAddUser}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>
              View and manage all users in the system
            </CardDescription>
            <div className="mt-4 flex justify-between items-center">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="teachers">Teachers</TabsTrigger>
                  <TabsTrigger value="admins">Admins</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredUsers().map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        } capitalize`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          <UserCog className="h-4 w-4" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-900">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
