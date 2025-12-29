// frontend/src/components/posts/PostSearchBar.tsx
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface PostSearchBarProps {
  onSearch: (query: string) => void;
}

export function PostSearchBar({ onSearch }: PostSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search jobs by title, location..."
        className="pl-10"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
