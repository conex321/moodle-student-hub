
import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole, NewUser } from "@/types/user";

// Mock user data
const mockTeachers: User[] = [
  { id: 1, name: "John Smith", email: "john.smith@example.com", role: "teacher", status: "active" },
  { id: 2, name: "Maria Johnson", email: "maria.johnson@example.com", role: "teacher", status: "active" },
];

const mockStudents: User[] = [
  { id: 3, name: "Alex Brown", email: "alex.brown@example.com", role: "student", status: "active" },
  { id: 4, name: "Taylor Wilson", email: "taylor.wilson@example.com", role: "student", status: "active" },
  { id: 5, name: "Jamie Davis", email: "jamie.davis@example.com", role: "student", status: "inactive" },
];

const mockAdmins: User[] = [
  { id: 6, name: "Admin User", email: "admin@test.com", role: "admin", status: "active" },
];

interface UserDataContextType {
  teachers: User[];
  students: User[];
  admins: User[];
  newUser: NewUser;
  searchQuery: string;
  activeTab: string;
  setNewUser: React.Dispatch<React.SetStateAction<NewUser>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  handleAddUser: () => void;
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
  const [teachers, setTeachers] = useState(mockTeachers);
  const [students, setStudents] = useState(mockStudents);
  const [admins, setAdmins] = useState(mockAdmins);
  const [newUser, setNewUser] = useState<NewUser>({ name: "", email: "", password: "", role: "student" });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const getAllUsers = () => {
    return [...teachers, ...students, ...admins];
  };

  const handleAddUser = () => {
    // Create a new user ID (mock implementation)
    const newId = Math.floor(Math.random() * 1000) + 10;
    
    const userToAdd: User = {
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
    
    // Reset form
    setNewUser({ name: "", email: "", password: "", role: "student" });
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

  const value = {
    teachers,
    students,
    admins,
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
