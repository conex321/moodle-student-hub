
import { User, NewUser } from "@/types/user";

export interface UserDataContextType {
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
