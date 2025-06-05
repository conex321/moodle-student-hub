
import { supabase } from "@/integrations/supabase/client";
import { User, NewUser, UserRole } from "@/types/user";

export const isAdmin = (): boolean => {
  const adminUser = localStorage.getItem('moodle_hub_admin');
  return !!adminUser;
};

export const fetchUsersFromSupabase = async (): Promise<User[]> => {
  console.log("=== FETCH USERS DEBUG START ===");
  console.log("1. Starting fetchUsers function");
  console.log("2. Admin check:", isAdmin());
  
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
    throw error;
  }

  if (!data) {
    console.log("7. No data returned from query, returning empty array");
    return [];
  }

  console.log("8. Processing", data.length, "user records");

  const transformedUsers: User[] = data.map((profile, index) => {
    console.log(`9.${index + 1}. Processing profile:`, profile);
    return {
      id: profile.id,
      name: profile.full_name || 'Unknown',
      email: profile.email || 'No email',
      role: (profile.role as UserRole) || 'student',
      status: 'active' as const,
    };
  });

  console.log("10. Transformed users:", transformedUsers);
  console.log("=== FETCH USERS DEBUG END ===");
  
  return transformedUsers;
};

export const createUserInSupabase = async (newUser: NewUser): Promise<User> => {
  console.log("Starting user creation process...");
  
  // Validate input
  if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
    throw new Error("Please fill in all required fields");
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
    throw new Error(`User created but there was an issue with the profile setup: ${profileError.message}`);
  }

  return {
    id: authData.user.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    status: 'active',
  };
};

export const filterUsers = (users: User[], searchQuery: string, activeTab: string): User[] => {
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
