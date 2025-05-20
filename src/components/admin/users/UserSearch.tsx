
import { Search } from "lucide-react";

interface UserSearchProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const UserSearch = ({ searchQuery, setSearchQuery }: UserSearchProps) => {
  return (
    <div className="relative w-64">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search users..."
        className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};
