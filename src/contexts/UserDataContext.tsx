
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
  refetchUsers: () => Promise<void>;
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

  // Check if user is admin
  const isAdmin = () => {
    const adminUser = localStorage.getItem('moodle_hub_admin');
    return !!adminUser;
  };

  // Fetch users from Supabase profiles table
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      console.log("=== FETCH USERS DEBUG START ===");
      console.log("1. Starting fetchUsers function");
      console.log("2. Admin check:", isAdmin());
      
      // Make the actual Supabase request
      const queryStartTime = Date.now();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false });

      const queryEndTime = Date.now();
      console.log("3. Supabase query completed in", queryEndTime - queryStartTime, "ms");
      console.log("4. Query result - data:", data);
      console.log("5. Query result - error:", error);

      if (error) {
        console.error("6. Supabase query error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // More specific error handling
        let errorMessage = "Failed to load users";
        if (error.message?.includes("JWT") || error.message?.includes("token")) {
          errorMessage = "Authentication error. Please refresh the page and try again.";
        } else if (error.message?.includes("permission")) {
          errorMessage = "You don't have permission to view users.";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Error fetching users",
          description: errorMessage,
          variant: "destructive",
        });
        
        setUsers([]);
        return;
      }

      if (!data) {
        console.log("7. No data returned from query, setting empty array");
        setUsers([]);
        toast({
          title: "No users found",
          description: "No users were returned from the database",
        });
        return;
      }

      console.log("8. Processing", data.length, "user records");

      // Transform the Supabase data to match our User type
      const transformedUsers: User[] = data.map((profile, index) => {
        console.log(`9.${index + 1}. Processing profile:`, profile);
        return {
          id: profile.id,
          name: profile.full_name || 'Unknown',
          email: profile.email || 'No email',
          role: (profile.role as UserRole) || 'student',
          status: 'active', // Default to active since we don't have this in profiles table
        };
      });

      console.log("10. Transformed users:", transformedUsers);
      setUsers(transformedUsers);
      
      toast({
        title: "Users loaded successfully",
        description: `Found ${transformedUsers.length} users`,
      });

      console.log("=== FETCH USERS DEBUG END ===");
      
    } catch (error: any) {
      console.error('=== FETCH USERS ERROR ===');
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      
      // Provide more specific error messages
      let errorMessage = "Failed to load users";
      if (error.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error fetching users",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Set empty array on error to avoid undefined issues
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("UserDataContext mounted, calling fetchUsers...");
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      console.log("Starting user creation process...");
      
      // Validate input
      if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // First, sign up the user
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            full_name: newUser.name,
            role: newUser.role
          }
        }
      });

      if (signupError) {
        console.error("Signup error:", signupError);
        throw signupError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user - no user data returned");
      }

      console.log("User created successfully:", authData.user.id);

      // Insert user profile in the profiles table manually using upsert to handle duplicates
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't throw here as the user was created successfully
        toast({
          title: "User created with profile warning",
          description: `${newUser.name} was created but there was an issue with the profile setup`,
          variant: "destructive",
        });
      }

      // Add the new user to our state
      const newUserData: User = {
        id: authData.user.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'active',
      };

      setUsers(prevUsers => [newUserData, ...prevUsers]);
      
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
    refetchUsers: fetchUsers,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};
