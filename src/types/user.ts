
export interface User {
  id: string; // Changed from number to string to match Supabase UUID format
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  status: "active" | "inactive";
}

export type UserRole = "admin" | "teacher" | "student";

export interface NewUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
