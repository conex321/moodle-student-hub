
import { useState, useEffect } from "react";
import { User, NewUser } from "@/types/user";
import { useToast } from "@/components/ui/use-toast";
import { fetchUsersFromSupabase, createUserInSupabase, filterUsers } from "@/utils/userOperations";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState<NewUser>({ name: "", email: "", password: "", role: "student" });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await fetchUsersFromSupabase();
      setUsers(fetchedUsers);
      
      toast({
        title: "Users loaded successfully",
        description: `Found ${fetchedUsers.length} users`,
      });
    } catch (error: any) {
      console.error('=== FETCH USERS ERROR ===');
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      let errorMessage = "Failed to load users";
      if (error.message?.includes("JWT") || error.message?.includes("token")) {
        errorMessage = "Authentication error. Please refresh the page and try again.";
      } else if (error.message?.includes("permission")) {
        errorMessage = "You don't have permission to view users.";
      } else if (error.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error fetching users",
        description: errorMessage,
        variant: "destructive",
      });
      
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const newUserData = await createUserInSupabase(newUser);
      setUsers(prevUsers => [newUserData, ...prevUsers]);
      setNewUser({ name: "", email: "", password: "", role: "student" });

      toast({
        title: "User added successfully",
        description: `${newUser.name} has been added as a ${newUser.role}`,
      });
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Failed to add user",
        description: error.message || "An error occurred while adding the user",
        variant: "destructive",
      });
    }
  };

  const getFilteredUsers = () => {
    return filterUsers(users, searchQuery, activeTab);
  };

  useEffect(() => {
    console.log("UserDataContext mounted, calling fetchUsers...");
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    newUser,
    searchQuery,
    activeTab,
    setNewUser,
    setSearchQuery,
    setActiveTab,
    handleAddUser,
    getFilteredUsers,
    refetchUsers: fetchUsers,
  };
};
