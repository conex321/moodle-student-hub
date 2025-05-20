
import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus } from "lucide-react";

// Import the refactored components
import { UserForm } from "@/components/admin/users/UserForm";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserSearch } from "@/components/admin/users/UserSearch";

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
              <UserForm 
                newUser={newUser}
                setNewUser={setNewUser}
                handleAddUser={handleAddUser}
              />
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
              <UserSearch 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              
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
            <UserTable users={getFilteredUsers()} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
