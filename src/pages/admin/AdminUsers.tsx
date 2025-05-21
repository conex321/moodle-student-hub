
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, UserPlus } from "lucide-react";
import { UserDataProvider, useUserData } from "@/contexts/UserDataContext";
import { Skeleton } from "@/components/ui/skeleton";

// Import the refactored components
import { UserForm } from "@/components/admin/users/UserForm";
import { UserTable } from "@/components/admin/users/UserTable";
import { UserSearch } from "@/components/admin/users/UserSearch";

const UsersContent = () => {
  const { 
    newUser, 
    setNewUser, 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab, 
    handleAddUser, 
    getFilteredUsers,
    isLoading
  } = useUserData();
  const navigate = useNavigate();

  const handleManageTeacherAccess = () => {
    navigate("/admin/school-access");
  };

  return (
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
          <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
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
          
          {/* Add the Manage Teacher School Access button */}
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={handleManageTeacherAccess}
              className="flex items-center gap-2"
            >
              <UserCog className="h-4 w-4" />
              Manage Teacher School Access
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <UserTable users={getFilteredUsers()} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function AdminUsers() {
  return (
    <AdminLayout>
      <UserDataProvider>
        <UsersContent />
      </UserDataProvider>
    </AdminLayout>
  );
}
