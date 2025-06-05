
import { createContext, useContext, ReactNode } from "react";
import { UserDataContextType } from "@/types/userContext";
import { useUserManagement } from "@/hooks/useUserManagement";

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const userManagement = useUserManagement();

  return (
    <UserDataContext.Provider value={userManagement}>
      {children}
    </UserDataContext.Provider>
  );
};
