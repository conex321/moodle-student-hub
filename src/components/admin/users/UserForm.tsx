
import { useState } from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputWithLabel } from "@/components/ui/input-with-label";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UserFormProps {
  newUser: {
    name: string;
    email: string;
    password: string;
    role: string;
  };
  setNewUser: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    password: string;
    role: string;
  }>>;
  handleAddUser: () => void;
}

export const UserForm = ({ newUser, setNewUser, handleAddUser }: UserFormProps) => {
  return (
    <>
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
    </>
  );
};
