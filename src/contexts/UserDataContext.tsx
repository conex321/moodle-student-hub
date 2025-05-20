
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, UserRole, NewUser } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UserDataContextType {
  users: User[];
  isLoading: boolean;
  newUser: NewUser;
  searchQuery: string;
  activeTab: string;
  setNewUser: React.Dispatch<React.SetStateAction<NewUser>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  handleAddUser: () => Promise<void>;
  getFilteredUsers: () => User[];
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState<NewUser>({ name: "", email: "", password: "", role: "student" });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Fetch users from Supabase
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        
        console.log("Fetching users from profiles table...");
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, created_at');

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Profiles data received:", data);

        // Transform the Supabase data to match our User type
        const transformedUsers: User[] = data ? data.map(profile => ({
          id: profile.id,
          name: profile.full_name || 'Unknown',
          email: profile.email || 'No email',
          role: (profile.role as UserRole) || 'student',
          status: 'active', // Default to active since we don't have this in profiles table
        })) : [];

        console.log("Transformed users:", transformedUsers);
        setUsers(transformedUsers);
      } catch (error: any) {
        console.error('Error fetching users:', error.message);
        toast({
          title: "Error fetching users",
          description: error.message || "Failed to load users",
          variant: "destructive",
        });
        
        // Set empty array on error to avoid undefined issues
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [toast]);

  const handleAddUser = async () => {
    try {
      // Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: newUser.name,
          role: newUser.role
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authUser.user) {
        throw new Error("Failed to create user");
      }

      // Insert user profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.user.id,
          full_name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        throw profileError;
      }

      // Add the new user to our state
      const newUserData: User = {
        id: authUser.user.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'active',
      };

      setUsers([newUserData, ...users]);
      
      // Reset form
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
    const query = searchQuery.toLowerCase();
    let usersToFilter = users;
    
    // Filter by role based on active tab
    if (activeTab !== "all") {
      usersToFilter = users.filter(user => 
        user.role.toLowerCase() === activeTab.slice(0, -1).toLowerCase()
      );
    }
    
    // Then filter by search query if one exists
    if (query) {
      return usersToFilter.filter(
        user => 
          user.name.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
      );
    }
    
    return usersToFilter;
  };

  const value = {
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
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};
